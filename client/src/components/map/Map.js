import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEqual, difference } from 'lodash';

// JS files
import L from 'leaflet';
import leafletPip from '@mapbox/leaflet-pip/leaflet-pip';
import 'leaflet.heat/dist/leaflet-heat';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.zoominfo/dist/L.Control.Zoominfo';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.min';
import 'leaflet.gridlayer.googlemutant/Leaflet.GoogleMutant';
import 'leaflet.locatecontrol/src/L.Control.Locate';

// CSS files
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.zoominfo/dist/L.Control.Zoominfo.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

// Images
import icon from 'leaflet/dist/images/marker-icon.png';
import 'leaflet-fullscreen/dist/fullscreen.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { history } from '../../routers/AppRouter';

// Others
import {
  CircularProgress,
  Dialog, DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  DialogActions
} from '@material-ui/core';
import intl from 'react-intl-universal';
import { setCoordinates, setMunicipality } from '../../actions/findNotification';
import { fetchMapData, startMapSpinner } from '../../actions/map';
import { MapMode, FhaMapLayers, Colors, RouterPaths } from '../../utils/enum/enums';
import { getIdfromUri } from '../../utils/functions/functions';
import { enqueueSnackbar } from '../../actions/notifier';

/**
 * Parameters
 * showCurrentLocation: If true, user's current location is shown on the map
 * markerData: Marker points which will be shown on the map
 * setViewForMarkerData: If true, it sets view for a range of coordinates
 * location: The location where map component adds a marker
 * zoomLevel: Defines the default zoom level of the map
 * layers: Default active layers to show on the map
 * checkPointInPolygons: Show notification that user is at ancient monument area
 * legalityResultHandler: Function which is used to send legality result to parent component
 * id: Defines the id of map element. Used in case of viewing multiple maps on the same page
 * showingMyFinds: if true, define custom settings for showing own finds
 */
class Map extends Component {
  state = {
    hasCurrentLocation: false,
    currentLocation: null,
    activeOverLays: [],
    isDialogOpen: false,
    prevZoomLevel: null
  }

  componentDidMount() {
    this.renderMap();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.markerData !== this.props.markerData || this.props.mode) {
      this.clusterMap && this.clusterMap.clearLayers();
      this.heatMap && this.heatMap.setLatLngs([]);
      this.showMarkersOnMap(this.props.markerData);
    }

    // Checks if the wmts data is updated
    // If it is updated load the layers again with the updated data.
    if (!isEqual(prevProps.wmtsData, this.props.wmtsData)) {
      this.loadFetchedLayers();
    }
  }

  componentWillUnmount() {
    if (this.locateControl) {
      this.locateControl.stop();
    }
    navigator.geolocation.clearWatch(this.geoLocationId);
  }

  render() {
    return (
      this.props.showCurrentLocation ||
        this.props.markerData ||
        this.props.location ? (
          <div id={this.props.id || 'map'} className="map-container">
            {
              this.props.isFetchInProgress &&
              <CircularProgress className="map__data-loader-spiner" size="5rem" />
            }
            <Dialog
              open={this.state.isDialogOpen}
              onClose={this.onDialogClosedPressed}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {intl.get('nearByPage.map.alert.zoomAlertTitle')}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {intl.get('nearByPage.map.alert.zoomAlertContent')}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.onDialogClosedPressed} color="primary" autoFocus>
                  {intl.get('nearByPage.map.alert.zoomAlertConfirmation')}
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        ) : (
          <CircularProgress className="answer-options__progress" size="5rem" />
        )
    );
  }

  loadFetchedLayers = () => {
    if (this.props.wmtsData) {
      for (let l of this.props.wmtsData) {
        const mapLayer = this.overlayLayers[intl.get(`nearByPage.map.overLays.${[l.layer]}`)];
        // Clear current layers
        mapLayer.clearLayers();
        // Load the fetched data
        const geoJSONLayer = L.geoJSON(l.data, {
          pointToLayer: (feature, latlng) => {
            return this.createPointToLayer(latlng, this.getOverlayColor(l.layer));
          },
          style: {
            cursor: 'pointer',
            color: this.getOverlayColor(l.layer),
            dashArray: '3, 5'
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(this.generateFeaturePopup(feature.properties));
          }
        });
        geoJSONLayer.addTo(mapLayer).addTo(this.map);
        this.pointInPolygonChecker(geoJSONLayer);
      }
    }
  }

  /**
   * Change status of the map layer dialog
   */
  onDialogClosedPressed = () => {
    this.setState((prevState) => ({ isDialogOpen: !prevState.isDialogOpen }));
  }

  /**
   * Initialise map and its settings
   */
  renderMap = () => {
    if (!this.map) {
      this.initialiseIcon();
      this.initialiseMap();
      this.initialiseMarkers();
      this.initialiseLayers();
    }
  }

  /**
   * Initialise icon settings for leaflet
  */
  initialiseIcon = () => {
    let DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconAnchor: [12, 36]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }

  /**
   * Initialise map settings for leaflet
   */
  initialiseMap = () => {
    // Map Layers
    const nationalSurveyOfFinland = L.tileLayer('/api/v1/nlsof?z={z}&x={x}&y={y}&type=taustakartta', {
      maxZoom: 18,
    });

    const nationalSurveyOfFinlandTopographical = L.tileLayer('/api/v1/nlsof?z={z}&x={x}&y={y}&type=maastokartta', {
      maxZoom: 18,
    });

    const googleMaps = L.gridLayer.googleMutant({
      type: this.props.useSatellite ? 'satellite' : 'roadmap'
    });

    // Create a layergroup for adding markers
    this.findsLayer = L.layerGroup([], { id: FhaMapLayers.ARCHEOLOGICAL_FINDS });
    const archaeologicalPlacesAreaLayer = L.layerGroup([], { id: FhaMapLayers.ARCHEOLOGICAL_PLACES_AREAS });
    const archaeologicalPlacesPointLayer = L.layerGroup([], { id: FhaMapLayers.ARCHEOLOGICAL_PLACES_POINT });
    const worldHeritageSiteAreaLayer = L.layerGroup([], { id: FhaMapLayers.WORLD_HERITAGE_SITE_AREAS });
    const worldHeritageSitePointLayer = L.layerGroup([], { id: FhaMapLayers.WORLD_HERITAGE_SITE_POINT });
    const archaeologicalHeritageAreaLayer = L.layerGroup([], { id: FhaMapLayers.ARCHITECTURAL_HERITAGE_AREAS });
    const archaeologicalHeritagePointLayer = L.layerGroup([], { id: FhaMapLayers.ARCHITECTURAL_HERITAGE_POINT });
    const archaeologicalSublacesPointLayer = L.layerGroup([], { id: FhaMapLayers.ARCHEOLOGICAL_SUBPLACES_POINT });
    const rkyAreaLayer = L.layerGroup([], { id: FhaMapLayers.RKY_AREAS });
    const rkyPointLayer = L.layerGroup([], { id: FhaMapLayers.RKY_POINTS });
    const rkyLineLayer = L.layerGroup([], { id: FhaMapLayers.RKY_LINES });

    // Base maps 
    const baseMaps = {
      [intl.get('nearByPage.map.mapLayers.backGroundMap')]: nationalSurveyOfFinland,
      [intl.get('nearByPage.map.mapLayers.topographicalMap')]: nationalSurveyOfFinlandTopographical,
      [intl.get('nearByPage.map.mapLayers.googleMaps')]: googleMaps
    };

    // Overlay Maps
    this.overlayLayers = {
      [intl.get('nearByPage.map.overLays.arkeologiset_loydot')]: this.findsLayer,
      [intl.get('nearByPage.map.overLays.arkeologiset_kohteet_alue')]: archaeologicalPlacesAreaLayer,
      [intl.get('nearByPage.map.overLays.arkeologiset_kohteet_piste')]: archaeologicalPlacesPointLayer,
      [intl.get('nearByPage.map.overLays.maailmanperinto_alue')]: worldHeritageSiteAreaLayer,
      [intl.get('nearByPage.map.overLays.maailmanperinto_piste')]: worldHeritageSitePointLayer,
      [intl.get('nearByPage.map.overLays.rakennusperinto_alue')]: archaeologicalHeritageAreaLayer,
      [intl.get('nearByPage.map.overLays.rakennusperinto_piste')]: archaeologicalHeritagePointLayer,
      [intl.get('nearByPage.map.overLays.arkeologisten_kohteiden_alakohteet_piste')]: archaeologicalSublacesPointLayer,
      [intl.get('nearByPage.map.overLays.rky_alue')]: rkyAreaLayer,
      [intl.get('nearByPage.map.overLays.rky_piste')]: rkyPointLayer,
      [intl.get('nearByPage.map.overLays.rky_viiva')]: rkyLineLayer,
    };

    this.map = L.map(this.props.id || 'map', {
      center: [64.9, 26.0],
      zoom: this.props.zoomLevel || DEFAULT_ZOOM_LEVEL,
      zoomControl: false,
      zoominfoControl: true,
      fullscreenControl: true,
      layers: this.props.showCurrentLocation ? [googleMaps] : [nationalSurveyOfFinland],
      attributionControl: false
    });
    // Add overlay layers to map
    L.control.layers(baseMaps, this.overlayLayers).addTo(this.map);

    // Add control scale
    L.control.scale().addTo(this.map);
    // Add locate scate
    const locateOptions = {
      enableHighAccuracy: true,
      position: 'topright',
      cacheLocation: false,
      icon: 'material-icons location-icon',
      iconLoading: 'material-icons w3-spin w3-jumbo loading-icon',
      flyTo: this.props.legalityChecker ? false : true  // Animation is disabled for legalitycheckerpage
    };
    this.locateControl = L.control.locate(locateOptions).addTo(this.map);

    if (this.props.showCurrentLocation) {
      this.locateControl.start();
      // Add a click listener which is setted only if user's current location is viewed
      this.map.addEventListener('click', this.onMapTapped);
    }

    // Active overlay layer
    this.findsLayer.addTo(this.map);

    // Listen for changes
    this.initialiseMapListeners(this.overlayLayers);
  }

  createPointToLayer = (latlng, color) => {
    const geojsonMarkerOptions = {
      radius: 8,
      fillColor: color,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };

    return L.circleMarker(latlng, geojsonMarkerOptions);
  }

  initialiseMarkers = () => {
    // If markerData is provided show them
    if (this.props.markerData && this.props.markerData.length > 0) {
      this.showMarkersOnMap(this.props.markerData);
    }
    // If current location is provided show it
    /*
    if (position) {
      this.setLocation(position.coords.latitude, position.coords.longitude, true);
    }*/
    // If a location is given
    if (this.props.location) {
      this.setLocation(this.props.location.lat, this.props.location.lng);
    }
  }

  /**
   * Initialise Default Active Layers on the map if any of them provided
   */
  initialiseLayers = () => {
    // If layers property is provided then show it on the map
    if (this.props.layers) {
      this.props.layers.forEach(e => {
        this.map.addLayer(this.overlayLayers[intl.get(`nearByPage.map.overLays.${[e]}`)]);
      });
    }
  }

  /**
   * Checks that user is not on a ancient monument.
   */
  pointInPolygonChecker = (geoJSONLayer) => {
    if (this.state.hasCurrentLocation && this.state.currentLocation &&
      this.props.layers && this.props.checkPointInPolygons) {
      const result = leafletPip.pointInLayer(
        L.latLng(this.state.currentLocation.latlng.lat,
          this.state.currentLocation.latlng.lng),
        geoJSONLayer,
        true);
      // L.latLng(60.183232,24.818036) for forbidden test purposes
      if (result.length > 0) {
        this.props.legalityResultHandler({
          header: intl.get('legalityCheckerPage.alert.forbidden.header'),
          description: intl.get('legalityCheckerPage.alert.forbidden.description'),
          className: 'forbidden'
        });
      } else {
        this.props.legalityResultHandler({
          header: intl.get('legalityCheckerPage.alert.allowed.header'),
          description: intl.get('legalityCheckerPage.alert.allowed.description'),
          className: 'allowed'
        });
      }
    }
  }

  /**
   * Gets users current location and renders the map
   */
  /*
  getGeoLocation = () => {
    // GeoLocation Options
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };
    // Start getting geolocation
    this.geoLocationId = navigator.geolocation.watchPosition((position) => {
      this.setState({ hasCurrentLocation: true });
      this.setState({ currentLocation: position });
      //this.renderMap(position);
      // On fail
    }, (err) => {
      const message = `Error(${err.code}) ${intl.get('nearByPage.map.alert.gettingLocationFailed')}`;
      this.props.enqueueSnackbar({
        message,
        options: {
          variant: 'error',
        },
      });
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }, options);
  }*/

  /**
   * Clears current markers on the map and sets users current location
   */
  onMapTapped = (e) => {
    this.clearAllMarkers();
    this.setLocation(e.latlng.lat, e.latlng.lng, true, true);
  }

  /**
   * Sets a location on the map
   */
  setLocation = (latitude, longitude, updateState = false, isMapTapped = false) => {
    // Limit number of decimals in the coordinates
    const lat = parseFloat(parseFloat(latitude).toFixed(6));
    const lng = parseFloat(parseFloat(longitude).toFixed(6));

    L.marker(new L.LatLng(lat, lng)).addTo(this.findsLayer);
    // Set the view on the map
    if (isMapTapped) {
      this.map.setView(L.latLng(lat, lng), this.map.getZoom());
    } else {
      this.map.setView(L.latLng(lat, lng), this.props.zoomLevel || DEFAULT_ZOOM_LEVEL);
    }
    // Set coords and municapility in redux
    if (updateState) {
      this.props.setCoordinates({ lat, lng }, this.props.currentFindIndex);
      this.props.setMunicipality({ lat, lng });
    }
  }

  /**
   * Clears all markers on the map
   */
  clearAllMarkers = () => {
    this.findsLayer.clearLayers();
  }

  /**
   * Shows the markers on the map
   */
  showMarkersOnMap = (markerData) => {
    // Cluster Mode
    this.clusterMap = L.markerClusterGroup();
    const latLngs = [];

    for (let marker of markerData) {
      if (marker.lat && marker.long && !isNaN(marker.lat) && !isNaN(marker.long)) {
        const popupText = marker.id ? this.generateMarkerPopup(marker) : '';
        const popupOptions = marker.reportId ? { reportId: getIdfromUri('report', marker.reportId), findId: getIdfromUri('find', marker.id) } : {};
        const location = new L.LatLng(marker.lat, marker.long);
        const markerToMap = popupText ? new L.marker(location).bindPopup(popupText, popupOptions) : new L.marker(location);
        latLngs.push(location);
        this.clusterMap.addLayer(markerToMap);
      }
    }

    // Set view for a range of coordinates
    if (this.props.setViewForMarkerData) {
      if (markerData.length === 1) {
        this.map.setView(latLngs[0], this.props.zoomLevel || DEFAULT_ZOOM_LEVEL);
      } else {
        var mapBounds = new L.LatLngBounds(latLngs);
        this.map.fitBounds(mapBounds);
      }
    }

    // HeatMap Mode
    this.heatMap = this.initialiseHeatMap(latLngs);

    // Show the layer of the active mode (heat or normal map)
    if (this.props.mode && this.props.mode === MapMode.HEATMAP) {
      this.map.addLayer(this.heatMap);
    } else {
      this.findsLayer.addLayer(this.clusterMap);
    }
  }

  initialiseHeatMap = (latLngs) => {
    const heatLayer = L.heatLayer(latLngs, {
      radius: 15,
      minOpacity: 1.0,
      blur: 25,
      maxZoom: 13,
      // Google maps gradient settings is used as default
      gradient: {
        0: '#66ff00',
        0.1: '#66ff00',
        0.2: '#93ff00',
        0.3: '#c1ff00',
        0.4: '#eeff00',
        0.5: '#f4e300',
        0.6: '#f9c600',
        0.7: '#ffaa00',
        0.8: '#ff7100',
        0.9: '#ff3900',
        1: '#ff0000'
      }
    });

    return heatLayer;
  }

  /**
   *  Sets listeners for loading data of overlay layers
   */
  initialiseMapListeners = () => {
    // The data layhers below can be fetched without zoom level restrictions
    const smallDataLayers = [
      FhaMapLayers.RKY_LINES,
      FhaMapLayers.RKY_POINTS,
      FhaMapLayers.ARCHITECTURAL_HERITAGE_AREAS,
      FhaMapLayers.WORLD_HERITAGE_SITE_AREAS,
      FhaMapLayers.WORLD_HERITAGE_SITE_POINT
    ];

    // Fired when an overlay is selected through the layer control
    this.map.on('overlayadd', (eo) => {
      const layerName = eo.layer.options['id'];
      if (layerName !== FhaMapLayers.ARCHEOLOGICAL_FINDS) {
        this.state.activeOverLays.push(layerName);
        if (this.map.getZoom() < MIN_ZOOM_LEVEL && !smallDataLayers.includes(layerName)
          && (!this.props.checkPointInPolygons)) {
          this.setState({ isDialogOpen: true });
        } else {
          this.props.startMapSpinner();
          this.props.fetchMapData(this.state.activeOverLays, this.map.getBounds());
        }
      }
    });

    //Fired when an overlay is deselected through the layer control
    this.map.on('overlayremove', (eo) => {
      const layerName = eo.layer.options['id'];
      if (layerName !== FhaMapLayers.ARCHEOLOGICAL_FINDS) {
        const activeOverLays = this.state.activeOverLays.filter((name) => name !== layerName);
        this.setState({ activeOverLays });
      }
    });

    //Fired when the zooming starts.
    this.map.on('zoomstart', () => {
      this.setState({ prevZoomLevel: this.map.getZoom() });
    });

    //Fired when the zooming ends.
    this.map.on('zoomend', () => {
      if ((this.map.getZoom() === MIN_ZOOM_LEVEL
        || (this.map.getZoom() >= MIN_ZOOM_LEVEL && this.state.prevZoomLevel > this.map.getZoom()))
        && difference(this.state.activeOverLays, smallDataLayers).length > 0) {
        this.props.startMapSpinner();
        this.props.fetchMapData(this.state.activeOverLays, this.map.getBounds());
      }
    });

    //Fired when the drag ends.
    this.map.on('dragend', () => {
      if (this.map.getZoom() >= MIN_ZOOM_LEVEL
        && difference(this.state.activeOverLays, smallDataLayers).length > 0) {
        this.props.startMapSpinner();
        this.props.fetchMapData(this.state.activeOverLays, this.map.getBounds());
      }
    });

    // Fired when marker popup more button is clicked
    this.map.on('popupopen', (event) => {
      document.getElementById('leaflet-popup-content__more-button').addEventListener('click', () => this.popupMorePressListener(event.popup.options));
    });

    this.map.on('locationfound', (pos) => {
      const { lat, lng } = pos.latlng;
      this.setState({ hasCurrentLocation: true });
      this.setState({ currentLocation: pos });
      this.props.setCoordinates({ lat, lng }, this.props.currentFindIndex);
      this.props.setMunicipality({ lat, lng });
      if (this.props.legalityChecker && this.state.hasCurrentLocation &&
        this.state.currentLocation && this.props.layers && this.props.checkPointInPolygons) {
        this.loadFetchedLayers();
      }
    });

    this.map.on('locationerror', (err) => {
      const message = `Error(${err.code}) ${intl.get('nearByPage.map.alert.gettingLocationFailed')}`;
      this.locateControl.stop();
      this.props.enqueueSnackbar({
        message,
        options: {
          variant: 'error',
        },
      });
    });
  }

  /**
   * Listener for navigating popup more link presses
   */
  popupMorePressListener = (options) => {
    if (this.props.showingMyFinds) {
      history.push(`${RouterPaths.MY_FINDS_REPORT_OVERVIEW_PAGE}?r=${options.reportId}&f=${options.findId}`);
    } else {
      const id = document.getElementById('leaflet-popup-content__id').textContent;
      history.push(`${RouterPaths.FIND_PAGE}?id=${id}`, { id });
    }
  };

  /**
   * Returs default color of the selected overlay
   */
  getOverlayColor = (overlay) => {
    switch (overlay) {
      case FhaMapLayers.ARCHEOLOGICAL_PLACES_AREAS:
        return Colors.PINK;
      case FhaMapLayers.ARCHEOLOGICAL_PLACES_POINT:
        return Colors.LIME;
      case FhaMapLayers.WORLD_HERITAGE_SITE_AREAS:
        return Colors.DEEP_PURPLE;
      case FhaMapLayers.WORLD_HERITAGE_SITE_POINT:
        return Colors.BLUE;
      case FhaMapLayers.ARCHITECTURAL_HERITAGE_AREAS:
        return Colors.CYAN;
      case FhaMapLayers.ARCHITECTURAL_HERITAGE_POINT:
        return Colors.TEAL;
      case FhaMapLayers.ARCHEOLOGICAL_SUBPLACES_POINT:
        return Colors.GREEN;
      case FhaMapLayers.RKY_AREAS:
        return Colors.BROWN;
      case FhaMapLayers.RKY_POINTS:
        return Colors.YELLOW;
      case FhaMapLayers.RKY_LINES:
        return Colors.ORANGE;
    }
  }

  /**
   * Generates marker popup
   */
  generateFeaturePopup = (feature) => {
    let popupText = '';
    const typeName = feature.laji ? `<p class="leaflet-popup-content__header">${feature.laji}</p>` : '';
    const placeName = feature.kohdenimi ?
      `<p class="leaflet-popup-content__text-container__info"><b>${intl.get('nearByPage.map.mapContent.name')}</b> : ${feature.kohdenimi}</p>` : '';
    const townName = feature.kunta ?
      `<p class="leaflet-popup-content__text-container__info"><b>${intl.get('nearByPage.map.mapContent.town')}</b> : ${feature.kunta}</p>` : '';
    const link = feature.mjtunnus ?
      `<p class="leaflet-popup-content__text-container__info"><b>${intl.get('nearByPage.map.mapContent.link')}</b> : 
      <a href="https://www.kyppi.fi/to.aspx?id=112.${feature.mjtunnus}" target="_blank">${intl.get('nearByPage.map.mapContent.more')}</a></p>` : '';

    popupText += `
                  <div>
                    ${typeName}
                  </div>
                  <div class="leaflet-popup-content__place-text-container">
                    ${placeName}
                    ${townName}
                    ${link}
                  </div>
                  `;

    return popupText;
  }

  /**
   * Generates marker popupText
   */
  generateMarkerPopup = (marker) => {
    let popupText = '';
    const idPrefix = marker.id.includes('sualt-fha-finds/') ? 'sualt-fha-finds/' : '';
    const id = idPrefix ? marker.id.split(idPrefix)[1] : '';
    const image = getImageForPopup(marker.image_url);
    const title = marker.title ? `<h2 class="leaflet-popup-content__text-container__title">${marker.title}</h2>` : '';
    const description = marker.description ? `<p class="leaflet-popup-content__text-container__description">${marker.description}</p>` : '';

    popupText += `${image}
                  <span id="leaflet-popup-content__id" class="leaflet-popup-content__id">${id}</span>
                  <div class="leaflet-popup-content__text-container">
                  ${title} 
                  ${description}
                  <p id="leaflet-popup-content__more-button" class="leaflet-popup-content__more-button">More</p>
                  </div>
                  `;

    return popupText;
  }
}

/**
 * Check if there are more than one image and then return the first image
 *
 * @param {*} imageData 
 */
const getImageForPopup = (imageData) => {
  if (imageData) {
    const image = imageData.split(';')[0];
    return `<img class="leaflet-popup-content__image" src="${image}"/>`;
  } else {
    return '';
  }
};

const MIN_ZOOM_LEVEL = 13;
const DEFAULT_ZOOM_LEVEL = 5;

const mapStateToProps = (state) => ({
  wmtsData: state.map.fetchResults,
  isFetchInProgress: state.map.fetchInProgress,
  currentFindIndex: state.findNotification.currentFindIndex
});

const mapDispatchToProps = (dispatch) => ({
  setCoordinates: (coords, index) => dispatch(setCoordinates(coords, index)),
  setMunicipality: (coords) => dispatch(setMunicipality(coords)),
  fetchMapData: (layer, bounds) => dispatch(fetchMapData(layer, bounds)),
  startMapSpinner: () => dispatch(startMapSpinner()),
  enqueueSnackbar: (notification) => dispatch(enqueueSnackbar(notification)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Map);
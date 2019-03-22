import {
  FIND_NOTIFICATION_SET_DATE,
  FIND_NOTIFICATION_SET_COORDS,
  FIND_NOTIFICATION_SET_FIND_PHOTOS,
  FIND_NOTIFICATION_SET_FIND_SITE_PHOTOS,
  FIND_NOTIFICATION_SET_ADDITIONAL_MATERIALS
} from '../constants/actionTypes';

export const setDate = (date) => ({
  type: FIND_NOTIFICATION_SET_DATE,
  date
});

export const setCoordinates = (coords) => ({
  type: FIND_NOTIFICATION_SET_COORDS,
  coords
});

export const setFindPhotos = (photos, index) => ({
  type: FIND_NOTIFICATION_SET_FIND_PHOTOS,
  index,
  [index]: {
    photos
  }
});

export const test = (nimi, index) => ({
  type: FIND_NOTIFICATION_SET_FIND_PHOTOS,
  index,
  [index]: {
    nimi
  }
});

export const setFindSitePhotos = (photos) => ({
  type: FIND_NOTIFICATION_SET_FIND_SITE_PHOTOS,
  photos
});

export const setAdditionalMaterial = (text) => ({
  type: FIND_NOTIFICATION_SET_ADDITIONAL_MATERIALS,
  text
});
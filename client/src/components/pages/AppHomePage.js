import React, { Component } from 'react';
import intl from 'react-intl-universal';
import ContentContainer from '../ContentContainer';
import Slider from '../reporting/Slider';
import { isDesktopScreen } from '../../utils/functions/functions';

class AppHomePage extends Component {
  render() {
    const fontSize = isDesktopScreen(window) ? '3rem' : '2.5rem';
    const letterSpacing = isDesktopScreen(window) ? '1rem' : '0.5rem';
    return (
      <div style={{ display: 'flex', flex: '1', flexDirection: 'column' }}>
        <ContentContainer
          stylingClass="content-container--justified"
          header={intl.get('appHomePage.contentContainer.name')}
          headerClass="content-container__header--animated"
          headerStyle={{ color: '#eeeeee', margin: '0', textTransform: 'uppercase', fontSize, letterSpacing }}
          description={intl.get('appHomePage.contentContainer.headerTitle')}
          descriptionClass="content-container__description--animated"
          descriptionStyle={{ color: '#fff', fontStyle: 'italic', fontVariant: 'small-caps', background: '#0009', opacity: 0.8, padding: '3px' }}
          bgImage='./images/others/home_bg.jpg'
        />

        <ContentContainer
          header={intl.get('appHomePage.contentContainer.recentFinds')}
          headerStyle={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#007A93', marginTop: '2rem', fontSize: '1.2rem', marginBottom: '0' }}
          bgColor='#f7f7f7'
          component={() => <Slider slideItems={sliderData} infiniteLoop />}
        />

        <ContentContainer
          header={intl.get('appHomePage.contentContainer.guides')}
          headerStyle={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#007A93', marginTop: '2rem', fontSize: '1.2rem' }}
          cardData={data}
          bgColor='#fff'
        />

        <ContentContainer
          header={intl.get('appHomePage.contentContainer.applicationTagline')}
          headerStyle={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#007A93', margin: '2rem 0' }}
          bgColor='#f7f7f7'
        />
      </div>
    );
  }
}

// TODO : Replace with real ones
const sliderData = [
  {
    des: 'Neulahakaisia, Imatra',
    imgSrc: 'http://luettelointi.nba.fi/assets/uploads/find_images/40039-131.JPG'
  },
  {
    des: 'Kehäsolki, Imatea',
    imgSrc: 'http://luettelointi.nba.fi/assets/uploads/find_images/40039-118.JPG'
  },
  {
    des: 'Miekanpansi, Asikkala',
    imgSrc: 'http://luettelointi.nba.fi/assets/uploads/find_images/40932_1a.JPG'
  },
  {
    des: 'Kantasormus, Haapavesi',
    imgSrc: 'http://luettelointi.nba.fi/assets/uploads/find_images/40548-1.JPG'
  },
  {
    des: 'Linturiipus, Hattula',
    imgSrc: 'http://luettelointi.nba.fi/assets/uploads/find_images/40449-2.jpg'
  },
  {
    des: 'Rengaskuolaimet, Vesilahti',
    imgSrc: 'http://luettelointi.nba.fi/assets/uploads/find_images/40548-1.JPG'
  }
];


// TODO: Replace these with the real ones
const data = [
  {
    title: 'What should I do if I find an antiquity?',
    description: 'If you find an object from the ground and you suspect it may be an antiquity, retrieve it and make a note of the exact location where the object was found.',
    image: 'https://www.museovirasto.fi/uploads/Arkeologiset_kokoelmat/_1600xAUTO_crop_center-center/Museovirasto_043-vaaka.jpg'
  },
  {
    title: 'Archaeological collections',
    description: 'Archaeological collections contain objects from the whole current territory of Finland as well as from the so-called ceded areas. The collections cover the whole prehistoric era extensively.',
    image: 'https://www.museovirasto.fi/uploads/Arkeologiset_kokoelmat/_1600xAUTO_crop_center-center/Museovirasto_056_vaaka.jpg'
  },
  {
    title: 'Enthusiast´s guide, Updated 2019',
    description: 'The archaeological collections of the historical era have been catalogued in the historical item collections of the National Museum of Finland until the end of 2010.',
    image: 'https://www.museovirasto.fi/uploads/Meista/_1600xAUTO_crop_center-center/Museovirasto_054-vaaka.jpg'
  },
];

export default AppHomePage;

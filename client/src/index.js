import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import AppRouter from './routers/AppRouter';
import configureStore from './store/configureStore';
import firebase from './firebase/firebase';
import { logout, loginLoggedUser } from './actions/auth';
import { setLocale } from './actions/locale';
import 'normalize.css/normalize.css';
import './styles/styles.scss';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#005566',
      main: '#007A93',
      dark: '#3394a8'
    },
    secondary: {
      light: '#9c9c9c',
      main: '#e0e0e0',
      dark: '#e6e6e6'
    },
  },
  typography: {
    useNextVariants: true
  }
});

// Confiture store
const store = configureStore();

// Language Settings
const lang = localStorage.getItem('locale') || 'en';
store.dispatch(setLocale(lang));

// App
const jsx = (
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </MuiThemeProvider>
);

// App rendering options
let hasRendered = false;
const renderApp = () => {
  if (!hasRendered) {
    ReactDOM.render(jsx, document.getElementById('root'));
    hasRendered = true;
  }
};

// Firebase observer for changes to the user's sign-in state.
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    store.dispatch(loginLoggedUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    }));
    renderApp();
  } else {
    store.dispatch(logout());
    renderApp();
    // TODO: Add here navigation
    // After logging out 
  }
});

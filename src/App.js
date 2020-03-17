import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui';
import Navigation from './Navigation';
import Sqlite from './Sqlite';

// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import * as actions from './actions/AppActions';

import { Provider } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import * as reducers from './reducers';

import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-reactnativeasyncstorage';
import filter from 'redux-storage-decorator-filter';

/*
//npm i redux-storage redux-storage-engine-reactnativeasyncstorage redux-storage-decorator-filter --save
*/

const engine = createEngine('TRAFIZ');
engine = filter(engine, [], ['App']);
const storageMiddleware = storage.createMiddleware(engine);

const reducer = storage.reducer(combineReducers(reducers));
const middleware = applyMiddleware(ReduxThunk,storageMiddleware);

const STORE = createStore(
  reducer,
  middleware
);

function loadStore() {
  return new Promise((resolve, reject) => {
    const load = storage.createLoader(engine);
    load(STORE)
      .then((newState) => {
        resolve();
      })
      .catch(() => {
        resolve();
      });
  });
}

const lib = require('./lib');

const uiTheme = {
  palette: {
    primaryColor: lib.THEME_COLOR,
  }
};

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      reduxStoreLoaded:false
    }
  }

  componentDidMount() {
    loadStore()
    .then((newState)=> {
      this.setState({
        reduxStoreLoaded:true
      })
    });
  }

  render() {
    if( !this.state.reduxStoreLoaded ) {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
        <Provider store={STORE}>
          <Navigation />
        </Provider>
      </ThemeContext.Provider>
    );
  }
}


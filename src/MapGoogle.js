/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import axios from 'axios';
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { createStackNavigator } from 'react-navigation';
import { RNCamera } from 'react-native-camera';
import { Button } from 'react-native-material-ui';
import { Navicon, BackButton, OnlineIndicator } from './Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';
import moment from 'moment';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const lib = require('./lib');


// import Upload from 'react-native-background-upload';
// import FileUploader from 'react-native-file-uploader';

class Map extends Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'map',
      region: {
        latitude: 7.288889,
        longitude: 110.255978,
        latitudeDelta: 32.30,
        longitudeDelta: 34.91,
      }
    }
  }

  updateCoord(region) {
    const lat = region.latitude;
    const long = region.longitude;
    const oldRegion = this.state.region;
    oldRegion.latitude = lat;
    oldRegion.longitude = long;
    this.setState({region:oldRegion});
  }

  snap() {
    const nav = this.props.navigation;
    const latitude = Math.floor(Number(this.state.region.latitude) * 1000000) / 1000000;
    const longitude = Math.floor(Number(this.state.region.longitude) * 1000000) / 1000000;


    nav.goBack();
    nav.state.params.onMapReturn(longitude,latitude);
  }

  render() {
    let disabled = (this.state.show === 'busy');
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:2}}>
        <MapView
          style={{flex:1}}
          initialRegion={this.state.region}
          onRegionChange={region=>this.setState({region})}
        />
        <View style={{
          marginLeft: -15,
          marginTop: -15,
          left: '50%',
          position: 'absolute',
          top: '50%'}} 
        >
        <FontAwesome name='ship' size={25} color={lib.THEME_COLOR}/>
        </View>
        </View>
        <View style={{flex:1,paddingHorizontal:0}}>
          <View style={{flex:1,paddingHorizontal:10}}>
            <Text />
            <Text>{L('latitude:')} {this.state.region.latitude}</Text>
            <Text>{L('longitude:')} {this.state.region.longitude}</Text>
            <Text />
          </View>
          <Button disabled={disabled} raised primary text={L('Get coordinate')} onPress={()=>this.snap()} />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

Map = connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)

export default Map;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

import { createStackNavigator } from 'react-navigation';

import QRCode from 'react-native-qrcode';
import QRCodeScanner from 'react-native-qrcode-scanner';

const RootStack = createStackNavigator({
  Home: {
    screen: HomeScreen
  },
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msg:'HELLO WORLD!',
      scanner:true
    }
  }

  processScan(result) {
    const data = result.data;
    this.setState({
      msg:data,
      scanner:false
    });
  }

  render() {
    let bottom = null;

    if(this.state.scanner) {
      bottom = (
        <View style={{flex:1}}>
          <QRCodeScanner
            onRead={(result)=>{
              this.processScan(result);
            }}
          />
        </View>        
      );
    } else {
      bottom = (
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <Button title='SCAN AGAIN' onPress={()=>this.setState({scanner:true})} />
        </View>        
      );
    }

    return (
      <View style={{flex:1}}>
        <View style={{justifyContent:'center',alignItems:'center',padding:10}}>
          <Text>{this.state.msg}</Text>
          <View style={{height:10}} />
          <QRCode
            value={this.state.msg}
            size={200}
            bgColor='black'
            fgColor='white'/>
        </View>
        {bottom}
      </View>
    );
  }
}

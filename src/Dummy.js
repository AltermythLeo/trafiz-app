import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class DummyScreen extends React.Component {
  render() {
    return (
      <View style={{flex:1, justifyContent:'center',alignItems:'center',padding:15}}>
        <Text style={{textAlign:'center'}}>{L('UNDER CONSTRUCTION')}</Text>
      </View>
    );
  }
}


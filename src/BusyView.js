import React, { Component } from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';

class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator />
      </View>
    );
  }
}

export default Screen;
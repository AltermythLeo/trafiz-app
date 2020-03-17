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
  constructor(props) {
    super(props);
    this.state = {
      show:'login',
      password:'',
      errorMessage:''
    }
  }

  renderLogin() {
    const styleBtn = {
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:lib.THEME_COLOR,
      padding:15,
      borderRadius:10
    };

    const s1 = Object.assign({},styleBtn,{flex:1});
    const s2 = Object.assign({},styleBtn,{flex:2});
    
    return (
      <View style={{flex:1}}>
        <View style={{flex:2,padding:10,alignItems:'center',justifyContent:'center'}}>
          <FontAwesome name="ship" size={64} color={lib.THEME_COLOR} />
          <View style={{height:10}} />
          <Text style={{fontWeight:'bold',color:lib.THEME_COLOR,textAlign:'center'}}>TRAFIZ</Text>
        </View>
        <View style={{flex:3,padding:10}}>
          <View style={{backgroundColor:'white'}}>
            <TextInput
              style={{height:50}}
              onChangeText={(text) => this.setState({password:text})}
              value={this.state.password}
              secureTextEntry={true}
              placeholder={L('Enter your PIN')}
            />
            <View style={{height:10}} />
            <View style={s2}>
              <Text style={{textAlign:'center',color:'white'}}>{L('Login')}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
        <Text>{L('PAUSE SCREEN')}</Text>
      </View>
    );
  }
}


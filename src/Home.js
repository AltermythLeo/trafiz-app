import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Picker
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { Navicon, BackButton, OnlineIndicator, Title } from './Navicon';

const dictionary = require('./dictionary');
const L = dictionary.translate;

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      lang:'english'
    }
  }


  logOut() {
    this.props.actions.logoutUser();
    this.props.navigation.navigate('Login');
  }

  changeLanguage(lang) {
    dictionary.setLanguage(lang);
    this.props.actions.setSetting('language',lang);
    this.props.navigation.navigate('Tab1');
  }

  render() {
    const lang = this.props.stateSetting.language;
    const label = L('Change language: ');
    const title = L('TEST MULTIPLE LANGUAGE');

    return (
      <View style={{flex:1, backgroundColor:'white'}}>
        <View style={{flex:1,justifyContent:'center'}}>
          <Text style={{textAlign:'center',fontWeight:'bold'}}>{title}</Text>
          <View style={{padding:20,flexDirection:'row',alignItems:'center'}}>
            <Text>{label}</Text>
            <Picker
              style={{flex:1}}
              selectedValue={lang}
              onValueChange={(item, idx) => this.changeLanguage(item)}
            >
              <Picker.Item label='English' value='english' />
              <Picker.Item label='Indonesia' value='indonesia' />
            </Picker>
          </View>
        </View>
        <View style={{padding:15}}>
          <Button accent raised text={L('LOGOUT')} onPress={()=>this.logOut()}/>
        </View>
      </View>
    );
  }
}

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateSetting: state.Setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

HomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeScreen)

export default HomeScreen;
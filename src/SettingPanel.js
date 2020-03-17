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
import { withNavigation } from 'react-navigation';

const dictionary = require('./dictionary');
const L = dictionary.translate;

class SettingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lang:'english'
    }
  }

  logOut() {
    this.props.actions.lockUser();
    this.props.navigation.navigate('Relogin');
  }

  changeLanguage(lang) {
    dictionary.setLanguage(lang);
    this.props.actions.setSetting('language',lang);
  }

  render() {
    const lang = this.props.stateSetting.language;
    const label = L('Change language: ');
    const title = L('TEST MULTIPLE LANGUAGE');

    // <Picker
    //   style={{flex:1}}
    //   selectedValue={lang}
    //   onValueChange={(item, idx) => this.changeLanguage(item)}
    // >
    //   <Picker.Item label='English' value='english' />
    //   <Picker.Item label='Indonesia' value='indonesia' />
    // </Picker>

    return (
      <View style={{flex:1, backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
        <Button accent raised style={{flex:1,container:{flex:1}}} text={L('LOGOUT')} onPress={()=>this.logOut()}/>
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

SettingPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingPanel)

export default withNavigation(SettingPanel);
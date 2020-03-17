import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Picker,
  WebView
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';


const lib = require('../lib');
const dictionary = require('../dictionary');
const L = dictionary.translate;


class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('HELP')} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'web'
    }
  }

  handleSend() {
    this.props.actions.sendErrorsByEmail();
  }

  render() {
    const html = this.props.stateSetting.htmlHelp;
    const msg = L('SEND ERROR LOGS BY EMAIL');
    let disableSend = false;
    // const numErr = this.props.stateTask.errorData.length;
    // if(numErr == 0) disableSend = true;

    return (
      <View style={{flex:1}}>
        <WebView
          source={{html: html}}
          style={{flex: 1}}
        />
        <View style={{padding:10}}>
          <Text style={{textAlign:'center'}}>{msg}</Text>
          <View style={{height:5}} />
          <Button disabled={disableSend} raised primary text={L('Send')} onPress={()=>this.handleSend()} />
        </View>
      </View>
    )
    
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateSetting: state.Setting,
    stateTask: state.Task
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;
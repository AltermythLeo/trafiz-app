import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  DatePickerAndroid
} from 'react-native';
import _ from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as Api from './Api';
import moment from 'moment';
import LoanDetail from './LoanDetail';
import BuyDetail from './BuyDetail';
import OtherDetail from './OtherDetail';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('FISHERMAN/SUPPLIER DETAILS')} />
      ),

      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
    }
  }
  
  renderResult() {
    return <BuyDetail navigation={this.props.navigation}/>
  }

  renderLoan() {
    return <LoanDetail navigation={this.props.navigation}/>
  }

  renderOther() {
    return <OtherDetail navigation={this.props.navigation}/>
  }

  render() {
    return (
      <ScrollableTabView>
        <View style={{flex:1}} tabLabel={L('DETAILS')}>{this.renderResult()}</View>
        <View style={{flex:1}} tabLabel={L('LOAN')}>{this.renderLoan()}</View>
        <View style={{flex:1}} tabLabel={L('OTHER')}>{this.renderOther()}</View>
      </ScrollableTabView>
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

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;
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
  Dimensions,
  SectionList,
  ScrollView
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import QRCodeSvg from 'react-native-qrcode-svg';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('DELIVERY SHEET')} />
      ),

      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'content',
      qrCodesIndex:0
    }
  }

  componentDidMount() {
  }

  nextQRCode(add) {
    const qrCodes = this.props.navigation.getParam('qrCodes');

    if(add) {
      const qrCodesIndex = this.state.qrCodesIndex + 1;
      if(qrCodesIndex < qrCodes.length) {
        this.setState({qrCodesIndex});
      }
    } else {
      const qrCodesIndex = this.state.qrCodesIndex - 1;
      if(qrCodesIndex >= 0) {
        this.setState({qrCodesIndex});
      }
    }
  }

  render() {
    const dim = Dimensions.get('window');
    const w = Math.floor(dim.width * 0.8);
    const ww = dim.width;
    const qrCodesIndex = this.state.qrCodesIndex;
    const qrCodes = this.props.navigation.getParam('qrCodes');
    let code = qrCodes[qrCodesIndex].qrCode;
    const page = qrCodesIndex + 1;
    const allPages = qrCodes.length;

    return (
      <View style={{flex:1}}>
        <View>
          <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <TouchableOpacity onPress={()=>this.nextQRCode(false)}>
              <View style={{padding:15}}><FontAwesome name='arrow-left' size={25} /></View>
            </TouchableOpacity>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
              <Text>{page}/{allPages}</Text>
            </View>
            <TouchableOpacity onPress={()=>this.nextQRCode(true)}>
              <View style={{padding:15}}><FontAwesome name='arrow-right' size={25} /></View>
            </TouchableOpacity>
          </View>
          <View style={{height:10}} />
        </View>
        <ScrollView style={{flex:1}}>
          <View style={{width:ww,height:ww,alignItems:'center',justifyContent:'center'}}>
            <QRCodeSvg
              value={code}
              size={w}
              />
          </View>
          <View style={{padding:10}}>
            <Text style={{textAlign:'center',fontSize:10}}>{code}</Text>
          </View>
        </ScrollView>
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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;
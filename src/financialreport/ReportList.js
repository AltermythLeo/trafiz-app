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
  ScrollView,
  Picker
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
import { MyDateBtn } from '../myCtl';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;
const img = require('../images/fishIcon.png');

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('SELECT CATEGORY')} size={lib.THEME_FONT_LARGE}/>
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      errMsg:'',
      refreshing: false
    }
  }

  componentDidMount() {

    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'form'
      });
    })
  }

  handleDailyFinancialReport()
  {
    this.props.navigation.push('FinancialReportFinancialScreen');
  }

  handleAnnualFinancialReport()
  {
    this.props.navigation.push('FinancialReportAnnualFinancialScreen');
  }

  handleDailyCatchReport()
  {
    this.props.navigation.push('FinancialReportCatchScreen',);
  }

  handleAnnualCatchReport()
  {
    this.props.navigation.push('FinancialReportAnnualCatchScreen');
  }

  render() {
    let errorIndicator = null;
    //Error Message
    if( this.state.errMsg.length > 0 ) {
      const errMsg = this.state.errMsg.toUpperCase();
      errorIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{errMsg}</Text>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white',elevation:1}}>
          {errorIndicator}

          {/*Static buttons*/}
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.handleDailyFinancialReport()}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Daily Financial Report').toUpperCase()}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/></View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.handleAnnualFinancialReport()}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Annual Financial Report').toUpperCase()}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/></View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.handleDailyCatchReport()}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Daily Catch Report').toUpperCase()}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/></View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.handleAnnualCatchReport()}>
            <View style={{padding:10,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Annual Catch Report').toUpperCase()}</Text>
                <View style={{flex:1}} />
                <View style={{padding:15}}><FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/></View>
            </View>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateSetting: state.Setting
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
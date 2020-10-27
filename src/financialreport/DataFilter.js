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
import { Button , Checkbox} from 'react-native-material-ui';
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
        <Title txt={L('FILTER REPORT')} size={lib.THEME_FONT_LARGE}/>
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  handleSave() {
      console.warn("Handle Apply Filter");
      const cb = this.props.navigation.getParam('onSetFilter',false);
      if(cb) {
        const filterData = this.state.filterData;
        cb(filterData);
      }
      this.props.navigation.goBack();
  }

  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      filterData:{},
      errMsg:'',
      refreshing: false
    }
    this.state.filterData=Object.values(props.navigation.state.params.filterData);
    console.warn(this.state.filterData);
  }

  componentDidMount() {

    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'form'
      });
    })
  }

  renderFilterItem(item)
  {
    const label = item.label;
    const value = item.value;
    console.warn(value);
    const filterData = this.state.filterData;
    if(item.header)
    {
        return (
            <View style={{height:60}}>
                <Text style={{padding : 10, paddingTop:25, fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{label} </Text>
            </View>
          );
    }else

    if(value == undefined)
    {
      return (
        <View style={{height:60}}>
            <Text style={{padding : 20, paddingTop:15, fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{label} </Text>
        </View>
      );
    }
    return (
      <View style={{height:40, flexDirection:'row'}}>
        <View style={{width:40}}>
          <Checkbox label='' value='' checked={item.value} onCheck={()=>
            {
                for(let i = 0; i <filterData.length; i++)
                {
                    if(filterData[i].label === label)
                    {
                        filterData[i].value = !filterData[i].value;
                        break;
                    }
                }
                this.setState({filterData:filterData});
                console.warn(this.state.filterData);
            }}/>
        </View>
        <View style={{width:10}} />
        <View style={{flex:1,justifyContent:'center'}}>
          <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{label} </Text>
        </View>
      </View>
    );
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

    if(this.state.filterData.length <= 1)
    {
      console.warn("FILTER DATA LENGTH " + this.state.filterData.length);
      return(
        <View style={{alignItems:'center', height:80,justifyContent:'center'}}>
          <Text style={{padding:15, fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
            {L('No data to filter')} </Text>
        </View>
      );
    } 

    return (
      <View style={{flex:1}}>
        <View   style={{flex:1, flexDirection:'column', backgroundColor:'white', borderColor:lib.THEME_COLOR_BLACK}}>
          <FlatList 
            data={this.state.filterData}
            extraData = {this.state}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderFilterItem(item,index)}
          />
        </View>
        <View>
          <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('APPLY FILTER')}
            onPress={()=>this.handleSave()}></Button>
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
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
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button , Checkbox} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';

const lib = require('../lib');
const L = require('../dictionary').translate;
const UIHelper = require('./UIHelper');
let incomeorexpense;

class Screen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('EDIT CUSTOM <TYPE>').replace('<TYPE>', L(lib.capitalize(params.incomeorexpense))).toUpperCase()} size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      errMsg:'',
      refreshing:false,
      rows:{},
      label:''
    }
    this.incomeorexpense = this.props.navigation.state.params.incomeorexpense;
    this.refreshList();
  }

  componentDidMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.refreshList();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  onClickRow(item)
  {
    this.props.navigation.navigate('InvestCustomEditScreen', {payload:item});
  }

  refreshList() {
    this.setState({refreshing:true});
    if(this.incomeorexpense == 'income')
      UIHelper.getAddIncomeDataByFilter(this.props.stateData,null)
      .then(json=>{
          this.setState({refreshing:false, rows:json.customIncomeTypes});
      })
    else
      UIHelper.getAddExpenseDataByFilter(this.props.stateData,null)
      .then(json=>{
          this.setState({refreshing:false, rows:json.customExpenseTypes});
      })
  }

  renderItem(item,i) {
    return (
        <View key={i}>
        <TouchableOpacity style={{}} onPress={()=>this.onClickRow(item)}>
          <View style={{padding:15, backgroundColor:'white',
              flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
              alignItems:'center'}}>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
                {item.label}
              </Text>
              <View style={{flex:1}} />
              <View style={{padding:5}}>
                <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
              </View>
          </View>
        </TouchableOpacity>
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

    const rows = this.state.rows;
    _.remove(rows,{trxoperation:'D'});
    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1, height:60, flexDirection:'row', alignItems:'center'}}>
            <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Select Custom <Type> To Edit').replace('<Type>',L(lib.capitalize(this.incomeorexpense))) + ':'}</Text>
          </View>
        </View>
        <View style={{flex:1}}>
          <ScrollView style={{backgroundColor:'white'}}>
            <View style={{flex:1, backgroundColor:'white'}}>
            <FlatList
                refreshing={this.props.refreshing}            
                data={rows}
                keyExtractor={(item,index) => (''+index)}
                renderItem={
                  ({item,index}) => this.renderItem(item,index)
                }
            />
          </View>
        </ScrollView>
      </View>
    </View>
    );
  }
}

export default Screen;
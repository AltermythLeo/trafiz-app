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
import { Navicon, Title, BackButton } from '../Navicon';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button , Checkbox} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';

const lib = require('../lib');
const L = require('../dictionary').translate;

class Screen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('Setting Finance Category').toUpperCase()} size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      errMsg:'',
      label:''
    }
  }

  componentDidMount() {
  }

  editCustomIncome() {
    this.props.navigation.navigate('InvestCustomEditListScreen', {incomeorexpense:'income'});
  }

  editCustomExpense() {
    this.props.navigation.navigate('InvestCustomEditListScreen', {incomeorexpense:'expense'});
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
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1, height:60, flexDirection:'row', alignItems:'center'}}>
            <Text style={{flex:1, fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Select Custom Type To Edit') + ':'}</Text>
          </View>
        </View>
        <View style={{backgroundColor:'white', flex:1}}>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.editCustomIncome()}>
            <View style={{padding:15,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Custom Income')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:5}}>
                  <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
                </View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.editCustomExpense()}>
            <View style={{padding:15,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Custom Expense')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:5}}>
                  <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
                </View>
            </View>
          </TouchableOpacity>
          </View>
      </View>
    </View>
    );
  }
}

export default Screen;
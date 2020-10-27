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
const lib = require('../../lib');
const L = require('../../dictionary').translate;
const padding = 15;
class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show:'form',
      errMsg:'',
      customCategory:[]
    }
  }

  renderItem(item,index) {
    const title = item.labelValue;
    const price = 'Rp '+lib.toPrice(item.amount);

    return (
      <TouchableOpacity style={{}} onPress={()=>this.props.onClickRow(item)}>
        <View style={{flex:1, flexDirection:'row'}}>
          <View style={{flex:1, padding:padding,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{title}</Text>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{price}</Text>
            </View>
            <View style={{width:10}} />
            <View style={{justifyContent:'center',alignItems:'center'}}>
            <View style={{padding:5}}>
              <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
            </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderCustomExpenseItem(item,i) {
    return (
      <View key={i}>
      <TouchableOpacity style={{}} onPress={()=>this.props.onClickCustomExpense(item)}>
        <View style={{padding:padding,
            flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
            alignItems:'center'}}>
            <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{item.label}</Text>
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
    //get data to show
    let rows = this.props.rows;

    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    let customExpenseTypes = this.props.customExpenseTypes;
    if( !customExpenseTypes ) customExpenseTypes = [];


    return (
      <View style={{flex:1}}>
        <ScrollView>
        <View style={{backgroundColor:'white', elevation:1}}>
          {/*Static buttons*/}
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.onClickButtonBuyFish()}>
            <View style={{padding:padding,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Buy Catch')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:5}}>
                  <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
                </View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.onClickButtonPayLoan()}>
            <View style={{padding:padding,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Pay Loan')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:5}}>
                  <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
                </View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.onClickButtonGiveCredit()}>
            <View style={{padding:padding,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Account Receivable')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:5}}>
                  <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
                </View>
            </View>
          </TouchableOpacity>
          </View>
          {customExpenseTypes.map((item,i)=>this.renderCustomExpenseItem(item,i))}
        </View>
        {/*Static buttons end*/}
        </ScrollView>
        <View style={{borderColor:'gray', borderWidth:1, backgroundColor:'white', height:50}}>
          <TouchableOpacity style={{}} onPress={()=>this.props.onClickButtonAddCategory()}>
            <View style={{justifyContent:'center', alignItems:'center', height:50}}>
                <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Add New Category').toUpperCase()}</Text>                
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default Screen;
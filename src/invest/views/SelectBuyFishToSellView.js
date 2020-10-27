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

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../../lib');
const L = require('../../dictionary').translate;

class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show:'list',
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
          <View style={{flex:1, padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
            <View style={{}}>
              <Image source={require('../../images/fishIcon.png')} style={{width: 50, height: 50}}/>
            </View>
            <View style={{width:10}} />
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{}}>{title}</Text>
              <Text style={{}}>{price}</Text>
            </View>
            <View style={{width:10}} />
            <View style={{justifyContent:'center',alignItems:'center'}}>
              <View style={{padding:15}}><FontAwesome name='arrow-right' /></View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    let rows = this.props.rows;

    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        <View style={{flex:1, backgroundColor:'white'}}>
          <FlatList
              onRefresh={()=>this.props.onRefreshRows()}
              refreshing={this.props.refreshing}            
              data={rows}
              keyExtractor={(item,index) => (''+index)}
              renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
      </View>
    );
  }
}

export default Screen;
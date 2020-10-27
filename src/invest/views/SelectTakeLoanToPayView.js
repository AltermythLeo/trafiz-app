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
    }
  }

  truncateText(txt)
  {
    const maxLength = 30;
    return txt.length > maxLength ? (txt.substr(0, maxLength) + '...') : txt;
  }

  renderItem(item,index) {
    const title = item.labelValue;
    const price = 'Rp '+lib.toPrice(item.amount);

    return (
      <TouchableOpacity style={{height:60}} onPress={()=>this.props.onClickRow(item)}>
        <View style={{flex:1, flexDirection:'row'}}>
          <View style={{flex:1, padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text numberOfLines={1} style={{textAlignVertical:'center', flex:1, fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
                {price+' ('+title+')'}
              </Text>
            </View>
            <View style={{width:20}} />
            <View style={{justifyContent:'center',alignItems:'center'}}>
              <View style={{padding:15}}><FontAwesome name='arrow-right' size={lib.THEME_FONT_LARGE}/></View>
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

    if(rows === undefined || rows.length == 0)
      return(
        <View style={{flex:1}}>
          <View style={{flex:1, backgroundColor:'white', paddingTop : 30}}>
            <Text style={{fontSize:lib.THEME_FONT_LARGE, color:lib.THEME_COLOR_BLACK, textAlign:'center'}}>{L('Currently, there is no payables.')}</Text>
          </View>
          <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Take New Loan')}
            onPress={()=>
            {
              this.props.goToTakeLoanScreen();
            }}></Button>
        </View>
      );
    else
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
          <View style={{}}>
          
          <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Take New Loan')}
            onPress={()=>
            {
              this.props.goToTakeLoanScreen();
            }}></Button>
          </View>
        </View>
      );
  }
}

export default Screen;
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
  Picker,
  Animated
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import NumericInput from 'react-native-numeric-input';
import Popover from 'react-native-popover-view';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../../lib');
const L = require('../../dictionary').translate;
const padding = 15;
let selectedFishData;
let unitName;

class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show:'form',
      errMsg:'',
      fishAmount:0,
      isVisible:false,
      customCategory:[]
    }
  }

  renderItem(item,index) {
    const title = item.labelValue;
    const price = 'Rp '+lib.toPrice(item.amount);

    return (
      <TouchableOpacity style={{}} onPress={()=>this.props.onClickRow(item)}>
        <View style={{flex:1, flexDirection:'row'}}>
          <View style={{flex:1, padding:padding, flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
            <View style={{}}>
              <Image source={require('../../images/fishIcon.png')} style={{width: 50, height: 50}}/>
            </View>
            <View style={{width:5}} />
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{title}</Text>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{price}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderOverlay(amount)
  {
    if(amount>1)
      return(
        <View style={{width:50, position:'absolute', alignItems:'flex-end'}}>
        <Image source={require('../../images/blueDot.png')} style={{width: 20, height: 20}}/>
        <View style={{flex:1, position:'absolute', width:20, height:20, justifyContent:'center', alignItems:'center'}}>
          <Text style={{allowFontScaling:false, fontSize:9, color:'white', textAlign:'center'}}>{amount}</Text>
        </View>
      </View>
    );
    else
        return null;
  }

  renderCustomIncomeItemAndFish(item,i) {
    console.warn(item);
    if(item.labelValue !== undefined && item.labelValue !== null)
    {
      const title = item.labelValue;
      const price = 'Rp '+lib.toPrice(item.amount);
      const unit  = item.stackedUnit;

      return (
        <TouchableOpacity style={{}} onPress={()=>this.showPopover(item)}>
          <View style={{flex:1, flexDirection:'row'}}>
            <View style={{flex:1, padding:padding, flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
              <View style={{}}>
                <Image source={require('../../images/fishIcon.png')} style={{width: 50, height: 50}}/>
                {this.renderOverlay(unit)}
              </View>
              <View style={{width:5}} />
              <View style={{flex:1,justifyContent:'center'}}>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{title}</Text>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{price}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    
    if(item.separator !== undefined && item.separator == true)
    {
        return(
          <View style={{backgroundColor:'gainsboro', height:10}}></View>
        );
    }

    return (
      <View key={i}>
      <TouchableOpacity style={{}} onPress={()=>this.props.onClickCustomIncome(item)}>
        <View style={{padding:padding,
            flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
            alignItems:'center'}}>
            <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
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

  renderCustomIncomeItem(item,i) {
    return (
      <View key={i}>
      <TouchableOpacity style={{}} onPress={()=>this.props.onClickCustomIncome(item)}>
        <View style={{padding:padding, backgroundColor:'white',
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

 showPopover(item) {
   selectedFishData = item;
   this.setState({fishAmount:1});
   this.setState({isVisible: true});
 }
 
 closePopover() {
    this.setState({isVisible: false});
 }

 AddFishAMount()
 {
   let fishAmount = this.state.fishAmount;
   if(fishAmount < selectedFishData.stackedUnit)
    fishAmount++;
   this.setState({fishAmount:fishAmount});
 }

 SubFishAMount()
 {
   let fishAmount = this.state.fishAmount;
   if(fishAmount > 1)
    fishAmount--;
   this.setState({fishAmount:fishAmount});
 }

 onValueChanged(val)
 {
   this.setState({fishAmount:val});
 }

 render() {
    //get data to show
    let _rows = this.props.rows;

    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    let rows = [];
    let customIncomeTypes = this.props.customIncomeTypes;
    if( !customIncomeTypes ) customIncomeTypes = [];
    console.warn(this.props.customIncomeTypes);
/*    for(let i = 0; i < customIncomeTypes.length; i++)
    {
      //console.warn(customIncomeTypes[i]);
      rows[i] = customIncomeTypes[i];
    }

    if(rows.length > 0)
      rows[rows.length] = {'separator':true};*/

    let idx=0;
    for(let i = 0; i < _rows.length; i++)
    {
      idx = _.findIndex(rows, {'catchOfflineID':_rows[i].catchOfflineID});
      if(idx < 0)
      {
        _rows[i].stackedUnit = 1;
        rows[rows.length] = _rows[i];
        rows[rows.length - 1].offlineIDs = [_rows[i].offlineID];
      }
      else
      {
        rows[idx].stackedUnit += _rows[i].numUnit;
        rows[idx].offlineIDs.push(_rows[i].offlineID);
      }
    }

    let sellUnitName = 'unit';
    if(selectedFishData)
    {
      sellUnitName = L(selectedFishData.sellUnitName).toLowerCase();
    }
    return (
      <View style={{flex:1}}>
        <ScrollView style={{backgroundColor:'white'}}>
          {/*Static buttons*/}
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.onClickButtonSellFish()}>
            <View style={{padding:padding,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Sell Catch')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:5}}>
                  <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
                </View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.onClickButtonTakeLoan()}>
            <View style={{padding:padding,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Get Loan')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:5}}>
                  <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
                </View>
            </View>
          </TouchableOpacity>
          </View>
          <View>
          <TouchableOpacity style={{}} onPress={()=>this.props.onClickButtonCreditPayment()}>
            <View style={{padding:padding,
                flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1,
                alignItems:'center'}}>
                <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Account Receivable Payment')}</Text>
                <View style={{flex:1}} />
                <View style={{padding:5}}>
                  <FontAwesome name='arrow-right' size={lib.THEME_FONT_MEDIUM}/>
                </View>
            </View>
          </TouchableOpacity>
          </View>
        {/*Static buttons end*/}
          {customIncomeTypes.map((item,i)=>this.renderCustomIncomeItem(item,i))}
          <View style={{backgroundColor:'gainsboro', height:10}}></View>
          <View style={{flex:1, backgroundColor:'white'}}>
            <FlatList
                onRefresh={()=>this.props.onRefreshRows()}
                refreshing={this.props.refreshing}            
                data={rows}
                keyExtractor={(item,index) => (''+index)}
                renderItem={
                  ({item,index}) => this.renderCustomIncomeItemAndFish(item,index)
                }
            />
          </View>
          </ScrollView>
          <View style={{borderColor:'gray', borderWidth:1, backgroundColor:'white', height:50}}>
            <TouchableOpacity style={{}} onPress={()=>this.props.onClickButtonAddCategory()}>
              <View style={{justifyContent:'center', alignItems:'center', height:50}}>
                  <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_LARGE, color:lib.THEME_COLOR_BLACK}}>{L('Add New Category').toUpperCase()}</Text>                
              </View>
            </TouchableOpacity>
          </View>
        <Popover
          isVisible={this.state.isVisible}
          fromView={this.touchable}
          onRequestClose={() => this.closePopover()}>
          <View style={{height:200, padding:20}}>
            <Text style={{fontSize:lib.THEME_FONT_LARGE, color:lib.THEME_COLOR_BLACK, textAlign:'center'}}>
              {L('How many <unit> of fish to sell?').replace('<unit>', sellUnitName)}
            </Text>
            <View style={{height:15}}></View>
            <View style={{height:60}}>
              <View style={{flex:1, flexDirection:'row', justifyContent:'center'}}>
                <NumericInput totalHeight={50} minValue={1} maxValue={selectedFishData?selectedFishData.stackedUnit:1} 
                  value={this.state.fishAmount} onChange={value => this.onValueChanged(value)} />
              </View>
            </View>
            <View style={{height:10}}></View>
            <View style={{flex:1, flexDirection:'row'}}>
              <Button style={{container:{width:100, height:50}}} primary raised uppercase text={L('Sell')}
                onPress = {()=>
                {
                  this.props.onClickRow(selectedFishData, this.state.fishAmount);
                  this.closePopover();
                }}></Button>
              <View style={{width : 50}}></View>
              <Button style={{container:{width:100, height:50}}} primary raised uppercase text={L('Cancel')}
                onPress = {()=>this.closePopover()}></Button>
            </View>
          </View>
        </Popover>
      </View>
    );
  }
}

export default Screen;
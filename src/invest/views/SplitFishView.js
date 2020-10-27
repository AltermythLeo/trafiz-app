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

const lib = require('../../lib');
const L = require('../../dictionary').translate;
const styles = StyleSheet.create(
  {
    box:{
      fontSize:lib.THEME_FONT_MEDIUM,
      color:lib.THEME_COLOR_BLACK,
      backgroundColor:'white',
      borderColor:lib.THEME_COLOR_BLACK,
      borderWidth:1
    },
    container:{
      height:90, padding:10, paddingTop:0, paddingBottom:20
    },
    label:{
      fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, height:40, paddingTop:10
    },
    labelBold:{
      fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, height:40, paddingTop:10
    },
    spacer:{
      height:15
    }
  }  
)

class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errMsg:'',
      selectedNewUnit:'',
      numUnit:'',
      sellUnitPrice:'',
      readOnly:false
    }
  }

  componentDidMount() {

    const viewData = this.props.viewData;
    if(viewData) {
      this.setState({
        selectedNewUnit:viewData.selectedNewUnit,
        numUnit:viewData.numUnit,
        sellUnitPrice:viewData.sellUnitPrice,
        readOnly:true
      });
    }
  }

  retrieveJson() {
    const buyPrice = this.props.fishBuyPrice;
    const numUnit = this.state.numUnit;
    const sellUnitPrice = lib.toNumber(this.state.sellUnitPrice);
    const weightPerUnit = Math.round (this.props.fishWeight / numUnit);
    let sellingPrice = 0;

    if(Number(numUnit) > 0 && Number(sellUnitPrice) > 0 ) {
      sellingPrice = Number(numUnit) * Number(sellUnitPrice);
      totalPrice = sellingPrice - buyPrice;
    }

    const json = {
      selectedNewUnit:this.state.selectedNewUnit,
      numUnit:this.state.numUnit,
      sellUnitPrice:sellUnitPrice,
      weightPerUnit:weightPerUnit,
      sellingPrice:sellingPrice
    }

    const fieldName = {
      selectedNewUnit:'Unit Measurement',
      numUnit:'Split Number',
      sellUnitPrice:'Price Per Unit'
    }
    
    for (let key in json) {
      if (json.hasOwnProperty(key)) {
        const val = json[key];
        if(val.length == 0) {
          const errMsg = fieldName[key]+ ' must be set';
          this.setState({errMsg});
          return null;
        }
      }
    }

    return json;
  }

  onPriceChanged(num)
  {
    num = lib.toNumber(num);
    num = 'Rp ' + lib.toPrice(num);
    this.setState({sellUnitPrice:num});
  }

  handleSave() {
    const json = this.retrieveJson();
    if(json) this.props.onClickButtonSave(json);
  }

  render() {
    if(this.props.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

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

    const newUnits = [
      {label:L('<Choose Measurement Unit>'),value:''},
      {label:L('Whole'),value:'Whole'},
      {label:L('Plate'),value:'Plate'},
      {label:L('Bucket'),value:'Ember'},
      {label:L('Basket'),value:'Basket'},
      {label:'Kg',value:'Kg'},
    ];

    const buyLabel = this.props.fishLabel;
    const buyPrice = this.props.fishBuyPrice;
    const numUnit = this.state.numUnit;
    const sellUnitPrice = lib.toNumber(this.state.sellUnitPrice);
    let sellingPrice = 0;
    let totalPrice = 0;
    let pricePerKg = 0;
    let weightPerUnit = 0;
    console.warn(this.props.fishWeight);
    
    if(Number(numUnit) > 0 && Number(sellUnitPrice) > 0 ) {
      sellingPrice  = Number(numUnit) * Number(sellUnitPrice);
      pricePerKg    = Math.round(sellingPrice / this.props.fishWeight);
      weightPerUnit = Math.round (this.props.fishWeight / numUnit);
      totalPrice    = sellingPrice - buyPrice;
    }

    const selectedNewUnit = this.state.selectedNewUnit;
    const result = _.find(newUnits,{value:selectedNewUnit});
    let replacement = result ? result.label : 'Unit';
    if(selectedNewUnit === '') replacement = 'Unit';

    const editable = !(this.state.readOnly);
    let btn = null;
    if(editable) {
      btn = (
        <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Save')}
          onPress={()=>this.handleSave()}></Button>
      );
    }

    let title = null;
    if(editable) {
      title = (
        <View style={{padding:15}}>
          <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{buyLabel}</Text>
          <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Buy price')} Rp {lib.toPrice(buyPrice)}</Text>
        </View>
      );
    } else {
      title = (
        <View style={{}}>
          <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Income Type') + ':'}</Text>
          <View style={{padding:15}}>
            <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Sell Catch').toUpperCase()}</Text>
            <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{buyLabel}</Text>
            <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Buy Price')} Rp {lib.toPrice(buyPrice)}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            {title}

          </View>
        </View>
        <View style={{flex:1}}>
            <ScrollView keyboardShouldPersistTaps={'always'} style={{backgroundColor:lib.THEME_COLOR_LIGHTGREY}}>
                <View style={styles.container}>
                    <Text style={styles.label}>{L('New Split Form')} </Text>
                    <View style={styles.box}>
                      <Picker
                        enabled={editable}
                        selectedValue={this.state.selectedNewUnit}
                        onValueChange={(item, idx) => this.setState({selectedNewUnit:item})}
                      >
                      {newUnits.map((obj,index)=>{
                        return <Picker.Item key={index} label={obj.label} value={obj.value} />;
                      })}
                      </Picker>
                    </View>
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Quantity To Split (<unit>)').replace('<unit>', replacement)}</Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    value={numUnit}
                    keyboardType='numeric'
                    onChangeText={(text) => this.setState({numUnit:text})}
                    placeholder={L('<Set Split Number>')}
                  />
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Price Per <unit>').replace('<unit>', replacement)}</Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    value={this.state.sellUnitPrice}
                    keyboardType='numeric'
                    onChangeText={(text) => this.onPriceChanged(text)}
                    placeholder={L('<Set Price Per <unit>>').replace('<unit>', replacement)}
                  />
                </View>
                <View style={{height:70,padding:10,paddingTop:20}}>
                    <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Total Selling Price')}</Text>
                    <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>Rp {lib.toPrice(sellingPrice)}</Text>
                </View>
                <View style={{height:70,padding:10}}>
                    <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Profit')}</Text>
                    <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>Rp {lib.toPrice(totalPrice)}</Text>
                </View>
                <View style={{height:70,padding:10}}>
                    <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Weight per <unit>').replace('<unit>', replacement)}</Text>
                    <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{lib.toPrice(weightPerUnit) + ' Kg'}</Text>
                </View>
                <View style={{height:70,padding:10}}>
                    <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Sell Price per Kg')}</Text>
                    <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>Rp {lib.toPrice(pricePerKg)}</Text>
                </View>
             </ScrollView>
          </View>
          <View style={{}}>
            {btn}
          </View>
      </View>
    );
  }
}

export default Screen;
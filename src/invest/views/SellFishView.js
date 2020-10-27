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
      notes:'',
      sellUnitPrice:'',
    }
  }

  componentDidMount() {

    const initialData = this.props.initialData;
    if(initialData) {
      this.setState(initialData);
    }
  }

  retrieveJson() {
    const buyPrice = this.props.fishBuyPrice;
    const numUnit = this.state.numUnit;
    const sellUnitPrice = this.state.sellUnitPrice;
    let sellingPrice = 0;

    if(Number(numUnit) > 0 && Number(sellUnitPrice) > 0 ) {
      sellingPrice = Number(numUnit) * Number(sellUnitPrice);
      totalPrice = sellingPrice - buyPrice;
    }

    const json = {
      selectedNewUnit:this.state.selectedNewUnit,
      numUnit:this.state.numUnit,
      sellUnitPrice:sellUnitPrice,
      sellingPrice:sellingPrice,
      notes:this.state.notes
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
      {label:'<Choose Measurement Unit>',value:''},
      {label:'Whole',value:'Whole'},
      {label:'Plate',value:'Plate'},
      {label:'Basket',value:'Basket'},
    ];

    const buyLabel = this.props.fishLabel;
    const buyPrice = this.props.fishBuyPrice;
    const numUnit = this.state.numUnit;
    const sellUnitPrice = this.state.sellUnitPrice;
    let sellingPrice = 0;
    let totalPrice = 0;

    if(Number(numUnit) > 0 && Number(sellUnitPrice) > 0 ) {
      sellingPrice = Number(numUnit) * Number(sellUnitPrice);
      totalPrice = sellingPrice - buyPrice;
    }

    const selectedNewUnit = this.state.selectedNewUnit;
    const result = _.find(newUnits,{value:selectedNewUnit});
    let replacement = result ? result.label : 'Unit';
    if(selectedNewUnit=== '') replacement = 'Unit';

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
              {L('Income Type') + ':'}
            </Text>
            <View style={{padding:15}}>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Sell Catch').toUpperCase()}</Text>
              <Text />
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{buyLabel}</Text>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Buy Price')} Rp {lib.toPrice(buyPrice)}</Text>
            </View>

          </View>
        </View>
        <View style={{flex:1}}>
            <ScrollView style={{backgroundColor:'white'}}>
                <View style={{height:70, padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <Text>{L('New Split Form')} </Text>
                    <Picker
                        style={{flex:1}}
                        selectedValue={this.state.selectedNewUnit}
                        onValueChange={(item, idx) => this.setState({selectedNewUnit:item})}
                    >
                      {newUnits.map((obj,index)=>{
                        return <Picker.Item key={index} label={obj.label} value={obj.value} />;
                      })}
                    </Picker>
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:30, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                        tintColor={lib.THEME_COLOR}
                        value={numUnit}
                        keyboardType='numeric'
                        onChangeText={(text) => this.setState({numUnit:text})}
                        label={L('Quantity To Split (<unit>)').replace('<unit>', replacement)}
                        placeholder={L('<Set Split Number>')}
                    />
                </View>
                <View style={{height:70, padding:10, paddingTop:0, paddingBottom:30, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
                    <TextField
                        tintColor={lib.THEME_COLOR}
                        value={sellUnitPrice}
                        keyboardType='numeric'
                        onChangeText={(text) => this.setState({sellUnitPrice:text})}
                        label={L('Price Per <unit>').replace('<unit>', replacement)}
                        placeholder={L('<Set Price Per <unit>>').replace('<unit>', replacement)}
                    />
                </View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Notes')}</Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    value={this.state.notes}
                    multiline={true}
                    textAlignVertical='top'
                    placeholder={L('<Set Miscellanous Note>')}
                    onChangeText={(text) => this.setState({notes:text})}
                  />
                </View>

                <View style={{height:70,padding:10,paddingTop:20}}>
                    <Text style={{fontWeight:'bold'}}>{L('Total Selling Price')}</Text>
                    <Text>Rp {lib.toPrice(sellingPrice)}</Text>
                </View>
                <View style={{height:70,padding:10}}>
                    <Text style={{fontWeight:'bold'}}>{totalPrice >= 0 ? L('Profit') : L('Loss')}</Text>
                    <Text>Rp {lib.toPrice(Math.abs(totalPrice))}</Text>
                </View>
             </ScrollView>
          </View>
          <View style={{}}>
            <Button style={{container:{height:50}}} primary raised uppercase text={L('Save')}
              onPress={()=>this.handleSave()}></Button>
          </View>
      </View>
    );
  }
}

export default Screen;
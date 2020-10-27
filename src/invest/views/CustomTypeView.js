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
  Alert,
  ScrollView,
  Picker
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button , Checkbox} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';

const lib = require('../../lib');
const L = require('../../dictionary').translate;

class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errMsg:'',
      label:''
    }
  }

  componentDidMount() {
    if(this.props.prevLabel)
      this.setState({label:this.props.prevLabel});
  }

  generateJson(remove) {
    const json = {
      label:this.state.label,
      remove:remove
    }

    const fieldName = {
      label:'Label'
    }
    
    if(!remove)
    {
      for (let key in fieldName) {
        if (fieldName.hasOwnProperty(key)) {
          const val = json[key];
          if(val.length == 0) {
            const errMsg = fieldName[key]+ ' must be set';
            this.setState({errMsg});
            return null;
          }
        }
      }
    }

    return json;
  }

  handleRemove()
  {
    Alert.alert('',
      L('Delete <incomeorexpense>?').replace('<incomeorexpense>', this.props.prevLabel),
      [
        {
          text: L('No').toUpperCase(), 
          onPress: () => console.warn('do nothing')
        },
        {
          text: L('Yes').toUpperCase(), 
          onPress: () => this.handleSave(true)
        },
      ]
    );
  }

  handleSave(remove=false) {
    const json = this.generateJson(remove);
    if(json) this.props.onClickButtonSave(json);
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

    let title = L('Income');
    if(this.props.customType === 'expense') title = L('Expense');

    let bottomButton;

    if(this.props.showRemove)
    {
      bottomButton = 
      <View style={{}}>
        <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Save')}
         onPress={()=>this.handleSave()}></Button>
        <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} accent raised uppercase text={L('Remove')}
         onPress={()=>this.handleRemove()}></Button>
      </View>
    }else
    {
      bottomButton = 
      <View style={{}}>
        <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Save')}
         onPress={()=>this.handleSave()}></Button>
      </View>
    }

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Custom Type') + ':'}</Text>
            <View style={{padding:15}}>
              <Text style ={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{title.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <View style={{flex:1}}>
            <ScrollView style={{backgroundColor:lib.THEME_COLOR_LIGHTGREY}}>
                <View style={{height:90, padding:10, paddingTop:0, paddingBottom:20}}>
                  <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, height:40, paddingTop:10}}>
                    {L('New Category Name')}
                  </Text>
                  <TextInput
                      underlineColorAndroid='transparent'
                      style={{
                        fontSize:lib.THEME_FONT_MEDIUM,
                        color:lib.THEME_COLOR_BLACK,
                        backgroundColor:'white',
                        borderColor:lib.THEME_COLOR_BLACK,
                        borderWidth:1
                      }}
                      placeholderTextColor={lib.THEME_COLOR_GREY}
                      value={this.state.label}
                      placeholder={L('<Set New Category Name>')}
                      onChangeText={(text) => this.setState({label:text})}
                  />
                </View>
                <View style={{height:15}}><Text></Text></View>
             </ScrollView>
          </View>
          {bottomButton}
      </View>
    );
  }
}

export default Screen;
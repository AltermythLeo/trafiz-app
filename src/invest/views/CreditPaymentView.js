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
  DatePickerAndroid,
  Keyboard,
  ScrollView,
  Alert,
  Picker
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button , Checkbox} from 'react-native-material-ui';
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
      notes:'',
      amount:'',
      paidoff:0,
      trxdate:lib.selectedDate,
      isKeyboardOpen:false,
      readOnly:false
    }
  }

  componentWillMount()
  {
      this._keyboardDidHide = this._keyboardDidHide.bind(this);
      this._keyboardDidShow = this._keyboardDidShow.bind(this);
      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow () {
    this.setState({isKeyboardOpen:true});
  }

  _keyboardDidHide () {
    this.setState({isKeyboardOpen:false});
  }

  componentDidMount() {

    const initialData = this.props.initialData;
    if(initialData) {
      initialData.readOnly = true;
      this.setState(initialData);
    }
  }

  handleRemove()
  {
    Alert.alert('',
      L('Delete <incomeorexpense>?').replace('<incomeorexpense>', L('this entry')),
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

  retrieveJson() {

    const json = {
      notes:this.state.notes,
      amount:lib.toNumber(this.state.amount),
      trxdate:this.state.trxdate,
      paidoff:this.state.paidoff
    }

    const fieldName = {
      amount:'Payment Amount'
    }
    
    //insert needed field to update values
    if(this.props.initialData)
    {
      let initialData   = this.props.initialData;
      json.offlineID    = initialData.offlineID;
      json.trxdate      = this.state.trxdate;
      json.ts           = moment(this.state.trxdate).unix();;
      json.giveCreditOfflineID    = initialData.giveCreditOfflineID;
      json.trafizPayloanOfflineID = initialData.trafizPayloanOfflineID;
    }else
    {
      //check if trx is today, add missing hour and minutes
      const issame = moment().isSame(moment(json.trxdate), 'day')
      console.warn(issame ? "Date NOT Changed" : "Date changed");
      if(issame)
      {
        json.trxdate = moment().format("YYYY-MM-DD HH:mm:ss");
      }
    }

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

    return json;
  }

  onAmountChanged(num)
  {
    num = lib.toNumber(num);
    num = 'Rp ' + lib.toPrice(num);
    this.setState({amount:num});
  }

  handleSave(remove = false) {
    const json = this.retrieveJson();
    if(json) 
    {
      json.remove = remove;
      this.props.onClickButtonSave(json);
    }
  }

  togglePaidoff() {
    let paidoff = this.state.paidoff;
    if(paidoff === 1) paidoff = 0;
    else paidoff = 1;
    this.setState({paidoff});
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

    let checked = false;
    if(this.state.paidoff === 1) checked = true;

    let btn = null;
    if(this.state.isKeyboardOpen == false)
    {
      if(!this.props.initialData) {
        btn = 
          <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Save')}
                onPress={()=>this.handleSave()}>
          </Button>
      }else
      {
        btn = 
          <View style={{}}>
            <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Save')}
             onPress={()=>this.handleSave()}></Button>
            <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} accent raised uppercase text={L('Remove')}
             onPress={()=>this.handleRemove()}></Button>
          </View>
      }
    }

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
              {L('Income Type') + ':'}
            </Text>
            <View style={{padding:15}}>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Account Receivable Payment').toUpperCase()}</Text>
              <Text />
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{this.props.giveCreditLabel}</Text>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>Rp {lib.toPrice(this.props.giveCreditAmount)}</Text>
            </View>

          </View>
        </View>
        <View style={{flex:1}}>
              <ScrollView keyboardShouldPersistTaps={'always'} style={{backgroundColor:lib.THEME_COLOR_LIGHTGREY}}>
              <View style={styles.container}>
                  <Text style={styles.label}>{L('Payment Date')}</Text>
                  <TextInput
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholder={L('<Set Payment Date>')}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={moment(this.state.trxdate).format("DD MMMM YYYY")}
                    onChangeText={(text) => console.log('')}
                    onFocus={(text) => this.SelectTrxDate()}
                  />
                </View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Payment Amount')}</Text>
                  <TextInput
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    placeholder={L('<Set Payment Amount>')}
                    value={'Rp ' + lib.toPrice(lib.toNumber(this.state.amount))}
                    keyboardType='numeric'
                    onChangeText={(text) => this.onAmountChanged(text)}
                  />
                </View>
                <View style={styles.spacer}></View>
                <View style={{height:120, padding:10, paddingTop:0, paddingBottom:20}}>
                  <Text style={styles.label}>{L('Remark')}</Text>
                  <TextInput
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={this.state.notes}
                    multiline={true}
                    textAlignVertical='top'
                    placeholder={L('<Set Miscellanous Note>')}
                    onChangeText={(text) => this.setState({notes:text})}
                  />
                </View>

                <View style={styles.spacer}></View>
                <View style={{height:70}}>
                  <View style={{height:70, flexDirection:'row'}}>
                    <View style={{width:40}}>
                      <Checkbox label='' value='' checked={checked} onCheck={()=>this.togglePaidoff()}/>
                      <View style={{height:40}}></View>
                    </View>
                    <View style={{width:10}} />
                    <View style={{flex:1, height:65, paddingTop:3}}>
                      <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('Paid')} </Text>
                      <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{L('With this payment, the loan is paid off')} </Text>
                    </View>
                  </View>
                </View>
             </ScrollView>
          </View>
          <View style={{}}>
            {btn}
          </View>
      </View>
    );
  }

  SelectTrxDate() {
    let cur = moment();
    
    DatePickerAndroid.open({
      date: cur.toDate()
    })
    .then(result=>{
      if(result.action !== DatePickerAndroid.dismissedAction) {
        const year = result.year;  
        const month = result.month;  
        const day = result.day;
        const d = new Date(year, month, day);
        const m = moment(d);
        const str = m.format('YYYY-MM-DD');
        this.setState({
          trxdate:str
        });

      }
    });
  }
}

export default Screen;
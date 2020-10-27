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
  Keyboard,
  Alert,
  DatePickerAndroid,
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
      cashAmount:'',
      weight:'',
      grade:'A',
      selectedFish:'',
      readOnly:false,
      isKeyboardOpen:false,
      trxdate:lib.selectedDate,
      notes:''
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

    const viewData = this.props.viewData;
    if(viewData) {
      this.setState({
        cashAmount:'Rp ' + lib.toPrice(lib.toNumber(viewData.amount)),
        weight:viewData.weight,
        grade:viewData.grade,
        selectedFish:viewData.fishOfflineID,
        trxdate:viewData.trxdate,
        readOnly:true
      });
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
    let json = {
      price:lib.toNumber(this.state.cashAmount),
      weight:this.state.weight,
      grade:this.state.grade,
      fishOfflineID:this.state.selectedFish,
      trxdate:this.state.trxdate,
      notes:this.state.notes
    }

    //TODO : Splitfish table has no Grade field?
    if(json.grade == null || json.grade == undefined)
      json.grade = 'A';

    //insert needed field to update values
    if(this.props.viewData)
    {
      let viewData      = this.props.viewData;
      json.offlineID    = viewData.offlineID;
      json.trxdate      = this.state.trxdate;
      json.ts           = moment(this.state.trxdate).unix();;
      json.isQuickSell  = viewData.isQuickSell;
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

    const fieldName = {
      price:L('Fish Price'),
      weight:L('Fish Weight'),
      grade:L('Fish Grade'),
      fishOfflineID:L('Fish Species')
    }
    
    for (let key in fieldName) {
      if (fieldName.hasOwnProperty(key)) {
        const val = json[key];
        if(val.length == 0) 
        {
          const errMsg = fieldName[key]+ ' ' + L('must be set');
          this.setState({errMsg});
          return null;
        }
      }
    }

    return json;
  }

  handleSave(remove = false) {
    const json = this.retrieveJson();
    if(json) 
    {
      json.remove = remove;
      this.props.onClickButtonSave(json);
    }
  }

  handleSaveAndSell() {    
    const json = this.retrieveJson();
    if(json) this.props.onClickButtonSaveAndSell(json);
  }

  onAmountChanged(num)
  {
    num = lib.toNumber(num);
    num = 'Rp ' + lib.toPrice(num);
    this.setState({cashAmount:num});
  }

  onWeightChanged(num)
  {
    num = num.replace(/^0+/, '')
    this.setState({weight:num});
  }

  onSelectGrade(item, index)
  {
    this.setState({grade:item});
  }

  onSelectFish(item, index)
  {
    this.setState({selectedFish:item});
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

    let sortedRows = this.props.fishes;

    //rev 03022020 : make fields editable
    let btn = null;
    if(this.state.isKeyboardOpen == false)
    {
      if(!this.props.viewData) {
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

    console.warn(this.state.trxdate);

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white', elevation:1}}>
          {errorIndicator}

          <View style={{padding:10, borderBottomColor:'gainsboro', borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
              {L('Income Type') + ':'}
            </Text>
            <Text style={{padding:15, fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
              {L('Sell Catch').toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={{flex:1}}>
            <ScrollView keyboardShouldPersistTaps={'always'} style={{backgroundColor:lib.THEME_COLOR_LIGHTGREY}}>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Transaction Date')}</Text>
                  <TextInput
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholder={L('<Set Transaction Date>')}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={moment(this.state.trxdate).format("DD MMMM YYYY")}
                    onChangeText={(text) => console.log('')}
                    onFocus={(text) => this.SelectTrxDate()}
                  />
                </View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Set Fish Price')} </Text>
                  <TextInput
                      underlineColorAndroid='transparent'
                      style={styles.box}
                      placeholder={L('<Set Fish Price>')}
                      placeholderTextColor={lib.THEME_COLOR_GREY}
                      value={this.state.cashAmount}
                      keyboardType='numeric'
                      onChangeText={(text) => this.onAmountChanged(text)}
                  />
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                    <Text style={styles.label}>{L('Fish Species Type')} </Text>
                    <View style={styles.box}>
                      <Picker
                        placeHolder={L('<Choose Fish Species>')}
                        selectedValue={this.state.selectedFish}
                        onValueChange={(item, idx) => this.onSelectFish(item, idx)}
                      >
                      <Picker.Item label={L('<Choose Fish Species>')} value=''/>
                      {sortedRows.map((obj,index)=>{
                        return <Picker.Item key={index} label={obj.label} value={obj.value} />;
                      })}
                      </Picker>
                    </View>
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                    <Text style={styles.label}>{L('Weight KG')} </Text>
                    <TextInput
                      underlineColorAndroid='transparent'
                      style={styles.box}
                      placeholder={L('<Set Fish Weight>')}
                      placeholderTextColor={lib.THEME_COLOR_GREY}
                      value={this.state.weight}
                      keyboardType='numeric'
                      onChangeText={(text) => this.setState({weight:text})}
                    />
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                    <Text style={styles.label}>{L('Grade')} </Text>
                    <View style={styles.box}>
                      <Picker
                        selectedValue={this.state.grade}
                        onValueChange={(item, idx) => this.onSelectGrade(item, idx)}
                      >
                        <Picker.Item label={L('Good/Whole')} value='A' />
                        <Picker.Item label={L('Reject')}  value='C' />
                      </Picker>
                    </View>
                </View>
                <View style={styles.spacer}><Text></Text></View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Notes')}</Text>
                  <TextInput
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    value={this.state.notes}
                    multiline={true}
                    textAlignVertical='top'
                    placeholder={L('<Set Miscellanous Note>')}
                    onChangeText={(text) => this.setState({notes:text})}
                  />
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.spacer}></View>

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
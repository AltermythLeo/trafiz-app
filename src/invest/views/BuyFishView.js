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
  Keyboard,
  Alert,
  DatePickerAndroid
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import { AsyncStorage } from "react-native";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import Autocomplete from 'react-native-autocomplete-input';

const OldTrafizHelper = require('../OldTrafizHelper');
const lib = require('../../lib');
const L = require('../../dictionary').translate;
const Gears = require('../../Gears');

const styles = StyleSheet.create(
  {
    box:{
      fontSize:lib.THEME_FONT_MEDIUM,
      color:lib.THEME_COLOR_BLACK,
      backgroundColor:'white',
      borderColor:lib.THEME_COLOR_BLACK,
      borderWidth:1
    },
    autocompleteContainer: {
      backgroundColor:'transparent',
      borderColor:lib.THEME_COLOR_BLACK,
      flex: 1,
      left: 10,
      position: 'absolute',
      right: 10,
      top: 40,
      zIndex: 1
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
      fishermanName:'',
      fishingGround:'',
      portName:'',
      cashAmount:'',
      weight:'',
      grade:'A',
      selectedFish:'',
      selectedShip:'',
      purchaseDate:lib.selectedDate,
      landingDate:lib.selectedDate,
      notes:'',
      history:[],
      autoCompleteOpen:true,
      isKeyboardOpen:false,
      readOnly:false
    }
    this.gradeSelect = React.createRef();
    this.loadHistory();
  }

  componentDidMount() {
//    const defaultSelectedShip = this.props.defaultSelectedShip;
    this.setState({selectedShip:''});
    const initialData = this.props.initialData;
    if(initialData) {
      initialData.readOnly = true;
      this.setState(initialData);
      this.setState({purchaseDate:initialData.trxdate});
    }else
      this.setState({selectedShip:''});
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
    console.warn('Keyboard Open');
    this.setState({isKeyboardOpen:true});
  }

  _keyboardDidHide () {
    console.warn('Keyboard Close');
    this.setState({isKeyboardOpen:false});
  }

  loadHistory()
  {
      // fetch the data back asyncronously
      _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('history');
            if (value !== null) {
                // Our data is fetched successfully
                let _history = value.split(',');
                //this.setState({history,_history});
                this.state.history = _history;
            }
        } catch (error) {
            // Error retrieving data
            console.warn(error);
        }
      }
      _retrieveData();
  }

  AddHistory(newPort)
  {
    if(_.findIndex(this.state.history, function(o) { return o == newPort; }) >= 0)
      return;

    let historyString = newPort;

    //limit History to 3
    for(let i = 0; i < this.state.history.length; i++)
    {
      if(this.state.history[i] == '' || this.state.history[i] == null || this.state.history[i] == undefined)
        continue;
      historyString += ',';
      historyString += this.state.history[i];
      if(i >= 3) break;
    }
    // create a function that saves your data asyncronously
    _storeData = async () => {
      try {
          await AsyncStorage.setItem('history', historyString);
      } catch (error) {
          // Error saving data
          console.warn(error);
      }
    }  
    _storeData();
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
    const cashAmount = lib.toNumber(this.state.cashAmount);
    const json = {
      fishermanName:this.state.fishermanName,
      fishingGround:this.props.mapValue,
      portName:this.state.portName,
      price:cashAmount,
      weight:this.state.weight,
      grade:this.state.grade,
      fishOfflineID:this.state.selectedFish,
      shipOfflineID:this.props.selectedShip,
      landingDate:this.state.landingDate,
      purchaseDate:this.state.purchaseDate,
      notes:this.state.notes
    }

    //check if trx is today, add missing hour and minutes
    const issame = moment().isSame(moment(json.purchaseDate), 'day')
    console.warn(issame ? "Date Changed" : "Date not changed");
    if(issame)
    {
      json.purchaseDate = moment().format("YYYY-MM-DD HH:mm:ss");
    }

    const fieldName = {
      fishOfflineID:L('Fish Species'),
      weight:L('Fish Weight'),
      shipOfflineID:L('Ship')
    }

    for (let key in fieldName) {
      if (fieldName.hasOwnProperty(key)) {
        const val = json[key];
        if(!val || val.length == 0) {
          const errMsg = fieldName[key]+ ' ' + L('must be set');
          this.setState({errMsg});
          return null;
        }
      }
    }

    this.AddHistory(this.state.portName);
    return json;
  }

  handleSave(remove = false) {
    const json = this.retrieveJson();
    let offlineID = null;
    let catchOfflineID = null;
    let trxdate = null;
    let ts = null;

    //not the most elegant way, but it works
    //maybe bundle all the needed data inside json instead?
    if(this.props.initialData)
    {
      offlineID = this.props.initialData.hasOwnProperty('offlineID') ? this.props.initialData.offlineID : null;
      catchOfflineID = this.props.initialData.hasOwnProperty('catchOfflineID') ? this.props.initialData.catchOfflineID : null;
      trxdate = this.state.purchaseDate//;this.props.initialData.hasOwnProperty('trxdate') ? this.props.initialData.trxdate : null;
      ts      = moment(this.state.purchaseDate).unix();//;this.props.initialData.hasOwnProperty('ts')      ? this.props.initialData.ts : null;
    }

    console.warn(trxdate, ts);
    if(json) 
    {
      json.remove = remove;
      this.props.onClickButtonSave(json, offlineID, catchOfflineID, trxdate, ts);
    }
  }

  handleSaveAndSell() {    
    const json = this.retrieveJson();
    if(json) 
    {
        if(this.props.initialData)
        {
          json.offlineID      = this.props.initialData.hasOwnProperty('offlineID') ? this.props.initialData.offlineID : null;
          json.catchOfflineID = this.props.initialData.hasOwnProperty('catchOfflineID') ? this.props.initialData.catchOfflineID : null;
          json.trxdate        = this.props.initialData.hasOwnProperty('trxdate') ? this.props.initialData.trxdate : null;
          json.ts             = this.props.initialData.hasOwnProperty('ts')      ? this.props.initialData.ts : null;
        }
        this.props.onClickButtonSaveAndSell(json);
    }
  }

  handleDelete() {    
    const json = this.retrieveJson();
    if(json) this.props.onClickButtonDelete(json);
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

    const sortedRows = this.props.fishes;
    const ships = this.props.ships;
    const selectedShip = (this.props.selectedShip !== null && this.props.selectedShip != '' && this.props.selectedShip != undefined ? this.props.selectedShip : this.state.selectedShip);
    let shipLabel = L('<Choose Vessel>');
    const index = _.findIndex(ships, function(o) 
      { 
        return o.idshipoffline === selectedShip; 
      }
    );
    
    //pre-fill in ship field
    if(index >= 0)
        shipLabel = ships[index].vesselname_param + '(' + Gears.getName(ships[index].vesselgeartype_param) +')';
    
    const editable = true;
    let btn = null;

    //rev 03022020 : make fields editable, but for this screen, only show save button
    //rev 02032020 : hide sticky button when keyboard shown
    if(this.state.isKeyboardOpen == false)
    {
      if(!this.state.readOnly) {
        btn = 
          <View>
            <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} raised uppercase text={L('Set Sell Price')} onPress={()=>this.handleSaveAndSell()} />
            <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('Save')} onPress={()=>this.handleSave()} />
          </View>
        ;
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

          <View style={{padding:10, borderBottomColor:lib.THEME_COLOR_LIGHTGREY, borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold', fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
              {L('Expense Type') + ':'}
            </Text>
            <Text style={{padding:15, fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
              {L('Buy Catch').toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={{flex:1}}>
            <ScrollView keyboardShouldPersistTaps={'always'} style={{backgroundColor:lib.THEME_COLOR_LIGHTGREY}}>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Purchase Date')}</Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholder={L('<Set Purchase Date>')}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={moment(this.state.purchaseDate).format("DD MMMM YYYY")}
                    onChangeText={(text) => console.log('')}
                    onFocus={(text) => this.SelectPurchaseDate()}
                  />
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                    <Text style={styles.label}>{L('Fish Species Type') +' ('+ L('mandatory')+')'} </Text>
                    <View style={styles.box}>
                      <Picker
                        enabled={editable}
                        placeHolder={L('<Choose Fish Species>')}
                        selectedValue={this.state.selectedFish}
                        onValueChange={(item, idx) => {this.onSelectFish(item, idx)}}
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
                <Text style={styles.label}>{L('Weight KG') + ' ('+L('mandatory')+')'}</Text>
                  <TextInput
                    editable={editable}
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
                        enabled={editable}
                        selectedValue={this.state.grade}
                        onValueChange={(item, idx) => {this.onSelectGrade(item, idx)}}
                      >
                        <Picker.Item label={L('Good/Whole')} value='A' />
                        <Picker.Item label={L('Reject')}  value='C' />
                      </Picker>
                    </View>
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Fisherman name')}</Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholder={L('<Set Fisherman\'s Name>')}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={this.state.fishermanName}
                    onChangeText={(text) => this.setState({fishermanName:text})}
                  />
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Fishing Ground')}</Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholder={L('<Set Fishing Ground>')}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={this.props.mapValue}
                    onChangeText={(text) => console.log('')}
                    onFocus={(text) => this.props.onOpenMap()}
                  />
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                <Text style={styles.label}>{L('Ship (Gear Type)')} </Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholder={L('<Choose Vessel>')}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={shipLabel}
                    onChangeText={(text) => console.log('')}
                    onFocus={(text) => this.props.onOpenShipSelect()}
                  />
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Landing Date')}</Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholder={L('<Set Landing Date>')}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={moment(this.state.landingDate).format("DD MMMM YYYY")}
                    onChangeText={(text) => console.log('')}
                    onFocus={(text) => this.SelectLandingDate()}
                  />
                </View>
                <View style={styles.spacer}></View>

                <View style={styles.container}>
                  <Text style={styles.label}>{L('Port Name')}</Text>
                  <View style={styles.autocompleteContainer}>
                    <Autocomplete
                      editable={editable}
                      hideResults={!this.state.open}
                      underlineColorAndroid='transparent'
                      style={styles.box}
                      placeholder={L('<Set Port Name>')}
                      placeholderTextColor={lib.THEME_COLOR_GREY}
                      value={this.state.portName}
                      onFocus={()=>this.setState({open:true})}
                      onChangeText={(text) => this.setState({portName:text, open:true})}
                      onEndEditing={()=>this.setState({open:false})}
                      renderItem={({ item, i }) => (
                        <TouchableOpacity onPress={() => 
                        {
                          this.setState({ portName: item , open:false});
                          
                        }}>
                          <Text style={styles.label}>{item}</Text>
                        </TouchableOpacity>)}
                      />
                    </View>
                </View>
                <View style={styles.spacer}></View>
                <View style={styles.container}>
                  <Text style={styles.label}>{L('Price')}</Text>
                  <TextInput
                    editable={editable}
                    underlineColorAndroid='transparent'
                    style={styles.box}
                    placeholder={L('<Set Fish Price>')}
                    placeholderTextColor={lib.THEME_COLOR_GREY}
                    value={'Rp ' + lib.toPrice(lib.toNumber(this.state.cashAmount))}
                    keyboardType='numeric'
                    onChangeText={(text) => this.onAmountChanged(text)}
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
                <View style={styles.spacer}></View>
                <View style={styles.spacer}></View>
                <View style={styles.spacer}>
                  <Text></Text>
                </View>
             </ScrollView>
          </View>
          <View style={{borderColor:lib.THEME_COLOR_BLACK, borderWidth:1}}>
            {btn}
          </View>
      </View>
    );
  }

  SelectLandingDate() {
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
          landingDate:str
        });

      }
    });
  }

  SelectPurchaseDate() {
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
          purchaseDate:str
        });

      }
    });
  }

}

export default Screen;
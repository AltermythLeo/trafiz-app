import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  DatePickerAndroid,
  Image,
  TextInput
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';

const lib = require('../../lib');
const L = require('../../dictionary').translate;

class ListScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show:'busy',
      filter:'',
      refreshing:false,
      dateFilter:moment().format('DD MMMM YYYY')
    }
  }

  componentDidMount() {
    Promise.resolve()
    .then(result=>{
      this.setState({show:'list'});
    })
  }

  refreshList() {
    this.props.onRefreshRows();
  }

  handleAddIncome() {
    lib.selectedDate = this.state.dateFilter;
    console.warn (this.state.dateFilter);
    this.props.onClickButtonMoneyIn();
  }

  handleAddExpense() {
    lib.selectedDate = this.state.dateFilter;
    console.warn (this.state.dateFilter);
    this.props.onClickButtonMoneyOut();
  }

  nextDay(next) {
    const cur = moment(this.state.dateFilter,'DD MMMM YYYY');
    if(!next) {
      const prevDay = cur.subtract(1, 'd');
      const prevDayStr = prevDay.format('DD MMMM YYYY');
      this.setState({dateFilter:prevDayStr});

      this.props.onChangeDate(prevDayStr);
    } else {
      const today = moment().format('DD MMMM YYYY');
      if(today == this.state.dateFilter) return;
      const nextDay = cur.add(1, 'd');
      const nextDayStr = nextDay.format('DD MMMM YYYY');
      this.setState({dateFilter:nextDayStr});

      this.props.onChangeDate(nextDayStr);
    }
  }

  showCalendar() {
    const cur = moment(this.state.dateFilter,'DD MMMM YYYY');

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
        const str = m.format('DD MMMM YYYY');
        this.setState({
          dateFilter:str
        });

        this.props.onChangeDate(str);
      }
    });
  }

  truncateText(txt)
  {
    const maxLength = 20;
    return txt.length > maxLength ? (txt.substr(0, maxLength) + '...') : txt;
  }

  renderItem(item,index) {
    const label = this.truncateText(item.labelValue);
    const hour = item.hourValue;
    const total = item.transValue;
    let textColor = (total > 0 ? lib.THEME_COLOR_GREEN : lib.THEME_COLOR_RED);
    return (
      <TouchableOpacity style={{}} onPress={()=>this.props.onClickRow(item)}>
        <View style={{padding:10,
          flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:5,
          alignItems:'center'}}>
            <View style={{width:60}}>
              <Text style={{color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}}>{hour}</Text>
            </View>
            <View style={{flex:1}}>
              <Text numberOfLines={1} 
                    style={{flex:1, textAlignVertical:'center', fontSize:lib.THEME_FONT_MEDIUM, fontWeight:'bold', color:lib.THEME_COLOR_BLACK}}>
                {label}
              </Text>
            </View>
            <View style={{width:10}}>

            </View>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <Text style={{color:textColor, fontSize:lib.THEME_FONT_MEDIUM}}>Rp {lib.toPrice(total)}</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    const dateFilter = this.state.dateFilter;
    const sorted = this.props.rows;
    _.remove(sorted,{trxoperation:'D'})

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <TouchableOpacity onPress={()=>this.nextDay(false)}>
            <View style={{padding:15}}><FontAwesome name='arrow-left' size={25} /></View>
          </TouchableOpacity>
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity onPress={()=>this.showCalendar()}>
              <Text style={{color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}} >{dateFilter}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={()=>this.nextDay(true)}>
            <View style={{padding:15}}><FontAwesome name='arrow-right' size={25} /></View>
          </TouchableOpacity>
        </View>

        <View style={{backgroundColor:'gainsboro',height:10}} />

        <View style={{backgroundColor:'white', elevation:1, padding:10}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}}>{L('Income')+' :'}</Text>
            <Text style={{color:lib.THEME_COLOR_GREEN, fontSize:lib.THEME_FONT_MEDIUM}}>Rp {lib.toPrice(this.props.totalIN)}</Text>
          </View>
          <Text/>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}}>{L('Expense')+' :'}</Text>
            <Text style={{color:lib.THEME_COLOR_RED, fontSize:lib.THEME_FONT_MEDIUM}}>Rp {lib.toPrice(this.props.totalOUT)}</Text>
          </View>
          <Text/>

          <View style={{backgroundColor:'gainsboro',height:1}} />
          <Text/>

          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}}>{L('Today profit/loss') + ' :'}</Text>
            <Text style={{fontWeight:'bold', color:this.props.total > 0 ? lib.THEME_COLOR_GREEN : lib.THEME_COLOR_RED, fontSize : lib.THEME_FONT_MEDIUM}}>
              Rp {lib.toPrice(this.props.total)}
            </Text>
          </View>
        </View>
        <View style={{backgroundColor:'gainsboro',height:10}} />
        <View style={{flex:1}}>
          <FlatList
            onRefresh={()=>this.refreshList()}
            refreshing={this.props.refreshing}            
            data={sorted}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
        <View style={{backgroundColor:'gainsboro',height:1}} />

        <View style={{borderColor:'gray', borderWidth:1, height:50, borderBottomWidth:0}}>
          <TouchableOpacity style={{}} onPress={()=>this.handleAddIncome()}>
            <View style={{justifyContent:'center', alignItems:'center', height:50}}>
                <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_GREEN, fontSize:lib.THEME_FONT_LARGE}}>{'+' + L('Income').toUpperCase()}</Text>                
            </View>
          </TouchableOpacity>
        </View>
        <View style={{borderColor:'gray', borderWidth:1, height:50}}>
          <TouchableOpacity style={{}} onPress={()=>this.handleAddExpense()}>
            <View style={{justifyContent:'center', alignItems:'center', height:50}}>
                <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_RED, fontSize:lib.THEME_FONT_LARGE}}>{'+' + L('Expense').toUpperCase()}</Text>                
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default ListScreen;
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
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';

const lib = require('../lib');
const L = require('../dictionary').translate;
let todayProfit = 0;
let todayLoss = 0;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('TRANSACTIONS')} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

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
      this.recalculateProfitLoss();
      this.setState({show:'list'});
    })
  }

  refreshList() {
    this.setState({refreshing:true});
    this.props.actions.getLoans()
    .then(()=>{
      this.recalculateProfitLoss();
      this.setState({refreshing:false});
    })
  }

  recalculateProfitLoss()
  {
    const loans = this.props.stateData.loans.slice();
    this.todayProfit = 0;
    this.todayLoss = 0;
    for(let i=0;i<loans.length;i++)
    {
      const name = loans[i].name;
      if(!name || name.length == 0) continue;
      this.todayLoss += Number(loans[i].estimateTotalLoan);
    }
  }

  handleAddIncome() {
    this.props.navigation.push('TransactionListAddIncome');
  }

  handleAddExpense() {
    this.props.navigation.push('TransactionListAddExpense');
  }

  handleEdit(data) {
     console.warn("TO DO:Handle Edit");
  }

  nextDay(next) {
    const cur = moment(this.state.dateFilter,'DD MMMM YYYY');
    if(!next) {
      const prevDay = cur.subtract(1, 'd');
      const prevDayStr = prevDay.format('DD MMMM YYYY');
      this.setState({dateFilter:prevDayStr});

      this.retrieveChunk(prevDay);
    } else {
      const today = moment().format('DD MMMM YYYY');
      if(today == this.state.dateFilter) return;
      const nextDay = cur.add(1, 'd');
      const nextDayStr = nextDay.format('DD MMMM YYYY');
      this.setState({dateFilter:nextDayStr});

      this.retrieveChunk(nextDay);
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

        this.retrieveChunk(m);
      }
    });
  }

  retrieveChunk(m) {
    const now1 = moment().format('MM YYYY');
    const now2 = moment().subtract(1,'month').format('MM YYYY');
    const check = m.format('MM YYYY');

    if(check === now1 || check === now2 ) {

    } else {
      const fm = m.month() + 1;
      const fy = m.year();
      this.props.actions.getCatchFishesByMonth(fm,fy)
        .then(()=>{
          this.refreshList();
        });
    }
  }

  renderItem(item,index) {
    // console.warn(item);
    const name = item.name;
    if(!name || name.length == 0) return null;

    //Loss
    const total = item.estimateTotalLoan;
    const textColor = lib.THEME_COLOR_RED;
    this.todayLoss += total;

    //Profit

    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleEdit(item)}>
        <View style={{padding:10,
          flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:5,
          alignItems:'center'}}>
            <Text style={{width:50}}>{'14:00'}</Text>
            <Text style={{fontWeight:'bold'}}>{name}</Text>
            <View style={{flex:1}} />
            <Text style={{color:textColor}}>Rp {lib.toPrice(total)}</Text>
            <View style={{padding:15}}><FontAwesome name='arrow-right'/></View>
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

    const todayLossOrProfit = this.todayProfit - this.todayLoss;
    console.warn(this.todayLoss);
    console.warn(this.todayProfit);
    console.warn(todayLossOrProfit);
    const dateFilter = this.state.dateFilter;
    const loans = this.props.stateData.loans.slice();
    const rows = loans; // id name total
    const sorted = rows.sort(function (a, b) {
      let nameA = a.name;
      if(nameA) nameA = nameA.toLowerCase();
      let nameB = b.name;
      if(nameB) nameB = nameB.toLowerCase();
      if (nameA < nameB)
        return -1;
      if (nameA > nameB)
        return 1;
      return 0;
    });


    // filter by search
    // const filterStr = this.state.filter.toLowerCase();
    // const filteredRows = _.filter(rows, function(o) { 
    //   if(!o.name) return false;
    //   const name = o.name ? o.name : '';
    //   return (name.toLowerCase().indexOf(filterStr) > -1);
    // });

    // <View style={{paddingHorizontal:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
    //   <TextInput
    //     placeholder='Search by name..'
    //     selectionColor={lib.THEME_COLOR}
    //     underlineColorAndroid='white'
    //     value={this.state.filter}
    //     onChangeText={ (text) => this.setState({filter:text}) }
    //   />
    // </View>

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <TouchableOpacity onPress={()=>this.nextDay(false)}>
            <View style={{padding:15}}><FontAwesome name='arrow-left' size={25} /></View>
          </TouchableOpacity>
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity onPress={()=>this.showCalendar()}>
              <Text>{dateFilter}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={()=>this.nextDay(true)}>
            <View style={{padding:15}}><FontAwesome name='arrow-right' size={25} /></View>
          </TouchableOpacity>
        </View>

        <View style={{backgroundColor:'gainsboro',height:10}} />

        <View style={{backgroundColor:'white', elevation:1, padding:10}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text>{L('Income')+' :'}</Text>
            <Text style={{color:lib.THEME_COLOR_GREEN}}>{'Rp ' + lib.toPrice(this.todayProfit)}</Text>
          </View>
          <Text/>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text>{L('Expense')+' :'}</Text>
            <Text style={{color:lib.THEME_COLOR_RED}}>{'Rp ' + lib.toPrice(this.todayLoss)}</Text>
          </View>
          <Text/>

          <View style={{backgroundColor:'gainsboro',height:1}} />
          <Text/>

          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontWeight:'bold'}}>{L('Today profit/loss') + ' :'}</Text>
            <Text style={{fontWeight:'bold', color:(todayLossOrProfit > 0 ? lib.THEME_COLOR_GREEN : lib.THEME_COLOR_RED)}}>
              {'Rp ' + lib.toPrice(Math.abs(todayLossOrProfit))}
            </Text>
          </View>
        </View>
        <View style={{backgroundColor:'gainsboro',height:10}} />
        <View style={{flex:1}}>
          <FlatList
            onRefresh={()=>this.refreshList()}
            refreshing={this.state.refreshing}            
            data={sorted}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
        <View style={{backgroundColor:'gainsboro',height:1}} />

        <View style={{borderColor:'gray', borderWidth:1, height:50}}>
          <TouchableOpacity style={{}} onPress={()=>this.handleAddIncome()}>
            <View style={{justifyContent:'center', alignItems:'center', height:50}}>
                <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_GREEN}}>{'+' + L('Income').toUpperCase()}</Text>                
            </View>
          </TouchableOpacity>
        </View>
        <View style={{borderColor:'gray', borderWidth:1, height:50}}>
          <TouchableOpacity style={{}} onPress={()=>this.handleAddExpense()}>
            <View style={{justifyContent:'center', alignItems:'center', height:50}}>
                <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_RED}}>{'+' + L('Expense').toUpperCase()}</Text>                
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;
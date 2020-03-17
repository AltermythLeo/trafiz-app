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
  DatePickerAndroid
} from 'react-native';
import _ from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as Api from './Api';
import moment from 'moment';
import RNPrint from 'react-native-print';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'busy',
      sales:[],
      catches:[],
      dateFilter:moment().format('MMMM YYYY'),
      fishermanFilter:'Not set',
      buyerFilter:'Not set'
    }
  }
  
  componentDidMount() {
    const ds = Object.assign({},this.props.stateData.deliverySheets);
    const catches = this.props.stateData.catches;
    const sales = _.toArray(ds);
    this.setState({sales:sales,catches:catches,ds:ds});

    lib.delay(1)
    .then(()=>{
      this.filterByDate();
    })
  }

  // componentWillReceiveProps(nextProps) {
  //   // You don't have to do this check first, but it can help prevent an unneeded render
  //   const ds = nextProps.stateData.deliverySheets;
  //   const catches = nextProps.stateData.catches;
    
  //   if (ds !== this.state.ds || catches !== this.state.catches) {
  //     const sales = _.toArray(ds);
  //     this.setState({sales:sales,catches:catches,ds:ds});
  
  //     lib.delay(1)
  //     .then(()=>{
  //       this.filterByDate();
  //     })
  //   }
  // }

  filterByDate(fishermanFilter,buyerFilter) {
    const hideExpense = buyerFilter ? true : false;
    const hideIncome = fishermanFilter ? true : false;

    let sales = this.state.sales.slice();
    let catches = this.state.catches.slice();

    const dateFilter = this.state.dateFilter;

    const fishermanNames = ['Not set'];
    const fishermanOrSupplierFlag = [''];
    let temp = [];
    for(let i=0;i<catches.length;i++) {
      if(catches[i].lasttransact == "D") continue;
      const check = moment(catches[i].purchasedate,'YYYY-MM-DD').format('MMMM YYYY');
      if(check == dateFilter) {
        const data = catches[i];
        let name = data.fishermanname;
        if(data.buyersuppliername) name = data.buyersuppliername;
        if( fishermanNames.indexOf(name) == -1 ) {
          fishermanNames.push(name);
          let flag = 'F';
          if(data.buyersuppliername) flag = 'S';
          fishermanOrSupplierFlag.push(flag);
        }

        if(fishermanFilter && fishermanFilter != name) {
        } else {
          temp.push(catches[i]);
        }
      }
    }
    catches = temp;
    if(hideExpense) catches = [];

    console.warn(fishermanNames);

    const catchesGroupByDay = _.groupBy(catches,(o)=>{
      const day = moment(o.purchasedate,'YYYY-MM-DD').format('DD MMMM');
      return day;
    });

    const date2sale = {};
    for (let key in catchesGroupByDay) {
      if (catchesGroupByDay.hasOwnProperty(key)) {
        const arr = catchesGroupByDay[key];
        let totBuy = 0;
        const items2 = [];
        for(let i=0;i<arr.length;i++) {
          const tot = arr[i].totalprice ? arr[i].totalprice : 0;
          const le = arr[i].loanexpense ? arr[i].loanexpense : 0;
          const oe = arr[i].otherexpense ? arr[i].otherexpense : 0;
          let buy = Number(tot) - Number(le) - Number(oe);
          if(buy < 0) buy = 0;
          totBuy += buy;
          if(buy > 2) items2.push(arr[i]);
        }
        
        date2sale[key] = {
          day:key,
          items:[],
          items2:items2,
          totBuy:totBuy,
          totSell:0
        }
      }
    }

    const buyerNames = ['Not set'];
    let items = [];
    for(let i=0;i<sales.length;i++) {
      const sale = Object.assign({},sales[i]);
      const buyerName = sale.viewData.buyerName;

      const m = moment(sale.deliverySheetData.deliveryDate,'YY-MM-DD');
      const check = m.format('MMMM YYYY');
      sale.saleDate = m.format('YYYY-MM-DD');
      sale.buyerName = buyerName;

      if(check == dateFilter) {
        if(buyerFilter && buyerFilter != buyerName) {
        } else {
          items.push(sale);
        }
        if(buyerNames.indexOf(buyerName) == -1) buyerNames.push(buyerName);
      }
    }
    console.warn(buyerNames);
    if(hideIncome) items = [];

    const groupByDay = _.groupBy(items,(o)=>{
      const m = moment(o.saleDate,'YYYY-MM-DD');
      return m.format('DD MMMM');
    });

    for (let key in groupByDay) {
      if (groupByDay.hasOwnProperty(key)) {
        const arr = groupByDay[key];
        let totBuy = 0;
        let totSell = 0;
        for(let i=0;i<arr.length;i++) {
          const item = arr[i];
          if(item.viewData.buyPrice) totBuy += Number(item.viewData.buyPrice);
          if(item.viewData.sellPrice) totSell += Number(item.viewData.sellPrice);
        }

        let newValue = date2sale[key];
        if(newValue) {
          newValue.items = arr;
          newValue.totSell = totSell;
        } else {
          newValue = {day:key,items:arr,items2:[],totBuy:0,totSell:totSell};
        }

        date2sale[key] = newValue;
      }
    }

    let totalBuy = 0;
    let totalSell = 0;
    const rows = [];
    for (let key in date2sale) {
      if (date2sale.hasOwnProperty(key)) {
        const row = date2sale[key];
        rows.push(row);
        totalBuy += row.totBuy;
        totalSell += row.totSell;
      }
    }

    const sorted = rows.sort(function (a, b) {
      const bday = moment(b.day,'DD MMMM').unix();
      const aday = moment(a.day,'DD MMMM').unix();
      return (bday-aday);
    });

    this.setState({
      show:'list',
      totalBuy:totalBuy+'',
      totalSell:totalSell+'',
      rows:sorted,
      fishermanNames,
      fishermanOrSupplierFlag,
      buyerNames
    });
  }

  selectFilterBuyer() {
    const rows = this.state.buyerNames;
    this.props.navigation.navigate('SelectScreen', {
      rows: rows,
      onReturnSelect: (text) => {
        this.setState({
          buyerFilter:text,
          fishermanFilter:'Not set'
        });
        if(text == 'Not set') return this.filterByDate(false,false);
        this.filterByDate(false,text);
      }
    });
  }

  selectFilterFisherman() {
    const names = this.state.fishermanNames;
    const flags = this.state.fishermanOrSupplierFlag;
    const rows1 = ['Not set'];
    const rows2 = ['Not set'];

    for(let i=1;i<names.length;i++) {
      if(i < flags.length) {
        const name = names[i];
        const flag = flags[i];
        if(flag == 'F') {
          rows1.push(name);
        } else if(flag == 'S') {
          rows2.push(name);
        }
      }
    }

    this.props.navigation.navigate('SaleFilterScreen', {
      rows1: rows1,
      rows2: rows2,
      onReturnSelect: (text) => {
        this.setState({
          buyerFilter:'Not set',
          fishermanFilter:text
        });
        if(text == 'Not set') return this.filterByDate(false,false);
        this.filterByDate(text,false);
      }
    });
  }

  changeMonthForReport() {
    const login = this.props.stateLogin;
    const idmssupplier = login.idmssupplier;


    DatePickerAndroid.open({
      mode: 'spinner',
      date: moment().toDate()
    })
    .then(result=>{
      if(result.action !== DatePickerAndroid.dismissedAction) {
        const year = result.year;  
        const month = result.month;  
        const day = result.day;
        const d = new Date(year, month, day);
        const m = moment(d);
        const str = m.format('MMMM YYYY');
        if(this.state.loanDateFilter !== str) {
          this.setState({
            show:'busy',
            dateFilter:str,
            fishermanFilter:'Not set',
            buyerFilter:'Not set'
          });    
          
          return this.retrieveChunk(m);
        }

        
      }
    })
    .then(result=>{
      return this.filterByDate();
    })
    .catch(err=>{
      this.setState({
        show:'list'
      });
    });
  }

  retrieveChunk(m) {
    console.warn('retrieve chunk..');
    const mEndStr = m.format('MM YYYY');
    const mEnd = moment(mEndStr,'MM YYYY');
    const mNow = moment();
    const delta = mNow.diff(mEnd,'months');
    let p = Promise.resolve();
    if(delta >= 0) {
      const cacheSavedMonth = this.props.stateData.cacheSavedMonth;
      let needRefresh = false;

      for(let i=0;i<=delta;i++) {

        p = p.then(()=>{
          const mCheck = moment().subtract(i,'month');
          const mCheckStr = mCheck.format('MM YYYY');
          const info = mCheck.format('MMMM YYYY');
          const fm = mCheck.month() + 1;
          const fy = mCheck.year();

          if(cacheSavedMonth[mCheckStr]) {
            console.warn(info+' already downloaded..');
            return;
          }

          needRefresh = true;

          return this.props.actions.getCatchFishesByMonth(fm,fy)
            .then(()=>{
              return this.props.actions.getDeliveriesByMonthYear(fm,fy);
            })
            .then(()=>{
              this.setState({busyMsg:'Download data '+info});
              console.warn(info+' downloaded..');
              return this.props.actions.flagCatchDownloaded(mCheckStr);
            });
        })

      }

      p = p.then(()=>{
        if(needRefresh) {
          return this.props.actions.getCatchFishes()
            .then(()=>{
              return this.props.actions.getExtraData();
            });
        }
      })
      .then(()=>{
        return lib.delay(1);
      })

    }

    return p;
  }

  showDetail(items,items2) {
    const hideExpense = (this.state.buyerFilter != 'Not set');
    const hideIncome = (this.state.fishermanFilter != 'Not set');

    this.props.navigation.navigate('ReportSaleTabsScreen', {
      items:items,
      items2:items2,
      hideExpense,
      hideIncome
    });
  }

  renderItem(item,index) {
    const day = item.day;
    const totBuy = lib.toPrice(item.totBuy);
    const totSell = lib.toPrice(item.totSell);

    if(item.totBuy == 0 && item.totSell == 0) return null;

    const profit = lib.toPrice(Number(item.totSell) - Number(item.totBuy));
    const hideProfit = (this.state.fishermanFilter != 'Not set' || this.state.buyerFilter != 'Not set');
    const hideExpense = (this.state.buyerFilter != 'Not set');
    const hideIncome = (this.state.fishermanFilter != 'Not set');

    const label1 = hideExpense ? null : <Text>{L('Expense:')}</Text>;
    const label2 = hideIncome ? null : <Text>{L('Income:')}</Text>;
    const label3 = hideProfit ? null : <Text>{L('Profit:')}</Text>;
    const val1 = hideExpense ? null : <Text>{'Rp '+totBuy}</Text>;
    const val2 = hideIncome ? null : <Text>{'Rp '+totSell}</Text>;
    const val3 = hideProfit ? null : <Text>{'Rp '+profit}</Text>;
    
    return (
      <TouchableOpacity onPress={()=>this.showDetail(item.items,item.items2)}>
        <View style={{padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{flex:1}}>
            <Text>{day}</Text>
          </View>
          <View style={{flex:1}}>
            {label1}
            {label2}
            {label3}
          </View>
          <View style={{flex:1,alignItems:'flex-end'}}>
            {val1}
            {val2}
            {val3}
          </View>
          <View style={{alignItems:'center',justifyContent:'center',paddingLeft:10}}>
            <FontAwesome name='arrow-right' />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  generatePdf() {
    const rows = this.state.rows;
    const totalBuy = lib.toPrice(this.state.totalBuy);
    const totalSell = lib.toPrice(this.state.totalSell);

    let profit = Number(this.state.totalSell) - Number(this.state.totalBuy);
    profit = lib.toPrice(profit);

    let html = '<html><style>table {width: 100%;}.border {border:1px solid gray;border-bottom:0;margin: 0;}td.right_cell {text-align: right;}tr.border_bottom td {border-bottom:1pt solid black;}</style><body>';

    const title = L('Transaction Report')+' - '+this.state.dateFilter;
    const title2 = L('Summary');
    const title3 = L('Daily');
    const label1 = L('EXPENSE:');
    const label2 = L('INCOME:');
    const label3 = L('PROFIT:');
    const val1 = 'Rp '+totalBuy;
    const val2 = 'Rp '+totalSell;
    const val3 = 'Rp '+profit;
  
    html += '<h2>'+title+'</h2><h4>'+title2+'</h4><table>';

    html += '<tr><td>'+label1+'</td><td class="right_cell">'+val1+'</td></tr>';
    html += '<tr class="border_bottom"><td>'+label2+'</td><td class="right_cell">'+val2+'</td></tr>';
    html += '<tr><td>'+label3+'</td><td class="right_cell">'+val3+'</td></tr>';

    html += '</table>';
    html += '<h4>'+title3+'</h4><table cellspacing="0" style="border-bottom:1px solid gray;">';

    for(let i=0;i<rows.length;i++) {
      const item = rows[i];

      const day = item.day;
      const totBuy = lib.toPrice(item.totBuy);
      const totSell = lib.toPrice(item.totSell);
  
      if(item.totBuy == 0 && item.totSell == 0) continue;
  
      const profit = lib.toPrice(Number(item.totSell) - Number(item.totBuy));

      const dt = item.day;
      const label1 = L('Expense:');
      const label2 = L('Income:');
      const label3 = L('Profit:');
      const val1 = 'Rp '+totBuy;
      const val2 = 'Rp '+totSell;
      const val3 = 'Rp '+profit;
  
      html += '<tr><td class="border">'+dt+'</td><td class="border"><table>';
      html += '<tr><td>'+label1+'</td><td class="right_cell">'+val1+'</td></tr>';
      html += '<tr class="border_bottom"><td>'+label2+'</td><td class="right_cell">'+val2+'</td></tr>';
      html += '<tr><td>'+label3+'</td><td class="right_cell">'+val3+'</td></tr>';
      html += '</table></td></tr>';
    }
    
    html += '</table>';
    html += '</body></html>';

    this.setState({show:'busy'});
    RNPrint.print({
      html: html,
      isLandscape: true
    })
    .then(file=>{
      this.setState({show:'list'});
    })
    .then(err=>{
      this.setState({show:'list'});
    })

  }

  renderSale() {
    const rows = this.state.rows;
    const totalBuy = lib.toPrice(this.state.totalBuy);
    const totalSell = lib.toPrice(this.state.totalSell);

    let profit = Number(this.state.totalSell) - Number(this.state.totalBuy);
    profit = lib.toPrice(profit);

    const change = {
      bf:this.state.buyerFilter,
      ff:this.state.fishermanFilter
    }

    const hideProfit = (this.state.fishermanFilter != 'Not set' || this.state.buyerFilter != 'Not set');
    const hideExpense = (this.state.buyerFilter != 'Not set');
    const hideIncome = (this.state.fishermanFilter != 'Not set');

    const label1 = hideExpense ? null : <Text>{L('EXPENSE:')}</Text>;
    const label2 = hideIncome ? null : <Text>{L('INCOME:')}</Text>;
    const label3 = hideProfit ? null : <Text>{L('PROFIT:')}</Text>;
    const val1 = hideExpense ? null : <Text>{'Rp '+totalBuy}</Text>;
    const val2 = hideIncome ? null : <Text>{'Rp '+totalSell}</Text>;
    const val3 = hideProfit ? null : <Text>{'Rp '+profit}</Text>;

    return (
      <View style={{flex:1,backgroundColor:'gainsboro'}}>
        <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',padding:10,justifyContent:'space-between'}}>
          <Text>{this.state.dateFilter}</Text>
          <TouchableOpacity onPress={()=>this.changeMonthForReport()}><Text style={{fontWeight:'bold'}}>{L('CHANGE')}</Text></TouchableOpacity>
        </View>
        <Text />
        <View style={{backgroundColor:'white',elevation:1,padding:10}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            {label1}
            {val1}
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            {label2}
            {val2}
          </View>
          <Text />
          <View style={{backgroundColor:'gray',height:1}} />
          <Text />
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            {label3}
            {val3}
          </View>
        </View>
        <Text />
        <View style={{flex:1,backgroundColor:'white'}}>
          <FlatList
            data={rows}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
            extraData={change}
          />
        </View>
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <Button raised text={L('PRINT')} onPress={()=>this.generatePdf()} />
        </View>
      </View>
    );
  }

  renderSaleOri() {
    const rows = this.state.rows;
    const totalBuy = lib.toPrice(this.state.totalBuy);
    const totalSell = lib.toPrice(this.state.totalSell);

    let profit = Number(this.state.totalSell) - Number(this.state.totalBuy);
    profit = lib.toPrice(profit);

    const change = {
      bf:this.state.buyerFilter,
      ff:this.state.fishermanFilter
    }

    const hideProfit = (this.state.fishermanFilter != 'Not set' || this.state.buyerFilter != 'Not set');
    const hideExpense = (this.state.buyerFilter != 'Not set');
    const hideIncome = (this.state.fishermanFilter != 'Not set');

    const label1 = hideExpense ? null : <Text>{L('EXPENSE:')}</Text>;
    const label2 = hideIncome ? null : <Text>{L('INCOME:')}</Text>;
    const label3 = hideProfit ? null : <Text>{L('PROFIT:')}</Text>;
    const val1 = hideExpense ? null : <Text>{'Rp '+totalBuy}</Text>;
    const val2 = hideIncome ? null : <Text>{'Rp '+totalSell}</Text>;
    const val3 = hideProfit ? null : <Text>{'Rp '+profit}</Text>;

    return (
      <View style={{flex:1,backgroundColor:'gainsboro'}}>
        <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',padding:10,justifyContent:'space-between'}}>
          <Text>{this.state.dateFilter}</Text>
          <TouchableOpacity onPress={()=>this.changeMonthForReport()}><Text style={{fontWeight:'bold'}}>{L('CHANGE')}</Text></TouchableOpacity>
        </View>
        <Text />
        <View style={{backgroundColor:'white',elevation:1,padding:10}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            {label1}
            {val1}
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            {label2}
            {val2}
          </View>
          <Text />
          <View style={{backgroundColor:'gray',height:1}} />
          <Text />
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            {label3}
            {val3}
          </View>
        </View>
        <Text />
        <View style={{backgroundColor:'white',elevation:1,padding:10}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text>Filter by fisherman/supplier: {this.state.fishermanFilter}</Text>
            <TouchableOpacity onPress={()=>this.selectFilterFisherman()}><Text style={{fontWeight:'bold'}}>CHANGE</Text></TouchableOpacity>
          </View>
          <View style={{height:10}} />
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text>Filter by buyer: {this.state.buyerFilter}</Text>
            <TouchableOpacity onPress={()=>this.selectFilterBuyer()}><Text style={{fontWeight:'bold'}}>CHANGE</Text></TouchableOpacity>
          </View>
        </View>
        <Text />
        <View style={{flex:1,backgroundColor:'white'}}>
          <FlatList
            data={rows}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
            extraData={change}
          />
        </View>
      </View>
    );
  }

  // <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',padding:10,justifyContent:'space-between'}}>
  //   <Text>Filter by buyer: {this.state.buyerFilter}</Text>
  //   <TouchableOpacity onPress={()=>this.changeBuyerForReport()}><Text style={{fontWeight:'bold'}}>CHANGE</Text></TouchableOpacity>
  // </View>

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
          <Text />
          <Text style={{textAlign:'center'}}>{this.state.busyMsg}</Text>
        </View>
      );
    }

    return this.renderSale();
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

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;
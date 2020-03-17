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
      loans:[]
    }
  }
  
  componentDidMount() {
    const loans = this.props.stateData.loans;
    const payloans = this.props.stateData.payloans;
    const curMonth = moment().format('MMMM YYYY');// this.getDate(loans,payloans);
    this.setState({curMonth:curMonth,loans:loans,payloans:payloans});

    lib.delay(1)
    .then(()=>{
      this.filterLoanByDate();
    })
  }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    const loans = nextProps.stateData.loans;
    const payloans = nextProps.stateData.payloans;
    
    const curMonth = this.getDate(loans,payloans);
    if (this.state.curMonth !== curMonth) return;

    if (loans !== this.state.loans || payloans !== this.state.payloans) {
      this.setState({loans:loans,payloans:payloans});

      lib.delay(1)
      .then(()=>{
        this.filterLoanByDate();
      })
    }
  }

  getDate(loans,payloans) {
    let ret = moment().format('MMMM YYYY');
    if(loans.length > 0) {
      ret = moment(loans[0].loanDate,'YYYY-MM-DD').format('MMMM YYYY');
    } else if(payloans.length > 0) {
      ret = moment(payloans[0].paidoffdate,'YYYY-MM-DD HH:mm:ss').format('MMMM YYYY');
    }

    if(ret === 'Invalid date') ret = moment().format('MMMM YYYY');
    return ret;
  }


  filterLoanByDate() {
    const loans = this.state.loans;
    let payloans = this.state.payloans.slice();

    const names = [L('All')];
    let items = [];
    for(let i=0;i<loans.length;i++) {
      const loan = loans[i];
      if(names.indexOf(loan.name) == -1) names.push(loan.name);
      const newItems = loan.items.slice();
      for(let j=0;j<newItems.length;j++) newItems[j].name = loan.name;
      items = items.concat(newItems);
    }

    // let loanDate = this.state.loanDateFilter;
    // if(items[0]) loanDate = moment(items[0].loanDate,'YYYY-MM-DD').format('MMMM YYYY');

    let loanDate = this.state.curMonth;
    let temp = [];
    for(let i=0;i<items.length;i++) {
      const check = moment(items[i].loanDate,'YYYY-MM-DD').format('MMMM YYYY');
      if( check == loanDate ) temp.push(items[i]);
    }
    items = temp;
    temp = [];
    
    for(let i=0;i<payloans.length;i++) {
      const check = moment(payloans[i].paidoffdate,'YYYY-MM-DD HH:mm:ss').format('MMMM YYYY');
      if( check == loanDate ) temp.push(payloans[i]);
    }
    payloans = temp;
    temp = [];

    let totalLoan = 0;
    let totalPaid = 0;

    for(let i=0;i<items.length;i++) {
      const item = items[i];
      totalLoan += item.total;
    }

    for(let i=0;i<payloans.length;i++) {
      const item = payloans[i];
      totalPaid += item.loaninrp;
    }
    
    const groupByDay = _.groupBy(items,(o)=>{
      const m = moment(o.loanDate,'YYYY-MM-DD');
      return m.format('DD MMMM');
    });

    const groupByDay2 = _.groupBy(payloans,(o)=>{
      const m = moment(o.paidoffdate,'YYYY-MM-DD HH:mm:ss');
      return m.format('DD MMMM');
    });

    const day2loan = {};

    for (let key in groupByDay) {
      if (groupByDay.hasOwnProperty(key)) {
        const arr = groupByDay[key];
        let totLoan = 0;
        for(let i=0;i<arr.length;i++) {
          const item = arr[i];
          totLoan += item.total;
        }
        day2loan[key] = {day:key,items:arr,items2:[],totLoan:totLoan,totPaid:0};
      }
    }

    for (let key in groupByDay2) {
      if (groupByDay2.hasOwnProperty(key)) {
        const arr = groupByDay2[key];
        let totPaid = 0;
        for(let i=0;i<arr.length;i++) {
          const item = arr[i];
          totPaid += item.loaninrp;
        }

        if(!day2loan[key]) day2loan[key] = {day:key,items:[],items2:[],totLoan:0,totPaid:0};
        day2loan[key].totPaid = totPaid;
        day2loan[key].items2 = arr;
      }
    }

    const rows = _.toArray(day2loan);

    const sorted = rows.sort(function (a, b) {
      const bday = moment(b.day,'DD MMMM').unix();
      const aday = moment(a.day,'DD MMMM').unix();
      return (bday-aday);
    });

    this.setState({
      show:'list',
      loanDateFilter:loanDate,
      loanLenderFilter:L('All'),
      loanTotalLoan:totalLoan+'',
      loanTotalPaid:totalPaid+'',
      loanRows:sorted,
      loanNames:names
    });
  }

  filterLoanByName(name) {
    console.warn(name);
    const loans = this.state.loans;
    let payloans = this.state.payloans.slice();

    let items = [];
    for(let i=0;i<loans.length;i++) {
      const loan = loans[i];
      if(name == L('All') || loan.name == name) {
        const newItems = loan.items.slice();
        for(let j=0;j<newItems.length;j++) newItems[j].name = loan.name;
        items = items.concat(newItems);  
      }
    }

    let loanDate = this.state.curMonth;
    let temp = [];
    for(let i=0;i<items.length;i++) {
      const check = moment(items[i].loanDate,'YYYY-MM-DD').format('MMMM YYYY');
      if( check == loanDate ) temp.push(items[i]);
    }
    items = temp;

    temp = [];
    for(let i=0;i<payloans.length;i++) {
      const check = moment(payloans[i].paidoffdate,'YYYY-MM-DD HH:mm:ss').format('MMMM YYYY');
      if( check == loanDate ) temp.push(payloans[i]);
    }
    payloans = temp;
    temp = [];

    let totalPaid = 0;
    let items2 = [];
    for(let i=0;i<payloans.length;i++) {
      const item = payloans[i];
      if(name == L('All') || item.nameloan == name) {
        totalPaid += item.loaninrp;
        items2.push(item);
      }
    }

    let totalLoan = 0;
    for(let i=0;i<items.length;i++) {
      const item = items[i];
      totalLoan += item.total;
    }

    const groupByDay = _.groupBy(items,(o)=>{
      const m = moment(o.loanDate,'YYYY-MM-DD');
      return m.format('DD MMMM');
    });

    const groupByDay2 = _.groupBy(items2,(o)=>{
      const m = moment(o.paidoffdate,'YYYY-MM-DD HH:mm:ss');
      return m.format('DD MMMM');
    });

    const day2loan = {};

    for (let key in groupByDay) {
      if (groupByDay.hasOwnProperty(key)) {
        const arr = groupByDay[key];
        let totLoan = 0;
        for(let i=0;i<arr.length;i++) {
          const item = arr[i];
          totLoan += item.total;
        }
        day2loan[key] = {day:key,items:arr,items2:[],totLoan:totLoan,totPaid:0};
      }
    }

    for (let key in groupByDay2) {
      if (groupByDay2.hasOwnProperty(key)) {
        const arr = groupByDay2[key];
        let totPaid = 0;
        const items2 = [];
        for(let i=0;i<arr.length;i++) {
          const item = arr[i];
          items2.push(item);
          totPaid += item.loaninrp;
        }

        if(!day2loan[key]) day2loan[key] = {day:key,items:[],items2:[],totLoan:0,totPaid:0};
        day2loan[key].totPaid = totPaid;
        day2loan[key].items2 = arr;
      }
    }

    const rows = _.toArray(day2loan);
    
    const sorted = rows.sort(function (a, b) {
      const bday = moment(b.day,'DD MMMM').unix();
      const aday = moment(a.day,'DD MMMM').unix();
      return (bday-aday);
    });
    
    // const rows = [];
    // for (let key in groupByDay) {
    //   if (groupByDay.hasOwnProperty(key)) {
    //     const arr = groupByDay[key];
    //     let totLoan = 0;
    //     let totPaid = 0;
    //     for(let i=0;i<arr.length;i++) {
    //       const item = arr[i];
    //       totLoan += item.total;
    //       if(item.strike) totPaid += item.total;
    //     }
    //     rows.push({day:key,items:arr,totLoan:totLoan,totPaid:totPaid});
    //   }
    // }

    this.setState({
      loanTotalLoan:totalLoan+'',
      loanTotalPaid:totalPaid+'',
      loanLenderFilter:name,
      loanRows:sorted
    });

  }

  changeMonthForLoanReport() {
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
        console.warn(str);
        this.setState({
          show:'busy',
          curMonth:str
        });
        // const realMonth = Number(month) + 1;
        // return Api.getLoans(idmssupplier,realMonth,year);  
      }
    })
    // .then(result=>{
    //   console.warn(result);

    //   const loans = result.loans;
    //   const payloans = result.payloans;

    //   this.setState({loans:loans,payloans:payloans});
  
    //   if(result) {
    //     this.setState({
    //       loans:loans,
    //       payloans:payloans
    //     });  
    //   }

    //   return lib.delay(500);
    // })
    .then(result=>{
      return this.filterLoanByDate()
    })
    .catch(err=>{
      this.setState({
        show:'list'
      });
    });
  }

  changeLenderForLoanReport() {
    this.props.navigation.navigate('SelectScreen', {
      rows: this.state.loanNames,
      onReturnSelect: (text) => this.filterLoanByName(text) 
    });
  }

  showDetail(items,items2) {
    this.props.navigation.navigate('ReportLoanTabsScreen', {
      loanItems:items,
      payloanItems:items2
    });
  }

  generatePdf() {
    const rows = this.state.loanRows;
    const totalLoan = lib.toPrice(this.state.loanTotalLoan);
    const totalPaid = lib.toPrice(this.state.loanTotalPaid);
    const total = lib.toPrice(this.state.loanTotalLoan-this.state.loanTotalPaid);

    let html = '<html><style>table {width: 100%;}.border {border:1px solid gray;border-bottom:0;margin: 0;}td.right_cell {text-align: right;}tr.border_bottom td {border-bottom:1pt solid black;}</style><body>';

    const title = L('Loan Report')+' '+ this.state.loanLenderFilter +' - '+this.state.curMonth;
    const title2 = L('Summary');
    const title3 = L('Daily');
    const label1 = L('LOAN:');
    const label2 = L('PAY LOAN:');
    const label3 = L('BALANCE:');
    const val1 = 'Rp '+totalLoan;
    const val2 = 'Rp '+totalPaid;
    const val3 = 'Rp '+total;
  
    html += '<h2>'+title+'</h2><h4>'+title2+'</h4><table>';

    html += '<tr><td>'+label1+'</td><td class="right_cell">'+val1+'</td></tr>';
    html += '<tr class="border_bottom"><td>'+label2+'</td><td class="right_cell">'+val2+'</td></tr>';
    html += '<tr><td>'+label3+'</td><td class="right_cell">'+val3+'</td></tr>';

    html += '</table>';
    html += '<h4>'+title3+'</h4><table cellspacing="0" style="border-bottom:1px solid gray;">';

    for(let i=0;i<rows.length;i++) {
      const item = rows[i];

      const day = item.day;
      const totLoan = lib.toPrice(item.totLoan);
      const totPaid = lib.toPrice(item.totPaid);  
      const tot = lib.toPrice(item.totLoan - item.totPaid);
  
      const dt = item.day;
      const label1 = L('Loan:');
      const label2 = L('Pay loan:');
      const label3 = L('Balance:');
      const val1 = 'Rp '+totLoan;
      const val2 = 'Rp '+totPaid;
      const val3 = 'Rp '+tot;
  
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

  renderItem(item,index) {
    const day = item.day;
    const totLoan = lib.toPrice(item.totLoan);
    const totPaid = lib.toPrice(item.totPaid);

    const tot = lib.toPrice(item.totLoan - item.totPaid);
    return (
      <TouchableOpacity onPress={()=>this.showDetail(item.items,item.items2)}>
        <View style={{padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{flex:1}}>
            <Text>{day}</Text>
          </View>
          <View style={{flex:1}}>
            <Text>{L('Loan:')}</Text>
            <Text>{L('Pay loan:')}</Text>
            <Text>{L('Balance:')}</Text>
          </View>
          <View style={{flex:1,alignItems:'flex-end'}}>
            <Text>Rp {totLoan}</Text>
            <Text>Rp {totPaid}</Text>
            <Text>Rp {tot}</Text>
          </View>
          <View style={{alignItems:'center',justifyContent:'center',paddingLeft:10}}>
            <FontAwesome name='arrow-right' />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderLoan() {
    const rows = this.state.loanRows;
    const totalLoan = lib.toPrice(this.state.loanTotalLoan);
    const totalPaid = lib.toPrice(this.state.loanTotalPaid);
    const total = lib.toPrice(this.state.loanTotalLoan-this.state.loanTotalPaid);

    return (
      <View style={{flex:1,backgroundColor:'gainsboro'}}>
        <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',padding:10,justifyContent:'space-between'}}>
          <Text>{this.state.curMonth}</Text>
          <TouchableOpacity onPress={()=>this.changeMonthForLoanReport()}><Text style={{fontWeight:'bold'}}>{L('CHANGE')}</Text></TouchableOpacity>
        </View>
        <Text />
        <View style={{backgroundColor:'white',elevation:1,padding:10}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text>{L('LOAN:')}</Text>
            <Text>Rp {totalLoan}</Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text>{L('PAY LOAN:')}</Text>
            <Text>Rp {totalPaid}</Text>
          </View>
          <Text />
          <View style={{backgroundColor:'gray',height:1}} />
          <Text />
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text>{L('BALANCE:')}</Text>
            <Text>Rp {total}</Text>
          </View>
        </View>
        <Text />
        <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',padding:10,justifyContent:'space-between'}}>
          <Text>{L('Filter by borrower:')} {this.state.loanLenderFilter}</Text>
          <TouchableOpacity onPress={()=>this.changeLenderForLoanReport()}><Text style={{fontWeight:'bold'}}>{L('CHANGE')}</Text></TouchableOpacity>
        </View>
        <View style={{flex:1,backgroundColor:'white'}}>
          <FlatList
            data={rows}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <Button raised text={L('PRINT')} onPress={()=>this.generatePdf()} />
        </View>
      </View>
    );
  }


  renderSale() {
    const rows = this.props.stateData.suppliers;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        
      </View>
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

    return this.renderLoan();
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
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
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
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
      headerTitle: (
        <Title txt={L('FISHERMAN/SUPPLIER REPORT')+' (2/2)'} />
      ),

      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'busy'
    }
  }
  
  componentDidMount() {
    const catches = this.props.stateData.catches.slice();
    const loans = this.props.stateData.loans.slice();
    const toCompare = JSON.stringify({loans,catches});

    this.setState({toCompare});

    const dateFilterStart = this.props.navigation.getParam('startDate');
    const dateFilterEnd = this.props.navigation.getParam('endDate');
    const filterName = this.props.navigation.getParam('name');
    const isSupplier = this.props.navigation.getParam('isSupplier');

    this.filterByDate(catches,loans,dateFilterStart,dateFilterEnd,filterName,isSupplier);
  }

  componentWillReceiveProps(nextProps) {
    const loans = nextProps.stateData.loans.slice();
    const catches = nextProps.stateData.catches.slice();
    const toCompare = JSON.stringify({loans,catches});
    
    if (toCompare !== this.state.toCompare) {
      this.setState({toCompare});

      lib.delay(1)
      .then(()=>{
        const dateFilterStart = this.props.navigation.getParam('startDate');
        const dateFilterEnd = this.props.navigation.getParam('endDate');
        const filterName = this.props.navigation.getParam('name');
        const isSupplier = this.props.navigation.getParam('isSupplier');
    
        this.filterByDate(catches,loans,dateFilterStart,dateFilterEnd,filterName,isSupplier);
      })
    }
  }

  filterByDate(catches,loans,dateFilterStart,dateFilterEnd,filterName,isSupplier) {
    const dateStart = dateFilterStart;
    const dateEnd = dateFilterEnd;

    let temp = [];
    for(let i=0;i<catches.length;i++) {
      if(catches[i].lasttransact == "D") continue;
      const isBetween = moment(catches[i].purchasedate).isBetween(dateStart,dateEnd,null,'[]');
      let name = catches[i].fishermanname;
      if(isSupplier) name = catches[i].buyersuppliername;
      const tp = catches[i].totalprice ? Number(catches[i].totalprice) : 0;

      if(isBetween && name == filterName && tp > 0) {
        temp.push(catches[i]);
      }
    }
    catches = temp;

    const catchesGroupByDay = _.groupBy(catches,(o)=>{
      const day = moment(o.purchasedate,'YYYY-MM-DD').format('DD MMMM');
      return day;
    });

    temp = _.find(loans,{name:filterName});
    console.warn(temp);
    loans = (temp) ? temp.items : [];
    
    temp = [];
    for(let i=0;i<loans.length;i++) {
      const loan = loans[i];
      const isBetween = moment(loan.loanDate).isBetween(dateStart,dateEnd,null,'[]');

      if(isBetween) {
        loan.name = filterName;
        temp.push(loan);
      }
    }

    loans = temp;
    console.warn(loans);
    
    const loansGroupByDay = _.groupBy(loans,(o)=>{
      const day = moment(o.loanDate,'YYYY-MM-DD').format('DD MMMM');
      return day;
    });

    const date2rows = {};
    for (let key in catchesGroupByDay) {
      if (catchesGroupByDay.hasOwnProperty(key)) {
        const arr = catchesGroupByDay[key];
        let totResult = 0;
        let totOther = 0;
        for(let i=0;i<arr.length;i++) {
          let tot = arr[i].totalprice ? arr[i].totalprice : 0;
          totResult += Number(tot);
          tot = arr[i].otherexpense ? arr[i].otherexpense : 0;
          totOther += Number(tot);
        }
        
        date2rows[key] = {
          day:key,
          items1:arr.slice(),
          items2:[],
          items3:arr.slice(),
          totResult:totResult,
          totLoan:0,
          totOther:totOther
        }
      }
    }

    for (let key in loansGroupByDay) {
      if (loansGroupByDay.hasOwnProperty(key)) {
        const arr = loansGroupByDay[key];
        let totLoan = 0;
        for(let i=0;i<arr.length;i++) {
          const tot = arr[i].total ? arr[i].total : 0;
          totLoan += Number(tot);
        }

        if(!date2rows[key]) {
          date2rows[key] = {
            day:key,
            items1:[],
            items2:[],
            items3:[],
            totResult:0,
            totLoan:0,
            totOther:0
          }            
        }
        
        date2rows[key].items2 = arr.slice();
        date2rows[key].totLoan = totLoan;
      }
    }

    let totalResult = 0;
    let totalLoan = 0;
    let totalOther = 0;
    const rows = [];
    for (let key in date2rows) {
      if (date2rows.hasOwnProperty(key)) {
        const row = date2rows[key];
        rows.push(row);
        totalResult += row.totResult;
        totalLoan += row.totLoan;
        totalOther += row.totOther;
      }
    }

    const sorted = rows.sort(function (a, b) {
      const bday = moment(b.day,'DD MMMM').unix();
      const aday = moment(a.day,'DD MMMM').unix();
      return (bday-aday);
    });

    let name = filterName + ' ('+L('FISHERMAN')+')';
    if(isSupplier) name = filterName + ' ('+L('SUPPLIER')+')';
    this.setState({
      show:'list',
      totalResult:totalResult+'',
      totalLoan:totalLoan+'',
      totalOther:totalOther+'',
      rows:sorted,
      name:name,
      dateFilterStart:moment(dateFilterStart,'YYYY-MM-DD').format('DD MMMM YYYY'),
      dateFilterEnd:moment(dateFilterEnd,'YYYY-MM-DD').format('DD MMMM YYYY'),
    });
  }

  showDetail(items1,items2,items3) {
    console.warn(items1);
    this.props.navigation.navigate('FishermanSupplierTabsScreen', {
      items2:items1,
      loanItems:items2,
      items3:items3,
    });
  }

  generatePdf() {
    const rows = this.state.rows;
    const totalResult = lib.toPrice(this.state.totalResult);
    const totalLoan = lib.toPrice(this.state.totalLoan);
    const totalOther = lib.toPrice(this.state.totalOther);

    let balance = Number(this.state.totalResult) - Number(this.state.totalLoan) - Number(this.state.totalOther);
    balance = lib.toPrice(balance);

    let html = '<html><style>table {width: 100%;}.border {border:1px solid gray;border-bottom:0;margin: 0;}td.right_cell {text-align: right;}tr.border_bottom td {border-bottom:1pt solid black;}</style><body>';

    const title = L('Fisherman/Supplier Report');
    const subtitle1 = this.state.name;
    const subtitle2 = this.state.dateFilterStart + ' - ' + this.state.dateFilterEnd;
    const title2 = L('Summary');
    const title3 = L('Daily');
    const label1 = L('TOTAL RESULT:');
    const label2 = L('TOTAL LOAN:');
    const label3 = L('TOTAL OTHER:');
    const label4 = L('BALANCE:');
    const val1 = 'Rp '+totalResult;
    const val2 = 'Rp '+totalLoan;
    const val3 = 'Rp '+totalOther;
    const val4 = 'Rp '+balance;
  
    html += '<h2>'+title+'</h2>';
    html += subtitle1+'<br />'+subtitle2+'<br />';
    html += '<h4>'+title2+'</h4><table>';

    html += '<tr><td>'+label1+'</td><td class="right_cell">'+val1+'</td></tr>';
    html += '<tr><td>'+label2+'</td><td class="right_cell">'+val2+'</td></tr>';
    html += '<tr class="border_bottom"><td>'+label3+'</td><td class="right_cell">'+val3+'</td></tr>';
    html += '<tr><td>'+label4+'</td><td class="right_cell">'+val4+'</td></tr>';

    html += '</table>';
    html += '<h4>'+title3+'</h4><table cellspacing="0" style="border-bottom:1px solid gray;">';

    for(let i=0;i<rows.length;i++) {
      const item = rows[i];

      const day = item.day;
      const totResult = lib.toPrice(item.totResult);
      const totLoan = lib.toPrice(item.totLoan); 
      const totOther = lib.toPrice(item.totOther); 
      if(item.totResult == 0 && item.totLoan == 0) continue;
  
      const dt = day;
      const label1 = L('Result:');
      const label2 = L('Loan:');
      const label3 = L('Other:');
      const val1 = 'Rp '+totResult;
      const val2 = 'Rp '+totLoan;
      const val3 = 'Rp '+totOther;
  
      html += '<tr><td class="border">'+dt+'</td><td class="border"><table>';
      html += '<tr><td>'+label1+'</td><td class="right_cell">'+val1+'</td></tr>';
      html += '<tr><td>'+label2+'</td><td class="right_cell">'+val2+'</td></tr>';
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
    const totResult = lib.toPrice(item.totResult);
    const totLoan = lib.toPrice(item.totLoan);
    const totOther = lib.toPrice(item.totOther);

    if(item.totResult == 0 && item.totLoan == 0) return null;

    const balance = lib.toPrice(Number(item.totResult) - Number(item.totBalance));

    const label1 = <Text>{L('Result:')}</Text>;
    const label2 = <Text>{L('Loan:')}</Text>;
    const label3 = <Text>{L('Other:')}</Text>;
    const val1 = <Text>{'Rp '+totResult}</Text>;
    const val2 = <Text>{'Rp '+totLoan}</Text>;
    const val3 = <Text>{'Rp '+totOther}</Text>;
    
    return (
      <TouchableOpacity onPress={()=>this.showDetail(item.items1,item.items2,item.items3)}>
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

  renderSale() {
    const rows = this.state.rows;
    const totalResult = lib.toPrice(this.state.totalResult);
    const totalLoan = lib.toPrice(this.state.totalLoan);
    const totalOther = lib.toPrice(this.state.totalOther);

    let balance = Number(this.state.totalResult) - Number(this.state.totalLoan) - Number(this.state.totalOther);
    balance = lib.toPrice(balance);

    const label1 = <Text>{L('TOTAL RESULT:')}</Text>;
    const label2 = <Text>{L('TOTAL LOAN:')}</Text>;
    const label3 = <Text>{L('TOTAL OTHER:')}</Text>;
    const label4 = <Text>{L('BALANCE:')}</Text>;
    const val1 = <Text>{'Rp '+totalResult}</Text>;
    const val2 = <Text>{'Rp '+totalLoan}</Text>;
    const val3 = <Text>{'Rp '+totalOther}</Text>;
    const val4 = <Text>{'Rp '+balance}</Text>;

    return (
      <View style={{flex:1,backgroundColor:'gainsboro'}}>
        <View style={{backgroundColor:'white',elevation:1,padding:10}}>
          <Text style={{fontWeight:'bold'}}>{this.state.name}</Text>
          <Text style={{}}>{this.state.dateFilterStart} - {this.state.dateFilterEnd}</Text>
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
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            {label3}
            {val3}
          </View>
          <Text />
          <View style={{backgroundColor:'gray',height:1}} />
          <Text />
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            {label4}
            {val4}
          </View>
        </View>
        <Text />
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

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
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
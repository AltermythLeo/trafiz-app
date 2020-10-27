import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import 'babel-polyfill';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import {PieChart} from 'react-native-chart-kit';
import CustomBarChart from '../custom-bar-chart'
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import { MyDateBtn } from '../myCtl';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('Daily Financial Report').toUpperCase()} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      errMsg:'',
      refreshing: false,
      pieChartIncomeData:{},
      pieChartExpenseData:{},
      reportData:{},
      dateFilter:moment().format('YYYY')
    }
    this.retrieveAnnualData();
  }

  retrieveAnnualData()
  {
    let reportData = {};
    let labels=[];
    let datasets=[{}];
    let datas=[];
    let ctr = 0 ;
    for(let i=0;i<12;i++)
    {
        labels[i] = (i + 1).toString();
        const p = Math.round(Math.random() * 10000) * 1000;
        const l = Math.round(Math.random() * 10000) * 1000;
        datas[ctr++] = p;
        datas[ctr++] = l;
        datas[ctr++] = p - l;
    }
    datasets[0].data = datas;
    reportData.labels = labels;
    reportData.datasets = datasets;
    reportData.title=L('Annual Financial Report').toUpperCase();
    this.state.reportData = reportData;
    this.state.pieChartExpenseData = [
      { name: L('Buy Fish'), amount: 21500000, color: 'rgba(131, 167, 234, 1)', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: L('Debt Payment'), amount: 2800000, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: L('Give Loan'), amount: 527612, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Plastik', amount: 8538000, color: 'orange', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Beli HP', amount: 11920000, color: 'rgb(0, 0, 255)', legendFontColor: '#7F7F7F', legendFontSize: 15 }
    ]
  
    this.state.pieChartIncomeData = [
      { name: L('Sell Fish'), amount: 21500000, color: 'rgba(131, 167, 234, 1)', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: L('Loan Payment'), amount: 2800000, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: L('Take Loan'), amount: 527612, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 }
    ]
  }

  componentDidMount() {

    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'form'
      });
    })
  }

  nextDay(next) {
    const cur = moment(this.state.dateFilter,'YYYY');
    if(!next) {
      const prevDay = cur.subtract(1, 'y');
      const prevDayStr = prevDay.format('YYYY');
      this.setState({dateFilter:prevDayStr});
      this.retrieveAnnualData();
      //this.retrieveChunk(prevDay);
    } else {
      const today = moment().format('YYYY');
      if(today == this.state.dateFilter) return;
      const nextDay = cur.add(1, 'y');
      const nextDayStr = nextDay.format('YYYY');
      this.setState({dateFilter:nextDayStr});
      this.retrieveAnnualData();
      //this.retrieveChunk(nextDay);
    }
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

    console.warn(this.state.reportData);
    const reportData = this.state.reportData;

    const dateFilter = this.state.dateFilter;

    const chartConfig = 
    {
        backgroundColor: 'white',
        backgroundGradientFrom: 'white',
        backgroundGradientTo: 'white',
        backgroundGradientToOpacity: 1,
        backgroundGradientFromOpacity: 1,
        fillShadowGradient:'green',
        barPercentage:0.2,
        strokeWidth:0,
        propsForBackgroundLines:{strokeDasharray:''},
        fillShadowGradientOpacity:1,
        color: () => `black`,
        colors:['green', 'red', 'orange'],
        propsForLabels:{fontSize:10},
        decimalPlaces : 0,
        style: {size:10}
    }
    
    const graphStyle = {}
    
    const width = Dimensions.get('window').width - 10;
    const height = 200;
    return (
      <View style={{flex:1}}>
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
        <View>
          <ScrollView horizontal={false} style={{backgroundColor:'white'}}>
            <View style={{flex:1, flexDirection:'row', height:30, marginLeft:50, marginTop:10}}>
              <View style={{backgroundColor:'green', width:10, marginLeft:20, marginRight:10, marginBottom:18, marginTop:3}}></View>
              <Text style={{backgroundColor:'white', textAlign:'center', fontSize:10}}>{L("INCOME")}</Text>
              <View style={{backgroundColor:'red', width:10, marginLeft:20, marginRight:10, marginBottom:18, marginTop:3}}></View>
              <Text style={{backgroundColor:'white', textAlign:'center', fontSize:10}}>{L("EXPENSE")}</Text>
              <View style={{backgroundColor:'orange', width:10, marginLeft:20, marginRight:10, marginBottom:18, marginTop:3}}></View>
              <Text style={{backgroundColor:'white', textAlign:'center', fontSize:10}}>"P/L"</Text>
            </View>
            <CustomBarChart
                width={width}
                height={height}
                data={reportData}
                chartConfig={chartConfig}
                withInnerLines={true}
                style={{}}
                fromZero={true}
                />
            <View style={{backgroundColor:'white', height:10, marginTop:8}}></View>
            <Text style={{backgroundColor:'white', textAlign:'center'}}>{L("INCOME")}</Text>
            <PieChart
                data={this.state.pieChartIncomeData}
                height={height}
                width={width}
                backgroundColor='white'
                chartConfig={chartConfig}
                accessor='amount'
                style={graphStyle}
            />
            <Text style={{backgroundColor:'white', textAlign:'center'}}>{L("EXPENSE")}</Text>
            <PieChart
                data={this.state.pieChartExpenseData}
                height={height}
                width={width}
                backgroundColor='white'
                chartConfig={chartConfig}
                accessor='amount'
                style={graphStyle}
            />
            <View style={{height:50}}></View>
          </ScrollView>
        </View>
    </View>
    );
    }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateSetting: state.Setting
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
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import 'babel-polyfill';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {PieChart, BarChart} from 'react-native-chart-kit';
import CustomBarChart from '../../custom-bar-chart'
import { Navicon, BackButton, OnlineIndicator, Title } from '../../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/AppActions';
import { MyDateBtn } from '../../myCtl';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../../lib');
const L = require('../../dictionary').translate;
const colorLookUp=['red','orange','yellow','green', 'blue', 'purple','pink','brown'];

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
      reportData:{},
      pieChartExpenseData:{},
      pieChartIncomeData:{},
      showFilter:false,
      filterData:{},
      dateFilter:moment().format('MMMM YYYY')
    }
    this.retreiveDailyData();
  }
  
  retreiveDailyData()
  {
    let reportData = {};
    let labels=[];
    let datasets=[{}];
    let datas=[];
    let ctr = 0 ;
    for(let i=0;i<31;i++)
    {
      labels[i] = i%2 == 0 ? (i + 1).toString() : '';
      const p = Math.round(Math.random() * 10000) * 1000;
      const l = Math.round(Math.random() * 10000) * 1000;
      datas[ctr++] = p;
      datas[ctr++] = l;
      datas[ctr++] = p - l;
    }
    datasets[0].data = datas;
    reportData.labels = labels;
    reportData.datasets = datasets;
    reportData.title=L('Daily Financial Report').toUpperCase();
    this.state.reportData = reportData;
    this.state.pieChartExpenseData = [
      { name: L('Buy Fish'), amount:  Math.round(Math.random() * 10000) * 1000},
      { name: L('Debt Payment'), amount:  Math.round(Math.random() * 10000) * 1000},
      { name: L('Give Loan'), amount:  Math.round(Math.random() * 10000) * 1000},
      { name: 'Plastik', amount:  Math.round(Math.random() * 10000) * 1000},
      { name: 'Beli HP', amount:  Math.round(Math.random() * 10000) * 1000}
    ]

    this.state.pieChartIncomeData = [
      { name: L('Sell Fish'), amount:  Math.round(Math.random() * 10000) * 1000},
      { name: L('Loan Payment'), amount:  Math.round(Math.random() * 10000) * 1000},
      { name: L('Take Loan'), amount:  Math.round(Math.random() * 10000) * 1000}
    ]

    //add color data & filter data manually
    let filterData={};
    ctr=0;

    filterData[ctr]={label:L('Expense'), value:true, header:true};
    ctr++;
    for(let i = 0; i < this.state.pieChartExpenseData.length; i++)
    {
      this.state.pieChartExpenseData[i].legendFontColor = lib.THEME_COLOR_BLACK;
      this.state.pieChartExpenseData[i].legendFontSize = lib.THEME_FONT_MEDIUM;
      this.state.pieChartExpenseData[i].color = colorLookUp[i%colorLookUp.length];
      filterData[ctr]={label:this.state.pieChartExpenseData[i].name, value:true, header:false};
      ctr++;
    }
  
    filterData[ctr]={label:L('Income'), value:true, header:true};
    ctr++;
    for(let i = 0; i < this.state.pieChartIncomeData.length; i++)
    {
      this.state.pieChartIncomeData[i].legendFontColor = lib.THEME_COLOR_BLACK;
      this.state.pieChartIncomeData[i].legendFontSize = lib.THEME_FONT_MEDIUM;
      this.state.pieChartIncomeData[i].color = colorLookUp[i%colorLookUp.length];
      filterData[ctr]={label:this.state.pieChartIncomeData[i].name, value:true, header:false};
      ctr++;
    }
    this.state.filterData = filterData;
}

  componentDidMount() {

    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'form'
      });
    })
  }

  onShowFilter()
  {
    const filterData = this.state.filterData;
    this.props.navigation.navigate('FinancialReportFilterScreen', {filterData});
  }

  exportToCSV()
  {
    console.warn('Export To XLS');
  }

  nextDay(next) {
    const cur = moment(this.state.dateFilter,'MMMM YYYY');
    if(!next) {
      const prevDay = cur.subtract(1, 'm');
      const prevDayStr = prevDay.format('MMMM YYYY');
      this.setState({dateFilter:prevDayStr});
      this.retreiveDailyData();
      //this.retrieveChunk(prevDay);
    } else {
      const today = moment().format('MMMM YYYY');
      if(today == this.state.dateFilter) return;
      const nextDay = cur.add(1, 'm');
      const nextDayStr = nextDay.format('MMMM YYYY');
      this.setState({dateFilter:nextDayStr});
      this.retreiveDailyData();
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
        barPercentage:0.066,
        strokeWidth:1,
        fillShadowGradientOpacity:1,
        propsForBackgroundLines:{strokeDasharray:''},
        color: () => `black`,
        colors:['green', 'red', 'orange'],
        propsForLabels:{fontSize:10},
        decimalPlaces : 0,
        style: {size:10}
      }
    
    const graphStyle = {text:{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}
    
    const width = Dimensions.get('window').width - 10;
    const height = 200;

    if(reportData===undefined)
      return null;

    return (
      <View style={{flex:1}}>
        <View style={{flex:1}}>
          <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <TouchableOpacity onPress={()=>this.nextDay(false)}>
              <View style={{padding:15}}><FontAwesome name='arrow-left' size={25} /></View>
            </TouchableOpacity>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
              <TouchableOpacity onPress={()=>this.showCalendar()}>
                <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{dateFilter}</Text>
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
                <Text style={{color:lib.THEME_COLOR_BLACK, backgroundColor:'white', textAlign:'center', fontSize:10}}>{L("INCOME")}</Text>
                <View style={{backgroundColor:'red', width:10, marginLeft:20, marginRight:10, marginBottom:18, marginTop:3}}></View>
                <Text style={{color:lib.THEME_COLOR_BLACK, backgroundColor:'white', textAlign:'center', fontSize:10}}>{L("EXPENSE")}</Text>
                <View style={{backgroundColor:'orange', width:10, marginLeft:20, marginRight:10, marginBottom:18, marginTop:3}}></View>
                <Text style={{color:lib.THEME_COLOR_BLACK, backgroundColor:'white', textAlign:'center', fontSize:10}}>"P/L"</Text>
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
              <View style={{backgroundColor:'white', height:20}}></View>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, backgroundColor:'white', textAlign:'center'}}>{L("INCOME")}</Text>
              <PieChart
                  data={this.state.pieChartIncomeData}
                  height={height}
                  width={width}
                  backgroundColor='white'
                  chartConfig={chartConfig}
                  accessor='amount'
                  style={graphStyle}
              />
              <View style={{backgroundColor:'white', height:20}}></View>
              <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, backgroundColor:'white', textAlign:'center'}}>{L("EXPENSE")}</Text>
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
      <View style={{borderColor:lib.THEME_COLOR_BLACK, borderWidth:1, height:50, backgroundColor:'white'}}>
      <TouchableOpacity style={{}} onPress={()=>this.onShowFilter()}>
        <View style={{justifyContent:'center', alignItems:'center', height:50}}>
            <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_BLACK, fontSize:lib.THEME_FONT_LARGE}}>
            {L('FILTER REPORT')}
            </Text>                
        </View>
      </TouchableOpacity>
      </View>
      <View style={{borderColor:lib.THEME_COLOR_BLACK, borderWidth:1, height:50, backgroundColor:'white'}}>
        <TouchableOpacity style={{}} onPress={()=>this.exportToCSV()}>
          <View style={{justifyContent:'center', alignItems:'center', height:50}}>
              <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_BLACK, fontSize:lib.THEME_FONT_LARGE}}>
                {L('EXPORT TO XLS')}
              </Text>                
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
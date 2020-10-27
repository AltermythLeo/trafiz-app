import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  FlatList,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  DatePickerAndroid
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import 'babel-polyfill';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import {PieChart, BarChart} from 'react-native-chart-kit';
import CustomBarChart from '../../custom-bar-chart'

const lib = require('../../lib');
const L = require('../../dictionary').translate;
const randomColor = require('randomcolor');

class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      errMsg:'',
      dateFilter:moment().format('MMMM YYYY'),
      isCurrentMonth:true,
      col1:'green',
      col2:'red',
      col3:'orange'
    }
  }
  
  componentDidMount() {


  }

  nextDay(next) {
    const cur = moment(this.state.dateFilter,'MMMM YYYY');
    if(!next) {
      const prevDay = cur.subtract(1, 'months');
      const prevDayStr = prevDay.format('MMMM YYYY');
      this.setState({dateFilter:prevDayStr, isCurrentMonth:moment().format('MMMM YYYY')==prevDayStr});

      this.props.onChangeDate(prevDayStr);

    } else {
      const nextDay = cur.add(1, 'months');
      const nextDayStr = nextDay.format('MMMM YYYY');
      this.setState({dateFilter:nextDayStr, isCurrentMonth:moment().format('MMMM YYYY')==nextDayStr});

      this.props.onChangeDate(nextDayStr);

    }
  }

  showCalendar() {
    const cur = moment(this.state.dateFilter,'MMMM YYYY');

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
        const str = m.format('MMMM YYYY');
        console.warn(str, cur);
        this.setState({
          dateFilter:str,
          isCurrentMonth: moment().format('MMMM YYYY') == str
        });

        this.props.onChangeDate(str);
      }
    });
  }

  modifyPieChartData(pieData) {
    const ret = [];
    for(let i=0;i<pieData.length;i++) {
      ret.push(pieData[i]);
      ret[i].legendFontColor = lib.THEME_COLOR_BLACK;
      ret[i].legendFontSize = lib.THEME_FONT_SMALL;
      ret[i].color = lib.colorForIndex2(i);
    }
    return ret;
  }

  renderPieChart(data, height, width, chartConfig, graphStyle)
  {
    if(data.length > 0)
    {
      return(
        <PieChart
        data={data}
        height={height}
        width={width}
        backgroundColor='white'
        chartConfig={chartConfig}
        accessor='amount'
        style={graphStyle}
    />
    );
    }else
    {
      return(
        <View height={height}>
          <View style={{alignItems:'center', height:80, justifyContent:'center'}}>
            <Text style={{paddingTop:10, fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, textAlign:'center'}}>
              {L(' (No data)')} </Text>
          </View>
        </View>
      );
    }
  }

  renderSummary(data)
  {
    data = data.datasets[0].data;
    console.warn(data);
    sortedData = [];

    if(this.state.isCurrentMonth)
      today = moment().date();
    else
      today = moment(this.state.dateFilter, "MMMM YYYY").daysInMonth() - 1;
    let week  = 0;
    let dayCtr = 0;

    sortedData[week] = {};
    sortedData[week].income  = 0;
    sortedData[week].expense = 0;
    sortedData[week].total   = 0;

    let _in = 0;
    let _out = 0;
    let _d = 0;
    for(let i = 0; i <= today * 3; i += 3)
    {
      _in  += data[i];
      _out += data[i + 1];
      _d   += data[i + 2];
      console.warn(_in, _out, _d, i, today);
    }

    for(let i = 0; i <= today * 3; i += 3)
    {
      sortedData[week].income  += data[i];
      sortedData[week].expense += data[i + 1];
      sortedData[week].total   += data[i + 2];
      dayCtr++;
      if(dayCtr >= 7)
      {
          week++;
          dayCtr  = 0;
          sortedData[week] = {};
          sortedData[week].income  = 0;
          sortedData[week].expense = 0;
          sortedData[week].total   = 0;
        }
      }
    return(
    <FlatList
      data={sortedData}
      keyExtractor={(item,index) => (''+index)}
      renderItem={({item,index}) => this.renderItem(item,index)}
    />
    );
  }

  renderItem(item, index)
  {
    let weekEnd = (index * 7 + 7);
    const monthDays = moment(this.state.dateFilter, "MMMM YYYY").daysInMonth();
    if(weekEnd > monthDays)
      weekEnd = monthDays;
    const dayLabel = (index * 7 + 1).toString() + ' - ' + weekEnd.toString() + " ";
    console.warn(item);
    return(
      <View style={{backgroundColor:'white', elevation:1, padding:10, paddingRight:15, paddingBottom:8, borderBottomColor:'gainsboro', borderBottomWidth:10}}>
          <View style={{flexDirection:'row',justifyContent:'space-between', paddingBottom:5}}>
            <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}}>{dayLabel + this.state.dateFilter}
            </Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}}>{L('Income')+' :'}</Text>
            <Text style={{color:lib.THEME_COLOR_GREEN, fontSize:lib.THEME_FONT_MEDIUM}}>Rp {lib.toPrice(item.income)}</Text>
          </View>
          <Text/>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}}>{L('Expense')+' :'}</Text>
            <Text style={{color:lib.THEME_COLOR_RED, fontSize:lib.THEME_FONT_MEDIUM}}>Rp {lib.toPrice(item.expense)}</Text>
          </View>
          <Text/>

          <View style={{backgroundColor:'gainsboro',height:1}} />
          <Text/>

          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_BLACK, fontSize : lib.THEME_FONT_MEDIUM}}>{L('Profit/Loss') + ' :'}</Text>
            <Text style={{fontWeight:'bold', color:item.total > 0 ? lib.THEME_COLOR_GREEN : lib.THEME_COLOR_RED, fontSize : lib.THEME_FONT_MEDIUM}}>
              Rp {lib.toPrice(item.total)}
            </Text>
          </View>
      </View>
    );
  }

  renderChart() {
    const reportData = this.props.reportData;
    const pieData1 = this.props.pieDataIncome;
    const pieData2 = this.props.pieDataExpense;

    const pieDataExpense = this.modifyPieChartData(pieData1);
    const pieDataIncome = this.modifyPieChartData(pieData2);

    const col1 = this.state.col1;
    const col2 = this.state.col2;
    const col3 = this.state.col3;

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
      colors:[col1,col2,col3],
      propsForLabels:{fontSize:10},
      decimalPlaces : 0,
      style: {size:10, flex: 1, flexWrap: 'wrap'}
    }
    
    const graphStyle = {text:{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}
    
    const width = Dimensions.get('window').width - 10;
    const height = 180;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <ScrollView horizontal={false} style={{backgroundColor:'white'}}>
          {this.renderSummary(reportData)}
          <View style={{backgroundColor:'white', height:20}}></View>
          <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, backgroundColor:'white', textAlign:'center'}}>{L("EXPENSE")}</Text>
          {this.renderPieChart(pieDataIncome, height, width, chartConfig, graphStyle)}
          <View style={{backgroundColor:'white', height:20}}></View>
          <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK, backgroundColor:'white', textAlign:'center'}}>{L("INCOME")}</Text>
          {this.renderPieChart(pieDataExpense, height, width, chartConfig, graphStyle)}
          <View style={{height:50}}></View>
        </ScrollView>
      </View>
    );
  }

  render() {
    let chartView = (
      <View style={{flex:1,backgroundColor:'white',alignItems:'center',justifyContent:'center'}}>
        <ActivityIndicator />
      </View>);
    if( !this.props.generatingChart ) {
      chartView = this.renderChart();
    }

    const dateFilter = this.state.dateFilter;

    return (
      <View style={{flex:1}}>
        <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <TouchableOpacity onPress={()=>this.nextDay(false)}>
            <View style={{padding:15}}><FontAwesome name='arrow-left' size={25} /></View>
          </TouchableOpacity>
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity onPress={()=>this.showCalendar()}>
            <Text style={{fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>{dateFilter.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={()=>this.nextDay(true)}>
            <View style={{padding:15}}><FontAwesome name='arrow-right' size={25} /></View>
          </TouchableOpacity>
        </View>
        {chartView}
        <View style={{borderColor:lib.THEME_COLOR_BLACK, borderWidth:1, height:50, backgroundColor:'white', borderBottomWidth:0}}>
          <TouchableOpacity style={{}} onPress={()=>this.props.onShowFilter()}>
            <View style={{justifyContent:'center', alignItems:'center', height:50}}>
              <Text style={{fontWeight:'bold', color:lib.THEME_COLOR_BLACK, fontSize:lib.THEME_FONT_LARGE}}>
              {L('FILTER REPORT')}
              </Text>                
            </View>
          </TouchableOpacity>
        </View>
        <View style={{borderColor:lib.THEME_COLOR_BLACK, borderWidth:1, height:50, backgroundColor:'white'}}>
          <TouchableOpacity style={{}} onPress={()=>this.props.exportToCSV()}>
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

export default Screen;
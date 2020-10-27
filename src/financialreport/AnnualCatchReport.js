import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import 'babel-polyfill';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import AnnualChartReportView from './views/AnnualCatchReportView';
import BusyView from '../BusyView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const SqliteInvest = require('../SqliteInvest');
const randomColor = require('randomcolor');
const oldTrafizHelper = require('../invest/OldTrafizHelper');
const SyncHelper = require('../invest/SyncHelper');

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('Annual Catch Report').toUpperCase()} size={lib.THEME_FONT_LARGE}/>
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
      generatingChart:false,
      filterData:{},
      reportData:{},
      pieChartData:[],
      hiddenLabels:[],
      dateFilter:moment().format('YYYY'),
      xlsxData:[]
    }
  }
  
  goToFilter()
  {
    const pieChartData = this.state.pieChartData;
    const hiddenLabels = this.state.hiddenLabels;

    const filterData={};
    ctr=0;

    filterData[ctr]={label:L('Species'), value:true, header:true};
    ctr++;
    for(let i=0;i<pieChartData.length;i++) {
      const label = pieChartData[i].name;
      let val = true;
      if(hiddenLabels.indexOf(label) >= 0) val = false;
      filterData[ctr]={label:label, value:val, header:false};
      ctr++;
    }

    this.props.navigation.navigate('FinancialReportFilterScreen', {
      filterData:filterData,
      onSetFilter:(data) => this.handleFilterData(data)
    });

  }

  handleFilterData(data) {
    this.setState({generatingChart:true});

    const hiddenLabels = [];
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        const obj = data[key];
        if(!obj.header) {
          const label = obj.label;
          const ok = obj.value;
          if(!ok) hiddenLabels.push(label);
        }
      }
    }

    lib.delay(10)
    .then(()=>{
      this.setState({hiddenLabels});
      return lib.delay(10);
    })
    .then(()=>{
      return this.refreshDataByDate();
    })
  }

  exportToCSV()
  {
    console.warn('Export To XLS');
    const df = moment(this.state.dateFilter,'YYYY');
    const fn = 'annualcatchreport-'+df.format('YYYY-')+moment().format('YYYYMMDDHHmm');
    this.props.navigation.push('XlsxScreen',{data:this.state.xlsxData,fn:fn});
  }

  refreshDataByDate(dateStr) {
    if(!dateStr) dateStr = this.state.dateFilter;
    this.setState({generatingChart:true,dateFilter:dateStr});
    const numMonths = 12;
    const hiddenLabels = this.state.hiddenLabels;

    const fishes = oldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
    const ids = [];
    for (let i=0;i<fishes.length;i++) {
      const label = fishes[i].label;
      const labelIndo = fishes[i].labelIndo;
      const value = fishes[i].value;
      if(hiddenLabels.indexOf(label) >= 0 || hiddenLabels.indexOf(labelIndo) >= 0) {
        ids.push(value);
      }
    }      

    return SqliteInvest.getMonthlyCatchByYearFilter(dateStr,ids)
    .then(month2buysell=>{

      const xlsxData = [];
      let labels=[];
      let datas=[];

      xlsxData.push([L('Annual Catch Report').toUpperCase()]);
      xlsxData.push([this.state.dateFilter]);
      xlsxData.push([L('Month'),L('Buy Fish'),L('Sell Fish')]);
      
      for(let i=0;i<numMonths;i++) {
        const label = ''+(i+1);

        const filterStr = label+' '+dateStr;
        const filter = moment(filterStr, 'M YYYY');
        const monthFilter = filter.format('YYYY-MM');

        let buy = 0;
        let sell = 0;
        let unsold = 0;

        if(month2buysell[monthFilter]) {
          buy = month2buysell[monthFilter].b;
          sell = month2buysell[monthFilter].s;
        }

        unsold = buy-sell;

        labels.push(label);

        datas.push(buy);
        datas.push(sell);
        datas.push(unsold);  

        xlsxData.push([monthFilter,buy,sell]);
      }

      const datasets = [{
        data:datas
      }];
  
      const reportData = {
        labels:labels,
        datasets:datasets,
        title:L('Monthly Catch Report').toUpperCase()
      };
  
      this.setState({
        reportData,
        xlsxData:xlsxData
      })  

      return this.generatePieChartData(dateStr);
    })
  }

  generatePieChartData(dateStr) {
    if(!dateStr) dateStr = moment().format('YYYY');
    return SqliteInvest.getWeightByFishOnYear(dateStr)
      .then(rows=>{
        const pieChartData = [];
        const fishes = oldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
        const english = (this.props.stateSetting.language == 'english');
        let index = 0;
        for (let key in rows) {
          if (rows.hasOwnProperty(key)) {
            const fish = _.find(fishes,{value:key});
            if(fish) {
              const name = english ? fish.label : fish.labelIndo;
              const amount = rows[key];

              pieChartData.push({
                name,amount,color:lib.colorForIndex(index), legendFontColor: '#7F7F7F', legendFontSize: 15
              });

              index++;
            }
          }
        }

        this.setState({
          pieChartData,
          generatingChart:false
        })  
      });

  }


  componentDidMount() {
    this.refreshDataByDateChunked(this.state.dateFilter)
    .then(()=>{
      return this.refreshDataByDate();
    })
    .then(result=>{
      this.setState({
        show:'chart'
      });
    })
  }

  refreshDataByDateChunked(m) {
    let p = Promise.resolve();
    const isOffline = this.props.stateLogin.offline;
    if(isOffline) return p;
    console.warn('refreshDataByDateChunked!');
    
    const mEnd = moment(m,'YYYY').startOf('year');
    const mNow = moment();
    const delta = mNow.diff(mEnd,'months');
    const idmsuser = this.props.stateLogin.idmsuser;

    const prevShow = this.state.show;
    if(delta >= 0) {
      const chunkData = this.props.stateInvestReport.chunkData;
      const investActions = this.props.investActions;
      
      for(let i=0;i<=delta;i++) {
        p = p.then(()=>{
          const mCheck = moment().subtract(i,'month');
          const key = 'INVESTDATA '+mCheck.format('MM YYYY');
          const info = mCheck.format('MMMM YYYY');
          const msg = 'Download data '+mCheck.format('MMMM YYYY');

          if(chunkData[key]) {
            console.warn(key+' already downloaded..');
            investActions.setDownloadInvestDataMsg(msg.toUpperCase());
            return;
          }

          console.warn(key+' will be downloaded..');

          const yParam = mCheck.format('YYYY');
          const mParam = mCheck.format('M');
          return SyncHelper.downloadInvestDataForDate(idmsuser,yParam,mParam,'')
            .then(()=>{
              investActions.addChunkDataKey(key);
              investActions.setDownloadInvestDataMsg(msg.toUpperCase());
            });
        })
      }
    }

    return p;
  }

  render() {
    if(this.state.show === 'busy') return <BusyView />;

    const hiddenLabels = this.state.hiddenLabels;
    const pcd = this.state.pieChartData;
    const filteredPieChartData = [];

    for(let i=0;i<pcd.length;i++) {
      const label = pcd[i].name;
      if(hiddenLabels.indexOf(label) < 0) filteredPieChartData.push(pcd[i]);
    }

    const investDataMsg = this.props.stateInvest.dataMsg;

    return (
      <AnnualChartReportView 
        generatingChart={this.state.generatingChart}
        investDataMsg={investDataMsg}
        onChangeDate={(dateStr)=>{
          this.setState({generatingChart:true});
          lib.delay(10)
          .then(()=>{
            return this.refreshDataByDateChunked(dateStr);
          })
          .then(()=>{
            return this.refreshDataByDate(dateStr);
          })
          .then(()=>{
            this.setState({generatingChart:false});
          })
          .catch(err=>{
            this.setState({generatingChart:false});
            console.error(err)
          })
        }}
        reportData={this.state.reportData}
        pieChartData={filteredPieChartData}
        goToFilter={()=>this.goToFilter()}
        exportToCSV={()=>this.exportToCSV()}
      />
    );
  }


}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateSetting: state.Setting,
    stateInvest: state.Invest,
    stateInvestReport: state.InvestReport
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
    investActions: bindActionCreators(investActions, dispatch)
  };
}

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;
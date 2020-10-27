import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import 'babel-polyfill';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import AnnualFinancialReportView from './views/AnnualFinancialReportView';
import BusyView from '../BusyView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const SqliteInvest = require('../SqliteInvest');
const oldTrafizHelper = require('../invest/OldTrafizHelper');
const SyncHelper = require('../invest/SyncHelper');

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('Annual Financial Report').toUpperCase()} size={lib.THEME_FONT_LARGE}/>
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
      reportData:{},
      pieDataIncome:[],
      pieDataExpense:[],
      hiddenLabels:[],
      dateFilter:moment().format('YYYY'),
      xlsxData:[]
    }
  }
  
  refreshDataByDate(dateStr) {
    if(!dateStr) dateStr = this.state.dateFilter;
    this.setState({generatingChart:true,dateFilter:dateStr});
    const hiddenLabels = this.state.hiddenLabels;

    return SqliteInvest.getBarChartAnnualFinancialData(dateStr,hiddenLabels)    
    .then(month2ie=>{

      const xlsxData = [];
      let labels=[];
      let datas=[];

      xlsxData.push([L('Annual Financial Report').toUpperCase()]);
      xlsxData.push([this.state.dateFilter]);
      xlsxData.push([L('Month'),L('Income'),L('Expense'),L('Profit/Loss')]);

      for(let i=0;i<12;i++) {
        const label = ''+(i+1);

        const monthFilterStr = label+' '+dateStr;
        const monthFilter = moment(monthFilterStr, 'M YYYY');
        const dateFilter = monthFilter.format('YYYY-MM');

        let income = 0;
        let expense = 0;
        let pl = 0;

        if(month2ie[dateFilter]) {
          income = month2ie[dateFilter].income;
          expense = month2ie[dateFilter].expense;
        }

        pl = income-expense;

        labels.push(label);

        datas.push(income);
        datas.push(-expense);
        datas.push(pl);  

        xlsxData.push([dateFilter,income,expense,pl]);
      }

      const datasets = [{
        data:datas
      }];
  
      const reportData = {
        labels:labels,
        datasets:datasets,
        title:L('Monthly Financial Report').toUpperCase()
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
    return SqliteInvest.getPieChartAnnualFinancialData(dateStr)
      .then(data=>{
        const pieDataIncome = [];
        const pieDataExpense = [];

        const income = data.income;
        const expense = data.expense;

        for (let key in income) {
          if (income.hasOwnProperty(key)) {
            const amount = income[key];
            const name = L(key);
            pieDataIncome.push({
              name,amount
            });
          }
        }

        for (let key in expense) {
          if (expense.hasOwnProperty(key)) {
            const amount = expense[key];
            const name = L(key);
            pieDataExpense.push({
              name,amount
            });
          }
        }

        this.setState({
          pieDataIncome,
          pieDataExpense,
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

  showFilter() {
    const income = this.state.pieDataIncome;
    const expense = this.state.pieDataExpense;
    const hiddenLabels = this.state.hiddenLabels;

    const filterData={};
    ctr=0;

    filterData[ctr]={label:L('Income'), value:true, header:true};
    ctr++;

    if (income.length == 0)
    {
      filterData[ctr]={label: L('No data to filter'), header:false};
      ctr++;
    }
    else
    {
      for(let i=0;i<income.length;i++) {
        const label = income[i].name;
        let val = true;
        if(hiddenLabels.indexOf(label) >= 0) val = false;
        filterData[ctr]={label:label, value:val, header:false};
        ctr++;
      }
    }

    filterData[ctr]={label:L('Expense'), value:true, header:true};
    ctr++;

    if (expense.length == 0)
    {
      filterData[ctr]={label: L('No data to filter'), header:false};
      ctr++;
    }
    else
    {
      for(let i=0;i<expense.length;i++) {
        const label = expense[i].name;
        let val = true;
        if(hiddenLabels.indexOf(label) >= 0) val = false;
        filterData[ctr]={label:label, value:val, header:false};
        ctr++;
      }
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
      key = L(key);
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

  exportToCSV() {
    const df = moment(this.state.dateFilter,'YYYY');
    const fn = 'annualfinancialreport-'+df.format('YYYY-')+moment().format('YYYYMMDDHHmm');
    this.props.navigation.push('XlsxScreen',{data:this.state.xlsxData,fn:fn});
  }

  render() {
    if(this.state.show === 'busy') return <BusyView />;

    const hiddenLabels = this.state.hiddenLabels;
    const pi = this.state.pieDataIncome;
    const pe = this.state.pieDataExpense;
    const filteredPieDataIncome = [];
    const filteredPieDataExpense = [];

    for(let i=0;i<pi.length;i++) {
      const label = pi[i].name;
      if(hiddenLabels.indexOf(label) < 0) filteredPieDataIncome.push(pi[i]);
    }

    for(let i=0;i<pe.length;i++) {
      const label = pe[i].name;
      if(hiddenLabels.indexOf(label) < 0) filteredPieDataExpense.push(pe[i]);
    }

    const investDataMsg = this.props.stateInvest.dataMsg;

    return (
      <AnnualFinancialReportView 
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
        pieDataIncome={filteredPieDataIncome}
        pieDataExpense={filteredPieDataExpense}
        onShowFilter={()=>this.showFilter()}
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
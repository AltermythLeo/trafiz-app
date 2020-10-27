import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Navicon, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import HomeView from './views/HomeView';
import BusyView from './views/BusyView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const OldTrafizHelper = require('./OldTrafizHelper');
const UIHelper = require('./UIHelper');
const SyncHelper = require('./SyncHelper');
let _isMounted;

class HomeScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('TRANSACTION')} size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'list',
      rows:[],
      refreshing:true
    }

  }

  componentDidMount() {
    const isOffline = this.props.stateLogin.offline;
    SyncHelper.setOffline(isOffline);

    // console.warn(lib.TRAFIZ_URL);
    _isMounted = true;
    const stateLogin = this.props.stateLogin;
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    const actions = this.props.actions;

    OldTrafizHelper.init(actions,stateLogin,stateData)
    .then(()=>{
      return OldTrafizHelper.getFishes(stateData,stateSetting);
    })
    .then(fishes=>{
      const dateFilter = moment().format('DD MMMM YYYY');
      this.props.investActions.setDateFilter(dateFilter);
      return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter);
    })
    .then(json=>{
      if(_isMounted)
      {
        this.props.investActions.setMainPageData(json);
        this.setState({refreshing:false});
      }
    });

  }

  componentWillUnmount(){
    _isMounted = false;
  }
  
  refreshListByDate(dateFilter) {
    // console.warn(dateFilter);
    this.selectedDate = dateFilter;
    this.props.investActions.setDateFilter(dateFilter);
    this.refreshDataByDateChunked(dateFilter)
    .then(()=>{
      return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter);
    })
    .then(json=>{
      this.props.investActions.setMainPageData(json);
    })
  }

  refreshDataByDateChunked(m) {
    let p = Promise.resolve();

    const isOffline = this.props.stateLogin.offline;
    if(isOffline) return p;

    // console.warn('refreshDataByDateChunked!');
    
    const mEnd = moment(m,'DD MMMM YYYY');
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

          if(chunkData[key]) {
            // console.warn(key+' already downloaded..');
            return;
          }

          // console.warn(key+' will be downloaded..');

          const yParam = mCheck.format('YYYY');
          const mParam = mCheck.format('M');
          return SyncHelper.downloadInvestDataForDate(idmsuser,yParam,mParam,'')
            .then(()=>{
              investActions.addChunkDataKey(key);
            });
        })
      }
    }

    return p;
  }

  refreshList() {
    const idmsuser = this.props.stateLogin.idmsuser;
    this.setState({refreshing:true});
    const dateFilter = this.props.stateInvest.dateFilter;
    SyncHelper.uploadInvestData()
    .then(()=>{
      const m = moment(dateFilter,'DD MMMM YYYY');
      const yParam = m.format('YYYY');
      const mParam = m.format('M');
      const dParam = m.format('D');
      return SyncHelper.downloadInvestDataForDate(idmsuser,yParam,mParam,dParam);
    })
    .then(()=>{
      return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter);
    })
    .then(json=>{
      this.props.investActions.setMainPageData(json);
      if(_isMounted)
        this.setState({refreshing:false});
      else
        console.warn('Canceled by component unmount')
    })
  }

  handleMoneyIn() {
    this.props.navigation.push('InvestAddIncomeScreen');
  }

  handleMoneyOut() {
    this.props.navigation.push('InvestAddExpenseScreen');
  }

  handleEdit(item) {
    if(item.rowType === 'BUYFISHES') {
      this.props.navigation.push('InvestBuyFishScreen',{
        buyFishOfflineID:item.offlineID
      });  
    } else if(item.rowType === 'SELLFISHES') {
      this.props.navigation.push('InvestSimpleSellFishScreen',{
        simpleSellFishOfflineID:item.offlineID
      });  
    } else if(item.rowType === 'TAKELOANS') {
      this.props.navigation.push('InvestTakeLoanScreen',{
        takeLoanOfflineID:item.offlineID
      });  
    } else if(item.rowType === 'PAYLOANS') {
      this.props.navigation.push('InvestPayLoanScreen',{
        takeLoanOfflineID:item.takeLoanOfflineID,
        payLoanOfflineID:item.offlineID
      });  
    } else if(item.rowType === 'GIVECREDITS') {
      this.props.navigation.push('InvestGiveCreditScreen',{
        giveCreditOfflineID:item.offlineID
      });  
    } else if(item.rowType === 'CREDITPAYMENTS') {
      this.props.navigation.push('InvestCreditPaymentScreen',{
        giveCreditOfflineID:item.giveCreditOfflineID,
        creditPaymentOfflineID:item.offlineID
      });  
    } else if(item.rowType === 'SIMPLESELLFISHES') {
      this.props.navigation.push('InvestSimpleSellFishScreen',{
        simpleSellFishOfflineID:item.offlineID
      });  
    } else if(item.rowType === 'CUSTOMINCOMES') {
      this.props.navigation.push('InvestCustomIncomeScreen',{
        customTypeOfflineID:item.offlineCustomTypeID,
        customIncomeOfflineID:item.offlineID
      });    
    } else if(item.rowType === 'CUSTOMEXPENSES') {
      this.props.navigation.push('InvestCustomExpenseScreen',{
        customTypeOfflineID:item.offlineCustomTypeID,
        customExpenseOfflineID:item.offlineID
      });    
    } 
  }

  setLabelSimpleSellFish(o) {
    const fishes = OldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
    const fish = _.find(fishes,{value:o.fishOfflineID});
    if(!fish) return '';
    let grade = o.grade;
    if(o.grade == 'A') grade = L('Good/Whole');
    else if(o.grade == 'C') grade = L('Reject');
    return L('Sell Catch') + ': ' +fish.label+' '+o.weight+'KG '+grade;
  }

  setLabelSellFish(o) {
    const fishes = OldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
    const fish = _.find(fishes,{value:o.fishOfflineID});
    if(!fish) return '';
    let grade = o.grade;
    if(o.grade == 'A') grade = L('Good/Whole');
    else if(o.grade == 'C') grade = L('Reject');
    return L('Sell Catch')+ ': ' +fish.label+' '+o.weightOnSplit+'KG '+grade;
  }

  setLabelBuyFish(o) {
    const fishes = OldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
    const fish = _.find(fishes,{value:o.fishOfflineID});
    if(!fish) return '';
    let grade = o.grade;
    if(o.grade == 'A') grade = L('Good/Whole');
    else if(o.grade == 'C') grade = L('Reject');
    return L('Buy Catch') + ': '+fish.label+' '+o.weightBeforeSplit+'KG '+grade+'';
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    let mpd = this.props.stateInvest.mainPageData;
    const rows = mpd.rows ? mpd.rows : [];
    const totalIN = mpd.totalIN ? mpd.totalIN : 0;
    const totalOUT = mpd.totalOUT ? mpd.totalOUT : 0;
    const total = mpd.total ? mpd.total : 0;

    // create label for rows

    const betterRows =_.map(rows.slice(),o=>{ 
      if(o.rowType === 'SIMPLESELLFISHES') o.labelValue = this.setLabelSimpleSellFish(o);
      else if(o.rowType === 'SELLFISHES') o.labelValue = this.setLabelSellFish(o);
      else if(o.rowType === 'BUYFISHES') o.labelValue = this.setLabelBuyFish(o);
      return o;
    })

    // filter garbage data (have no reference to fish)
    const filteredBetterRows = [];
    for(let i=0;i<betterRows.length;i++) {
      const row = betterRows[i];
      if(row.labelValue.length > 0) filteredBetterRows.push(row);
    }
    
    return (
      <HomeView
        refreshing={this.state.refreshing}
        totalIN={totalIN}
        totalOUT={totalOUT}
        total={total}
        rows={filteredBetterRows}

        onRefreshRows={()=>this.refreshList()}
        onChangeDate={(dateStr)=>this.refreshListByDate(dateStr)}
        onClickRow={row=>this.handleEdit(row)}
        onClickButtonMoneyIn={()=>this.handleMoneyIn()}
        onClickButtonMoneyOut={()=>this.handleMoneyOut()}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateInvest: state.Invest,
    stateSetting: state.Setting,
    stateInvestReport: state.InvestReport
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
    investActions: bindActionCreators(investActions, dispatch)
  };
}

HomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeScreen)

export default HomeScreen;
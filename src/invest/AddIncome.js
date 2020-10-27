import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { BackButton, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import AddIncomeView from './views/AddIncomeView';
import BusyView from './views/BusyView';
import {
  Alert
} from 'react-native';


const lib = require('../lib');
const L = require('../dictionary').translate;
const OldTrafizHelper = require('./OldTrafizHelper');
const UIHelper = require('./UIHelper');
const SqliteInvest = require('../SqliteInvest');
const SyncHelper = require('./SyncHelper');
let _isMounted;

class TheScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('ADD INCOME')}   size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      refreshing:false,
      show:'busy'
    }

  }

  componentWillUnmount(){
    _isMounted = false;
  }
  
  componentDidMount() {
    _isMounted = true;
    const stateLogin = this.props.stateLogin;
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    const actions = this.props.actions;

    const dateFilter = this.props.stateInvest.dateFilter;
    UIHelper.getAddIncomeDataByFilter(this.props.stateData,dateFilter)
    .then(json=>{
      if(_isMounted)
      {
        this.props.investActions.setAddIncomeData(json);
        this.setState({show:'form'});
      }
    });

    
  }

  refreshList() {
    this.setState({refreshing:true});
    const dateFilter = this.props.stateInvest.dateFilter;
    UIHelper.getAddIncomeDataByFilter(this.props.stateData,dateFilter)
    .then(json=>{
      if(_isMounted)
      {
        this.props.investActions.setAddIncomeData(json);
        this.setState({refreshing:false});
      }
    })
  }

  handleAddCategory() {
    this.props.navigation.push('InvestCustomTypeIncomeScreen');
  }

  handleSellFish() {
    this.props.navigation.push('InvestSimpleSellFishScreen');
  }

  handleTakeLoan() {
    this.props.navigation.push('InvestTakeLoanScreen');
  }

  handleCreditPayment() {
    this.props.navigation.push('InvestSelectCreditForPaymentScreen');
  }

  setSplitFishSold(offlineID, amount) {

    let sellDate = lib.selectedDate;
    const issame = moment().isSame(moment(sellDate), 'day')
    console.warn(issame ? "Date NOT Changed" : "Date changed");
    if(issame)
    {
      sellDate = moment().format("YYYY-MM-DD HH:mm:ss");
    }

    SqliteInvest.setSplitFishSold(offlineID, sellDate)
    .then(()=>{
      return SyncHelper.synchSplitFish();
    })
    .then(()=>{
      return UIHelper.getAddIncomeDataByFilter(this.props.stateData,null)
    })
    .then(json=>{
      this.props.investActions.setAddIncomeData(json);
      return UIHelper.getHomeDataByFilter(this.props.stateData,this.props.stateInvest.dateFilter)
    })
    .then(json=>{
      this.props.investActions.setMainPageData(json);
      this.props.navigation.navigate('InvestHomeScreen');
    });
  }

  handleEdit(item, amount) {
    const offlineIDs = [];
    for(let i = 0; i < amount; i++)
      offlineIDs.push(item.offlineIDs[i]);
    this.setSplitFishSold(offlineIDs);
    /*Alert.alert('',
      L('Sell this fish?'),
      [
        {
          text: L('No').toUpperCase(), 
          onPress: () => console.warn('do nothing')
        },
        {
          text: L('Yes').toUpperCase(), 
          onPress: () => this.setSplitFishSold(offlineID)
        },
      ]
    );*/

    // if(item.rowType === 'SELLFISHES') {
    //   this.props.navigation.push('InvestSplitFishScreen',{
    //     buyFishOfflineID:item.buyFishOfflineID
    //   });  
    // }     
    // else if(item.rowType === 'SIMPLESELLFISHES') {
    //   this.props.navigation.push('InvestSimpleSellFishScreen',{
    //     simpleSellFishOfflineID:item.offlineID
    //   });  
    // }
    // if(item.rowType === 'SELLFISHES') {
    //   this.props.navigation.push('InvestSellFishScreen',{
    //     buyFishOfflineID:item.buyFishOfflineID
    //   });  
    // } else if(item.rowType === 'TAKELOANS') {
    //   this.props.navigation.push('InvestTakeLoanScreen',{
    //     takeLoanOfflineID:item.offlineID
    //   });  
    // } else if(item.rowType === 'GIVECREDITS') {
    // } else if(item.rowType === 'CUSTOMINCOMES') {
    //   this.props.navigation.push('InvestCustomIncomeScreen',{
    //     customTypeOfflineID:item.offlineCustomTypeID,
    //     customIncomeOfflineID:item.offlineID
    //   });    
    // } 
  }

  handleCustomIncome(item) {
    this.props.navigation.push('InvestCustomIncomeScreen',{
      customTypeOfflineID:item.offlineID
    });  
  }

  setLabelSellFish(o) {
//    console.warn(o);
    const fishes = OldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
    const fish = _.find(fishes,{value:o.fishOfflineID});
    if(!fish) return '';
    let grade = L('Good/Whole');
    if(o.grade == 'C') grade = L('Reject');
    return ''+fish.label+' '+o.weightOnSplit+'KG '+grade+'';
  }

  setLabelSimpleSellFish(o) {
    const fishes = OldTrafizHelper.getFishes(this.props.stateData,this.props.stateSetting);
    const fish = _.find(fishes,{value:o.fishOfflineID});
    if(!fish) return '';
    return ''+fish.label+' '+o.weight+'KG '+o.grade+'';
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    const rows = this.props.stateInvest.addIncomeData.rows;    
    _.remove(rows,{trxoperation:'D'});
    const customIncomeTypes = this.props.stateInvest.addIncomeData.customIncomeTypes;
    _.remove(customIncomeTypes,{trxoperation:'D'});
    const betterRows =_.map(rows.slice(),o=>{ 
      if(o.rowType === 'SIMPLESELLFISHES') o.labelValue = this.setLabelSimpleSellFish(o);
      else if(o.rowType === 'SELLFISHES') o.labelValue = this.setLabelSellFish(o);
      return o;
    })

    // filter garbage data (have no reference to fish)
    const filteredBetterRows = [];
    for(let i=0;i<betterRows.length;i++) {
      const row = betterRows[i];
      if(row.labelValue.length > 0) filteredBetterRows.push(row);
    }

    return (
      <AddIncomeView
        refreshing={this.state.refreshing}
        rows={filteredBetterRows}
        customIncomeTypes={customIncomeTypes}

        onRefreshRows={()=>this.refreshList()}
        onClickRow={(row, amount)=>this.handleEdit(row, amount)}
        onClickButtonSellFish={()=>this.handleSellFish()}
        onClickButtonTakeLoan={()=>this.handleTakeLoan()}
        onClickButtonCreditPayment={()=>this.handleCreditPayment()}
        onClickButtonAddCategory={()=>this.handleAddCategory()}

        onClickCustomIncome={item=>this.handleCustomIncome(item)}
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
    stateSetting: state.Setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
    investActions: bindActionCreators(investActions, dispatch)
  };
}

TheScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(TheScreen)

export default TheScreen;
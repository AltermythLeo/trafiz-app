import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { BackButton, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import AddExpenseView from './views/AddExpenseView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const OldTrafizHelper = require('./OldTrafizHelper');
const UIHelper = require('./UIHelper');
let _isMounted;

class TheScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('ADD EXPENSE')}   size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      refreshing:false
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
    UIHelper.getAddExpenseDataByFilter(this.props.stateData,dateFilter)
    .then(json=>{
      if(_isMounted)
        this.props.investActions.setAddExpenseData(json);
    });

    
  }

  refreshList() {
    this.setState({refreshing:true});
    const dateFilter = this.props.stateInvest.dateFilter;
    UIHelper.getAddExpenseDataByFilter(this.props.stateData,dateFilter)
    .then(json=>{
      if(_isMounted)
      {
        this.props.investActions.setAddExpenseData(json);
        this.setState({refreshing:false});
      }
    })
  }

  handleAddCategory() {
    this.props.navigation.push('InvestCustomTypeExpenseScreen');
  }

  handleBuyFish() {
    this.props.navigation.push('InvestBuyFishScreen');
  }

  handlePayLoan() {
    this.props.navigation.push('InvestSelectTakeLoanToPayScreen');
  }

  handleGiveCredit() {
    this.props.navigation.push('InvestGiveCreditScreen');
  }

  handleEdit(item) {
    if(item.rowType === 'BUYFISHES') {
      this.props.navigation.push('InvestBuyFishScreen',{
        buyFishOfflineID:item.offlineID
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
    } else if(item.rowType === 'CUSTOMEXPENSE') {

    } 
  }

  handleCustomExpense(item) {
    this.props.navigation.push('InvestCustomExpenseScreen',{
      customTypeOfflineID:item.offlineID
    });  
  }

  render() {
    const customExpenseTypes = this.props.stateInvest.addExpenseData.customExpenseTypes;
    console.warn(customExpenseTypes);
    _.remove(customExpenseTypes,{trxoperation:'D'});
    const rows = this.props.stateInvest.addExpenseData.rows;
    _.remove(rows,{trxoperation:'D'});

    return (
      <AddExpenseView
        refreshing={this.state.refreshing}
        customExpenseTypes={customExpenseTypes}
        rows={rows}

        onRefreshRows={()=>this.refreshList()}
        onClickRow={row=>this.handleEdit(row)}
        onClickButtonBuyFish={()=>this.handleBuyFish()}
        onClickButtonPayLoan={()=>this.handlePayLoan()}
        onClickButtonGiveCredit={()=>this.handleGiveCredit()}
        onClickButtonAddCategory={()=>this.handleAddCategory()}

        onClickCustomExpense={item=>this.handleCustomExpense(item)}
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
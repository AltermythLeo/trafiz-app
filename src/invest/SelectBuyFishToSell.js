import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { BackButton, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import SelectBuyFishToSellView from './views/SelectBuyFishToSellView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const OldTrafizHelper = require('./OldTrafizHelper');
const UIHelper = require('./UIHelper');

class TheScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('SELECT FISH TO SELL')} size={lib.THEME_FONT_LARGE} />
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

  componentDidMount() {
    const stateLogin = this.props.stateLogin;
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    const actions = this.props.actions;

    const dateFilter = this.props.stateInvest.dateFilter;
    UIHelper.getAddExpenseDataByFilter(this.props.stateData,dateFilter) // todo
    .then(json=>{
      this.props.investActions.setAddExpenseData(json);
    });

    
  }

  refreshList() {
    this.setState({refreshing:true});
    const dateFilter = this.props.stateInvest.dateFilter;
    UIHelper.getAddExpenseDataByFilter(this.props.stateData,dateFilter)
    .then(json=>{
      this.props.investActions.setAddExpenseData(json);
      this.setState({refreshing:false});
    })
  }

  handleSelectFishToSell(item) {
    this.props.navigation.push('InvestSellFishScreen',{
      buyFishOfflineID:item.offlineID
    });
  }

  render() {
    const rows = this.props.stateInvest.addExpenseData.rows;
    const filteredRows = _.filter(rows,{rowType:'BUYFISHES'});

    return (
      <SelectBuyFishToSellView
        refreshing={this.state.refreshing}
        rows={filteredRows}

        onRefreshRows={()=>this.refreshList()}
        onClickRow={row=>this.handleSelectFishToSell(row)}
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
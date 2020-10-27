import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { BackButton, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import SelectCreditForPaymentView from './views/SelectCreditForPaymentView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const OldTrafizHelper = require('./OldTrafizHelper');
const UIHelper = require('./UIHelper');

class TheScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('SELECT CREDIT ACCOUNT RECEIVABLE')} size={lib.THEME_FONT_LARGE} />
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
      rows:[]
    }
  }

  componentDidMount() {
    UIHelper.getGiveCredits(this.props.stateData)
    .then(rows=>{
      this.setState({rows});
    });

    
  }

  refreshList() {
    this.setState({refreshing:true});
    UIHelper.getGiveCredits(this.props.stateData)
    .then(rows=>{
      this.setState({rows:rows,refreshing:false});
    });
  }

  handleSelect(item) {
    this.props.navigation.push('InvestCreditPaymentScreen',{
      giveCreditOfflineID:item.offlineID
    });
  }

  render() {
    return (
      <SelectCreditForPaymentView
        refreshing={this.state.refreshing}
        rows={this.state.rows}

        onRefreshRows={()=>this.refreshList()}
        onClickRow={row=>this.handleSelect(row)}
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
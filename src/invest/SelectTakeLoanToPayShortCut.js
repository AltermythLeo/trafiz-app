import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { BackButton, Title, Navicon } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import SelectTakeLoanToPayView from './views/SelectTakeLoanToPayView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const OldTrafizHelper = require('./OldTrafizHelper');
const UIHelper = require('./UIHelper');

class TheScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: (
        <Title txt={L('SELECT LOAN')} size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
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
    UIHelper.getTakeLoans(this.props.stateData)
    .then(rows=>{
      this.setState({refreshing:false,rows});
    })

    
  }

  refreshList() {
    this.setState({refreshing:true});
    UIHelper.getTakeLoans(this.props.stateData)
    .then(rows=>{
      this.setState({refreshing:false,rows});
    })
  }

  handleSelect(item) {
    this.props.navigation.push('InvestTakeLoanInfoScreen',{
      takeLoanOfflineID:item.offlineID
    });
  }

  goToTakeLoanScreen()
  {
    this.props.navigation.push('InvestTakeLoanScreen');
  }

  render() {
    return (
      <SelectTakeLoanToPayView
        refreshing={this.state.refreshing}
        rows={this.state.rows}
        goToTakeLoanScreen={()=>this.goToTakeLoanScreen()}
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
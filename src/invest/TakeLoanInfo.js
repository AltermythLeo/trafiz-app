import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Picker
} from 'react-native';
import _ from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { Avatar } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import DatePicker from 'react-native-datepicker';
import { MyDateBtn } from '../myCtl';
import moment from 'moment';
import TakeLoanInfoView from './views/TakeLoanInfoView';
import BusyView from './views/BusyView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const SqliteInvest = require('../SqliteInvest');
const UIHelper = require('./UIHelper');
const OldTrafizHelper = require('./OldTrafizHelper');

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('PAY LOAN INFO')} size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'busy'
    }
  }

  componentDidMount() {
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    
    const takeLoanOfflineID = this.props.navigation.getParam('takeLoanOfflineID');
    const payLoanOfflineID = this.props.navigation.getParam('payLoanOfflineID');

    UIHelper.getTakeLoanInfoData(stateData,takeLoanOfflineID)
    .then(data=>{
      const takeLoan = data.takeLoan;
      let history = data.history;
      _.remove(history, {trxoperation:'D'} );
      console.warn(history);

      this.setState({
        show:'info',
        loaner:takeLoan.creditor,
        amount:takeLoan.amount,
        tenor:takeLoan.tenor,
        notes:takeLoan.notes,
        history:history
      });              
    })    
  }

  selectItem(json) {
    const takeLoanOfflineID = this.props.navigation.getParam('takeLoanOfflineID');
    this.props.navigation.push('InvestPayLoanScreen',{
      takeLoanOfflineID:takeLoanOfflineID,
      payLoanOfflineID:json.offlineID
    });
  }

  nextPage() {
    const takeLoanOfflineID = this.props.navigation.getParam('takeLoanOfflineID');
    this.props.navigation.push('InvestPayLoanScreen',{
      takeLoanOfflineID:takeLoanOfflineID
    });
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <TakeLoanInfoView 
        loaner={this.state.loaner}
        amount={this.state.amount}
        tenor={this.state.tenor}
        notes={this.state.notes}
        history={this.state.history}
        onClickButtonNext={()=>this.nextPage()}
        onClickRow={(json)=>this.selectItem(json)}
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

DetailScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailScreen)

export default DetailScreen;
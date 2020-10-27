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
import PayLoanView from './views/PayLoanView';
import BusyView from './views/BusyView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const SqliteInvest = require('../SqliteInvest');
const UIHelper = require('./UIHelper');
const OldTrafizHelper = require('./OldTrafizHelper');
const SyncHelper = require('./SyncHelper');

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('PAY LOAN')} size={lib.THEME_FONT_LARGE} />
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
      initialData:null,
      editData:null,
      takeLoanLabel:'',
      takeLoanAmount:''
    }
  }

  componentDidMount() {
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    
    const takeLoanOfflineID = this.props.navigation.getParam('takeLoanOfflineID');
    const payLoanOfflineID = this.props.navigation.getParam('payLoanOfflineID');

    UIHelper.getPayLoanData(stateData,takeLoanOfflineID,payLoanOfflineID)
    .then(data=>{
      const takeLoan = data.takeLoan;
      const payLoan = data.payLoan;

      if(!payLoan) {
        this.setState({
          show:'form',
          takeLoanLabel:takeLoan.labelValue,
          takeLoanAmount:takeLoan.amount+''
        });              
      } else {
        const initialData = {
          offlineID         : payLoan.offlineID, //for later lookup
          trxdate           : payLoan.trxdate,   //to keep datetime  unchanged
          ts                : payLoan.ts,        //to keep timestamp unchanged
          takeLoanOfflineID : payLoan.takeLoanOfflineID,
          amount:payLoan.amount+'',
          notes:payLoan.notes,
          paidoff:payLoan.paidoff
        }

        this.setState({
          show:'form',
          takeLoanLabel:takeLoan.labelValue,
          takeLoanAmount:takeLoan.amount+'',
          initialData:initialData,
          editData:payLoan
        });
      }
    })    
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <PayLoanView 
        takeLoanLabel={this.state.takeLoanLabel}
        takeLoanAmount={this.state.takeLoanAmount}
        initialData={this.state.initialData}
        onClickButtonSave={(json)=>this.saveAndBack(json)}
      />
    );
  }

  savePayLoan(json) {
    const dateFilter = this.props.stateInvest.dateFilter;
    const editData = this.state.editData;

    let   offlineID;
    let   takeLoanOfflineID = this.props.navigation.getParam('takeLoanOfflineID');
    const amount = json.amount;
    const notes = json.notes;
    const paidoff = json.paidoff;
    let   ts = moment(json.trxdate).unix();
    const synch = 0; 
    let   trxoperation = 'C';
    let   trxdate = moment(json.trxdate).format('YYYY-MM-DD HH:mm:ss');
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;

    //json has valid offlineID? \
    if(json.hasOwnProperty('offlineID') && json.offlineID != null && json.offlineID != 'null')
    {
      console.warn("Updating Loan Payment Data");
      offlineID = json.offlineID;
//      ts        = json.ts;
  //    trxdate   = json.trxdate;
      takeLoanOfflineID = json.takeLoanOfflineID;
      json.trxoperation = json.remove ? 'D' : 'U';
    }
    else
    {
      console.warn("Creating New Loan Payment Data");
      offlineID = lib.getOfflineId('payloan',this.props.stateLogin.idmsuser);
      json.trxoperation = 'C';
    }

    trxoperation = json.trxoperation;

    return Promise.resolve()
      .then(()=>{
        return SqliteInvest.upsertPayLoan(offlineID,takeLoanOfflineID,amount,notes,paidoff,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser);
      })
      .then(()=>{
        return SyncHelper.synchPayLoan(trxoperation == 'C');
      })
      .then(()=>{
        return UIHelper.getAddIncomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setAddIncomeData(json);
        return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setMainPageData(json);
      });  

  }

  saveAndBack(json) {
    this.setState({show:'busy'});
    return this.savePayLoan(json)
      .then(()=>{
        this.props.navigation.navigate('InvestHomeScreen');
      })
      .catch(err=>{
        console.warn(err);
      });
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
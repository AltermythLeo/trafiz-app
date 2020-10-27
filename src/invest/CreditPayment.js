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
import CreditPaymentView from './views/CreditPaymentView';
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
        <Title txt={L('Account Receivable Payment').toUpperCase()} size={lib.THEME_FONT_LARGE} />
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
      errMsg:'',
      initialData:null,
      editData:null
    }
  }

  componentDidMount() {
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;
    
    const giveCreditOfflineID = this.props.navigation.getParam('giveCreditOfflineID');
    const creditPaymentOfflineID = this.props.navigation.getParam('creditPaymentOfflineID');

    UIHelper.getCreditPaymentData(stateData,giveCreditOfflineID,creditPaymentOfflineID)
      .then(data=>{
        const g = data.giveCredit;
        const trafizLoanOfflineID = g.trafizLoanOfflineID;

        if(data.creditPayment) {
          const c = data.creditPayment;
          const initialData = {
            offlineID     : c.offlineID, //for later lookup
            trxdate       : c.trxdate,   //to keep datetime  unchanged
            ts            : c.ts,        //to keep timestamp unchanged
            giveCreditOfflineID : c.giveCreditOfflineID,
            trafizPayloanOfflineID : c.trafizPayloanOfflineID,
            amount:c.amount+'',
            notes:c.notes,
            paidoff:c.paidoff
          }

          this.setState({
            show:'form',
            giveCreditLabel:g.labelValue,
            giveCreditAmount:g.amount,
            initialData:initialData,
            editData:c,
            trafizLoanOfflineID:trafizLoanOfflineID
          });
        } else {
          this.setState({
            show:'form',
            giveCreditLabel:g.labelValue,
            giveCreditAmount:g.amount,
            trafizLoanOfflineID:trafizLoanOfflineID
          });            
        }
      })

    
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <CreditPaymentView 
        giveCreditLabel={this.state.giveCreditLabel}
        giveCreditAmount={this.state.giveCreditAmount}
        initialData={this.state.initialData}
        onClickButtonSave={(json)=>this.saveAndBack(json)}
      />
    );
  }

  saveData(json) {
    const editData = this.state.editData;

    let offlineID;
    let giveCreditOfflineID = this.props.navigation.getParam('giveCreditOfflineID');
    let trafizPayloanOfflineID = '';
    // if( editData ) trafizPayloanOfflineID = editData.trafizPayloanOfflineID;
    const amount = json.amount;
    const notes = json.notes;
    let ts = moment(json.trxdate).unix();
    const synch = 0;
    let trxoperation = 'C';
    json.trxdate = moment(json.trxdate).format('YYYY-MM-DD HH:mm:ss');
    let trxdate = json.trxdate;
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;
    const paidoff = json.paidoff;

    const trafizLoanOfflineID = this.state.trafizLoanOfflineID;

    //json has valid offlineID? \
    if(json.hasOwnProperty('offlineID') && json.offlineID != null && json.offlineID != 'null')
    {
      console.warn("Updating Credit Payment Data");
      offlineID    = json.offlineID;
      ts           = json.ts;
      trxdate      = json.trxdate;
      giveCreditOfflineID = json.giveCreditOfflineID;
      trafizPayloanOfflineID = json.trafizPayloanOfflineID;
      trxoperation = json.remove ? 'D' : 'U';
    }
    else
    {
      console.warn("Creating New Credit Payment Data");
      offlineID    = lib.getOfflineId('creditpayment',this.props.stateLogin.idmsuser);
      trxoperation = 'C';
    }
    let p = Promise.resolve();

    if( editData) {

      // can't do this. payloan on trafiz cant edited
      // p = OldTrafizHelper.payloanRupiah(this.props.actions,this.props.stateLogin,this.props.stateData,trafizLoanOfflineID,amount)
      //   .then(result=>{
      //   });

    } else {

      p = OldTrafizHelper.createPayloanRupiah(this.props.actions,this.props.stateData,amount);

      // todo strike items
      if(paidoff === 1) {
        p = p.then(()=>{
          return OldTrafizHelper.strikeLoanRupiah(this.props.actions,this.props.stateLogin,this.props.stateData,trafizLoanOfflineID)
        })
      }


    }

    const dateFilter = this.props.stateInvest.dateFilter;

    return p
      .then(()=>{
        return SqliteInvest.upsertCreditPayment(offlineID,giveCreditOfflineID,trafizPayloanOfflineID,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser,paidoff);
      })
      .then(()=>{
        return SyncHelper.synchCreditPayment(trxoperation == 'C');
      })
      .then(()=>{
        return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setMainPageData(json);
        return offlineID;
      });  

  }

  saveAndBack(json) {
    this.setState({show:'busy'});
    return this.saveData(json)
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
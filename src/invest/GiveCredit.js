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
import GiveCreditView from './views/GiveCreditView';
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
        <Title txt={L('Account Receivable').toUpperCase()} size={lib.THEME_FONT_LARGE} />
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

    UIHelper.getGiveCreditData(stateData,giveCreditOfflineID)
      .then(data=>{

        if(data.giveCredit) {
          const d = data.giveCredit;
          const initialData = {
            name          : d.name,
            amount        : d.amount+'',
            notes         : d.notes,
            offlineID     : d.offlineID, //for later lookup
            trafizLoanOfflineID : d.trafizLoanOfflineID,
            trxdate       : d.trxdate,   //to keep datetime  unchanged
            ts            : d.ts         //to keep timestamp unchanged
          }

          this.setState({
            show:'form',
            initialData:initialData,
            editData:data.giveCredit
          });
        } else {
          this.setState({
            show:'form'
          });            
        }
      })

    
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <GiveCreditView 
        initialData={this.state.initialData}
        onClickButtonSave={(json)=>this.saveAndBack(json)}
      />
    );
  }

  saveData(json) {
    const editData = this.state.editData;

    let offlineID;
    let ts = moment(json.trxdate).unix();
    const synch = 0;
    let trxoperation = 'C';
    let trxdate = moment(json.trxdate).format('YYYY-MM-DD HH:mm:ss');
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;
    const name = json.name;
    const notes = json.notes;
    const amount = json.amount;
    let trafizLoanOfflineID;
//    if( editData ) trafizLoanOfflineID = editData.trafizLoanOfflineID;

    if(json.hasOwnProperty('offlineID') && json.offlineID != null && json.offlineID != 'null')
    {
      console.warn("Updating Give Credit Data");
      offlineID    = json.offlineID;
//      ts           = json.ts;
//      trxdate      = json.trxdate;
      trafizLoanOfflineID = json.trafizLoanOfflineID;
      trxoperation = 'U';
    }
    else
    {
      console.warn("Creating New Give Credit Data");
      offlineID    = lib.getOfflineId('givecredit',this.props.stateLogin.idmsuser);
      trxoperation = 'C';
    }
    let p = Promise.resolve();

    if( editData) {
//      p = OldTrafizHelper.editLoanRupiah(this.props.actions,this.props.stateLogin,this.props.stateData,trafizLoanOfflineID,amount)
  //      .then(result=>{
    //    });

    } else {
      p = OldTrafizHelper.createLoanRupiah(this.props.actions,this.props.stateLogin,this.props.stateData,amount)
        .then(result=>{
          trafizLoanOfflineID = result;
        });
    }

    const dateFilter = this.props.stateInvest.dateFilter;

    return p
      .then(()=>{
        return SqliteInvest.upsertGiveCredit(offlineID,trafizLoanOfflineID,name,amount,notes,ts,synch,trxoperation,trxdate,idmssupplier,idmsuser);
      })
      .then(()=>{
        return SyncHelper.synchGiveCredit(trxoperation == 'C');
      })
      .then(()=>{
        return UIHelper.getAddExpenseDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setAddExpenseData(json);
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
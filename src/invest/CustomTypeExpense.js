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
import CustomTypeView from './views/CustomTypeView';
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
        <Title txt={L('INSERT NEW EXPENSE CATEGORY')} size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show:'form'
    }
  }

  componentDidMount() {
  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <CustomTypeView 
        customType='expense'
        onClickButtonSave={(json)=>this.saveAndBack(json)}
      />
    );
  }

  saveAndBack(json) {
    const dateFilter = this.props.stateInvest.dateFilter;
    
    const offlineID = lib.getOfflineId('customtype',this.props.stateLogin.idmsuser);
    const label = json.label;
    const incomeorexpense = 'expense';
    const ts = moment().unix();
    const createddate = moment().format('YYYY-MM-DD');
    const createdhour = moment().format('HH:mm:ss');
    const synch = 0;
    const trxoperation = 'C';
    const trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;

    let p = Promise.resolve();
    
    return p
      .then(()=>{
        const j = json;
        return SqliteInvest.upsertCustomType(offlineID,label,incomeorexpense,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser);
      })
      .then(()=>{
        return SyncHelper.synchCustomType();
      })
      .then(()=>{
        return UIHelper.getAddExpenseDataByFilter(this.props.stateData,null)
      })
      .then(json=>{
        this.props.investActions.setAddExpenseData(json);
        this.props.navigation.goBack();
      })
      .catch(err=>{
        console.warn('error:');
        console.warn(err);
      })

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
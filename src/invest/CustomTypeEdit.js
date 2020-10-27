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
        <Title txt={L('EDIT CUSTOM <TYPE>').replace('<TYPE>', L(lib.capitalize(params.payload.incomeorexpense))).toUpperCase()} size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);
    const payload = this.props.navigation.state.params.payload;
    console.warn(payload);
    this.state = {
      show:'form',
      label:payload.label,
      editData:payload
    }
    console.warn(this.state.label);
  }

  componentDidMount() {
    this.setState({
        show:'form'
      });
  }

  render() {
    console.warn(this.state.editData.incomeorexpense);
    if(this.state.show==='busy') return <BusyView />;

    return (
      <CustomTypeView 
        customType={this.state.editData.incomeorexpense}
//        incomeorexpense={this.state.editData.incomeorexpense}
        prevLabel = {this.state.label}
        showRemove={true}
        onClickButtonSave={(json)=>this.saveAndBack(json)}
      />
    );
  }

  saveAndBack(json) {
    const dateFilter = this.props.stateInvest.dateFilter;
    
    const offlineID = this.state.editData.offlineID;
    const label = json.label;
    const incomeorexpense = this.state.editData.incomeorexpense;
    const ts = this.state.editData.ts;
    const createddate = this.state.editData.createddate;
    const createdhour = this.state.editData.createdhour;
    const synch = 0;
    const trxoperation = json.remove ? 'D' : 'U';
    const trxdate = this.state.editData.trxdate;
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
        if(incomeorexpense == 'income')
            return UIHelper.getAddIncomeDataByFilter(this.props.stateData,null)
        else
            return UIHelper.getAddExpenseDataByFilter(this.props.stateData,null)
      })
      .then(json=>{
        if(incomeorexpense == 'income')
            this.props.investActions.setAddIncomeData(json);
        else
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
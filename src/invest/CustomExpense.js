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
import CustomFormView from './views/CustomFormView';
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
        <Title txt={L('ADD CUSTOM EXPENSE')} size={lib.THEME_FONT_LARGE} />
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
    
    const customTypeOfflineID = this.props.navigation.getParam('customTypeOfflineID');
    const customExpenseOfflineID = this.props.navigation.getParam('customExpenseOfflineID');
    let customType;
    let customExpense;

    SqliteInvest.getCustomType(customTypeOfflineID)
    .then(row=>{
      customType = row;
      return SqliteInvest.getCustomExpense(customExpenseOfflineID);
    })
    .then(row=>{
      customExpense = row;

      if(!customExpense) {
        this.setState({
          show:'form',
          label:customType.label
        });              
      } else {
        console.warn(row);
        const initialData = {
          offlineID     : customExpense.offlineID, //for later lookup
          trxdate       : customExpense.trxdate,   //to keep datetime  unchanged
          ts            : customExpense.ts,        //to keep timestamp unchanged
          createddate   : customExpense.createddate,//saving effort from recalculating from ts
          createdhour   : customExpense.createdhour,//saving effort from recalculating from ts
          amount:customExpense.amount+'',
          notes:customExpense.notes
        }

        this.setState({
          show:'form',
          label:customType.label,
          initialData:initialData,
          editData:customExpense
        });
      }
    })    

  }

  render() {
    if(this.state.show==='busy') return <BusyView />;

    return (
      <CustomFormView 
        customType='expense'
        label={this.state.label}
        initialData={this.state.initialData}
        onClickButtonSave={(json)=>this.saveAndBack(json)}
      />
    );
  }

  saveAndBack(json) {
    const editData = this.state.editData;
    
    let   offlineID;
    const offlineCustomTypeID = this.props.navigation.getParam('customTypeOfflineID');
    const amount = json.amount;
    const notes = json.notes;
    let   ts = moment(json.trxdate).unix();
    let   createddate = moment(json.trxdate).format('YYYY-MM-DD');
    let   createdhour = moment(json.trxdate).format('HH:mm:ss');
    const synch = 0;
    let   trxoperation = 'C';
    let   trxdate = moment(json.trxdate).format('YYYY-MM-DD HH:mm:ss');
    const idmssupplier = this.props.stateLogin.idmssupplier;
    const idmsuser = this.props.stateLogin.idmsuser;

/*    if(editData) {
      offlineID = editData.offlineID;
      ts = editData.ts;
      createddate = editData.createddate;
      createdhour = editData.createdhour;
      trxoperation = 'U';
    }*/

    if(json.hasOwnProperty('offlineID') && json.offlineID != null && json.offlineID != 'null')
    {
      console.warn("Updating Custom Expense Data");
      offlineID    = json.offlineID;
//      ts           = json.ts;
//      createddate  = json.createddate;
//      createdhour  = json.createdhour;
//      trxdate      = json.trxdate;
      trxoperation = json.remove ? 'D' : 'U';
    }
    else
    {
      console.warn("Creating New Custom Expense Data");
      offlineID = lib.getOfflineId('customexpense',this.props.stateLogin.idmsuser);
      trxoperation = 'C';
    }

    let p = Promise.resolve();
    const dateFilter = this.props.stateInvest.dateFilter;
    return p
      .then(()=>{
        const j = json;
        return SqliteInvest.upsertCustomExpense(offlineID,offlineCustomTypeID,amount,notes,ts,createddate,createdhour,synch,trxoperation,trxdate,idmssupplier,idmsuser);
      })
      .then(()=>{
        return SyncHelper.synchCustomExpense(trxoperation=='C');
      })
      .then(()=>{
        return UIHelper.getHomeDataByFilter(this.props.stateData,dateFilter)
      })
      .then(json=>{
        this.props.investActions.setMainPageData(json);
        this.props.navigation.navigate('InvestHomeScreen');
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
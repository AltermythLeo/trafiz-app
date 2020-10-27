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

const lib = require('../lib');
const L = require('../dictionary').translate;
const SqliteInvest = require('../SqliteInvest');
const UIHelper = require('./UIHelper');

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('PAY LOAN')} />
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
      inputs:[
        {label:'offlineID',key:'offlineID',value:'',disabled:true},
        {label:L('Amount'),key:'amount',value:'',mandatory:true,ctl:'numeric'},
        {label:L('Notes'),key:'notes',value:''},
        {label:L('Paid off?'),key:'paidoff',value:'0'},
      ],
      errMsg:''
    }
  }

  componentDidMount() {
    const mode = this.props.navigation.getParam('mode','add');
    const login = this.props.stateLogin;

    const inputs = this.state.inputs.slice();

    if(mode === 'add') {
      inputs[0].value = lib.getOfflineId('payloan',login.idmsuser);
      this.setState({show:'form',inputs:inputs});
    } else if(mode === 'edit') {
      const item = this.props.navigation.getParam('item');

      for(let i=0;i<inputs.length;i++) {
        const key = inputs[i].key;
        let valueInData = item[key];
        if(valueInData) inputs[i].value = ''+valueInData;
      }
  
      this.setState({show:'form',inputs:inputs});
    }

  }

  handleSave() {
    const mode = this.props.navigation.getParam('mode','add');
    this.setState({show:'busy'});

    const arr = this.state.inputs;
    const json = {};
    for(let i=0;i<arr.length;i++) {
      const key = arr[i].key;
      const value = arr[i].value;
      const mandatory = arr[i].mandatory;
      json[key] = value;

      if(value.length == 0 && mandatory) return this.setState({
        show:'error',
        errMsg:arr[i].label+L(' not set')
      });
    }

    const login = this.props.stateLogin;
    const idmssupplier = login.idmssupplier;
    const idmsuser = login.idmsuser;

    json.takeLoanOfflineID = '';
    json.ts = moment().unix();
    json.synch = 0;
    json.trxoperation = 'C';
    if(mode === 'edit') json.trxoperation = 'U';
    json.trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
    json.idmssupplier = idmssupplier;
    json.idmsuser = idmsuser;

    const j = json;

    SqliteInvest.upsertPayLoan(j.offlineID,j.takeLoanOfflineID,j.amount,j.notes,j.paidoff,j.ts,j.synch,j.trxoperation,j.trxdate,j.idmssupplier,j.idmsuser)
      .then(result=>{
        console.warn(result);
        return UIHelper.getMainPageData();
      })
      .then(json=>{
        this.props.investActions.setMainPageData(json);
        this.props.navigation.goBack();
      })
      .catch(err=>{
        console.warn(err);
        this.setState({show:'form'});      
      });
  }

  handleRemove() {
    this.setState({show:'busy'});
    const offlineID = this.state.inputs[0].value;
    const login = this.props.stateLogin;
    const idmssupplier = login.idmssupplier;
    const idmsuser = login.idmsuser;

    SqliteInvest.deletePayLoan(offlineID,idmssupplier,idmsuser)
      .then(result=>{
        console.warn(result);
        return UIHelper.getMainPageData();
      })
      .then(json=>{
        this.props.investActions.setMainPageData(json);
        this.props.navigation.goBack();
      })
      .catch(err=>{
        console.warn(err);
        this.setState({show:'form'});      
      });
  }

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    let errorIndicator = null;
    if( this.state.show === 'error' ) {
      const errMsg = this.state.errMsg;
      errorIndicator = (
        <View style={{backgroundColor:'red',padding:5}}>
          <Text style={{textAlign:'center',color:'white'}}>{errMsg.toUpperCase()}</Text>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        {errorIndicator}
        {this.renderForm()}
      </View>
    )
    
  }

  setInput(index,text) {
    const newInputs = this.state.inputs.slice();
    newInputs[index].value = text;
    this.setState({inputs:newInputs});
  }

  renderItem(obj,index) {
    let s1 = {paddingHorizontal:10,height:64,justifyContent:'center'};
    let s2 = Object.assign({},s1,{flexDirection:'row',justifyContent:'space-between',alignItems:'center'});
    let editable = obj.disabled ? false : true;
    const mandatory = obj.mandatory ? L('(mandatory)') : '';

    if(!editable) return null;

    if(obj.ctl && obj.ctl === 'datepicker') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <MyDateBtn 
            placeholder={L('TAP TO SET')}
            value={obj.value} onChangeDate={(str)=>this.setInput(index,str)} />
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'picker') {
      const arr = obj.param;
      return (
        <View key={index} style={s2}>
          <Text style={{}}>{obj.label} {mandatory}</Text>
          <Picker
            style={{flex:1}}
            selectedValue={obj.value}
            onValueChange={(item, idx) => this.setInput(index,item)}
          >
          {arr.map((obj,index)=>{
            return <Picker.Item key={index} label={obj.label} value={obj.value} />;
          })}
          </Picker>
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'numeric') {
      const arr = obj.param;
      return (
        <View key={index} style={s1}>
          <TextField
            editable={editable}
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setInput(index,text)}
            value={obj.value}
            label={obj.label+' '+mandatory}
            keyboardType='numeric'
          />
        </View>
      );
    }

    return (
      <View key={index} style={s1}>
        <TextField
          editable={editable}
          tintColor={lib.THEME_COLOR}
          onChangeText={(text) => this.setInput(index,text)}
          value={obj.value}
          label={obj.label+' '+mandatory}
        />
      </View>
    );
  }

  renderForm() {
    const mode = this.props.navigation.getParam('mode','add');
    const disabled = (this.state.inputs[0].value.length < 2);

    let bottom = (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Button disabled={disabled} raised primary text={L('Save')} onPress={()=>this.handleSave()} />
        </View>
      </View>  
    );
    let title = L('ADD LOAN');

    if(mode === 'edit') {
      title = L('EDIT LOAN');
      bottom = (
        <View style={{flexDirection:'row'}}>
          <View style={{flex:1,padding:3}}>
            <Button disabled={disabled} raised primary text={L('Save')} onPress={()=>this.handleSave()} />
          </View>
          <View style={{flex:1,padding:3}}>
            <Button raised accent text={L('Remove')} onPress={()=>this.handleRemove()} />
          </View>
        </View>
      );
    }

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <ScrollView keyboardShouldPersistTaps={'always'} style={{flex:1}}>
          <Text style={{padding:10,textAlign:'center',fontWeight:'bold'}}>{title}</Text>
          {this.state.inputs.map((obj,index)=>{
            return this.renderItem(obj,index);
          })}
          <Text />
          <Text />
          <Text />
          <Text />
        </ScrollView>
        {bottom}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data,
    stateInvest: state.Invest
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
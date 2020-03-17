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
import DatePicker from 'react-native-datepicker';
import { MyDateBtn } from '../myCtl';
import moment from 'moment';

const lib = require('../lib');
const L = require('../dictionary').translate;

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('FISHERMAN/SUPPLIER REPORT')+' (1/2)'} />
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
        {label:L('Name'),key:'name',value:'',ctl:'selectFishermanSupplier'},
        {label:L('Start Date'),key:'startDate',value:'',ctl:'datepicker',maxDateNow:true},
        {label:L('End Date'),key:'endDate',value:'',ctl:'datepicker',maxDateNow:true},
      ],
      isSupplier:false,
      errMsg:''
    }
  }

  componentDidMount() {
    this.setState({show:'form'});
  }

  handleNext() {
    const arr = this.state.inputs;
    const json = {};
    for(let i=0;i<arr.length;i++) {
      const key = arr[i].key;
      const value = arr[i].value ? arr[i].value : '';
      json[key] = value;


      if(!value || value.length == 0) return this.setState({
        show:'error',
        errMsg:arr[i].label+L(' not set')
      });
    }

    json.isSupplier = this.state.isSupplier;
    this.props.navigation.push('FishermanSupplierReportScreen',json);
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

  selectFishermanSupplier() {
    const rows1 = [];
    const rows2 = [];

    let f = this.props.stateData.fishermans.slice();
    _.remove(f,{lasttransact:"D"});
    let s = this.props.stateData.suppliers.slice();
    _.remove(s,{lasttransact:"D"});


    for(let i=0;i<f.length;i++) {
      const name = f[i].name;
      rows1.push(name);
    }

    for(let i=0;i<s.length;i++) {
      const name = s[i].name_param;
      rows2.push(name);
    }

    this.props.navigation.navigate('SaleFilterScreen', {
      rows1: rows1,
      rows2: rows2,
      onReturnSelect: (text,isSupplier) => {
        this.setInput(0,text);
        this.setState({isSupplier});
        console.warn(isSupplier);
      }
    });
  }

  renderItem(obj,index) {
    let s1 = {paddingHorizontal:10,height:64,justifyContent:'center'};
    let s2 = Object.assign({},s1,{flexDirection:'row',justifyContent:'space-between',alignItems:'center'});

    if(obj.ctl && obj.ctl === 'selectFishermanSupplier') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const text = obj.value.length > 0 ? obj.value : L('TAP TO SET');
      return (
        <View key={index} style={s2}>
          <Text>{obj.label}</Text>
          <TouchableOpacity onPress={()=>this.selectFishermanSupplier()}>
            <Text style={{fontWeight:'bold'}}>{text}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if(obj.ctl && obj.ctl === 'datepicker') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const maxDateNow = obj.maxDateNow ? true : false;
      return (
        <View key={index} style={s2}>
          <Text>{obj.label}</Text>
          <MyDateBtn 
            maxDateNow={maxDateNow}
            placeholder={L('TAP TO SET')}
            value={obj.value} onChangeDate={(str)=>this.setInput(index,str)} />
        </View>
      );
    }

    return <View />;
  }

  setInput(index,text) {
    const newInputs = this.state.inputs.slice();
    newInputs[index].value = text;
    this.setState({inputs:newInputs});
  }


  renderForm() {
    const disabled = (
      this.state.inputs[0].value.length == 0 ||
      this.state.inputs[1].value.length == 0 ||
      this.state.inputs[2].value.length == 0
    );

    let bottom = (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Button disabled={disabled} raised primary text={L('SHOW REPORT')} onPress={()=>this.handleNext()} />
        </View>
      </View>  
    );

    let title = L('FILTER REPORT');

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
    stateSetting: state.Setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

DetailScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailScreen)

export default DetailScreen;
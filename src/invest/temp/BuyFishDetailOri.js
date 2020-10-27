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
const OldTrafizHelper = require('./OldTrafizHelper');

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('Buy Catch').toUpperCase()} />
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
        {label:L('Fisherman Name'),key:'fishermanname',value:'',mandatory:true},
        {label:L('Fishing Ground/Area'),key:'fishingground',value:'',ctl:'map',mandatory:true},
        {label:L('Port Name/Landing Site'),key:'portname',value:'',mandatory:true}, // edit
        {label:L('Fish Name'),key:'fishOfflineID',value:'',ctl:'picker',param:[
          {label:'Not set',value:''}
        ],mandatory:true},
        {label:L('Weight'),key:'weight',value:'',mandatory:true},
        {label:L('Grade'),key:'grade',value:'',mandatory:true},
        {label:L('Price'),key:'amount',value:'',mandatory:true,ctl:'numeric'},
        {label:L('Notes'),key:'notes',value:''},
      ],
      errMsg:''
    }
  }

  componentDidMount() {
    const stateData = this.props.stateData;
    const stateSetting = this.props.stateSetting;

    const fishes = OldTrafizHelper.getFishes(stateData,stateSetting);
    Promise.resolve(fishes)
      .then(fishes=>{
        const mode = this.props.navigation.getParam('mode','add');
        const login = this.props.stateLogin;
    
        const inputs = this.state.inputs.slice();
    
        if(mode === 'add') {
          inputs[0].value = lib.getOfflineId('buyfish',login.idmsuser);
          inputs[4].param = fishes;
          this.setState({show:'form',inputs:inputs});
        } else if(mode === 'edit') {
          const item = this.props.navigation.getParam('item');

          console.warn(item);
    
          for(let i=0;i<inputs.length;i++) {
            const key = inputs[i].key;
            let valueInData = item[key];
            if(valueInData) inputs[i].value = ''+valueInData;
          }
          inputs[4].param = fishes;
          this.setState({show:'form',inputs:inputs});
        }
            
      })


  }

  handleSave() {
    const mode = this.props.navigation.getParam('mode','add');
    const item = this.props.navigation.getParam('item',null);
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
    
    json.ts = moment().unix();
    json.synch = 0;
    json.trxoperation = 'C';
    if(mode === 'edit') json.trxoperation = 'U';
    json.trxdate = moment().format('YYYY-MM-DD HH:mm:ss');
    json.idmssupplier = idmssupplier;
    json.idmsuser = idmsuser;

    let p;

    if(mode === 'edit') {
      p = OldTrafizHelper.editCatch(
        this.props.actions,
        this.props.stateData,
        item.catchOfflineID,
        json['fishermanname'],
        json['fishingground'],
        json['portname'],
        json['fishOfflineID'],
        json['amount'],
        json['weight'],
        json['grade']
      ).then(result=>{
        json.catchOfflineID = item['catchOfflineID'];
        json.fishCatchOfflineID = item['fishCatchOfflineID'];
      });
    } else {
      p = OldTrafizHelper.createCatch(
        this.props.actions,
        this.props.stateLogin,
        this.props.stateData,
        json['fishermanname'],
        json['fishingground'],
        json['portname'],
        json['fishOfflineID'],
        json['amount'],
        json['weight'],
        json['grade']
        ).then(result=>{
          json.catchOfflineID = result.catchOfflineID;
          json.fishCatchOfflineID = result.fishCatchOfflineID;
        });
    }

    p.then(()=>{
      return SqliteInvest.upsertBuyFish(json.offlineID,json.catchOfflineID,json.fishCatchOfflineID,json.amount,json.notes,json.ts,json.synch,json.trxoperation,json.trxdate,json.idmssupplier,json.idmsuser);
    })
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

    SqliteInvest.deleteBuyFish(offlineID,idmssupplier,idmsuser)
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

    if(obj.ctl && obj.ctl === 'map') {
      const style = Object.assign({},s2,{alignItems:'flex-end'});
      const text = obj.value.length > 0 ? obj.value : L('TAP TO SET');
      return (
        <View key={index} style={s2}>
          <Text>{obj.label} {mandatory}</Text>
          <TouchableOpacity onPress={()=>this.openMap(index)}>
            <Text style={{fontWeight:'bold'}}>{text}</Text>
          </TouchableOpacity>
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
    let title = L('ADD FISH');

    if(mode === 'edit') {
      title = L('EDIT FISH');
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

  openMap(index) {
    this.props.navigation.navigate('BuyFishMapScreen', {
      onMapReturn: (longitude,latitude,code) => {
        console.warn(code);
        this.setInput(index,code);
      }
    });
  }


//   createCatch(catchOfflineID,idmssupplier,fishermanOfflineID,shipOfflineID,fishOfflineID,fishingGround,portName,fishername) {
//     const curDate = moment().format('YYYY-MM-DD');
//     const json = {};
//     json['idtrcatchofflineparam'] = catchOfflineID;
//     json['idmssupplierparam'] = idmssupplier;
//     json['idfishermanofflineparam'] = fishermanOfflineID;
//     json['idbuyerofflineparam'] = null;
//     json['purchaseuniquenoparam'] = catchOfflineID;
//     json['idshipofflineparam'] = shipOfflineID;
//     json['idfishofflineparam'] = fishOfflineID;
//     json['purchasedateparam'] = curDate; //2019-10-24
//     json['purchasetimeparam'] = '00:00:00';
//     json['catchorfarmedparam'] = '1';
//     json['bycatchparam'] = '0';
//     json['fadusedparam'] = '0';
//     json['productformatlandingparam'] = '0';
//     json['unitmeasurementparam'] = '1';
//     json['quantityparam'] = '0';
//     json['weightparam'] = '0';
//     json['fishinggroundareaparam'] = fishingGround; //715,O37
//     json['purchaselocationparam'] = null;
//     json['uniquetripidparam'] = null;
//     json['datetimevesseldepartureparam'] = curDate;
//     json['datetimevesselreturnparam'] = curDate;
//     json['portnameparam'] = portName;
//     json['fishermannameparam'] = fishername;
//     json['fishermanidparam'] = null;
//     json['fishermanregnumberparam'] = null;
//     json['priceperkgparam'] = null;
//     json['totalpriceparam'] = null;
//     json['loanexpenseparam'] = null;
//     json['otherexpenseparam'] = null;
//     json['postdateparam'] = null;

//   }


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
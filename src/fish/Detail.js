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
  Image
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

const lib = require('../lib');
const L = require('../dictionary').translate;

class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('FISH')} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };
  // $idmsfishparam = $request->idmsfish;
  // $idltfishparam = $request->idltfish;
  // $indnameparam = $request->indname;
  // $photoparam = $request->photoparam;
  // $localnameparam = $request->localname;
  // $idmssupplierparam = $request->idmssupplier;

  // idfishofflineparam;
  // idltfishparam;
  // indnameparam;		
  // photoparam;
  // localnameparam;
  // idmssupplierparam;
  // priceparam;

  constructor(props) {
    super(props);
    this.state = {
      show:'busy',
      mode:'add',
      inputs:[
        {label:'Id',key:'idfishofflineparam',value:'',disabled:true},
        {label:'Supplier id',key:'idmssupplierparam',value:'',disabled:true},
        {label:L('Indonesian Name'),key:'indnameparam',value:''},
        {label:L('English Name'),key:'english_nameparam',value:'',notEditable:true,mandatory:true},
        {label:'ID LTFish',key:'idltfishparam',value:'',notEditable:true,mandatory:true,disabled:true},
        {label:L('ASFIS Code'),key:'threeacode',value:'',notEditable:true,mandatory:true},
        {label:L('Photo'),key:'photoparam',value:'',ctl:'camera'},
        {label:L('Local Name'),key:'localnameparam',value:''},
        {label:L('Est. Price'),key:'priceparam',value:'0',keyboardType:'numeric'},
      ],
      errMsg:''
    }
  }

  componentDidMount() {
    const mode = this.props.navigation.getParam('mode','add');
    const login = this.props.stateLogin;

    const inputs = this.state.inputs.slice();
    inputs[1].value = login.idmssupplier;

    if(mode === 'add') {
      inputs[0].value = lib.getOfflineId('fish',login.idmsuser);
      const data = this.props.navigation.getParam('data');

      let defaultName = data.scientific_name;
      if(!defaultName || defaultName.length == 0) defaultName = data.threea_code + ' fish';  
      
      let englishName = data.english_name;
      if(!englishName || englishName.length == 0) englishName = defaultName;

      let indoName = data.indonesian_name;
      if(!indoName || indoName.length == 0) indoName = englishName;
      
      const idltfish = data.idltfish;
      const threeacode = data.threea_code;
  
      inputs[2] = {label:L('Indonesian Name'),key:'indnameparam',value:indoName};
      inputs[3] = {label:L('English Name'),key:'english_nameparam',value:englishName,notEditable:true,mandatory:true};
      inputs[4] = {label:'ID LTFish',key:'idltfishparam',value:idltfish,notEditable:true,mandatory:true,disabled:true};
      inputs[5] = {label:L('ASFIS Code'),key:'threeacode',value:threeacode,notEditable:true,mandatory:true};
      this.setState({show:'form',inputs:inputs});
    } else if(mode === 'edit') {
      const item = this.props.navigation.getParam('item');
      console.warn(item);
      if(item.idfishoffline) inputs[0].value = item.idfishoffline;
      if(item.indname) inputs[2].value = item.indname;
      if(item.english_name) inputs[3].value = item.english_name;
      if(item.idltfish) inputs[4].value = item.idltfish+'';
      if(item.threea_code) inputs[5].value = item.threea_code;
      if(item.photo) inputs[6].value = item.photo;
      if(item.localname) inputs[7].value = item.localname;
      if(item.price) inputs[8].value = item.price+'';
      this.setState({show:'form',inputs:inputs});
    }


  }

  showError(key) {
    
  }

  handleSave() {
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

    let indname = json['indnameparam'];
    if(indname.length == 0) indname = json['english_nameparam'];
    json['indnameparam'] = indname;
    json['photoparam'] = lib.getFN(json['photoparam']);

    const login = this.props.stateLogin;
    const mode = this.props.navigation.getParam('mode','add');

    /*
      {label:'Id',key:'idfishofflineparam',value:'',disabled:true},
      {label:'Supplier id',key:'idmssupplierparam',value:'',disabled:true},
      {label:'Indonesia Name',key:'indnameparam',value:''},
      {label:'English Name',key:'english_nameparam',value:'',notEditable:true,mandatory:true},
      {label:'ID LTFish',key:'idltfishparam',value:'',notEditable:true,mandatory:true,disabled:true},
      {label:'ASFIS Code',key:'threeacode',value:'',notEditable:true,mandatory:true},
      {label:'Photo',key:'photoparam',value:'',ctl:'camera'},
      {label:'Local Name',key:'localnameparam',value:''},
      {label:'Est. Price',key:'priceparam',value:'0',keyboardType:'numeric'},
    */

    const offlineJson = {
      idfishoffline:json['idfishofflineparam'],
      indname:json['indnameparam'],
      localname:json['localnameparam'],
      idltfish:json['idltfishparam'],
      threea_code:json['threeacode'],
      scientific_name:'',
      indonesian_name:json['indnameparam'],
      english_name:json['english_nameparam'],
      french_name:'',
      spanish_name:'',
      photo:'',
      price:json['priceparam']
    }

    let p = null;

    if(mode === 'add') {
      p = this.props.actions.addFish(json,offlineJson);
    } else if(mode === 'edit') {
      p = this.props.actions.editFish(json,offlineJson);      
    }

    p
    .then(()=>{
      return this.props.actions.getFishes();
    })
    .then(()=>{
      this.setState({show:'form'});
      this.props.navigation.navigate('CreateFishList');   
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});      
    });
  }

  handleRemove() {
    this.setState({show:'busy'});
    const idfishofflineparam = this.state.inputs[0].value;
    this.props.actions.removeFish({idfishofflineparam:idfishofflineparam})
    .then(()=>{
      return this.props.actions.getFishes();
    })
    .then(()=>{
      this.setState({show:'form'});
      this.props.navigation.navigate('CreateFishList');   
    })
    .catch(err=>{
      console.warn(err);
      this.setState({show:'form'});
    });
  }

  useCamera(index) {
    this.props.navigation.navigate('CreateFishCamera', {
      msg:'fish photo',
      onCameraReturn: (data,msg) => this.setInput(index,data.uri) 
    });
  }

  onSearchReturn(data,index) {
    this.setInput(index,data.english_name);
    const inputs = this.state.inputs;
    const index2 = _.findIndex(this.state.inputs,{key:'idltfishparam'});
    this.setInput(index2,data.idltfish);

    console.warn(data);
  }

  searchFish(index) {
    this.props.navigation.navigate('CreateFishSearch', {
      onSearchReturn: (data) => this.onSearchReturn(data,index) 
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
    const mandatory = ''; // obj.mandatory ? '(mandatory)' : '';

    if(!editable) return null;

    const textEditable = obj.notEditable ? false : true;

    if(obj.ctl && obj.ctl === 'camera') {
      let photo = (<View style={{width:48,height:48,borderRadius:24,backgroundColor:'gray'}} />);
      if(obj.value.length > 0) {
        const img = obj.value;
        console.warn('imgurl:',obj.value);
        photo = (
          <Image 
          style={{width:48,height:48,borderRadius:24}}
          source={{uri:img}} />
        );
      }

      return (
        <View key={index} style={s2}>
          <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
            {photo}
          </View>
          <TouchableOpacity onPress={()=>this.useCamera(index)}>
            <Text style={{fontWeight:'bold'}}>{L('TAKE PICTURE')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

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

    if(obj.ctl && obj.ctl === 'searchFish') {
      let left = (<Text>{obj.label}: {L('NOT SET')}</Text>);
      if(obj.value.length > 0) {
        left = (<Text>{obj.label}: {obj.value}</Text>);
      }
      return (
        <View key={index} style={s2}>
          {left}
          <TouchableOpacity onPress={()=>this.searchFish(index)}>
            <Text style={{fontWeight:'bold'}}>{L('SET FISH')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={index} style={s1}>
        <TextField
          editable={textEditable}
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
    const disabled = false;

    let bottom = (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Button disabled={disabled} raised primary text={L('Save')} onPress={()=>this.handleSave()} />
        </View>
      </View>  
    );
    
    let title = L('NEW FISH');

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
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login,
    stateData: state.Data
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
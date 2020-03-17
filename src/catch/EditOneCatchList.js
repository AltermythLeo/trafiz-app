<CheckBox isChecked={true} />
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Picker,
  ScrollView
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import CheckBox from 'react-native-check-box'

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('EDIT FISH IN CATCH')} />
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
      quality:'A',
      weight:'',
      catchIndex:null,
      gradeIndex:null,
      tempNotes:'',
      closedMode:false
    }
  }

  componentDidMount() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const catchIndex = _.findIndex(catches,{idtrcatchoffline:ref.idtrcatchoffline});
    const subdata = this.props.navigation.getParam('subData');
    const disableDeleteReason = this.props.navigation.getParam('disableDeleteReason',false);
    let closedMode = false;
    if(disableDeleteReason == 'closed') closedMode = true;
    const tempNotes = subdata.description ? ''+subdata.description : '';


    console.warn(subdata);
    this.setState({
      show:'list',
      quality:''+subdata.grade,
      weight:''+subdata.amount,
      fishcatchData:subdata,
      catchIndex:catchIndex,
      tempNotes:tempNotes,
      closedMode:closedMode
    });

  }

  handleSave() {
    const weightTxt = this.state.weight;
    const weight = Number(weightTxt);
    const gradeTxt = this.state.quality;
    const ref = this.state.fishcatchData;
    const json = {
      idtrfishcatchofflineparam:ref.idtrfishcatchoffline,
      amountparam:weightTxt,
      gradeparam:gradeTxt,
      descparam:this.state.tempNotes
    }

    const ref2 = this.props.navigation.getParam('data');
    const offlineJson = {
      idtrcatchoffline:ref2.idtrcatchoffline,
      idtrfishcatchoffline:ref.idtrfishcatchoffline,
      amount:weight,
      grade:gradeTxt,
      descparam:this.state.tempNotes
    }

    this.setState({show:'busy'});
    this.props.actions.editFishInCatchList(json,offlineJson)
    .then(()=>{
      return this.props.actions.getCatchFishes()
    })
    .then(()=>{
      return lib.delay(1000);
    })
    .then(()=>{
      this.props.navigation.goBack();
    });
  }

  handleRemove() {
    const ref = this.state.fishcatchData;
    const idtrfishcatchoffline = ref.idtrfishcatchoffline;
    const ref2 = this.props.navigation.getParam('data');
    const idtrcatchoffline = ref2.idtrcatchoffline;

    const offlineJson = {
      idtrcatchoffline,
      idtrfishcatchoffline
    }
  
    this.setState({show:'busy'});

    let p = this.props.actions.popFishFromCatchList({idtrfishcatchofflineparam:idtrfishcatchoffline},offlineJson);
  
    p
    .then(()=>{
      return this.props.actions.synchronizeNow()
    })
    .then(()=>{
      return this.props.actions.getCatchFishes()
    })
    .then(()=>{
      this.props.navigation.goBack();
    });
  }

  renderCardItem(rowData,index) {
    const btnStyle = { container: { borderWidth:1,borderColor: 'gainsboro' }};
    
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    let src = null;
    // if(data.sailLetterPhoto.length > 0) src = {uri:data.sailLetterPhoto};
    const name = data.fishermanname;
    const job = 'FISHERMAN'; //todo

    return (
      <View>
        <View style={{height:10}} />
        <View style={{backgroundColor:'white',elevation:1,padding:10}}>
          <Text style={{}}>{data.postdate}</Text>
          <Text style={{fontWeight:'bold'}}>{name} ({job})</Text>
          <Text style={{fontWeight:'bold'}}>ID: -</Text>
          <Text />
          <Text style={{}}>{data.shipName}</Text>
          <Text style={{}}>{L('Vessel Unique ID:')} -</Text>
          <Text style={{}}>{data.fishinggroundarea}</Text>
          <Text style={{}}>{L('Date of departure:')} {data.datetimevesseldeparture}</Text>
          <Text />
          <View style={{flexDirection:'row'}}>
            <View style={{width:48,height:48,borderRadius:24,backgroundColor:'gray'}}>
              <Image           
                style={{width:48,height:48,borderRadius:24}}
                source={src} />
            </View>
            <View style={{flex:1,paddingLeft:10,justifyContent:'center'}}>
              <Button style={btnStyle} text={L('History')} onPress={()=>console.log('!')}/>
            </View>
          </View>
        </View>
      </View>
    );
  }

  setQuality(code) {
    this.setState({quality:code});
  }

  renderNotesInput() {
    return (
      <View style={{flex:1,backgroundColor:'white',elevation:1,padding:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
        <View style={{flex:1}}>
          <TextField
            disabled={this.state.closedMode}
            tintColor={lib.THEME_COLOR}
            label={L('Notes')}          
            multiline={true}
            value={this.state.tempNotes}
            onChangeText={ (text) => this.setState({tempNotes:text}) }
          />
        </View>
      </View>
    );
  }


  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    const space = <View style={{height:5}} />;

    const ref = this.props.navigation.getParam('data');
    let disableDeleteReason = this.props.navigation.getParam('disableDeleteReason',false);
    if(disableDeleteReason) disableDeleteReason = true;
    const cData = [false,false,false];

    let fishName = ref.englishname.toUpperCase();
    const english = (this.props.stateSetting.language == 'english');
    if(!english) fishName = ref.indname.toUpperCase();

    const c1 = cData[0] ? {color:'blue'} : {color:'gray'};
    const c2 = cData[1] ? {color:'blue'} : {color:'gray'};
    const c3 = cData[2] ? {color:'blue'} : {color:'gray'};

    const compliance = (
      <View style={{flexDirection:'row',alignItems:'flex-end'}}>
        <Text style={c1}> ID</Text>
        <Text style={c2}> EU</Text>
        <Text style={c3}> US</Text>
      </View>
    );

    let s1 = {paddingHorizontal:10,height:64,justifyContent:'center'};

    const rows = [0];

    const qualityArr = [
      {label:'AAA',value:'AAA'},
      {label:'AA',value:'AA'},
      {label:'A',value:'A'},
      {label:'B',value:'B'},
      {label:'C',value:'C'},
      {label:'CCC',value:'CCC'},
    ];    

    const closedMode = this.state.closedMode;

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,flexDirection:'row',backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <View style={{flex:1,flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontWeight:'bold'}}>{fishName.toUpperCase()}</Text>
          </View>
        </View>
        <View style={{height:10}} />
        <ScrollView>
        <View style={{backgroundColor:'white',elevation:1,borderBottomWidth:1,borderColor:'gainsboro'}}>
          <View style={{height:64,padding:10,justifyContent:'center'}}>
            <TextField
              disabled={closedMode}
              tintColor={lib.THEME_COLOR}
              onChangeText={(text) => this.setState({weight:text})}
              value={this.state.weight}
              label={L('Weight')+' (kg)'}
            />
          </View>
          <View style={{height:64,flexDirection:'row',padding:10,alignItems:'center'}}>
            <Text style={{}}>{L('Grade')}</Text>
            <Picker
              enabled={!closedMode}
              style={{flex:1}}
              selectedValue={this.state.quality}
              onValueChange={(item, idx) => this.setQuality(item)}
            >
              {qualityArr.map((obj,index)=>{
                return <Picker.Item key={index} label={obj.label} value={obj.value} />;
              })}
            </Picker>
          </View>
        </View>
        <View style={{height:10}} />
        {this.renderNotesInput()}
        </ScrollView>
        <View style={{flexDirection:'row',backgroundColor:'white'}}>
          <View style={{flex:1,padding:3}}>
            <Button disabled={closedMode} raised primary text={L('Save')} onPress={()=>this.handleSave()} />
          </View>
          <View style={{flex:1,padding:3}}>
            <Button disabled={disableDeleteReason||closedMode} raised accent text={L('Remove')} onPress={()=>this.handleRemove()} />
          </View>
        </View>
      </View>
    );
  }
}

// <FlatList
//   data={rows}
//   keyExtractor={(item,index) => (''+index)}
//   renderItem={({item,index}) => this.renderCardItem(item,index)}
//   />

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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;
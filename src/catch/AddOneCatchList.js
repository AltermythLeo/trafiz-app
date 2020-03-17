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
  Dimensions
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

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('+FISH')} />
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
      weightTxt:'0',
      gradeTxt:'',
      fishName:'',
      totalWeight:0,
      fishes:[],
      catchIndex:null,
      showNotes:false,
      tempNotes:'',
      notDelete:[]
    }
  }

  componentDidMount() {
    const addFishDone = this.props.navigation.getParam('addFishDone');
    const willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      payload => {
        console.warn('willBlur', payload);
        willBlurSubscription.remove();
        addFishDone();
      }
    );

    let lastGrade = this.props.stateSetting.lastGrade;
    if(!lastGrade) lastGrade = '';

    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    const notDelete = data.fish ? data.fish.slice() : [];
    _.remove(notDelete,{idtrfishcatchoffline:null});
    
    Promise.resolve()
    .then(result=>{
      this.setState({
        show:'form',
        gradeTxt:lastGrade,
        notDelete:notDelete
      });
    })
  }

  addFish() {
    // addfishcatch
    // idtrcatchofflineparam;
    // idtrfishcatchofflineparam;
    // amountparam;
    // gradeparam;
    // descparam;

    // updatefishcatch
    // idtrfishcatchofflineparam;
    // amountparam;
    // gradeparam;
    // descparam;

    // deletefishcatch
    // idtrfishcatchofflineparam;

    const weightTxt = this.state.weightTxt;
    const weight = Number(weightTxt);
    const gradeTxt = this.state.gradeTxt;
    const code = weightTxt+gradeTxt;
    const catches = this.props.stateData.catches;
    const login = this.props.stateLogin;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    const uid = login.id;
    const fishcatchId = lib.getShortOfflineId('fishcatch',uid.toString(36));
    const idFish = lib.getIdFish(uid.toString(36));

    const json = {
      idtrcatchofflineparam:ref.idtrcatchoffline,
      idtrfishcatchofflineparam:fishcatchId,
      amountparam:weightTxt,
      gradeparam:gradeTxt,
      descparam:this.state.tempNotes,
      idfishparam:idFish
    }

    // "idtrfishcatch":"fcf3afbc8e6311e89cd1000d3aa384f1",
    // "idtrfishcatchoffline":"fishcatch-d51597cf802411e89cd1000d3aa384f1-1532342070830-1388",
    // "amount":100,
    // "grade":"AAA",
    // "description":"",
    // "idfish":"071F633W"

    const offlineJson = {
      idtrcatchoffline:ref.idtrcatchoffline,
      idtrfishcatchoffline:json['idtrfishcatchofflineparam'],
      amount:json['amountparam'],
      grade:json['gradeparam'],
      description:json['descparam'],
      idfish:idFish,
    }

    this.props.actions.setSetting('lastGrade',gradeTxt);

    // this.setState({show:'busy'});
    let p = this.props.actions.addFishToCatchList(json,offlineJson);

    p
    .then(()=>{
      return this.setState({
        show:'form',
        weightTxt:'0',
        // gradeTxt:'B',
        tempNotes:''
      });
    });
  }

  removeLast() {

    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    const raw = data.fish ? data.fish : [];
    // const raw = [];

    // prevent delete for already delivered
    // const fishCatchBuyerNames = this.props.stateData.fishCatchBuyerNames;
    // for(let i=0;i<ori.length;i++) {
    //   const idtrfishcatchoffline = ori[i].idtrfishcatchoffline;
    //   const key = ''+idtrfishcatchoffline;
    //   if(fishCatchBuyerNames[key] && fishCatchBuyerNames[key].close) {
    //   } else {
    //     raw.push(ori[i]);
    //   }
    // }

    const lastIndex = raw.length-1;
    const numNotDelete = this.state.notDelete.length;
    if(raw.length <= numNotDelete) return;
    const idtrfishcatchoffline = raw[lastIndex].idtrfishcatchoffline;

    const offlineJson = {
      idtrcatchoffline:ref.idtrcatchoffline,
      idtrfishcatchoffline
    }

    let p = this.props.actions.popFishFromCatchList({idtrfishcatchofflineparam:idtrfishcatchoffline},offlineJson);

    p
    .then(()=>{
      return this.setState({show:'form',tempNotes:''});
    });

  }

  renderCells(index,arr) {
    let goodArr = arr;
    const key = 'row'+index;
    return (
      <View key={key} style={{flexDirection:'row'}}>
        {goodArr.map((item,index)=>{
          let style = {};
          if(item.close) style = {color:lib.THEME_COLOR};
          return (
            <View key={item.id} style={{flex:1}}>
              <Text style={style}>{item.code}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  renderNotes(notes,row) {
    const yArr = [];
    let index = 0;
    for(let y=0;y<row;y++) {
      const tmp = [];
      for(let x=0;x<6;x++) {
        if(index >= notes.length) break;
        tmp.push(notes[index]);
        index++;
      }

      if(tmp.length < 6) {
        const diff = 6 - tmp.length;
        for(let i=0;i<diff;i++) {
          tmp.push({id:'dummy'+i,code:''});
        }
      }

      yArr.push(tmp);
    }

    return (
      <View>
        {yArr.map((item,index)=>{
          const xArr = item;
          return this.renderCells(index,xArr);
        })}
      </View>
    )    
  }

  press(num) {
    let weight = this.state.weightTxt;
    if(weight == '0' ) weight ='';

    if(num == 'DEL') {
      if(weight.length > 0) weight = weight.slice(0, -1);
      if(weight.length == 0) weight = '0';
      return this.setState({weightTxt:weight});
    }

    if(num == '.') {
      if(weight.indexOf('.') > -1) return;
    }

    const numStr = ''+num;
    weight = weight + numStr;
    return this.setState({weightTxt:weight});
  }

  press2(grade) {
    if(grade == 'NOTES') {
      return;
    }

    let prev = this.state.gradeTxt;
    if(!prev) prev = '';
    let next = prev + grade;
    if(next.length > 3) next = grade;
    return this.setState({gradeTxt:next});
  }

  toggleNotes() {
    const show = this.state.showNotes;
    this.setState({showNotes:!show});
  }

  renderNotesInput() {
    return (
      <View style={{flex:1,backgroundColor:'white',elevation:1,padding:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
        <View style={{flex:1}}>
          <TextInput
            placeholder={L('Write notes..')}
            multiline={true}
            value={this.state.tempNotes}
            onChangeText={ (text) => this.setState({tempNotes:text}) }
          />
        </View>
        <View style={{paddingTop:10}}>
          <Button raised primary text={L('Save')} onPress={()=>this.toggleNotes()} />
        </View>
      </View>
    );
  }

  renderWeightKeyb() {
    const s1 = {flex:1};
    const spc = <View style={{width:5,height:5}} />;
    const btnStyle = {flex:1,container:{flex:1,borderWidth:1,borderColor:'gainsboro'}};

    const btn1 = <Button style={btnStyle} primary text='1' onPress={()=>this.press(1)} />;
    const btn2 = <Button style={btnStyle} primary text='2' onPress={()=>this.press(2)} />;
    const btn3 = <Button style={btnStyle} primary text='3' onPress={()=>this.press(3)} />;
    const btn4 = <Button style={btnStyle} primary text='4' onPress={()=>this.press(4)} />;
    const btn5 = <Button style={btnStyle} primary text='5' onPress={()=>this.press(5)} />;
    const btn6 = <Button style={btnStyle} primary text='6' onPress={()=>this.press(6)} />;
    const btn7 = <Button style={btnStyle} primary text='7' onPress={()=>this.press(7)} />;
    const btn8 = <Button style={btnStyle} primary text='8' onPress={()=>this.press(8)} />;
    const btn9 = <Button style={btnStyle} primary text='9' onPress={()=>this.press(9)} />;
    const btn0 = <Button style={btnStyle} primary text='0' onPress={()=>this.press(0)} />;
    const btnD = <Button style={btnStyle} primary text='DEL' onPress={()=>this.press('DEL')} />;
    const btnComma = <Button style={btnStyle} primary text='.' onPress={()=>this.press('.')} />;
    return (
      <View style={{flex:1}}>
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={s1}>{btn1}</View>
          {spc}
          <View style={s1}>{btn2}</View>
          {spc}
          <View style={s1}>{btn3}</View>
        </View>
        {spc}
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={s1}>{btn4}</View>
          {spc}
          <View style={s1}>{btn5}</View>
          {spc}
          <View style={s1}>{btn6}</View>
        </View>
        {spc}
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={s1}>{btn7}</View>
          {spc}
          <View style={s1}>{btn8}</View>
          {spc}
          <View style={s1}>{btn9}</View>
        </View>
        {spc}
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={s1}>{btnComma}</View>
          {spc}
          <View style={s1}>{btn0}</View>
          {spc}
          <View style={s1}>{btnD}</View>
        </View>
      </View>
    );
  }

  toggleClear() {
    let gradeTxt = this.state.gradeTxt;

    if(gradeTxt.length > 0) gradeTxt = gradeTxt.slice(0, -1);

    this.setState({
      gradeTxt:gradeTxt
    });
  }
  
  renderGradeKeyb() {
    const s = {flex:1};
    const spc = <View style={{width:5,height:5}} />;
    const btnStyle = {flex:1,container:{flex:1,borderWidth:1,borderColor:'gainsboro'}};

    const btnAAA = <Button style={btnStyle} primary text='A' onPress={()=>this.press2('A')} />;
    const btnAA = <Button style={btnStyle} primary text='B' onPress={()=>this.press2('B')} />;
    const btnA = <Button style={btnStyle} primary text='C' onPress={()=>this.press2('C')} />;
    const btnB = <Button style={btnStyle} primary text='D' onPress={()=>this.press2('D')} />;
    const btnC = <Button style={btnStyle} primary text='E' onPress={()=>this.press2('E')} />;
    const btnCCC = <Button style={btnStyle} primary text='F' onPress={()=>this.press2('F')} />;
    const btnNotes = <Button style={btnStyle} primary text={L('DEL')} onPress={()=>this.toggleClear()} />;

    return (
      <View style={{flex:1}}>
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={s}>{btnAAA}</View>
          {spc}
          <View style={s}>{btnAA}</View>
        </View>
        {spc}
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={s}>{btnA}</View>
          {spc}
          <View style={s}>{btnB}</View>
        </View>
        {spc}
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={s}>{btnC}</View>
          {spc}
          <View style={s}>{btnCCC}</View>
        </View>
        {spc}
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={s}></View>
          {spc}
          <View style={s}>{btnNotes}</View>
        </View>
      </View>
    );
  }

  renderCatchList() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    const fishName = data.indname.toUpperCase();

    const raw = data.fish ? data.fish : [];
    let totalWeight = 0;

    const fishCatchBuyerNames = this.props.stateData.fishCatchBuyerNames;

    const fishes = [];
    for(let i=0;i<raw.length;i++) {
      const num = Number(raw[i].amount);
      if(num > 0) {
        totalWeight += Number(raw[i].amount);
        const code = raw[i].amount+''+raw[i].grade;
        const id = i+'';
        const idtrfishcatchoffline = raw[i].idtrfishcatchoffline;
        let close = false;
        if(fishCatchBuyerNames[idtrfishcatchoffline] && fishCatchBuyerNames[idtrfishcatchoffline].close) {
          close = true;
        }
        
        fishes.push({id:idtrfishcatchoffline,code:code,close:close});
      }
    }

    const numNotDelete = this.state.notDelete.length;
    const disableDelete = (fishes.length <= numNotDelete);

    let fishKind = data.englishname.toUpperCase();
    const english = (this.props.stateSetting.language == 'english');
    if(!english) fishKind = data.indname.toUpperCase();

    const unitDef = [
      {label:'individual(s)',value:'1'},
      {label:'basket(s)',value:'0'}  
    ]

    let unitName =_.find(unitDef,{value:''+data.unitmeasurement});
    if(unitName) unitName = unitName.label; else unitName = 'unit';
    unitName = L(unitName);

    const title = fishKind+' ('+fishes.length+' '+unitName+', '+totalWeight+' kg)';
    const notes = fishes;

    let row = Math.ceil(notes.length / 6);
    const cells = this.renderNotes(notes,row);
    const btnStyle = {flex:1,container:{flex:1,borderWidth:1,borderColor:'gainsboro'}};

    const weightTxt = this.state.weightTxt;
    const gradeTxt = this.state.gradeTxt;
    const saveDisable = (weightTxt == '0');
    const lastNotes = this.state.lastNotes; 

    let bottom = null;
    if(this.state.showNotes) {
      bottom = this.renderNotesInput();
    } else {
      bottom = (
        <View style={{flex:1, backgroundColor:'white',elevation:1,padding:10}}>
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1}}><Text style={{fontSize:40}}>{weightTxt}{gradeTxt}</Text></View>
            <View style={{flex:1}}>
              <Button disabled={saveDisable} style={{flex:1,container:{flex:1}}} raised primary text={L('Add Fish')} onPress={()=>this.addFish()} />
            </View>
          </View>
          <View style={{height:10}} />
          <View style={{flex:1,flexDirection:'row'}}>
            <View style={{flex:3,paddingRight:10}}>{this.renderWeightKeyb()}</View>
            <View style={{flex:2}}>{this.renderGradeKeyb()}</View>
          </View>
          <View style={{height:10}} />
          <View style={{height:10}} />
        </View>
      );
	  }

    return (
      <View style={{flex:1}}>
        <View style={{flex:1}}>
        <View style={{backgroundColor:'white',elevation:1,padding:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
          <Text style={{fontWeight:'bold'}}>{title}</Text>
          <Text />
          {cells}
          <Text />
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1}}>
            </View>
            <View style={{width:5}} />
            <View style={{flex:1}}>
              <Button disabled={disableDelete} raised accent text={L('Delete')} onPress={()=>this.removeLast()} />
            </View>
          </View>
        </View>
        </View>
        {bottom}
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

    return (
      <View style={{flex:1}}>
        {this.renderCatchList()}
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

ListScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListScreen)

export default ListScreen;
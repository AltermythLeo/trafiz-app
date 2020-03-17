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
import { Navicon, BackButton, OnlineIndicator } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as Api from './Api';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'busy',
    }
  }

  componentDidMount() {
  }

  renderNotes(notes,row) {
    const arr = [];
    let index = 0;
    for(let x=0;x<4;x++) {
      const tmp = [];
      for(let y=0;y<row;y++) {
        if(index >= notes.length) break;
        tmp.push(notes[index]);
        index++;
      }
      arr.push(tmp);
    }

    return (
      <View style={{flex:2,flexDirection:'row'}}>
        <View style={{flex:1}}>
          {arr[0].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[1].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[2].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[3].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
      </View>
    )    
  }
  
  renderCardItem(data,index) {
    const fishes = data.fish ? data.fish : [];
    let totalWeight = 0;
    let totalNum = 0;

    const fishIdToDelivery = this.props.stateData.fishIdToDelivery;

    const notes = [];
    for(let i=0;i<fishes.length;i++) {
      const num = Number(fishes[i].amount);
      if(num > 0) {
        totalWeight += Number(fishes[i].amount);
        totalNum++;
        const code = fishes[i].amount+''+fishes[i].grade;

        const idtrfishcatchoffline = fishes[i].idtrfishcatchoffline;
        const idfish = fishes[i].idfish;
        let close = false;
        if(fishIdToDelivery[idfish] && fishIdToDelivery[idfish].close) {
          close = true;
        }

        notes.push({id:fishes[i].idtrfishcatchoffline,code:code,close:close});
      }
    }
    
    const totalprice = Number(data.totalprice);
    const loanexpense = Number(data.loanexpense);
    const otherexpense = Number(data.otherexpense);
    const netBuyPrice = totalprice - loanexpense - otherexpense;

    let name = data.fishermanname;
    if(data.buyersuppliername) name = data.buyersuppliername;
    
    let fishKind = data.englishname.toUpperCase();

    const english = (this.props.stateSetting.language == 'english');
    if(!english && data.indname && data.indname.length > 0) fishKind = data.indname.toUpperCase();

    const unitDef = [
      {label:'individual(s)',value:'1'},
      {label:'basket(s)',value:'0'}  
    ]

    let unitName =_.find(unitDef,{value:''+data.unitmeasurement});
    if(unitName) unitName = unitName.label; else unitName = 'unit';
    unitName = L(unitName);

    const title = name+' ('+fishKind+', '+totalNum+' '+unitName+', '+totalWeight+' kg)';
    let calc = L('BUY PRICE NOT SET');
    if(netBuyPrice > 0) calc = 'Rp '+lib.toPrice(otherexpense+'');
    let status = <Text style={{color:'gray',textAlign:'right',fontSize:10}}>{calc}</Text>;

    let row = 4;
    if(notes.length > 16) {
      row = Math.ceil(notes.length / 4);
    }

    const cells = this.renderNotes(notes,row);

    return (
      <View style={{backgroundColor:'white',elevation:1,padding:10}}>
          <View style={{flexDirection:'row'}}>
            <View style={{flex:2}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
            <View style={{flex:1,alignItems:'flex-end'}}></View>
          </View>
        <Text />
        <View style={{flexDirection:'row'}}>
          <View style={{flex:2}} />
          <View style={{flex:1,justifyContent:'flex-end'}}>{status}</View>
        </View>
      </View>
    );
  }

  render() {
    const rows = this.props.navigation.getParam('items3',[]);

    if(rows.length == 0) {
      return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:10}}>
          <Text style={{textAlign:'center'}}>{L('NO OTHER EXPENSE PAID ON THIS DATE')}</Text>
        </View>
      );

    }

    return (
      <View style={{flex:1}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItem(item,index)}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
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
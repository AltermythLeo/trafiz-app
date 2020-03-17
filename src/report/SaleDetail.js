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
  
  renderViewData(deliverySheet,index) {
    const viewData = deliverySheet.viewData;
    const notes = [];
    for(let i=0;i<viewData.gradeCodes.length;i++) {
      const code = viewData.gradeCodes[i];
      const id = ''+index+''+i;
      notes.push({id:id,code:code});
    }
    
    const buyerName = viewData.buyerName;
    const fishName = viewData.fishNameEng.toUpperCase();
    const unitName = viewData.unitName ? viewData.unitName : 'unit';

    const title = buyerName+' ('+viewData.numUnit+' '+unitName+', '+viewData.totalWeight+' kg)';
    const cData = viewData.compliance;
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

    const calc = 'Rp '+lib.toPrice(viewData.sellPrice);
    let status = <Text style={{color:'gray',textAlign:'right',fontSize:10}}>{calc}</Text>;

    let row = 4;
    if(notes.length > 16) {
      row = Math.ceil(notes.length / 4);
    }

    const cells = this.renderNotes(notes,row);

    return (
      <View key={index+''}>
          <View style={{backgroundColor:'white',elevation:1,padding:10}}>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:1}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
            </View>
            <Text />
            <View style={{flexDirection:'row'}}>
              {cells}
              <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                <View style={{backgroundColor:lib.THEME_COLOR}}>
                  <Text style={{textAlign:'right',color:'white'}}> {L('DELIVERED')} </Text>
                </View>
                {status}
              </View>
            </View>
          </View>
      </View>
    );
  }

  render() {
    const rows = this.props.navigation.getParam('items',[]);
    const rows2 = this.props.navigation.getParam('items2',[]);

    if(rows.length == 0) {
      return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:10}}>
          <Text style={{textAlign:'center'}}>{L('NO DELIVERY/SALE ON THIS DATE')}</Text>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderViewData(item,index)}
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
    stateData: state.Data
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
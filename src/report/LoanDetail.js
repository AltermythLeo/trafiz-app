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
    Promise.resolve()
    .then(result=>{
      this.setState({show:'list'});
    })
  }

  renderCardItem(data,index) {
    const name = data[0].name;
    const numItem = data.length;
    
    let totLoan = 0;
    for(let i=0;i<numItem;i++) {
      if(data[i].strike) continue;
      totLoan += Number(data[i].total);
    }

    const items = data;
    
    return (
      <View>
        <View style={{backgroundColor:'white',elevation:1}}>
          <View style={{padding:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
            <Text style={{fontWeight:'bold'}}>{name}</Text>
            <Text style={{}}>{numItem} {L('item(s)')}, Rp {lib.toPrice(totLoan)}</Text>
          </View>
          {items.map((o,i)=>{
            const key = ''+index+'-'+i;
            const desc = o.desc;
            const total = Number(o.total);

            let style = {};
            if(o.strike)
              style= {textDecorationLine: 'line-through'};

            return (
              <View key={key} style={{padding:10,flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,borderColor:'gainsboro'}}>
                <Text style={style}>{desc}</Text>
                <Text style={style}>Rp {lib.toPrice(total)}</Text>
              </View>                
            );
          })}
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

    const items = this.props.navigation.getParam('loanItems',[]);

    if(items.length == 0) {
      return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:10}}>
          <Text style={{textAlign:'center'}}>{L('NO LOAN ON THIS DATE')}</Text>
        </View>
      );
    }

    const groupByName = _.groupBy(items,(o)=>{
      return o.name;
    });
    const rows = _.toArray(groupByName);

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
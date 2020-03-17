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
    let name = data.nameloan ? data.nameloan : data.nameloanbuyer;
    const totPayLoan = data.loaninrp;
    const desc = data.descloan;
    const pod = data.paidoffdate.split(' ')[0];
    const str = moment(pod,'YYYY-MM-DD').format('DD MMMM YYYY');
    
    return (
      <View>
        <View style={{backgroundColor:'white',elevation:1,padding:10}}>
          <Text style={{}}>{str}</Text>
          <Text style={{fontWeight:'bold'}}>{name}</Text>
          <Text style={{}}>Rp {lib.toPrice(totPayLoan)}</Text>
          <Text style={{}}>{desc}</Text>
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

    const items = this.props.navigation.getParam('payloanItems',[]);

    if(items.length == 0) {
      return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:10}}>
          <Text style={{textAlign:'center'}}>{L('NO PAY LOAN ON THIS DATE')}</Text>
        </View>
      );
    }

    const rows = items;

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
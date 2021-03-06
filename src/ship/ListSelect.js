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
  TextInput
} from 'react-native';
import _ from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';

const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('FISHING VESSEL')} />
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
      filter:'',
      refreshing:false
    }
  }

  componentDidMount() {
    this.setState({show:'list'});
  }

  refreshList() {
    this.setState({refreshing:true});
    this.props.actions.getShips()
    .then(()=>{
      this.setState({refreshing:false});
    })
  }

  handleSelect(item) {
    const nav = this.props.navigation;
    nav.goBack();
    nav.state.params.onReturnSelect(item);
  }

  renderItem(item,index) {
    const name = item.vesselname_param;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelect(item)}>
        <View style={{padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{flex:1,justifyContent:'center',alignItems:'flex-start'}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
          </View>
        </View>
      </TouchableOpacity>
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

    let rows = this.props.stateData.ships.slice();
    _.remove(rows,{lasttransact:"D"});
    console.warn(rows);

    // filter by search
    const filterStr = this.state.filter.toLowerCase();
    const filteredRows = _.filter(rows, function(o) { 
      return (o.vesselname_param.toLowerCase().indexOf(filterStr) > -1);
    });

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{paddingHorizontal:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
          <TextInput
            placeholder={L('Search by name..')}
            selectionColor={lib.THEME_COLOR}
            underlineColorAndroid='white'
            value={this.state.filter}
            onChangeText={ (text) => this.setState({filter:text}) }
          />
        </View>
        <View style={{flex:1}}>
          <FlatList
            onRefresh={()=>this.refreshList()}
            refreshing={this.state.refreshing}                    
            data={filteredRows}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
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


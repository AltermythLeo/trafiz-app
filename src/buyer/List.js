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

class Screen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('BUYER')} />
      ),

      headerLeft: (
        <Navicon navigation={navigation}/>
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
    this.props.actions.getBuyers()
    .then(()=>{
      this.setState({refreshing:false});
    })
  }

  handleAdd() {
    this.props.navigation.push('BuyerDetailScreen',{
      mode:'add'
    });
  }

  handleEdit(item) {
    this.props.navigation.push('BuyerDetailScreen',{
      mode:'edit',
      item:item
    });
  }

  renderItem(item,index) {
    const name = item.name_param;

    return (
      <TouchableOpacity onPress={()=>this.handleEdit(item)}>
        <View style={{padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{justifyContent:'center',flex:1}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
          </View>
          <View style={{width:10}} />
          <View style={{justifyContent:'center',alignItems:'center'}}>
            <FontAwesome name='arrow-right' />
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

    let rows = this.props.stateData.buyers.slice();
    _.remove(rows,{lasttransact:"D"});

    // filter by search
    const filterStr = this.state.filter.toLowerCase();
    const filteredRows = _.filter(rows, function(o) { 
      return (o.name_param.toLowerCase().indexOf(filterStr) > -1);
    });

    const sorted = filteredRows.sort(function (a, b) {
      let nameA = a.name_param;
      if(nameA) nameA = nameA.toLowerCase();
      let nameB = b.name_param;
      if(nameB) nameB = nameB.toLowerCase();
      if (nameA < nameB)
        return -1;
      if (nameA > nameB)
        return 1;
      return 0;
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
            data={sorted}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
        <View style={{}}>
          <Button raised primary text={L('ADD BUYER')} onPress={()=>this.handleAdd()} />
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

Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Screen)

export default Screen;
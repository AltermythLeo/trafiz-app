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
        <Title txt={L('FISHERMAN')} />
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
    this.props.actions.getFishermans()
    .then(()=>{
      this.setState({refreshing:false});
    })
  }

  handleAdd() {
    this.props.navigation.push('CreateFishermanDetail',{
      mode:'add'
    });
  }

  handleEdit(item) {
    this.props.navigation.push('CreateFishermanDetail',{
      mode:'edit',
      item:item
    });
  }

  renderItem(item,index) {
    const name = item.name;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleEdit(item)}>
        <View style={{padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{flex:1,justifyContent:'center'}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name}</Text>
          </View>
          <View style={{width:10}}/>
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

    let rows = this.props.stateData.fishermans.slice();
    _.remove(rows,{lasttransact:"D"});

    // filter by search
    // {
    //   "idmsfisherman":"97c0af9c802c11e89cd1000d3aa384f1",
    //   "idfishermanoffline":"fisherman-d51597cf802411e89cd1000d3aa384f1-1530778939040-6122",
    //   "idmsuser":"97bc0f9a802c11e89cd1000d3aa384f1",
    //   "name":"Test",
    //   "bod":"2018-07-05 00:00:00",
    //   "id_param":"123",
    //   "sex_param":"1",
    //   "nat_param":"ID",
    //   "address_param":"Jkt",
    //   "phone_param":"0813123",
    //   "jobtitle_param":"Captain"
    // }
    const filterStr = this.state.filter.toLowerCase();
    const filteredRows = _.filter(rows, function(o) { 
      return (o.name.toLowerCase().indexOf(filterStr) > -1);
    });

    const sortedRows = _.sortBy(filteredRows, o => o.name);

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
            data={sortedRows}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderItem(item,index)}
          />
        </View>
        <View style={{}}>
          <Button raised primary text={L('ADD FISHERMAN')} onPress={()=>this.handleAdd()} />
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
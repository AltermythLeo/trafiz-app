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

const L = require('../dictionary').translate;
const lib = require('../lib');

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('FISH')} />
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
      refreshing: false
    }
  }

  componentDidMount() {
    this.setState({show:'list'});
  }

  refreshList() {
    this.setState({refreshing:true});
    this.props.actions.getFishes()
    .then(()=>{
      this.setState({refreshing:false});
    })
  }

  handleAdd() {
    this.props.navigation.navigate('CreateFishSearch', {
      mode:'add'
    });
  }

  handleEdit(item) {
    this.props.navigation.push('CreateFishDetail',{
      mode:'edit',
      item:item
    });
  }

  renderItem(item,index) {
    let img = 'https://api.adorable.io/avatars/64/image0.png';
    if(item.photo && item.photo.length > 0) img = item.photo;
    let nameIndo = item.indname;
    if(nameIndo.length == 0 && item.indname.length > 0 ) nameIndo = item.indname;
    if(nameIndo.length == 0) nameIndo = item.english_name;
    const nameEng = item.english_name;
    const nameLocal = item.localname;
    const code = item.threea_code;

    const english = (this.props.stateSetting.language == 'english');

    const name = english ? nameEng : nameIndo;
    const title = name + ' (' + code + ')';
    let desc = nameEng;
    if(item.indonesian_name && item.indonesian_name.length > 0 ) desc = desc + ', '+nameIndo;
    if(nameLocal) desc = desc + ', ' + nameLocal;
    
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleEdit(item)}>
        <View style={{padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{}}>
            <Image 
              style={{width:48,height:48,borderRadius:24}}
              source={{uri:img}} />
          </View>
          <View style={{width:10}} />
          <View style={{flex:1,justifyContent:'center'}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{title}</Text>
            <Text style={{fontSize:10}}>{desc}</Text>
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

    let rows = this.props.stateData.fishes.slice();
    _.remove(rows,{lasttransact:"D"});

    let sortedRows;
    const english = (this.props.stateSetting.language == 'english');

    if(english) 
      sortedRows = _.sortBy(rows, o => o.english_name);
    else 
      sortedRows = _.sortBy(rows, o => o.indname);

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
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
          <Button raised primary text={L('Search Fish')} onPress={()=>this.handleAdd()} />
        </View>
      </View>
    );
  }
}

// <View style={{}}>
// <Button raised primary text='Add Fish' onPress={()=>this.handleAdd()} />
// </View>

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
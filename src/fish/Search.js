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
const Sqlite  = require('../Sqlite');
const L = require('../dictionary').translate;

class SearchScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('SEARCH FISH')} />
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
      searchTerm:'',
      rows:[]
    }
  }

  componentDidMount() {
    this.setState({show:'list'});
  }

  handleSelect(data) {
    const nav = this.props.navigation;
    const mode = nav.getParam('mode','edit');

    if(mode == 'add') {
      return this.props.navigation.push('CreateFishDetail',{
        mode:'add',
        data:data
      });
    }

    nav.goBack();
    nav.state.params.onSearchReturn(data);
  }

  handleTextSearch(text) {
    if(text.length >= 3) {
      this.setState({
        searchTerm:text,
        show:'busy'
      });    
      
      Sqlite.searchFish(text)
      .then(rows=>{
        this.setState({
          searchTerm:text,
          rows:rows,
          show:'result'
        });    
      })
    } else {
      this.setState({
        searchTerm:text,
        rows:[],
        show:'result'
      });  
    }
  }

  renderItem(item,index) {
    let defaultName = item.scientific_name;
    if(!defaultName || defaultName.length == 0) defaultName = item.threea_code + ' fish';

    let name = item.english_name;
    if(!name || name.length == 0) name = defaultName;
    const code = item.threea_code;
    let otherName = item.scientific_name;
    if(item.indonesian_name && item.indonesian_name.length > 0) otherName += ','+item.indonesian_name;
    return (
      <TouchableOpacity style={{}} onPress={()=>this.handleSelect(item)}>
        <View style={{padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <View style={{justifyContent:'center'}}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{name} ({code})</Text>
            <Text style={{fontSize:10}}>{otherName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const rows = this.state.rows;

    let content = (
      <View style={{flex:1}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index)}
        />
      </View>
    );

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{paddingHorizontal:10,borderBottomWidth:1,borderColor:'gainsboro'}}>
          <TextInput
            placeholder={L('Enter fish name to search (min. 3 chars)')}
            selectionColor={lib.THEME_COLOR}
            underlineColorAndroid='white'
            value={this.state.searchTerm}
            onChangeText={ (text) => this.handleTextSearch(text) }
          />
        </View>
        {content}
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

SearchScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchScreen)

export default SearchScreen;
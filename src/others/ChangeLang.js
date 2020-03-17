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
import { Button, Checkbox } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';

const lib = require('../lib');
const dictionary = require('../dictionary');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('CHANGE LANGUAGE')} />
      ),
      headerLeft: (
        <Navicon navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      show:'busy'
    }
  }

  componentDidMount() {
    const lang = this.props.stateSetting.language;
    this.setState({
      show:'list',lang:lang // language:0
    });
  }

  handleSelect(item) {
    this.props.navigation.push('CreateFishermanDetail',{
      mode:'edit',
      item:item
    });
  }

  changeLanguage(lang) {
    this.setState({lang});
  }

  handleSave() {
    const lang = this.state.lang;
    dictionary.setLanguage(lang);
    this.props.actions.setSetting('language',lang);
    this.props.navigation.navigate('HomeMenu');
  }

  renderItem(item,index) {
    const label = item.label;
    const value = item.value;
    const curLang = this.state.lang; // this.props.stateSetting.language;
    const checked = (value == curLang)
    return (
      <View style={{paddingVertical:10,borderBottomColor:'gainsboro',borderBottomWidth:1}}>
        <Checkbox label={label} value={value} checked={checked} onCheck={()=>this.changeLanguage(value)}/>
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

    const rows = [
      {label:'English',value:'english'},
      {label:'Bahasa Indonesia',value:'indonesia'},
      {label:'Thai',value:'thai'}
    ];

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderItem(item,index)}
        />
        <View style={{padding:0}}>
          <Button raised primary text={L('Save')} onPress={()=>this.handleSave()} />
        </View>
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
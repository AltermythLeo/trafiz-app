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
    Dimensions,
    ScrollView,
    Picker,
    DatePickerAndroid
  } from 'react-native';
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { BackButton, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import * as investActions from '../actions/InvestActions';
import SelectTakeLoanToPayView from './views/SelectTakeLoanToPayView';

const lib = require('../lib');
const L = require('../dictionary').translate;
const OldTrafizHelper = require('./OldTrafizHelper');
const UIHelper = require('./UIHelper');
const Gears = require('../Gears');
let onReturn;

class TheScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: (
        <Title txt={L('SELECT VESSEL')} size={lib.THEME_FONT_LARGE} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      refreshing:false,
      rows:[]
    }
//    this.setState({rows:this.props.navigation.state.params.ships});
//    this.refreshList();
  }

  componentDidMount() {
    this.setState({refreshing:false});
    const nav = this.props.navigation;
    console.warn(nav);

    //only get parameter if the prevscreen is buyfish (or else it will be nulled)
    if(nav.state.params && nav.state.params.prevScreen == 'BuyFish')
      onReturn = nav.state.params.onShipSelectReturn.bind(this);
  }

  refreshList() {
    this.setState({refreshing:true});
    this.props.actions.getShips()
    .then(()=>{
      this.setState({refreshing:false});
    })
  }

  goToCreateVessel()
  {
    this.props.navigation.push('InvestVesselCreateScreen',{
        prevScreen:'InvestVesselSelectScreen',
        mode:'add'
      });
  }

  truncateText(txt)
  {
    const maxLength = 30;
    return txt.length > maxLength ? (txt.substr(0, maxLength) + '...') : txt;
  }

  onClickRow(offlineShipID)
  {
    const nav = this.props.navigation;
    nav.goBack();
    onReturn(offlineShipID);
  }

  renderItem(item,index) {
    const title = item.vesselname_param + '(' + Gears.getName(item.vesselgeartype_param) +')';
    return (
      <TouchableOpacity style={{height:60}} onPress={()=>this.onClickRow(item.idshipoffline)}>
        <View style={{flex:1, flexDirection:'row'}}>
          <View style={{flex:1, padding:10,flexDirection:'row',borderBottomColor:'gainsboro',borderBottomWidth:1}}>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text numberOfLines={1} style={{textAlignVertical:'center', flex:1, fontSize:lib.THEME_FONT_MEDIUM, color:lib.THEME_COLOR_BLACK}}>
                {title}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

render() {
    let rows = this.props.stateData.ships;
    console.warn(rows);

    //Remove deleted vessel (lasttransact = "D")
    _.remove(rows,{lasttransact:"D"});

    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    if(rows === undefined || rows.length == 0)
        return(
            <View style={{flex:1}}>
                <View style={{flex:1, backgroundColor:'white', paddingTop : 30}}>
                    <Text style={{fontSize:lib.THEME_FONT_LARGE, color:lib.THEME_COLOR_BLACK, textAlign:'center'}}>{L('Currently, there is no payables.')}</Text>
                </View>
                <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('ADD FISHING VESSEL')}
                    onPress={()=>
                    {
                        this.goToCreateVessel();
                    }}></Button>
            </View>
        );
    else
        return (
            <View style={{flex:1}}>
                <View style={{flex:1, backgroundColor:'white'}}>
                  <FlatList
                      onRefresh={()=>this.refreshList()}
                      refreshing={this.state.refreshing}            
                      data={rows}
                      keyExtractor={(item,index) => (''+index)}
                      renderItem={({item,index}) => this.renderItem(item,index)}
                  />
                </View>
                <View style={{}}>
                
                <Button style={{container:{height:50}, text:{fontSize:lib.THEME_FONT_LARGE}}} primary raised uppercase text={L('ADD FISHING VESSEL')}
                  onPress={()=>
                  {
                    this.goToCreateVessel();
                  }}></Button>
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
    stateInvest: state.Invest,
    stateSetting: state.Setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
    investActions: bindActionCreators(investActions, dispatch)
  };
}

TheScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(TheScreen)

export default TheScreen;
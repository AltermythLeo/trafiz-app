<CheckBox isChecked={true} />
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
  Dimensions,
  Picker,
  ScrollView
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
import CheckBox from 'react-native-check-box'

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
      fishName:'',
      numUnit:0,
      totalWeight:0,
      perKiloPrice:'0',
      buyPrice:'0',
      loanPaid:'0',
      loanExpense:'0',
      otherExpense:'0',
      unitName:'unit'
    }
  }

  componentDidMount() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});    

    let fishName = data.englishname.toUpperCase();
    const english = (this.props.stateSetting.language == 'english');
    if(!english) fishName = data.indname.toUpperCase();

    const unitDef = [
      {label:'individual(s)',value:'1'},
      {label:'basket(s)',value:'0'}  
    ]

    let unitName =_.find(unitDef,{value:''+data.unitmeasurement});
    if(unitName) unitName = unitName.label; else unitName = 'unit';
    this.setState({unitName});

    const fishes = data.fish ? data.fish : [];
    let totalWeight = 0;
    let totalNum = 0;

    const fishGrades = {};

    for(let i=0;i<fishes.length;i++) {
      const num = Number(fishes[i].amount);
      if(num > 0) {
        totalWeight += Number(fishes[i].amount);
        totalNum++;

        const code = ''+fishes[i].amount+fishes[i].grade;
        if(!fishGrades[code]) fishGrades[code] = 1;
        else fishGrades[code] = fishGrades[code] + 1;
      }
    }

    const fg = [];
    for (let key in fishGrades) {
      if (fishGrades.hasOwnProperty(key)) {
        const num = fishGrades[key];
        fg.push({grade:key,num:num,price:'0'});
      }
    }
    
    const space = <View style={{height:5}} />;
    const totalprice = Number(data.totalprice);

    this.setState({
      show:'form',
      fishName:fishName,
      numUnit:totalNum+'',
      totalWeight:totalWeight+'',
      buyPrice:totalprice+'',
      fishGrades:fg
    });
    
  }

  next() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    this.props.navigation.replace('CatchCalcCatchListValueScreen',{
      data:data,
      buyPrice:this.state.buyPrice
    });
  }

  setGradePrice(text,index) {
    const source = this.state.fishGrades.slice();
    // const index = _.findIndex(source,{grade:code});
    source[index].price = text;

    let tot = 0;
    for(let i=0;i<source.length;i++) {
      let price = 0;
      if( source[i].price && source[i].price.length > 0 )
        price = Number(source[i].price);
      tot += price;
    }
    
    this.setState({fishGrades:source,buyPrice:''+tot});
  }

  renderGradePrice(data,index) {
    if(data.total) {
      return (
        <View style={{flexDirection:'row',paddingVertical:10}}>
          <View style={{justifyContent:'center',padding:10}}>
            <Text style={{fontWeight:'bold'}}>
              {L('Estimated total buy price')}
            </Text>
          </View>
          <View style={{flex:1,paddingRight:10}}>
            <Text style={{flex:1,fontSize:24,fontWeight:'bold',textAlign:'right'}}>
              Rp {lib.toPrice(this.state.buyPrice)}
            </Text>
          </View>
        </View>        
      );
    }

    return (
      <View style={{backgroundColor:'white',elevation:1,flexDirection:'row'}}>
        <View style={{flex:1,justifyContent:'center',padding:10}}>
          <Text style={{}}><Text style={{fontWeight:'bold'}}>{data.grade}</Text> x {data.num}</Text>
        </View>
        <View style={{flex:1,paddingRight:10}}>
          <TextField
            keyboardType='numeric'
            tintColor={lib.THEME_COLOR}
            onChangeText={(text) => this.setGradePrice(text,index)}
            value={data.price}
            label={L('Price')+' (Rp)'}
          />
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

    const groupByWeightAndGrade = this.state.fishGrades.slice();
    groupByWeightAndGrade.push({total:true});

    const fishName = this.state.fishName;
    const numUnit = this.state.numUnit;
    const totalWeight = this.state.totalWeight;

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <Text style={{fontWeight:'bold'}}>{fishName} ({numUnit} {L(this.state.unitName)}, {totalWeight} kg)</Text>
        </View>
        <View style={{height:10}} />
        <View style={{flex:1}}>
          <FlatList
            data={groupByWeightAndGrade}
            keyExtractor={(item,index) => (''+index)}
            renderItem={({item,index}) => this.renderGradePrice(item,index)}
            extraData={groupByWeightAndGrade}
            ItemSeparatorComponent={()=><View style={{height:10}} />}
            keyboardShouldPersistTaps={'always'}
          />
        </View>
        <View style={{height:10}} />
        <Button raised primary text={L('Next')} onPress={()=>this.next()} />
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
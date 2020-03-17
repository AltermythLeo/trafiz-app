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
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
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
      headerTitle: (
        <Title txt={L('CALC FISH')+' (1/2)'} />
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
      fishName:'',
      numUnit:0,
      totalWeight:0,
      perKiloPrice:'0',
      buyPrice:'0',
      loanPaid:'0',
      loanExpense:'0',
      otherExpense:'0',
      unitName:'unit',
      inputOnFocus:-1
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
    let totalNum = fishes.length;

    let fishGrades = [];

    for(let i=0;i<fishes.length;i++) {
      const num = Number(fishes[i].amount);
      if(num > 0) {
        //const name = ''+fishes[i].amount+fishes[i].grade;
        const name = ''+fishes[i].idfish;
        const grade = ''+fishes[i].grade;
        fishGrades.push({name:name,grade:grade,num:num,price:'0',pricePerKg:'0'});
        totalWeight += num;
      }
    }

    let totalprice = Number(data.totalprice);

    const extraData = this.props.stateData.extraData;
    // use extraDataCatch to init default value
    let extraDataCatch = {};
    if(extraData && extraData.catch && extraData.catch[ref.idtrcatchoffline]) {
      extraDataCatch = extraData.catch[ref.idtrcatchoffline];
      if(extraDataCatch.fishGrades) {
        fishGrades = extraDataCatch.fishGrades;
        totalprice = 0;
        for(let i=0;i<fishGrades.length;i++) {
          const fg = Number(fishGrades[i].price);
          totalprice += fg;
        }
      }
    }

    const space = <View style={{height:5}} />;

    
    this.setState({
      show:'form',
      fishName:fishName,
      numUnit:totalNum+'',
      totalWeight:totalWeight+'',
      buyPrice:totalprice+'',
      fishGrades:fishGrades
    });
    
  }

  next() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    const extraDataCatch = {
      fishGrades:this.state.fishGrades      
    }
    const offlineId = ref.idtrcatchoffline;
    this.props.actions.setCatchExtraData(offlineId,extraDataCatch)
    .then(()=>{
      return this.props.actions.upsertExtraData();
    })
    .then(()=>{
      console.warn(this.props.stateData.extraData);
      this.props.navigation.replace('CatchCalcCatchListValueScreen',{
        data:data,
        buyPrice:this.state.buyPrice
      });
    });


  }

  setGradePrice(text,index) {
    const source = this.state.fishGrades.slice();
    if(!text) text = '';
    
    let pricePerKg = Number(text);
    if(text.length == 0) pricePerKg = 0;
    let amount = Number(source[index].num);
    
    const price = amount * pricePerKg;
    
    // const index = _.findIndex(source,{grade:code});
    source[index].pricePerKg = text;
    source[index].price = price+'';

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

    let val = data.pricePerKg;
    if( (!val || Number(val) == 0) && this.state.inputOnFocus == index ) val = "";

    return (
      <View style={{backgroundColor:'white',elevation:1}}>
        <View style={{flex:1,justifyContent:'center',paddingLeft:10,paddingTop:5}}>
          <Text style={{fontWeight:'bold'}}>{data.name}</Text>
        </View>
        <View style={{flexDirection:'row'}}>
          <View style={{flex:2,paddingLeft:10}}>
            <TextField
              keyboardType='numeric'
              tintColor={lib.THEME_COLOR}
              onChangeText={(text) => this.setGradePrice(text,index)}
              value={val}
              label={L('Price/kg')+' (Rp)'}
              onFocus={()=>{
                this.setState({
                  inputOnFocus: index
                });
              }}

              onBlur={()=>{
                if(this.state.inputOnFocus == index)
                  this.setState({
                    inputOnFocus: -1
                  });
              }}
            />
          </View>
          <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:10}}>
            <Text style={{}}>x {data.num} kg</Text>
            <Text style={{}}>Grade {data.grade}</Text>
          </View>
          <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:10}}>
            <Text style={{fontWeight:'bold'}}>
              Rp {lib.toPrice(data.price)}
            </Text>
          </View>
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
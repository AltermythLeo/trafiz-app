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
        <Title txt={L('SET SELL PRICE')+' (1/2)'} />
      ),
      headerLeft: (
        <BackButton navigation={navigation}/>
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
    const ds = this.props.navigation.getParam('ds');
    if(ds && ds.viewData) {
      const totalPrice = ''+ds.viewData.sellPrice;
      const notes = ''+ds.viewData.notes;  

      const fishCatchData = ds.fishCatchData;
      const viewData = ds.viewData;
      const buyerName = viewData.buyerName;
      const numUnit = viewData.numUnit;
      const totalWeight = viewData.totalWeight;      

      const rows = fishCatchData.slice();
      const fishGrades = [];

      for(let i=0;i<rows.length;i++) {
        const name = ''+rows[i].idfish;
        const grade = ''+rows[i].grade;
        const num = Number(rows[i].amount);
        const sellPrice = rows[i].sellPrice ? Number(rows[i].sellPrice) : 0;

        let pricePerKg = 0;
        if(sellPrice > 0 && num > 0) pricePerKg = sellPrice / num;
        
        fishGrades.push({name:name,grade:grade,num:num,price:sellPrice+'',pricePerKg:pricePerKg+''});
      }
  
      this.setState({
        show:'form',
        buyerName:buyerName,
        numUnit:numUnit+'',
        totalWeight:totalWeight+'',
        sellPrice:totalPrice,
        fishGrades:fishGrades
      });

    } else {
      // open
      const ref = this.props.navigation.getParam('data');
      const bd = this.props.stateData.batchDeliveries;
      const data = _.find(bd,{deliverysheetofflineid:ref.deliverysheetofflineid})
      
      const buyerName = data.buyerName;
      const totalPrice = data.sellPrice ? data.sellPrice+'' : '';  
      const rows = data.fish;
      const numUnit = rows.length;

      const fishGrades = [];
      let totalWeight = 0;
  
      for(let i=0;i<rows.length;i++) {
        const name = ''+rows[i].idfish;
        const grade = ''+rows[i].grade;
        const num = Number(rows[i].amount);
        const sellPrice = rows[i].sellPrice ? Number(rows[i].sellPrice) : 0;

        let pricePerKg = 0;
        if(sellPrice > 0 && num > 0) pricePerKg = sellPrice / num;
        
        fishGrades.push({name:name,grade:grade,num:num,price:sellPrice+'',pricePerKg:pricePerKg+''});
        totalWeight += Number(rows[i].amount);
      }

      this.setState({
        show:'form',
        buyerName:buyerName,
        numUnit:numUnit+'',
        totalWeight:totalWeight+'',
        sellPrice:totalPrice,
        fishGrades:fishGrades
      });
    }
  }

  next() {
    const ds = this.props.navigation.getParam('ds');
    if(ds && ds.viewData) {
      this.props.navigation.replace('DeliveryCalcPriceScreen',{
        ds:ds,
        sellPrice:this.state.sellPrice,
        fishGrades:this.state.fishGrades.slice()
      });
      return;
    }

    // open
    const ref = this.props.navigation.getParam('data');
    const bd = this.props.stateData.batchDeliveries.slice();
    const data = _.find(bd,{deliverysheetofflineid:ref.deliverysheetofflineid});

    this.props.navigation.replace('DeliveryCalcPriceScreen',{
      data:data,
      sellPrice:this.state.sellPrice,
      fishGrades:this.state.fishGrades.slice()
    });
  }

  setGradePrice(text,index) {
    const source = this.state.fishGrades.slice();
    if(!text) text = '';
    
    let pricePerKg = Number(text);
    if(text.length == 0) pricePerKg = 0;
    let amount = Number(source[index].num);
    
    const price = amount * pricePerKg;
    
    source[index].pricePerKg = text;
    source[index].price = price+'';

    let tot = 0;
    for(let i=0;i<source.length;i++) {
      let price = 0;
      if( source[i].price && source[i].price.length > 0 )
        price = Number(source[i].price);
      tot += price;
    }
    
    this.setState({fishGrades:source,sellPrice:''+tot});
  }

  renderGradePrice(data,index) {
    if(data.total) {
      return (
        <View style={{flexDirection:'row',paddingVertical:10}}>
          <View style={{justifyContent:'center',padding:10}}>
            <Text style={{fontWeight:'bold'}}>
              {L('Estimated total sell price')}
            </Text>
          </View>
          <View style={{flex:1,paddingRight:10}}>
            <Text style={{flex:1,fontSize:24,fontWeight:'bold',textAlign:'right'}}>
              Rp {lib.toPrice(this.state.sellPrice)}
            </Text>
          </View>
        </View>        
      );
    }

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
              value={data.pricePerKg}
              label={L('Price/kg')+' (Rp)'}
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

    const buyerName = this.state.buyerName;
    const numUnit = this.state.numUnit;
    const totalWeight = this.state.totalWeight;

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <Text style={{fontWeight:'bold'}}>{buyerName} ({numUnit} unit, {totalWeight} kg)</Text>
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
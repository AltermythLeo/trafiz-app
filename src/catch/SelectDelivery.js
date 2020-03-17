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
  Picker
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

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');

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
      show:'busy'
    }
  }

  componentDidMount() {
    const ref = this.props.navigation.getParam('data');
    const ref2 = this.props.navigation.getParam('data2');

    const buyers = [{label:'Not set',value:''}];
    const id2buyer = {};

    const buyersRaw = this.props.stateData.buyers;
    const suppliersRaw = this.props.stateData.suppliers;
    
    for(let i=0;i<buyersRaw.length;i++) {
      const value = buyersRaw[i].idbuyeroffline;
      const label = buyersRaw[i].name_param;
      buyers.push({label,value});
      id2buyer[value] = buyersRaw[i];
    }

    for(let i=0;i<suppliersRaw.length;i++) {
      const value = suppliersRaw[i].idbuyeroffline;
      const label = suppliersRaw[i].name_param;
      buyers.push({label,value});
      id2buyer[value] = suppliersRaw[i];
    }

    this.setState({
      catchId:ref.idtrcatchoffline,
      fishCatchId:ref2 ? ref2.idtrfishcatchoffline : null,
      buyers:buyers,
      selectedBuyer:'',
      id2buyer:id2buyer
    });

    lib.delay(1)
    .then(result=>{
      this.setState({show:'list'});
    });
  }

  deleteFishcatchIdFromBatch(batchId,fishCatchId) {
    const preDeliverySheets = Object.assign({},this.props.stateData.preDeliverySheets);
    let fish = preDeliverySheets[batchId].fish ? preDeliverySheets[batchId].fish : [];
    // console.warn(fish.length);
    _.remove(fish,{fishCatchId:fishCatchId});
    // console.warn(fish.length);
    preDeliverySheets[batchId].fish = fish;
    this.props.actions.setPreDeliverySheets(preDeliverySheets);
  }

  handleCreate() {
    const id = this.state.selectedBuyer;
    const buyerData = Object.assign({},this.state.id2buyer[id]);
    const catchId = this.state.catchId;
    const fishCatchId = this.state.fishCatchId;

    const login = this.props.stateLogin;
    const uid = Number(login.id);
    const batchId = lib.getShortOfflineId('ds',uid.toString(36));

    const catches = this.props.stateData.catches;
    const catchData = _.find(catches,{idtrcatchoffline:catchId});

    const buyerId = buyerData.idbuyeroffline;
    const idmsbuyer = buyerData.idmsbuyer;
    const buyerName = buyerData.name_param;
    const compliance = [false,false,false];

    const preDeliverySheets = Object.assign({},this.props.stateData.preDeliverySheets);
    preDeliverySheets[batchId] = {
      batchId,
      catchId,
      speciesName:catchData.englishname,
      speciesNameIndo:catchData.indname,
      buyerName:buyerName,
      compliance:compliance,
      buyerId:buyerId,
      idmsbuyer:null,
      createdAt:moment().unix(),
      fish:[]
    };
    this.props.actions.setPreDeliverySheets(preDeliverySheets);
  }

  handleSelect(pds) {
    const fishCatchId = this.state.fishCatchId;
    const ref = this.props.navigation.getParam('data');
    const batchId = pds.batchId;
    const catchId = pds.catchId;
    const buyerId = pds.buyerId;
    const buyerName = pds.buyerName;
    const fish = pds.fish;
    const fc = _.find(ref.fish,{idtrfishcatchoffline:fishCatchId});
    
    let fishCatchBuyerNames = Object.assign({},this.props.stateData.fishCatchBuyerNames);

    if(!fishCatchId) {
      // todo
    } else {
      if(fishCatchBuyerNames[fishCatchId] && fishCatchBuyerNames[fishCatchId].close) return;
      if(fishCatchBuyerNames[fishCatchId] && fishCatchBuyerNames[fishCatchId].batchId) {
        const prevBatchId = fishCatchBuyerNames[fishCatchId].batchId;
        this.deleteFishcatchIdFromBatch(prevBatchId,fishCatchId);
      }

      fish.push({
        batchId:batchId,
        catchId:catchId,
        fishCatchId:fishCatchId,
        buyerId:buyerId,
        gradeCode:''+fc.amount+''+fc.grade,
        weight:Number(fc.amount),
        grade:fc.grade      
      });

      fishCatchBuyerNames[fishCatchId] = {name:buyerName,close:false,batchId:pds.batchId};
      this.props.actions.setFishCatchBuyerName(fishCatchBuyerNames);

      const preDeliverySheets = Object.assign({},this.props.stateData.preDeliverySheets);
      preDeliverySheets[batchId].fish = fish;
      this.props.actions.setPreDeliverySheets(preDeliverySheets);
      this.props.navigation.goBack();
    }
  }

  renderNotes(notes,row) {
    const arr = [];
    let index = 0;
    for(let x=0;x<4;x++) {
      const tmp = [];
      for(let y=0;y<row;y++) {
        if(index >= notes.length) break;
        tmp.push(notes[index]);
        index++;
      }
      arr.push(tmp);
    }

    return (
      <View style={{flex:2,flexDirection:'row'}}>
        <View style={{flex:1}}>
          {arr[0].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[1].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[2].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
        <View style={{flex:1}}>
          {arr[3].map((item,i)=>{
            return <Text key={item.id} style={{fontSize:10}}>{item.code}</Text>
          })}
        </View>
      </View>
    )    
  }
  
  renderCardItem(data,index) {
    const batchId = data.batchId;
    const fishes = data.fish ? data.fish : []; 
    let totalWeight = 0;
    let totalNum = 0;

    const notes = [];
    for(let i=0;i<fishes.length;i++) {
      totalWeight += Number(fishes[i].weight);
      totalNum++;
      const code = fishes[i].gradeCode;
      const id = fishes[i].fishCatchId;
      notes.push({id:id,code:code});
    }
    
    const name = data.buyerName;
    let fishKind = data.speciesName.toUpperCase();
    if(data.speciesNameIndo) {
      const english = (this.props.stateSetting.language == 'english');
      if(!english) fishKind = data.speciesNameIndo.toUpperCase();
    }

    const title = name+' ('+fishKind+', '+totalNum+' unit, '+totalWeight+' kg)';
    const cData = data.compliance;
    const c1 = cData[0] ? {color:'blue'} : {color:'gray'};
    const c2 = cData[1] ? {color:'blue'} : {color:'gray'};
    const c3 = cData[2] ? {color:'blue'} : {color:'gray'};

    const compliance = (
      <View style={{flexDirection:'row',alignItems:'flex-end'}}>
        <Text style={c1}> ID</Text>
        <Text style={c2}> EU</Text>
        <Text style={c3}> US</Text>
      </View>
    );

    let calc = 'PRICE NOT SET';
    const netSellPrice = data.totalPrice ? data.totalPrice : 0;
    if(netSellPrice > 0) calc = 'Rp '+lib.toPrice(netSellPrice);
    let status = <Text style={{color:'gray',textAlign:'right',fontSize:10}}>{calc}</Text>;

    let row = 4;
    if(notes.length > 16) {
      row = Math.ceil(notes.length / 4);
    }

    const cells = this.renderNotes(notes,row);

    return (
      <View key={index+''}>
        <TouchableOpacity onPress={()=>this.handleSelect(data)}>
          <View style={{backgroundColor:'white',elevation:1,padding:10}}>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:2}}><Text style={{fontWeight:'bold'}}>{title}</Text></View>
              <View style={{flex:1,alignItems:'flex-end'}}>{compliance}</View>
            </View>
            <Text />
            <View style={{flexDirection:'row'}}>
              {cells}
              <View style={{flex:1,justifyContent:'flex-end'}}>{status}</View>
            </View>
          </View>
        </TouchableOpacity>
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

    const raws = Object.assign({},this.props.stateData.preDeliverySheets);
    const raws2 = _.toArray(raws);
    const rows = [];

    for(let i=0;i<raws2.length;i++) {
      const catchId = raws2[i].catchId;
      if(catchId == this.state.catchId) rows.push(raws2[i]);
    }

    console.warn(rows);

    const buyers = this.state.buyers;
    const disableCreate = (this.state.selectedBuyer == '');
    
    return (
      <View style={{flex:1}}>
        <FlatList
          data={rows}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItem(item,index)}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
        <View style={{padding:10,borderTopWidth:1,borderColor:'gainsboro',flexDirection:'row'}}>
          <View style={{flex:1,paddingRight:10}}>
            <Text style={{fontWeight:'bold'}}>Create New Delivery Batch</Text>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <Text>Buyer: </Text>
              <Picker
                style={{flex:1}}
                selectedValue={this.state.selectedBuyer}
                onValueChange={(item, idx) => this.setState({selectedBuyer:item})}
              >
                {buyers.map((obj,index)=>{
                  return <Picker.Item key={index} label={obj.label} value={obj.value} />;
                })}
              </Picker>
            </View>
          </View>
          <View>
            <Button disabled={disableCreate} style={{flex:1,container:{flex:1}}} 
              raised primary text='Create' onPress={()=>this.handleCreate()} />
          </View>
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
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
  Dimensions
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button, Checkbox } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Navicon, BackButton, OnlineIndicator, Title } from '../Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/AppActions';
import CheckBox from 'react-native-check-box';
import RNPrint from 'react-native-print';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('CATCH LIST')} />
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
      selected:[],
    }
  }

  componentDidMount() {

    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const catchIndex = _.findIndex(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    this.setState({
      show:'list',
      catchIndex:catchIndex
    });


  }

  handleEdit() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    const fishIdToDelivery = this.props.stateData.fishIdToDelivery;
    const fishes = data.fish ? data.fish : [];
    let disableDelete = false;
    for(let i=0;i<fishes.length;i++) {
      const idfish = fishes[i].idfish;
      const deliveryStatus = fishIdToDelivery[idfish];
      if(deliveryStatus && deliveryStatus.nameBuyer && deliveryStatus.nameBuyer.length > 0) {
        disableDelete = true;
        break;
      }
    }

    if(!disableDelete) {
      const totalprice = Number(data.totalprice);
      const loanexpense = Number(data.loanexpense);
      const otherexpense = Number(data.otherexpense);
      const netBuyPrice = totalprice - loanexpense - otherexpense;
      disableDelete = (netBuyPrice > 0);  
    }

    this.props.navigation.push('CatchEditDataScreen',{
      data:data,
      disableDelete:disableDelete
    });
  }

  handlePayLoan() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    this.props.navigation.push('CatchPreCalcScreen',{
      data:data
    });
  }

  synchAndReload() {
    this.setState({show:'busy'});
    this.props.actions.synchronizeNow()
    .then(()=>{
      return this.props.actions.getCatchFishes()
    })
    .then(()=>{
      this.setState({show:'list'});
    })
  }

  handleAddOneFish() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    this.props.navigation.push('CatchAddOneCatchListScreen',{
      data:data,
      addFishDone:()=>{
        this.synchAndReload();
      }
    });
  }

  handleDeliverFish(index) {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});
    const data2 = data.fish[index];

    this.props.navigation.push('CatchSelectBuyerScreen',{
      data:data,
      data2:data2
    });
  }

  handleDeliverAllFish() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    // this.props.navigation.push('CatchSelectBuyerScreen',{
    //   data:data,
    //   data2:null
    // });
    const selected = this.state.selected.slice();
    this.props.navigation.push('DeliverySelectScreen',{
      data:data,
      selected:selected,
      select:true
    });
    this.setState({selected:[]});
  }

  handleEditOneFish(row,disableDeleteReason) {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    this.props.navigation.push('CatchEditOneCatchListScreen',{
      data:data,
      subData:row,
      disableDeleteReason:disableDeleteReason
    });
  }

  handleDuplicate() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    this.props.navigation.replace('CatchDuplicateScreen',{
      data:data
    });    
  }

  checkFish(data) {
    let selected = this.state.selected.slice();
    if(selected.indexOf(data.idfish) > -1) {
      // hapus
      _.remove(selected, (o) => {
        return o === data.idfish;
      });
    } else {
      selected.push(data.idfish);
    }

    this.setState({selected});
  }

  renderCardItem(data,index,complianceData,catchId,netBuyPriceNotZero) {
    // data must have compliance status && delivery status && buyerName
    if(Number(data.amount) == 0) return null;

    let code = 'NEED TO SYNCHRONIZE';
    if(data.idfish) code = data.idfish;

    const weight = data.amount;
    const grade = data.grade;
    let buyerName = '';
    let closed = false;

    const fishIdToDelivery = this.props.stateData.fishIdToDelivery;
    const deliveryStatus = fishIdToDelivery[data.idfish];
    if(deliveryStatus) {
      buyerName = deliveryStatus.nameBuyer;
      closed = deliveryStatus.close;
    }

    // from deliver set buyer name
    // if(buyerName == '') {
    //   const key = ''+data.idtrfishcatchoffline;
    //   const fishCatchBuyerNames = this.props.stateData.fishCatchBuyerNames;
    //   if(fishCatchBuyerNames[key] && fishCatchBuyerNames[key].name) {
    //     buyerName = fishCatchBuyerNames[key].name;
    //     closed = fishCatchBuyerNames[key].close ? true : false;
    //   }
    // }

    const c4 = closed ? {color:lib.THEME_COLOR,fontSize:10} : {color:'gray',fontSize:10};

    let btn = (
      <Button style={{flex:1,container:{flex:1,borderWidth:1,borderColor:'gainsboro'}}} 
        primary text={L('Send')}
        onPress={()=>this.handleDeliverFish(index)} />
    );

    let col = 'gray';
    let sentTo = '';

    if(buyerName != '') {
      sentTo = L('FOR');
    }

    let info = null;
    if(data.namecreator) {
      let name = data.namecreator;
      if(data.namelasttrans) name = data.namelasttrans;
      const txt = '['+name+']';
      info = <Text style={{fontSize:10}}>{txt.toUpperCase()}</Text>;
    }

    if(closed) {
      col = lib.THEME_COLOR;

      return (
        <View style={{backgroundColor:'white',elevation:1,padding:10,flexDirection:'row'}}>
          <View style={{alignItems:'center',justifyContent:'center',paddingRight:10}}>
            <CheckBox isChecked={false} onClick={()=>{
            }} disabled={true} checkBoxColor='gainsboro' />
          </View>
          <TouchableOpacity style={{flex:1}} onPress={()=>this.handleEditOneFish(data,'closed')}>
            <Text style={{fontWeight:'bold',color:col}}>{code}</Text>
            <Text style={{color:col}}>{weight} kg Grade {grade}</Text>
            {info}
          </TouchableOpacity>
          <View style={{paddingLeft:10, alignItems:'flex-end',justifyContent:'center'}}>
            <Text style={{textAlign:'right',color:col,fontSize:10}}>{L('DELIVERED TO')}</Text>
            <Text style={{textAlign:'right',color:col,fontSize:10}}>{buyerName.toUpperCase()}</Text>
          </View>
        </View>
      );
    }

    let isChecked = false;
    if(this.state.selected.indexOf(data.idfish) > -1) isChecked = true;

    let disableDeleteReason = false;
    if(closed || buyerName != '') disableDeleteReason = L('Buyer has been set');
    else if(netBuyPriceNotZero) disableDeleteReason = L('Buy price has been set');

    return (
      <View style={{backgroundColor:'white',elevation:1,padding:10,flexDirection:'row'}}>
        <View style={{alignItems:'center',justifyContent:'center',paddingRight:10}}>
          <CheckBox isChecked={isChecked} onClick={()=>{
            this.checkFish(data);
          }} />
        </View>
        <View style={{flex:1}}>
          <TouchableOpacity onPress={()=>this.handleEditOneFish(data,disableDeleteReason)}>
            <Text style={{fontWeight:'bold'}}>{code}</Text>
            <Text style={{}}>{weight} kg Grade {grade}</Text>
            {info}
          </TouchableOpacity>
        </View>
        <View style={{alignItems:'flex-end',justifyContent:'center'}}>
          <Text style={{textAlign:'right',fontSize:10,color:col}}>{sentTo}</Text>
          <Text style={{textAlign:'right',fontSize:10,color:col}}>{buyerName.toUpperCase()}</Text>
        </View>
      </View>
    );
  }

  renderSummary(unitName,numUnit,numTotWeight) {
    const grades = ['AAA','AA','A','B','C','CCC'];
    const unit = {};
    const tw = {};
    for(let i=0;i<grades.length;i++) {
      const g = grades[i];
      unit[g] = numUnit[g] ? numUnit[g] : 0;
      tw[g] = numTotWeight[g] ? numTotWeight[g] : 0;
    }

    return (
      <View style={{flexDirection:'row'}}>
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={{paddingRight:5}}>
            <Text style={{}}>AAA</Text>
            <Text style={{}}>AA</Text>
            <Text style={{}}>A</Text>
          </View>
          <View style={{}}>
            <Text style={{}}>: {unit['AAA']} {unitName},{tw['AAA']} kg</Text>
            <Text style={{}}>: {unit['AA']} {unitName},{tw['AA']} kg</Text>
            <Text style={{}}>: {unit['A']} {unitName},{tw['A']} kg</Text>
          </View>
        </View>
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={{paddingRight:5}}>
            <Text style={{}}>B</Text>
            <Text style={{}}>C</Text>
            <Text style={{}}>CCC</Text>
          </View>
          <View style={{}}>
            <Text style={{}}>: {unit['B']} {unitName},{tw['B']} kg</Text>
            <Text style={{}}>: {unit['C']} {unitName},{tw['C']} kg</Text>
            <Text style={{}}>: {unit['CCC']} {unitName},{tw['CCC']} kg</Text>
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

    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const data = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});

    let name = data.fishermanname;
    if(data.buyersuppliername) name = data.buyersuppliername;
    const shipName = data.shipname;
    let fishName = data.englishname.toUpperCase();

    const english = (this.props.stateSetting.language == 'english');
    if(!english) fishName = data.indname.toUpperCase();

    const fishingLocation = data.fishinggroundarea;

    const fishes = data.fish ? data.fish : [];
    let totalWeight = 0;
    let totalNum = 0;

    const fishCatchBuyerNames = this.props.stateData.fishCatchBuyerNames;
    let disableEdit = false;

    // if(data.close && data.close == '2') disableEdit = true;

    // for summary panel
    const numUnit = {};
    const numTotWeight = {};

    for(let i=0;i<fishes.length;i++) {
      const num = Number(fishes[i].amount);
      if(num > 0) {
        totalWeight += Number(fishes[i].amount);
        totalNum++;

        const grade = fishes[i].grade;
        const weight = fishes[i].amount;
        if(!numUnit[grade]) numUnit[grade] = 0;
        if(!numTotWeight[grade]) numTotWeight[grade] = 0;
        numUnit[grade] += 1;
        numTotWeight[grade] += weight;

        // check fish delivered/close
        if(!disableEdit) {
          const key = ''+fishes[i].idtrfishcatchoffline;
          if(fishCatchBuyerNames[key] && fishCatchBuyerNames[key].close)
            disableEdit = true;
        }
      }
    }
    
    const space = <View style={{height:5}} />;

    const totalprice = Number(data.totalprice);
    const loanexpense = Number(data.loanexpense);
    const otherexpense = Number(data.otherexpense);
    const netBuyPrice = totalprice - loanexpense - otherexpense;

    const cData = [false,false,false]; // todo

    const c1 = cData[0] ? {color:'blue'} : {color:'gray'};
    const c2 = cData[1] ? {color:'blue'} : {color:'gray'};
    const c3 = cData[2] ? {color:'blue'} : {color:'gray'};

    const compliance = (
      <View style={{flexDirection:'row',paddingHorizontal:5}}>
        <Text style={c1}> ID</Text>
        <Text style={c2}> EU</Text>
        <Text style={c3}> US</Text>
      </View>
    );

    const change = {
      catches:this.props.stateData.catches,
      fishCatchBuyerNames:this.props.stateData.fishCatchBuyerNames
    }

    const unitDef = [
      {label:'individual(s)',value:'1'},
      {label:'basket(s)',value:'0'}  
    ]

    let unitName =_.find(unitDef,{value:''+data.unitmeasurement});
    if(unitName) unitName = unitName.label; else unitName = 'unit';   
    unitName = L(unitName); 

    let disableSend = true;
    if(this.state.selected.length > 0) disableSend = false;

    // <View style={{height:10}} />
    // <View style={{backgroundColor:'gainsboro',height:1}} />
    // <View style={{height:10}} />
    // {this.renderSummary(unitName,numUnit,numTotWeight)}

    let btnCalc = null;

    const accessrole = this.props.stateLogin.accessrole; 
    if(accessrole == '1' || accessrole == '2') {
      btnCalc = (
        <View>
          <Button raised accent text={L('Calc Fish')+' (Rp '+lib.toPrice(netBuyPrice)+')'} onPress={()=>this.handlePayLoan()} />
          {space}
        </View>
      );
    }

    let info = null;
    if(data.namecreator) {
      let name = data.namecreator;
      if(data.namelasttrans) name = data.namelasttrans;
      const txt = '['+name+']';
      info = <Text style={{fontSize:10}}>{txt.toUpperCase()}</Text>;
    }

    const netBuyPriceNotZero = (netBuyPrice > 0);

    return (
      <View style={{flex:1}}>
        <View style={{padding:10,backgroundColor:'white',borderBottomWidth:1,borderColor:'gainsboro',elevation:1}}>
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1}}>
              <View style={{flexDirection:'row'}}>
                <View style={{flex:1}}>
                  <Text style={{fontWeight:'bold'}}>{fishName} ({totalNum} {unitName}, {totalWeight} kg)</Text>
                </View>
              </View>
              <Text style={{}}>{name} - {shipName}</Text>
              <Text style={{}}>{fishingLocation}</Text>
              {info}
            </View>
            <View style={{}}>
              <Button disabled={disableEdit} style={{flex:1,container:{flex:1}}} raised primary text={L('Edit')} onPress={()=>this.handleEdit()} />
            </View>
          </View>
        </View>
        <FlatList
          data={fishes}
          keyExtractor={(item,index) => (''+index)}
          renderItem={({item,index}) => this.renderCardItem(item,index,cData,ref.idtrcatchoffline,netBuyPriceNotZero)}
          extraData={change}
          ItemSeparatorComponent={()=><View style={{height:10}} />}
        />
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1}}>
              <Button style={{text:{textAlign:'center'}}} disabled={(disableEdit || netBuyPriceNotZero)} raised primary text={L('+Fish')} onPress={()=>this.handleAddOneFish()} />
            </View>
            <View style={{width:5}} />
            <View style={{flex:1}}>
              <Button style={{text:{textAlign:'center'}}} disabled={disableSend} raised primary text={L('Send Selected')} onPress={()=>this.handleDeliverAllFish()} />
            </View>
          </View>
          {space}
          {btnCalc}
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1}}>
              <Button raised primary text={L('Duplicate/+Other Fish')} onPress={()=>this.handleDuplicate()} />
            </View>
            <View style={{width:5}} />
            <View style={{flex:1}}>
              <Button raised text={L('Print')} onPress={()=>this.printReceipt()} />
            </View>
          </View>          
        </View>
      </View>
    );
  }

  printReceipt() {
    const catches = this.props.stateData.catches;
    const ref = this.props.navigation.getParam('data');
    const catchData = _.find(catches,{idtrcatchoffline:ref.idtrcatchoffline});
    const profile = this.props.stateLogin.profile;

    console.warn(catchData);
    console.warn(profile);

    let rows = [];
    let totalprice = 0;

    const priceRefs = {};

    const extraData = this.props.stateData.extraData;
    let extraDataCatch = {};
    if(extraData && extraData.catch && extraData.catch[ref.idtrcatchoffline]) {
      extraDataCatch = extraData.catch[ref.idtrcatchoffline];
      if(extraDataCatch.fishGrades) {
        fishGrades = extraDataCatch.fishGrades;
        totalprice = 0;
        for(let i=0;i<fishGrades.length;i++) {
          const fg = fishGrades[i];
          const name = fg.name;
          const grade = fg.grade;
          const weight = fg.num;
          const tp = Number(fg.price);
          const price = Number(fg.pricePerKg);
          totalprice += tp;

          priceRefs[name] = {price,tp};
        }
      }
    }

    const fishes = catchData.fish ? catchData.fish : [];
    for(let i =0;i<fishes.length;i++) {
      const f = fishes[i];
      if(f.amount > 0) {
        const weight = f.amount ? f.amount : '';
        const grade = f.grade ? f.grade : '';
        const idfish = f.idfish;
        let price = 0;
        let tp = 0;
        if(priceRefs[idfish]) {
          price = priceRefs[idfish].price;
          tp = priceRefs[idfish].tp;
        }

        rows.push({weight:f.amount,grade:f.grade,price,tp});
      }
    }


    let html = '<html><head><style>.column{float: left; width: 50%;}.row:after{content: ""; display: table; clear: both;}.right{text-align: right;}.border1{padding: 10px;}.border2{border-top-style: solid; border-bottom-style: solid; border-width: 1px; padding: 10px;}.border3{padding: 10px;}table{border-collapse: collapse;}table, th, td{border: 0px solid black; text-align: center;}</style></head><body> <div class="border1"> <div style="text-align:center">#COMPANYNAME#</div><div class="row"> <div class="column right">receipt number :</div><div class="column"> #RECEIPTNUM#</div></div><div class="row"> <div class="column right">transaction date :</div><div class="column"> #TRANSDATE#</div></div><div class="row"> <div class="column right">fisherman name :</div><div class="column"> #FISHERMANNAME#</div></div><div class="row"> <div class="column right">supplier name :</div><div class="column"> #BUYERSUPPLIERNAME#</div></div></div><div class="border2"> <table style="width:100%;"> <tr><th>Name</th><th>Weight</th><th>Price</th><th>Total</th></tr>#ROWS# </table> <br/> <div class="row"> <div class="column right">Total Price :</div><div class="column"> #TOTALPRICE#</div></div></div><div class="border3"> <div style="text-align:center">Thank You</div><div style="text-align:center">Signed by</div><br/> <br/> <br/> <br/> <br/> <br/> <div style="text-align:center">(#SUPPLIERNAME#)</div></div></body></html>';
    // const rows = catchData.fish;
    let rowStr = '';

    for(let i=0;i<rows.length;i++) {
      const row = rows[i];
      console.warn(row);
      const col1 = catchData.threea_code+' '+row.grade;
      const col2 = row.weight;
      const col3 = ''+lib.toPrice(row.price);
      const col4 = ''+lib.toPrice(row.tp);
      rowStr += '<tr><td>'+col1+'</td><td>'+col2+' kg</td><td>'+col3+'</td><td>'+col4+'</td></tr>';
    }

    const change = {};

    let tp = totalprice; // catchData.totalprice ? catchData.totalprice : 0;

    let fisherman = '';
    let sourceSupplier = '';
    if(catchData.fishermanname2 && catchData.fishermanname2.length > 0) fisherman = catchData.fishermanname2;
    else if(catchData.fishermanname && catchData.fishermanname.length > 0) fisherman = catchData.fishermanname;

    if(catchData.buyersuppliername) sourceSupplier = catchData.buyersuppliername;

    change['#COMPANYNAME#'] = profile.name.toUpperCase();
    change['#RECEIPTNUM#'] = catchData.purchaseuniqueno;
    change['#TRANSDATE#'] = moment(catchData.purchasedate,'YYYY-MM-DD').format('DD-MM-YYYY');;;
    change['#FISHERMANNAME#'] = fisherman;
    change['#BUYERSUPPLIERNAME#'] = sourceSupplier;
    change['#TOTALPRICE#'] = 'Rp '+lib.toPrice(tp);
    change['#SUPPLIERNAME#'] = profile.name;
    change['#ROWS#'] = rowStr;

    for (let key in change) {
      if (change.hasOwnProperty(key)) {
        const val = change[key];
        html = html.replace(key,val);
      }
    }


    this.setState({show:'busy'});
    RNPrint.print({
      html: html,
      isLandscape: false
    })
    .then(file=>{
      this.setState({show:'list'});
    })


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
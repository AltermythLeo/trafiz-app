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
  SectionList,
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
import QRCode from 'react-native-qrcode';
import QRCodeSvg from 'react-native-qrcode-svg';
import SendSMS from 'react-native-sms';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';

const ScrollableTabView = require('react-native-scrollable-tab-view');
const lib = require('../lib');
const L = require('../dictionary').translate;

class ListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Title txt={L('DELIVERY SHEET')} />
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
      rows:[],
      rows2:[],
      rows3:[],
      qrCodesIndex:0
    }
  }

  componentDidMount() {
    const deliverySheet = this.props.navigation.getParam('ds');
    const vd = this.props.navigation.getParam('vd');
    const fishCatchData = this.props.navigation.getParam('fishCatchData').slice();

    // hack: test 100 fish
    // const tmp = Object.assign({},fishCatchData[0]);
    // for(let i=0;i<27;i++) {
    //   fishCatchData.push(tmp);
    // }

    const ds = Object.assign({},deliverySheet);

    const keys = [
      'deliverySheetNo',
      'nationalRegistrationSupplierCode',
      'deliveryDate',
      'species',
      'numberOfFishOrLoin',
      'totalWeight',
      'vesselName',
      'vesselSize',
      'vesselRegistrationNo',
      'expiredDate',
      'vesselFlag',
      'fishingGround',
      'landingSite',
      'gearType',
      'catchDate',
      'fishermanName',
      'landingDate',
      'unitName',
      'fadused'
    ];

    for(let i=0;i<keys.length;i++) {
      const key = keys[i];
      if( !ds[key] ) ds[key] = '';
    }

    const rows = [
      {label:L('Delivery sheet no'),val:ds.deliverySheetNo},
      {label:L('Supplier name'),val:ds.supplierName},
      {label:L('National registration supplier code'),val:ds.nationalRegistrationSupplierCode},
      {label:L('Total unit'),val:ds.numberOfFishOrLoin},
      {label:L('Total kg'),val:ds.totalWeight},
      {label:L('Delivery date'),val:ds.deliveryDate},
    ]

    const rows3 = [];
    const data3 = [];
    if( fishCatchData ) {
      const groupByGrade = _.groupBy(fishCatchData,(o)=>{
        return o["grade"];
      });

      let strs = [];
      for (let key in groupByGrade) {
        if (groupByGrade.hasOwnProperty(key)) {
          const arr = groupByGrade[key];
          const grade = key;
          let totWeight = 0;
          for(let i=0;i<arr.length;i++) {
            totWeight += Number(arr[i].amount);
          }
          data3.push({grade:grade,num:arr.length,totWeight:totWeight});
          const label = 'Grade '+grade;
          const val = L('total unit')+': ' +arr.length+'. '+L('total weight')+': '+totWeight+ ' kg';
          rows3.push({label,val});
        }
      }
    }

    let htmlSummary = "<div>";//"<table><tr><td>Total unit per grade</td><td> </td><td>Total weight(kg) per grade</td></tr><tr></tr>";
    let arr = [];
    for(let i=0;i<data3.length;i++) {
      //const str = "<tr><td>Grade "+data3[i].grade+":"+data3[i].num+"</td><td> </td><td>Grade "+data3[i].grade+":"+data3[i].totWeight+" kg</td></tr><tr>";
      //htmlSummary += str;

      arr.push('Grade '+data3[i].grade+' '+data3[i].num+' pc(s) '+data3[i].totWeight+' kg');
    }
    //htmlSummary += "</table>";

    if(arr.length > 0) {
      htmlSummary += "[Summary] ";
      htmlSummary += arr.join(', ');
    }
    htmlSummary += "</div>";


    const rows2 = [];

    for(let i=0;i<fishCatchData.length;i++) {
      const fish = fishCatchData[i];
      const idfish = fish.idfish;
      const species = fish.species ? fish.species : ds.species;
      const vesselName = fish.vesselName ? fish.vesselName : ds.vesselName;
      const fishermanName = fish.fishermanName ? fish.fishermanName : ds.fishermanName;
      const fishingGround = fish.fishingGround ? fish.fishingGround : ds.fishingGround;
      const landingSite = fish.landingSite ? fish.landingSite : ds.landingSite;
      const landingDate = fish.landingDate ? fish.landingDate : ds.landingDate;
      const unitName = fish.unitName ? fish.unitName : ds.unitName;
      const vesselSize = fish.vesselSize ? fish.vesselSize : ds.vesselSize;
      const vesselRegistrationNo = fish.vesselRegistrationNo ? fish.vesselRegistrationNo : ds.vesselRegistrationNo;
      const expiredDate = fish.expiredDate ? fish.expiredDate : ds.expiredDate;
      const vesselFlag = fish.vesselFlag ? fish.vesselFlag : ds.vesselFlag;
      const gearType = fish.gearType ? fish.gearType : ds.gearType;
      const fadused = fish.fadused ? fish.fadused : ds.fadused;
      const weight = fish.amount;
      const grade = fish.grade;
      const notes = fish.description;
      
      const dataTable2 = [
        ''+(i+1),
        idfish,
        species,
        vesselName,
        fishermanName,
        fishingGround,
        landingSite,
        landingDate,
        grade,
        unitName,
        weight
      ];

      const label = idfish;
      const sublabel = [
        L('species'),
        L('vessel name'),
        L('fisherman'),
        L('fishing ground'),
        L('landing site'),
        L('landing date'),
        L('grade'),
        L('unit measurement'),
        L('weight')
      ];
      const vals = dataTable2.slice(2);
      const vals2 = [];
      for(let j=0;j<vals.length;j++) {
        let key = '';
        let val = vals[j];
        if(val && val.length == 0) val = '-';
        if(j<sublabel.length) key = sublabel[j];
        vals2.push(key+': '+val);
      }
      const val = vals2.join('\r\n');
      rows2.push({label,val});
    }

    const qrCodes = this.generateData(ds,fishCatchData.slice());
    const html = this.generateHtml(qrCodes,htmlSummary);

    this.setState({
      show:'printPrep',
      prepIndex:0,

      rows,
      rows2,
      rows3,
      qrCodes,
      html
    });
  }

  generateData(ds,fc) {
    const ret = [];
    const header1 = [ds.deliverySheetNo,ds.nationalRegistrationSupplierCode,ds.deliveryDate];
    const code1 = header1.join(';');

    let fcs = _.groupBy(fc,(o)=>{
      return o["idtrcatchoffline"];
    });
  
    fcs = _.toArray(fcs);

    for(let i=0;i<fcs.length;i++) {
      const arr = fcs[i];
      if(arr.length == 0) continue;
      const ref = arr[0];
      // VesselName;VesselSize;VesselRegistrationNo;ExpiredDate;VesselFlag;
      // FishingGround;GearType;Landing_Site;Landing_Date# 
      const header2 = [ref.vesselName,ref.vesselSize,ref.vesselRegistrationNo,ref.expiredDate,
        ref.vesselFlag,ref.fishingGround,ref.gearType,ref.landingSite,ref.landingDate,
        ref.fishermanName];
      
      const code2 = header2.join(';');
      const codeHeader = code1+'#'+code2+'\n#';
      const header = header1.concat(header2);
      
      let rows = [];
      let code3 = [];
      for(let j=0;j<arr.length;j++) {
        const fish = arr[j];
        const idfish = fish.idfish;
        const species = fish.species;
        const grade = fish.grade;
        const weight = fish.amount;
        let unitName = ''+fish.unitName;
        
        if(unitName == '1') unitName = L('Loin');
        else if(unitName == '0') unitName = L('Whole');
        else unitName = '';
        
        const cell = [idfish,species,grade,unitName,weight];
        const code4 = cell.join(';');

        const check1 = code3.slice();
        check1.push(code4);
        const check2 = check1.join('#');
        const check3 = codeHeader + check2 + '\r\n';
        if(check1.length == 30 || check3.length > 1024) {
          const qrCode = codeHeader + code3.join('#') + '\r\n';
          const page = {header:header,content:rows,qrCode:qrCode};
          ret.push(page);
          rows = [];
          code3 = [];
        } 

        rows.push(cell);
        code3.push(code4);
      }
      
      if(rows.length > 0) {
        const qrCode = codeHeader + code3.join('#') + '\r\n';
        const page = {header:header,content:rows,qrCode:qrCode};
        ret.push(page);      
      }
      
    }
  
    return ret;
  }

  generateHtml(print,htmlSummary) {
    let ret = '';
    let pages = '';

    const headerLabel = [
      'Delivery sheet no:',
      'Supplier nat. reg. code:',
      'Delivery date:',
      'Vessel name:',
      'Vessel size:',
      'Vessel reg. no:',
      'Expired date:',
      'Vessel flag:',
      'Fishing ground:',
      'Gear Type:',
      'Landing site:',
      'Landing date:',
      'Fisherman:',
    ];

    let insertImgLast = '';

    for(let i=0;i<print.length;i++) {
      const page = print[i];
      const header = page.header;
      let tableHeader = '<table>';
      let index = 0;
      for(let j=0;j<7;j++) {
        tableHeader += '<tr>';
        for(let k=0;k<2;k++) {
          let label = '';
          let val = '';
          if(index < headerLabel.length) {
            label = headerLabel[index];
          }
          if(index < header.length) {
            val = header[index] ? header[index] : '';
          }
          const cell = '<td>'+label+'</td>'+'<td>'+val+'</td><td> </td>';
          tableHeader += cell;
          index++;
        }
        tableHeader += '</tr>';
      }

      tableHeader += '</table>';

      let content = page.content.slice();
      content = _.chunk(content, 15);
      // const cell = [idfish,species,grade,unitName,weight];

      let table1 = '<table style="font-size: small;" border="1">';
            
      table1 = table1 + '<tr><th>Fish ID</th><th>Species</th><th>Grade</th><th>Unit</th><th>Weight</th></tr>';
      const rows1 = content[0];
      for(let j=0;j<rows1.length;j++) {
        const c = rows1[j];
        table1 += '<tr><td>'+c[0]+'</td><td>'+c[1]+'</td><td>'+c[2]+'</td><td>'+c[3]+'</td><td>'+c[4]+'</td></tr>';
      }
      table1 += '</table>';

      let table2 = '';
      if(content.length == 2) {
        table2 = '<table style="font-size: small;" border="1">';
        table2 += '<tr><th>Fish ID</th><th>Species</th><th>Grade</th><th>Unit</th><th>Weight</th></tr>';
        const rows2 = content[0];
        for(let j=0;j<rows2.length;j++) {
          const c = rows2[j];
          table2 += '<tr><td>'+c[0]+'</td><td>'+c[1]+'</td><td>'+c[2]+'</td><td>'+c[3]+'</td><td>'+c[4]+'</td></tr>';
        }
        table2 += '</table>';          
      }

      const table = '<table width="100%"><tr><td width="50%">'+table1+'</td><td width="50%">'+table2+'</td></tr></table>';
      const numPages = print.length;
      let insertImg = '<br /><div>#QRCODEIMG'+i+'#</div>';
      if((i+1) == numPages) {
        insertImgLast = insertImg;
        insertImg = '';
      }
      const add = '<div style="page-break-before: always;"><h3>TRAFIZ DELIVERY SHEET ('+(i+1)+'/'+numPages+')</h3>'+tableHeader+'<br />'+table+insertImg+'</div>';
      pages += add;
    }

    ret = '<html><body style="font-size: small;" >'+pages+'<br />'+htmlSummary+insertImgLast+'</body></html>';
    return ret;
  }

  generatePdf() {
    this.setState({show:'busy'});
    RNPrint.print({
      html: this.state.html,
      isLandscape: true
    })
    .then(file=>{
      this.setState({show:'list'});
    })
    .catch(err=>{
      this.setState({show:'list'});
    })
  }

  renderItem(item,index) {
    const label = item.label;
    let val = item.val;
    if(!val || val.length == 0) val = '';
    return (
      <View style={{padding:10,borderBottomColor:'gainsboro',borderBottomWidth:1}}>
          <Text style={{fontWeight:'bold'}}>{label}</Text>
          <Text style={{}}>{val}</Text>
      </View>
    );
  }

  showQRCodes() {
    this.props.navigation.push('DeliveryShowQRCodesScreen',{
      qrCodes:this.state.qrCodes
    });
  }

  nextQRCode(add) {
    if(add) {
      const qrCodesIndex = this.state.qrCodesIndex + 1;
      if(qrCodesIndex < this.state.qrCodes.length) {
        this.setState({qrCodesIndex});
      }
    } else {
      const qrCodesIndex = this.state.qrCodesIndex - 1;
      if(qrCodesIndex >= 0) {
        this.setState({qrCodesIndex});
      }
    }
  }

  renderQRCode() {
    const dim = Dimensions.get('window');
    const w = Math.floor(dim.width * 0.8);
    const ww = dim.width;
    const qrCodesIndex = this.state.qrCodesIndex;
    let code = this.state.qrCodes[qrCodesIndex].qrCode;
    const page = qrCodesIndex + 1;
    const allPages = this.state.qrCodes.length;

    // code = code.split(';')[0];

    return (
      <View style={{flex:1}}>
        <View>
          <View style={{backgroundColor:'white',elevation:1,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <TouchableOpacity onPress={()=>this.nextQRCode(false)}>
              <View style={{padding:15}}><FontAwesome name='arrow-left' size={25} /></View>
            </TouchableOpacity>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
              <Text>{page}/{allPages}</Text>
            </View>
            <TouchableOpacity onPress={()=>this.nextQRCode(true)}>
              <View style={{padding:15}}><FontAwesome name='arrow-right' size={25} /></View>
            </TouchableOpacity>
          </View>
          <View style={{height:10}} />
        </View>
        <ScrollView style={{flex:1}}>
          <View style={{width:ww,height:ww,alignItems:'center',justifyContent:'center'}}>
            <QRCodeSvg
              value={code}
              size={w}
              />
          </View>
          <View style={{padding:10}}>
            <Text style={{textAlign:'center',fontSize:10}}>{code}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  saveImage(index,data) {
    const newIndex = index + 1;
    
    let newHtml = this.state.html;
    const cName = 'canvas'+index;

    const test = '<img style="width:5cm;" src="data:image/png;base64,'+data+'" /><br /><br />';
    newHtml = newHtml.replace('#QRCODEIMG'+index+'#',test);
    
    if(newIndex >= this.state.qrCodes.length) {
      this.setState({
        show:'list',
        html:newHtml
      });
    } else {
      this.setState({
        prepIndex:newIndex,
        html:newHtml
      });
    }
  }

  onPrintPrepFinished(index,svg) {
    if(!svg) {
      return;
    }

    lib.delay(500)
    .then(()=>{
      svg.toDataURL((data)=>{
        // console.warn('get base64 data for index:',index);
        this.saveImage(index,data);
      });  
    });

  }

  renderPrintPrep() {
    const dim = Dimensions.get('window');
    const w = 125; // Math.floor(dim.width * 0.8);
    const ww = dim.width;
    const prepIndex = this.state.prepIndex;
    let code = this.state.qrCodes[prepIndex].qrCode;
    const msg = L('Preparing delivery sheet..');

    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <View style={{width:ww,height:ww,alignItems:'center',justifyContent:'center'}}>
          <QRCodeSvg
            value={code}
            size={w}
            getRef={(c) => this.onPrintPrepFinished(prepIndex,c)}
            />
        </View>
        <View style={{padding:10}}>
          <ActivityIndicator />
          <Text> </Text>
          <Text>{msg}</Text>
        </View>
      </View>
    );
  }


  sendSMS() {
    const arr = this.state.qrCodes;
    const codes = [];
    for(let i=0;i<arr.length;i++) {
      codes.push(arr[i].qrCode);
    }
    const body = codes.join('\r\n');

    SendSMS.send({
      body: body,
      recipients: [],
      successTypes: ['sent', 'queued']
    }, (completed, cancelled, error) => {
  
    });
  }

  render() {
    if(this.state.show === 'busy') {
      return (
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    if(this.state.show === 'qrcode') {
      return this.renderQRCode();
    }

    if(this.state.show === 'printPrep') {
      return this.renderPrintPrep();
    }

    const rows = this.state.rows;
    const rows2 = this.state.rows2;
    const rows3 = this.state.rows3;

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:1}}>
          <SectionList
            renderItem={({ item, index, section }) => this.renderItem(item,index)}
            renderSectionHeader={({section: {title}}) => (
              <View style={{padding:10,backgroundColor:'gray'}}>
                <Text style={{fontWeight: 'bold',color:'white'}}>{title}</Text>
              </View>
            )}
            sections={[
              { title: L('Delivery Sheet'), data: rows },
              { title: L('Fish List'), data: rows2 },
              { title: L('Grade Summary'), data: rows3 },
            ]}
          />
        </View>
        <View style={{padding:10,backgroundColor:'white',borderTopWidth:1,borderColor:'gainsboro'}}>
          <Button raised primary text={L('QR Code')} onPress={()=>this.showQRCodes()} />
          <View style={{height:5}} />
          <Button raised text={L('PRINT')} onPress={()=>this.generatePdf()} />
          <View style={{height:5}} />
          <Button raised text={L('Send SMS')} onPress={()=>this.sendSMS()} />
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
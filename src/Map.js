/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import axios from 'axios';
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  TouchableHighlight
} from 'react-native';

import { createStackNavigator } from 'react-navigation';
import { RNCamera } from 'react-native-camera';
import { Button } from 'react-native-material-ui';
import { Navicon, BackButton, OnlineIndicator } from './Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const lib = require('./lib');
const L = require('./dictionary').translate;


// import Upload from 'react-native-background-upload';
// import FileUploader from 'react-native-file-uploader';

class Map extends Component {
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
      show:'fullmap',
      smallFilename:'',
      offsetX:0,
      offsetY:0,
      grid2mdpi:{}
    }
  }

  componentDidMount() {
    const grid2mdpi = {};
    for(let j=0;j<24;j++) {
      for(let i=0;i<48;i++) {
        const y = String.fromCharCode(67 + j);
        const code = ''+y+''+i;
        const mdpi = lib.getMDPI(code);
        if(mdpi) grid2mdpi[code] = mdpi;
      }
    }

    const state = this.props.stateData.lastMapState;
    if(state.show) {
      state.grid2mdpi = grid2mdpi;
      this.setState(state);
    } else {
      this.setState({grid2mdpi});
    }
  }

  zoomIn(code) {
    const arr = code.split('-');
    const x = Number(arr[0]) * 8;
    const y = Number(arr[1]) * 8;
    const fn = 'm'+arr[0]+''+arr[1];
    this.setState({
      show:'map',
      smallFilename:fn,
      offsetX:x,
      offsetY:y
    });
  }

  zoomOut() {
    this.setState({
      show:'fullmap'
    });    
  }

  selectLocation(code) {
    const save = Object.assign({},this.state);
    this.setState({show:'busy'});
    const mdpi = ''+lib.getMDPI(code)+','+code;
    this.props.actions.setLastMapState(save);
    const nav = this.props.navigation;
    nav.goBack();
    nav.state.params.onMapReturn(null,null,mdpi);
  }

  renderButton(item,index) {
    return (
      <View key={item} style={{flex:1,padding:2}}>
        <TouchableOpacity onPress={()=>this.zoomIn(item)} style={{backgroundColor:'rgba(255, 255, 255, 0.25)',flex:1}} />
      </View>
    );
  }

  renderButtonSmall(item,index) {
    const grid = item;
    const mdpi = this.state.grid2mdpi[grid];
    if(!mdpi) 
      return (
      <View key={item} style={{flex:1,padding:2,alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontWeight:'bold',color:'red'}}>X</Text>
      </View>
      );

    return (
      <View key={item} style={{flex:1,padding:2}}>
        <TouchableOpacity onPress={()=>this.selectLocation(item)} style={{backgroundColor:'rgba(255, 255, 255, 0.25)',flex:1,alignItems:'center',justifyContent:'center'}}>
          <Text>{grid}</Text>
        </TouchableOpacity>
      </View>
    );
    // return (
    //   <View key={item} style={{flex:1,padding:2}}>
    //     <TouchableOpacity onPress={()=>this.selectLocation(item)} style={{backgroundColor:'rgba(55, 55, 55, 0.25)',flex:1,alignItems:'center',justifyContent:'center'}}>
    //       <Text>{item}</Text>
    //     </TouchableOpacity>
    //   </View>
    // );
  }

  // {row0.map((item,index)=>this.renderButton(item,index))}

  renderBig() {
    let disabled = (this.state.show === 'busy');
    const dim = Dimensions.get('window');
    const w = dim.width;
    const h = w *3 / 5;
    const row0 = ['0-0','1-0','2-0','3-0','4-0','5-0'];
    const row1 = ['0-1','1-1','2-1','3-1','4-1','5-1'];
    const row2 = ['0-2','1-2','2-2','3-2','4-2','5-2'];
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:1,alignItems:'center'}}>
          <View style={{padding:10,alignItems:'center',justifyContent:'center'}}>
            <Text style={{textAlign:'center'}}>{L('TAP AREA TO ZOOM IN')}</Text>
          </View>
          <ImageBackground style={{width:w,height:h,padding:2}} resizeMode='stretch' source={require('./maps/fullmap.jpg')}>
            <View style={{flex:1,flexDirection:'row'}}>
              {row0.map((item,index)=>this.renderButton(item,index))}             
            </View>
            <View style={{flex:1,flexDirection:'row'}}>
              {row1.map((item,index)=>this.renderButton(item,index))}             
            </View>
            <View style={{flex:1,flexDirection:'row'}}>
              {row2.map((item,index)=>this.renderButton(item,index))}             
            </View>
          </ImageBackground>
        </View>
      </View>
    );
  }

  renderSmall() {
    let disabled = (this.state.show === 'busy');
    const dim = Dimensions.get('window');
    const w = dim.width;
    const h = w;

    const rows = [];
    for(let j=0;j<8;j++) {
      const tmp = [];
      for(let i=0;i<8;i++) {
        const x = this.state.offsetX + i;
        const n = this.state.offsetY + j;
        const y = String.fromCharCode(67 + n);
        const code = ''+y+''+x;
        tmp.push(code);
      }
      rows.push(tmp);
    }

    const ref = {
      m00:require('./maps/m0-0.jpg'),
      m10:require('./maps/m1-0.jpg'),
      m20:require('./maps/m2-0.jpg'),
      m30:require('./maps/m3-0.jpg'),
      m40:require('./maps/m4-0.jpg'),
      m50:require('./maps/m5-0.jpg'),
      m01:require('./maps/m0-1.jpg'),
      m11:require('./maps/m1-1.jpg'),
      m21:require('./maps/m2-1.jpg'),
      m31:require('./maps/m3-1.jpg'),
      m41:require('./maps/m4-1.jpg'),
      m51:require('./maps/m5-1.jpg'),
      m02:require('./maps/m0-2.jpg'),
      m12:require('./maps/m1-2.jpg'),
      m22:require('./maps/m2-2.jpg'),
      m32:require('./maps/m3-2.jpg'),
      m42:require('./maps/m4-2.jpg'),
      m52:require('./maps/m5-2.jpg')
    }

    const key = this.state.smallFilename+'';
    const src = ref[key];

    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <View style={{flex:1,alignItems:'center'}}>
          <View style={{padding:10,alignItems:'center',justifyContent:'center'}}>
            <Text style={{textAlign:'center'}}>{L('TAP FISHING LOCATION')}</Text>
          </View>
          <ImageBackground style={{width:w,height:h,padding:2}} resizeMode='stretch' source={src}>
            {rows.map((item,index)=>{
              const cols = item;
              const key = 'row-'+index;
              return (
                <View key={key} style={{flex:1,flexDirection:'row'}}>
                  {cols.map((item,index)=>this.renderButtonSmall(item,index))}             
                </View>  
              );
            })}
          </ImageBackground>
          <Text />
          <Button raised text={L('Zoom Out')} onPress={()=>this.zoomOut()} />
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

    if(this.state.show == 'fullmap') return this.renderBig();
    return this.renderSmall();
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

Map = connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)

export default Map;

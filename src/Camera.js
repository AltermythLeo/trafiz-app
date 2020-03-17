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
  View
} from 'react-native';

import { createStackNavigator } from 'react-navigation';
import { RNCamera } from 'react-native-camera';
import { Button } from 'react-native-material-ui';
import { Navicon, BackButton, OnlineIndicator } from './Navicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';
import moment from 'moment';

const L = require('./dictionary').translate;

const lib = require('./lib');
const TRAFIZ_URL = lib.TRAFIZ_URL;

// import Upload from 'react-native-background-upload';
// import FileUploader from 'react-native-file-uploader';

class Camera extends Component {
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
      show:'camera'
    }
  }

  snap() {
    if (this.camera) {
      this.setState({show:'busy'});
      const options = { quality: 0.8, width: 100, height:100, fixOrientation: true };
      this.camera.takePictureAsync(options)
      .then(data=>{
        // this.setState({show:'camera'});
        // const nav = this.props.navigation;
        // const msg = nav.state.params.msg;
        // nav.goBack();
        // nav.state.params.onCameraReturn(data,msg);
        return this.uploadFile(data);
      })
    }
  }

  uploadFile(data) {
    const url = TRAFIZ_URL+'/_api/img/upload';
    //const url = 'http://192.168.100.23:3000/upload';
    const path = data.uri;

    const formdata = new FormData();
    const fn = moment().valueOf()+'.jpg';
    formdata.append('photoparam', {
      uri: path,
      type: 'text/plain',
      name: fn
    });
    console.warn(data);

    axios.post(url, formdata, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      console.warn(res)
      if(res.status == 200) {
        const fn = res.data;
        // const urlImg = TRAFIZ_URL+'/imgupload/'+fn;
        const urlImg = TRAFIZ_URL+'/imgupload/'+fn;
        const data = {};
        data.uri = urlImg;
        console.warn('!!');

        this.setState({show:'camera'});
        const nav = this.props.navigation;
        const msg = nav.state.params.msg;
        nav.goBack();
        nav.state.params.onCameraReturn(data,msg);
        return;
      }

      throw null;
    })
    .catch(err=>{
      console.warn('!');
      console.warn(err);

      this.setState({show:'error',errMsg:L('CAN NOT UPLOAD PHOTO, PLEASE RETRY LATER.')});
    })

    // const options = {
    //   url: TRAFIZ_URL+'/_api/img/upload',
    //   path: path,
    //   method: 'POST',
    //   field: 'photoparam',
    //   type: 'multipart'
    // }

    // return new Promise((resolve,reject)=>{
    //   Upload.startUpload(options).then((uploadId) => {
    //     console.log('Upload started')
    //     Upload.addListener('progress', uploadId, (data) => {
    //       console.log(`Progress: ${data.progress}%`)
    //     })
    //     Upload.addListener('error', uploadId, (data) => {
    //       console.warn(`Error: ${data.error}%`)
    //       resolve();
    //     })
    //     Upload.addListener('cancelled', uploadId, (data) => {
    //       console.warn(`Cancelled!`)
    //       resolve();
    //     })
    //     Upload.addListener('completed', uploadId, (data) => {
    //       // data includes responseCode: number and responseBody: Object
    //       console.warn('Completed!');
    //       console.warn(data);
    //       resolve();
    //     })
    //   }).catch((err) => {
    //     console.warn('Upload error!', err);
    //     resolve();
    //   })

    // });
    
    
  }

  render() {
    const offline = this.props.stateLogin.offline;
    if(offline) {
      return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:10}}>
          <Text style={{textAlign:'center'}}>CAN NOT USE CAMERA ON OFFLINE MODE</Text>
        </View>
      );
    }

    let disabled = (this.state.show === 'busy');
    return (
      <View style={{flex:1}}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style = {{flex:3}}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
          permissionDialogTitle={L('Permission to use camera')}
          permissionDialogMessage={L('We need your permission to use your camera phone')}
        />
        <View style={{flex:1}}>
          <View style={{flex:1,alignItems:'center', justifyContent: 'center'}}>
          </View>
          <Button disabled={disabled} raised primary text={L('Snap')} onPress={()=>this.snap()} />
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

Camera = connect(
  mapStateToProps,
  mapDispatchToProps
)(Camera)

export default Camera;

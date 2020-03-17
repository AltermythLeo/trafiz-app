import React, { Component } from 'react';
import { Image, AppRegistry, StyleSheet, Text, View, Button, AppState, NetInfo, ScrollView } from 'react-native';
import { 
  createStackNavigator, 
  createSwitchNavigator, 
  createBottomTabNavigator,
  createDrawerNavigator,
  NavigationActions,
  DrawerItems, 
  SafeAreaView
} from 'react-navigation';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions/AppActions';

import { Navicon, BackButton, OnlineIndicator, Title } from './Navicon';
import { LoginCheckScreen, LoginScreen, ReloginScreen } from './Login';
import RegisterScreen from './Register';
import HomeScreen from './Home';
import CameraScreen from './Camera';
import DummyScreen from './Dummy';
import ListScreen from './fisherman/List';
import DetailScreen from './fisherman/Detail';
import SupplierListScreen from './supplier/List';
import SupplierDetailScreen from './supplier/Detail';
import BuyerListScreen from './buyer/List';
import BuyerDetailScreen from './buyer/Detail';
import ShipListScreen from './ship/List';
import ShipDetailScreen from './ship/Detail';
import ShipListSelectScreen from './ship/ListSelect';
import FishListScreen from './fish/List';
import FishDetailScreen from './fish/Detail';
import FishSearchScreen from './fish/Search';
import FishListSelectScreen from './fish/ListSelect';
import LoanListScreen from './loan/List';
import LoanListNewScreen from './loan/ListNew';
import LoanListItemsScreen from './loan/ListItems';
import LoanAddItemScreen from './loan/AddItem';
import LoanEditItemScreen from './loan/EditItem';
import LoanCheckItemsScreen from './loan/ListCheckItems';
import LoanPayScreen from './loan/Pay';
import LoanSelectTypeScreen from './loan/SelectType';
import CatchListScreen from './catch/List';
import CatchSelectPlayerScreen from './catch/SelectPlayer';
import CatchCreateDataScreen from './catch/CreateData';
import CatchEditDataScreen from './catch/EditData';
import CatchCatchListScreen from './catch/CatchList';
import CatchEditOneCatchListScreen from './catch/EditOneCatchList';
import CatchAddOneCatchListScreen from './catch/AddOneCatchList';
import CatchCalcCatchListValueScreen from './catch/CalcCatchListValue';
import CatchPreCalcScreen from './catch/PreCalc';
import CatchSelectBuyerScreen from './catch/SelectBuyer';
import CatchDuplicateScreen from './catch/DuplicateCatch';
import MapScreen from './Map';
import SelectScreen from './MySelect';
import PickerScreen from './MyPicker';
import SettingPanel from './SettingPanel';
import DeliveryListScreen from './delivery/List';
import DeliverySelectScreen from './delivery/Select';
import DeliveryCatchListScreen from './delivery/CatchList';
import DeliveryCatchListCloseScreen from './delivery/CatchListClose';
import DeliveryCalcPriceScreen from './delivery/CalcPrice';
import DeliveryCloseScreen from './delivery/Close';
import DeliverySheetScreen from './delivery/DeliverySheet';
import DeliveryAddScreen from './delivery/AddDelivery';
import DeliveryPreCalcScreen from './delivery/PreCalc';
import DeliveryShowQRCodesScreen from './delivery/ShowQRCodes';
import CatchScanQRCodeScreen from './ScanQRCode';
import ReportListScreen from './report/List';
import ReportLoanTabsScreen from './report/LoanTabs';
import ReportSaleTabsScreen from './report/SaleTabs';
import TransactionReportScreen from './report/Sale';
import LoanReportScreen from './report/Loan';
import FishermanSupplierFilterScreen from './report/FishermanSupplierFilter';
import FishermanSupplierReportScreen from './report/FishermanSupplierReport';
import FishermanSupplierTabsScreen from './report/FishermanSupplierTabs';
import SaleFilterScreen from './report/SaleFilter';
import ChangePINScreen from './others/ChangePin';
import ChangeLangScreen from './others/ChangeLang';
import HelpScreen from './others/Help';
import EditProfileScreen from './others/EditProfile';
import SynchScreen from './SynchScreen';

const lib = require('./lib');
const L = require('./dictionary').translate;

const HomeTabsOpt = {
  headerMode: 'screen',
  navigationOptions: ({ navigation }) => {
    const { routeName } = navigation.state;
    const config = {
      Tab1:{iconName:'balance-scale',label:L('CATCH')},
      Tab2:{iconName:'money',label:L('LOAN')},
      Tab3:{iconName:'truck',label:L('DELIVERY')},
      Tab4:{iconName:'book',label:L('REPORT')},
    }

    return {
      tabBarIcon: ({ focused, tintColor }) => {
        let iconName = config[routeName].iconName;
        return <FontAwesome name={iconName} size={25} color={tintColor} />;
      },
      tabBarLabel: config[routeName].label
    }
  },
  tabBarOptions: {
    activeTintColor: lib.THEME_COLOR,
    inactiveTintColor: 'gray',
  },
}

const HomeTabsRole1 = createBottomTabNavigator({ 
  Tab1: CatchListScreen,
  // Tab1: ReportListScreen,
  Tab2: LoanListScreen,
  Tab3: DeliveryListScreen,
  Tab4: ReportListScreen
},HomeTabsOpt);

const HomeTabsRole2 = createBottomTabNavigator({ 
  Tab1: CatchListScreen,
  Tab2: LoanListScreen,
  Tab3: DeliveryListScreen
},HomeTabsOpt);

const HomeTabsRole3 = createBottomTabNavigator({ 
  Tab1: CatchListScreen,
  Tab3: DeliveryListScreen
},HomeTabsOpt);

class HomeTabs extends Component {
  componentDidMount() {
    console.warn(this.props.stateLogin);
    if(this.props.stateLogin.accessrole == '1')
      return this.props.navigation.replace('HomeTabsRole1');
    if(this.props.stateLogin.accessrole == '2')
      return this.props.navigation.replace('HomeTabsRole2');

    this.props.navigation.replace('HomeTabsRole3');
  }

  render() {
    return (
      <View />
    );
  }
}

HomeTabs = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeTabs);

const HomeStack = createStackNavigator({ 
  HomeTabs: HomeTabs,
  HomeTabsRole1: HomeTabsRole1,
  HomeTabsRole2: HomeTabsRole2,
  HomeTabsRole3: HomeTabsRole3,
  LoanListNewScreen: LoanListNewScreen,
  LoanAddItemScreen: LoanAddItemScreen,
  LoanEditItemScreen: LoanEditItemScreen,
  LoanListItemsScreen: LoanListItemsScreen,
  LoanCheckItemsScreen: LoanCheckItemsScreen,
  LoanPayScreen: LoanPayScreen,
  LoanSelectTypeScreen: LoanSelectTypeScreen,
  CatchSelectPlayerScreen: CatchSelectPlayerScreen,
  CatchCreateDataScreen: CatchCreateDataScreen,
  CatchEditDataScreen: CatchEditDataScreen,
  CatchCatchListScreen: CatchCatchListScreen,
  CatchEditOneCatchListScreen: CatchEditOneCatchListScreen,
  AddSailLetterPhoto: CameraScreen,
  CatchSelectShip:ShipListSelectScreen,
  CatchSelectFish:FishListSelectScreen,
  CatchAddOneCatchListScreen:CatchAddOneCatchListScreen,
  CatchCalcCatchListValueScreen:CatchCalcCatchListValueScreen,
  CatchPreCalcScreen:CatchPreCalcScreen,
  CatchDuplicateScreen:CatchDuplicateScreen,
  MapScreen:MapScreen,
  CatchSelectBuyerScreen:CatchSelectBuyerScreen,
  DeliveryCatchListScreen:DeliveryCatchListScreen,
  DeliveryCatchListCloseScreen:DeliveryCatchListCloseScreen,
  DeliveryCalcPriceScreen:DeliveryCalcPriceScreen,
  DeliveryCloseScreen:DeliveryCloseScreen,
  DeliverySheetScreen:DeliverySheetScreen,
  DeliveryPreCalcScreen:DeliveryPreCalcScreen,
  DeliveryShowQRCodesScreen:DeliveryShowQRCodesScreen,
  CatchScanQRCodeScreen:CatchScanQRCodeScreen,
  SelectScreen:SelectScreen,
  ReportLoanTabsScreen:ReportLoanTabsScreen,
  ReportSaleTabsScreen:ReportSaleTabsScreen,
  TransactionReportScreen:TransactionReportScreen,
  LoanReportScreen:LoanReportScreen,
  FishermanSupplierFilterScreen:FishermanSupplierFilterScreen,
  FishermanSupplierReportScreen:FishermanSupplierReportScreen,
  FishermanSupplierTabsScreen:FishermanSupplierTabsScreen,
  CameraScreen:CameraScreen,
  SynchScreen:SynchScreen,
  DeliveryAddScreen:DeliveryAddScreen,
  DeliverySelectScreen:DeliverySelectScreen,
  PickerScreen: PickerScreen,
  SaleFilterScreen: SaleFilterScreen
},{
  navigationOptions: ({ navigation }) => {
    const params = navigation.state.params || {};
    const { routeName } = navigation.state;
    const config = {
      Tab1:{iconName:'balance-scale',label:L('CATCH')},
      Tab2:{iconName:'money',label:L('LOAN')},
      Tab3:{iconName:'truck',label:L('DELIVERY')},
      Tab4:{iconName:'book',label:L('REPORT')},
    }

    let label = null;

    if(routeName == 'HomeTabsRole1' || routeName == 'HomeTabsRole2' || routeName == 'HomeTabsRole3') {
      const routes = navigation.state.routes;
      const index = navigation.state.index;
      if(routes && routes[index] && routes[index].routeName) {
        const rn = routes[index].routeName;
        if(config[rn]) label = config[rn].label;
      }
    }

    return {
      headerStyle: {
        backgroundColor: lib.THEME_COLOR,
      },
      headerLeft: (
        <Navicon navigation={navigation}/>
      ),
      headerTitle: (
        <Title txt={label}/>
      ),
      headerRight: (
        <OnlineIndicator navigation={navigation} />
      )
    };
  }
});

const LoginStack = createStackNavigator({ 
  LoginScreen: LoginScreen,
  Register: RegisterScreen
});

// const stdNavOpts = {
//   headerStyle: {
//     backgroundColor: lib.THEME_COLOR,
//   },
//   headerTitle: (
//     <Title />
//   ),
//   headerRight: (
//     <OnlineIndicator />
//   )
// };

const stdNavOpts = ({ navigation }) => {
  return {
    headerStyle: {
      backgroundColor: lib.THEME_COLOR,
    },
    headerTitle: (
      <Title />
    ),
    headerRight: (
      <OnlineIndicator navigation={navigation} />
    )
  };
};


const CreateBuyerStack = createStackNavigator({ 
  BuyerListScreen: BuyerListScreen,
  BuyerDetailScreen: BuyerDetailScreen,
  BuyerSelectScreen: SelectScreen
},{
  initialRouteName: 'BuyerListScreen',
  navigationOptions: stdNavOpts
});

const CreateSupplierStack = createStackNavigator({ 
  SupplierListScreen: SupplierListScreen,
  SupplierDetailScreen: SupplierDetailScreen,
  SupplierSelectScreen: SelectScreen
},{
  initialRouteName: 'SupplierListScreen',
  navigationOptions: stdNavOpts
});

const CreateFishermanStack = createStackNavigator({ 
  CreateFishermanList: ListScreen,
  CreateFishermanDetail: DetailScreen,
  CreateFishermanCamera: CameraScreen,
  FishermanSelectScreen: SelectScreen
},{
  initialRouteName: 'CreateFishermanList',
  navigationOptions: stdNavOpts
});

const CreateVesselBoatStack = createStackNavigator({ 
  CreateVesselBoatList: ShipListScreen,
  CreateVesselBoatDetail: ShipDetailScreen,
  CreateVesselBoatCamera: CameraScreen,
  CreateVesselSelect: SelectScreen,
  CreateVesselSelectGear: PickerScreen
},{
  initialRouteName: 'CreateVesselBoatList',
  navigationOptions: stdNavOpts
});

const EditFishStack = createStackNavigator({ 
  CreateFishList: FishListScreen,
  CreateFishDetail: FishDetailScreen,
  CreateFishCamera: CameraScreen,
  CreateFishSearch: FishSearchScreen
},{
  initialRouteName: 'CreateFishList',
  navigationOptions: stdNavOpts
});

const ChangePINStack = createStackNavigator({ 
  ChangePINScreen: ChangePINScreen
},{
  initialRouteName: 'ChangePINScreen',
  navigationOptions: stdNavOpts
});

const ChangeLangStack = createStackNavigator({ 
  ChangeLangScreen: ChangeLangScreen
},{
  initialRouteName: 'ChangeLangScreen',
  navigationOptions: stdNavOpts
});

const HelpStack = createStackNavigator({ 
  HelpScreen: HelpScreen
},{
  initialRouteName: 'HelpScreen',
  navigationOptions: stdNavOpts
});

const EditProfileStack = createStackNavigator({ 
  EditProfileScreen: EditProfileScreen,
  ProfileSelectScreen: SelectScreen
},{
  initialRouteName: 'EditProfileScreen',
  navigationOptions: stdNavOpts
});

const CustomDrawer = (props) => (
  <View style={{flex:1}}>
    <View style={{backgroundColor:'white',height:180,alignItems:'center',justifyContent:'center'}}>
      <Image style={{height:64}} resizeMode='contain' source={require('./logo.png')} />
    </View>
    <View style={{flex:1}}>
      <ScrollView>
        <SafeAreaView style={{flex:1}} forceInset={{ top: 'always', horizontal: 'never' }}>
          <DrawerItems {...props} />
        </SafeAreaView>
      </ScrollView>
    </View>
    <View style={{height:40}}>
      <SettingPanel />
    </View>
  </View>
);

const DrawerStack = createDrawerNavigator({
  HomeMenu: {
    screen:HomeStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Home'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  ChangePinMenu: {
    screen: ChangePINStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Change PIN'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  ChangeLangMenu: {
    screen: ChangeLangStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Change Language'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  HelpMenu: {
    screen: HelpStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Help'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
},{
  contentComponent:CustomDrawer
});

const FullDrawerStack = createDrawerNavigator({
  HomeMenu: {
    screen:HomeStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Home'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  EditProfileMenu: {
    screen: EditProfileStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Edit Profile'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  SupplierMenu: {
    screen: CreateSupplierStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Register Supplier'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  BuyerMenu: {
    screen: CreateBuyerStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Register Buyer'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  FishermanMenu: {
    screen: CreateFishermanStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Register Fishermen'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  VesselBoatMenu: {
    screen: CreateVesselBoatStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Register Fishing Vessel'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  FishMenu: {
    screen: EditFishStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Register Fish'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  ChangePinMenu: {
    screen: ChangePINStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Change PIN'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  ChangeLangMenu: {
    screen: ChangeLangStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Change Language'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  HelpMenu: {
    screen: HelpStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Help'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
},{
  contentComponent:CustomDrawer
});

const RootStack = createSwitchNavigator(
  {
    LoginCheck: LoginCheckScreen,
    Login:LoginStack,
    Home:DrawerStack,
    HomeOwner:FullDrawerStack,
    Relogin:ReloginScreen
  },
  {
    initialRouteName: 'LoginCheck'
  }
);

class TopScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
    }
  }

  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      this.handleNetInfo(connectionInfo);
    });

    AppState.addEventListener('change', status => this.handleAppStateChange(status));
    NetInfo.addEventListener('connectionChange', info => this.handleNetInfo(info));    
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', status => this.handleAppStateChange(status));
    NetInfo.removeEventListener('connectionChange', info => this.handleNetInfo(info));    
  }

  handleNetInfo(info) {  
    if(info.type === 'none' || info.type === 'unknown' ) {
      this.props.actions.appSetConnection(false);
      this.props.actions.setOffline(true);
    } else {
      this.props.actions.appSetConnection(true);
    }
  }

  handleAppStateChange(status) {
  }

  navTo(path) {
    if(this._nav) {
      this._nav.dispatch(
        NavigationActions.navigate({
          routeName:path
        })
      );  
    }
  }

  render() {
    return (
      <RootStack />
    );
  }
}

function mapStateToProps(state) {
  return {
    stateApp: state.App,
    stateLogin: state.Login
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

TopScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopScreen);

export default TopScreen;


import React, { Component } from 'react';
import { Image, AppRegistry, StyleSheet, Text, View, Button, AppState, NetInfo, ScrollView , Touchable} from 'react-native';
import { 
  createStackNavigator, 
  createSwitchNavigator, 
  createBottomTabNavigator,
  createDrawerNavigator,
  NavigationActions,
  DrawerItem,
  DrawerItems, 
  SafeAreaView
} from 'react-navigation';
import TouchableItem from 'react-navigation/src/views/TouchableItem';
import CustomDrawerItems from './CustomDrawerItems';
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

import FinancialReportListScreen from './financialreport/ReportList';
import FinancialReportFinancialScreen from './financialreport/FinancialReport';
import FinancialReportFilterScreen from './financialreport/DataFilter';
import FinancialReportAnnualFinancialScreen from './financialreport/AnnualFinancialReport';
import FinancialReportCatchScreen from './financialreport/CatchReport';
import FinancialReportAnnualCatchScreen from './financialreport/AnnualCatchReport';

import TransactionListScreen from './transaction/List';
import TransactionListAddIncome from './transaction/AddIncome';
import TransactionListAddExpense from './transaction/AddExpense';
import TransactionListBuyFish  from './transaction/BuyFish';
import TransactionListSellFish  from './transaction/SellFish';
import TransactionListSplitFish from './transaction/SplitFish';
import TransactionListGetLoan from './transaction/GetLoan';
import TransactionListLoanList from './transaction/LoanList';
import TransactionListLoanPayment from './transaction/LoanPayment';
import TransactionListDebtPayment from './transaction/DebtPayment';
import TransactionListGiveLoan from './transaction/GiveLoan';
import TransactionListDebtList from './transaction/DebtList';
import TransactionListAddNewCategory from './transaction/AddNewCategory';
import TransactionListAddNewIncomeCategory from './transaction/AddNewIncomeCategory';

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

import InvestHomeScreen from './invest/Home';
import InvestAddExpenseScreen from './invest/AddExpense';
import InvestAddIncomeScreen from './invest/AddIncome';
import InvestTakeLoanScreen from './invest/TakeLoan';
import InvestTakeLoanInfoScreen from './invest/TakeLoanInfo';
import InvestPayLoanScreen from './invest/PayLoan';
import InvestBuyFishScreen from './invest/BuyFish';
import InvestVesselSelectScreen from './invest/SelectVessel';
import InvestVesselCreateScreen from './ship/Detail';
import InvestVesselListSelectScreen from './ship/ListSelect';

import InvestSplitFishScreen from './invest/SplitFish';
import InvestSellFishScreen from './invest/SellFish';
import InvestSimpleSellFishScreen from './invest/SimpleSellFish';
import InvestGiveCreditScreen from './invest/GiveCredit';
import InvestCreditPaymentScreen from './invest/CreditPayment';
import InvestSelectBuyFishToSellScreen from './invest/SelectBuyFishToSell';
import InvestSelectTakeLoanToPayScreen from './invest/SelectTakeLoanToPay';
import InvestSelectTakeLoanToPayShortCutScreen from './invest/SelectTakeLoanToPayShortCut';
import InvestSelectCreditForPaymentScreen from './invest/SelectCreditForPayment';
import InvestCustomTypeIncomeScreen from './invest/CustomTypeIncome';
import InvestCustomTypeExpenseScreen from './invest/CustomTypeExpense';
import InvestCustomIncomeScreen from './invest/CustomIncome';
import InvestCustomExpenseScreen from './invest/CustomExpense';
import InvestCustomEditSelectScreen from './invest/CustomTypeEditSelect';
import InvestCustomEditListScreen from './invest/CustomTypeEditList';
import InvestCustomEditScreen from './invest/CustomTypeEdit';
import BuyFishMapScreen from './Map';
import XlsxScreen from './xlsxPage';


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

const CreateCatchStack = createStackNavigator(
  {
    CatchListScreen               : CatchListScreen,
    CatchSelectPlayerScreen       : CatchSelectPlayerScreen,
    CatchCreateDataScreen         : CatchCreateDataScreen,
    CatchEditDataScreen           : CatchEditDataScreen,
    CatchCatchListScreen          : CatchCatchListScreen,
    CatchEditOneCatchListScreen   : CatchEditOneCatchListScreen,
    CatchAddOneCatchListScreen    : CatchAddOneCatchListScreen,
    CatchCalcCatchListValueScreen : CatchCalcCatchListValueScreen,
    CatchPreCalcScreen            : CatchPreCalcScreen,
    CatchSelectBuyerScreen        : CatchSelectBuyerScreen,
    CatchDuplicateScreen          : CatchDuplicateScreen,
    MapScreen:MapScreen,
  },
  {
    initialRouteName  : 'CatchListScreen',
    navigationOptions : stdNavOpts
  }
);

const CreateLoanStack = createStackNavigator(
  {
    LoanListScreen            : LoanListScreen,
    LoanListNewScreen         : LoanListNewScreen,
    LoanListItemsScreen       : LoanListItemsScreen,
    LoanAddItemScreen         : LoanAddItemScreen,
    LoanEditItemScreen        : LoanEditItemScreen,
    LoanCheckItemsScreen      : LoanCheckItemsScreen,
    LoanPayScreen             : LoanPayScreen,
    LoanSelectTypeScreen      : LoanSelectTypeScreen
  },
  {
    initialRouteName  : 'LoanListScreen',
    navigationOptions : stdNavOpts
  }
);

const CreateDeliveryStack = createStackNavigator(
  {
    DeliveryListScreen              : DeliveryListScreen,
    DeliverySelectScreen            : DeliverySelectScreen,
    DeliveryCatchListScreen         : DeliveryCatchListScreen,
    DeliveryCatchListCloseScreen    : DeliveryCatchListCloseScreen,
    DeliveryCalcPriceScreen         : DeliveryCalcPriceScreen,
    DeliveryCloseScreen             : DeliveryCloseScreen,
    DeliverySheetScreen             : DeliverySheetScreen,
    DeliveryAddScreen               : DeliveryAddScreen,
    DeliveryPreCalcScreen           : DeliveryPreCalcScreen,
    DeliveryShowQRCodesScreen       : DeliveryShowQRCodesScreen,
    CatchScanQRCodeScreen           : CatchScanQRCodeScreen
  },
  {
    initialRouteName  : 'DeliveryListScreen',
    navigationOptions : stdNavOpts
  }
);

const CreateLoanShortCutStack = createStackNavigator(
  {
    InvestSelectTakeLoanToPayShortCutScreen : InvestSelectTakeLoanToPayShortCutScreen,
    InvestTakeLoanInfoScreen        : InvestTakeLoanInfoScreen   
  },
  {
    initialRouteName  : 'InvestSelectTakeLoanToPayShortCutScreen',
    navigationOptions : stdNavOpts
  }
)

const CreateCatchReportStack = createStackNavigator(
  {
    ReportListScreen                 : ReportListScreen,
    ReportLoanTabsScreen             : ReportLoanTabsScreen,
    ReportSaleTabsScreen             : ReportSaleTabsScreen,
    TransactionReportScreen          : TransactionReportScreen,
    LoanReportScreen                 : LoanReportScreen,
    FishermanSupplierFilterScreen    : FishermanSupplierFilterScreen,
    FishermanSupplierReportScreen    : FishermanSupplierReportScreen,
    FishermanSupplierTabsScreen      : FishermanSupplierTabsScreen,
    SaleFilterScreen                 : SaleFilterScreen,
  },
  {
    initialRouteName  : 'ReportListScreen',
    navigationOptions : stdNavOpts
  }
)

const CreateFinancialReportStack = createStackNavigator({ 
  FinancialReportFinancialScreen        : FinancialReportFinancialScreen,
  FinancialReportAnnualFinancialScreen  : FinancialReportAnnualFinancialScreen,
  FinancialReportCatchScreen            : FinancialReportCatchScreen,
  FinancialReportAnnualCatchScreen      : FinancialReportAnnualCatchScreen,
  FinancialReportFilterScreen           : FinancialReportFilterScreen,
  FinancialReportListScreen             : FinancialReportListScreen,
  XlsxScreen                            : XlsxScreen
},{
  initialRouteName: 'FinancialReportListScreen',
  navigationOptions: stdNavOpts
});

/*const CreateTransactionStack = createStackNavigator({
 TransactionListScreen        : TransactionListScreen,
 TransactionListAddIncome     : TransactionListAddIncome,
 TransactionListAddExpense    : TransactionListAddExpense,
 TransactionListSplitFish     : TransactionListSplitFish,
 TransactionListGetLoan       : TransactionListGetLoan,
 TransactionListLoanPayment   : TransactionListLoanPayment,
 TransactionListLoanList      : TransactionListLoanList,
 TransactionListGiveLoan      : TransactionListGiveLoan,
 TransactionListDebtList      : TransactionListDebtList,
 TransactionListDebtPayment   : TransactionListDebtPayment,
 TransactionListAddNewCategory : TransactionListAddNewCategory,
 TransactionListAddNewIncomeCategory : TransactionListAddNewIncomeCategory,
 TransactionListSellFish      : TransactionListSellFish,
 TransactionListBuyFish       : TransactionListBuyFish
},{
  initialRouteName            : 'TransactionListScreen',
  navigationOptions           : stdNavOpts
})
*/

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

const EditCustomCategoryStack = createStackNavigator({ 
  InvestCustomEditSelectScreen: InvestCustomEditSelectScreen,
  InvestCustomEditListScreen: InvestCustomEditListScreen,
  InvestCustomEditScreen: InvestCustomEditScreen
},{
  initialRouteName: 'InvestCustomEditSelectScreen',
  navigationOptions: stdNavOpts
});

const InvestLoanStack = createStackNavigator({ 
  InvestHomeScreen: InvestHomeScreen,
  InvestAddExpenseScreen: InvestAddExpenseScreen,
  InvestAddIncomeScreen: InvestAddIncomeScreen,
  InvestTakeLoanScreen: InvestTakeLoanScreen,
  InvestTakeLoanInfoScreen: InvestTakeLoanInfoScreen,
  InvestPayLoanScreen: InvestPayLoanScreen,
  InvestBuyFishScreen: InvestBuyFishScreen,
  InvestVesselSelectScreen:InvestVesselSelectScreen,
  InvestVesselCreateScreen: InvestVesselCreateScreen,
  InvestVesselListSelectScreen:InvestVesselListSelectScreen,
  InvestVesselSelectGearScreen:PickerScreen,
  InvestSellFishScreen: InvestSellFishScreen,
  InvestSelectBuyFishToSellScreen: InvestSelectBuyFishToSellScreen,
  InvestSelectTakeLoanToPayScreen: InvestSelectTakeLoanToPayScreen,
  BuyFishMapScreen: BuyFishMapScreen,
  InvestGiveCreditScreen:InvestGiveCreditScreen,
  InvestCreditPaymentScreen:InvestCreditPaymentScreen,
  InvestSelectCreditForPaymentScreen:InvestSelectCreditForPaymentScreen,
  InvestCustomTypeIncomeScreen:InvestCustomTypeIncomeScreen,
  InvestCustomTypeExpenseScreen:InvestCustomTypeExpenseScreen,
  InvestCustomIncomeScreen:InvestCustomIncomeScreen,
  InvestCustomExpenseScreen:InvestCustomExpenseScreen,
  InvestSplitFishScreen:InvestSplitFishScreen,
  InvestSimpleSellFishScreen:InvestSimpleSellFishScreen,
  XlsxScreen:XlsxScreen
},{
  initialRouteName: 'InvestHomeScreen',
  navigationOptions: stdNavOpts
});

const CustomDrawer = (props) => (
  <View style={{flex:1}}>
    <View style={{backgroundColor:'white',height:180,alignItems:'center',justifyContent:'center', borderBottomWidth :1, borderColor:'gainsboro'}}>
      <Image style={{height:64}} resizeMode='contain' source={require('./logo.png')} />
    </View>
    <View style={{flex:1, borderBottomWidth :1, borderColor:'gainsboro'}}>
      <ScrollView>
        <SafeAreaView style={{flex:1}} forceInset={{ top: 'always', horizontal: 'never' }}>
          <CustomDrawerItems {...props} 
              labelStyle={{ fontSize:lib.THEME_FONT_MEDIUM}}
              itemStyle ={{borderBottomWidth:(props.getLabel == L('Loan') ? 1 : 0)}}
          />
        </SafeAreaView>
      </ScrollView>
    </View>
    <View style={{height:40}}>
      <SettingPanel />
    </View>
  </View>
);

const DrawerStack = createDrawerNavigator({
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
  InvestTransactionMenu: {
    screen:InvestLoanStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Transaction'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor}/>
      ),
    }),
  },
  DebtMenu: {
    screen: CreateLoanShortCutStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Loan'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  FinancialReportMenu: {
    screen: CreateFinancialReportStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Financial Report'),
      drawerIcon: ({ tintColor }) => (
        <FontAwesome name='ship' color={tintColor} />
      ),
    }),
  },
  
  // TransactionMenu: {
  //   screen: CreateTransactionStack,
  //   navigationOptions: ({ navigation }) => ({
  //     drawerLabel: L('A:Transaction List'),
  //     drawerIcon: ({ tintColor }) => (
  //       <FontAwesome name='ship' color={tintColor} />
  //     ),
  //   }),
  // },
  CatchMenu:{
    screen : CreateCatchStack,
    navigationOptions : ({navigation}) => ({
      drawerLabel:L('Catch<Menu>').replace('<Menu>', ''),
      drawerIcon:({tintColor}) => (
        <FontAwesome name='ship' color={tintColor} />
      )
    })
  },

  LoanMenu:{
    screen : CreateLoanStack,
    navigationOptions : ({navigation}) => ({
      drawerLabel:L('Credit'),
      drawerIcon:({tintColor}) => (
        <FontAwesome name='ship' color={tintColor} />
      )
    })
  },

  DeliveryMenu:{
    screen : CreateDeliveryStack,
    navigationOptions : ({navigation}) => ({
      drawerLabel:L('Delivery'),
      drawerIcon:({tintColor}) => (
        <FontAwesome name='ship' color={tintColor} />
      )
    })
  },

  CatchReportMenu: {
    screen: CreateCatchReportStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Catch Report'),
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

  EditCustomCategoryMenu:{
    screen:EditCustomCategoryStack,
    navigationOptions: ({ navigation }) => ({
      drawerLabel: L('Setting Finance Category'),
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
    Relogin:ReloginScreen,
    SynchScreen: SynchScreen
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


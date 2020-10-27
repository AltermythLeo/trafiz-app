const _ = require('lodash');
const lib = require('../lib');
const moment = require('moment');
const L = require('../dictionary').translate;
const Gears = require('../Gears');


const DEFAULT_NAME = 'Other/Lainnya';

module.exports.init = init;
module.exports.getFishes = getFishes;
module.exports.createCatch = createCatch;
module.exports.createCatchByShip = createCatchByShip;
module.exports.addSomeFishToCatch = addSomeFishToCatch;
module.exports.getCatchByOfflineID = getCatchByOfflineID;
module.exports.editCatch = editCatch;
module.exports.editCatchByShip = editCatchByShip;
module.exports.createLoanRupiah = createLoanRupiah;
module.exports.editLoanRupiah = editLoanRupiah;
module.exports.createPayloanRupiah = createPayloanRupiah;
module.exports.strikeLoanRupiah = strikeLoanRupiah;

module.exports.createDefaultBatchDelivery = createDefaultBatchDelivery;
module.exports.addFishToDefaultBatchDelivery = addFishToDefaultBatchDelivery;
module.exports.closeDefaultBatchDelivery = closeDefaultBatchDelivery;
module.exports.setPriceDefaultBatchDelivery = setPriceDefaultBatchDelivery;

module.exports.getShipByName = getShipByName;
module.exports.createShipByName = createShipByName;
module.exports.getFishermanByName = getFishermanByName;
module.exports.createFishermanByName = createFishermanByName;

module.exports.getFishByOfflineID = getFishByOfflineID;
module.exports.getShipByOfflineID = getShipByOfflineID;

module.exports.getShipLabelValues = getShipLabelValues;
module.exports.getDefaultShipOfflineID = getDefaultShipOfflineID;

function getDefaultShipOfflineID(stateData) {
  const ships = stateData.ships.slice();
  let ship = getShipByName(ships,DEFAULT_NAME);
  return ship.idshipoffline;
}

function init(actions,stateLogin,stateData) {
  let p = Promise.resolve();

  const login = stateLogin;
  const idmssupplier = login.idmssupplier;
  const idmsuser = login.idmsuser;
  const uid = login.id;

  const ships = stateData.ships.slice();
  let ship = getShipByName(ships,DEFAULT_NAME);
  if(!ship) {
    p = p.then(()=>{
      return createShipByName(actions,DEFAULT_NAME,idmsuser);
    });
  }

  const fishermen = stateData.fishermans.slice();
  let fisherman = getFishermanByName(fishermen,DEFAULT_NAME);
  if(!fisherman) {
    p = p.then(()=>{
      return createFishermanByName(actions,DEFAULT_NAME,idmsuser,idmssupplier);
    });
  }

  const lts = stateData.loantype.slice();
  let lt = getLoanTypeByName(lts,'Uang/Money');
  if(!lt) {
    p = p.then(()=>{
      return createLoanTypeByName(actions,'Uang/Money','Rupiah','1',idmssupplier,uid);
    });
  }
  
  let buyer = getSupplierBuyerByName(stateData,DEFAULT_NAME);
  if(!buyer) {
    p = p.then(()=>{
      return createSupplierBuyerByName(actions,DEFAULT_NAME,idmssupplier,uid);
    });
  }

  return p;
}

function getFishes(stateData,stateSetting) {
  const fishes = stateData.fishes;
  const english = (stateSetting.language == 'english');
  let temp = [];
  let tempSorted = [];
  for(let i=0;i<fishes.length;i++) {
    const fish = fishes[i];
    if(fish.lasttransact == 'D') continue;
    let row = {
      label:fish.indname+' ('+fish.threea_code+')',
      labelIndo:fish.indname+' ('+fish.threea_code+')',
      value:fish.idfishoffline
    }
    if(english) {
      row = {
        label:fish.english_name+' ('+fish.threea_code+')',
        labelIndo:fish.indname+' ('+fish.threea_code+')',
        value:fish.idfishoffline
      }
    }
    temp.push(row);
  }

  return temp;
}

function getFishByOfflineID(stateData,offlineID) {
  const fishes = stateData.fishes.slice();

  const ret = _.find(fishes,{idfishoffline:offlineID});
  return ret;
}

function getCatchByOfflineID(stateData,offlineID) {
  const catches = stateData.catches.slice();
  _.remove(catches,{lasttransact:"D"});
  return _.find(catches,{idtrcatchoffline:offlineID});
}

function getFishCatchByOfflineID(stateData,offlineID) {
  const catches = stateData.catches.slice();
  _.remove(catches,{lasttransact:"D"});
  return _.find(catches,{idtrcatchoffline:offlineID});
}
 
function createCatch(actions,
  stateLogin,
  stateData,
  fishermanName,
  fishingGround,
  portName,
  fishOfflineID,
  totalPrice,
  weightTxt,
  gradeTxt,
  numSplit) {

  const curDatetime = moment().format('YYYY-MM-DD'); //"2019-10-30";
  const offlineID = lib.getShortOfflineId('catch',stateLogin.id.toString(36));

  const ships = stateData.ships.slice();
  const ship = getShipByName(ships,DEFAULT_NAME);
  const shipOfflineID = ship.idshipoffline;
  const fishermen = stateData.fishermans.slice();
  const fisherman = getFishermanByName(fishermen,DEFAULT_NAME);
  const fishermanOfflineID = fisherman.idfishermanoffline;
  const fish = _.find(stateData.fishes,{idfishoffline:fishOfflineID});

  if(!shipOfflineID || !fishermanOfflineID) return Promise.reject('default fisherman & ship not defined');
  
  const idmssupplier = stateLogin.idmssupplier;
  const suppliername = stateLogin.identity;
  const fishermanname = fisherman.name;  
  const shipname = ship.vesselname_param;
  const englishname = fish.english_name;
  const indname = fish.indname;
  const threea_code = fish.threea_code;

  let fishCatchIds;

  return Promise.resolve().then(()=>{

    const json = {
      bycatchparam: "0",
      catchorfarmedparam: "1",
      datetimevesseldepartureparam: curDatetime,
      datetimevesselreturnparam: curDatetime,
      fadusedparam: "0",
      fishermanidparam: null,
      fishermannameparam: fishermanName,
      fishermanregnumberparam: null,
      fishinggroundareaparam: fishingGround, // "715,O38"
      idbuyerofflineparam: null,
      idfishermanofflineparam: fishermanOfflineID, // "fisherman-d51597cf802411e89cd1000d3aa384f1-1571858036404-8061"
      idfishofflineparam: fishOfflineID, //"fish-d51597cf802411e89cd1000d3aa384f1-1534237805978-7894"
      idmssupplierparam: idmssupplier,
      idshipofflineparam: shipOfflineID, //"ship-d51597cf802411e89cd1000d3aa384f1-1530975763043-4124"
      idtrcatchofflineparam: offlineID, //"CATCH-2-1DODKS69J"
      loanexpenseparam: "0",
      otherexpenseparam: "0",
      portnameparam: portName,
      postdateparam: null,
      priceperkgparam: null,
      productformatlandingparam: "0",
      purchasedateparam: curDatetime,
      purchaselocationparam: null,
      purchasetimeparam: "00:00:00",
      purchaseuniquenoparam: offlineID, //"CATCH-2-1DODKS69J"
      quantityparam: "0",
      totalpriceparam: totalPrice,
      uniquetripidparam: null,
      unitmeasurementparam: "1",
      weightparam: "0"
    }
    
    const offlineJson = {
      idtrcatchoffline:json['idtrcatchofflineparam'],
      idmssupplier:json['idmssupplierparam'],
      suppliername:suppliername,
      idfishermanoffline:json['idfishermanofflineparam'],
      idbuyeroffline:json['idbuyerofflineparam'],
      fishermanname:fishermanname,
      buyersuppliername:null,
      idshipoffline:json['idshipofflineparam'],
      shipname:shipname,
      idfishoffline:json['idfishofflineparam'],
      purchasedate:json['purchasedateparam'],
      purchasetime:json['purchasetimeparam'],
      catchorfarmed:json['catchorfarmedparam'],
      bycatch:json['bycatchparam'],
      fadused:json['fadusedparam'],
      purchaseuniqueno:json['purchaseuniquenoparam'],
      productformatlanding:json['productformatlandingparam'],
      unitmeasurement:json['unitmeasurementparam'],
      quantity:json['quantityparam'],
      weight:json['weightparam'],
      fishinggroundarea:json['fishinggroundareaparam'],
      purchaselocation:json['purchaselocationparam'],
      uniquetripid:json['uniquetripidparam'],
      datetimevesseldeparture:json['datetimevesseldepartureparam'], //2018-07-18 00:00:00
      datetimevesselreturn:json['datetimevesselreturnparam'], //2018-07-18 00:00:00
      portname:json['portnameparam'],
      englishname:englishname,
      indname:indname,
      threea_code:threea_code,
      priceperkg:json['priceperkgparam'],
      totalprice:json['totalpriceparam'],
      loanexpense:json['loanexpenseparam'],
      otherexpense:json['otherexpenseparam'],
      postdate:json['postdateparam'],
      fishermanname2:json['fishermannameparam'],
      fishermanid:json['fishermanidparam'],
      fishermanregnumber:json['fishermanregnumberparam'],
      fish:[]
    }  

    return actions.addCatchList(json,offlineJson);
  })
  .then(()=>{
    return addSomeFishToCatch(actions,stateLogin,offlineID,weightTxt,gradeTxt,numSplit);
  })
  .then(ids=>{
    fishCatchIds = ids;
    return actions.getCatchFishes();
  })
  .then(()=>{
    console.warn('sampai sini aman');
    return {
      catchOfflineID:offlineID,
      fishCatchIds:fishCatchIds
    };
  });
}

function createCatchByShip(actions,
  stateLogin,
  stateData,
  fishermanName,
  fishingGround,
  portName,
  fishOfflineID,
  shipOfflineID,
  totalPrice,
  weightTxt,
  gradeTxt,
  numSplit) {

  const curDatetime = moment().format('YYYY-MM-DD'); //"2019-10-30";
  const offlineID = lib.getShortOfflineId('catch',stateLogin.id.toString(36));

  const ships = stateData.ships.slice();
  const ship = getShipByOfflineID(stateData,shipOfflineID);
  const fishermen = stateData.fishermans.slice();
  const fisherman = getFishermanByName(fishermen,DEFAULT_NAME);
  const fishermanOfflineID = fisherman.idfishermanoffline;
  const fish = _.find(stateData.fishes,{idfishoffline:fishOfflineID});

  if(!shipOfflineID || !fishermanOfflineID) return Promise.reject('default fisherman & ship not defined');
  
  const idmssupplier = stateLogin.idmssupplier;
  const suppliername = stateLogin.identity;
  const fishermanname = fisherman.name;  
  const shipname = ship.vesselname_param;
  const englishname = fish.english_name;
  const indname = fish.indname;
  const threea_code = fish.threea_code;

  let fishCatchIds;

  return Promise.resolve().then(()=>{

    const json = {
      bycatchparam: "0",
      catchorfarmedparam: "1",
      datetimevesseldepartureparam: curDatetime,
      datetimevesselreturnparam: curDatetime,
      fadusedparam: "0",
      fishermanidparam: null,
      fishermannameparam: fishermanName,
      fishermanregnumberparam: null,
      fishinggroundareaparam: fishingGround, // "715,O38"
      idbuyerofflineparam: null,
      idfishermanofflineparam: fishermanOfflineID, // "fisherman-d51597cf802411e89cd1000d3aa384f1-1571858036404-8061"
      idfishofflineparam: fishOfflineID, //"fish-d51597cf802411e89cd1000d3aa384f1-1534237805978-7894"
      idmssupplierparam: idmssupplier,
      idshipofflineparam: shipOfflineID, //"ship-d51597cf802411e89cd1000d3aa384f1-1530975763043-4124"
      idtrcatchofflineparam: offlineID, //"CATCH-2-1DODKS69J"
      loanexpenseparam: "0",
      otherexpenseparam: "0",
      portnameparam: portName,
      postdateparam: null,
      priceperkgparam: null,
      productformatlandingparam: "0",
      purchasedateparam: curDatetime,
      purchaselocationparam: null,
      purchasetimeparam: "00:00:00",
      purchaseuniquenoparam: offlineID, //"CATCH-2-1DODKS69J"
      quantityparam: "0",
      totalpriceparam: totalPrice,
      uniquetripidparam: null,
      unitmeasurementparam: "1",
      weightparam: "0"
    }
    
    const offlineJson = {
      idtrcatchoffline:json['idtrcatchofflineparam'],
      idmssupplier:json['idmssupplierparam'],
      suppliername:suppliername,
      idfishermanoffline:json['idfishermanofflineparam'],
      idbuyeroffline:json['idbuyerofflineparam'],
      fishermanname:fishermanname,
      buyersuppliername:null,
      idshipoffline:json['idshipofflineparam'],
      shipname:shipname,
      idfishoffline:json['idfishofflineparam'],
      purchasedate:json['purchasedateparam'],
      purchasetime:json['purchasetimeparam'],
      catchorfarmed:json['catchorfarmedparam'],
      bycatch:json['bycatchparam'],
      fadused:json['fadusedparam'],
      purchaseuniqueno:json['purchaseuniquenoparam'],
      productformatlanding:json['productformatlandingparam'],
      unitmeasurement:json['unitmeasurementparam'],
      quantity:json['quantityparam'],
      weight:json['weightparam'],
      fishinggroundarea:json['fishinggroundareaparam'],
      purchaselocation:json['purchaselocationparam'],
      uniquetripid:json['uniquetripidparam'],
      datetimevesseldeparture:json['datetimevesseldepartureparam'], //2018-07-18 00:00:00
      datetimevesselreturn:json['datetimevesselreturnparam'], //2018-07-18 00:00:00
      portname:json['portnameparam'],
      englishname:englishname,
      indname:indname,
      threea_code:threea_code,
      priceperkg:json['priceperkgparam'],
      totalprice:json['totalpriceparam'],
      loanexpense:json['loanexpenseparam'],
      otherexpense:json['otherexpenseparam'],
      postdate:json['postdateparam'],
      fishermanname2:json['fishermannameparam'],
      fishermanid:json['fishermanidparam'],
      fishermanregnumber:json['fishermanregnumberparam'],
      fish:[]
    }  

    return actions.addCatchList(json,offlineJson);
  })
  .then(()=>{
    return addSomeFishToCatch(actions,stateLogin,offlineID,weightTxt,gradeTxt,numSplit);
  })
  .then(ids=>{
    fishCatchIds = ids;
    return actions.getCatchFishes();
  })
  .then(()=>{
    console.warn('sampai sini aman');
    return {
      catchOfflineID:offlineID,
      fishCatchIds:fishCatchIds
    };
  });
}

function addSomeFishToCatch(actions,stateLogin,catchOfflineID,weightTxt,gradeTxt,numSplit) {
  const uid = stateLogin.id;
  const weightOnSplit = ''+Math.floor(Number(weightTxt) / numSplit);
  let p = Promise.resolve();
  let fishcatchIds = [];
  for(let i=0;i<numSplit;i++) {
    p = p.then(()=>{
      const fishcatchId = lib.getShortOfflineId('fishcatch',uid.toString(36));
      const idFish = lib.getIdFish(uid.toString(36));

      const json = {
        idtrcatchofflineparam:catchOfflineID,
        idtrfishcatchofflineparam:fishcatchId,
        amountparam:weightOnSplit,
        gradeparam:gradeTxt,
        descparam:'',
        idfishparam:idFish
      }
    
      const offlineJson = {
        idtrcatchoffline:catchOfflineID,
        idtrfishcatchoffline:json['idtrfishcatchofflineparam'],
        amount:json['amountparam'],
        grade:json['gradeparam'],
        description:json['descparam'],
        idfish:idFish,
      }

      fishcatchIds.push(fishcatchId);
      
      return actions.addFishToCatchList(json,offlineJson)
    })
    .then(()=>{
      return lib.delay(10);
    })
  }

  return Promise.resolve()
    .then(()=>{
      return p;
    })
    .then(()=>{
      return actions.synchronizeNow();
    })
    .then(()=>{
      return fishcatchIds;
    });
}

function editCatch(actions,
  stateData,
  catchOfflineID,
  fishermanName,
  fishingGround,
  portName,
  fishOfflineID,
  totalPrice,
  weightTxt,
  gradeTxt) {

  const refJson = {
    idtrcatchofflineparam:'idtrcatchoffline',
    idmssupplierparam:'idmssupplier',
    idfishermanofflineparam:'idfishermanoffline',
    idbuyerofflineparam:'idbuyeroffline',
    idshipofflineparam:'idshipoffline',
    idfishofflineparam:'idfishoffline',
    purchasedateparam:'purchasedate',
    purchasetimeparam:'purchasetime',
    catchorfarmedparam:'catchorfarmed',
    bycatchparam:'bycatch',
    fadusedparam:'fadused',
    purchaseuniquenoparam:'purchaseuniqueno',
    productformatlandingparam:'productformatlanding',
    unitmeasurementparam:'unitmeasurement',
    quantityparam:'quantity',
    weightparam:'weight',
    fishinggroundareaparam:'fishinggroundarea',
    purchaselocationparam:'purchaselocation',
    uniquetripidparam:'uniquetripid',
    datetimevesseldepartureparam:'datetimevesseldeparture',
    datetimevesselreturnparam:'datetimevesselreturn',
    portnameparam:'portname',
    priceperkgparam:'priceperkg',
    totalpriceparam:'totalprice',
    loanexpenseparam:'loanexpense',
    otherexpenseparam:'otherexpense',
    postdateparam:'postdate',
    closeparam:'close',
    priceperkgparam:'priceperkg',
    totalpriceparam:'totalprice',
    otherexpenseparam:'otherexpense',
    loanexpenseparam:'loanexpense'
  }

  const oldCatch = getCatchByOfflineID(stateData,catchOfflineID);
  const json = {};
  for(let key in refJson) {
    if (refJson.hasOwnProperty(key)) {
      const key2 = refJson[key];
      json[key] = oldCatch[key2]; 
    }
  }
  
  json['fishermannameparam'] = fishermanName;
  json['fishinggroundareaparam'] = fishingGround;
  json['idfishofflineparam'] = fishOfflineID;
  json['portnameparam'] = portName;
  json['totalpriceparam'] = totalPrice;
  json['noteparam'] = '';

  const offlineJsonForNotes = {
    idtrcatchoffline:json['idtrcatchofflineparam'],
    priceperkg:json['priceperkgparam'],
    totalprice:json['totalpriceparam'],
    loanexpense:json['loanexpenseparam'],
    otherexpense:json['otherexpenseparam'],
    notes:json['noteparam']
  }

  const ships = stateData.ships;
  const ship = _.find(ships,{idshipoffline:json['idshipofflineparam']});
  const shipname = ship.vesselname_param;

  const fishes = stateData.fishes;
  const fish = _.find(fishes,{idfishoffline:json['idfishofflineparam']});
  const englishname = fish.english_name;
  const indname = fish.indname;
  const threea_code = fish.threea_code;

  const offlineJson = {
    idtrcatchoffline:json['idtrcatchofflineparam'],
    idshipoffline:json['idshipofflineparam'],
    shipname:shipname,
    idfishoffline:json['idfishofflineparam'],
    purchasedate:json['purchasedateparam'],
    purchasetime:json['purchasetimeparam'],
    catchorfarmed:json['catchorfarmedparam'],
    bycatch:json['bycatchparam'],
    fadused:json['fadusedparam'],
    purchaseuniqueno:json['purchaseuniquenoparam'],
    productformatlanding:json['productformatlandingparam'],
    unitmeasurement:json['unitmeasurementparam'],
    quantity:json['quantityparam'],
    weight:json['weightparam'],
    fishinggroundarea:json['fishinggroundareaparam'],
    purchaselocation:json['purchaselocationparam'],
    uniquetripid:json['uniquetripidparam'],
    datetimevesseldeparture:json['datetimevesseldepartureparam'],
    datetimevesselreturn:json['datetimevesselreturnparam'],
    portname:json['portnameparam'],
    englishname:englishname,
    indname:indname,
    threea_code:threea_code,
    fishermanname2:json['fishermannameparam'],
    fishermanid:json['fishermanidparam'],
    fishermanregnumber:json['fishermanregnumberparam'],
  }

  return actions.editCatchListHaveNotes(json,offlineJsonForNotes)   
  .then(()=>{
    return actions.editCatchList(json,offlineJson);
  })
  .then(()=>{
    return actions.getCatchFishes();
  });
}

function editCatchByShip(actions,
  stateData,
  catchOfflineID,
  fishermanName,
  fishingGround,
  portName,
  fishOfflineID,
  shipOfflineID,
  totalPrice,
  weightTxt,
  gradeTxt) {

  const refJson = {
    idtrcatchofflineparam:'idtrcatchoffline',
    idmssupplierparam:'idmssupplier',
    idfishermanofflineparam:'idfishermanoffline',
    idbuyerofflineparam:'idbuyeroffline',
    idshipofflineparam:'idshipoffline',
    idfishofflineparam:'idfishoffline',
    purchasedateparam:'purchasedate',
    purchasetimeparam:'purchasetime',
    catchorfarmedparam:'catchorfarmed',
    bycatchparam:'bycatch',
    fadusedparam:'fadused',
    purchaseuniquenoparam:'purchaseuniqueno',
    productformatlandingparam:'productformatlanding',
    unitmeasurementparam:'unitmeasurement',
    quantityparam:'quantity',
    weightparam:'weight',
    fishinggroundareaparam:'fishinggroundarea',
    purchaselocationparam:'purchaselocation',
    uniquetripidparam:'uniquetripid',
    datetimevesseldepartureparam:'datetimevesseldeparture',
    datetimevesselreturnparam:'datetimevesselreturn',
    portnameparam:'portname',
    priceperkgparam:'priceperkg',
    totalpriceparam:'totalprice',
    loanexpenseparam:'loanexpense',
    otherexpenseparam:'otherexpense',
    postdateparam:'postdate',
    closeparam:'close',
    priceperkgparam:'priceperkg',
    totalpriceparam:'totalprice',
    otherexpenseparam:'otherexpense',
    loanexpenseparam:'loanexpense'
  }

  const oldCatch = getCatchByOfflineID(stateData,catchOfflineID);
  const fishCatchBuyerNames = stateData.fishCatchBuyerNames;

  // must check if fish on catch already delivered
  // if yes dont allow edit catch
  const fishList = oldCatch.fish ? oldCatch.fish : [];
  for(let i=0;i<fishList.length;i++) {
    const key = ''+fishList[i].idtrfishcatchoffline;
    if(fishCatchBuyerNames[key] && fishCatchBuyerNames[key].close) {
      console.warn('edit catch by buyfish disabled...');
      return Promise.resolve()
        .then(()=>{
          return false;
        });
    }
  }

  const json = {};
  for(let key in refJson) {
    if (refJson.hasOwnProperty(key)) {
      const key2 = refJson[key];
      json[key] = oldCatch[key2]; 
    }
  }
  
  json['fishermannameparam'] = fishermanName;
  json['fishinggroundareaparam'] = fishingGround;
  json['idfishofflineparam'] = fishOfflineID;
  json['idshipofflineparam'] = shipOfflineID;
  json['portnameparam'] = portName;
  json['totalpriceparam'] = totalPrice;
  json['noteparam'] = '';

  console.warn('editByShip...');

  const offlineJsonForNotes = {
    idtrcatchoffline:json['idtrcatchofflineparam'],
    priceperkg:json['priceperkgparam'],
    totalprice:json['totalpriceparam'],
    loanexpense:json['loanexpenseparam'],
    otherexpense:json['otherexpenseparam'],
    notes:json['noteparam']
  }

  const ships = stateData.ships;
  const ship = _.find(ships,{idshipoffline:json['idshipofflineparam']});
  const shipname = ship.vesselname_param;

  const fishes = stateData.fishes;
  const fish = _.find(fishes,{idfishoffline:json['idfishofflineparam']});
  const englishname = fish.english_name;
  const indname = fish.indname;
  const threea_code = fish.threea_code;

  const offlineJson = {
    idtrcatchoffline:json['idtrcatchofflineparam'],
    idshipoffline:json['idshipofflineparam'],
    shipname:shipname,
    idfishoffline:json['idfishofflineparam'],
    purchasedate:json['purchasedateparam'],
    purchasetime:json['purchasetimeparam'],
    catchorfarmed:json['catchorfarmedparam'],
    bycatch:json['bycatchparam'],
    fadused:json['fadusedparam'],
    purchaseuniqueno:json['purchaseuniquenoparam'],
    productformatlanding:json['productformatlandingparam'],
    unitmeasurement:json['unitmeasurementparam'],
    quantity:json['quantityparam'],
    weight:json['weightparam'],
    fishinggroundarea:json['fishinggroundareaparam'],
    purchaselocation:json['purchaselocationparam'],
    uniquetripid:json['uniquetripidparam'],
    datetimevesseldeparture:json['datetimevesseldepartureparam'],
    datetimevesselreturn:json['datetimevesselreturnparam'],
    portname:json['portnameparam'],
    englishname:englishname,
    indname:indname,
    threea_code:threea_code,
    fishermanname2:json['fishermannameparam'],
    fishermanid:json['fishermanidparam'],
    fishermanregnumber:json['fishermanregnumberparam'],
  }

  console.warn(json);

  return actions.editCatchListHaveNotes(json,offlineJsonForNotes)   
  .then(()=>{
    return actions.editCatchList(json,offlineJson);
  })
  .then(()=>{
    return actions.getCatchFishes();
  })
  .then(()=>{
    return true;
  });
}

function getShipByName(ships,name) {
  const arr = ships.slice();
  _.remove(arr,{lasttransact:"D"});
  return _.find(arr,{vesselname_param:name});
}

function getShipByOfflineID(stateData,offlineID) {
  const ships = stateData.ships;
  const ret = _.find(ships,{idshipoffline:offlineID});
  return ret;
}

function getShipLabelValues(stateData) {
  const ships = stateData.ships;

  let ret = [];
  for(let i=0;i<ships.length;i++) {
    const ship = ships[i];
    if(ship.lasttransact == 'D') continue;

    let gearType = ship.vesselgeartype_param;
    gearType = Gears.getName(gearType);

    const row = {
      label:ship.vesselname_param+'\n ('+gearType+')',
      value:ship.idshipoffline
    }
    ret.push(row);
  }

  return ret;
}


function createShipByName(actions,name,idmsuser) {
  const shipOfflineID = lib.getOfflineId('ship',idmsuser);
  const json = {
    fishinglicenseexpiredate_param: null,
    fishinglicensenumber_param: null,
    idmsuserparam: idmsuser,
    idshipoffline: shipOfflineID,
    vesseldatemade_param: null,
    vesselflag_param: "ID",
    vesselgeartype_param: "99.0.0",
    vesselid_param: null,
    vessellicenseexpiredate_param: null,
    vessellicensenumber_param: null,
    vesselname_param: name,
    vesselowneraddress_param: null,
    vesselownercity_param: null,
    vesselownercountry_param: null,
    vesselownerdistrict_param: null,
    vesselownerdob_param: null,
    vesselownerid_param: null,
    vesselownername_param: null,
    vesselownerphone_param: null,
    vesselownerprovince_param: null,
    vesselownersex_param: "1",
    vesselsize_param: null,
  }

  const offlineJson = {
    idshipoffline:json["idshipoffline"],
    vesselname_param:json["vesselname_param"],
    vessellicensenumber_param:json["vessellicensenumber_param"],
    vessellicenseexpiredate_param:json["vessellicenseexpiredate_param"],
    fishinglicensenumber_param:json["fishinglicensenumber_param"],
    fishinglicenseexpiredate_param:json["fishinglicenseexpiredate_param"],
    vesselsize_param:json["vesselsize_param"],
    vesselflag_param:json["vesselflag_param"],
    vesselgeartype_param:json["vesselgeartype_param"],
    vesseldatemade_param:json["vesseldatemade_param"],
    vesselownername_param:json["vesselownername_param"],
    vesselownerid_param:json["vesselownerid_param"],
    vesselownerphone_param:json["vesselownerphone_param"],
    vesselownersex_param:json["vesselownersex_param"],
    vesselownerdob_param:json["vesselownerdob_param"],
    vesselowneraddress_param:json["vesselowneraddress_param"],
    vesselownercountry_param:json['vesselownercountry_param'],
    vesselownerprovince_param:json['vesselownerprovince_param'],
    vesselownercity_param:json['vesselownercity_param'],
    vesselownerdistrict_param:json['vesselownerdistrict_param'],
    vessel_id:json['vesselid_param'],
  }

  return actions.addShip(json,offlineJson)
    .then(()=>{
      return actions.getShips();
    });
}

function getFishermanByName(fishermen,name) {
  const arr = fishermen.slice();
  _.remove(arr,{lasttransact:"D"});
  return _.find(arr,{name:name});
}

function createFishermanByName(actions,name,idmsuser,idmssupplier) {
  const fishermanOfflineID = lib.getOfflineId('fisherman',idmsuser);
  json = {
    address_paramparam: null,
    bodparam: null,
    cityparam: null,
    countryparam: null,
    districtparam: null,
    fishermanregnumberparam: null,
    id_paramparam: null,
    idfishermanofflineparam: fishermanOfflineID,
    idmssupplierparam: idmssupplier,
    jobtitle_paramparam: "Captain",
    nameparam: name,
    nat_paramparam: "ID",
    phone_paramparam: "00000000",
    provinceparam: null,
    sex_paramparam: "1",
  };

  const offlineJson = {
    idfishermanoffline:json['idfishermanofflineparam'],
    name:json['nameparam'],
    bod:json['bodparam'],
    id_param:json['id_paramparam'],
    sex_param:json['sex_paramparam'],
    nat_param:json['nat_paramparam'],
    address_param:json['address_paramparam'],
    phone_param:json['phone_paramparam'],
    jobtitle_param:json['jobtitle_paramparam'],
    country:json['countryparam'],
    province:json['provinceparam'],
    city:json['cityparam'],
    district:json['districtparam'],
    fishermanregnumber:json['fishermanregnumberparam'],
  };

  return actions.addFisherman(json,offlineJson)
  .then(()=>{
    return actions.getFishermans();
  });
}

function getLoanTypeByName(lts,name) {
  const arr = lts.slice();
  _.remove(arr,{lasttransact:"D"});
  return _.find(arr,{typename:name});
}

function createLoanTypeByName(actions,itemName,itemUnit,itemPrice,idmssupplier,uid) {
  const loantypeId = lib.getShortOfflineId('loantype',uid.toString(36));        
  
  const json = {
    idmstypeitemloanofflineparam:loantypeId,
    typenameparam:itemName,
    unitparam:itemUnit,
    priceperunitparam:itemPrice,
    idmssupplierparam:idmssupplier
  }
  
  const offlineJson = {
    idmstypeitemloanoffline:loantypeId,
    typename:itemName,
    unit:itemUnit,
    priceperunit:itemPrice,
    idmssupplier:idmssupplier
  };

  return actions.addLoanType(json,offlineJson)
    .then(()=>{
      return actions.getLoanType();
    });

}

function createLoanRupiah(actions,stateLogin,stateData,amount) {
  const login = stateLogin;
  const idmssupplier = login.idmssupplier;
  const idmsuser = login.idmsuser;
  const uid = login.id;

  const fishermen = stateData.fishermans.slice();
  const lts = stateData.loantype.slice();

  const fisherman = getFishermanByName(fishermen,DEFAULT_NAME);  
  const fishermanOfflineID = fisherman.idfishermanoffline;
  const lt = getLoanTypeByName(lts,'Uang/Money');
  const loanTypeOfflineID = lt.idmstypeitemloanoffline;
  const offlineID = lib.getShortOfflineId('L',uid.toString(36));
  const newItem = {
    desc: "Uang/Money "+amount+" Rupiah",
    idbuyeroffline: undefined,
    idfishermanoffline: fishermanOfflineID,
    idloanoffline: offlineID,
    idmstypeitemloanofflineparam: loanTypeOfflineID,
    idtrloan: 'offline'+moment().valueOf(),
    loanDate: moment().format('YYYY-MM-DD'), //"2019-11-05"
    priceperunitparam: 1,
    strike: false,
    total: Number(amount),
    unitparam: Number(amount)
  }
  
  const user = {
    estimateTotalLoan: 0,
    idbuyeroffline: undefined,
    idfishermanoffline: fishermanOfflineID,
    idmsuser: fisherman.idmsuser,
    items: [],
    name: "Other/Lainnya",
    usertypename: L('FISHERMAN')
  };

  return actions.loanAddItemForUser(user,newItem)
    .then(()=>{
      return actions.getLoans();
    })
    .then(()=>{
      return offlineID;
    })
}

function editLoanRupiah(actions,stateLogin,stateData,offlineID,amount) {
  const login = stateLogin;
  const idmssupplier = login.idmssupplier;
  const idmsuser = login.idmsuser;
  const uid = login.id;

  const fishermen = stateData.fishermans.slice();
  const lts = stateData.loantype.slice();
  const loans = stateData.loans.slice();

  const fisherman = getFishermanByName(fishermen,DEFAULT_NAME);  
  const fishermanOfflineID = fisherman.idfishermanoffline;
  const lt = getLoanTypeByName(lts,'Uang/Money');
  const loanTypeOfflineID = lt.idmstypeitemloanoffline;

  const user = _.find(loans,{name:DEFAULT_NAME});

  const existingLoanData = _.find(user.items,{idloanoffline:offlineID});

  const newItem = {
    desc: "Uang/Money "+amount+" Rupiah",
    idbuyeroffline: undefined,
    idfishermanoffline: fishermanOfflineID,
    idloanoffline: offlineID,
    idmstypeitemloanofflineparam: loanTypeOfflineID,
    idtrloan: existingLoanData.idtrloan,
    loanDate: existingLoanData.loanDate,
    priceperunitparam: 1,
    strike: false,
    total: Number(amount),
    unitparam: Number(amount)
  }

  return actions.loanUpdateItem(user,newItem)
    .then(()=>{
      return actions.getLoans();
    })
    .then(()=>{
      return offlineID;
    })
}

function strikeLoanRupiah(actions,stateLogin,stateData,offlineID) {
  const login = stateLogin;

  const fishermen = stateData.fishermans.slice();
  const lts = stateData.loantype.slice();
  const loans = stateData.loans.slice();

  const fisherman = getFishermanByName(fishermen,DEFAULT_NAME);  
  const fishermanOfflineID = fisherman.idfishermanoffline;
  const lt = getLoanTypeByName(lts,'Uang/Money');

  const user = _.find(loans,{name:DEFAULT_NAME});

  const items = user.items;
  for(let i=0;i<items.length;i++) {
    const idloanoffline = items[i].idloanoffline;
    if(idloanoffline === offlineID) {
      items[i].strike = true;
      items[i].needUpdate = true;
    }
  }

  return actions.loanUpdateItemsForUser(user,items)
    .then(()=>{
      return actions.getLoans();
    })
    .then(()=>{
      return offlineID;
    })
}

function createPayloanRupiah(actions,stateData,payloanAmount) {
  const loans = stateData.loans.slice();
  const user = _.find(loans,{name:DEFAULT_NAME});
  const payloanDate = moment().format('YYYY-MM-DD');
  const payloanDesc = L('Paid for Uang/Money');
  return new Promise((resolve,reject)=>{
    actions.loanUpdatePaidForUser(user,
      payloanAmount,payloanDate,payloanDesc,user.name)
      .then(()=>resolve())
      .catch(err=>resolve());
  });
  
}

function getSupplierBuyerByName(stateData,name) {
  let rows = stateData.buyers.slice();
  return _.find(rows,{name_param:name});
}

function createSupplierBuyerByName(actions,name,idmssupplier,uid) {
  const offlineId = lib.getShortOfflineId('buyer',uid.toString(36));
  const json = {
    address_param: null,
    businesslicense_param: null,
    businesslicenseexpireddate: null,
    city_param: null,
    companynameparam: null,
    completestreetaddress_param: null,
    contact_param: null,
    country_param: "ID",
    district_param: null,
    id_param: null,
    idbuyeroffline: offlineId,
    idltusertype: "4",
    idmssupplier: idmssupplier,
    name_param: name,
    nationalcode_param: null,
    phonenumber_param: "000000000",
    province_param: null,
    sex_param: "1",
  }

  const offlineJson = {
    idbuyeroffline:json['idbuyeroffline'],
    idmssupplier:json['idmssupplier'],
    name_param:json['name_param'],
    id_param:json['id_param'],
    businesslicense_param:json['businesslicense_param'],
    contact_param:json['contact_param'],
    phonenumber_param:json['phonenumber_param'],
    address_param:json['address_param'],
    idltusertype:4,
    sex_param:json['sex_param'],
    nationalcode_param:json['nationalcode_param'],
    country_param:json['country_param'],
    province_param:json['province_param'],
    city_param:json['city_param'],
    district_param:json['district_param'],
    completestreetaddress_param:json['completestreetaddress_param'],
    companyname:json['companynameparam'],
    usertypename:"Buyer",
    businesslicenseexpireddate:json['businesslicenseexpireddate']
  }

  return actions.addBuyer(json,offlineJson)
    .then(()=>{
      return actions.getBuyers();
    });
}

function createDefaultBatchDelivery(actions,stateLogin,stateData) {
  const buyerData = getSupplierBuyerByName(stateData,DEFAULT_NAME);

  const login = stateLogin;
  const uid = Number(login.id);
  const id = lib.getShortOfflineId('ds',uid.toString(36));
  let modBy = null;
  if(login.profile && login.profile.name) modBy = login.profile.name;

  const data = {
    deliverysheetofflineid:id,
    buyerName:buyerData.name_param,
    buyerId:buyerData.idbuyeroffline,
    buyerSupplier:(buyerData.usertypename == "Supplier"),
    fish:[],
    sellPrice:0,
    notes:'',
    transportBy:null,
    transportName:null,
    transportReceipt:null,
    deliverDate:null,
    createdDate:moment().format('YYYY-MM-DD'),
    modBy
  }
  
  actions.addBatchDeliveries(data);

  return actions.upsertBatchDeliveries()
    .then(()=>{
      return data;
    });

}

function addFishToDefaultBatchDelivery(actions,stateLogin,stateData,catchOfflineID,batchDeliveryData) {
  const deliverysheetofflineid = batchDeliveryData.deliverysheetofflineid;
  const buyerName = batchDeliveryData.buyerName;
  const catchData = getCatchByOfflineID(stateData,catchOfflineID);
  const catchDataFish = catchData.fish;
  const selected = [];

  const fishToInsert = [];
  for(let i=0;i<catchDataFish.length;i++) {
    fishToInsert.push(catchDataFish[i]); // all fish
  }

  const batchDeliveries = stateData.batchDeliveries.slice();
  const indexToInsert = _.findIndex(batchDeliveries,{deliverysheetofflineid:deliverysheetofflineid});
  const fishIdToDelivery = Object.assign({},stateData.fishIdToDelivery);

  // remove all selected from previous batch deliveries
  for(let i=0;i<selected.length;i++) {
    const fishId = selected[i];
    if(!fishIdToDelivery[fishId]) {
      fishIdToDelivery[fishId] = {nameBuyer:null,close:false,id:null};
    }
    const ref = fishIdToDelivery[fishId]; // nameBuyer, close, id

    if(!ref.close && ref.id) {
      const index = _.findIndex(batchDeliveries,{deliverysheetofflineid:ref.id});
      if(index > -1) {
        let fish = batchDeliveries[index].fish;
        _.remove(fish,{idfish:fishId});
        batchDeliveries[index].fish = fish;
      }
    }
  }  

  const login = stateLogin;
  let modBy = null;
  if(login.profile && login.profile.name) modBy = login.profile.name;

  // fish array:
  const fish = batchDeliveries[indexToInsert].fish;

  // add selected to batch deliveries
  for(let i=0;i<fishToInsert.length;i++) {
    const oneFish = Object.assign({},fishToInsert[i]);
    
    const fishId = oneFish.idfish;
    fishIdToDelivery[fishId] = {nameBuyer:buyerName,close:false,id:deliverysheetofflineid};
    oneFish.idtrcatchoffline = catchData.idtrcatchoffline;
    if(modBy) oneFish.modBy = modBy;
    
    fish.push(oneFish);
  }

  batchDeliveries[indexToInsert].fish = fish;
  

  actions.setFishIdToDelivery(fishIdToDelivery);
  actions.setBatchDeliveries(batchDeliveries);

  // console.warn(fishIdToDelivery);
  // console.warn(batchDeliveries);

  return actions.upsertBatchDeliveries();
}

function generateDeliverySheet(stateLogin,stateData,deliverysheetofflineid,json) {

  const data = _.find(stateData.batchDeliveries,{deliverysheetofflineid:deliverysheetofflineid})

  const login = stateLogin;
  const batchId = data.deliverysheetofflineid;

  let modBy = null;
  if(login.profile && login.profile.name) modBy = login.profile.name;
  const supplierPhone = login.profile.phonenumber;
  const supplierName = login.profile.name;

  const fishCatchIds = []; // idtrfishcatchoffline(s)
  const fishCatchData = []; // catch fish

  // viewData
  const buyerName = data.buyerName;
  const buyerId = data.buyerId;
  const fishNameEng = ''; // every fish
  const fishNameInd = ''; // every fish
  let numUnit = 0;
  let totalWeight = 0;
  const compliance = [false,false,false]; // every fish
  const buyPrice = 0; // skip
  const sellPrice = data.sellPrice;  // batchdelivery sell price
  const gradeCodes = []; // 100A, 200B
  const notes = data.notes; //batchdelivery notes
  const unitName = 'unit';
  const transportBy = data.transportBy;
  const transportName = data.transportName;
  const transportReceipt = data.transportReceipt;


  // deliverySheet
  const deliverySheetNo = batchId;
  const nationalRegistrationSupplierCode = login.supplierid ? login.supplierid : '';
  // const supplierName = login.identity ? login.identity : '';
  const deliveryDate = moment(json['deliverDate'],'YYYY-MM-DD').format('YY-MM-DD');
  const species=''; // three a code
  let numberOfFishOrLoin = 0;
  const vesselName=''; // nempel ke ikan
  const vesselSize=''; // nempel ke ikan
  const vesselRegistrationNo=''; // nempel ke ikan
  const expiredDate=''; // nempel ke ikan
  const vesselFlag=''; // nempel ke ikan
  const fishingGround=''; // nempel ke ikan
  const landingSite=''; // nempel ke ikan
  const gearType=''; // nempel ke ikan
  const catchDate=''; // nempel ke ikan
  const fishermanName=''; // nempel ke ikan
  const landingDate=''; // nempel ke ikan
  const fadused=''; // nempel ke ikan

  const catches = stateData.catches;
  const fishes = stateData.fishes;
  const ships = stateData.ships;
  const catchRefs = {};
  const shipRefs = {};
  const fishRefs = {};

  for(let i=0;i<data.fish.length;i++) {
    const fc = Object.assign({},data.fish[i]);

    numUnit++;
    numberOfFishOrLoin = numUnit;
    totalWeight += Number(fc.amount);

    const idtrcatchoffline = fc.idtrcatchoffline;
    let c = _.find(catches,{idtrcatchoffline:idtrcatchoffline});
    c = Object.assign({},c);
    cRef = Object.assign({},c);
    if(cRef.fish) delete cRef.fish;
    catchRefs[idtrcatchoffline] = cRef;

    const idfishoffline = c.idfishoffline;
    let fishData = _.find(fishes,{idfishoffline:idfishoffline});
    if(!fishData) {
      throw 'NO FISH';
    }
    fishData = Object.assign({},fishData);
    fishRefs[idfishoffline] = fishData;
    
    const idshipoffline = c.idshipoffline;
    let shipData = _.find(ships,{idshipoffline:idshipoffline});
    if(!shipData) {
      throw 'NO SHIP';
    }
    shipData = Object.assign({},shipData);
    shipRefs[idshipoffline] = shipData;

    let gearType = shipData.vesselgeartype_param;
    gearType = Gears.getAbbr(gearType);


    let expiredDate = shipData.fishinglicenseexpiredate_param;
    if(expiredDate) {
      expiredDate = moment(expiredDate,'YYYY-MM-DD').format('YY-MM-DD');
    } else {
      expiredDate = '';
    }
    let landingDate = c.datetimevesselreturn ? c.datetimevesselreturn.split(' ')[0] : '';
    if(landingDate.length > 0) landingDate = moment(landingDate,'YYYY-MM-DD').format('YY-MM-DD');
    const fadused = (c.fadused == '1') ? "Y" : "N";  

    let fishinggroundarea = c.fishinggroundarea;
    if(fishinggroundarea && fishinggroundarea.length > 0) {
      fishinggroundarea = c.fishinggroundarea.split(',')[0];
    }

    fc.fishNameEng = c.indname;
    fc.fishNameInd = c.englishname;
    fc.unitName = c.unitmeasurement;
    fc.species = c.threea_code;
    fc.vesselName = c.shipname;
    fc.vesselSize = shipData.vesselsize_param;
    fc.vesselRegistrationNo = shipData.vessellicensenumber_param;
    fc.expiredDate = expiredDate;
    fc.vesselFlag = shipData.vesselflag_param;
    fc.fishingGround = fishinggroundarea;
    fc.landingSite = c.portname;
    fc.gearType = gearType;
    fc.catchDate = moment(c.purchasedate,'YYYY-MM-DD').format('YY-MM-DD');
    fc.fishermanName = c.fishermanname2 ? c.fishermanname2 : '';
    if(fc.fishermanName == '' && c.fishermanname ) {
      fc.fishermanName = c.fishermanname;
    }
    fc.landingDate = landingDate;
    fc.fadused = fadused;
    
    fishCatchIds.push(fc.idtrfishcatchoffline); // idtrfishcatchoffline(s)
    fishCatchData.push(fc); // catch fish
    gradeCodes.push((''+fc.amount+''+fc.grade));
  }

  const ds = {
    deliverySheetNo,
    nationalRegistrationSupplierCode,
    supplierName,
    deliveryDate,
    // species,
    numberOfFishOrLoin,
    totalWeight,
    // vesselName,
    // vesselSize,
    // vesselRegistrationNo,
    // expiredDate,
    // vesselFlag,
    // fishingGround,
    // landingSite,
    // gearType,
    // catchDate,
    // fishermanName,
    // landingDate,
    // unitName,
    // fadused
  }

  const viewData = {
    buyerName,
    buyerId, // todo
    fishNameEng, // todo
    fishNameInd,
    numUnit,
    totalWeight,
    compliance,
    buyPrice,
    sellPrice,
    gradeCodes,
    notes,
    unitName,
    modBy,
    transportBy,
    transportName,
    transportReceipt,
  }

  const ret = {
    version:2,
    batchId:batchId,
    deliverySheetData:ds,
    viewData:viewData,
    fishCatchIds:fishCatchIds,
    fishCatchData:fishCatchData,
    sender:{
      supplierName,
      supplierPhone
    },
    catchRefs,
    shipRefs,
    fishRefs,  
  };

  return ret;
}

function closeDefaultBatchDelivery(actions,stateLogin,stateData,batchDeliveryData) {
  const deliverysheetofflineid = batchDeliveryData.deliverysheetofflineid;
  const json = {
    transportBy:'land',
    transportName:null,
    transportReceipt:null,
    deliverDate:moment().format('YYYY-MM-DD')
  };

  let p = Promise.resolve();
  const deliverySheet = generateDeliverySheet(stateLogin,stateData,deliverysheetofflineid,json);
  const deliverySheetId = deliverySheet.deliverySheetData.deliverySheetNo;
  const deliverySheetText = JSON.stringify(deliverySheet);

  actions.closeBatchDelivery(deliverySheetId,deliverySheet);

  p = actions.createDeliverySheetV2(deliverySheetId,deliverySheetText);

  const fishes = deliverySheet.fishCatchIds;
  const login = stateLogin;
  const jsons = [];
  let tp = 0;
  if(deliverySheet.viewData.sellPrice && deliverySheet.viewData.sellPrice.length > 0) {
    tp = Number(deliverySheet.viewData.sellPrice);
  }

  for(let i=0;i<fishes.length;i++) {
    const iddeliveryoffline = lib.getOfflineId('d',login.idmsuser)+'-'+i;
    const idtrfishcatchoffline = fishes[i];
    const totalprice = Math.floor(tp / fishes.length);
    const desc = deliverySheet.viewData.notes;
    const sendtobuyerdate = json['deliverDate'];
    const deliverydate = json['deliverDate'];
    const transportby = json['transportBy'];
    const transportnameid = json['transportName'];
    const transportreceiptphoto = json['transportName'];;
    const idmsbuyer = ''; // todo
    const idmssupplier = login.idmssupplier;
    const deliverysheetofflineid = deliverySheetId;
    jsons.push({
      iddeliveryoffline,
      idtrfishcatchoffline,
      totalprice,
      desc,
      sendtobuyerdate,
      deliverydate,
      transportby,
      transportnameid,
      transportreceiptphoto,
      idmsbuyer,
      idmssupplier,
      deliverysheetofflineid  
    });
  }

  return p
  .then(()=>{
    console.warn('start synch batch delivery');
    return actions.synchBatchDelivery(jsons);
  })
  .then(()=>{
    return actions.upsertBatchDeliveries();
  })
  // .then(()=>{
  //   return actions.getDeliveries();
  // })
  .then(()=>{
    return deliverysheetofflineid;
  });

}

function setPriceDefaultBatchDelivery(actions,stateLogin,stateData,deliverysheetofflineid,totalPrice,notes) {
  const dss = JSON.parse(JSON.stringify(stateData.deliverySheets));
  const deliverySheet = dss[deliverysheetofflineid];

  const login = stateLogin;
  let modBy = null;
  if(login.profile && login.profile.name) modBy = login.profile.name;

  const ds = deliverySheet;
  if(ds && ds.viewData) {
    const newDS = JSON.parse(JSON.stringify(ds));

    newDS.viewData.sellPrice = totalPrice;
    newDS.viewData.notes = notes;  
    newDS.viewData.modBy = modBy;  
    const fish = newDS.fishCatchData;
    for(let i=0;i<fish.length;i++) {
      fish[i].sellPrice = totalPrice;
    }

    newDS.fishCatchData = fish;

    const deliverySheetId = newDS.deliverySheetData.deliverySheetNo;
    const deliverySheetText = JSON.stringify(newDS);

    const p = actions.updateDeliverySheetV2(deliverySheetId,deliverySheetText)
      .then(()=>{
        return actions.getDeliveries();
      });

    return p;
  }

}
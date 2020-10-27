const L = require('./dictionary').translate;
const _ = require('lodash');

const fishinggear = [
  {apicode:"09.0.0",indname:"PANCING",engname:"HOOKS AND LINES",abbr:"LX"},
  {apicode:"09.1.0",indname:"Pancing ulur dan pancing berjoran biasa",engname:"Handlines and pole-lines (hand-operated)",abbr:"LHP"},
  {apicode:"09.2.0",indname:"Pancing ulur dan pancing berjoran dimekanisasi",engname:"Handlines and pole-lines (mechanized)",abbr:"LHM"},
  {apicode:"09.3.0",indname:"Rawai menetap",engname:"Set longlines",abbr:"LLS"},
  {apicode:"09.4.0",indname:"Rawai hanyut",engname:"Drifting longlines",abbr:"LLD"},
  {apicode:"09.5.0",indname:"Rawai lainnya",engname:"Longlines (not specified)",abbr:"LL"},
  {apicode:"09.6.0",indname:"Tonda",engname:"Trolling lines",abbr:"LTL"},
  {apicode:"09.9.0",indname:"Pancing lainnya",engname:"Hooks and lines (not specified)",abbr:"LX"},
  
  {apicode:"07.0.0",indname:"JARING INSANG & JARING PUNTAL",engname:"GILLNETS AND ENTANGLING NETS",abbr:"GEN"},
  {apicode:"07.1.0",indname:"Jaring insang menetap",engname:"Set gillnets (anchored)",abbr:"GNS"},
  {apicode:"07.2.0",indname:"Jaring insang hanyut",engname:"Driftnets",abbr:"GND"},
  {apicode:"07.3.0",indname:"Jaring insang lingkar",engname:"Encircling gillnets",abbr:"GNC"},
  {apicode:"07.4.0",indname:"Jaring insang berpancang",engname:"Fixed gillnets (on stakes)",abbr:"GNI"},
  {apicode:"07.5.0",indname:"Jaring gondrong (trammel net)",engname:"Trammel nets",abbr:"GTR"},
  {apicode:"07.6.0",indname:"Jaring kombinasi gillnet–trammel net",engname:"Combined gillnets-trammel nets",abbr:"GTN"},
  {apicode:"07.9.0",indname:"Jaring insang & jaring puntal lainnya",engname:"Gillnets and entangling nets (not specified)",abbr:"GEN"},
  {apicode:"07.9.1",indname:"Jaring insang lainnya",engname:"Gillnets (not specified)",abbr:"GN"},

  {apicode:"01.0.0",indname:"Jaring Lingkar",engname:"Surrounding Nets",abbr:""},
  {apicode:"01.1.0",indname:"Jaring Lingkar dengan Bertali Kerut (purse seine)",engname:"Surrounding Nets With purse lines (purse seines)",abbr:"PS"},
  {apicode:"01.1.1",indname:"Jaring Lingkar dengan Bertali Kerut (purse seine) satu kapal",engname:"Surrounding Nets With purse lines (purse seines) one boat operated",abbr:"PS1"},
  {apicode:"01.1.2",indname:"Jaring Lingkar dengan Bertali Kerut (purse seine) dua kapal",engname:"Surrounding Nets With purse lines (purse seines) two boats operated",abbr:"PS2"},
  {apicode:"01.2.0",indname:"Jaring Lingkar tanpa Tali Pengerut",engname:"Surrounding Nets Without purse lines (lampara)",abbr:"LA"},
  {apicode:"02.0.0",indname:"PUKAT",engname:"SEINE NETS",abbr:""},
  {apicode:"02.1.0",indname:"Pukat Pantai",engname:"Beach seines",abbr:"SB"},
  {apicode:"02.2.0",indname:"Pukat berkapal",engname:"Boat or vessel seines",abbr:"SV"},
  {apicode:"02.2.1",indname:"Danish seine (dogol)",engname:"Danish seines",abbr:"SDN"},
  {apicode:"02.2.2",indname:"Scottish seine",engname:"Scottish seines",abbr:"SSC"},
  {apicode:"02.2.3",indname:"Pair seine",engname:"pair seines",abbr:"SPR"},
  {apicode:"02.9.0",indname:"Pukat lainnya",engname:"Seine nets (not specified)",abbr:"SX"},
  {apicode:"03.0.0",indname:"TRAWL",engname:"TRAWLS",abbr:""},
  {apicode:"03.1.0",indname:"Trawl dasar (Bottom trawl)",engname:"Bottom trawls",abbr:""},
  {apicode:"03.1.1",indname:"Trawl berpalang",engname:"beam trawls",abbr:"TBB"},
  {apicode:"03.1.2",indname:"Trawl berpapan (otter trawl)",engname:"otter trawls",abbr:"OTB"},
  {apicode:"03.1.3",indname:"Trawl dua kapal (pair trawl)",engname:"pair trawls",abbr:"PTB"},
  {apicode:"03.1.4",indname:"Nephtops trawl",engname:"nephrops trawls",abbr:"TBN"},
  {apicode:"03.1.5",indname:"Trawl udang",engname:"shrimp trawls",abbr:"TBS"},
  {apicode:"03.1.9",indname:"Trawl dasar lainnya",engname:"bottom trawls (not specified)",abbr:"TB"},
  {apicode:"03.2.0",indname:"Trawl Pertengahan (Midwater trawl)",engname:"Midwater trawls",abbr:""},
  {apicode:"03.2.1",indname:"Trawl berpapan",engname:"otter trawls",abbr:"OTM"},
  {apicode:"03.2.2",indname:"Trawl dua kapal",engname:"pair trawls",abbr:"PTM"},
  {apicode:"03.2.3",indname:"Trawl udang",engname:"shrimp trawls",abbr:"TMS"},
  {apicode:"03.2.9",indname:"Trawl pertengahan lainnya",engname:"midwater trawls (not specified)",abbr:"TM"},
  {apicode:"03.3.0",indname:"Trawl kembar berpapan",engname:"Otter twin trawls",abbr:"OTT"},
  {apicode:"03.4.9",indname:"Trawl berpapan lainnya",engname:"Otter trawls (not specified)",abbr:"OT"},
  {apicode:"03.5.9",indname:"Trawl dua kapal lainnya",engname:"Pair trawls (not specified)",abbr:"PT"},
  {apicode:"03.9.0",indname:"Trawl lainnya",engname:"Other trawls (not specified)",abbr:"TX"},
  {apicode:"04.0.0",indname:"PENGGARUK",engname:"DREDGES",abbr:""},
  {apicode:"04.1.0",indname:"Penggaruk berperahu/kapal",engname:"Boat dredges",abbr:"DRB"},
  {apicode:"04.2.0",indname:"Penggaruk biasa",engname:"Hand dredges",abbr:"DRH"},
  {apicode:"05.0.0",indname:"TANGKUL",engname:"LIFT NETS",abbr:""},
  {apicode:"05.1.0",indname:"Tangkul biasa (Portable liftnet)",engname:"Portable lift nets",abbr:"LNP"},
  {apicode:"05.2.0",indname:"Bagan perahu (Boat operatedliftnet)",engname:"Boat-operated lift nets",abbr:"LNB"},
  {apicode:"05.3.0",indname:"Tangkul pantai",engname:"Shore-operated stationary lift nets",abbr:"LNS"},
  {apicode:"05.9.0",indname:"Tangkul lainnya",engname:"Lift nets (not specified)",abbr:"LN"},
  {apicode:"06.0.0",indname:"ALAT YG DIJATUHKAN",engname:"FALLING GEAR",abbr:""},
  {apicode:"06.1.0",indname:"Jala",engname:"Cast nets",abbr:"FCN"},
  {apicode:"06.9.0",indname:"Alat jatuh lainnya",engname:"Falling gear (not specified)",abbr:"FG"},

  {apicode:"08.0.0",indname:"Perangkap",engname:"TRAPS",abbr:""},
  {apicode:"08.1.0",indname:"Set Net",engname:"Stationary uncovered pound nets",abbr:"FPN"},
  {apicode:"08.2.0",indname:"Bubu",engname:"Pots",abbr:"FPO"},
  {apicode:"08.3.0",indname:"Bubu bersayap",engname:"Fyke nets",abbr:"FYK"},
  {apicode:"08.4.0",indname:"Sotok",engname:"Stow nets",abbr:"FSN"},
  {apicode:"08.5.0",indname:"Perangkap dengan pagar",engname:"Barriers",abbr:"FWR"},
  {apicode:"08.6.0",indname:"Perangkap ikan peloncat",engname:"Aerial traps",abbr:"FAR"},
  {apicode:"08.9.0",indname:"Perangkap lainnya",engname:"Traps (not specified)",abbr:"FIX"},

  {apicode:"10.0.0",indname:"ALAT PENJEPIT & MELUKAI",engname:"GRAPPLING AND WOUNDING",abbr:""},
  {apicode:"10.1.0",indname:"Tombak",engname:"Harpoons",abbr:"HAR"},
  {apicode:"11.0.0",indname:"MESIN PEMANEN",engname:"HARVESTING MACHINES",abbr:""},
  {apicode:"11.1.0",indname:"Pompa",engname:"Pumps",abbr:"HMP"},
  {apicode:"11.2.0",indname:"Penggaruk mekanis",engname:"Mechanized dredges",abbr:"HMD"},
  {apicode:"11.9.0",indname:"Mesin pemanen lainnya",engname:"Harvesting machines (not specified)",abbr:"HMX"},
  {apicode:"20.0.0",indname:"Alat Lainnya",engname:"MISCELLANEOUS GEAR",abbr:"MIS"},
  {apicode:"25.0.0",indname:"Alat pancing rekreasi",engname:"RECREATIONAL FISHING GEAR",abbr:"RG"},
  {apicode:"99.0.0",indname:"Alat tidak diketahui",engname:"GEAR NOT KNOW OR NOT SPECIFIED",abbr:"NK"},
];

const fishinggearold = [
  {engname:"", indname:"PANCING ULUR", abbr:"", apicode:"09.1.0.1"},
  {engname:"", indname:"PANCING BERJORAN", abbr:"", apicode:"09.1.0.2"},
  {engname:"", indname:"SQUID ANGLING", abbr:"", apicode:"09.1.0.4"},
  {engname:"", indname:"SQUID JIGGING", abbr:"", apicode:"09.2.0.1"},
  {engname:"Set longlines", indname:"RAWAI DASAR", abbr:"LLS", apicode:"09.3.0"},
  {engname:"Drifting longlines", indname:"RAWAI HANYUT", abbr:"LLD", apicode:"09.4.0"},
  {engname:"", indname:"RAWAI CUCUT", abbr:"", apicode:"09.4.0.2"},
  {engname:"", indname:"PANCING LAYANG-LAYANG", abbr:"", apicode:"09.9.0.1"},
  {engname:"", indname:"JARING LIONG BUN", abbr:"", apicode:"07.1.0.1"},
  {engname:"Driftnets", indname:"JARING INSANG HANYUT", abbr:"GND", apicode:"07.2.0"},
  {engname:"", indname:"JARING GILLNET OSEANIK", abbr:"", apicode:"07.2.0.1"},
  {engname:"Encircling gillnets", indname:"JARING INSANG LINGKAR", abbr:"GNC", apicode:"07.3.0"},
  {engname:"Fixed gillnets (on stakes)", indname:"JARING INSANG BERPANCANG", abbr:"GNI", apicode:"07.4.0"},
  {engname:"Trammel nets", indname:"JARING INSANG BERLAPIS", abbr:"GTR", apicode:"07.5.0"},
  {engname:"", indname:"JARING KLITIK", abbr:"", apicode:"07.5.0.1"},
  {engname:"Combined gillnets-trammel nets", indname:"JARING INSANG KOMBINASI", abbr:"GTN", apicode:"07.6.0"},
  {engname:"With purse lines (purse seines)", indname:"JARING LINGKAR BERTALI KERUT", abbr:"PS", apicode:"01.1.0"},
  {engname:"one boat operated purse seines", indname:"PUKAT CINCIN DENGAN SATU KAPAL", abbr:"PS1", apicode:"01.1.1"},
  {engname:"", indname:"PUKAT CINCIN PELAGIS KECIL DGN SATU KAPAL", abbr:"", apicode:"01.1.1.1"},
  {engname:"", indname:"PUKAT CINCIN PELAGIS BESAR DGN SATU KAPAL", abbr:"", apicode:"01.1.1.2"},
  {engname:"two boats operated purse seines", indname:"PUKAT CINCIN DENGAN DUA KAPAL", abbr:"PS2", apicode:"01.1.2"},
  {engname:"", indname:"PUKAT CINCIN GRUP PELAGIS KECIL", abbr:"", apicode:"01.1.2.1"},
  {engname:"Without purse lines (lampara)", indname:"JARING LINGKAR TANPA TALI KERUT (LAMPARA)", abbr:"LA", apicode:"01.2.0"},
  {engname:"Beach seines", indname:"PUKAT TARIK PANTAI", abbr:"SB", apicode:"02.1.0"},
  {engname:"Boat or vessel seines", indname:"PUKAT TARIK BERKAPAL", abbr:"SV", apicode:"02.2.0"},
  {engname:"Danish seines", indname:"DOGOL", abbr:"SDN", apicode:"02.2.1"},
  {engname:"Scottish seines", indname:"SCOTTISH SEINES", abbr:"SSC", apicode:"02.2.2"},
  {engname:"pair seines", indname:"PAIR SEINES", abbr:"SPR", apicode:"02.2.3"},
  {engname:"", indname:"PAYANG", abbr:"", apicode:"02.2.0.1"},
  {engname:"", indname:"CANTRANG", abbr:"", apicode:"02.2.0.2"},
  {engname:"", indname:"LAMPARA DASAR", abbr:"", apicode:"02.2.0.3"},
  {engname:"beam trawls", indname:"PUKAT HELA DASAR BERPALANG", abbr:"TBB", apicode:"03.1.1"},
  {engname:"otter trawls", indname:"PUKAT HELA DASAR BERPAPAN", abbr:"OTB", apicode:"03.1.2"},
  {engname:"pair trawls", indname:"PUKAT HELA DASAR DUA KAPAL", abbr:"PTB", apicode:"03.1.3"},
  {engname:"nephrops trawls", indname:"PUKAT HELA DASAR LAINNYA", abbr:"TBN", apicode:"03.1.4"},
  {engname:"shrimp trawls", indname:"PUKAT HELA DASAR UDANG", abbr:"TBS", apicode:"03.1.5"},
  {engname:"", indname:"PUKAT UDANG", abbr:"", apicode:"03.1.5.1"},
  {engname:"otter trawls", indname:"PUKAT HELA PERTENGAHAN BERPAPAN", abbr:"OTM", apicode:"03.2.1"},
  {engname:"pair trawls", indname:"PUKAT HELA PERTENGAHAN DUA KAPAL", abbr:"PTM", apicode:"03.2.2"},
  {engname:"shrimp trawls", indname:"PUKAT HELA PERTENGAHAN UDANG", abbr:"TMS", apicode:"03.2.3"},
  {engname:"", indname:"PUKAT IKAN", abbr:"", apicode:"03.2.1.1"},
  {engname:"Otter twin trawls", indname:"PUKAT HELA KEMBAR BERPAPAN", abbr:"OTT", apicode:"03.3.0"},
  {engname:"", indname:"PUKAT DORONG", abbr:"", apicode:"03.9.0.1"},
  {engname:"Boat dredges", indname:"PENGGARUK BERKAPAL", abbr:"DRB", apicode:"04.1.0"},
  {engname:"Hand dredges", indname:"PENGGARUK TANPA KAPAL", abbr:"DRH", apicode:"04.2.0"},
  {engname:"Portable lift nets", indname:"ANCO", abbr:"LNP", apicode:"05.1.0"},
  {engname:"", indname:"BAGAN BERPERAHU", abbr:"", apicode:"05.2.0.1"},
  {engname:"", indname:"BOUKE AMI", abbr:"", apicode:"05.2.0.2"},
  {engname:"Shore-operated stationary lift nets", indname:"BAGAN TANCAP", abbr:"LNS", apicode:"05.3.0"},
  {engname:"Cast nets", indname:"JALA JATUH BERKAPAL", abbr:"FCN", apicode:"06.1.0"},
  {engname:"Falling gear (not specified)", indname:"JALA TEBAR", abbr:"FG", apicode:"06.9.0"},
  {engname:"Set gillnets (anchored)", indname:"JARING INSANG TETAP", abbr:"GNS", apicode:"07.1.0"},
  {engname:"", indname:"SET NET", abbr:"", apicode:"08.1.0.1"},
  {engname:"Pots", indname:"BUBU", abbr:"FPO", apicode:"08.2.0"},
  {engname:"Fyke nets", indname:"BUBU BERSAYAP", abbr:"FYK", apicode:"08.3.0"},
  {engname:"", indname:"PUKAT LABUH", abbr:"", apicode:"08.4.0.1"},
  {engname:"", indname:"TOGO", abbr:"", apicode:"08.4.0.2"},
  {engname:"", indname:"AMBAI", abbr:"", apicode:"08.4.0.3"},
  {engname:"", indname:"JERMAL", abbr:"", apicode:"08.4.0.4"},
  {engname:"", indname:"PENGERIH", abbr:"", apicode:"08.4.0.5"},
  {engname:"", indname:"SERO", abbr:"", apicode:"08.5.0.1"},
  {engname:"Aerial traps", indname:"PERANGKAP IKAN PELONCAT", abbr:"FAR", apicode:"08.6.0"},
  {engname:"", indname:"MURO AMI", abbr:"", apicode:"08.9.0.1"},
  {engname:"", indname:"SESER", abbr:"", apicode:"08.9.0.2"},
  {engname:"Harpoons", indname:"TOMBAK", abbr:"HAR", apicode:"10.1.0"},
  {engname:"", indname:"LADUNG", abbr:"", apicode:"10.0.0.1"},
  {engname:"", indname:"PANAH", abbr:"", apicode:"10.0.0.2"},
];

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}

const eng = [{label:'Not set',value:''}];
const ind = [{label:'Belum diset',value:''}];
for (let key in fishinggear) {
  if (fishinggear.hasOwnProperty(key)) {
    const val = fishinggear[key];
    let indname = val.indname;
    let engname = val.engname;

    const apicode = val.apicode;
    const abbr = val.abbr;
    let txt2 = ' ['+apicode;
    if(abbr && abbr.length > 0) txt2 = txt2 + '/' +abbr;
    txt2 += ']';

    if(engname.length > 0) eng.push({label:capitalizeFirstLetter(engname)+txt2,value:apicode});
    if(indname.length > 0) ind.push({label:capitalizeFirstLetter(indname)+txt2,value:apicode});  
    
    // if(abbr.length > 0) {
    //   if(engname.length > 0) eng.push({label:capitalizeFirstLetter(engname)+txt2,value:abbr});
    //   if(indname.length > 0) ind.push({label:capitalizeFirstLetter(indname)+txt2,value:abbr});  
    // } else if(apicode.length > 0) {
    //   if(engname.length > 0) eng.push({label:capitalizeFirstLetter(engname)+txt2,value:apicode});
    //   if(indname.length > 0) ind.push({label:capitalizeFirstLetter(indname)+txt2,value:apicode});  
    // }
  }
}

module.exports.getGear = function() {
  return {eng,ind};
}

module.exports.getAbbr = function(apicode) {
  if(!apicode) return 'MIS';
  const result = _.find(fishinggear,{apicode:apicode});
  if(result && result.abbr && result.abbr.length == 3) {
    return result.abbr;
  } else if(apicode && apicode.length == 3) {
    return apicode;
  } 
  return 'MIS';
}

module.exports.getName = function(apicode) {
  if(!apicode) return 'MISC';
  const result = _.find(fishinggear,{apicode:apicode});
  const eng = (L('en') == 'en');
  if(result !== undefined && result !== null) 
  {
    if((result.engname !== undefined && eng) || (result.indname !== undefined && !eng)) 
      return (eng ? result.engname : result.indname);
    } else if(apicode && apicode.length == 3) {
      return apicode;
  } else if(apicode && apicode.length == 3) {
    return apicode;
  } 
  return 'MISC';
}
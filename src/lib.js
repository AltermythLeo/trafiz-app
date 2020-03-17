const moment = require('moment');
const axios = require('axios');
const country2prov = require('./json/country2prov.json');
const prov2city = require('./json/prov2city.json');
const grid = require('./json/grid.json');

Number.prototype.format = function(c, d, t){
  var n = this, 
  c = isNaN(c = Math.abs(c)) ? 2 : c, 
  d = d == undefined ? "," : d, 
  t = t == undefined ? "." : t, 
  s = n < 0 ? "-" : "", 
  i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
  j = (j = i.length) > 3 ? j % 3 : 0;
 return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

module.exports.TRAFIZ_URL = 'https://trafiz.org';
//module.exports.TRAFIZ_URL = 'http://192.168.100.72/trafiz';
module.exports.THEME_COLOR = 'royalblue';
module.exports.delay = function (ms) {
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve();
    },ms);
  });
}

module.exports.toPrice = function (num) {
  const ret = Number(num);
  return ret.format(0);
}

module.exports.getFN = function (str) {
  return str.split('\\').pop().split('/').pop();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports.getOfflineId = function (msg1,msg2) {
  const msg3 = '-'+getRandomInt(9999);
  const ret = msg1+'-'+msg2+'-'+moment().valueOf()+msg3;
  return ret;
}

module.exports.getShortOfflineId = function (msg1,msg2) {
  const ms = moment().valueOf();
  const msg3 = ms.toString(32);
  const ret = msg1+'-'+msg2+'-'+msg3;
  return ret.toUpperCase();
}

module.exports.getIdFish = function (msg1) {
  const ms = moment().valueOf();
  const msg2 = ms.toString(32);
  const ret = msg1+'-'+msg2;
  return ret.toUpperCase();
}

module.exports.dump = function(json) {
  axios({
    method: 'post',
    url: 'http://192.168.100.23:3000',
    data: json
  })
  .then(result=>{
    // console.log(result);
  })
  .catch(err=>{

  })
}

module.exports.getProvinces = function(country) {
  const key = country.toUpperCase();
  const ret = country2prov[key] ? country2prov[key] : [];
  return ret;
}

module.exports.getCity = function(prov) {
  const key = prov.toUpperCase();
  const ret = prov2city[key] ? prov2city[key] : [];
  return ret;
}

module.exports.toTitleCase = function(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

module.exports.sortLabel = function(arr) {
  let tempSorted = arr.sort(function (a, b) {
    let nameA = a.label;
    if(nameA) nameA = nameA.toLowerCase();
    let nameB = b.label;
    if(nameB) nameB = nameB.toLowerCase();
    if (nameA < nameB)
      return -1;
    if (nameA > nameB)
      return 1;
    return 0;
  });
  return tempSorted;
}

module.exports.sortLabelIndo = function(arr) {
  let tempSorted = arr.sort(function (a, b) {
    let nameA = a.labelIndo;
    if(nameA) nameA = nameA.toLowerCase();
    let nameB = b.labelIndo;
    if(nameB) nameB = nameB.toLowerCase();
    if (nameA < nameB)
      return -1;
    if (nameA > nameB)
      return 1;
    return 0;
  });
  return tempSorted;
}


module.exports.getMDPI = function(str) {
  for(let i=0;i<grid.length;i++) {
    const row = grid[i];
    const wpp = row.wpp;
    const grids = row.grid;
    for(let j=0;j<grids.length;j++) {
      const code = grids[j];
      if(code == str) return wpp;
    }
  }

  return false;
}

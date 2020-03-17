const axios = require('axios');
const moment = require('moment');
const qs = require('qs');


// post: https://trafiz.org/_api/sup/login
// identity=kipli
// password=123123
/*
{
    "err": "ok",
    "data": {
        "id": 7,
        "idmsuser": "8ab2193258e111e8a12988d7f61b4659",
        "idmssupplier": "8abe251b58e111e8a12988d7f61b4659"
    }
}
*/

// kipli
const idmsuser = 'd51597cf802411e89cd1000d3aa384f1';
const idmssupplier = 'd51642a5802411e89cd1000d3aa384f1';


// juki
/*
     idmsuser: '1fae505858eb11e8a12988d7f61b4659',
     idmssupplier: '8abe251b58e111e8a12988d7f61b4659',
     idltusertype: 2,
     lang: 'en',
     idmssupplierofficer: '1fbb33d858eb11e8a12988d7f61b4659',

*/
// const idmsuser = "1fae505858eb11e8a12988d7f61b4659";
// const idmssupplier = "8abe251b58e111e8a12988d7f61b4659";

const param1 = {
  nameparam:'Dono',
  bodparam:'1980-05-28 00:00:00',
  photoparam:'',
  fishermannatidparam:'123456789001',
  groupfishingparam:'Sahabat',
  positioninshipparam:'ABK',
  idmssupplierparam:'8abe251b58e111e8a12988d7f61b4659'
}

const param2 = {
  idmsuserparam:'674d5cb9636211e89d55000d3aa384f1'
}

// { idmsship: 'b9b7d790636711e89d55000d3aa384f1',
//     shipname: 'Perahu',
//     catchmethod: 'Jala',
//     gt: '2000',
//     shipnatid: 'Id',
//     flag: 'Id',
//     uvi: 'Abc' }

const param3b = {
  shipnameparam:'Perahu',
  catchmethodparam:'Jala',
  gtparam:'2000',
  shipnatidparam:'Id',
  flagparam:'Id',
  uviparam:'Abc',
  idmsuserparam:'8ab2193258e111e8a12988d7f61b4659'
}

const param3 = {
  idmsship:'395a7691687311e89d55000d3aa384f1',
  shipnameparam:'Perahu',
  catchmethodparam:'Jala',
  gtparam:'2000',
  shipnatidparam:'Id',
  flagparam:'Id',
  uviparam:'Abc',
  idmsuserparam:'8ab2193258e111e8a12988d7f61b4659'
}

const param4 = {
  idmsship:'b9b7d790636711e89d55000d3aa384f1'
}

const param5 = {
  idltfish:'1',
  indname:'Leledumbo',
  photoparam:'',
  localname:'Manuk Dadali',
  idmssupplier:'8abe251b58e111e8a12988d7f61b4659'
}

const param6 = {
  idmsfish:'36964d7963de11e89d55000d3aa384f1',
  idltfish:'1',
  indname:'Lele',
  photoparam:'',
  localname:'Leledumbo',
  idmssupplier:'8abe251b58e111e8a12988d7f61b4659'
}

const param7 = {
  idmsfish:'36964d7963de11e89d55000d3aa384f1'
}

const param8 = {
  name:'buyer terpercaya',
  idltusertype:'1',
  idmssupplier:'8abe251b58e111e8a12988d7f61b4659'
}

// identity=kipli
// password=123123

function login() {
  axios({
    method: 'post',
    url: 'https://trafiz.org/_api/sup/login',
    data: {
      identity:'kipli',
      password:'123123'
    }
  })
  .then(result=>{
    if(result.status !== 200 ) throw 'Connection error';
    console.log(result.data);
  })
  .catch(err=>{
    console.log(err.response.data);
    console.log('error!');
  })
}


function createReq(p1,p2,p3,p4) {
  const task = createTask(p1,p2,p3,p4); 
  const data = {
    sender:idmsuser,
    data:[task]
  }
  return data;
}

function req(data) {
  axios({
    method: 'post',
    url: 'https://trafiz.org/_api/syncdata',
    data: {jsonParam:JSON.stringify(data)}
  })
  .then(result=>{
    if(result.status !== 200 ) throw 'Connection error';
    console.log(result.data);
  })
  .catch(err=>{
    console.log(err.response.data);
    console.log('error!');
  })
}

const createBuyer = createReq('create','buyer','addnewbuyer',{
  name:'buyer terpercaya',
  idltusertype:'1',
  idmssupplier:'8abe251b58e111e8a12988d7f61b4659'
});

const updateBuyer = createReq('update','buyer','updatebuyer',{
  id:'9c5bdf4d697911e89d55000d3aa384f1',
  name:'buyer terpercaya',
  idltusertype:'4',
  idmssupplier:'8abe251b58e111e8a12988d7f61b4659'
});

/*
get fisherman
{"idmsfisherman":"2a9561d0794211e89d55000d3aa384f1","idmsuser":"2a948a6a794211e89d55000d3aa384f1","name":"Coba","city":null,"address":null,"bod":"1984-06-26 00:00:00","defaultlanguage":"en","photo":"http:\/\/104.215.185.180\/imgupload\/1530018551.jpg","fishermannatid":"123123","groupfishing":"Compqny","positioninship":"Kapten"}

login
{ err: 'ok',
  data: 
   { id: 7,
     idmsuser: '8ab2193258e111e8a12988d7f61b4659',
     idmssupplier: '8abe251b58e111e8a12988d7f61b4659',
     idltusertype: 1,
     lang: 'en',
     idmssupplierofficer: null,
     accesspage: '1;2;3' } }
*/
const createLoan = createReq('create','loan','addnewloan',{
  descparam:'Beras 10 Kilo', 
  rpparam:'1000000', 
  idmsuserloanparam:'2a948a6a794211e89d55000d3aa384f1', //idmsuser fisherman
  idmsbuyerloanparam:null, //idmsuser fisherman
  idmssupplierparam:'8abe251b58e111e8a12988d7f61b4659', 
  loandateparam:'2018-05-26', 
  loaneridmsuserofficerparam:'8ab2193258e111e8a12988d7f61b4659'
});

/*
https://trafiz.org/_api/loan/get?id=8abe251b58e111e8a12988d7f61b4659&m=5&y=2018
[{"idtrloan":"669e446579c811e89d55000d3aa384f1","descloan":"Beras 5 Kilo","loaninrp":500000,"idmsuserloan":"2a948a6a794211e89d55000d3aa384f1","nameloan":"Coba","loandate":"2018-05-26 00:00:00","loaneridmsuserofficer":"8ab2193258e111e8a12988d7f61b4659","nameloanerofficer":"Markipli","paidoffdate":null,"paidoffidmsuserofficer":null,"namepaidofficer":null},{"idtrloan":"7b5fbad079c811e89d55000d3aa384f1","descloan":"Beras 5 Kilo","loaninrp":500000,"idmsuserloan":"2a948a6a794211e89d55000d3aa384f1","nameloan":"Coba","loandate":"2018-05-26 00:00:00","loaneridmsuserofficer":"8ab2193258e111e8a12988d7f61b4659","nameloanerofficer":"Markipli","paidoffdate":null,"paidoffidmsuserofficer":null,"namepaidofficer":null}]
*/

const strikeLoan = createReq('create','loan','payloan',{
  idtrloanparam:'669e446579c811e89d55000d3aa384f1',
  paidoffdateparam:'2018-05-26',
  paidoffidmsuserofficerparam:'8ab2193258e111e8a12988d7f61b4659'
});

const unstrikeLoan = createReq('create','loan','cancelpayloan',{
  idtrloanparam:'669e446579c811e89d55000d3aa384f1'
});


/*
juki
{ err: 'ok',
  data: 
   { id: 8,
     idmsuser: '1fae505858eb11e8a12988d7f61b4659',
     idmssupplier: '8abe251b58e111e8a12988d7f61b4659',
     idltusertype: 2,
     lang: 'en',
     idmssupplierofficer: '1fbb33d858eb11e8a12988d7f61b4659',
     accesspage: null } }
*/
const jukiCreateFisherman = createReq('create','fisherman','addnewfisherman',{
  nameparam:'Dono',
  bodparam:'1980-05-28 00:00:00',
  photoparam:'',
  fishermannatidparam:'123456789001',
  groupfishingparam:'Sahabat',
  positioninshipparam:'ABK',
  idmssupplierparam:'8abe251b58e111e8a12988d7f61b4659'
});

/*
1. idtrcatchpostparam
2. idmssupplierparam
3. idmsfishermanparam = null jika supplier
4. idmsbuyersupplierparam = null jika fisherman
5. idmsshipparam
6. idmsfishparam
7. varianceparam
8. dispatchnotephotoparam
9. locationparam
10. saildateparam
11. priceperkgparam
12. totalpriceparam
13. loanexpenseparam
14. otherexpenseparam
15. postdateparam
*/
const createCatch = createReq('create','catch','addcatch',{
  idtrcatchpostparam:'1234567890',
  idmssupplierparam:idmssupplier,
  idmsfishermanparam:'2a9561d0794211e89d55000d3aa384f1', //Coba
  idmsbuyersupplierparam:null,
  idmsshipparam:'01ad492c687a11e89d55000d3aa384f1',
  idmsfishparam:'5529a2a2747f11e89d55000d3aa384f1',
  varianceparam:'Ikan Laut',
  dispatchnotephotoparam:'http://placeimg.com/100/100/any',
  locationparam:'Laut Sunda',
  saildateparam:'2018-06-20',
  priceperkgparam:0,
  totalpriceparam:0,
  loanexpenseparam:0,
  otherexpenseparam:0,
  postdateparam:'2018-06-29'
});

const createOneCatch = createReq('create','catch','addfishcatch',{
  idtrcatchpostparam:'12345',
  amountparam:100,
  gradeparam:'A',
  descparam:'Ini notes saja'
});

const deleteOneCatch = createReq('delete','catch','deletefishcatch',{
  idtrfishcatchparam:'a27e382a7aae11e89d55000d3aa384f1'
});

const updateOneCatch = createReq('update','catch','updatefishcatch',{
  idtrfishcatchparam:'70cae8b67aae11e89d55000d3aa384f1',
  idtrcatchpostparam:'12345',
  amountparam:50,
  gradeparam:'A',
  descparam:'Cari gw'
});

const payCatch = createReq('update','catch','updatecatch',{
  idtrcatchparam:'4b93966b7b5211e89d55000d3aa384f1',
  idtrcatchpostparam:'1234567890',
  idmssupplierparam:idmssupplier,
  idmsfishermanparam:'2a9561d0794211e89d55000d3aa384f1', //Coba
  idmsbuyersupplierparam:null,
  idmsshipparam:'01ad492c687a11e89d55000d3aa384f1',
  idmsfishparam:'5529a2a2747f11e89d55000d3aa384f1',
  varianceparam:'Ikan Laut',
  dispatchnotephotoparam:'https://trafiz.org/imgupload/1530488812.jpg',
  locationparam:'Laut Sunda',
  saildateparam:'2018-06-20',
  priceperkgparam:321,
  totalpriceparam:100000,
  loanexpenseparam:500,
  otherexpenseparam:123000,
  postdateparam:'2018-06-29'
});

const payCatch2 = createReq('update','catch','updatecatch',{
  idtrcatchparam:'4b93966b7b5211e89d55000d3aa384f1',
  priceperkgparam:999
});

const saveDeliverySheet = createReq('create','deliverysheet','createdeliverysheet',{
  deliverysheetofflineidparam:'temp',
  savedtextparam:'temp'
});

//console.log(JSON.stringify(payCatch,null,1));
req(saveDeliverySheet);
//login();

// https://trafiz.org/_api/catch/getbysup?id=8abe251b58e111e8a12988d7f61b4659
// https://trafiz.org/_api/fish/get?id=8ab2193258e111e8a12988d7f61b4659
// https://trafiz.org/_api/loan/get?id=8abe251b58e111e8a12988d7f61b4659&m=6&y=2018
// https://trafiz.org/_api/paynloan/get?id=8abe251b58e111e8a12988d7f61b4659&m=6&y=2018
// paynloan => api bayar 
// addpayloan
// 1. idmsuserloanparam
// 2. idmsbuyerloanparam
// 3. idmssupplierparam
// 4. descparam
// 5. rpparam
// 6. paiddateparam
// 7. paidoffidmsuserofficerparam

// updatepayloan
// 1. idtrpayloanparam
// 2. idmsuserloanparam
// 3. idmsbuyerloanparam
// 4. idmssupplierparam
// 5. descparam
// 6. rpparam
// 7. paiddateparam
// 8. paidoffidmsuserofficerparam

const payLoanRupiah = createReq('create','loan','addpayloan',{
  idmsuserloanparam:null, //idmsuser fisherman
  idmsbuyerloanparam:'1e0ce7b1749d11e89d55000d3aa384f1', //idmsuser fisherman
  idmssupplierparam:'8abe251b58e111e8a12988d7f61b4659', 
  descparam:'Pembayaran Hutang', 
  rpparam:'1000', 
  paiddateparam:'2018-06-28', 
  paidoffidmsuserofficerparam:'8ab2193258e111e8a12988d7f61b4659'
});



const task1 = createTask('create','fisherman','addnewfisherman',param1);
const task2 = createTask('delete','fisherman','deletefisherman',param2);
const task3 = createTask('update','ship','updateship',param3);
const task3b = createTask('create','ship','addnewship',param3b);
const task4 = createTask('delete','ship','deleteship',param4);
const task5 = createTask('create','fish','addnewfish',param5);
const task6 = createTask('update','fish','updatefish',param6);
const task7 = createTask('delete','fish','deletefish',param7);
const task8 = createTask('create','buyer','addnewbuyer',param8);


const data1 = {
  sender:idmsuser,
  data:[task1]
}

const data2 = {
  sender:idmsuser,
  data:[task2]
}

const data3b = {
  sender:idmsuser,
  data:[task3b]
}

const data3 = {
  sender:idmsuser,
  data:[task3]
}

const data4 = {
  sender:idmsuser,
  data:[task4]
}

const data5 = {
  sender:idmsuser,
  data:[task5]
}

const data6 = {
  sender:idmsuser,
  data:[task6]
}

const data7 = {
  sender:idmsuser,
  data:[task7]
}

// console.log(data3b);
// console.log(data3);

// https://trafiz.org/_api/fish/get?id=8ab2193258e111e8a12988d7f61b4659
// axios({
//   method: 'get',
//   url: 'https://trafiz.org/_api/fish/get?id='+idmsuser
// })
// .then(result=>{
//   if(result.status !== 200 ) throw 'Connection error';
//   console.log(result.data);
// })
// .catch(err=>{
//   console.log(err.response.data);
//   console.log('error!');
// })

// axios({
//   method: 'post',
//   url: 'https://trafiz.org/_api/syncdata',
//   data: {jsonParam:JSON.stringify(data3b)}
// })
// .then(result=>{
//   if(result.status !== 200 ) throw 'Connection error';
//   console.log(result.data);
// })
// .catch(err=>{
//   console.log(err.response.data);
//   console.log('error!');
// })

function createTask(type,func,functionName,p) {
  let params = [];

  for (var key in p) {
    if (p.hasOwnProperty(key)) {
      const val = p[key];
      params.push(val);
    }
  }
  params = params.join(',');
  const desc = ''+type+' data '+func+' sebagai berikut : '+params;

  const task = {
    type:type, // create / update / delete
    function:func,
    functionName:functionName,
    param:p,
    desc:desc,
    dateTime:moment().format('YYYY-MM-DD HH:mm:ss')
  }

  return task;
}

const axios = require('axios');

// axios({
//   method: 'get',
//   url: 'http://104.215.185.180/_api/delivery/getsheetv2?id=d51642a5802411e89cd1000d3aa384f1'
// })
// .then(result=>{
//   if(result.status !== 200 ) throw 'Connection error';
//   const rows = result.data;
//   const lastIndex = rows.length-1;
//   const row = rows[lastIndex];
//   const savedText = row.savedtext;
//   const json = JSON.parse(savedText); 
//   console.log(JSON.stringify(json,null,1));

// })
axios({
  method: 'get',
  url: 'http://104.215.185.180/_api/delivery/getsheet?id=ODB-d51642a5802411e89cd1000d3aa384f1'
})
.then(result=>{
  if(result.status !== 200 ) throw 'Connection error';
  const rows = result.data;
  const lastIndex = rows.length-1;
  const row = rows[lastIndex];
  const savedText = row.savedtext;
  const json = JSON.parse(savedText); 
  console.log(JSON.stringify(json,null,1));

})
.catch(err=>{
  console.log(err.response.data);
  console.log('error!');
})

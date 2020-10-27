const randomColor = require('randomcolor');

module.exports.colorForIndex = function(index) {
  const reserved = ['rgba(131, 167, 234, 1)','green','red','orange','blue'];
  if(index < reserved.length) return reserved[index];
  return randomColor();
}
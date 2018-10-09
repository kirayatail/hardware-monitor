const ValueMap = require('./valuemap.js');

const settings = {
  // URL for the Open Hardware Monitor web server, including path to data.json
  ohmUrl: 'http://localhost:8085/data.json',
  
  // Values you wish to track, in order it will be sent over serial
  values: [
    {
      // Follow path according to Open Hardware Monitor
      path: ['Computername', 'CPUname', 'Load', 'CPU Total'],
      // Provide a mapping function v => v
      map: v => ValueMap.linear(0,100,0,255,v)
    }
  ]
};

module.exports = settings;
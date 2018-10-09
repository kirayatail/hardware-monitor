const settings = require('./settings.js');
const OHM = require('./ohm-util.js')(settings);
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
let port;
let parser;

SerialPort.list().then(
  ports => {
    const portNames = ports.filter(p => p.manufacturer.indexOf('Arduino') > -1).map(p => p.comName)
    if (portNames.length > 0) {
      port = new SerialPort(portNames[0],(err) => console.error(err));
      parser = port.pipe(new Readline({ delimiter: '\r\n'}));
      parser.on('data', (data) => {
        console.log('Received:', data);
        OHM.getValues().then(data => {
          console.log(`Sending ${data}`);
          port.write(data);
        },
        console.error);
      });
    }
  },
  console.error
);

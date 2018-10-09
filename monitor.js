const http = require('http');
const _ = require('lodash');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
let port;
let parser;

let cpu = 0;
let gpu = 0;
let temp = 0;

SerialPort.list().then(
  ports => {
    const portNames = ports.filter(p => p.manufacturer.indexOf('Arduino') > -1).map(p => p.comName)
    if (portNames.length > 0) {
      port = new SerialPort(portNames[0],(err) => console.error(err));
      parser = port.pipe(new Readline({ delimiter: '\r\n'}));
      parser.on('data', (data) => {
        console.log('Received:', data);
        fetch();
      });
    }
  },
  error => console.error(error)
);



const machineId = 'DESKTOP-NUOTV7R';
const fetch = () => {
  http.get('http://localhost:8085/data.json', (res) => {
    const {statusCode} = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }

    if (error) {
      console.error(error.message);
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => {rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        temp = Math.round(linearMap(20,60,0,255, getWaterTemp(parsedData)));
        gpu = Math.round(linearMap(0,100,0,255,getGPULoad(parsedData)));
        cpu = Math.round(linearMap(0,100,0,255,getCPULoad(parsedData)));
        port.write([temp, cpu, gpu]);
        console.log("Sending data: [temp, cpu, gpu]", [temp, cpu, gpu]);
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error('General error:', e.message);
  });
}

const linearMap = (a,b,x,y,v)  => {
  return (((v-a) * (y-x)) / (b-a)) + x;
}

const getWaterTemp = (obj) => {
  var t =
    find('Temperature #4',
      find('Temperatures',
        find('ITE IT8665E',
          find('ASUS PRIME X370-PRO',
            find('DESKTOP-NUOTV7R', [obj])
          )
        )
      )
    )[0].Value;
  return toNumber(t);
}

const getGPULoad = (obj) => {
  var v = find(
    'GPU Core', find(
      'Load', find(
        'Radeon RX Vega', find(
          machineId, [obj]
        )
      )
    )
  ).map(c => toNumber(c.Value))
  .reduce((acc, v, i, arr) => acc + (v / arr.length), 0);

  return v;
}

const getCPULoad = (obj) => {
  var v = find(
    'CPU Total', find(
      'Load', find(
        'AMD Ryzen 7 1700', find(
          machineId, [obj]
        )
      )
    )
  )[0].Value || 0;
  return toNumber(v);
}

const find = (name, arr) => {
  return _.flatten(arr.map(obj => obj.Children.filter(c => c.Text === name)));
}

const toNumber = (str) => {
  return parseFloat(str.replace(/,/g, '.').replace(/[^\d\.]/g, ''));
}
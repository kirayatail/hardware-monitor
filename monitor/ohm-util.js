const http = require('http');
const _ = require('lodash');

const ohmUtil = (settings) => {
  const fetch = () => {
    return new Promise((resolve, reject) => {
      http.get(settings.ohmUrl, (res) => {
        const {statusCode} = res;
        const contentType = res.headers['content-type'];

        if (statusCode !== 200) {
          res.resume();
          reject(`Request Failed. Status code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          res.resume();
          reject(`Invalid content-type. Expected application/json but received ${contentType}`);
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } catch (e) {
            reject(e.message);
          }
        });
      });
    });
  };

  const find = (name, arr) => {
    return _.flatten(arr.map(obj => obj.Children.filter(c => c.Text === name)));
  }
  
  const toNumber = (str) => {
    return parseFloat(str.replace(/,/g, '.').replace(/[^\d\.]/g, ''));
  }

  const getValues = () => {
    return new Promise((resolve, reject) => {
      fetch().then(
        (data) => {
          resolve(settings.values.map(v => {
            return v.map(v.path.reduce((acc, path) => {
              return find(path, acc);
            }, [data]).map(c => toNumber(c.Value))
            .reduce((acc, v, i, arr) => acc + (v / arr.length), 0));
          }));
        },
        (error) => { reject(error); }
      );
    });
  }

  return {
    getValues: getValues
  }
};

module.exports = ohmUtil;
const fs = require('fs');

fs.access('monitor/settings.js', fs.constants.F_OK, (err) => {
    if (err && err.code === 'ENOENT') {
        fs.copyFile('monitor/settings-proto.js', 'monitor/settings.js', (err) => {
            console.error('File \'settings-prototype.js\' missing. Download package again!');
        });
    }
});

#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const onml = require('onml');

const sources = [{
  url: 'http://www.forth.org/fd/'
}];

const main = async () => {
  for (const source of sources) {
    const res = await new Promise((resolve, reject) => {
      let data = '';
      http.get(source.url, (res) => {
        if (res.statusCode === 200) {
          res.on('data', chunk => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(data);
          });
        } else {
          console.log(res.statusCode, data);
        }
      });
    });
    const resml = onml.parse(res, {strict: false});
    for (const row of resml[3][3]) {
      if (row.length === 7) {
        const fname = row[3][2][1].HREF;
        const m = fname.match(/\w+\.pdf/);
        if (m) {
          const resPdf = await new Promise((resolve, reject) => {
            http.get(source.url + fname, (res) => {
              if (res.statusCode === 200) {
                var file = fs.createWriteStream(fname);
                res.pipe(file);
                file.on('finish', function() {
                  // file.close(cb);
                  console.log(fname + ' done');
                  resolve();
                });
              } else {
                console.log(res.statusCode, fname);
              }
            });
          });
        }
      }
    }
  }
};

main();

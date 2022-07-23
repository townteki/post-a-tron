const fs = require('fs');
const path = require('path');
const https = require('https');
const { makeKeyFromPackCode, makeKeyFromName } = require("./../lib/card-utils.js");

const exportFile = path.join(__dirname, '../data/cards.json');

/**
 * Callback function for sorting a list of card codes.
 * @param {String} code1
 * @param {String} code2
 * @return {Number}
 */
function sortCardCodes(code1, code2) {
  return parseInt(code2, 10) - parseInt(code1, 10);
}

const cardTextReplacement = [
  // Markup to Markdown
  [/<b>/g, "**"],
  [/<\/b>/g, "**"],
  [/<i>/g, "***"],
  [/<\/i>/g, "***"],
  // Line Breaks to double line breaks, otherwise markdown will just eat the break.
  [/\n/g, '\n\n']
];

async function getDataFromAPI(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
          `Expected application/json but received ${contentType}`);
      }

      if (error) {
        console.error(error.message);
        reject(error.message);
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(rawData);
          resolve(json);
        } catch (e) {
          console.error(e.message);
          reject(e.message);
        }
      });
      res.on('error', (e) => {
        console.error(e);
        reject(e.message);
      });
    })
  });
}

async function importCards() {

  const packs = await getDataFromAPI('https://dtdb.co/api/sets/')
  const cards = await getDataFromAPI('https://dtdb.co/api/cards/');

  const packMap = {}

  // map pack codes to pack names for lookup downstream
  packs.forEach(pack => {
    packMap[pack.code] = pack;
  });

  // output data structure
  const data = {
    cards: {},
    indices: {
      packs: {},
      names: {}
    },
  }

  cards.forEach(card => {
    // ignore alt-arts
    if (card.pack_code === 'alt') {
      return;
    }
    // massage card text and flavor-text.
    if (card.text) {
      cardTextReplacement.forEach(searchReplace => {
        card.text = card.text.replace(searchReplace[0], searchReplace[1]);
      });
    }

    // add pack name to card
    card.pack_name = packMap[card.pack_code].name;

    // store card by code.
    data.cards[card.code] = card;
    const packKey = makeKeyFromPackCode(card.pack_code);
    const nameKey = makeKeyFromName(card.title);

    // index cards by pack
    if (! data.indices.packs.hasOwnProperty(packKey)) {
      data.indices.packs[packKey] = {};
    }
    data.indices.packs[packKey][nameKey] = [ card.code ];

    // index cards by name
    if (! data.indices.names.hasOwnProperty(nameKey)) {
      data.indices.names[nameKey] = [];
    }
    data.indices.names[nameKey].push(card.code);
  });

  // make another pass over the names index, and sort the card codes for each title entry.
  const names = Object.keys(data.indices.names);
  names.forEach(name => {
    data.indices.names[name].sort(sortCardCodes);
  })
  fs.writeFile(exportFile, JSON.stringify(data), 'utf8', (e) => {
    if (e) throw e;
  });
}

(async () => await importCards())()



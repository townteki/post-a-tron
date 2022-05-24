const request = require('request-promise-native');
const Url = require('urijs');
const fs = require('fs');

const { MessageEmbed } = require('discord.js');
const { compareTwoStrings } = require('string-similarity');

require.extensions['.txt'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const cardList = require('../cardList.js');

const manamoji = require('./middleware/manamoji');
const utm = require('./middleware/utm');
const { get } = require('http');

const errorResponses = ["... why was I built to feel pain?",
                      "*buzz* *whirr*",
                      "SELF-DESTRUCTION IMMINENT **EXPLODES**",
                      "Insufficient postage detected. You are under arrest.",
                      "SYSTEM ERROR: INITIATING KILL PROTOCOL",
                      "Forbidden query: [redacted] is en route."];

class TextResponse {
  constructor(client, cardName) {
    this.client = client;
    this.cardName = cardName;

    this.drifterEmoji = this.client.emojis.cache.find(e => e.name === 'pinebox').toString()
    this.firstPeoplesEmoji = this.client.emojis.cache.find(e => e.name === 'FP').toString()
    this.anarchistsEmoji = this.client.emojis.cache.find(e => e.name === 'AN').toString()
    this.lawDogsEmoji = this.client.emojis.cache.find(e => e.name === 'LD').toString()
    this.outlawsEmoji = this.client.emojis.cache.find(e => e.name === 'OL').toString()
    this.fearmongersEmoji = this.client.emojis.cache.find(e => e.name === 'FM').toString()
    this.entrepreneursEmoji = this.client.emojis.cache.find(e => e.name === 'EN').toString()
  }



  errorResponse(response) {
    //let parts = response.body.split('\n');
    //const embedTitle = parts.shift();

    let description = errorResponses[Math.floor(Math.random() * errorResponses.length)];

    //Change HTML Bold and Italics to Discord Markdown

    console.log(response);
    
    return {
      title: response.title, 
      description: description,
    };
}

  makeQuerystring() {
    return {
      fuzzy: this.cardName,
      format: 'text'
    };
  }

  makeUrl() {
    return Url(this.url).query(this.makeQuerystring()).toString();
  }

  makeRequest() {
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        resolveWithFullResponse: true,
        uri: this.makeUrl()
      }).then(response => {
        resolve(response);
      }).catch(err => {
        resolve(err.response);
      });
    });
  }

  makeEmbed(response) {
    //let parts = response.body.split('\n');
    //const embedTitle = parts.shift();
  
    response.keywords = response.keywords.replace(/<b>/g, '**').replace(/<\/b>/g,'**')

    response.text = response.text
                        .replace(/<b>/g, '**')
                        .replace(/<\/b>/g,'**')
                        .replace(/<i>/g, '*')
                        .replace(/<\/i>/g,'*')
                        .replace(/\n/,'\n\n')
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/1stpeoples-20.png\" title=\"First Peoples\">/, `${this.firstPeoplesEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/eaglewardens-20.png\" title=\"Eagle Wardens\">/, `${this.firstPeoplesEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/anarchists-20.png\" title=\"Anarchists\">/, `${this.anarchistsEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/righteousbandits-20.png\" title=\"The 108 Righteous Bandits\">/, `${this.anarchistsEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/lawdogs-20.png\" title=\"Law Dogs\">/, `${this.lawDogsEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/outlaws-20.png\" title=\"Outlaws\">/, `${this.outlawsEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/sloanegang-20.png\" title=\"The Sloane Gang\">/, `${this.outlawsEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/fourthring-20.png\" title=\"The Fourth Ring\">/, `${this.fearmongersEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/fearmongers-20.png\" title=\"Fearmongers\">/, `${this.fearmongersEmoji}`)
                        .replace(/<img src=\"\/web\/bundles\/dtdbbuilder\/images\/entrepreneurs-20.png\" title=\"Entrepreneurs\">/, `${this.entrepreneursEmoji}`)

    response.flavor = response.flavor.replace(/<b>/g, '**').replace(/<\/b>/g,'**')

    let description = `${this.getRankAndSuit(response)}\n\n` + 
                      `${response.type}` + 
                      `${response.bullets != null ? ' • ' + response.shooter + ' ' + response.bullets  : ''}` + 
                      `${response.influence != null ? ' • Influence ' + response.influence : ''}` + 
                      `${response.control != null ? ' • Control ' + response.control : ''}` + 
                      `${response.wealth != null ? ' • Wealth ' + response.wealth : ''}` + 
                      `${response.production != null ? ' • Production ' + response.production : ''}` + 
                      `${response.cost != null ? ' • Cost ' + response.cost : ''}` + 
                      `${response.upkeep != null ? ' • Upkeep ' + response.upkeep : ''}` + 
                      `${response.keywords != '' ? '\n\n' + '**' + response.keywords + '**' : ''}` + 
                      '\n\n' + response.text + 
                      `${response.flavor != '' ? '\n\n' +'*' + response.flavor + '*' : ''}`

    let embed = new MessageEmbed()
                    .setTitle(response.title)
                    .setURL(response.url)
                    .setDescription(description)
                    .setThumbnail(this.imageurl + response.imagesrc)

    // let cardData = {
    //     title: response.title,
    //     rank: response.rank,
    //     suit: response.suit,
    //     keywords: response.keywords,
    //     description: response.text,
    //     url: response.url,
    //     thumbnail: {
    //       url: this.imageurl + response.imagesrc,
    //     }
    // };
    
    //Change HTML Bold and Italics to Discord Markdown

    console.log(response);
    
    return embed;
  }

    getRankAndSuit(response) {

        let rank = '';

        let suit = '';

        switch (response.suit) {
            case "Spades":
                suit = 'ss' 
                rank = 'b'
                break;
            case "Clubs":
                suit = 'cc'
                rank = 'b'
                break;
            case "Diams":
                suit = 'dd' 
                rank = 'r'
                break;
            case "Hearts":
                suit = 'hh'
                rank = 'r'
                break;
            default:
                break;
        }

        switch (response.rank) {
            case 1:
                rank += 'A'
                break;
            case 11:
                rank += 'J'
                break;
            case 12:
                rank += 'Q'
                break;
            case 13:
                rank += 'K'
                break;
            default:
                rank += response.rank;
                break;
        }

        const rankEmoji = this.client.emojis.cache.find(e => e.name === rank);
        const suitEmoji = this.client.emojis.cache.find(e => e.name === suit);


        return `${rankEmoji ? rankEmoji.toString() + suitEmoji.toString() : ''}`
    }

  lookupCard() {
    return new Promise(async (resolve, reject) => {

      let list = await cardList
                  .then((result) => {
                    return result;
                  });

      var i, len = list.length, stop = 1, out, bestCard,bestHit = 0;
      
      for (i = 0; i < len; i++) {
        
        var current = list[i];
        var hit = compareTwoStrings(this.cardName,current.title);
        
        if(hit >= 0.45) {
          if(bestHit === 0 || hit > bestHit) {
            bestHit = hit;
            bestCard = current.title;
            out = current;
          }
        }

        //if (current.label.toLowerCase() === this.cardName.toLowerCase()) {
        //  console.log("here");
        //  out = cardListEval[i];
        //  stop = 0;
        //}
      }
      
      console.log("Best hit was: " + bestHit);
      console.log("Best card was: " + bestCard);
      
      if(bestHit > 0) {
        resolve(out);
      } else {
        resolve("Nothing Found");
      }
    });
  }

  embed() {
    return new Promise((resolve, reject) => {
      this.lookupCard().then(response => {
        let embed = this.errorResponse(response);

        if(response != 'Nothing Found') {
            embed = this.makeEmbed(response);
        }
        this.middleware.length > 0 && this.middleware.forEach(mw => {
          embed = mw(this.client, embed);
        });
        resolve(embed);
      });
    });
  }
}

TextResponse.prototype.middleware = [ utm ];
TextResponse.prototype.url = 'http://dtdb/api/card/';
TextResponse.prototype.imageurl = 'http://dtdb.co';


class ImageResponse extends TextResponse {
  makeEmbed(response) {
    //let parts = response.body.split('\n');
    return {
      title: response.title,
      url: response.url,
      image: {
        url: this.imageurl + response.imagesrc
      }
    };
  }
}

class ErrorResponse extends TextResponse {
    

}

module.exports = { TextResponse, ImageResponse, ErrorResponse };

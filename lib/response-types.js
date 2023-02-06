const axios = require('axios');
const Url = require('urijs');
const data = require("./../data/cards.json");
const utm = require('./middleware/utm');
const { makeKeyFromPackCode, makeKeyFromName, extractNameAndPackCode } = require("./card-utils");
const { searchByName, searchByNameAndPack } = require("./search-utils");
const { MessageEmbed } = require('discord.js');

const base_url = 'https://dtdb.co';
const api_card_endpoint = base_url + 'api/card/';

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
    return Url(api_card_endpoint).query(this.makeQuerystring()).toString();
  }

  makeRequest() {
    return axios.get(this.makeUrl());
  }

  makeEmbed(response) {
    response.keywords = response.keywords.replace(/<b>/g, '**').replace(/<\/b>/g, '**')

    response.text = response.text
      .replace(/<b>/g, '**')
      .replace(/<\/b>/g, '**')
      .replace(/<i>/g, '*')
      .replace(/<\/i>/g, '*')
      .replace(/\n/, '\n\n')
      .replace(/<img src="\/images\/1stpeoples-20.png" title="First Peoples">/, `${this.firstPeoplesEmoji}`)
      .replace(/<img src="\/images\/eaglewardens-20.png" title="Eagle Wardens">/, `${this.firstPeoplesEmoji}`)
      .replace(/<img src="\/images\/anarchists-20.png" title="Anarchists">/, `${this.anarchistsEmoji}`)
      .replace(/<img src="\/images\/righteousbandits-20.png" title="The 108 Righteous Bandits">/, `${this.anarchistsEmoji}`)
      .replace(/<img src="\/images\/lawdogs-20.png" title="Law Dogs">/, `${this.lawDogsEmoji}`)
      .replace(/<img src="\/images\/outlaws-20.png" title="Outlaws">/, `${this.outlawsEmoji}`)
      .replace(/<img src="\/images\/sloanegang-20.png" title="The Sloane Gang">/, `${this.outlawsEmoji}`)
      .replace(/<img src="\/images\/fourthring-20.png" title="The Fourth Ring">/, `${this.fearmongersEmoji}`)
      .replace(/<img src="\/images\/fearmongers-20.png" title="Fearmongers">/, `${this.fearmongersEmoji}`)
      .replace(/<img src="\/images\/entrepreneurs-20.png" title="Entrepreneurs">/, `${this.entrepreneursEmoji}`)

    response.flavor = response.flavor.replace(/<b>/g, '**').replace(/<\/b>/g, '**')

    let description = `${this.getRankAndSuit(response)}\n\n` +
      `${response.type}` +
      `${response.bullets != null ? ' • ' + response.shooter + ' ' + response.bullets : ''}` +
      `${response.influence != null ? ' • Influence ' + response.influence : ''}` +
      `${response.control != null ? ' • Control ' + response.control : ''}` +
      `${response.wealth != null ? ' • Wealth ' + response.wealth : ''}` +
      `${response.production != null ? ' • Production ' + response.production : ''}` +
      `${response.cost != null ? ' • Cost ' + response.cost : ''}` +
      `${response.upkeep != null ? ' • Upkeep ' + response.upkeep : ''}` +
      `${response.keywords ? '\n\n' + '**' + response.keywords + '**' : ''}` +
      '\n\n' + response.text +
      `${response.flavor ? '\n\n' + '*' + response.flavor + '*' : ''}`

    description += this.renderCardFooter(response);

    let embed = new MessageEmbed()
      .setTitle(response.title)
      .setURL(response.url)
      .setDescription(description)
      .setThumbnail(base_url + response.imagesrc)

    console.log(response);

    return embed;
  }

  renderCardFooter(response) {
    let faction = '';
    switch (response.gang_code) {
      case '1stpeoples':
        faction = this.firstPeoplesEmoji;
        break;
      case 'anarchists':
        faction = this.anarchistsEmoji;
        break;
      case 'entrepreneurs':
        faction = this.entrepreneursEmoji;
        break;
      case 'fearmongers':
        faction = this.fearmongersEmoji;
        break;
      case 'lawdogs':
        faction = this.lawDogsEmoji;
        break;
      case 'outlaws':
        faction = this.outlawsEmoji;
        break;
      case 'neutral':
        faction = this.drifterEmoji;
        break;
    }
    if (faction) {
      return `\n\n${faction} • ${response.pack_name} #${response.number}.`;
    }
    return `\n\n${response.pack_name} #${response.number}.`;
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
    return new Promise((resolve, reject) => {
      try {
        let match;
        const nameAndPackCode = extractNameAndPackCode(this.cardName);

        if (false === nameAndPackCode) {
          match = searchByName(makeKeyFromName(this.cardName), data.indices.names, data.cards);
        } else {
          match = searchByNameAndPack(
            makeKeyFromName(nameAndPackCode.name),
            makeKeyFromPackCode(nameAndPackCode.packCode),
            data.indices.packs,
            data.cards
          );
        }
        if (match) {
          resolve(match);
        } else {
          reject(`Nothing search results found for "${this.cardName}".`);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  embed() {
    return new Promise((resolve, reject) => {
      this.lookupCard().then(response => {
        let embed = this.errorResponse(response);

        if (response !== 'Nothing Found') {
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

TextResponse.prototype.middleware = [utm];

class ImageResponse extends TextResponse {
  makeEmbed(response) {
    //let parts = response.body.split('\n');
    return {
      title: response.title,
      url: response.url,
      image: {
        url: base_url + response.imagesrc
      }
    };
  }
}

class ErrorResponse extends TextResponse {}

module.exports = {TextResponse, ImageResponse, ErrorResponse};

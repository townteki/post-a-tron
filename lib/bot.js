const { Client, Intents } = require('discord.js');
let Messenger = require('./messenger');


class Servo {
  constructor(token,cardList) {
    this.token = token;
    this.cardList = cardList;
    this.client = this.makeClient(token);
  }

  makeClient(token,cardList) {
    console.log('servo client init');
    const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
    client.on('messageCreate', msg => {
      new Messenger(client, msg);
    });
    client.login(token);
    return client;
  }
}

module.exports = Servo;

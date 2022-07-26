# POST-A-TRON

POST-A-TRON is a Discord bot that will post the text or image of a [Doomtown](https://pineboxentertainment.com/doomtown-reloaded/) card to your text channels when a card name is referenced. 
This bot is a modified version of the excellent [Servo bot](https://github.com/scryfall/servo).

## Installation and configuration on Discord

You must have the _Manage Server_ permission to add this bot to your Discord server.

The bot will appear as a user and join your text channels. If your Discord server restricts users from chatting by default, 
you will also need to grant the bot a role that allows it to speak.

### Iconography

You **must** install the images found in the `emojis` directory to your server as custom emojis,
these are required for the bot to display factions correctly.

| Emoji Name           | File Location               |
|----------------------|-----------------------------|
| `:AN:`               | `emojis/AN.png`             |
| `:EN:`               | `emojis/EN.png`             |
| `:FM:`               | `emojis/FM.png`             |
| `:FP:`               | `emojis/FP.png`             |
| `:LD:`               | `emojis/LD.png`             |
| `:OL:`               | `emojis/OL.png`             |
| `:pinebox:`          | `emojis/pinebox.png`        |

## Usage

While chatting, surround a card names with brackets (`[[` and `]]`) and prepend with an optional token. 
The bot will print out the text of that card or its image.

| Command             | Function                                   |
|---------------------|--------------------------------------------|
| `[[!sun in yer eyes]]` | Show a text representation of "Sun in Yer Eyes". |
| `[[sun in yer eyes]]`   | Show a picture of "Sun in Yer Eyes".             |

You may also target a specific version of a card by appending the code of the expansion that the card was released with, separated by a `|` character.
For example, `[[sun in yer eyes|dtr]]` would retrieve "Sun in Yer Eyes" from the [original Base Set](https://dtdb.co/en/card/01113), 
whereas `[[sun in yer eyes|dt2]]` would pull up that card's version from the [Weird West Edition](https://dtdb.co/en/card/24221).

## Development

### Local deployment

Install dependencies by running `npm install`.

Then import the cards data by running `npm run import`. This will pull the entire card pool from
[DoomtownDB's](https://dtdb.co) public API, transform it, and save it `/data/cards.json`.

Start the application by running `DISCORD_TOKEN=XXXXX npm start`. Replace `XXXXXX` 
with your actual [Bot's token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-bot-s-token). 

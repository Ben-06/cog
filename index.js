// Require the necessary discord.js classes
const { Client, GatewayIntentBits, Message } = require('discord.js');
const { token, channel } = require('./config/secrets.json');
var game = null;
const Game = require('.src/Game.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
	console.log('Ready!');
});

// lauching a game
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (game !== null || commandName === 'guess') {
        game= new Game();
		await interaction.reply('** Quelle est cette carte ?** ');

        client.channels.cache.get(channel).send(game.newIndice());
	}
});

//catching response to a question
client.on('messageCreate', message => {
    if(game === null || message.author.bot) return;

    if(message.content.toLowerCase() === crd.name)
    {
        message.reply('Bravo, bonne réponse !!');
        game=false;
    }

});

client.login(token);
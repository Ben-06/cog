// Require the necessary discord.js classes
const { Client, GatewayIntentBits, Message } = require('discord.js');
const { token, channel } = require('./config/secrets.json');
const Card = require('./src/Card.js');
var crd;
var game = false;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
	console.log('Ready!');
});

// lauching a game
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'guess') {
        game=true;
		await interaction.reply('** Quelle est cette carte ?** ');
        crd = new Card();
        client.channels.cache.get(channel).send("** 1er indice : ** je fais partie de l'extension "+ crd.extension)
	}
});

//catching response to a question
client.on('messageCreate', message => {
    if(!game || message.author.bot) return;

    if(message.content.toLowerCase() === crd.name)
    {
        message.reply('Bravo, bonne réponse !!');
        game=false;
    }

});

client.login(token);
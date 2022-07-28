// Require the necessary discord.js classes
const { Client, GatewayIntentBits, EmbedBuilder  } = require('discord.js');
const { token, channel } = require('./config/secrets.json');
const Game = require('./src/Game');
var game = null;


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

//get game channel
const chan = client.channels.cache.get(channel);

client.once('ready', () => {
	console.log('Ready!');
});

// lauching a game
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (game !== null || commandName === 'guess') {
        game= new Game();
		await interaction.reply('1er tour : ** Quelle est cette carte ?** ');

        client.channels.cache.get(channel).send(game.newIndice());
	}
});

//catching response to a question
client.on('messageCreate', message => {
    if(game === null || game.turn === -1 || message.author.bot) return;

    if(game.checkResponse(message.content.toLowerCase()))
    {
        message.reply('Bravo, bonne réponse !!');
        game.goodResponse(message.author.username);
        
        if(game.turn === -1)
        {
            //end game

            // inside a command, event listener, etc.
            const scoresEmbed = {
                color: 0x0099ff,
                title: 'Classement final ',
                fields: game.getScores()
            };

           /* for (var key in game.scores) {
                scoresEmbed.addFields({ name: key, value: game.scores[key], inline: true });
            }    */    
            
            client.channels.cache.get(channel).send({ embeds: [scoresEmbed] });

        } else {
            //new turn
            client.channels.cache.get(channel).send(game.turn + 'e tour : ** Quelle est cette carte ?** ');
        }
        
    } else client.channels.cache.get(channel).send(game.newIndice());

});

client.login(token);

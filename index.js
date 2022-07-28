if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// Require the necessary discord.js classes
const { Client, GatewayIntentBits, EmbedBuilder  } = require('discord.js');
const channel = process.env.channel;
const {delay, turns} = require('./config/config.json');
const Game = require('./src/Game');
var game = null;


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });

client.once('ready', () => {
	console.log('Ready!');
});

// lauching a game
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'guess' && (game === null || game.turn === -1)) {
        game= new Game();
        const scoresEmbed = {
            color: 0x0099ff,
            title: 'Nouvelle partie ! ',
            fields: [
                {
                    name: "Essayez de deviner les cartes avec les indices que je vais vous donner",
                    value: "Moins vous avez besoin d'indices pour trouver, plus vous marquez de points. Attention, chaque mauvaise réponse réduira les points marqués si vous trouvez finalement la bonne !"
                },
                {
                    name: "La configuration de la partie est la suivante :",
                    value: "Tours : "+turns + " - " +"Délai : "+(delay/1000)+"s"
                },
                {
                    name: "pour répondre, placez un ! devant votre proposition",
                    value: "exemple : !parasite"
                }
            ]
        };
        
        client.channels.cache.get(channel).send({ embeds: [scoresEmbed] });

		setTimeout(newTurn, 1000);
	}
});

//tips loop managing for a given turn
function indiceLoop(turn, counter){
    //1st check if a game is currently playing and if the turn is still the same
    if(game != null && game.turn != -1  && game.turn == turn)
    {
        //if indice == -1, turn is over
        if(game.indice === -1){
            client.channels.cache.get(channel).send("Personne n'a trouvé, dommage ! La réponse était **"+game.crd.name+"**");
            game.goodResponse();
            
            //launch a new turn
            setTimeout(newTurn, delay);

        } else {
            const scoresEmbed = {
                color: 0x0099ff,
                fields: [
                    game.newIndice()
                ]
            };
            
            client.channels.cache.get(channel).send({ embeds: [scoresEmbed] });

            const currentTurn = game.turn;
            setTimeout(() => {
                indiceLoop(currentTurn, counter);           
            }, delay);
        }
    }
}

//manage to launch a new turn or to end the game if the max turns number has been reached
function newTurn() {
    if(game.turn === -1)
    {
        //end game
        const scoresEmbed = {
            color: 0x0099ff,
            title: 'Classement final ',
            fields: game.getScores()
        };
        
        client.channels.cache.get(channel).send({ embeds: [scoresEmbed] });

    } else {
        //new turn
        client.channels.cache.get(channel).send(game.turn + 'e tour : ** Quelle est cette carte ?** ');
        
        const currentTurn = game.turn;
        setTimeout(() => {
            indiceLoop(currentTurn, 1);           
        }, 1000);
    }
}

//catching response to a question
client.on('messageCreate', message => {
    if(game === null || game.turn === -1 || message.author.bot || message.content.substring(0,1) != "!") return;

    if(game.checkResponse(message.content.substring(1).toLowerCase(), message.author.username))
    {
        message.reply('Bravo, bonne réponse !!');
        
        //attribute & display earned points
        const points = game.goodResponse(message.author.username);
        client.channels.cache.get(channel).send('**'+message.author.username + '** remporte **'+points+'** points grâce à cette bonne réponse !');

        //launch a new turn
        setTimeout(newTurn, delay);
        
        
    } else message.react('👎');

});

client.login(process.env.TOKEN);

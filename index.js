if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Require the necessary discord.js classes
const { Client, GatewayIntentBits, AttachmentBuilder} = require('discord.js');
const channel = process.env.channel;
const {delay, turns} = require('./config/config.json');
const {extensions} = require('./config/types.json');
const Game = require('./src/Game');
var game = null;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });

//get game channel
const chan = client.channels.cache.get(channel);

client.once('ready', () => {
	console.log('Ready!');
});

// lauching a game
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName, options } = interaction;

    // retrieve potential options : extension, speed, duration
    
    let extension_param = options.data.find(obj => {
        return obj.name === "extension"
    });
    let speed_param = options.data.find(obj => {
    return obj.name === "vitesse"
    });
    let duration_param = options.data.find(obj => {
    return obj.name === "durée"
    });

    const extension = extension_param ? extension_param.value : null;
    const speed = speed_param ? speed_param.value : delay;
    const duration =duration_param ? duration_param.value : turns;
    
	if (commandName === 'guess' && (game === null || game.turn === -1)) {
        game= new Game(extension, speed, duration);
        await game.buildIndicesList();
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
                    value: (game.extension ? "Extension : "+extensions[game.extension]+ " - " : "") + "Tours : "+game.max_turn + " - " +"Délai : "+(game.speed/1000)+"s"
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
indiceLoop = async(turn) =>{
    //1st check if a game is currently playing and if the turn is still the same
    if(game != null && game.turn != -1  && game.turn == turn)
    {
        //check if turn is over
        if(game.end_turn){
            client.channels.cache.get(channel).send("Personne n'a trouvé, dommage ! La réponse était **"+game.crd.name+"**");
            var file = new AttachmentBuilder(game.crd.image, { name: `${game.crd.name}.png` });
            client.channels.cache.get(channel).send({ files: [file] });
            await game.goodResponse();
            
            //launch a new turn
            setTimeout(newTurn, game.speed);

        } else {
            
            client.channels.cache.get(channel).send(game.newIndice());

            const currentTurn = game.turn;
            setTimeout(() => {
                indiceLoop(currentTurn);           
            }, game.speed);
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
client.on('messageCreate', async(message) => {
    if(game === null || game.turn === -1 || message.author.bot || message.content.substring(0,1) != "!") return;

    if(game.checkResponse(message.content.substring(1).toLowerCase(), message.author.username))
    {
        message.reply('Bravo, bonne réponse !!');
        var file = new AttachmentBuilder(game.crd.image, { name: `${game.crd.name}.png` });
        client.channels.cache.get(channel).send({ files: [file] });
        
        //attribute & display earned points
        const points = await game.goodResponse(message.author.username);
        client.channels.cache.get(channel).send('** <@'+message.author.id+'>** remporte **'+points+'** points grâce à cette bonne réponse !');

        //launch a new turn
        setTimeout(newTurn, game.speed);
        
        
    } else message.react('👎');

});

client.login(process.env.TOKEN);

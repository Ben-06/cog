if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Require the necessary discord.js classes
const { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder} = require('discord.js');
const channel = process.env.channel;
const {delay, turns} = require('./config/config.json');
const {extensions} = require('./config/types.json');
const {cards} = require ('./config/cards.json');
const {abilities} = require ('./config/abilities.json');
const abilities_loc = abilities[process.env.BOT_LANG];
const Game = require('./src/Game');
const fs = require('fs');
var game = null;


function sansAccent(str) {
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];
    for (var i = 0; i < accent.length; i++) {
        str = str.replace(accent[i], noaccent[i]);
    }

    return str;
}


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });


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
        
        interaction.reply({ embeds: [scoresEmbed] });

		setTimeout(newTurn, 1000);
	}
    else if (commandName === 'add-faq') {
        if (!interaction.member.roles.cache.find(role => role.name === "Modérateur")) {
          if (!interaction.member.roles.cache.find(role => role.name === "Grand créateur")) return;
        };
    
        let msg_q  = options.data.find(obj => {
          return obj.name === "question"
        });
        let msg_a  = options.data.find(obj => {
          return obj.name === "réponse"
        });
        let is_IA  = options.data.find(obj => {
            return obj.name === "ia"
          });
    
        if(!msg_q || !msg_a) return;
    
        const faqChan = client.channels.cache.get(process.env.faq_chan);
        var question = msg_q.value;
        var answer = msg_a.value;
        const embed = new EmbedBuilder()
          .setTitle(question)
          .setDescription(answer)
          .setColor(is_IA && is_IA.value == 'oui' ? "0xE1DE0D" : "0x3482c6")
        faqChan.send({ embeds: [embed] });
        await interaction.reply("Section de FAQ ajoutée");
        return;
    }
    else if (commandName === 'card') {

        let msg  = options.data.find(obj => {
            return obj.name === "carte"
        });
        if(!msg) return;

        const cardToSearch = msg.value.toLocaleLowerCase();
        const search = cards.find(card => card[process.env.BOT_LANG] == cardToSearch);
        
        if (search === undefined) {
            await interaction.reply("Cette carte n'existe pas.");
            return;
        }
        try{
            var file = new AttachmentBuilder(`./card_img/${cardToSearch}.png`, { name: `${cardToSearch}.png` });
            await interaction.reply({ files: [file] });
        }
        catch(e){
            await interaction.reply('oups, impossible de trouver l\'image');
        }

    }
    else if (commandName === 'cs') {

        let msg  = options.data.find(obj => {
            return obj.name === "cs"
        });
        if(!msg) return;

        var abilityToSearch = msg.value.toLocaleLowerCase();
        abilityToSearch = sansAccent(abilityToSearch)
        var ability = abilities_loc.find(ability => sansAccent(ability.name.toLocaleLowerCase()) == abilityToSearch);
        if (ability === undefined) {
            await interaction.reply("Cette capacité n'existe pas.");
            return;
        }
        ability.name = sansAccent(ability.name);

        var re = / /gi;
        const cs_png = new AttachmentBuilder("./cs_img/" + ability.href);
        const CSEmbed = new EmbedBuilder()
            .setTitle(ability.name)
            .setDescription(ability.description)
            .setColor("0x3482c6")
            .setThumbnail("attachment://" + ability.href)
        await interaction.reply({ embeds: [CSEmbed], files: [cs_png] });
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
            
            if(fs.existsSync(game.crd.image)){
                var file = new AttachmentBuilder(game.crd.image, { name: `${game.crd.name}.png` });
                client.channels.cache.get(channel).send({ files: [file] });
            }
        
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
        if(fs.existsSync(game.crd.image)){
            var file = new AttachmentBuilder(game.crd.image, { name: `${game.crd.name}.png` });
            client.channels.cache.get(channel).send({ files: [file] });
        }

        //attribute & display earned points
        const points = await game.goodResponse(message.author.username);
        client.channels.cache.get(channel).send('** <@'+message.author.id+'>** remporte **'+points+'** points grâce à cette bonne réponse !');

        //launch a new turn
        setTimeout(newTurn, game.speed);
        
        
    } else message.react('👎');

});

client.login(process.env.TOKEN);

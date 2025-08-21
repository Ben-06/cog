if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const logger = require('./utils/logger');


const path = require('path');

const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(path.join(commandsPath, file));
        if (command.name && typeof command.execute === 'function') {
            commands.set(command.name, command);
        }
    }
});


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });
// Connexion du bot Discord
client.login(process.env.TOKEN);


client.once('ready', () => {
	logger.info('Ready!');
});

// lauching a game
client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isChatInputCommand()) return;
        const command = commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
    } catch (error) {
        logger.error(`[interactionCreate] Erreur lors de l'exécution de la commande: ${error && error.stack ? error.stack : error}`);
        
        // Tentative de réponse d'urgence si l'interaction n'a pas encore été répondue
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Une erreur s\'est produite lors de l\'exécution de cette commande.', ephemeral: true });
            }
        } catch (replyError) {
            logger.error(`[interactionCreate] Impossible de répondre à l'interaction: ${replyError}`);
        }
    }
});

// Gestion des réponses des joueurs pour le mode guess
const guessCommand = commands.get('guess');
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!guessCommand) return;
  const game = guessCommand.getGameInstance && guessCommand.getGameInstance();
  if (!game || game.turn === -1 || !game.gameActive) return;
  if (!message.content.startsWith('!')) return;
  const response = message.content.slice(1).trim();
  if (!response) return;
  if (game.end_turn) return;

  if (game.checkResponse(response, message.author.id)) {
    await game.handleGoodResponse(message.author.id, message.author.id);
  } else {
    await message.react('❌');
  }
});

process.on('uncaughtException', (err) => {
  logger.error(`[uncaughtException] ${err && err.stack ? err.stack : err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`[unhandledRejection] ${reason && reason.stack ? reason.stack : reason}`);
});

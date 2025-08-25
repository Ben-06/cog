// commands/guess.js
const Game = require('../src/Game');
const logger = require('../utils/logger');
const ConfigService = require('../services/ConfigService');
const { extensions } = require('../assets/types.json');

let game = null;

module.exports = {
  name: 'guess',
  description: 'Lance une nouvelle partie de devinette de cartes',
  async execute(interaction) {
    // Vérifier que la commande est exécutée dans le bon canal
    const allowedChannelId = process.env.CHANNEL;
    if (!allowedChannelId) {
      logger.error('[guess] Variable d\'environnement CHANNEL non définie');
      await interaction.reply({ 
        content: 'Configuration du canal non définie. Contactez un administrateur.', 
        ephemeral: true 
      });
      return;
    }
    
    if (interaction.channelId !== allowedChannelId) {
      await interaction.reply({ 
        content: 'Cette commande ne peut être utilisée que dans le canal de jeu désigné.', 
        ephemeral: true 
      });
      return;
    }

    // Récupération des options directement ici
    const delay = ConfigService.getValue('delay');
    const turns = ConfigService.getValue('turns');
    let extension = interaction.options.getString('extension');
    let speed = parseInt(interaction.options.getString('vitesse'),10) || delay;
    let duration = parseInt(interaction.options.getString('durée'),10) || turns;

    if (game && game.turn !== -1) {
      logger.info('[guess] Partie déjà en cours.');
      await interaction.reply('Une partie est déjà en cours.');
      return;
    }
    
    game = new Game(extension, speed, duration);

    const scoresEmbed = {
      color: 0x0099ff,
      title: 'Nouvelle partie !',
      fields: [
        {
          name: "Essayez de deviner les cartes avec les indices que je vais vous donner",
          value: "Moins vous avez besoin d'indices pour trouver, plus vous marquez de points. Attention, chaque mauvaise réponse réduira les points marqués si vous trouvez finalement la bonne !"
        },
        {
          name: "Configuration :",
          value: (game.extension ? "Extension : " + extensions[game.extension] + " - " : "") + "Tours : " + game.max_turn + " - " + "Délai : " + (game.speed / 1000) + "s"
        },
        {
          name: "Pour répondre, placez un ! devant votre proposition",
          value: "exemple : !parasite"
        }
      ]
    };

    logger.info('[guess] Nouvelle partie lancée.');
    await interaction.reply({ embeds: [scoresEmbed] });

    // Message de pré-démarrage
    await interaction.followUp('Démarrage de la partie dans 15s !');

    // Attendre 15 secondes avant de démarrer la partie
    setTimeout(async () => {
      await game.startGame(interaction.channel);
    }, 15000);
  },
  getGameInstance() {
    return game;
  }
};

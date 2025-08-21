// commands/card.js
const CardService = require('../services/CardService');
const { AttachmentBuilder } = require('discord.js');
const WordingService = require('../services/WordingService');
const logger = require('../utils/logger');

module.exports = {
  name: 'card',
  description: 'Affiche l\'image d\'une carte',
  async execute(interaction) {
    try {
      let msg = interaction.options.getString('carte') || interaction.options.getString('card');
      if (!msg) return;
      
      let cardToSearch = msg.toLocaleLowerCase();
      let searchFR = CardService.getCardByName(cardToSearch, 'FR');
      let searchEN = CardService.getCardByName(cardToSearch, 'EN');
      
      // Carte non trouvée
      if (!searchFR && !searchEN) {
        const responseMsg = WordingService.getWording('UNKNOWN_CARD', 'FR') || 'Carte inconnue.';
        logger.info(`[card] Réponse: ${responseMsg}`);
        await interaction.reply(responseMsg);
        return;
      }

      // Carte trouvée
      const card = searchFR || searchEN;
      const lang = searchFR ? 'FR' : 'EN';
      const fileName = card[lang] ? `${card[lang].replace(/\s/g, '-').toLowerCase()}.png` : null;
      
      if (!fileName) {
        const responseMsg = WordingService.getWording('IMG_NOT_FOUND', 'FR') || 'Image non trouvée.';
        logger.info(`[card] Réponse: ${responseMsg}`);
        await interaction.reply(responseMsg);
        return;
      }

      // Envoyer l'image
      const file = new AttachmentBuilder(`./assets/card_img/${lang}/${fileName}`, { name: `${card[lang]}.png` });
      logger.info(`[card] Réponse: fichier ${fileName}`);
      await interaction.reply({ files: [file] });
      
    } catch (error) {
      logger.error(`[card] Erreur: ${error && error.stack ? error.stack : error}`);
      
      // Seulement essayer de répondre si pas encore fait
      if (!interaction.replied && !interaction.deferred) {
        try {
          const responseMsg = WordingService.getWording('IMG_NOT_FOUND', 'FR') || 'Une erreur s\'est produite.';
          await interaction.reply(responseMsg);
        } catch (replyError) {
          logger.error(`[card] Impossible de répondre à l'interaction: ${replyError}`);
        }
      }
    }
  }
};

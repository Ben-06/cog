// commands/cs.js
const AbilityService = require('../services/AbilityService');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const WordingService = require('../services/WordingService');
const logger = require('../utils/logger');

module.exports = {
  name: 'cs',
  description: 'Affiche la CS ou SA demandée',
  async execute(interaction) {
    let msg = interaction.options.getString('cs') || interaction.options.getString('sa');
    logger.info(`[cs] Demande reçue: ${msg}`);
    if (!msg) return;
    let abilityToSearch = msg.toLocaleLowerCase();
    let ability = AbilityService.getAbilityByName(abilityToSearch, 'FR');
    logger.debug(`[cs] Résultat recherche: ${JSON.stringify(ability)}`);
    if (!ability) {
      const replyMsg = WordingService.getWording('UNKNOWN_CS', 'FR') || 'Capacité spéciale inconnue.';
      logger.info(`[cs] Réponse: ${replyMsg}`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(replyMsg);
      }
      return;
    }
    try {
      if (!ability.href) {
        const replyMsg = WordingService.getWording('IMG_NOT_FOUND', 'FR') || 'Image non trouvée.';
        logger.info(`[cs] Réponse: ${replyMsg}`);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply(replyMsg);
        }
        return;
      }
      const cs_png = new AttachmentBuilder(`./assets/cs_img/${ability.href}`);
      const CSEmbed = new EmbedBuilder()
        .setTitle(ability.name || 'CS')
        .setDescription(ability.description || 'Aucune description.')
        .setColor(0x3482c6)
        .setThumbnail(`attachment://${ability.href}`);
      logger.info(`[cs] Réponse: embed + fichier ${ability.href}`);
      await interaction.reply({ embeds: [CSEmbed], files: [cs_png] });
      return;
    } catch (e) {
      const replyMsg = WordingService.getWording('IMG_NOT_FOUND', 'FR') || 'Image non trouvée.';
      logger.error(`[cs] Erreur: ${e && e.stack ? e.stack : e}`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(replyMsg);
      }
      return;
    }
  }
};

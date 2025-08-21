// commands/add-faq.js
const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: 'add-faq',
  description: 'Ajoute une question/réponse à la FAQ',
  async execute(interaction) {
    if (!interaction.member.roles.cache.find(role => role.name === "Modérateur") &&
        !interaction.member.roles.cache.find(role => role.name === "Grand créateur")) {
      logger.info('[add-faq] Refusé : permissions insuffisantes.');
      return;
    }
    let msg_q = interaction.options.getString('question');
    let msg_a = interaction.options.getString('réponse');
    let is_IA = interaction.options.getString('ia');
    if (!msg_q || !msg_a) {
      logger.info('[add-faq] Question ou réponse manquante.');
      return;
    }
    const faqChan = interaction.client.channels.cache.get(process.env.faq_chan);
    const embed = new EmbedBuilder()
      .setTitle(msg_q)
      .setDescription(msg_a)
      .setColor(is_IA === 'oui' ? "0xE1DE0D" : "0x3482c6");
    faqChan.send({ embeds: [embed] });
    logger.info(`[add-faq] FAQ ajoutée : ${msg_q}`);
    await interaction.reply("Section de FAQ ajoutée");
    return;
  }
};

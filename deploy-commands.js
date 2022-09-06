if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const commands = [
	new SlashCommandBuilder().setName('guess').setDescription('Essayez de deviner les cartes de Clash of Decks !')
	.addStringOption(option =>
	option.setName('extension')
		.setDescription('limiter la partie à une extension donnée')
		.addChoices(
			{ name: "Pack d'initiation", value: '0' },
			{ name: 'Félonie', value: '1' },
			{ name: 'Submersion', value: '2' },
			{ name: 'Ebrèchement', value: '3' },
			{ name: 'Déliquescence', value: '4' },
			{ name: 'Insaisissable', value: '5' },
			{ name: 'Résistance', value: '6' }
	))
	.addStringOption(option =>
		option.setName('vitesse')
			.setDescription('vitesse de révélation des indices (5/8/12 sec)')
			.addChoices(
				{ name: "lente", value: '20000' },
				{ name: 'normale', value: '10000' },
				{ name: 'rapide', value: process.env.NODE_ENV !== 'production' ? '2500' : '7000' }
	))
	.addStringOption(option =>
		option.setName('durée')
			.setDescription('Durée de la partie (3/5/8)')
			.addChoices(
				{ name: "courte", value: '3' },
				{ name: 'normale', value: '5' },
				{ name: 'longue', value: '8' }
	)),
	new SlashCommandBuilder().setName('add-faq').setDescription('Ajouter une question à la FAQ')
    .addStringOption(option =>
        option.setName('question')
        .setDescription('question à ajouter à la FAQ')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('réponse')
        .setDescription('réponse à la question')
        .setRequired(true)
    ),
    new SlashCommandBuilder().setName('card').setDescription('Afficher une carte')
    .addStringOption(option =>
        option.setName('carte')
        .setDescription('carte à afficher')
        .setRequired(true)
    ),
    new SlashCommandBuilder().setName('cs').setDescription('Afficher une Capacité Spéciale')
    .addStringOption(option =>
        option.setName('cs')
        .setDescription('capacité spéciale à afficher')
        .setRequired(true)
    )
	]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
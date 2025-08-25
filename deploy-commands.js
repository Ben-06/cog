if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const logger = require('./utils/logger');
const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const commands = [];

const botLang = process.env.BOT_LANG || 'FR';
logger.info(`BOT_LANG: ${process.env.BOT_LANG} (using: ${botLang})`);

if(botLang === 'FR'){
	commands.push(
		new SlashCommandBuilder().setName('guess').setDescription('Essayez de deviner les cartes de Clash of Decks !')
		.addStringOption(option =>
		option.setName('extension')
			.setDescription('limiter la partie à une extension donnée')
			.addChoices(
				{ name: "Pack d'initiation", value: '00' },
				{ name: 'Félonie', value: '01' },
				{ name: 'Submersion', value: '02' },
				{ name: 'Ebrèchement', value: '03' },
				{ name: 'Déliquescence', value: '04' },
				{ name: 'Insaisissable', value: '05' },
				{ name: 'Résistance', value: '06' },
				{ name: 'Sournoiserie', value: '11' },
				{ name: 'Belligérance', value: '12' },
				{ name: 'Enlisement', value: '13' },
				{ name: 'Dissension', value: '14' }
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
		)
		.addStringOption(option =>
			option.setName('ia')
			.setDescription('question spécifique IA ? [oui,vide]')
			.setRequired(false)
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
		));
	commands.map(command => command.toJSON());
} else if(botLang === 'EN'){
	commands.push(
		new SlashCommandBuilder().setName('guess').setDescription('Try to guees Clash of Decks cards!')
		.addStringOption(option =>
		option.setName('extension')
			.setDescription('limit game to one specific extension')
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
			option.setName('speed')
				.setDescription('delay between tips (5/8/12 sec)')
				.addChoices(
					{ name: "slow", value: '20000' },
					{ name: 'normal', value: '10000' },
					{ name: 'quick', value: process.env.NODE_ENV !== 'production' ? '2500' : '7000' }
		))
		.addStringOption(option =>
			option.setName('duration')
				.setDescription('Durée de la partie (3/5/8)')
				.addChoices(
					{ name: "short", value: '3' },
					{ name: 'normal', value: '5' },
					{ name: 'longe', value: '8' }
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
		)
		.addStringOption(option =>
			option.setName('ia')
			.setDescription('question spécifique IA ? [oui,vide]')
			.setRequired(false)
		),
		new SlashCommandBuilder().setName('card').setDescription('Display card')
		.addStringOption(option =>
			option.setName('carte')
			.setDescription('card to display')
			.setRequired(true)
		),
		new SlashCommandBuilder().setName('sa').setDescription('Display a Special Ability')
		.addStringOption(option =>
			option.setName('sa')
			.setDescription('ability to display')
			.setRequired(true)
		));
	commands.map(command => command.toJSON());
}


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

logger.info(`Deploying commands with:`);
logger.info(`- clientId: ${process.env.clientId}`);
logger.info(`- guildId: ${process.env.guildId}`);
logger.info(`- TOKEN exists: ${!!process.env.TOKEN}`);
logger.info(`- TOKEN starts with: ${process.env.TOKEN ? process.env.TOKEN.substring(0, 10) + '...' : 'undefined'}`);
logger.info(`- Commands count: ${commands.length}`);

// Try guild commands first, fallback to global if authorization fails
rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands })
	.then(() => logger.info('✅ Successfully registered guild commands.'))
	.catch(err => {
		logger.error('❌ Error deploying guild commands:', err);
		if (err.code === 20012) {
			logger.error('❌ Authorization error - Check:');
			logger.error('  1. Bot token is correct');
			logger.error('  2. Bot is invited to the server with applications.commands scope');
			logger.error('  3. clientId matches your Discord application ID');
			logger.error('  4. guildId matches your Discord server ID');
			
			logger.info('🔄 Trying global commands as fallback...');
			return rest.put(Routes.applicationCommands(process.env.clientId), { body: commands })
				.then(() => logger.info('✅ Successfully registered global commands (may take up to 1 hour to appear).'))
				.catch(globalErr => logger.error('❌ Global commands also failed:', globalErr));
		}
	});
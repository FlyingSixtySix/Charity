const Discord = require('discord.js');

module.exports = {
	name: 'color',
	description: 'Preview a hex color!',
	aliases: [],
	args: true,
	usage: '<hex value>',
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	execute(message) {
		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Color Preview!')
			.setDescription('Coming soon!');

		message.channel.send(embed);
	},
};
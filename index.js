require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');

const pxls = require('./src/pxls');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(`pxls.space | ${process.env.BOT_PREFIX}help`, { type: 'WATCHING' });
	pxls.init();
});

client.on('message', (message) => {
	if (!message.content.startsWith(process.env.BOT_PREFIX) || message.author.bot) return;

	const args = message.content.slice(process.env.BOT_PREFIX.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.channel.send(':x: You can not do this!');
		}
	}

	if (command.args && !args.length) {
		let reply = ':x: You didn\'t provide any arguments!';

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${process.env.BOT_PREFIX}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.channel.send(`:x: Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${process.env.BOT_PREFIX}${command.name}\` command.`);
		}
	} else {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.channel.send(':x: There was an error trying to execute that command!');
	}
});

client.login(process.env.BOT_TOKEN);

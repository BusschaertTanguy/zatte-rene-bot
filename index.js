const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const {
	joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus,
} = require('@discordjs/voice');

dotenv.config();

const environment = process.env.NODE_ENV;

if (environment !== 'production') {
	dotenv.config({ override: true });
}

const token = process.env.DISCORD_TOKEN;
const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES];

const client = new Client({
	intents,
});

client.once('ready', () => {
	console.log('Bot is ready');
});

client.on('messageCreate', ({ content, guild, member }) => {
	if (!content.startsWith('!rene')) {
		return;
	}

	const guildId = guild.id;
	const channelId = member.voice?.channel?.id;
	const adapterCreator = guild.voiceAdapterCreator;

	if (!channelId) {
		console.log('Member should join a channel.');
		return;
	}

	const soundDirectory = path.join(__dirname, 'sounds');

	fs.readdir(soundDirectory, (error, files) => {
		if (error) {
			console.log(error.message);
			return;
		}

		const amountOfFiles = files.length;
		const randomFileIndex = Math.floor(Math.random() * amountOfFiles);
		const randomFile = files[randomFileIndex];

		if (!randomFile) {
			console.log(`No file found with index: ${randomFileIndex}`);
			return;
		}

		const randomFilePath = path.join(soundDirectory, randomFile);

		console.log(`File: ${randomFilePath} selected`);

		const resource = createAudioResource(randomFilePath);
		const audioPlayer = createAudioPlayer();
		const connection = joinVoiceChannel({
			guildId,
			channelId,
			adapterCreator,
		});

		const subscription = connection.subscribe(audioPlayer);

		audioPlayer.on('stateChange', ((oldState, newState) => {
			console.log(`audio player state change: OLD: ${oldState.status}, NEW: ${newState.status}`);
			if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle) {
				console.log('leaving channel');
				audioPlayer.stop();
				subscription.unsubscribe();
				connection.destroy();
			}
		}));

		audioPlayer.play(resource);
	});
});

client.login(token);
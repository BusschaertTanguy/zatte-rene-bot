const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

if (process.env.NODE_ENV !== 'production') {
	dotenv.config({ override: true });
}

const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES];

const client = new Client({
	intents,
});

client.on('messageCreate', ({ content, guild, member }) => {
	if (!content.startsWith('!rene')) {
		return;
	}

	const guildId = guild.id;
	const channelId = member.voice?.channel?.id;
	const adapterCreator = guild.voiceAdapterCreator;

	if (!channelId) {
		return;
	}

	const soundDirectory = path.join(__dirname, 'sounds');

	fs.readdir(soundDirectory, (error, files) => {
		if (error) {
			return;
		}

		const amountOfFiles = files.length;
		const randomFileIndex = Math.floor(Math.random() * amountOfFiles);
		const randomFile = files[randomFileIndex];

		if (!randomFile) {
			return;
		}

		const randomFilePath = path.join(soundDirectory, randomFile);
		const resource = createAudioResource(randomFilePath);
		const audioPlayer = createAudioPlayer();

		const connection = joinVoiceChannel({
			guildId,
			channelId,
			adapterCreator,
		});

		const subscription = connection.subscribe(audioPlayer);

		audioPlayer.on('stateChange', ((oldState, newState) => {
			if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle) {
				audioPlayer.stop();
				subscription.unsubscribe();
				connection.destroy();
			}
		}));

		audioPlayer.play(resource);
	});
});

client.login(process.env.DISCORD_TOKEN);
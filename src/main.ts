import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { logVoiceChannelMigrations } from './audit/voice';
import logger from './logger';

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if(!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    throw new Error("Missing enviroment variables!");
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID
};

const client = new Client({ intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildVoiceStates"] });
client.on("ready", () => console.log("Discord bot is ready!"));

client.on("voiceStateUpdate", (oldState, newState) => {
    logVoiceChannelMigrations(oldState, newState);
});

client.login(config.DISCORD_TOKEN);
logger.info("Кво става!");
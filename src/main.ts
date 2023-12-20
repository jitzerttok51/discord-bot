#!/bin/env node

import { Client, Guild, OAuth2Guild } from 'discord.js';
import dotenv from 'dotenv';
import { logVoiceChannelMigrations } from './audit/voice';
import logger from './logger';
import { commands, deployCommands } from './commands/deploy';

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, WORKSPACE, VERSION } = process.env;

if(!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    throw new Error("Missing enviroment variables!");
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    WORKSPACE: WORKSPACE ? WORKSPACE : "./",
    VERSION: VERSION ? VERSION : "1.0.0"
};

const client = new Client({ intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildVoiceStates"] });
client.on("ready", async () => {
    logger.info(`Discord bot version ${config.VERSION} is ready!`);
    let guilds = await client.guilds.fetch();
    guilds.forEach(async (guild: OAuth2Guild) => {
        await deployCommands(guild, client.rest);
    });
});

client.on("voiceStateUpdate", (oldState, newState) => {
    logVoiceChannelMigrations(oldState, newState);
});

client.on("guildCreate", async (guild) => {
    await deployCommands(guild, client.rest);
});

client.on("interactionCreate", async (interaction) => {
    if(!interaction.isCommand()) {
        return;
    }

    const { commandName } = interaction;

    const command = commands[commandName as keyof typeof commands];
    if(command) {
        await command.execute(interaction);
    }
});

client.login(config.DISCORD_TOKEN);
logger.info("Кво става!");

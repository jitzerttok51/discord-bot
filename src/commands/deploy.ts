import { BaseGuild, REST, Routes } from "discord.js";
import { config } from "../main";
import logger from "../logger";
import version from "./version";

const log = logger;
export const commands = {
    version
};

export async function deployCommands(guild: BaseGuild, rest: REST) {
    try {
        //const rest = new REST().setToken(config.DISCORD_TOKEN);
        log.info(`Started refreshing application (/) commands for ${guild.name}. `);

        await rest.put(
            Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guild.id),
            {
                body: Object.values(commands).map(cmd => cmd.data)
            }
        );
        log.info(`Successfully refreshed application (/) commands for ${guild.name}.`);
    } catch (e) {
        log.error(`Error refreshing application (/) commands for ${guild.name}.`, e);
    }
}

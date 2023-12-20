import { SlashCommandBuilder } from "discord.js";
import Command from "../models/Command"
import { config } from "../main";


const version: Command = {
    data: new SlashCommandBuilder()
        .setName("version")
        .setDescription("Prints the bot's version"),
    
    execute: async interaction => {
        return interaction.reply(`Bot version: ${config.VERSION}`);
    }
}

export default version;

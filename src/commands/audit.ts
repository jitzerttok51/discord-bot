import { CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import Command from "../models/Command";
import logger, { auditLogFile } from "../logger";
import fs from 'fs';

interface AuditEntry {
    level: string
    message: string
    timestamp: string
}

const audit: Command = {
    data: new SlashCommandBuilder()
    .setName("audit")
    .setDescription("Prints audit information")
    .addSubcommand(new SlashCommandSubcommandBuilder().setName("voice").setDescription("Voice channel audit")),

    execute: async (interaction: CommandInteraction) => {
        if(!interaction.isChatInputCommand()) {
            return interaction.reply("This command should not be called without the subcommand part");
        }
        let command = interaction.options.getSubcommand();
        if(command === "voice") {
            await fs.readFile(auditLogFile, {encoding: 'utf-8'}, (err, data) => {
                if(!err) {
                    let entries = data.split("\n")
                        .filter(raw => raw.trim().length > 0)
                        .map(raw => JSON.parse(raw) as AuditEntry)
                        .map(entry=> `[${formatDateTime(entry.timestamp)}] ${entry.message}`)
                        .join("\n");
                    return interaction.reply(entries);
                } else {
                    logger.error(err);
                    return interaction.reply(`Voice subcommand ${err.message}`);
                }
            });
        } else {
            return interaction.reply(`Invalid subcommand ${command}`);
        }
    }
} 

function formatDateTime(raw: string) {
    let date = new Date(raw);
    // Ensure date is a valid Date object
    if (!(date instanceof Date)) {
      return "Invalid Date";
    }
  
    // Get individual components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    // Construct the formatted string
    const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  
    return formattedDateTime;
  }

export default audit;

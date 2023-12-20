import { CommandInteraction, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandSubcommandBuilder } from "discord.js";
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
    .addSubcommand(new SlashCommandSubcommandBuilder()
    .setName("voice")
    .setDescription("Voice channel audit")
    .addIntegerOption(new SlashCommandIntegerOption().setName("days").setDescription("Days to filter defaults to today"))
    ),

    execute: async (interaction: CommandInteraction) => {
        if(!interaction.isChatInputCommand()) {
            return interaction.reply("This command should not be called without the subcommand part");
        }
        let command = interaction.options.getSubcommand();
        if(command === "voice") {
            await interaction.deferReply();

            let rawDays = interaction.options.getInteger("days");
            let days: number = rawDays ? rawDays : 0;
            logger.info(`File ${auditLogFile}`)
            await fs.readFile(auditLogFile, {encoding: 'utf-8'}, async (err, data) => {
                if(!err) {
                    let entries = data.split("\n")
                        .map(raw => raw.trim())
                        .filter(raw => raw.length > 0)
                        .map(raw => {
                            return JSON.parse(raw) as AuditEntry
                        })
                        .filter(e=> filterByDays(e.timestamp, days))
                        .map(entry=> `[${formatDateTime(entry.timestamp)}] ${entry.message}`);
                    let groups = groupEntires(entries);
                    if(groups.length === 0 || groups[0].length === 0) {
                        await interaction.followUp("No events");
                    } else {
                        for(let group of groups) {
                            await interaction.followUp(group.join("\n"));
                        }
                    }
                    return interaction.followUp(`Found ${entries.length} entries`);
                } else {
                    logger.error(err);
                    return interaction.followUp(`Voice subcommand ${err.message}`);
                }
            });
        } else {
            return interaction.reply(`Invalid subcommand ${command}`);
        }
    }
}

function groupEntires(entries: string[]) {
    return entries.reduce((acc, value) => {
        let x = acc.pop();
        x = x ? x : [];
        if(x.length >= 10) {
            acc.push(x);
            x = [];
        }
        x.push(value);
        acc.push(x);
        return acc;
    }, [[]] as string[][]);
}

function filterByDays(raw: string, days: number) {
    let date = new Date(raw);
    let from = new Date(new Date().setDate(new Date().getDate() - (days)));
    from.setHours(0); from.setMinutes(0); from.setSeconds(0); from.setMilliseconds(0);
    let to = new Date(new Date().setDate(new Date().getDate() - days + 1));
    to.setHours(0); to.setMinutes(0); to.setSeconds(0); to.setMilliseconds(0);
    return date >= from && date <= to;
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

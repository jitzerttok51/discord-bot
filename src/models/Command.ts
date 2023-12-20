import { CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export default interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder,
    execute: (interaction: CommandInteraction) => void
}

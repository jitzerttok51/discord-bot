import { VoiceState } from 'discord.js'
import logger, { audit } from '../logger';

const log = logger;
const auditLog = audit("voice");

export function logVoiceChannelMigrations(oldState: VoiceState, newState: VoiceState) {
    let user = newState.member?.nickname || newState.member?.user.displayName;
    let name = newState.member?.user.displayName;
    let oldChannel = oldState.channel?.name;
    let newChannel = newState.channel?.name;
    if(oldState.channelId == null) {
        auditLog.log('audit', `[Voice] ${user} (${name}) entered channel ${newChannel}`);
    } else if (newState.channelId == null) {
        auditLog.log('audit', `[Voice] ${user} (${name}) left channel ${oldChannel}`);
    } else if (oldState.channelId != newState.channelId) {
        auditLog.log('audit', `[Voice] ${user} (${name}) switched channel from ${oldChannel} to ${newChannel}`);
    }
}
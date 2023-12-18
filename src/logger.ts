// import pino from 'pino'

// const dest = (pino as any).extreme();
// const logger = pino(dest);
// setInterval(()=>logger.flush()).unref();
// export default logger;

import { levels } from 'pino';
import winston from 'winston';
import {join} from 'path'
import dotenv from 'dotenv';
import { config } from './main';

const {cli, timestamp, combine, json, printf, colorize, align} = winston.format;

const filterEvents = winston.format((info, opts)=> info.level === 'audit' ? info : false);

const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    audit: 3,
    info: 4,
    debug: 5,
};  

dotenv.config();

let WORKSPACE = process.env.WORKSPACE
WORKSPACE = WORKSPACE ? WORKSPACE : "./"
console.log(join(WORKSPACE, 'logs/app.log'));
const logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp(), 
        align(),
        printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)),
    transports: [
        new winston.transports.Console({
            format: combine(
                timestamp(), 
                align(),
                printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)),
        }),
        new winston.transports.File({
            format: combine(
                timestamp(), 
                align(),
                printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)),
            filename: join(WORKSPACE, 'logs/app.log'),
        }),
        new winston.transports.File({
            format: combine(
                filterEvents(),
                json()
            ),
            filename: join(WORKSPACE, 'logs/audit.log'),
        }),
    ],
});

export const audit = (type: string) => logger.child({event: type});
export default logger;
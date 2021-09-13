import {Constants} from "./Constants";
import { configInfo } from "./ConfigInfo";
const winston = require('winston')

const options = {
  file: {
    level: 'error',
    filename: Constants.LOG_FILE_DIR + '/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

export const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File(options.file),
  ],
  exitOnError: false
})

if (configInfo.config.environment !== Constants.Environment.PRODUCTION) {
  logger.add(new winston.transports.Console(options.console));
}


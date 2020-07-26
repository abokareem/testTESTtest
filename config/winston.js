const appRoot = require('app-root-path');
const winston = require('winston');

const options = {
    file: {
        level: 'debug',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'info',
        handleExceptions: true,
        json: true,
        colorize: true,
    },
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.File({ filename: `${appRoot}/logs/error.log`, level: 'error' }),
        new winston.transports.Console(options.console),
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
    // eslint-disable-next-line no-unused-vars
    write: (message, _encoding) => {
        logger.info(message);
    },
};

module.exports = logger;

import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            maxsize: 50 * 1024 * 1024, // 50MB
            maxFiles: 5,
            tailable: true
        }),
        new winston.transports.File({
            filename: 'combined.log',
            maxsize: 50 * 1024 * 1024, // 50MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

export default logger; 
var winston = require('winston')
var expressWinston = require('express-winston')
require('winston-daily-rotate-file')

var self = module.exports = {

  logger: new winston.Logger({
    level: 'verbose',
    transports: [
      new winston.transports.DailyRotateFile({
        name: 'action-log',
        filename: './logs/actions',
        datePattern: 'yyyy-MM-dd.',
        prepend: true,
        level: 'info'      
      }),
      new winston.transports.DailyRotateFile({
          name: 'err-log',
          filename: './logs/err',
          datePattern: 'yyyy-MM-dd.',
          prepend: true,
          level: 'error'
      }),
    ]
  }),

  expressConsoleLogger: expressWinston.logger({
    transports: [
      new winston.transports.Console({
      })
    ],
    meta: false,
    expressFormat: true,
    colorize: false
  }),

  expressFileLogger: expressWinston.logger({
    transports: [
      new winston.transports.DailyRotateFile({
        name: 'request-log',
        filename: './logs/requests',
        datePattern: 'yyyy-MM-dd.',
        prepend: true
      })
    ],
    meta: true,
    json: true,
    expressFormat: false,
    colorize: false
  }),
}

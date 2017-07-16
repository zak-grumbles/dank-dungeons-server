var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var fs = require('fs')
var logger = require('./utils/logger')
var expressWinston = require('express-winston') // request logging

require('./db/dbUtils').initDB()

var app = express()

//Body parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//logging
var logDir = path.join(__dirname, './logs')

fs.existsSync(logDir) || fs.mkdirSync(logDir)

app.use(logger.expressConsoleLogger)
app.use(logger.expressFileLogger)

//routing
app.use('/', require('./routes'))

//start
module.exports = app

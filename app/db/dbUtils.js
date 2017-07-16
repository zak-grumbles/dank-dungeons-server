/**
 * Collection of utility functions
 */
var logger = require('../utils/logger').logger

var mongoose = require('mongoose')
var config = require('../config.json')

var self = module.exports = {

    /**
     * Connects to the database
     */
    initDB: function(){
      mongoose.Promise = require('bluebird')

      var connString = 'mongodb://' + config.db.host + '/' + config.db.database 

      mongoose.connect(connString)

      var db = mongoose.connection
      db.on('error', console.error.bind(console, 'connection error:'))
      db.once('open', function(){
        console.log('Successfully connected...')
      })
    },

    handleError: function(err, callback){
      logger.error(err.toString())
      callback(null, err.toString())
    }
}

process.on('SIGINT', function(){
  console.log("Interrupt received. Exiting...");
  mongoose.disconnect();
})

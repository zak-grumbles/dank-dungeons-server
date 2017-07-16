var Leaderboard = require('./models/leaderboardModel')
var lvlCtrl = require('./levelController')
var usrCtrl = require('./userController')
var errors = require('../error')
var Promise = require('bluebird')
var mongoose = require('mongoose')

var self = module.exports = {
  getLeaderboard: function(){
    return new Promise(function(resolve, reject){
      Leaderboard.find({}).sort({
        time: 1
      }).exec()
      .then(function(found){
        resolve(found)
      })
      .catch(function(err){
        reject({msg: err.toString(), code: errors.MONGO_ERR})
      })
    })
  },

  addToLeaderboard: function(user, lvl, time){
    return new Promise(function(resolve, reject){
      var nem;
      usrCtrl.getUserById(lvl.authorId)
      .then(function(nemesis){
        nem = nemesis;
        return Leaderboard.find({
          playerName: user.email,
          levelName: lvl.title
        })
      })
      .then(function(found){
        if(found.length == 0){
          var newEntry = new Leaderboard({
              playerName: user.email,
              heroRank: user.heroRank,
              levelName: lvl.title,
              levelRank: nem.nemesisRank,
              time: time
          })
          return newEntry.save()
        }
        else{
          if(found.time > time){
            Leaderboard.findByIdAndUpdate(found._id,
              { 
                $set: {
                  time: time
                }
              })
          }
        }
      })
      .then(function(entry){
        resolve(true)
      })
      .catch(function(err){
        reject({msg: err.toString(), code: errors.MONGO_ERR})
      })
    })
  }

}

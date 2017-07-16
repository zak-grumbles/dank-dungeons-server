var lvlCtrl = require('../db/levelController')
var userCtrl = require('../db/userController')
var Promise = require('bluebird')
var errors = require('../error')

const K = 32

var self = module.exports = {

  calculateRanks: function(heroId, nemId, win){
    var newRanks = {}
    return new Promise(function(resolve, reject){
      Promise.all([ userCtrl.getUserById(heroId), userCtrl.getUserById(nemId) ])
      .spread(function(hero, nemesis){

        var powHero = (nemesis.nemesisELO - hero.heroELO) / 400.0
        var eHero = 1.0 + Math.pow(10, powHero)
        var eHero = 1.0 / eHero //expected score for the hero

        var powNem = (hero.heroELO - nemesis.nemesisELO) / 400.0
        var eNem = 1.0 + Math.pow(10, powNem)
        var eNem = 1.0 / eNem //expected score for nemesis

        var hScore = win ? 1 : 0
        var nScore = win ? 0 : 1
        var rHero = hero.heroELO + K * (hScore - eHero)
        var rNem = nemesis.nemesisELO + K * (nScore - eNem)

        newRanks.newHeroRank = Math.round(rHero)
        newRanks.newNemRank = Math.round(rNem)
        
        resolve(newRanks)
      })    
      .catch(function(err){
        reject(err)
      })
    })
  }
}

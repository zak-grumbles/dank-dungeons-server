/**
 *  Contains all functions that acces the levels collection
 */

var Level = require('./models/levelModel')
var userCtrl = require('./userController')
var utils = require('./dbUtils')
var Promise = require('bluebird')
var error = require('../error')
var mongoose = require('mongoose');

var self = module.exports = {

  /**
   * Searches for level with the given id
   */
  getLevelById: function(data){
    return new Promise(function(resolve, reject){
      if(!data.id)
        reject({ msg: 'Invalid data format', code: error.FORMAT_ERR })

      Level.findById(data.id)
      .then(function(found){
        if(!found)
          reject({
            msg: 'No level found with id: ' + data.id,
            code: error.FORMAT_ERR 
          })
        else{
          resolve(found)
        }
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: error.MONGO_ERR
        })
      })

    })
  },

  getLevelByAuthorId: function(data){

    return new Promise(function(resolve, reject){

      Level.find({
        authorId: data.authorId
      })
      .then(function(found){
        if(!found){
          reject({
            msg: 'No level found with authorId: ' + authorId,
            code: error.GENERAL_ERR
          })
        }
        else{
          resolve(found)
        }
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: error.MONGO_ERR
        })
      })
    })
  },

  /**
   * Fetches all levels
   */
  getAllLevels: function(){
    return new Promise(function(resolve, reject){
      var levels;
      Level.find({
       "author": {
        $regex: '^((?!templateuser).)*$'
       }
      }, 'title author authorId')
      .then(function(found){
        levels = found
        var names = []
        found.forEach(function(item, index){
          names.push(item.author)
        })
        return userCtrl.getByUsernames(names);
      })
      .then(function(usrs){
        var result = []
        for(var i = 0; i < usrs.length; i++){
          var newItem = {
            _id: levels[i]._id,
            title: levels[i].title,
            author: levels[i].author,
            authorId: levels[i].authorId,
            difficulty: usrs[i].nemesisRank
          }
          result.push(newItem)
        }
        resolve(result)
      })
      .catch(function(err){
        reject({msg: err.toString(), code: error.MONGO_ERR })
      })
    })
  },

  /**
   * Fetches either a specific template level or all of them
   */
  getTemplateLevels: function(data){
    return new Promise(function(resolve, reject){
      userCtrl.getTemplateUserIds()
      .then(function(ids){
        Level.find({
          "authorId": {
            $in: ids
          }
        })
        .then(function(found){
          resolve(found)
        })
        .catch(function(err){
          reject({
            msg: err.toString(),
            code: error.MONGO_ERR
          })
        })
      })
      .catch(function(err){
        reject(err); 
      })
    })
  },

  /**
   * Saves the given level to the db. If level already exists, it 
   * is updated.
   */
  saveLevel: function(data){
    return new Promise(function(resolve, reject){
      
      Level.findOne({
        authorId: data.authorId
      })
      .then(function(found){
        if(!found){
          var newLvl = new Level(data)
          return newLvl.save()
        }
        else{
          found.title = data.title
          found.tiles = data.tiles
          found.monsters = data.monsters
          found.deaths = data.deaths

          return found.save()
        }
      })
      .then(function(updated){
        resolve(updated)
      })
      .catch(function(err){
        reject({msg: err.toString(), code: error.MONGO_ERR})
      })
    })
  },

  /**
   * Increments the number of times the level has been beaten
   */
  addWin: function(data){
    return new Promise(function(resolve, reject){
      Level.findById(data.id)
      .then(function(found){
        if(!found){
          reject({ msg: 'No level found with id: ' + data.id, code: error.FORMAT_ERR})
        }
        else{
          return found.update({ wins: found.wins + 1 })
        }
      })
      .then(function(result){
        resolve(true)
      })
      .catch(function(err){
        reject({ msg: err.toString(), code: error.MONGO_ERR})
      })
    })
  },

  /**
   * searches for levels that match a given object
   */
  searchLevels: function(searchData){
    return new Promise(function(resolve, reject){
      var searchObj = {}
      if(data.author)
        searchObj.author = data.author
      if(data.title)
        searchObj.title = data.title

      if(Object.keys(searchObj).length === 0){
        resolve([])
        return
      }
      
      Level.find(searchObj)
      .then(function(found){
        if(!found)
          reject({ msg: 'Level not found', code: error.FORMAT_ERR })
        else
          resolve(found)
      })
      .catch(function(err){
        reject({ msg: err.toString(), code: error.MONGO_ERR })
      })
      
    })
  },

  /**
   * Fetches the levels orderd by totalPlays
   */
  getMostPlayed: function(callback){
    return new Promise(function(resolve, reject){
      Level.find({}).sort({ totalPlays: 'descending' })
      .then(function(found){
        if(!found)
          reject('No results found')
        else
          resolve(found)
      })
      .catch(function(err){
        reject(err.toString())
      })
    })
  },

  /**
   * Fetches levels and sorts them by difficulty. 
   * 
   * sortCriteria should be either 'ascending' or 'descending'
   */
  getLevelsByDifficulty: function(order, callback){
    return new Promise(function(resolve, reject){
      Level.find({}).sort({ difficulty: order })
      .then(function(found){
        if(!found)
          reject('No results found')
        else
          resolve(found)
      })
      .catch(function(err){
        reject(err.toString())
      })
    })
  },

  /**
   *  Increments the total number of times a level has been played.
   *  Increments win count if necessary
   */
  levelPlayed: function(authorId, win, deaths){
    return new Promise(function(resolve, reject){
      Level.findOne({ authorId: authorId })
      .then(function(lvl){
        if(!lvl)
          reject({
            msg: 'No level found',
            code: error.MONGO_ERR
          })
        else{
          lvl.totalPlays += 1
          lvl.wins = win ? lvl.wins + 1 : lvl.wins
          lvl.deaths = deaths;
          return lvl.save()
        }
      })
      .then(function(updated){
        resolve(updated)
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: error.MONGO_ERR
        })
      })
    })
  },
}

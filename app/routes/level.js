var lvlCtrl = require('../db/levelController')
var userCtrl = require('../db/userController')
var leaderboardCtrl = require('../db/leaderboardController')
var response = require('../utils/response')
var ranker = require('../utils/ranker')
var Promise = require('bluebird')
var errors = require('../error')

/*
  This maps opcodes to their necessary functions. 

  The opcode is the index at which that function is found
*/
var opMap = [
  lvlCtrl.getAllLevels,
  lvlCtrl.getLevelById,
  lvlCtrl.getLevelByAuthorId,
  lvlCtrl.getTemplateLevels
]

module.exports = function(router){
  
  /**
   * Route for fetching a level by ID. This is used when selecting
   * a level to play
   */
  router.post('/levels/get', function(req, res){
      if(req.body.op >= opMap.length){
        response.err(res, 'Invalid op code', errors.FORMAT_ERR)
        return
      }
      else if(req.body.op == 1 && !req.body.id){
        response.err(res, 'No id given', errors.FORMAT_ERR)
      }
      else if(req.body.op == 2 && !req.body.authorId){
        response.err(res, 'No author ID given', errors.FORMAT_ERR)
      }

      opMap[req.body.op](req.body)
      .then(function(returned){
        response.ok(res, returned);
      })
      .catch(function(err){
        response.err(res, err.msg, err.code)
      })
    })


  /**
   * Route for saving a level.
   */
  router.post('/levels/push', function(req, res){
      lvlCtrl.saveLevel(req.body)
      .then(function(returned){
        return userCtrl.userPushedLvl(returned.authorId);
      })
      .then(function(user){
        response.accept(res, user, 'Level saved')
      })
      .catch(function(err){
        response.err(res, err.msg, err.code)
      })
    })

  /**
   * Search by author or title
   */
  router.get('/levels/search', function(req, res){
      lvlCtrl.searchLevels(req.query)
      .then(function(returned){
        response.ok(res, returned)
      })
      .catch(function(err){
        response.err(res, err.msg, err.code)
      })
    })

    /**
     * Returns levels ordered by most plays
     */
    router.get('/levels/most_played', function(req, res){
        lvlCtrl.getMostPlayed()
        .then(function(returned){
          response.ok(res, returned)
        })
        .catch(function(err){
          response.err(res, err.msg, err.code)
        })
      })

    /**
     * Returns levels ordered by difficulty
     */
    router.get('/levels/difficulty', function(req, res){
        if(!req.query.order){
          response.err(res, 'Invalid query', errors.FORMAT_ERR)
          return
        }
        else{
          lvlCtrl.getLevelsByDifficulty(req.query.order)
          .then(function(returned){
            response.ok(res, returned)
          })
          .catch(function(err){
            response.err(res, err.msg, err.code)
          })
        }
      })

    router.post('/levels/played', function(req, res){
      var data = req.body
      console.log(data)
      var finalLvl; //used to return updated level
      var ranks;

      if(data.heroId == data.nemId){
        Promise.all([
          lvlCtrl.getLevelById({id: data.nemId}),
          userCtrl.getUserById(data.heroId)
        ])
        .spread(function(lvl, hero){
          response.accept(res, [
            lvl,
            hero
          ])
        })
        .catch(function(err){
          response.err(res, err.msg, err.code);
        })
        return;
      }

      ranker.calculateRanks(data.heroId, data.nemId, data.win)
      .then(function(newRanks){
        ranks = newRanks
        return lvlCtrl.levelPlayed(data.nemId, data.win, data.deaths);
      })
      .then(function(updatedLvl){
        finalLvl = updatedLvl
        Promise.all([ 
          userCtrl.updateHero(data.heroId, updatedLvl, data.win, data.moneyEarned, ranks.newHeroRank),
          userCtrl.updateNemesis(data.nemId, updatedLvl, data.win, ranks.newNemRank)])
        .spread(function(updatedHero, updatedNem){
          return userCtrl.syncInventory(data.heroId, data.heroInventory)
        })
        .then(function(finalHero){
          if(data.win === true){
            leaderboardCtrl.addToLeaderboard(updatedHero, finalLvl, data.time)
          }
          response.accept(res, [
            finalLvl, 
            finalHero
          ])
        })
        .catch(function(err){
          response.err(res, err.msg, err.code);
          return;
        })
      })
      .catch(function(err){
        console.log(err)
        response.err(res, err.msg, err.code)
      })
    })

    router.post('/levels/quickmatch', function(req, res){
      var data = req.body;

      userCtrl.findNemesis(data)
      .then(function(nemesis){
        response.ok(res, nemesis);
      })
      .catch(function(err){
        response.err(res, err.msg, err.code)
      })
    })
}

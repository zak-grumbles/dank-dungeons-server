/**
 * Holds all functions that interact with the users collection in the db
 */
var User = require('./models/userModel')
var utils = require('./dbUtils')
var Promise = require('bluebird')
var errors = require('../error')

var self = module.exports = {

  /**
   * Authenticates a user using the given data.
   * 
   * @param data  object containing required fields for authentication
   * 
   * @returns Promise object that resolves the given user or rejects with an 
   *          error object
   */
  login: function(data){
    return new Promise(function(resolve, reject){
      
      if (!data.email || !data.userPassHash) {
        reject(errors.getErr('Must provide both email and password',
          errors.FORMAT_ERR))
      }

      User.findOne({
        email: data.email,
        hash: data.userPassHash
      })
      .then(function(found){
        if(!found){
          reject(errors.getErr('Invalid username or password', 
            errors.AUTH_ERR))
        }
        else{
          resolve(filterUserData(found));
        }
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: err.MONGO_ERR
        })
      })
    })
  },

  /**
   * Creates a new user with the given email
   * 
   * @param   data    user data
   * 
   * @returns Promise that resolves created user or rejects with error object
   * 
   */
  createUser: function(data, callback){
    return new Promise(function(resolve, reject){
      if(!data.email || !data.userPassHash){
        reject(errors.getErr('Both email and hash required', 
          errors.FORMAT_ERR))
        return
      }

      findUserByEmail(data.email).exec()
      .then(function(found){
        if(found)
          reject(errors.getErr('Email already in use', errors.GENERAL_ERR))
        else{
          var newUser = new User({
            email: data.email,
            hash: data.userPassHash
          })
          return newUser.save()
        }
      })
      .then(function(saved){
        var filtered = filterUserData(saved)
        resolve(filtered)
      })
      .catch(function(err){
        reject(errors.mongoErr(err))
      })
    })
  },

  /**
   * Stores a new session for a given user
   * 
   * @param data      object containing received data
   * 
   * @returns Promise that resolves to updated user object
   */
  saveSession: function(data){
    return new Promise(function(resolve, reject){
      User.findOne({ email: data.email })
      .then(function(found){
        if(!found)
          reject({
            msg: 'No user with email: ' + data.email,
            code: errors.GENERAL_ERR
          })
        else{
          var newSessions = found.sessions
          
          newSessions.push({
            start: Date.parse(data.start),
            end: Date.parse(data.end)
          })

          found.sessions = newSessions

          return found.save()
        }
      })
      .then(function(updated){
        resolve(filterUserData(updated))
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: errors.MONGO_ERR
        })
      })
    })
  },

  /** 
   * Returns a Promise that resolves the user object with the given id,
   * or an error object 
   */
  getUserById: function(id){
    return new Promise(function(resolve, reject){
      User.findById(id)
      .then(function(found){
        if(!found)
          reject({
            msg: 'No user found',
            code: errors.GENERAL_ERR
          })
        else
          resolve(found)
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: errors.MONGO_ERR
        })
      })
    })
  },

  updateHero: function(heroId, lvl, won, money, newELO){
    return new Promise(function(resolve, reject){
      if(newELO < 1500)
        newELO = 1500

      User.findById(heroId)
      .then(function(usr){
        usr.heroELO = newELO
        usr.heroRank = getNewRank(newELO)

        if(won){
          usr.money += lvl.reward
          usr.money += money
        }

        return usr.save()
      })
      .then(function(updated){
        resolve(updated)
      })
      .catch(function(err){
        reject({msg: err.toString(), code: errors.MONGO_ERR});
      })
    })
  },

  updateNemesis: function(nemId, lvl, won, newELO){
    return new Promise(function(resolve, reject){
      if(newELO < 1500)
        newELO = 1500

      User.findById(nemId)
      .then(function(usr){
        usr.nemesisELO = newELO
        usr.nemesisRank = getNewRank(newELO)
        
        if(!won)
          usr.money += lvl.reward

        return usr.save()
      })
      .then(function(updated){
        resolve(updated)
      })
      .catch(function(err){
        reject({msg: err.toString(), code: errors.MONGO_ERR})
      })
    })
  },

  updateHeroELO: function(id, newELO){
    if(newELO < 1500){
      return new Promise(function(resolve, reject){
        User.findById(id)
        .then(function(found){
          resolve(found)
        })
        .catch(function(err){
          reject({
            msg: err.toString(),
            code: errors.MONGO_ERR
          })
        })
      });
    }
    return new Promise(function(resolve, reject){
      User.findByIdAndUpdate(id, { heroELO: newELO, 
        heroRank: getNewRank(newELO) }, { new: true })
      .then(function(updated){
        resolve(filterUserData(updated))
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: errors.MONGO_ERR
        })
      })
    })
  },

  updateNemesisELO: function(id, newELO){
    if(newELO < 1500){
      return new Promise(function(resolve, reject){
        User.findById(id)
        .then(function(found){
          resolve(filterUserData(found))
        })
        .catch(function(err){
          reject({msg: err.toString(),
            code: errors.MONGO_ERR
          })
        })
      });
    }

    return new Promise(function(resolve, reject){
      User.findByIdAndUpdate(id, { nemesisELO: newELO, 
        nemesisRank: getNewRank(newELO) }, { new: true })
      .then(function(updated){
        resolve(filterUserData(updated))
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: errors.MONGO_ERR
        })
      })
    })
  },

  makePurchase: function(data){
    return new Promise(function(resolve, reject){
      User.findById(data.id)
      .then(function(found){
        if(!found){
          reject(errors.getErr('No user found with id: ' + data.id),
            errors.SEARCH_ERR)
        }
        else{
          if(found.purchase(data.cost, data.itemName)){
            return found.save()
          }
          else{
            reject(errors.getErr('Insufficient funds', errors.GENERAL_ERR))
          }
        }
      })
      .then(function(updated){
        //This will happen if player does not have enough money
        if(!updated){
          return
        }
        resolve(filterUserData(updated))
      })
      .catch(function(err){
        reject(errors.mongoErr(err))
      })
    })
  },

  findNemesis: function(data){
    return new Promise(function(resolve, reject){
      var rank = data.heroELO
      var lowRank = rank - 128
      var highRank = rank + 128

      User.find({
        "nemesisELO": {
          $lte: highRank,
          $gte: lowRank
        },
        "hasLevel": true,
        "email": {
          $ne: data.email
        }
      }, '_id')
      .then(function(result){
        var id = result[Math.floor(Math.random() * result.length)];
        resolve(id);
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: errors.MONGO_ERR
        });
      })
    })
  },

  userPushedLvl: function(id){
    return new Promise(function(resolve, reject){
      User.findByIdAndUpdate(id, { "hasLevel": true }, { new: true})
      .then(function(saved){
        resolve(filterUserData(saved));
      })
      .catch(function(err){
        reject({
          msg: err.toString(),
          code: errors.MONGO_ERR
        })
      })
    })
  },

  syncInventory: function(id, newInventory){
    return new Promise(function(resolve, reject){
      console.log("HERE")
      User.findById(id)
      .then(function(usr){
        if(!usr){
          reject(errors.getErr('No user found with id: ' + data.id),
            errors.SEARCH_ERR)
          return;
        }
        else{
          if(!validateInventoryUpdate(usr.inventory, newInventory)){
            reject(errors.getErr('Cheating detected. Don\'t be a dick',
              errors.FORMAT_ERR))
            return;
          }
          else{
            usr.intentory = newInventory;
            return usr.save()
          }
        }
      })
      .then(function(updated){
        console.log("Saved user: " + updated)
        resolve(filterUserData(updated))
      })
      .catch(function(err){
        reject(errors.getErr(err.toString(), errors.MONGO_ERR))
      })
    })
  },

  getTemplateUserIds: function(){
    return new Promise(function(resolve, reject){
      User.find({
        "email": {
          $regex: 'templateuser'
        }
      }, '_id')
      .then(function(found){
        resolve(found);
      })
      .catch(function(err){
        reject(err);
      })
    });
  },

  getByUsernames: function(names){
    return User.find({
      "email": {
        $in: names
      }
    });
  }
}

/****************************************
 *      Unexposed utility functions
 ***************************************/

/**
 * Searches for user by email
 */
function findUserByEmail(userEmail){
  return User.findOne({
    email: userEmail
  })
}

function filterUserData(user){
  var user = user.toObject()
  delete user.hash
  delete user.__v
  return user
}

function validateInventoryUpdate(oldInven, newInven){
  if(newInven === undefined)
    return true;
  newInven.forEach(function(newItem, index){
    oldInven.forEach(function(oldItem, index){
      if(oldItem.itemName === newItem.itemName){
        if(newItem.count > oldItem.count)
          return false;
      }
    })
  })
  return true;
}

function getNewRank(ELO){
    var newRank;
    if(ELO < 1700)
      newRank = 1;
    else if(ELO < 1900)
      newRank = 2;
    else if(ELO < 2100)
      newRank = 3;
    else if(ELO < 2300)
      newRank = 4;
    else if(ELO < 2500)
      newRank = 5;
    else if(ELO < 2700)
      newRank = 6;
    else if(ELO < 2900)
      newRank = 7;
    else if(ELO < 3100)
      newRank = 8;
    else if(ELO < 3200)
      newRank = 9;
    else if(ELO < 3400)
      newRank = 10;
    return newRank;
}

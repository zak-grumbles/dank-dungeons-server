var userCtrl = require('../db/userController')
var lvlCtrl = require('../db/levelController')
var leaderboardCtrl = require('../db/leaderboardController')
var response = require('../utils/response')
var tokens = require('../utils/tokens')
var errors = require('../error')

module.exports = function(router) {

  /**
   * Login route
   * 
   * Login data is posted to this url
   */
  router.post('/user/login', function(req, res) {
    userCtrl.login(req.body)
    .then(function(found){
      console.log("here");
      found.token = tokens.getNewToken(found)
      console.log("here");
      response.accept(res, found)
    })
    .catch(function(err){
      console.log(err);
      response.err(res, err.msg, err.code)
    })
  })
    
  /**
   * Route for creating a user.
   * 
   * User data is posted to this url. User is then created in the db
   */
  router.post('/user/create', function(req, res) {
    userCtrl.createUser(req.body)
    .then(function(returned){
      returned.token = tokens.getNewToken(returned)
      response.created(res, returned)
    })
    .catch(function(err){
      console.log(err);
      response.err(res, err.msg, err.code)
    })
  })

  /**
   * Stores a new session for the logged in user
   */
  router.post('/user/session', function(req, res){
    if(!req.body.email || !req.body.start || !req.body.end){
      response.err(res, 'Invalid data format', errors.FORMAT_ERR)
      return
    }

    userCtrl.saveSession(req.body)
    .then(function(returned){
      response.accept(res, returned)
    })       
    .catch(function(msg){
      response.err(res, err.msg, err.code)
    })
  })

  /**
   * Used to purchase items from the store.
   */
  router.post('/user/purchase', function(req, res){
    if(!req.body.id)
      response.err(res, 'Player ID required', errors.FORMAT_ERR)
    else if(!req.body.cost)
      response.err(res, 'Cost required', errors.FORMAT_ERR)
    else if(req.body.cost < 0)
      response.err(res, 'Cost must be greater than or equal to 0', errors.FORMAT_ERR)
    else{
      userCtrl.makePurchase(req.body)
      .then(function(returned){
        response.accept(res, returned)
      })
      .catch(function(err){
        response.err(res, err.msg, err.code)
      })
    }
  })

  /**
   *  Checks if the provided token is still valid
   */
  router.post('/user/authenticate', function(req, res){
    if(!req.body.token){
      response.err(res, 'Token required', errors.FORMAT_ERR)
    }
    else{
      tokens.checkToken(req.body.token)
      .then(function(result){
        return userCtrl.getUserById(result._id)
      })
      .then(function(usr){
        response.accept(res, usr);
      })
      .catch(function(err){
        response.err(res, err.msg, err.code);
      })
    }
  })

  router.get('/user/leaderboard', function(req, res){
    leaderboardCtrl.getLeaderboard()
    .then(function(board){
      response.ok(res, board)
    })
    .catch(function(err){
      response.err(res, err.msg, err.code)
    })
  })
}

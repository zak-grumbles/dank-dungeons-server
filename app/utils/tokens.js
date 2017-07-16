var jwt = require('jsonwebtoken')
var jwtConfig = require('../config.json').tokens
var response = require('./response')
var errors = require('../error')

var self = module.exports = {
  getNewToken: function(user){
    var token = jwt.sign(user, jwtConfig.secret, {
      expiresIn: "7d"
    })
    return token
  },

  verify: function(req, res, next){
    var token = req.body.token || req.query.token
    jwt.verify(token, jwtConfig.secret, function(err, decoded){
      if(err){
        response.err(res, 'Invalid token', errors.TOKEN_ERR)
      }
      else{
        next()
      }
    })
  },

  checkToken: function(token){
    return new Promise(function(resolve, reject){
      jwt.verify(token, jwtConfig.secret, function(err, decoded){
        if(err){
          reject({
            msg: 'Invalid token',
            code: errors.TOKEN_ERR
          });
        }
        else{
          resolve(decoded);
        }
      })
    })
  }
}

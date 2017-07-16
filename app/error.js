var self = module.exports = {
  NO_ERR: 0,
  FORMAT_ERR: 1,
  TOKEN_ERR: 2,
  MONGO_ERR: 3,
  GENERAL_ERR: 4,
  AUTH_ERR: 5,
  SEARCH_ERR: 6,

  getErr: function(msg, code){
    return {
      msg: msg,
      code: code
    }
  },

  mongoErr: function(err){
    return {
      msg: err.toString(),
      code: self.MONGO_ERR
    }
  }
}
/**
 * Collection of routing utility functions
 */

var err = require('../error')

var self = module.exports = {

  /**
   * Status codes
   */
  statusCodes: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    ERR: 500,
    AUTH_ERR: 401
  },

  /**
   * Sends a failure response with the given message
   * 
   * @param response  response object
   * @param msg   error message
   * @param code  error code
   */
  err: function(response, msg, code){
    var resCode = code === err.TOKEN_ERR ? self.statusCodes.AUTH_ERR : self.statusCodes.ERR

    self.sendResponse(response, self.statusCodes.OK, code, false, msg)
  },

  /**
   * Sends an OK (200) response
   * 
   * @param response    express response object
   * @param payload     "result" object for response
   * @param msg         response message
   */
  ok: function(response, payload, msg){
    self.sendResponse(response, self.statusCodes.OK, err.NO_ERR, true, msg, payload)
  },

  /**
   * Sends an accepted (202) response
   * 
   * @param response    express response object
   * @param payload     "result" object for response
   * @param msg         result message
   */
  accept: function(response, payload, msg){
    self.sendResponse(response, self.statusCodes.ACCEPTED, err.NO_ERR, true, msg, payload)
  },

  /**
   * Sends an created (201) response
   * 
   * @param response    express response object
   * @param payload     "result" object for response
   * @param msg         result message
   */
  created: function(response, payload, msg){
    self.sendResponse(response, self.statusCodes.CREATED, err.NO_ERR, true, msg, payload)
  },

  /**
   * Sends a JSON response
   * 
   * @param response    express response object
   * @param resCode     http status code
   * @param errCode     error code (see errors.js)
   * @param success     true if not error response, false otherwise
   * @param payload     value for "result" field
   */
  sendResponse: function(response, resCode, errCode, success, msg, payload){
    var result = {
      success: success,
      message: msg || '',
      err: errCode,
      result: payload
    }

    response.status(resCode).json(result)
  }
}

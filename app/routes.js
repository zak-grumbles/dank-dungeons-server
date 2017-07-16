var express = require('express')
var tokens = require('./utils/tokens')

var router = express.Router()

router.use(['/user/session', '/levels'], tokens.verify)

require('./routes/user')(router)
require('./routes/level')(router)

module.exports = router

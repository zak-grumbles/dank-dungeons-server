var mongoose = require('mongoose')
var Schema = mongoose.Schema

var leaderBoardSchema = new Schema({
    playerName: {type: String, default: ""},
    heroRank: {type: Number, default: 1},
    levelName: { type: String, default: ""},
    levelRank: {type: Number, default: 1},
    time: {type: Number, default: 0}
}, {collection: 'leaderboard'})

module.exports = mongoose.model('Leaderboard', leaderBoardSchema)

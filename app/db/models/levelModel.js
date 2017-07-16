var mongoose = require('mongoose')
var Schema = mongoose.Schema

var placeableSchema = new Schema({
    id: String,
    x: Number,
    y: Number
})

var levelSchema = new Schema({
    title: String,
    author: String,
    authorId: { type: Schema.Types.ObjectId, ref: 'User'},
    totalPlays: {type: Number, default: 0},
    wins: {type: Number, default: 0},
    reward: {type: Number, default: 100},
    background: {type: String, default: ""},

    //locations of player deaths
    deaths: [
        {
            x: Number,
            y: Number,
            name: {type: String, default: "RIP"}
        }
    ],

    tiles: [placeableSchema],
    
    monsters: [placeableSchema]
}, { collection: 'levels' })

module.exports = mongoose.model('Level', levelSchema)

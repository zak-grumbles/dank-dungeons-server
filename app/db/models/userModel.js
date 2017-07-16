var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({
	email: String,
	hash: String,
	nemesisELO: {type: Number, default: 1500},
  nemesisRank: { type: Number, default: 1},
	heroELO: {type: Number, default: 1500},
  heroRank: {type: Number, default: 1},
	combatLevel: { type: Number, default: 0 },
  experience: { type: Number, default: 0},
	money: {type: Number, default: 100},
	hasLevel: {type: Boolean, default: false},
	inventory: [{
    itemName: String, 
    count: {type: Number, default: 1}
  }]
}, {collection : 'users'})

userSchema.methods.purchase = function(cost, name){
	if(this.money < cost)
		return false
	
	this.money -= cost
  var inserted = false
  this.inventory.forEach(function(item){
    if(item.itemName == name){
      item.count += 1
      inserted = true
      return true
    }
  })
  if(!inserted){
    this.inventory.push({
      itemName: name, 
      count: 1
    })
  }
	return true
}

module.exports = mongoose.model('User', userSchema)

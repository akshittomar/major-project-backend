const mongoose = require('mongoose');
const {Schema} = mongoose;
const UserSchema = new Schema({
    name:{
        type:String,
        
    },
    email:{
        type:String,
        unique:true,
        required:true ,
        
    }
  });
const User =   mongoose.model('User',UserSchema);

  module.exports = User ;
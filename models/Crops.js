const mongoose = require('mongoose');// yeh hua import moongose 
const {Schema} = mongoose;//
const CropsSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,//foreign key
        ref:'USER',//foreign key refrencing user database 
    },
    ph: {
        type: Number,
        required: true
    },
    
    rain: {
        type: Number,
        required: true
    },
    temp: {
        type: Number,
        required: true
    },
    humid: {
        type: Number,
        required: true
    },
    nitro: {
        type: Number,
        required: true
    },
    p: {
        type: Number,
        required: true
    },
    k:{
        type: Number,
        required : true 
    },
    prediction:{
        type: String,
        required: true 
    },
    date: {
        type: Date,
        default: Date.now
    }
    
    
    
    
    
    
  });

  const Crops = mongoose.model('CROPS',CropsSchema);
  module.exports = Crops;
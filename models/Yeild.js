const mongoose = require('mongoose');// yeh hua import moongose 
const {Schema} = mongoose;//
const YeildSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,//foreign key
        ref:'USER',//foreign key refrencing user database 
    },
    Production: {
        type: Number,
        required: true
    },
    
    Area: {
        type: Number,
        required: true
    },
    Crop: {
        type: String,
        required: true
    },
    Season: {
        type: String,
        required: true
    },
    Crop_Year: {
        type: Number,
        required: true
    },
    State_Name: {
        type: String,
        required: true,
        default:"Karnataka"
    },
    District_Name:{
        type: String,
        required : true ,
        default:"BAGALKOT"
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

  const Yeild = mongoose.model('YEILD',YeildSchema);
  module.exports = Yeild;
  
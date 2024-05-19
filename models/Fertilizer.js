const mongoose = require('mongoose');// yeh hua import moongose 
const {Schema} = mongoose;//
const FertilizerSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,//foreign key
        ref:'USER',//foreign key refrencing user database 
    },
    Soil_Type: {
        type: String,
        required: true
    },
    Crop_Type: {
        type: String ,
        required: true
    },
    Soil_Moist: {
        type: Number ,
        required: true
    },
    Temperature: {
        type: Number,
        required: true
    },
    Humidity: {
        type: Number,
        required: true
    },
    Nitrogen: {
        type: Number,
        required: true
    },
    Phosphorous: {
        type: Number,
        required: true
    },
    Potassium:{
        type: Number,
        required : true 
    },
    Prediction:{
        type: String,
        required: true 
    },
    date: {
        type: Date,
        default: Date.now
    }
    
});

  const Fertilizer = mongoose.model('FERTILIZER',FertilizerSchema);
   module.exports = Fertilizer;
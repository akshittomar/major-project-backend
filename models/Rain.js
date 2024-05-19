const mongoose = require('mongoose');// yeh hua import moongose 
const {Schema} = mongoose;//
const RainSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,//foreign key
        ref:'USER',//foreign key refrencing user database 
    },
    State: {
        type: String,
        required: true
    },
    District: {
        type: String ,
        required: true
    },
    Month: {
        type: Number ,
        required: true
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

  const Rain = mongoose.model('RAIN',RainSchema);
   module.exports = Rain;
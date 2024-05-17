const mongoose = require('mongoose')// MONGOOSE KO USE KRNE KA TARIKKA HAI YEH 

require('dotenv').config();
const MURI =  process.env.MURI;// CREATED DATABSE NE LINK DIYA VO HUMNE IDHAR LAGAYA 

const connection = () =>{// EK FUNCTION HAI JO MONGOOSE K MADAT SE MONGODB K URL KO CONNECT KREGA 
    mongoose.connect(`${MURI}`)  
    console.log('connected');
}
module.exports = connection;
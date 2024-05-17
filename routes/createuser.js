const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');



router.post('/createUser',async(req,res)=>{
 
  var success = false;
  var error = "" ;
const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success=false;
     
        error="RE-SUBMIT USING COREECT DATA"
       return  res.status(400).json({error,success})
     




      
    }

    try {
  let user =await  User.findOne({email: req.body.email});
  if(user)
  {
    console.log("mauj kro");
    success=true;
   return  res.json({success});
  }
  else{
 
 

    user = await  User.create({email:req.body.email,name:req.body.email
      
      
    })

    success=true;
   return  res.json({success}); }
  }
  catch(error){
    console.error(error.message);
   
  error="INTERNAL SERVER ERROR ";
  
 return  res.status(500).json({error,success});
  }
  
})








module.exports = router ;
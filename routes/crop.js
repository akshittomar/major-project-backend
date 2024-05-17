const express = require('express');
const router = express.Router();
const Crops = require('../models/Crops');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');





router.post ('/fetchallcrops',async (req,res)=> {
   
try{
    const email = req.body.email ;
    console.log("email yeh hai"+ email);
    const user = await User.findOne({email:email});
    console.log("user yeh hai"+ user);
    const crops = await Crops.find({ user: user._id });
    console.log("crops yeh hai"+crops);



res.json(crops);
}
catch(error)
{
    console.error(error.message);
    res.status(500).send("INTERNAL SERVER  ERROR ");
}
})





router.post('/addcrop',async (req,res)=> {
        
        
    try{
        const {email ,  rain, temp, humid, nitro, p, k, prediction } = req.body; //body se sab kuch aagya 

        
        console.log("email yeh hai"+ email);
        const user = await User.findOne({email:email});//user ki table mai user find kiya
        console.log("user yeh hai"+ user);

    const crop  = new Crops({ 
        rain, temp, humid, nitro, p, k, prediction  , user: user._id 
    })
    const savedCrop = await crop.save()
    console.log("THIS CROP GOT SAVED "+savedCrop)
    res.send(savedCrop)
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER  ERROR ");
    }
    }) 
    
    



    router.put('/update/:id', async(req,res)=>{
        console.log("THIS USER REQUESTED "+req.params.id);
        
            try{
                
            
                
                
                const {email,  rain, temp, humid, nitro, p, k, prediction } = req.body;

                
                
                const newCrop  = {};
                
                if(rain){newCrop.rain = rain};
               
if (temp) {
    newCrop.temp = temp;
}

if (humid) {
    newCrop.humid = humid;
}

if (nitro) {
    newCrop.nitro = nitro;
}

if (p) {
    newCrop.p = p;
}

if (k) {
    newCrop.k = k;
}

if (prediction) {
    newCrop.prediction = prediction;
}
                newCrop.id = req.params.id
                console.log(newCrop);
         
        
            let crop =await Crops.findById(req.params.id);
            console.log("founded crops");
            console.log(crop);
            if(!crop){
               return res.status(404).send("NOT FOUND !!!!!");
            }
            
                const user = await User.findOne({email:req.body.email})
                console.log("user id "+user._id)
                console.log("crop id"+crop.user )
            if(crop.user.toString() !== user._id.toString())
            {
                return res.status(401).send("X X X NOT ALLOWED X X X X");
            }
           
           
        
                console.log("NEW CROP IS THIS"+crop)
        
            
           const cropp = await Crops.findByIdAndUpdate(req.params.id,{$set : newCrop}, {new :true}) ;
           res.json({cropp});
           
           
           
            }
            catch(error){
                console.error(error.message);
                res.status(500).send("INTERNAL SERVER  ERROR ");
            }
        })
        
        
        
        
        
        
        
        
        
    
    

//route4 : it is used to delete the existing notes of a user 
router.delete('/delete/:id', async(req,res)=>{


    try{
        
        
        
        
        
        
    

    let crop =await Crops.findById(req.params.id);
    if(!crop){
       return res.status(404).send("NOT FOUND !!!!!");
    }
    const user = await User.findOne({email:req.body.email})
    

    if(crop.user.toString() !== user._id.toString())
    {
        return res.status(401).send("X X X NOT ALLOWED X X X X");
    }
   crop = await Crops.findByIdAndDelete(req.params.id) ;
   res.json({"SUCCESS":" DELETED ", crop:crop});
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER  ERROR ");
    }
})


    



module.exports = router ;  
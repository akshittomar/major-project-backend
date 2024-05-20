const express = require('express');
const router = express.Router();
const { loadPyodide } = require('pyodide');
const User = require('../models/User');
const Yield = require('../models/Yeild');
const fs = require('fs');
const path = require('path');
const Yeild = require('../models/Yeild');

router.post('/yieldrecommend', async (req, res) => {
    try {
        const { Production, Area, Crop, Season, Crop_Year, State_Name, District_Name, email } = req.body;

        console.log("email is this: " + email);
        const user = await User.findOne({ email: email });
        console.log("user is this: " + user);

        let prediction = "Assumed Value";

        const pyodide = await loadPyodide();
        await pyodide.loadPackage(['micropip', 'pandas', 'scikit-learn']);

        // Read the CSV file
        const filePath = path.join(__dirname, '../yeildroutes/crop_production_karnataka.csv');
        const csvData = fs.readFileSync(filePath, 'utf8');

        // Python code to run in Pyodide
        const code = `
import pandas as pd
import numpy as np
from io import StringIO
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder

# Load the dataset
csv_data = '''${csvData.replace(/'/g, "''")}'''
df = pd.read_csv(StringIO(csv_data))

# Drop the Crop_Year column
df = df.drop(['Crop_Year'], axis=1)

# Separate the features and target variables
X = df.drop(['Production'], axis=1)
y = df['Production']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Categorical columns for one-hot encoding
categorical_cols = ['State_Name', 'District_Name', 'Season', 'Crop']

# One-hot encode the categorical columns
ohe = OneHotEncoder(handle_unknown='ignore')
ohe.fit(X_train[categorical_cols])

# Convert categorical columns to one-hot encoding
X_train_categorical = ohe.transform(X_train[categorical_cols])
X_test_categorical = ohe.transform(X_test[categorical_cols])

# Combine the one-hot encoded categorical columns and numerical columns
X_train_final = np.hstack((X_train_categorical.toarray(), X_train.drop(categorical_cols, axis=1)))
X_test_final = np.hstack((X_test_categorical.toarray(), X_test.drop(categorical_cols, axis=1)))

# Train the model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train_final, y_train)

# Input parameters
state = "${State_Name}"
district = "${District_Name}"
season = "${Season}"
crop = "${Crop}"
area = ${Area}

# Create user input array
user_input = np.array([[state, district, season, crop, area]])

# Convert the categorical columns to one-hot encoding
user_input_categorical = ohe.transform(user_input[:, :4])

# Combine the one-hot encoded categorical columns and numerical columns
user_input_final = np.hstack((user_input_categorical.toarray(), user_input[:, 4:].astype(float)))

# Make the prediction
prediction = model.predict(user_input_final)[0]
`;

        await pyodide.runPythonAsync(code);

        prediction = pyodide.globals.get('prediction');
        console.log("Predicted yield:", prediction);

        const yieldData = new Yield({
            Production, Area, Crop, Season, Crop_Year, State_Name, District_Name, user: user._id, prediction
        });
        const savedYield = await yieldData.save();
        console.log("THIS Yield GOT Predicted " + savedYield);

        res.send(savedYield);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER ERROR");
    }
});


router.post ('/fetchallyeild',async (req,res)=> {
   
    try{
        const email = req.body.email ;
        console.log("email is this "+ email);
        const user = await User.findOne({email:email});
        console.log("user is hai"+ user);
        const yeild = await Yeild.find({ user: user._id });
        console.log("yeild is this "+yeild);
    
    
    
    res.json(yeild);
    }
    catch(error)
    {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER  ERROR ");
    }
    })
    
    


    
    
    
    
    
    
    
    
        router.delete('/delete/:id', async(req,res)=>{
    
    
            try{
                
                
                
                
                
                
            
        
            let crop =await Yeild.findById(req.params.id);
            if(!crop){
               return res.status(404).send("NOT FOUND !!!!!");
            }
            const user = await User.findOne({email:req.body.email})
            
        
            if(crop.user.toString() !== user._id.toString())
            {
                return res.status(401).send("X X X NOT ALLOWED X X X X");
            }
           crop = await Yeild.findByIdAndDelete(req.params.id) ;
           res.json({"SUCCESS":" DELETED ", crop:crop});
            }
            catch(error){
                console.error(error.message);
                res.status(500).send("INTERNAL SERVER  ERROR ");
            }
        })
    
    
    



module.exports = router;

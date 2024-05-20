const express = require('express');
const router = express.Router();
const { loadPyodide } = require('pyodide');
const User = require('../models/User');
const Rain = require('../models/Rain');
const fs = require('fs');
const path = require('path');

router.post('/rainrecommend', async (req, res) => {
    try {
        const { State, District, Month, email } = req.body;

        console.log("email is this: " + email);
        const user = await User.findOne({ email: email });
        console.log("user is this: " + user);

        let prediction = "Assumed Value";

        const pyodide = await loadPyodide();
        await pyodide.loadPackage(['micropip', 'pandas', 'numpy']);

        // Read the CSV file
        const filePath = path.join(__dirname, '../rainroutes/rain-data.csv');
        const csvData = fs.readFileSync(filePath, 'utf8');

        // Python code to run in Pyodide
        const code = `
import pandas as pd
import numpy as np
from io import StringIO

# Load the dataset
csv_data = """${csvData.replace(/"/g, '\\"')}"""
df = pd.read_csv(StringIO(csv_data))

# Function to predict rainfall for a given state, district, and month
def predict_rainfall(state, district, month):
    # Filter the dataframe to only include rows with the given state and district
    filtered_data = df[(df['STATE'] == state) & (df['DISTRICT'] == district)]
    
    # If no data is available for the given state and district, return a default value or raise an error
    if filtered_data.empty:
        return "No data available for the given state and district"
    
    # Calculate the average rainfall for the given month across all the years
    avg_rainfall = filtered_data[str(month)].mean()
    
    return avg_rainfall

# Input parameters
state = "${State}"
district = "${District}"
month = ${Month}

# Predict rainfall
predicted_rainfall = predict_rainfall(state, district, month)
`;
await pyodide.runPythonAsync(code);

prediction = pyodide.globals.get('predicted_rainfall');
        // const pyodideGlobals = pyodide.globals.toPy({ code: code });
        // await pyodide.runPythonAsync(`exec(code, globals())`, pyodideGlobals);

        // prediction = pyodide.globals.get('predicted_rainfall').toString();
        console.log("Predicted rain:", prediction);

        const rainData = new Rain({
            State, District, Month, user: user._id, prediction, Prediction: prediction
        });
        const saved = await rainData.save();
        console.log("THIS Rain GOT Predicted " + saved);

        res.send(saved);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER ERROR");
    }
});




router.post('/getrain', async (req, res) => {
    try {
        const { State, District, Month, email } = req.body;

        console.log("email is this: " + email);
        const user = await User.findOne({ email: email });
        console.log("user is this: " + user);

        let prediction = "Assumed Value";

        const pyodide = await loadPyodide();
        await pyodide.loadPackage(['micropip', 'pandas', 'numpy']);

        // Read the CSV file
        const filePath = path.join(__dirname, '../rainroutes/rain-data.csv');
        const csvData = fs.readFileSync(filePath, 'utf8');

        // Python code to run in Pyodide
        const code = `
import pandas as pd
import numpy as np
from io import StringIO

# Load the dataset
csv_data = """${csvData.replace(/"/g, '\\"')}"""
df = pd.read_csv(StringIO(csv_data))

# Function to predict rainfall for a given state, district, and month
def predict_rainfall(state, district, month):
    # Filter the dataframe to only include rows with the given state and district
    filtered_data = df[(df['STATE'] == state) & (df['DISTRICT'] == district)]
    
    # If no data is available for the given state and district, return a default value or raise an error
    if filtered_data.empty:
        return "No data available for the given state and district"
    
    # Calculate the average rainfall for the given month across all the years
    avg_rainfall = filtered_data[str(month)].mean()
    
    return avg_rainfall

# Input parameters
state = "${State}"
district = "${District}"
month = ${Month}

# Predict rainfall
predicted_rainfall = predict_rainfall(state, district, month)
`;
await pyodide.runPythonAsync(code);

prediction = pyodide.globals.get('predicted_rainfall');
        // const pyodideGlobals = pyodide.globals.toPy({ code: code });
        // await pyodide.runPythonAsync(`exec(code, globals())`, pyodideGlobals);

        // prediction = pyodide.globals.get('predicted_rainfall').toString();
        console.log("Predicted rain:", prediction);

        // const rainData = new Rain({
        //     State, District, Month, user: user._id, prediction, Prediction: prediction
        // });
        // const saved = await rainData.save();
        // console.log("THIS Rain GOT Predicted " + saved);

        res.status(200).send({rain:prediction});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER ERROR");
    }
});






router.post ('/fetchallrain',async (req,res)=> {
   
    try{
        const email = req.body.email ;
        console.log("email "+ email);
        const user = await User.findOne({email:email});
        console.log("user "+ user);
        const crops = await Rain.find({ user: user._id });
        
    
    
    
    res.json(crops);
    }
    catch(error)
    {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER  ERROR ");
    }
    })








    router.delete('/delete/:id', async(req,res)=>{


        try{
            
            
            
            
            
            
        
    
        let crop =await Rain.findById(req.params.id);
        if(!crop){
           return res.status(404).send("NOT FOUND !!!!!");
        }
        const user = await User.findOne({email:req.body.email})
        
    
        if(crop.user.toString() !== user._id.toString())
        {
            return res.status(401).send("X X X NOT ALLOWED X X X X");
        }
       crop = await Rain.findByIdAndDelete(req.params.id) ;
       res.json({"SUCCESS":" DELETED ", crop:crop});
        }
        catch(error){
            console.error(error.message);
            res.status(500).send("INTERNAL SERVER  ERROR ");
        }
    })




module.exports = router;

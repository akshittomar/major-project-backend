




const express = require('express');
const router = express.Router();
const { loadPyodide } = require('pyodide');
const User = require('../models/User');
const Fertilizer = require('../models/Fertilizer');
const fs = require('fs');
const path = require('path');

router.post('/fertilizerrecommend', async (req, res) => {
    try {
        const { Temperature, Humidity, Soil_Moist, Soil_Type, Crop_Type, Nitrogen, Potassium, Phosphorous, email } = req.body;

        console.log("email is this: " + email);
        const user = await User.findOne({ email: email });
        console.log("user is this: " + user);

        let prediction = "Assumed Value";

        const pyodide = await loadPyodide();
        await pyodide.loadPackage(['micropip', 'pandas', 'scikit-learn']);

        // Read the CSV file
        const filePath = path.join(__dirname, 'fertilizer_recommendation.csv');
        const csvData = fs.readFileSync(filePath, 'utf8');

        // Python code to run in Pyodide
        const code = `
import pandas as pd
import numpy as np
from io import StringIO
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier

# Load the dataset
csv_data = """${csvData.replace(/"/g, '\\"')}"""
data = pd.read_csv(StringIO(csv_data))

# Label encoding for categorical features
le_soil = LabelEncoder()
data['Soil_Type'] = le_soil.fit_transform(data['Soil_Type'])
le_crop = LabelEncoder()
data['Crop_Type'] = le_crop.fit_transform(data['Crop_Type'])

# Splitting the data into input and output variables
X = data.iloc[:, :8]
y = data.iloc[:, -1]

# Training the Decision Tree Classifier model
dtc = DecisionTreeClassifier(random_state=0)
dtc.fit(X, y)

# Input parameters
temp = ${Temperature}
humidity = ${Humidity}
soil_moisture = ${Soil_Moist}
soil_type = "${Soil_Type}"
crop_type = "${Crop_Type}"
nitrogen = ${Nitrogen}
potassium = ${Potassium}
phosphorous = ${Phosphorous}

# Encode the soil type and crop type
soil_type_enc = le_soil.transform([soil_type])[0]
crop_type_enc = le_crop.transform([crop_type])[0]

# Get the user inputs and store them in a numpy array
user_input = np.array([[temp, humidity, soil_moisture, soil_type_enc, crop_type_enc, nitrogen, potassium, phosphorous]])

# Ensure the user input features have valid names
user_input_df = pd.DataFrame(user_input, columns=X.columns)

# Make the prediction
fertilizer_name = dtc.predict(user_input_df)[0]

`;

        // Run the Python code in Pyodide
        // const pyodideGlobals = pyodide.globals.toPy({ code: code });
        //  prediction = await pyodide.runPythonAsync(`exec(code, globals())`, pyodideGlobals);

        // console.log("Predicted fertilizer:", prediction);
        await pyodide.runPythonAsync(code);

        prediction = pyodide.globals.get('fertilizer_name');
       console.log("Predicted crop:", prediction);
        const Prediction = prediction.toString();

        const ferData = new Fertilizer({
            Temperature, Humidity, Soil_Moist,  Soil_Type, Crop_Type: Crop_Type, Nitrogen, Potassium, Phosphorous, user: user._id, Prediction
        });
        const saved = await ferData.save();
        console.log("THIS Fertilizer GOT Predicted " + saved);

        res.send(saved);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER ERROR");
    }
});



router.post ('/fetchallfertilizer',async (req,res)=> {
   
    try{
        const email = req.body.email ;
        console.log("email "+ email);
        const user = await User.findOne({email:email});
        console.log("user "+ user);
        const crops = await Fertilizer.find({ user: user._id });
        
    
    
    
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
            
            
            
            
            
            
        
    
        let crop =await Fertilizer.findById(req.params.id);
        if(!crop){
           return res.status(404).send("NOT FOUND !!!!!");
        }
        const user = await User.findOne({email:req.body.email})
        
    
        if(crop.user.toString() !== user._id.toString())
        {
            return res.status(401).send("X X X NOT ALLOWED X X X X");
        }
       crop = await Fertilizer.findByIdAndDelete(req.params.id) ;
       res.json({"SUCCESS":" DELETED ", crop:crop});
        }
        catch(error){
            console.error(error.message);
            res.status(500).send("INTERNAL SERVER  ERROR ");
        }
    })





module.exports = router;

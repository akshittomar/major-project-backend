const express = require('express');
const router = express.Router();
const { loadPyodide } = require('pyodide');
const User = require('../models/User');
const Crops = require('../models/Crops');
const fs = require('fs');
const path = require('path');

router.post('/croprecommend', async (req, res) => {
    try {
        const { email, rain, temp, humid, nitro, p, k, ph } = req.body;

        console.log("data " + email +" "+rain +" "+ temp +" "+humid + " "+nitro + " "+p+" "+k+" "+ph);
        const user = await User.findOne({ email: email });
        console.log("user yeh hai" + user);

        var prediction = "Assumed Value ";

        const pyodide = await loadPyodide();
        await pyodide.loadPackage(['micropip', 'pandas', 'scikit-learn']);

        // Read the CSV file
        const filePath = path.join(__dirname, '../routes/Crop_recommendation.csv');
        const csvData = fs.readFileSync(filePath, 'utf8');

        // Python code to run in Pyodide
        const code = `
import pandas as pd
import numpy as np
from io import StringIO
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Read the CSV data
csv_data = '''${csvData.replace(/'/g, "''")}'''
dataset = pd.read_csv(StringIO(csv_data))

# Input parameters directly as integers/floats
n_params = ${nitro}
p_params = ${p}
k_params = ${k}
t_params = ${temp}
h_params = ${humid}
ph_params = ${ph}
r_params = ${rain}

# Divide the dataset into features and labels
X = dataset.iloc[:, :-1].values
y = dataset.iloc[:, -1].values

# Split the dataset into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

# Train the model using the Random Forest Classifier algorithm
classifier = RandomForestClassifier(n_estimators=10, criterion='entropy', random_state=0)
classifier.fit(X_train, y_train)

# Get the user inputs and store them in a numpy array
user_input = np.array([[n_params, p_params, k_params, t_params, h_params, ph_params, r_params]])

# Make predictions using the trained model
predictions = classifier.predict(user_input)

# Return the predicted crop
prediction = str(predictions[0])
`;

        await pyodide.runPythonAsync(code);

         prediction = pyodide.globals.get('prediction');
        console.log("Predicted crop:", prediction);

        const crop = new Crops({
            rain, temp, humid, nitro, p, k, user: user._id, ph, prediction
        });
        const savedCrop = await crop.save();
        console.log("THIS CROP GOT Predicted " + savedCrop);
        
        res.send(savedCrop);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER ERROR");
    }
});

module.exports = router;

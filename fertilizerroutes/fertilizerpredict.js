const express = require('express');
const router = express.Router();
const { loadPyodide } = require('pyodide');
const User = require('../models/User');
const Fertilizer = require('../models/Fertilizer');
const fs = require('fs');
const path = require('path');
const base64 = require('base64-js');

// Base64 encoded strings for the models (generated from the Python script)
const modelBase64 = 'gASVIwIAAAAAAACMFXNrbGVhcm4udHJlZS5fY2xhc3Nlc5SMFkRlY2lzaW9uVHJlZUNsYXNzaWZpZXKUk5QpgZR9lCiMCWNyaXRlcmlvbpSMBGdpbmmUjAhzcGxpdHRlcpSMBGJlc3SUjAltYXhfZGVwdGiUTowRbWluX3NhbXBsZXNfc3BsaXSUSwKMEG1pbl9zYW1wbGVzX2xlYWaUSwGMGG1pbl93ZWlnaHRfZnJhY3Rpb25fbGVhZpRHAAAAAAAAAACMDG1heF9mZWF0dXJlc5ROjA5tYXhfbGVhZl9ub2Rlc5ROjAxyYW5kb21fc3RhdGWUSwCMFW1pbl9pbXB1cml0eV9kZWNyZWFzZZRHAAAAAAAAAACMDGNsYXNzX3dlaWdodJROjAljY3BfYWxwaGGURwAAAAAAAAAAjA1tb25vdG9uaWNfY3N0lE6MEWZlYXR1cmVfbmFtZXNfaW5flIwTam9ibGliLm51bXB5X3BpY2tsZZSMEU51bXB5QXJyYXlXcmFwcGVylJOUKYGUfZQojAhzdWJjbGFzc5SMBW51bXB5lIwHbmRhcnJheZSTlIwFc2hhcGWUSwiFlIwFb3JkZXKUjAFDlIwFZHR5cGWUaBtoIpOUjAJPOJSJiIeUUpQoSwOMAXyUTk5OSv////9K/////0s/dJRijAphbGxvd19tbWFwlImMG251bXB5X2FycmF5X2FsaWdubWVudF9ieXRlc5RLEHVigAJjbnVtcHkuY29yZS5tdWx0aWFycmF5Cl9yZWNvbnN0cnVjdApxAGNudW1weQpuZGFycmF5CnEBSwCFcQJjX2NvZGVjcwplbmNvZGUKcQNYAQAAAGJxBFgGAAAAbGF0aW4xcQWGcQZScQeHcQhScQkoSwFLCIVxCmNudW1weQpkdHlwZQpxC1gCAAAATzhxDImIh3ENUnEOKEsDWAEAAAB8cQ9OTk5K/////0r/////Sz90cRBiiV1xEShYCwAAAFRlbXBhcmF0dXJlcRJYCAAAAEh1bWlkaXR5cRNYCgAAAFNvaWxfTW9pc3RxFFgJAAAAU29pbF9UeXBlcRVYCQAAAENyb3BfVHlwZXEWWAgAAABOaXRyb2dlbnEXWAkAAABQb3Rhc3NpdW1xGFgLAAAAUGhvc3Bob3JvdXNxGWV0cRpiLpVQAAAAAAAAAIwObl9mZWF0dXJlc19pbl+USwiMCm5fb3V0cHV0c1+USwGMCGNsYXNzZXNflGgXKYGUfZQoaBpoHWgeSweFlGggaCFoImgmaCmJaCpLEHVigAJjbnVtcHkuY29yZS5tdWx0aWFycmF5Cl9yZWNvbnN0cnVjdApxAGNudW1weQpuZGFycmF5CnEBSwCFcQJjX2NvZGVjcwplbmNvZGUKcQNYAQAAAGJxBFgGAAAAbGF0aW4xcQWGcQZScQeHcQhScQkoSwFLB4VxCmNudW1weQpkdHlwZQpxC1gCAAAATzhxDImIh3ENUnEOKEsDWAEAAAB8cQ9OTk5K/////0r/////Sz90cRBiiV1xEShYCAAAADEwLTI2LTI2cRJYCAAAADE0LTM1LTE0cRNYCAAAADE3LTE3LTE3cRRYBQAAADIwLTIwcRVYBQAAADI4LTI4cRZYAwAAAERBUHEXWAQAAABVcmVhcRhldHEZYi6VwgAAAAAAAACMCm5fY2xhc3Nlc1+UjBVudW1weS5jb3JlLm11bHRpYXJyYXmUjAZzY2FsYXKUk5RoI4wCaTiUiYiHlFKUKEsDjAE8lE5OTkr/////Sv////9LAHSUYkMIBwAAAAAAAACUhpRSlIwNbWF4X2ZlYXR1cmVzX5RLCIwFdHJlZV+UjBJza2xlYXJuLnRyZWUuX3RyZWWUjARUcmVllJOUSwhoFymBlH2UKGgaaB1oHksBhZRoIGghaCJoN2gpiGgqSxB1Ygz///////////////8HAAAAAAAAAJVpAQAAAAAAAEsBh5RSlH2UKGgJSwaMCm5vZGVfY291bnSUSw2MBW5vZGVzlGgXKYGUfZQoaBpoHWgeSw2FlGggaCFoImgjjANWNjSUiYiHlFKUKEsDaCdOKIwKbGVmdF9jaGlsZJSMC3JpZ2h0X2NoaWxklIwHZmVhdHVyZZSMCXRocmVzaG9sZJSMCGltcHVyaXR5lIwObl9ub2RlX3NhbXBsZXOUjBd3ZWlnaHRlZF9uX25vZGVfc2FtcGxlc5SMEm1pc3NpbmdfZ29fdG9fbGVmdJR0lH2UKGhQaDdLAIaUaFFoN0sIhpRoUmg3SxCGlGhTaCOMAmY4lImIh5RSlChLA2g4Tk5OSv////9K/////0sAdJRiSxiGlGhUaF9LIIaUaFVoN0sohpRoVmhfSzCGlGhXaCOMAnUxlImIh5RSlChLA2gnTk5OSv////9K/////0sAdJRiSziGlHVLQEsBSxB0lGJoKYhoKksQdWIF//////8BAAAAAAAAAAIAAAAAAAAABwAAAAAAAAAAAAAAAAAQQBIIc2yI0eo/YwAAAAAAAAAAAAAAAMBYQAAAAAAAAAAA//////////////////////7/////////AAAAAAAAAMAAAAAAAAAAABYAAAAAAAAAAAAAAAAANkAAAAAAAAAAAAMAAAAAAAAADAAAAAAAAAAHAAAAAAAAAAAAAAAAAEFA+r4R3QAM6j9NAAAAAAAAAAAAAAAAQFNAAQAAAAAAAAAEAAAAAAAAAAsAAAAAAAAABQAAAAAAAAAAAAAAAAAyQHuPCS6+1ug/OwAAAAAAAAAAAAAAAIBNQAEAAAAAAAAABQAAAAAAAAAKAAAAAAAAAAcAAAAAAAAAAAAAAACANUDHcRzHcRznPyoAAAAAAAAAAAAAAAAARUABAAAAAAAAAAYAAAAAAAAABwAAAAAAAAAGAAAAAAAAAAAAAAAAABRAAAAAAAAA5D8cAAAAAAAAAAAAAAAAADxAAAAAAAAAAAD//////////////////////v////////8AAAAAAAAAwAAAAAAAAAAADgAAAAAAAAAAAAAAAAAsQAAAAAAAAAAACAAAAAAAAAAJAAAAAAAAAAYAAAAAAAAAAAAAAAAAL0AAAAAAAADgPw4AAAAAAAAAAAAAAAAALEAAAAAAAAAAAP/////////////////////+/////////wAAAAAAAADAAAAAAAAAAAAHAAAAAAAAAAAAAAAAABxAAAAAAAAAAAD//////////////////////v////////8AAAAAAAAAwAAAAAAAAAAABwAAAAAAAAAAAAAAAAAcQAAAAAAAAAAA//////////////////////7/////////AAAAAAAAAMAAAAAAAAAAAA4AAAAAAAAAAAAAAAAALEAAAAAAAAAAAP/////////////////////+/////////wAAAAAAAADAAAAAAAAAAAARAAAAAAAAAAAAAAAAADFAAAAAAAAAAAD//////////////////////v////////8AAAAAAAAAwAAAAAAAAAAAEgAAAAAAAAAAAAAAAAAyQAAAAAAAAAAAlTAAAAAAAAAAjAZ2YWx1ZXOUaBcpgZR9lChoGmgdaB5LDUsBSweHlGggaCFoImhfaCmIaCpLEHViBv///////29nSMzbGbI/b2dIzNsZwj9vZ0jM2xmyP29nSMzbGcI/UOtXCtT6xT9GF1100UXHPxzHcRzHccw/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8D9GF1100UW3P0YXXXTRRcc/RhdddNFFtz9GF1100UXHP/kJcVZ+Qsw/NbB3TA3szT8AAAAAAAAAAFcEDSd1X74/VwQNJ3Vfzj9XBA0ndV++P1cEDSd1X84/fnlsRdBw0j8AAAAAAAAAAAAAAAAAAAAAVVVVVVVVxT9VVVVVVVXVP1VVVVVVVcU/VVVVVVVV1T8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQPwAAAAAAAAAAAAAAAAAA0D8AAAAAAADgPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4D8AAAAAAAAAAAAAAAAAAOA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8D8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwPwAAAAAAAAAAlSAAAAAAAAAAdWKMEF9za2xlYXJuX3ZlcnNpb26UjAUxLjQuMpR1Yi4=';
const soilEncoderBase64 = 'gASVDAEAAAAAAACMHHNrbGVhcm4ucHJlcHJvY2Vzc2luZy5fbGFiZWyUjAxMYWJlbEVuY29kZXKUk5QpgZR9lCiMCGNsYXNzZXNflIwTam9ibGliLm51bXB5X3BpY2tsZZSMEU51bXB5QXJyYXlXcmFwcGVylJOUKYGUfZQojAhzdWJjbGFzc5SMBW51bXB5lIwHbmRhcnJheZSTlIwFc2hhcGWUSwWFlIwFb3JkZXKUjAFDlIwFZHR5cGWUaAxoE5OUjAJPOJSJiIeUUpQoSwOMAXyUTk5OSv////9K/////0s/dJRijAphbGxvd19tbWFwlImMG251bXB5X2FycmF5X2FsaWdubWVudF9ieXRlc5RLEHVigAJjbnVtcHkuY29yZS5tdWx0aWFycmF5Cl9yZWNvbnN0cnVjdApxAGNudW1weQpuZGFycmF5CnEBSwCFcQJjX2NvZGVjcwplbmNvZGUKcQNYAQAAAGJxBFgGAAAAbGF0aW4xcQWGcQZScQeHcQhScQkoSwFLBYVxCmNudW1weQpkdHlwZQpxC1gCAAAATzhxDImIh3ENUnEOKEsDWAEAAAB8cQ9OTk5K/////0r/////Sz90cRBiiV1xEShYBQAAAEJsYWNrcRJYBgAAAENsYXlleXETWAUAAABMb2FteXEUWAMAAABSZWRxFVgFAAAAU2FuZHlxFmV0cRdiLpUeAAAAAAAAAIwQX3NrbGVhcm5fdmVyc2lvbpSMBTEuNC4ylHViLg==';
const cropEncoderBase64 = 'gASVDAEAAAAAAACMHHNrbGVhcm4ucHJlcHJvY2Vzc2luZy5fbGFiZWyUjAxMYWJlbEVuY29kZXKUk5QpgZR9lCiMCGNsYXNzZXNflIwTam9ibGliLm51bXB5X3BpY2tsZZSMEU51bXB5QXJyYXlXcmFwcGVylJOUKYGUfZQojAhzdWJjbGFzc5SMBW51bXB5lIwHbmRhcnJheZSTlIwFc2hhcGWUSwuFlIwFb3JkZXKUjAFDlIwFZHR5cGWUaAxoE5OUjAJPOJSJiIeUUpQoSwOMAXyUTk5OSv////9K/////0s/dJRijAphbGxvd19tbWFwlImMG251bXB5X2FycmF5X2FsaWdubWVudF9ieXRlc5RLEHVigAJjbnVtcHkuY29yZS5tdWx0aWFycmF5Cl9yZWNvbnN0cnVjdApxAGNudW1weQpuZGFycmF5CnEBSwCFcQJjX2NvZGVjcwplbmNvZGUKcQNYAQAAAGJxBFgGAAAAbGF0aW4xcQWGcQZScQeHcQhScQkoSwFLC4VxCmNudW1weQpkdHlwZQpxC1gCAAAATzhxDImIh3ENUnEOKEsDWAEAAAB8cQ9OTk5K/////0r/////Sz90cRBiiV1xEShYBgAAAEJhcmxleXESWAYAAABDb3R0b25xE1gLAAAAR3JvdW5kIE51dHNxFFgFAAAATWFpemVxFVgHAAAATWlsbGV0c3EWWAkAAABPaWwgc2VlZHNxF1gFAAAAUGFkZHlxGFgGAAAAUHVsc2VzcRlYCQAAAFN1Z2FyY2FuZXEaWAcAAABUb2JhY2NvcRtYBQAAAFdoZWF0cRxldHEdYi6VHgAAAAAAAACMEF9za2xlYXJuX3ZlcnNpb26UjAUxLjQuMpR1Yi4=';

router.post('/fertilizerrecommend', async (req, res) => {
    try {
        const { Temperature, Humidity, Soil_Moist, Soil_Type, Crop_Type, Nitrogen, Potassium, Phosphorous, email } = req.body;

        console.log("email is this: " + email);
        const user = await User.findOne({ email: email });
        console.log("user is this: " + user);

        const pyodide = await loadPyodide();
        await pyodide.loadPackage(['micropip', 'pandas', 'scikit-learn', 'joblib']);

        // Python code to run in Pyodide
        const code = `
import joblib
import pandas as pd
import numpy as np
import base64
from io import BytesIO

# Load the model
model_data = base64.b64decode('${modelBase64}')
model = joblib.load(BytesIO(model_data))

# Load the soil encoder
soil_encoder_data = base64.b64decode('${soilEncoderBase64}')
le_soil = joblib.load(BytesIO(soil_encoder_data))

# Load the crop encoder
crop_encoder_data = base64.b64decode('${cropEncoderBase64}')
le_crop = joblib.load(BytesIO(crop_encoder_data))

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
X_columns = ['Temparature', 'Humidity', 'Soil_Moist', 'Soil_Type', 'Crop_Type', 'Nitrogen', 'Potassium', 'Phosphorous']
user_input_df = pd.DataFrame(user_input, columns=X_columns)

# Make the prediction
fertilizer_name = model.predict(user_input_df)[0]
fertilizer_name
`;

        // Run the Python code in Pyodide
        const prediction = await pyodide.runPythonAsync(code);
        console.log("Predicted fertilizer:", prediction);

        const ferData = new Fertilizer({
            Temperature, Humidity, Soil_Moist, Soil_Type, Crop_Type, Nitrogen, Potassium, Phosphorous, user: user._id, Prediction: prediction
        });
        const saved = await ferData.save();
        console.log("THIS Fertilizer GOT Predicted " + saved);

        res.send(saved);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER ERROR");
    }
});

router.post('/fetchallfertilizer', async (req, res) => {
    try {
        const email = req.body.email;
        console.log("email " + email);
        const user = await User.findOne({ email: email });
        console.log("user " + user);
        const crops = await Fertilizer.find({ user: user._id });
        res.json(crops);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER ERROR");
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        let crop = await Fertilizer.findById(req.params.id);
        if (!crop) {
            return res.status(404).send("NOT FOUND !!!!!");
        }
        const user = await User.findOne({ email: req.body.email });
        if (crop.user.toString() !== user._id.toString()) {
            return res.status(401).send("X X X NOT ALLOWED X X X X");
        }
        crop = await Fertilizer.findByIdAndDelete(req.params.id);
        res.json({ "SUCCESS": "DELETED", crop: crop });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("INTERNAL SERVER ERROR");
    }
});

module.exports = router;

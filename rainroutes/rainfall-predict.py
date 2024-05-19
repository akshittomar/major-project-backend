import pandas as pd
import sys

# Load the dataset into a dataframe
df = pd.read_csv('rain-data.csv')

# Define a function to predict rainfall for a given state, district, and month
def predict_rainfall(state, city, month):
    # Filter the dataframe to only include rows with the given state and district
    state_data = df[(df['STATE'] == state)]

    # Calculate the average rainfall for the given month across all the years
    avg_rainfall = state_data[month].mean()
    
    # Return the predicted rainfall for the given month
    return avg_rainfall

# Get the input parameters as command line arguments
Jregion = sys.argv[1]  # State
Jcity = sys.argv[2]    # City
Jmonth = sys.argv[3]   # Month

predicted_rainfall = predict_rainfall(Jregion, Jcity, Jmonth)
print(predicted_rainfall)

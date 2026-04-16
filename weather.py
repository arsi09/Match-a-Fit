import requests
import json

def get_weather():
    # --- CONFIGURATION ---
    API_KEY = "7bc784d7cb7a17f7040de21df0667716"
    BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

    # 1. Ask the user for the location
    city = input("Enter city name: ")

    # 2. Set up parameters (units='metric' gives Celsius, 'imperial' gives Fahrenheit)
    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric" 
    }

    try:
        # 3. Fetch the data
        response = requests.get(BASE_URL, params=params)
        data = response.json()

        # Check if the city was found (Status code 200 is success)
        if response.status_code == 200:
            # Extract specific data
            weather_data = {
                "city": data["name"],
                "temperature": f"{data['main']['temp']}°C",
                "condition": data["weather"][0]["main"],
                "description": data["weather"][0]["description"]
            }

            # 4. Save to a simple JSON file
            filename = "weather_report.json"
            with open(filename, "w") as f:
                json.dump(weather_data, f, indent=4)

            print(f"\nSuccess! Weather for {city} saved to {filename}")
            print(f"Current Condition: {weather_data['condition']} ({weather_data['description']})")
            print(f"Temperature: {weather_data['temperature']}")
        
        else:
            print(f"Error: {data.get('message', 'City not found.')}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    get_weather()
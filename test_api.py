import urllib.request
import json

# Check Open-Notify for astronauts
try:
    with urllib.request.urlopen('http://api.open-notify.org/astros.json') as response:
        data = json.loads(response.read().decode())
        print("Open-Notify Astros:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print(e)

print("\n----------------\n")

# Check Wheretheiss for ISS position and orbit properties
try:
    with urllib.request.urlopen('https://api.wheretheiss.at/v1/satellites/25544') as response:
        data = json.loads(response.read().decode())
        print("Where The ISS At:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print(e)

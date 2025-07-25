import urllib.request
import json
import time

print('Quick API test...')
start = time.time()
try:
    with urllib.request.urlopen('http://localhost:8000/api/datasets?limit=3', timeout=15) as response:
        data = json.loads(response.read().decode())
        end = time.time()
        print(f'✅ Response time: {end-start:.1f}s')
        print(f'Datasets: {len(data.get("datasets", []))}')
        if data.get("datasets"):
            print(f'First dataset: {data["datasets"][0].get("name", "N/A")}')
except Exception as e:
    print(f'❌ Error: {e}')
import requests
import json

# Create a test file
with open('test_file.json', 'w') as f:
    json.dump({"test": "data"}, f)

# Test file upload
files = {'file': open('test_file.json', 'rb')}
upload_response = requests.post('http://localhost:3001/upload', files=files)
print("Upload response:", upload_response.json())

# Get the root hash from response
root_hash = upload_response.json().get('rootHash')

# Test file download
download_response = requests.get(f'http://localhost:3001/download/{root_hash}')
print("Download status:", download_response.status_code)

# Test key-value storage
kv_data = {'key': 'test_key', 'value': {'name': 'test_value'}}
kv_response = requests.post('http://localhost:3001/kv', json=kv_data)
print("KV store response:", kv_response.json())

# Test key-value retrieval
kv_get_response = requests.get('http://localhost:3001/kv/test_key')
print("KV get response:", kv_get_response.json())

# integrations/0g_storage/typescript_client.py

import requests
import json

class ZeroGStorageClient:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        
    def upload_file(self, file_path):
        """Upload a file to 0G Storage using the TypeScript service"""
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{self.base_url}/upload", files=files)
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Upload failed: {response.text}")
                
    def download_file(self, root_hash, output_path):
        """Download a file from 0G Storage using the TypeScript service"""
        response = requests.get(f"{self.base_url}/download/{root_hash}", stream=True)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        else:
            raise Exception(f"Download failed: {response.text}")
            
    def store_key_value(self, key, value):
        """Store a key-value pair using the TypeScript service"""
        data = {'key': key, 'value': value}
        response = requests.post(f"{self.base_url}/kv", json=data)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Key-value storage failed: {response.text}")
            
    def retrieve_key_value(self, key):
        """Retrieve a key-value pair using the TypeScript service"""
        response = requests.get(f"{self.base_url}/kv/{key}")
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Key-value retrieval failed: {response.text}")

import requests

class KeyValueStorage:
    def __init__(self, base_url):
        self.base_url = base_url

    def set_key_value(self, key, value):
        payload = {"key": key, "value": value}
        response = requests.post(f"{self.base_url}/set", json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Key-Value set failed: {response.text}")

    def get_key_value(self, key):
        response = requests.get(f"{self.base_url}/get/{key}")
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Key-Value get failed: {response.text}")

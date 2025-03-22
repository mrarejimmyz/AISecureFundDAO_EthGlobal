import requests

class BlobStorage:
    def __init__(self, base_url):
        self.base_url = base_url

    def upload_blob(self, file_path):
        with open(file_path, "rb") as file:
            response = requests.post(f"{self.base_url}/upload", files={"file": file})
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Blob upload failed: {response.text}")

    def retrieve_blob(self, blob_id):
        response = requests.get(f"{self.base_url}/retrieve/{blob_id}")
        if response.status_code == 200:
            return response.content
        else:
            raise Exception(f"Blob retrieval failed: {response.text}")

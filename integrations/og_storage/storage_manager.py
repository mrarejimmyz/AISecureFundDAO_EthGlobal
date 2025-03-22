# integrations/0g_storage/storage_manager.py

from integrations.og_storage.typescript_client import ZeroGStorageClient

class StorageManager:
    def __init__(self, service_url="http://localhost:3001"):
        self.client = ZeroGStorageClient(service_url)
    
    def upload_file(self, file_path):
        return self.client.upload_file(file_path)
    
    def retrieve_file(self, blob_id, output_path):
        return self.client.download_file(blob_id, output_path)
    
    def store_metadata(self, key, value):
        return self.client.store_key_value(key, value)
    
    def retrieve_metadata(self, key):
        response = self.client.retrieve_key_value(key)
        return response.get("value") if response else None

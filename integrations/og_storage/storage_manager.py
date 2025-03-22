# integrations/0g_storage/storage_manager.py

from integrations.og_storage.typescript_client import ZeroGStorageClient

class StorageManager:
    def __init__(self, service_url="http://localhost:3001"):
        self.service_url = service_url
    
    # De-prioritize blob storage but keep the method
    def upload_file(self, file_path):
        # For hackathon demo, simply log that this would upload a file
        print(f"NOTICE: Blob storage upload not functioning. Would have uploaded: {file_path}")
        return {"rootHash": f"simulated-hash-{hash(file_path)}", "transactionHash": "simulated-tx"}
    
    # De-prioritize blob storage but keep the method
    def retrieve_file(self, blob_id, output_path):
        # For hackathon demo, simply log that this would download a file
        print(f"NOTICE: Blob storage download not functioning. Would have downloaded to: {output_path}")
        return False
    
    # Focus on these two working methods
    def store_metadata(self, key, value):
        # This method is working - use it for your demo
        from integrations.og_storage.typescript_client import ZeroGStorageClient
        client = ZeroGStorageClient(self.service_url)
        return client.store_key_value(key, value)
    
    def retrieve_metadata(self, key):
        # This method is working - use it for your demo
        from integrations.og_storage.typescript_client import ZeroGStorageClient
        client = ZeroGStorageClient(self.service_url)
        response = client.retrieve_key_value(key)
        return response.get("value") if response else None


import random
import string
from datetime import datetime, timedelta
import base64
import json

def generate_key():
    prefix = "SIGMA-"
    key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    
    # Expiration date (1 month from now)
    expiry_date = (datetime.utcnow() + timedelta(days=30)).isoformat()

    # Create key payload
    payload = {
        "key": key,
        "expiry": expiry_date
    }

    # Encode payload to Base64
    encoded_payload = base64.b64encode(json.dumps(payload).encode()).decode()
    
    return f"{prefix}{encoded_payload}"

if __name__ == "__main__":
    key = generate_key()
    print(f"Generated Key: {key}")

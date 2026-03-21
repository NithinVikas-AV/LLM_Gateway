import requests

UNIVERSAL_KEY = "llmgw-FTkg1b7zZHu4hzo6-9PARHbjhWITyyoirzOtu2yXTbA"   # paste your actual key
BASE_URL = "http://localhost:8000"

response = requests.post(
    f"{BASE_URL}/gateway/chat",
    headers={"x-api-key": UNIVERSAL_KEY},
    json={
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Say hello"}]
    }
)

print("Status:", response.status_code)
print("Response:", response.text)   # use .text not .json() so we see the raw error
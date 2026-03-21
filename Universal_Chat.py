import requests

UNIVERSAL_KEY = "llmgw-V0PEy0H77383-ihox-dUxj5-mJElxI7__2we_oQKq2w"
BASE_URL = "https://llmgateway-production.up.railway.app"

response = requests.post(
    f"{BASE_URL}/gateway/chat",
    headers={"x-api-key": UNIVERSAL_KEY},
    json={
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Say hello"}]
    }
)

data = response.json()
print(data["content"])
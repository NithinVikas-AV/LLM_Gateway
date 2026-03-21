import requests

UNIVERSAL_KEY = "llmgw-gp6aSQ7bUH0dGnnF93JN940bprI7cLn_TlvmeuW0XEY"
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
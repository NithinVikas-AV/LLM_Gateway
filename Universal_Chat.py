import requests

UNIVERSAL_KEY = "llmgw-b9xzdAfQPBrE_Og1qQkkwDC2ZLp-pxbvb78FYF1ZsV8"   # paste your universal key
BASE_URL = "http://localhost:8000"

response = requests.post(
    f"{BASE_URL}/gateway/chat",
    headers={"x-api-key": UNIVERSAL_KEY},
    json={
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": "Say hello in one sentence"}
        ]
    }
)

data = response.json()
print("Reply:   ", data["content"])
print("Tokens:  ", data["input_tokens"] + data["output_tokens"])
print("Cost:    $", data["cost_usd"])
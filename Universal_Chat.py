from langchain_core.language_models.llms import LLM
import requests

UNIVERSAL_KEY = "llmgw--P-VrlknMGAGItxixsIOK8qJs-LdYlXcUISEDOTCS4w"

class LLMGateway(LLM):
    universal_key: str
    model: str = "llama-3.3-70b-versatile"
    base_url: str = "https://llmgateway-production.up.railway.app"

    def _call(self, prompt: str, **kwargs) -> str:
        response = requests.post(
            f"{self.base_url}/gateway/chat",
            headers={"x-api-key": self.universal_key},
            json={
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        return response.json()["content"]

    @property
    def _llm_type(self) -> str:
        return "llm-gateway"

# Use it like any LangChain LLM
llm = LLMGateway(universal_key=UNIVERSAL_KEY)
result = llm.invoke("What is the capital of France?")
print(result)
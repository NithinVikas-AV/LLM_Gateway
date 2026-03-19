from pydantic import BaseModel
from typing import Optional

class Message(BaseModel):
    role: str
    content: str

class GatewayRequest(BaseModel):
    model: str
    messages: list[Message]
    temperature: Optional[float] = 0.1
    max_tokens: Optional[int] = 1000

class GatewayResponse(BaseModel):
    model: str
    provider: str
    content: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
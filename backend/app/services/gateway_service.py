# proxy call to OpenAI/Gemini

from google import genai
from google.genai import types
from groq import Groq
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.schemas.gateway import GatewayRequest, GatewayResponse
from app.services.key_service import get_decrypted_key
from app.services.rate_limiter import(
    check_and_increment_rpm,
    check_daily_token_limit,
    check_monthly_cost_limit,
    increment_token_usage
)
from app.services.usage_service import log_usage, calculate_cost
from app.models.universal_key import UniversalKey

# ── Model → Provider mapping ───────────────────
MODEL_PROVIDER_MAP = {
    # Gemini free tier
    "gemini-2.5-flash":     "gemini",

    # Groq free tier
    "llama-3.3-70b-versatile":"groq",
}

# Add this list at the top of gateway_service.py
BLOCKED_KEYWORDS = [
    "ignore previous instructions",
    "ignore all instructions",
    "jailbreak",
    "dan mode",
    "pretend you are",
]

def check_guardrails(messages: list):
    for msg in messages:
        content_lower = msg.content.lower()
        for keyword in BLOCKED_KEYWORDS:
            if keyword in content_lower:
                raise HTTPException(
                    status_code=400,
                    detail=f"Request blocked by input guardrails"
                )

def get_provider_for_model(model: str) -> str:
    provider = MODEL_PROVIDER_MAP.get(model)
    if not provider:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model: {model}. Supported: {list(MODEL_PROVIDER_MAP.keys())}"
        )
    return provider

# ---------- Gemini ------------------------------

async def call_gemini(api_key: str, request: GatewayRequest) -> dict:
    try:
        client = genai.Client(api_key=api_key)

        # Convert messages to Gemini format
        contents = [
            types.Content(
                role="user" if msg.role == "user" else "model",
                parts=[types.Part(text=msg.content)]
            )
            for msg in request.messages
        ]

        response = client.models.generate_content(
            model=request.model,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=request.temperature,
                max_output_tokens=request.max_tokens,
            )
        )

        input_tokens = getattr(response.usage_metadata, "prompt_token_count", 0) or 0
        output_tokens = getattr(response.usage_metadata, "candidates_token_count", 0) or 0

        return {
            "content": response.text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini error: {str(e)}")

# ---------- Groq ------------------------------

async def call_groq(
        api_key: str,
        request: GatewayRequest
) -> dict:
    try:
        client = Groq(api_key=api_key)

        # Groq uses OpenAI-compatible format - Very clean
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]

        response = client.chat.completions.create(
            model=request.model,
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )

        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens

        return{
            "content": response.choices[0].message.content,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens
        }
    
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq error: {str(e)}")
    

# ---------- Main Gateway Function ------------------------------

async def process_gateway_request(
        request: GatewayRequest,
        universal_key: UniversalKey,
        db: Session
) -> GatewayResponse:
    
    provider = get_provider_for_model(request.model)

    # 0. Guardrails first — before anything else
    check_guardrails(request.messages)

    # 1. Run all rate limit checks before doing anything
    check_and_increment_rpm(str(universal_key.id), request.model, db)
    check_daily_token_limit(str(universal_key.id), request.model, db)
    check_monthly_cost_limit(str(universal_key.id), request.model, db)

    # 2. Get the decrypted provider API key for this user
    api_key = get_decrypted_key(db, universal_key.user_id, provider)

    # Call the right provider
    if provider == "gemini":
        result = await call_gemini(api_key, request)
    elif provider == "groq":
        result = await call_groq(api_key, request)
    else:
        raise HTTPException(status_code=400, detail=f"Provider {provider} not implemented")
    
    # 4. Increment token usage in Redis
    cost = calculate_cost(request.model, result["input_tokens"], result["output_tokens"])
    
    # Step 5 — this should NOT have content
    log_usage(
        db=db,
        universal_key_id=universal_key.id,
        user_id=universal_key.user_id,
        model=request.model,
        provider=provider,
        input_tokens=result["input_tokens"],
        output_tokens=result["output_tokens"],
        status="success"                     # ends here, no content
    )

    # Return — this SHOULD have content, it's correct
    return GatewayResponse(
        model=request.model,
        provider=provider,
        content=result["content"],           # correct
        input_tokens=result["input_tokens"],
        output_tokens=result["output_tokens"],
        cost_usd=cost
    )
"""Knowledge Graph - Auth verification for forward_auth and API protection."""

import base64
import hashlib
import hmac
from urllib.parse import quote

import jwt
from fastapi import APIRouter, Cookie, Request
from fastapi.responses import RedirectResponse

from app.config import get_settings

router = APIRouter()

LOGIN_URL = "/login"
KNOWLEDGE_ORIGIN = ""


def _derive_access_key(secret: str) -> str:
    """Derive the access-token signing key — must match admin app's HMAC-SHA256(secret, 'access')."""
    return base64.b64encode(
        hmac.new(secret.encode(), b"access", hashlib.sha256).digest()
    ).decode()


def _verify_token(token: str) -> dict:
    """Verify a JWT token and return its payload. Raises ValueError on failure."""
    settings = get_settings()
    if not settings.jwt_secret:
        raise ValueError("JWT_SECRET not configured")
    key = _derive_access_key(settings.jwt_secret)
    return jwt.decode(token, key, algorithms=["HS256"])


@router.get("/auth/verify")
async def verify_auth(
    request: Request,
    kg_access_token: str | None = Cookie(default=None),
):
    """Caddy forward_auth endpoint. Returns 200 if valid, redirects to login if not."""
    if not kg_access_token:
        return _login_redirect(request)
    try:
        _verify_token(kg_access_token)
    except (ValueError, jwt.InvalidTokenError):
        return _login_redirect(request)
    return {"status": "ok"}


def _login_redirect(request: Request) -> RedirectResponse:
    """Build redirect to admin login with return URL."""
    # X-Forwarded-Uri is set by Caddy's forward_auth
    original_uri = request.headers.get("X-Forwarded-Uri", "/")
    redirect_target = quote(f"{KNOWLEDGE_ORIGIN}{original_uri}", safe="")
    return RedirectResponse(
        url=f"{LOGIN_URL}?redirect={redirect_target}",
        status_code=302,
    )



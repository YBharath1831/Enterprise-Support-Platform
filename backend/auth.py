"""
Entra ID bearer-token validation for the fde-backend-api Container App.
The frontend (fde-frontend-ui SPA) acquires a token for the
api://<backend-client-id>/access_as_user scope via MSAL and sends it as
Authorization: Bearer <token>. This module verifies that token's signature,
issuer, audience and expiry against Entra ID's public JWKS before any
protected route runs - it does not touch the ticket pipeline itself.
"""
import logging

import jwt
from fastapi import Header, HTTPException
from jwt import PyJWKClient

from config import settings

logger = logging.getLogger("auth")

_TENANT_ID = settings.ENTRA_TENANT_ID
_BACKEND_CLIENT_ID = settings.ENTRA_BACKEND_CLIENT_ID
# Entra ID issues either v1.0 tokens (iss = sts.windows.net/<tenant>/) or
# v2.0 tokens (iss = login.microsoftonline.com/<tenant>/v2.0) depending on
# the API app registration's accessTokenAcceptedVersion setting - accept
# both rather than forcing a manifest edit.
_ACCEPTED_ISSUERS = {
    f"https://login.microsoftonline.com/{_TENANT_ID}/v2.0",
    f"https://sts.windows.net/{_TENANT_ID}/",
}
_JWKS_URL = f"https://login.microsoftonline.com/{_TENANT_ID}/discovery/v2.0/keys"
_AUDIENCE = f"api://{_BACKEND_CLIENT_ID}"

# PyJWKClient caches keys internally and refetches on kid miss (e.g. key rotation).
_jwk_client = PyJWKClient(_JWKS_URL)


async def verify_token(authorization: str = Header(None)) -> dict:
    """FastAPI dependency - raises 401 if the bearer token is missing/invalid,
    otherwise returns the decoded claims (caller can read claims['name'],
    claims['preferred_username'], etc. if needed for audit logging)."""
    if not settings.ENTRA_AUTH_ENABLED:
        return {"sub": "auth-disabled"}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]

    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=_AUDIENCE,
        )
        if claims.get("iss") not in _ACCEPTED_ISSUERS:
            logger.warning("Unexpected token issuer: %s", claims.get("iss"))
            raise HTTPException(status_code=401, detail="Invalid token issuer")
        return claims
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.warning("Token validation failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token")

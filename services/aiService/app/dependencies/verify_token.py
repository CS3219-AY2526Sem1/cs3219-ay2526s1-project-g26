from typing import Annotated

import httpx
from fastapi import Header, HTTPException

from app.config import settings


async def verify_token(authorization: Annotated[str | None, Header()] = None):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    headers = {"Authorization": authorization}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.USER_AUTH_SERVICE_URL}/verify-token", headers=headers
            )

    except httpx.ConnectError as e:
        print(e)
        print(f"Connection error: Could not connect to user service")
        raise HTTPException(status_code=500, detail="Server is unavailable")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(
            status_code=500, detail="An internal error occurred while verifying token"
        )

    if response.status_code == 200:
        return True

    elif response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    else:
        print(f"User service returned unexpected status: {response.status_code}")
        raise HTTPException(
            status_code=500, detail="Token verification service returned an error"
        )

from fastapi import FastAPI, HTTPException
from fastapi.params import Depends

from .dependencies.verify_token import verify_token
from .models.code_translation import CodeTranslationRequest
from .services import ai_service

app = FastAPI()


@app.post("/code-translate", dependencies=[Depends(verify_token)])
async def translate_code(req: CodeTranslationRequest):
    try:
        translated_code = ai_service.translate_code(
            req.from_lang, req.to_lang, req.code
        )
        return {"data": translated_code}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")

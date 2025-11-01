from pydantic import BaseModel


class CodeTranslationRequest(BaseModel):
    from_lang: str
    to_lang: str
    code: str

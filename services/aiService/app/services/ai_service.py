from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings

code_translation_prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            (
                "You are an expert programmer and code translator. "
                "You will be given a piece of code in one language and asked to translate it to another. "
                "You must only output the raw, translated code. "
                "Do not include any verbal explanation, analysis, or markdown '```' fences in your response."
            ),
        ),
        (
            "human",
            "Translate the following code from {from_lang} to {to_lang}:\n\n{code}",
        ),
    ]
)
model = ChatGoogleGenerativeAI(
    google_api_key=settings.GEMINI_API_KEY,
    model="gemini-2.5-flash-lite",
    temperature=0.6,
)

output_parser = StrOutputParser()
code_translation_chain = code_translation_prompt_template | model | output_parser


def translate_code(from_lang: str, to_lang: str, code: str) -> str:
    try:
        translated_code = code_translation_chain.invoke(
            {"from_lang": from_lang, "to_lang": to_lang, "code": code}
        )
        return translated_code
    except Exception as e:
        print(f"Error during LangChain invocation: {e}")
        raise e

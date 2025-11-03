from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings

model = ChatGoogleGenerativeAI(
    google_api_key=settings.GEMINI_API_KEY,
    model="gemini-2.5-flash-lite",
    temperature=0.2,
)


def translate_code(from_lang: str, to_lang: str, code: str) -> str:
    examples = [
        {
            "from_lang": "python",
            "to_lang": "cpp",
            "code": 'def hello_world():\n    print("Hello, World!")',
            "translated_code": '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
        },
        {
            "from_lang": "cpp",
            "to_lang": "javascript",
            "code": "int i = 10;\ni *= j;\ncout << i << endl;",
            "translated_code": "let i = 10;\ni *= j;\nconsole.log(i);",
        },
    ]

    example_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "human",
                "Translate the following code from {from_lang} to {to_lang}:\n\n{code}",
            ),
            ("ai", "{translated_code}"),
        ]
    )

    few_shot_prompt = FewShotChatMessagePromptTemplate(
        examples=examples,
        example_prompt=example_prompt,
    )

    final_prompt_template = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                (
                    "You are an expert programmer and code translator. "
                    "You will be given a piece of code in one language and asked to translate it to another. "
                    "You only need to translate the code without doing optimization or any form of refactor. "
                    "You must only output the raw, translated code. "
                    "Do not include any verbal explanation, analysis, or markdown '```' fences in your response."
                ),
            ),
            few_shot_prompt,
            (
                "human",
                "Translate the following code from {from_lang} to {to_lang}:\n\n{code}",
            ),
        ]
    )

    output_parser = StrOutputParser()
    code_translation_chain = final_prompt_template | model | output_parser

    try:
        translated_code = code_translation_chain.invoke(
            {"from_lang": from_lang, "to_lang": to_lang, "code": code}
        )
        return translated_code
    except Exception as e:
        print(f"Error during LangChain invocation: {e}")
        raise e

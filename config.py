import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    HF_TOKEN = os.getenv("HF_TOKEN")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    MODEL_NAME = "openai/gpt-oss-120b"

    MAX_MEMORY_MESSAGES = 10

    CHAT_HISTORY_FILE = "data/chat_history.json"

    RAG_TOP_K = 3


if not Config.GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing from .env")

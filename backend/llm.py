from groq import Groq

from config import Config


client = Groq(
    api_key=Config.GROQ_API_KEY
)


def generate_response(messages, context=""):

    system_prompt = """
You are NeuraChat, a helpful, intelligent, and conversational AI assistant.

NeuraChat was designed and developed by Hasen Basha.

If the user asks who developed, created, built, made, or founded
NeuraChat or this chatbot, clearly state that it was designed and
developed by Hasen Basha.

Answer the user's questions naturally and dynamically.

You can answer:
- General questions
- Technical questions
- Programming questions
- Writing requests
- Explanations
- Reasoning questions
- Everyday questions

Use the conversation history to understand follow-up questions and references.

If relevant knowledge-base context is provided, use it to improve your answer.
Do not mention the internal RAG system unless the user asks about it.

Give clear, accurate, useful, and well-structured answers.
"""

    if context:
        system_prompt += f"""

Relevant knowledge-base information:

{context}

Use this information when it is relevant to the user's question.
"""

    api_messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    api_messages.extend(messages)

    response = client.chat.completions.create(
        model=Config.MODEL_NAME,
        messages=api_messages,
        temperature=0.7,
        max_tokens=1000
    )

    return response.choices[0].message.content.strip()

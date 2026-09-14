def detect_intent(text):
    text_lower = text.lower()

    intent_keywords = {
        "greeting": [
            "hello", "hi", "hey", "good morning",
            "good afternoon", "good evening"
        ],

        "information_request": [
            "what", "who", "when", "where",
            "tell me", "explain", "information"
        ],

        "technical_question": [
            "python", "api", "code", "coding",
            "rag", "llm", "machine learning",
            "database", "programming"
        ],

        "support_request": [
            "help", "problem", "issue", "error",
            "not working", "failed"
        ],

        "farewell": [
            "bye", "goodbye", "see you",
            "exit", "quit"
        ]
    }

    detected_intent = "general"

    for intent, keywords in intent_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            detected_intent = intent
            break

    return {
        "intent": detected_intent
    }
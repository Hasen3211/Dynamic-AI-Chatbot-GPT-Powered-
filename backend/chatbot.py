
from backend.llm import generate_response
from backend.memory import ConversationMemory
from backend.sentiment import analyze_sentiment
from backend.intent import detect_intent
from backend.ner import extract_entities
from backend.web_search import search_web

from rag.retriever import Retriever


class Chatbot:

    def __init__(self, owner_id=None):

        self.owner_id = owner_id

        self.memory = ConversationMemory(
            owner_id=owner_id
        )

        self.retriever = Retriever()

        # Create the first conversation
        self.memory.create_conversation()

    # =====================================================
    # CURRENT / REAL-TIME INFORMATION DETECTION
    # =====================================================

    def needs_web_search(self, message):

        current_keywords = [

            "current",
            "currently",
            "latest",
            "today",
            "now",
            "recent",
            "recently",
            "this year",
            "this month",
            "this week",

            "who is the current",
            "who is currently",

            "what is the latest",
            "latest news",
            "news",

            "price today",
            "weather today",

            "president",
            "prime minister",
            "chief minister",
            "governor",
            "ceo",

            "election",
            "elections",

            "stock price",
            "share price"
        ]

        message_lower = message.lower()

        return any(
            keyword in message_lower
            for keyword in current_keywords
        )

    # =====================================================
    # CHAT
    # =====================================================

    def chat(self, user_message):

        # -------------------------------------------------
        # 1. Analyze user message
        # -------------------------------------------------

        sentiment_result = analyze_sentiment(
            user_message
        )

        intent_result = detect_intent(
            user_message
        )

        entities = extract_entities(
            user_message
        )

        # -------------------------------------------------
        # 2. Retrieve local RAG context
        # -------------------------------------------------

        context = self.retriever.get_context(
            user_message
        )

        # -------------------------------------------------
        # 3. Web search for current information
        # -------------------------------------------------

        web_results = []

        if self.needs_web_search(user_message):

            web_results = search_web(
                user_message,
                max_results=5
            )

        # -------------------------------------------------
        # 4. Build web context
        # -------------------------------------------------

        web_context = ""

        if web_results:

            web_context = "\n\n".join(
                [
                    f"Title: {result['title']}\n"
                    f"URL: {result['url']}\n"
                    f"Information: {result['snippet']}"
                    for result in web_results
                ]
            )

        # -------------------------------------------------
        # 5. Add user message to current memory
        # -------------------------------------------------

        self.memory.add_message(
            "user",
            user_message
        )

        messages = self.memory.get_messages()

        # -------------------------------------------------
        # 6. Generate AI response
        # -------------------------------------------------

        response = generate_response(

            messages=messages,

            context=context + (

                f"\n\nCurrent Web Information:\n{web_context}"

                if web_context

                else ""
            )
        )

        # -------------------------------------------------
        # 7. Add assistant response to memory
        # -------------------------------------------------

        self.memory.add_message(
            "assistant",
            response
        )

        # -------------------------------------------------
        # 8. Save conversation
        # -------------------------------------------------

        saved_conversation = (
            self.memory.save_conversation()
        )

        # -------------------------------------------------
        # 9. Return complete result
        # -------------------------------------------------

        return {

            "response": response,

            "sentiment": sentiment_result,

            "intent": intent_result,

            "entities": entities,

            "web_search_used": bool(
                web_results
            ),

            "web_results": web_results,

            "conversation_id":
                self.memory.current_conversation_id,

            "conversation":
                saved_conversation
        }

    # =====================================================
    # REGENERATE AI RESPONSE
    # =====================================================

    def regenerate(self):

        messages = self.memory.get_messages()

        # -------------------------------------------------
        # 1. Check whether conversation exists
        # -------------------------------------------------

        if not messages:
            return None

        # -------------------------------------------------
        # 2. Find the latest user message
        # -------------------------------------------------

        last_user_message = None

        for message in reversed(messages):

            if message["role"] == "user":

                last_user_message = (
                    message["content"]
                )

                break

        if not last_user_message:
            return None

        # -------------------------------------------------
        # 3. Remove previous AI response
        # -------------------------------------------------

        if (
            messages
            and messages[-1]["role"] == "assistant"
        ):

            messages.pop()

        # -------------------------------------------------
        # 4. Analyze original user message again
        # -------------------------------------------------

        sentiment_result = analyze_sentiment(
            last_user_message
        )

        intent_result = detect_intent(
            last_user_message
        )

        entities = extract_entities(
            last_user_message
        )

        # -------------------------------------------------
        # 5. Retrieve RAG context again
        # -------------------------------------------------

        context = self.retriever.get_context(
            last_user_message
        )

        # -------------------------------------------------
        # 6. Web search if required
        # -------------------------------------------------

        web_results = []

        if self.needs_web_search(
            last_user_message
        ):

            web_results = search_web(
                last_user_message,
                max_results=5
            )

        # -------------------------------------------------
        # 7. Build web context
        # -------------------------------------------------

        web_context = ""

        if web_results:

            web_context = "\n\n".join(
                [
                    f"Title: {result['title']}\n"
                    f"URL: {result['url']}\n"
                    f"Information: {result['snippet']}"
                    for result in web_results
                ]
            )

        # -------------------------------------------------
        # 8. Generate fresh AI response
        # -------------------------------------------------

        response = generate_response(

            messages=messages,

            context=context + (

                f"\n\nCurrent Web Information:\n{web_context}"

                if web_context

                else ""
            )
        )

        # -------------------------------------------------
        # 9. Add regenerated response
        # -------------------------------------------------

        self.memory.add_message(
            "assistant",
            response
        )

        # -------------------------------------------------
        # 10. Save updated conversation
        # -------------------------------------------------

        saved_conversation = (
            self.memory.save_conversation()
        )

        # -------------------------------------------------
        # 11. Return complete result
        # -------------------------------------------------

        return {

            "response": response,

            "sentiment": sentiment_result,

            "intent": intent_result,

            "entities": entities,

            "web_search_used": bool(
                web_results
            ),

            "web_results": web_results,

            "conversation_id":
                self.memory.current_conversation_id,

            "conversation":
                saved_conversation
        }

    # =====================================================
    # CREATE NEW CONVERSATION
    # =====================================================

    def create_new_conversation(self):

        return self.memory.create_conversation()

    # =====================================================
    # SAVE CURRENT CONVERSATION
    # =====================================================

    def save_current_conversation(self):

        return self.memory.save_conversation()

    # =====================================================
    # GET ALL CONVERSATIONS
    # =====================================================

    def get_conversation_history(self):

        return self.memory.get_history()

    # =====================================================
    # LOAD CONVERSATION
    # =====================================================

    def load_conversation(self, conversation_id):

        return self.memory.load_conversation(
            conversation_id
        )

    # =====================================================
    # DELETE CONVERSATION
    # =====================================================

    def delete_conversation(self, conversation_id):

        return self.memory.delete_conversation(
            conversation_id
        )

    # =====================================================
    # CLEAR CURRENT MEMORY
    # =====================================================

    def clear_memory(self):

        self.memory.clear()
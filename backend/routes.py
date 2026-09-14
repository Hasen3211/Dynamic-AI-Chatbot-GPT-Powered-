
from flask import Blueprint, request, jsonify, session

from backend.chatbot import Chatbot
from backend.analytics import ChatAnalytics


api = Blueprint("api", __name__)

analytics = ChatAnalytics()


# =========================================================
# GET / CREATE USER SESSION
# =========================================================

def get_chatbot():

    # Create a unique ID for this browser session
    if "user_id" not in session:

        import uuid

        session["user_id"] = str(uuid.uuid4())

    user_id = session["user_id"]

    # Store chatbot instances on Flask application context
    from flask import current_app

    if not hasattr(current_app, "chatbots"):

        current_app.chatbots = {}

    # Create a separate chatbot for this user
    if user_id not in current_app.chatbots:

        current_app.chatbots[user_id] = Chatbot(
            owner_id=user_id
        )

    return current_app.chatbots[user_id]


# =========================================================
# CHAT
# =========================================================

@api.route("/api/chat", methods=["POST"])
def chat():

    data = request.get_json()

    if not data or "message" not in data:

        return jsonify({
            "success": False,
            "error": "Message is required"
        }), 400

    user_message = data["message"].strip()

    if not user_message:

        return jsonify({
            "success": False,
            "error": "Message cannot be empty"
        }), 400

    try:

        chatbot = get_chatbot()

        result = chatbot.chat(
            user_message
        )

        analytics.record_message(

            intent=result["intent"]["intent"],

            sentiment=result["sentiment"]["sentiment"]

        )

        return jsonify({

            "success": True,

            "response":
                result["response"],

            "sentiment":
                result["sentiment"],

            "intent":
                result["intent"],

            "entities":
                result["entities"],

            "web_search_used":
                result.get(
                    "web_search_used",
                    False
                ),

            "web_results":
                result.get(
                    "web_results",
                    []
                ),

            "conversation_id":
                result.get(
                    "conversation_id"
                )
        })

    except Exception as e:

        print(
            "Chat error:",
            e
        )

        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 500


# =========================================================
# REGENERATE RESPONSE
# =========================================================

@api.route(
    "/api/regenerate",
    methods=["POST"]
)
def regenerate():

    try:

        chatbot = get_chatbot()

        result = chatbot.regenerate()

        if not result:

            return jsonify({

                "success": False,

                "error":
                    "No response available to regenerate."

            }), 400

        analytics.record_message(

            intent=result["intent"]["intent"],

            sentiment=result["sentiment"]["sentiment"]

        )

        return jsonify({

            "success": True,

            "response":
                result["response"],

            "sentiment":
                result["sentiment"],

            "intent":
                result["intent"],

            "entities":
                result["entities"],

            "web_search_used":
                result.get(
                    "web_search_used",
                    False
                ),

            "web_results":
                result.get(
                    "web_results",
                    []
                ),

            "conversation_id":
                result.get(
                    "conversation_id"
                ),

            "conversation":
                result.get(
                    "conversation"
                )
        })

    except Exception as e:

        print(
            "Regenerate error:",
            e
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to regenerate the response."

        }), 500


# =========================================================
# NEW CHAT
# =========================================================

@api.route(
    "/api/new-chat",
    methods=["POST"]
)
def new_chat():

    try:

        chatbot = get_chatbot()

        saved_conversation = (
            chatbot.save_current_conversation()
        )

        conversation_id = (
            chatbot.create_new_conversation()
        )

        return jsonify({

            "success": True,

            "conversation_id":
                conversation_id,

            "saved_conversation":
                saved_conversation

        })

    except Exception as e:

        print(
            "New chat error:",
            e
        )

        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 500


# =========================================================
# CHAT HISTORY
# =========================================================

@api.route(
    "/api/history",
    methods=["GET"]
)
def get_history():

    try:

        chatbot = get_chatbot()

        history = (
            chatbot.get_conversation_history()
        )

        return jsonify({

            "success": True,

            "history":
                history

        })

    except Exception as e:

        print(
            "History error:",
            e
        )

        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 500


# =========================================================
# LOAD CONVERSATION
# =========================================================

@api.route(
    "/api/history/<conversation_id>",
    methods=["GET"]
)
def load_conversation(
    conversation_id
):

    try:

        chatbot = get_chatbot()

        conversation = (
            chatbot.load_conversation(
                conversation_id
            )
        )

        if not conversation:

            return jsonify({

                "success": False,

                "error":
                    "Conversation not found"

            }), 404

        return jsonify({

            "success": True,

            "conversation":
                conversation

        })

    except Exception as e:

        print(
            "Load conversation error:",
            e
        )

        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 500


# =========================================================
# DELETE CONVERSATION
# =========================================================

@api.route(
    "/api/history/<conversation_id>",
    methods=["DELETE"]
)
def delete_conversation(
    conversation_id
):

    try:

        chatbot = get_chatbot()

        chatbot.delete_conversation(
            conversation_id
        )

        return jsonify({

            "success": True,

            "message":
                "Conversation deleted"

        })

    except Exception as e:

        print(
            "Delete conversation error:",
            e
        )

        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 500


# =========================================================
# CLEAR CURRENT CONVERSATION
# =========================================================

@api.route(
    "/api/clear",
    methods=["POST"]
)
def clear_chat():

    try:

        chatbot = get_chatbot()

        chatbot.clear_memory()

        return jsonify({

            "success": True,

            "message":
                "Current conversation cleared"

        })

    except Exception as e:

        print(
            "Clear chat error:",
            e
        )

        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 500


# =========================================================
# ANALYTICS
# =========================================================

@api.route(
    "/api/analytics",
    methods=["GET"]
)
def get_analytics():

    return jsonify({

        "success": True,

        "analytics":
            analytics.get_stats()

    })
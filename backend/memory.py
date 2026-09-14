
import json
import os
import uuid
from datetime import datetime

from config import Config


class ConversationMemory:

    def __init__(self, owner_id=None):

        self.owner_id = owner_id

        self.current_conversation_id = None
        self.messages = []

        self.max_messages = Config.MAX_MEMORY_MESSAGES

    # =====================================================
    # CREATE NEW CONVERSATION
    # =====================================================

    def create_conversation(self):

        self.current_conversation_id = str(uuid.uuid4())

        self.messages = []

        return self.current_conversation_id

    # =====================================================
    # ADD MESSAGE
    # =====================================================

    def add_message(self, role, content):

        if not self.current_conversation_id:

            self.create_conversation()

        self.messages.append({

            "role": role,

            "content": content

        })

        if len(self.messages) > self.max_messages:

            self.messages = (
                self.messages[-self.max_messages:]
            )

    # =====================================================
    # GET CURRENT MESSAGES
    # =====================================================

    def get_messages(self):

        return self.messages

    # =====================================================
    # CLEAR CURRENT MEMORY
    # =====================================================

    def clear(self):

        self.messages = []

    # =====================================================
    # HISTORY FILE
    # =====================================================

    def _get_history(self):

        file_path = Config.CHAT_HISTORY_FILE

        if not os.path.exists(file_path):

            return []

        try:

            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as file:

                data = json.load(file)

                if isinstance(data, list):

                    return data

                return []

        except (
            json.JSONDecodeError,
            FileNotFoundError
        ):

            return []

    # =====================================================
    # GET OWNER HISTORY
    # =====================================================

    def _get_owner_history(self):

        history = self._get_history()

        if not self.owner_id:

            return []

        return [

            conversation

            for conversation in history

            if conversation.get("owner_id")
            == self.owner_id

        ]

    # =====================================================
    # SAVE CURRENT CONVERSATION
    # =====================================================

    def save_conversation(self):

        if not self.messages:

            return None

        if not self.current_conversation_id:

            self.create_conversation()

        file_path = Config.CHAT_HISTORY_FILE

        directory = os.path.dirname(file_path)

        if directory:

            os.makedirs(
                directory,
                exist_ok=True
            )

        history = self._get_history()

        user_messages = [

            message["content"]

            for message in self.messages

            if message["role"] == "user"

        ]

        if user_messages:

            title = user_messages[0]

            if len(title) > 45:

                title = title[:45] + "..."

        else:

            title = "New conversation"

        now = datetime.now().isoformat()

        conversation = {

            "id":
                self.current_conversation_id,

            "owner_id":
                self.owner_id,

            "title":
                title,

            "messages":
                self.messages,

            "created_at":
                now,

            "updated_at":
                now
        }

        # -------------------------------------------------
        # UPDATE EXISTING CONVERSATION
        # -------------------------------------------------

        updated = False

        for index, item in enumerate(history):

            if (

                item.get("id")
                == self.current_conversation_id

                and

                item.get("owner_id")
                == self.owner_id

            ):

                history[index] = conversation

                updated = True

                break

        # -------------------------------------------------
        # ADD NEW CONVERSATION
        # -------------------------------------------------

        if not updated:

            history.insert(
                0,
                conversation
            )

        with open(
            file_path,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(

                history,

                file,

                indent=4,

                ensure_ascii=False

            )

        return conversation

    # =====================================================
    # LOAD CONVERSATION
    # =====================================================

    def load_conversation(
        self,
        conversation_id
    ):

        history = self._get_history()

        for conversation in history:

            if (

                conversation.get("id")
                == conversation_id

                and

                conversation.get("owner_id")
                == self.owner_id

            ):

                self.current_conversation_id = (
                    conversation_id
                )

                self.messages = conversation.get(
                    "messages",
                    []
                )

                return conversation

        return None

    # =====================================================
    # GET ALL CONVERSATIONS
    # =====================================================

    def get_history(self):

        history = self._get_owner_history()

        # Newest conversations first

        history.sort(

            key=lambda item:
                item.get(
                    "updated_at",
                    ""
                ),

            reverse=True

        )

        return history

    # =====================================================
    # DELETE CONVERSATION
    # =====================================================

    def delete_conversation(
        self,
        conversation_id
    ):

        history = self._get_history()

        new_history = [

            conversation

            for conversation in history

            if not (

                conversation.get("id")
                == conversation_id

                and

                conversation.get("owner_id")
                == self.owner_id

            )

        ]

        file_path = Config.CHAT_HISTORY_FILE

        directory = os.path.dirname(file_path)

        if directory:

            os.makedirs(
                directory,
                exist_ok=True
            )

        with open(
            file_path,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(

                new_history,

                file,

                indent=4,

                ensure_ascii=False

            )

        # -------------------------------------------------
        # If deleting the current conversation,
        # clear the active memory.
        # -------------------------------------------------

        if (
            self.current_conversation_id
            == conversation_id
        ):

            self.current_conversation_id = None

            self.messages = []

        return True
from collections import Counter


class ChatAnalytics:
    def __init__(self):
        self.total_messages = 0
        self.intent_counts = Counter()
        self.sentiment_counts = Counter()

    def record_message(self, intent, sentiment):
        self.total_messages += 1

        self.intent_counts[intent] += 1
        self.sentiment_counts[sentiment] += 1

    def get_stats(self):
        return {
            "total_messages": self.total_messages,
            "intent_distribution": dict(self.intent_counts),
            "sentiment_distribution": dict(
                self.sentiment_counts
            )
        }

    def reset(self):
        self.total_messages = 0
        self.intent_counts.clear()
        self.sentiment_counts.clear()
        
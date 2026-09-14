def analyze_sentiment(text):
    positive_words = [
        "good", "great", "excellent", "awesome",
        "happy", "love", "helpful", "thanks",
        "thank", "amazing", "perfect"
    ]

    negative_words = [
        "bad", "poor", "terrible", "hate",
        "angry", "sad", "problem", "issue",
        "wrong", "error", "failed", "failure"
    ]

    words = text.lower().split()

    positive_score = sum(
        1 for word in words if word in positive_words
    )

    negative_score = sum(
        1 for word in words if word in negative_words
    )

    if positive_score > negative_score:
        sentiment = "Positive"
    elif negative_score > positive_score:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    return {
        "sentiment": sentiment,
        "positive_score": positive_score,
        "negative_score": negative_score
    }
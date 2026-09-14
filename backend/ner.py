import re


def extract_entities(text):
    entities = {
        "emails": [],
        "urls": [],
        "technologies": []
    }

    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"

    url_pattern = r"https?://[^\s]+"

    technology_list = [
        "Python",
        "Flask",
        "OpenAI",
        "GPT",
        "LangChain",
        "RAG",
        "SQL",
        "Power BI",
        "Machine Learning",
        "TensorFlow",
        "Java",
        "JavaScript"
    ]

    entities["emails"] = re.findall(
        email_pattern,
        text
    )

    entities["urls"] = re.findall(
        url_pattern,
        text
    )

    for technology in technology_list:
        if technology.lower() in text.lower():
            entities["technologies"].append(technology)

    return entities
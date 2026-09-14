import os
from dotenv import load_dotenv

from flask import Flask, render_template
from backend.routes import api


load_dotenv()

app = Flask(__name__)

# Flask session security
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")


app.register_blueprint(api)


@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
    
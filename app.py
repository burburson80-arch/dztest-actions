from flask import Flask, jsonify, render_template

app = Flask(__name__)

STATIONS = [
    {"id": 1, "name": "Свинья FM", "freq": "88.1", "genre": "джаз под дождём"},
    {"id": 2, "name": "Лесная волна", "freq": "91.4", "genre": "птицы и шёпот ветра"},
    {"id": 3, "name": "Радио Хрю", "freq": "94.7", "genre": "лоу-фай под листьями"},
    {"id": 4, "name": "Копытце", "freq": "97.2", "genre": "классика для отдыха"},
    {"id": 5, "name": "Старая мастерская", "freq": "101.0", "genre": "ретро-эфир"},
    {"id": 6, "name": "Ночной луг", "freq": "104.3", "genre": "ambient под звёздами"},
    {"id": 7, "name": "Поросёнок Jazz", "freq": "107.8", "genre": "саксофон в тумане"},
]


@app.route("/")
def index():
    return render_template("index.html", stations=STATIONS)


@app.route("/api/stations")
def stations():
    return jsonify(STATIONS)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

from flask import Flask, jsonify, render_template

app = Flask(__name__)

# Станции с https://radio-vibe.com/ (топ эфира)
STATIONS = [
    {
        "id": 1089,
        "name": "101 SMOOTH JAZZ",
        "stream": "https://jking.cdnstream1.com/b22139_128mp3",
        "fallback": "https://www.101smoothjazz.com/101-smoothjazz.m3u",
        "genre": "easy listening, jazz",
        "bitrate": "128 kbps",
        "country": "USA",
        "source": "https://radio-vibe.com/station/1089",
    },
    {
        "id": 51022,
        "name": "Шансон без цензуры (Радио Шансон)",
        "stream": "https://chanson.hostingradio.ru:8041/chanson-uncensored128.mp3",
        "fallback": "https://chanson.hostingradio.ru:8041/chanson-uncensored128.mp3",
        "genre": "chanson",
        "bitrate": "128 kbps",
        "country": "Россия",
        "source": "https://radio-vibe.com/station/51022",
    },
    {
        "id": 3436,
        "name": "Absolute Chillout",
        "stream": "https://ais-sa5.cdnstream1.com/b05055_128mp3",
        "fallback": "https://ais-sa5.cdnstream1.com/b05055_128mp3",
        "genre": "chillout, ambient",
        "bitrate": "128 kbps",
        "country": "UK",
        "source": "https://radio-vibe.com/station/3436",
    },
    {
        "id": 26205,
        "name": "Nostalgie New York",
        "stream": "https://c32.radioboss.fm:8139/stream",
        "fallback": "https://c32.radioboss.fm:8139/stream",
        "genre": "1960s, 1970s, 1980s",
        "bitrate": "128 kbps",
        "country": "USA",
        "source": "https://radio-vibe.com/station/26205",
    },
    {
        "id": 191,
        "name": "Relax FM Chillout",
        "stream": "https://pub0201.101.ru/stream/trust/mp3/128/24?",
        "fallback": "https://pub0201.101.ru/stream/trust/mp3/128/24?",
        "genre": "chillout, lounge, relax",
        "bitrate": "128 kbps",
        "country": "Россия",
        "source": "https://radio-vibe.com/station/191",
    },
    {
        "id": 17045,
        "name": "Hard Rock Heaven",
        "stream": "https://hydra.cdnstream.com/1521_128",
        "fallback": "https://hydra.cdnstream.com/1521_128",
        "genre": "hard rock, glam metal",
        "bitrate": "128 kbps",
        "country": "USA",
        "source": "https://radio-vibe.com/station/17045",
    },
    {
        "id": 22770,
        "name": "Loca FM Deep Techno",
        "stream": "https://s02.fjperezdj.com:8066/live",
        "fallback": "https://s02.fjperezdj.com:8066/live",
        "genre": "deep techno, tech house",
        "bitrate": "128 kbps",
        "country": "Испания",
        "source": "https://radio-vibe.com/station/22770",
    },
    {
        "id": 40240,
        "name": "Rock Antenne - Heavy Metal",
        "stream": "https://mp3channels.webradio.rockantenne.de/heavy-metal",
        "fallback": "https://s6-webradio.rockantenne.de/heavy-metal",
        "genre": "heavy metal",
        "bitrate": "128 kbps",
        "country": "Германия",
        "source": "https://radio-vibe.com/station/40240",
    },
    {
        "id": 1091,
        "name": "101 Smooth Jazz Mellow Mix",
        "stream": "https://ais-sa5.cdnstream1.com/b48071_128mp3",
        "fallback": "https://ais-sa5.cdnstream1.com/b48071_128mp3",
        "genre": "smooth jazz",
        "bitrate": "128 kbps",
        "country": "USA",
        "source": "https://radio-vibe.com/station/1091",
    },
    {
        "id": 808,
        "name": "1 FM - Absolute Blues Hits",
        "stream": "https://strm112.1.fm/blues_mobile_mp3",
        "fallback": "https://strm112.1.fm/blues_mobile_mp3",
        "genre": "blues",
        "bitrate": "192 kbps",
        "country": "Швейцария",
        "source": "https://radio-vibe.com/station/808",
    },
    {
        "id": 11577,
        "name": "Deep House Radio - Bucharest",
        "stream": "https://streaming-01.xtservers.com:7000/electronic.mp3/electronic.mp3",
        "fallback": "http://live.dancemusic.ro:7000/stream",
        "genre": "deep house",
        "bitrate": "128 kbps",
        "country": "Румыния",
        "source": "https://radio-vibe.com/station/11577",
    },
    {
        "id": 4379,
        "name": "Ambient Sleeping Pill",
        "stream": "https://radio.stereoscenic.com/asp-s",
        "fallback": "https://radio.stereoscenic.com/asp-s",
        "genre": "ambient, sleep",
        "bitrate": "256 kbps",
        "country": "USA",
        "source": "https://radio-vibe.com/station/4379",
    },
]


@app.route("/")
def index():
    return render_template("index.html", stations=STATIONS)


@app.route("/api/stations")
def stations():
    return jsonify(STATIONS)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

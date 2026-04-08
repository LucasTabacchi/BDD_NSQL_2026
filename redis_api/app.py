from flask import Flask, render_template, jsonify, request
from redis import Redis
import json

app = Flask(__name__)

# Conexión a Redis
r = Redis(host='localhost', port=6379, decode_responses=True)

# TTLs
RESERVA_TTL = 4 * 60        # 4 minutos
ALQUILER_TTL = 24 * 60 * 60 # 24 horas

# Lista de capítulos de The Mandalorian
CAPITULOS = [
    {"numero": 1, "titulo": "Chapter 1: The Mandalorian", "temporada": 1, "precio": 500},
    {"numero": 2, "titulo": "Chapter 2: The Child", "temporada": 1, "precio": 500},
    {"numero": 3, "titulo": "Chapter 3: The Sin", "temporada": 1, "precio": 500},
    {"numero": 4, "titulo": "Chapter 4: Sanctuary", "temporada": 1, "precio": 500},
    {"numero": 5, "titulo": "Chapter 5: The Gunslinger", "temporada": 1, "precio": 500},
    {"numero": 6, "titulo": "Chapter 6: The Prisoner", "temporada": 1, "precio": 500},
    {"numero": 7, "titulo": "Chapter 7: The Reckoning", "temporada": 1, "precio": 500},
    {"numero": 8, "titulo": "Chapter 8: Redemption", "temporada": 1, "precio": 500},

    {"numero": 9, "titulo": "Chapter 9: The Marshal", "temporada": 2, "precio": 500},
    {"numero": 10, "titulo": "Chapter 10: The Passenger", "temporada": 2, "precio": 500},
    {"numero": 11, "titulo": "Chapter 11: The Heiress", "temporada": 2, "precio": 500},
    {"numero": 12, "titulo": "Chapter 12: The Siege", "temporada": 2, "precio": 500},
    {"numero": 13, "titulo": "Chapter 13: The Jedi", "temporada": 2, "precio": 500},
    {"numero": 14, "titulo": "Chapter 14: The Tragedy", "temporada": 2, "precio": 500},
    {"numero": 15, "titulo": "Chapter 15: The Believer", "temporada": 2, "precio": 500},
    {"numero": 16, "titulo": "Chapter 16: The Rescue", "temporada": 2, "precio": 500},

    {"numero": 17, "titulo": "Chapter 17: The Apostate", "temporada": 3, "precio": 500},
    {"numero": 18, "titulo": "Chapter 18: The Mines of Mandalore", "temporada": 3, "precio": 500},
    {"numero": 19, "titulo": "Chapter 19: The Convert", "temporada": 3, "precio": 500},
    {"numero": 20, "titulo": "Chapter 20: The Foundling", "temporada": 3, "precio": 500},
    {"numero": 21, "titulo": "Chapter 21: The Pirate", "temporada": 3, "precio": 500},
    {"numero": 22, "titulo": "Chapter 22: Guns for Hire", "temporada": 3, "precio": 500},
    {"numero": 23, "titulo": "Chapter 23: The Spies", "temporada": 3, "precio": 500},
    {"numero": 24, "titulo": "Chapter 24: The Return", "temporada": 3, "precio": 500},
]

def key_reserva(numero):
    return f"capitulo:{numero}:reserva"

def key_alquiler(numero):
    return f"capitulo:{numero}:alquiler"

def key_pago(numero):
    return f"capitulo:{numero}:pago"

def obtener_estado(numero):
    alquiler = r.get(key_alquiler(numero))
    if alquiler:
        ttl = r.ttl(key_alquiler(numero))
        return {
            "estado": "alquilado",
            "ttl": ttl if ttl > 0 else 0
        }

    reserva = r.get(key_reserva(numero))
    if reserva:
        ttl = r.ttl(key_reserva(numero))
        return {
            "estado": "reservado",
            "ttl": ttl if ttl > 0 else 0
        }

    return {
        "estado": "disponible",
        "ttl": 0
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/capitulos", methods=["GET"])
def listar_capitulos():
    respuesta = []

    for cap in CAPITULOS:
        estado_info = obtener_estado(cap["numero"])
        item = {
            **cap,
            "estado": estado_info["estado"],
            "ttl": estado_info["ttl"]
        }
        respuesta.append(item)

    return jsonify(respuesta)

@app.route("/alquilar/<int:numero>", methods=["POST"])
def alquilar_capitulo(numero):
    cap = next((c for c in CAPITULOS if c["numero"] == numero), None)
    if not cap:
        return jsonify({"ok": False, "mensaje": "Capítulo no encontrado"}), 404

    if r.exists(key_alquiler(numero)):
        return jsonify({"ok": False, "mensaje": "El capítulo ya está alquilado"}), 409

    if r.exists(key_reserva(numero)):
        return jsonify({"ok": False, "mensaje": "El capítulo ya está reservado"}), 409

    # Reserva temporal de 4 minutos
    r.setex(
        key_reserva(numero),
        RESERVA_TTL,
        json.dumps({
            "numero": numero,
            "titulo": cap["titulo"]
        })
    )

    return jsonify({
        "ok": True,
        "mensaje": "Capítulo reservado por 4 minutos. Confirme el pago.",
        "numero": numero,
        "ttl": RESERVA_TTL
    })

@app.route("/confirmar_pago", methods=["POST"])
def confirmar_pago():
    data = request.get_json()

    if not data or "numero" not in data:
        return jsonify({"ok": False, "mensaje": "Debe enviar el número del capítulo"}), 400

    numero = data["numero"]

    cap = next((c for c in CAPITULOS if c["numero"] == numero), None)
    if not cap:
        return jsonify({"ok": False, "mensaje": "Capítulo no encontrado"}), 404

    if not r.exists(f"capitulo:{numero}:reserva"):
        return jsonify({
            "ok": False,
            "mensaje": "La reserva no existe o venció. Debe volver a reservar."
        }), 409

    precio = cap["precio"]

    r.delete(f"capitulo:{numero}:reserva")

    pago_data = {
        "numero": numero,
        "titulo": cap["titulo"],
        "precio": precio
    }

    r.set(f"capitulo:{numero}:pago", json.dumps(pago_data))
    r.setex(f"capitulo:{numero}:alquiler", ALQUILER_TTL, json.dumps(pago_data))

    return jsonify({
        "ok": True,
        "mensaje": f"Pago confirmado. Capítulo alquilado por 24 horas.",
        "numero": numero,
        "precio": precio,
        "ttl": ALQUILER_TTL
    })

if __name__ == "__main__":
    print("Iniciando app Flask...")
    app.run(debug=True, host="127.0.0.1", port=5000)
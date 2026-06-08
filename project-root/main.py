from flask import Flask, render_template, request, jsonify, send_file
import os, json, io
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__,
            template_folder=os.path.join(BASE_DIR, 'src', 'ui', 'templates'),
            static_folder=os.path.join(BASE_DIR, 'src', 'ui', 'static'))

@app.route("/")
def home():
    return render_template("pagina.html")

# ── SAVE ─────────────────────────────────────────────────────
@app.route("/api/save", methods=["POST"])
def api_save():
    data = request.get_json()
    return jsonify({"status": "ok", "data": data})

# ── EXPORT JSON ───────────────────────────────────────────────
@app.route("/api/export", methods=["POST"])
def api_export():
    body        = request.get_json()
    points      = body.get("points", [])
    id_immagine = body.get("id_immagine", "IMG-UNKNOWN")
    id_setup    = body.get("id_setup",    "SETUP-UNKNOWN")
    img_w       = body.get("image_width",  0)
    img_h       = body.get("image_height", 0)
    EDGE        = 10

    records = []
    for i, p in enumerate(points):
        xm = p.get("xm")
        ym = p.get("ym")
        px = p.get("x", 0)
        py = p.get("y", 0)

        warnings = []
        if xm is None or ym is None:
            warnings.append("MISSING_REAL_COORDS: Xm o Ym non definiti")
        if xm is not None and xm <= 0:
            warnings.append("INVALID_XM: Xm deve essere > 0")
        if ym is not None and ym <= 0:
            warnings.append("INVALID_YM: Ym deve essere > 0")
        if px < EDGE or py < EDGE or px > img_w - EDGE or py > img_h - EDGE:
            warnings.append(f"NEAR_EDGE: Punto vicino al bordo (< {EDGE}px)")
        for j, other in enumerate(points):
            if j != i and abs(other["x"] - px) < 1 and abs(other["y"] - py) < 1:
                warnings.append("DUPLICATE_POINT: Coordinate pixel identiche")
                break

        if xm is None or ym is None:
            stato = "incompleto"
        elif warnings:
            stato = "warning"
        else:
            stato = "completo"

        if xm and ym and px and py:
            est = {
                "x_est": round(px * (xm / px), 4),
                "y_est": round(py * (ym / py), 4),
                "note":  "Stima lineare mock"
            }
        else:
            est = {"x_est": None, "y_est": None, "note": "Dati mancanti"}

        records.append({
            "id":          i + 1,
            "id_immagine": id_immagine,
            "id_setup":    id_setup,
            "posizione_pixel":          {"x": round(px, 4), "y": round(py, 4)},
            "posizione_reale_misurata": {"xm": xm, "ym": ym},
            "posizione_reale_stimata":  est,
            "warning":                  warnings,
            "stato_elaborazione":       stato
        })

    export = {
        "export_metadata": {
            "exported_at":    datetime.utcnow().isoformat() + "Z",
            "id_immagine":    id_immagine,
            "id_setup":       id_setup,
            "image_size":     {"width": img_w, "height": img_h},
            "total_points":   len(records),
            "points_ok":      sum(1 for r in records if r["stato_elaborazione"] == "completo"),
            "points_warning": sum(1 for r in records if r["stato_elaborazione"] == "warning"),
            "points_error":   sum(1 for r in records if r["stato_elaborazione"] == "incompleto"),
        },
        "points": records
    }

    buf = io.BytesIO(json.dumps(export, indent=2).encode())
    buf.seek(0)
    fname = f"export_{id_immagine}_{id_setup}.json"
    return send_file(buf, mimetype="application/json",
                     as_attachment=True, download_name=fname)

# ── LOAD SAVE ─────────────────────────────────────────────────
@app.route("/api/load", methods=["POST"])
def api_load():
    data = request.get_json()
    if "imageBase64" not in data or "points" not in data:
        return jsonify({"error": "File non valido"}), 400
    return jsonify({"status": "ok", "data": data})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
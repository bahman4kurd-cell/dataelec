import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ڕێگری لە شێواندنی پیتەکانی زمانی کوردی لە نێوان JSON دا
app.json.ensure_ascii = False

# زانیارییە سەرەتاییەکانی سیستەم
APP_CONFIG = {
    "name": "سیستەمی شیکاری ئەنجامەکانی هەڵبژاردن",
    "version": "1.0.0",
    "icon": "📊",
    "status": "running"
}

# داتای کاتی بۆ خولەکانی هەڵبژاردن
rounds_data = [
    { "id": 1, "name": "هەڵبژاردنی پەرلەمانی کوردستان", "year": "2024", "totalVoters": 2899578, "status": "چالاک" }
]

# داتای کاتی بۆ لایەنە سیاسییەکان و ڕەنگەکانیان
parties_data = [
    { "id": 1, "name": "لیستی یەکەم (پارتی)", "votes": 850000, "color": "bg-yellow-500" },
    { "id": 2, "name": "لیستی دووەم (یەکێتی)", "votes": 720000, "color": "bg-green-600" },
    { "id": 3, "name": "لیستی سێیەم (نەوەی نوێ)", "votes": 450000, "color": "bg-blue-600" }
]

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "success",
        "message": "سێرڤەری پایتۆن چالاکە",
        "config": APP_CONFIG
    })

@app.route('/api/info', methods=['GET'])
def get_info():
    return jsonify(APP_CONFIG)

# ١. ڕێڕەوەی بەڕێوەبردنی خولەکانی هەڵبژاردن (GET و POST)
@app.route('/api/rounds', methods=['GET', 'POST'])
def manage_rounds():
    if request.method == 'POST':
        new_round = request.json
        if not new_round or not new_round.get('name'):
            return jsonify({"error": "ناوی خول پێویستە"}), 400
            
        new_round['id'] = len(rounds_data) + 1
        rounds_data.append(new_round)
        return jsonify({"message": "بە سەرکەوتوویی زیاد کرا", "round": new_round}), 201
    
    return jsonify(rounds_data)

# ٢. ڕێڕەوەی هێنانی ئەنجامی لایەنە سیاسییەکان (GET)
@app.route('/api/parties', methods=['GET'])
def get_parties():
    return jsonify(parties_data)

if __name__ == '__main__':
    print(f"🚀 دەستپێکردنی سیستەم: {APP_CONFIG['name']} {APP_CONFIG['icon']} - app.py:63")
    app.run(host='0.0.0.0', port=5000, debug=True)
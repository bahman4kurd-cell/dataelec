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

if __name__ == '__main__':
    print(f"🚀 دەستپێکردنی سیستەم: {APP_CONFIG['name']} {APP_CONFIG['icon']} - app.py:32")
    app.run(host='0.0.0.0', port=5000, debug=True)export default App;
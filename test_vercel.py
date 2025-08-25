"""
Arquivo de teste simples para Vercel
"""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({
        'message': 'Hello from Vercel!',
        'status': 'working'
    })

@app.route('/test')
def test():
    return jsonify({
        'message': 'Test endpoint working!',
        'status': 'success'
    })

if __name__ == '__main__':
    app.run(debug=True)

# Para Vercel
app.debug = False

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/creer-partie', methods=['POST'])
def creer_partie():
    data = request.json
    pseudo_createur = data.get('pseudo')
    mode_de_jeu = data.get('modeDeJeu')
    
    print(f"Pseudo du créateur: {pseudo_createur}")
    print(f"Mode de jeu: {mode_de_jeu}")
    
    return jsonify({
        'message': 'Partie créée'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
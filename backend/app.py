from flask import Flask, request, jsonify
from flask_cors import CORS

import random

app = Flask(__name__)
CORS(app)

parties = {}

def generer_code():
    while True:
        code = str(random.randint(1000, 9999))
        if code not in parties:
            return code

@app.route('/api/creer-partie', methods=['POST'])
def creer_partie():
    data = request.json
    pseudo_createur = data.get('pseudo')
    mode_de_jeu = data.get('modeDeJeu')
    code_partie = generer_code()

    #print(f"Pseudo du créateur: {pseudo_createur}")
    #print(f"Mode de jeu: {mode_de_jeu}")
    #print(code_partie)

    parties[code_partie] = {
        'createur': pseudo_createur,
        'modeDeJeu': mode_de_jeu,
        'participants': [pseudo_createur]
    }

    #print(parties[code_partie])

    print("toutes les parties:", parties)
    return jsonify({
        'message': 'Partie créée'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
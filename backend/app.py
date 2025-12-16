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

#route pour créer une partie
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
        'code': code_partie
    })

#route pour recuperer infos d'une partie
@app.route('/api/partie/<code>', methods=['GET'])
def get_partie(code):
    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    print(parties[code])

    return jsonify(parties[code])

#route pour rejoindre une partie
@app.route('/api/rejoindre-partie/<code>', methods=['POST'])
def rejoindre_partie(code):
    data = request.json
    pseudo = data.get('pseudo')

    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    if pseudo not in parties[code]['participants']:
        parties[code]['participants'].append(pseudo)
    
    print(f"{pseudo} a rejoint la partie {code}")
    print("Participants:", parties[code]['participants'])
    
    return jsonify({
        'success': True,
        'code': code
    })

#route pour démarrer une partie
@app.route('/api/demarrer-partie/<code>', methods=['POST'])
def demarrer_partie(code):
    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    parties[code]['statut'] = 'en_cours'
    
    #print(f"Partie {code} démarrée")
    
    return jsonify({
        'success': True,
        'code': code
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
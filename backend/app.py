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

    taches = data.get('taches', [])
    temps_vote = data.get('tempsVote', 30)

    parties[code_partie] = {
        'createur': pseudo_createur,
        'modeDeJeu': mode_de_jeu,
        'participants': [pseudo_createur],
        'statut': 'en_attente',
        'taches': taches,
        'tempsVote': temps_vote,
        'tacheActuelle': 0
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

#route pour enregistrer un vote
@app.route('/api/voter/<code>', methods=['POST'])
def voter(code):
    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    data = request.json
    pseudo = data.get('pseudo')
    vote = data.get('vote')
    tache_index = data.get('tacheIndex', 0)
    
    if 'votes' not in parties[code]:
        parties[code]['votes'] = {}
    
    if tache_index not in parties[code]['votes']:
        parties[code]['votes'][tache_index] = {}
    
    parties[code]['votes'][tache_index][pseudo] = vote
    
    print(f"{pseudo} a voté {vote} pour la tâche {tache_index} de la partie {code}")
    print("Votes actuels:", parties[code]['votes'])
    
    return jsonify({
        'success': True,
        'vote': vote
    })

#route pour vérifier les votes et passer à la tâche suivante
@app.route('/api/verification-votes/<code>', methods=['POST'])
def verification_votes(code):
    """
    Cette route gère la confirmation des résultats par chaque participant.
    Quand tout le monde a confirmé:
    - En mode unanimité: si tous ont voté pareil -> tâche suivante, sinon -> revote
    - En mode médiane: passage direct à la tâche suivante
    """
    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    data = request.json
    pseudo = data.get('pseudo')
    tache_actuelle = parties[code].get('tacheActuelle', 0)
    
    if 'validationsOk' not in parties[code]:
        parties[code]['validationsOk'] = {}
    
    if tache_actuelle not in parties[code]['validationsOk']:
        parties[code]['validationsOk'][tache_actuelle] = []
    
    if pseudo not in parties[code]['validationsOk'][tache_actuelle]:
        parties[code]['validationsOk'][tache_actuelle].append(pseudo)
    
    print(f"{pseudo} a confirmé les résultats pour la tâche {tache_actuelle}")
    
    #vérifier si tous ont confirmé
    nombre_confirmations = len(parties[code]['validationsOk'][tache_actuelle])
    nombre_participants = len(parties[code]['participants'])
    tous_ont_confirme = nombre_confirmations == nombre_participants
    
    tache_changee = False
    
    if tous_ont_confirme:

        mode_de_jeu = parties[code]['modeDeJeu']
        
        if mode_de_jeu == 'unanimite':
            #récupérer tous les votes pour cette tâche
            votes_tache = parties[code]['votes'][tache_actuelle]
            votes_uniques = set(votes_tache.values())
            
            # Vérifier si unanimité
            if len(votes_uniques) == 1:
                print("unanimité")
                parties[code]['tacheActuelle'] += 1
                tache_changee = True
            else:
                print("pas d'unanimité")
                #Supprimer les votes et confirmations pour recommencer
                del parties[code]['votes'][tache_actuelle]
                del parties[code]['validationsOk'][tache_actuelle]
                tache_changee = True
        else:
            # Mode médiane: passage direct à la tâche suivante
            "Mode médiane: passage à la tâche suivante")
            parties[code]['tacheActuelle'] += 1
            tache_changee = True
    
    return jsonify({
        'success': True,
        'tacheChangee': tache_changee,
        'tacheActuelle': parties[code].get('tacheActuelle', 0)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
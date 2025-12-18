from flask import Flask, request, jsonify
from flask_cors import CORS

import random
import time

app = Flask(__name__)
CORS(app)

parties = {}

def generer_code():
    while True:
        code = str(random.randint(1000, 9999))
        if code not in parties:
            return code

def tache_possede_difficulte(tache):
    return 'difficulte' in tache and tache['difficulte'] is not None and tache['difficulte'] != ''

def trouver_prochaine_tache_a_estimer(taches, index_actuel):
    for i in range(index_actuel, len(taches)):
        if not tache_possede_difficulte(taches[i]):
            return i
    return len(taches)

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
    
    # Trouver la première tâche sans difficulté
    premiere_tache_non_estimee = trouver_prochaine_tache_a_estimer(taches, 0)

    parties[code_partie] = {
        'createur': pseudo_createur,
        'modeDeJeu': mode_de_jeu,
        'participants': [pseudo_createur],
        'statut': 'en_attente',
        'taches': taches,
        'tempsVote': temps_vote,
        'tacheActuelle': premiere_tache_non_estimee
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
    
    return jsonify({
        'success': True,
        'code': code
    })

#route pour obtenir les résultats finaux de la partie
@app.route('/api/resultats/<code>', methods=['GET'])
def get_resultats(code):
    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    partie = parties[code]
    taches_avec_resultats = []
    
    #pour chaque tâche, ajouter la difficulté estimée
    for index, tache in enumerate(partie['taches']):
        tache_resultat = {
            'nom': tache['nom'],
            'description': tache['description']
        }
        
        # si la tâche avait déjà une difficulté la conserver
        if tache_possede_difficulte(tache):
            tache_resultat['difficulte'] = tache['difficulte']
        elif 'votes' in partie and index in partie['votes']:
            votes = partie['votes'][index]
            
            if partie['modeDeJeu'] == 'unanimite':
                difficulte = list(votes.values())[0] if votes else None
            else:
                #calculer la médiane
                votes_numeriques = []
                for v in votes.values():
                    if v not in ['?', 'cafe']:
                        try:
                            votes_numeriques.append(float(v))
                        except:
                            pass
                
                if votes_numeriques:
                    votes_numeriques.sort()
                    n = len(votes_numeriques)
                    if n % 2 == 0:
                        difficulte = (votes_numeriques[n//2-1] + votes_numeriques[n//2]) / 2
                    else:
                        difficulte = votes_numeriques[n//2]
                else:
                    difficulte = None
            
            tache_resultat['difficulte'] = difficulte
            #tache_resultat['votes_details'] = votes
        else:
            # Tâche ni importée avec difficulté, ni votée
            tache_resultat['difficulte'] = None
        
        taches_avec_resultats.append(tache_resultat)
    
    print(f"Résultats générés pour la partie {code}")
    return jsonify(taches_avec_resultats)

#route pour démarrer une partie
@app.route('/api/demarrer-partie/<code>', methods=['POST'])
def demarrer_partie(code):
    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    parties[code]['statut'] = 'en_cours'
    parties[code]['heureDebutTache'] = time.time()
    
    print(f"Partie {code} démarrée")
    
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
     
    return jsonify({
        'success': True,
        'vote': vote
    })

#route pour vérifier les votes et passer à la tâche suivante
@app.route('/api/verification-votes/<code>', methods=['POST'])
def verification_votes(code):
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
    
    #print(f"{pseudo} a confirmé les résultats pour la tâche {tache_actuelle}")
    
    #vérifier si tous ont confirmé
    nombre_confirmations = len(parties[code]['validationsOk'][tache_actuelle])
    nombre_participants = len(parties[code]['participants'])
    tous_ont_confirme = nombre_confirmations == nombre_participants
    
    tache_changee = False
    
    if tous_ont_confirme:

        mode_de_jeu = parties[code]['modeDeJeu']
        votes_tache = parties[code]['votes'][tache_actuelle]
        votes_uniques = set(votes_tache.values())
        
        # Vérifier si tout le monde a voté "café"
        if len(votes_uniques) == 1 and 'cafe' in votes_uniques:

            parties[code]['tacheActuelle'] = len(parties[code]['taches'])
            parties[code]['pauseCafe'] = True
            parties[code]['heureDebutTache'] = time.time()
            tache_changee = True
        elif mode_de_jeu == 'unanimite':
            #récupérer tous les votes pour cette tâche
            # Vérifier si unanimité
            if len(votes_uniques) == 1:
                print("unanimité")
                #Passer à la prochaine tâche non estimée
                prochaine_tache = trouver_prochaine_tache_a_estimer(parties[code]['taches'], tache_actuelle + 1)
                parties[code]['tacheActuelle'] = prochaine_tache
                parties[code]['heureDebutTache'] = time.time()
                tache_changee = True
            else:
                print("pas d'unanimité")
                #Supprimer les votes et confirmations pour recommencer
                del parties[code]['votes'][tache_actuelle]
                del parties[code]['validationsOk'][tache_actuelle]
                parties[code]['heureDebutTache'] = time.time()
                tache_changee = True
        else:
            # Mode médiane: passage direct à la tâche suivante
            print("Mode médiane: passage à la tâche suivante")
            # Passer à la prochaine tâche non estimée
            prochaine_tache = trouver_prochaine_tache_a_estimer(parties[code]['taches'], tache_actuelle + 1)
            parties[code]['tacheActuelle'] = prochaine_tache
            parties[code]['heureDebutTache'] = time.time()
            tache_changee = True
    
    return jsonify({
        'success': True,
        'tacheChangee': tache_changee,
        'tacheActuelle': parties[code].get('tacheActuelle', 0)
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, port=port, host='0.0.0.0')
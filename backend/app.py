## @file app.py
#  @brief API Flask pour le Planning Poker
#  @details Gère les parties, votes, et génération des résultats JSON

from flask import Flask, request, jsonify
from flask_cors import CORS

import random
import time

app = Flask(__name__)
CORS(app)

## @var parties
#  @brief Dictionnaire stockant toutes les parties en cours
#  @details {code: {createur, modeDeJeu, participants[], statut, taches[], tempsVote, tacheActuelle, heureDebutTache, votes{}, validationsOk{}, pauseCafe}}
parties = {}

## @brief Génère un code unique à 4 chiffres pour une partie
#  @details Génère aléatoirement un code entre 1000 et 9999 et vérifie qu'il n'existe pas déjà dans le dictionaire parties
#  @return code sous forme de string
def generer_code():
    while True:
        code = str(random.randint(1000, 9999))
        if code not in parties:
            return code

## @brief Vérifie dans un json si une tâche possède déjà une difficulté estimée
#  @param tache Dictionnaire représentant une tâche avec ses propriétés
#  @return True si la tâche a une difficulté définie et non vide, False sinon
def tache_possede_difficulte(tache):
    return 'difficulte' in tache and tache['difficulte'] is not None and tache['difficulte'] != ''

## @brief Trouve l'index de la prochaine tâche sans difficulté
#  @param taches Liste des tâches de la partie
#  @param index_actuel Index à partir duquel commencer la recherche
#  @return Index de la première tâche sans difficulté, ou len(taches) si toutes sont estimées
def trouver_prochaine_tache_a_estimer(taches, index_actuel):
    for i in range(index_actuel, len(taches)):
        if not tache_possede_difficulte(taches[i]):
            return i
    return len(taches)

## @brief Route API pour créer une nouvelle partie
#  @details Méthode POST acceptant : pseudo (str), modeDeJeu (str: 'unanimite' ou 'mediane'), tempsVote (int), taches (list)
#  @return JSON contenant le code de la partie créée
@app.route('/api/creer-partie', methods=['POST'])
def creer_partie():
    data = request.json
    pseudo_createur = data.get('pseudo')
    mode_de_jeu = data.get('modeDeJeu')
    code_partie = generer_code()

    taches = data.get('taches', [])
    temps_vote = data.get('tempsVote', 30)
    
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

    return jsonify({
        'code': code_partie
    })

## @brief Route API pour récupérer les informations d'une partie
#  @details Méthode GET retournant toutes les données de la partie sauf les infos sensibles
#  @param code Code unique de la partie
#  @return JSON avec {success: bool, partie: dict} ou erreur 404 si la partie n'existe pas
@app.route('/api/partie/<code>', methods=['GET'])
def get_partie(code):
    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    print(parties[code])

    return jsonify(parties[code])

## @brief route API pour rejoindre une partie existante
#  @details Méthode POST acceptant : pseudo (str). Ajoute le participant à la liste si le pseudo n'existe pas déjà
#  @param code Code unique de la partie à rejoindre
#  @return JSON avec {success: bool, message: str} ou erreur 404 si la partie n'existe pas
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

## @brief Route API pour récupérer les résultats finaux d'une partie
#  @details Génère un fichier JSON avec toutes les tâches et leurs difficultés
#  @param code Code unique de la partie
#  @return JSON contenant la liste des tâches avec difficultés estimées
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
        else:
            # Tâche ni importée avec difficluté ni votée
            tache_resultat['difficulte'] = None
        
        taches_avec_resultats.append(tache_resultat)
    
    print(f"Résultats générés pour la partie {code}")
    return jsonify(taches_avec_resultats)

## @brief Route API pour démarrer une partie en attente
#  @details Change le statut de 'en_attente' à 'en_cours' et initialise heureDebutTache pour le timer
#  @param code Code unique de la partie à démarrer
#  @return JSON avec {'success': True,'code': code} ou erreur 404 si la partie n'existe pas
@app.route('/api/demarrer-partie/<code>', methods=['POST'])
def demarrer_partie(code):
    if code not in parties:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    parties[code]['statut'] = 'en_cours'
    parties[code]['heureDebutTache'] = time.time()
    
    return jsonify({
        'success': True,
        'code': code
    })

## @brief Route API pour enregistrer le vote d'un participant
#  @details Méthode POST acceptant : pseudo (str), vote (str). Enregistre le vote pour la tâche actuelle
#  @param code Code unique de la partie
#  @return JSON avec {success: bool, message: str} ou erreur 404 si la partie n'existe pas
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

## @brief Route API pour valider les résultats de vote et passer à la tâche suivante
#  @details Gère la logique d'unanimité/médiane, détecte les pauses café, et fait avancer la partie
#  @param code Code unique de la partie
#  @return JSON avec {success: bool, tacheChangee: bool, tacheActuelle: int} ou erreur 404
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
                # Passer à la prochaine tâche non estimée
                prochaine_tache = trouver_prochaine_tache_a_estimer(parties[code]['taches'], tache_actuelle + 1)
                parties[code]['tacheActuelle'] = prochaine_tache
                parties[code]['heureDebutTache'] = time.time()
                tache_changee = True
            else:
                #Supprimer les votes et confirmations pour recommencer
                del parties[code]['votes'][tache_actuelle]
                del parties[code]['validationsOk'][tache_actuelle]
                parties[code]['heureDebutTache'] = time.time()
                tache_changee = True
        else:
        # mode de jeu médiane
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
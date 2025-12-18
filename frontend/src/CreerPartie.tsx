import { useState } from 'react'

function CreerPartie() {
    const [pseudo, setPseudo] = useState('')
    const [modeDeJeu, setModeDeJeu] = useState('unanimite')

    const valider = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/creer-partie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pseudo: pseudo,
                    modeDeJeu: modeDeJeu
                })
            })

            const data = await response.json()
            console.log('Réponse du serveur:', data)
        } catch (error) {
            console.error('Erreur:', error)
        }
    }

    return (
    <div className="Creer_partie">
      <div className="carte_creer_partie">
        <h1 className="titre_creer_partie">Créer une partie</h1>

        <div className="ligne_formulaire">
          <input
            className="champ_texte"
            type="text"
            placeholder="Entrez votre pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />

          <select
            className="select_mode"
            value={modeDeJeu}
            onChange={(e) => setModeDeJeu(e.target.value)}
          >
            <option value="unanimite">Unanimité</option>
            <option value="mediane">Médiane</option>
          </select>

          <button
            className="bouton_valider"
            onClick={valider}
            disabled={pseudo.trim() === ""}
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreerPartie
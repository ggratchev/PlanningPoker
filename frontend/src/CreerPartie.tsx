import { useState } from 'react'
import { useNavigate } from "react-router-dom"

function CreerPartie() {
    const [pseudo, setPseudo] = useState('')
    const [modeDeJeu, setModeDeJeu] = useState('unanimite')
    const [taches, setTaches] = useState([])
    const [tempsVote, setTempsVote] = useState(30)

    const navigate = useNavigate();

    const importerTaches = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                try {
                    const result = event.target?.result
                    if (typeof result === 'string') {
                        const json = JSON.parse(result)
                        setTaches(json)
                        console.log('Tâches importées:', json)
                    }
                } catch (error) {
                    console.error('Erreur lors de la lecture du fichier JSON:', error)
                    alert('Fichier JSON invalide')
                }
            }
            reader.readAsText(file)
        }
    }

    const valider = async () => {
        try {
            //const response = await fetch('http://localhost:5000/api/creer-partie', {
            const response = await fetch('https://planningpoker-0aph.onrender.com/api/creer-partie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pseudo: pseudo,
                    modeDeJeu: modeDeJeu,
                    taches: taches,
                    tempsVote: tempsVote
                })
            })

            const data = await response.json()
            console.log('Réponse du serveur:', data)

            navigate(`/salle-attente/${data.code}`, {
                state: { pseudo: pseudo, createur: true }
            })

        } catch (error) {
            console.error('Erreur:', error)
        }

    }

    return (
        <div className="Creer_partie">
            <button onClick={() => navigate('/')}>Retour à l'accueil</button>
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

                    <div className="select_wrapper">
                        <select
                            className="select_mode"
                            value={modeDeJeu}
                            onChange={(e) => setModeDeJeu(e.target.value)}
                        >
                            <option value="unanimite">Unanimité</option>
                            <option value="mediane">Médiane</option>
                        </select>
                    </div>

                    <div className="select_wrapper">
                        <label>Temps de vote :</label>
                        <select
                            className="select_mode"
                            value={tempsVote}
                            onChange={(e) => setTempsVote(Number(e.target.value))}
                        >
                            <option value={10}>10 secondes</option>
                            <option value={20}>20 secondes</option>
                            <option value={30}>30 secondes</option>
                            <option value={60}>1 minute</option>
                        </select>
                    </div>

                    <div className="select_wrapper">
                        <label>Importer des tâches (JSON) :</label>
                        <input
                            type="file"
                            accept=".json"
                            onChange={importerTaches}
                        />
                        {taches.length > 0 && (
                            <p>{taches.length} tâche(s) importée(s)</p>
                        )}
                    </div>

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
import { useState } from 'react'
import { useNavigate } from "react-router-dom"

function CreerPartie() {
    const [pseudo, setPseudo] = useState('')
    const [modeDeJeu, setModeDeJeu] = useState('unanimite')

    const navigate = useNavigate();

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
        navigate('/salle-attente')
    }

    return (
        <div>
            <h1>Créer une partie</h1>
            <input type="text"
                placeholder='Entrez votre pseudo'
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
            />
            <select value={modeDeJeu} onChange={(e) => setModeDeJeu(e.target.value)}>
                <option value="unanimite">Unanimité</option>
                <option value="mediane">Médiane</option>
            </select>
            <button onClick={valider} disabled={pseudo.trim() === ''}>Valider</button>
        </div>
    )
}

export default CreerPartie
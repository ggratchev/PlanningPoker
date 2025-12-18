import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Jeu() {
    const { code } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { pseudo } = location.state || {}
    const [partie, setPartie] = useState(null)
    const [vote, setVote] = useState('')

    useEffect(() => {
        const chargerPartie = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/partie/${code}`)
                const data = await response.json()
                setPartie(data)
            } catch (error) {
                console.error('Erreur:', error)
            }
        }

        chargerPartie()
    }, [code])

    if (!partie) {
        return <div>Chargement...</div>
    }

    return (
        <div>
            <button onClick={() => navigate('/')}>Retour à l'accueil</button>
            <h1>Partie {code}</h1>
            <p>Mode de jeu : {partie.modeDeJeu}</p>
            <p>Votre pseudo : {pseudo}</p>

            <h3>Participants :</h3>
            <ul>
                {partie.participants.map((participant, index) => (
                    <li key={index}>{participant}</li>
                ))}
            </ul>

            {partie.taches && partie.taches.length > 0 && (
                <div>
                    <h2>Tâche à voter :</h2>
                    <h3>{partie.taches[0].nom}</h3>
                    <p>{partie.taches[0].description}</p>

                    <div>
                        <label>Votre vote :</label>
                        <select value={vote} onChange={(e) => setVote(e.target.value)}>
                            <option value="">-- Choisissez --</option>
                            <option value="0">0</option>
                            <option value="0.5">1/2</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="5">5</option>
                            <option value="8">8</option>
                            <option value="13">13</option>
                            <option value="20">20</option>
                            <option value="40">40</option>
                            <option value="100">100</option>
                            <option value="?">?</option>
                            <option value="cafe">Café</option>
                        </select>
                        <button onClick={() => console.log('Vote:', vote)} disabled={vote === ''}>
                            Valider
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Jeu
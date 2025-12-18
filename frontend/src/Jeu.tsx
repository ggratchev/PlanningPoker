import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Jeu() {
    const { code } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { pseudo } = location.state || {}
    const [partie, setPartie] = useState(null)
    const [vote, setVote] = useState('')
    const [aVote, setAVote] = useState(false)
    const [aValideOk, setAValideOk] = useState(false)
    const [tacheActuellePrecedente, setTacheActuellePrecedente] = useState(0)

    useEffect(() => {
        const chargerPartie = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/partie/${code}`)
                const data = await response.json()
                setPartie(data)

                // Détecter si la tâche a changé OU si les votes ont été réinitialisés
                const nouvelleTache = data.tacheActuelle || 0
                const tacheAChange = nouvelleTache !== tacheActuellePrecedente
                
                // Vérifier si l'utilisateur a déjà voté pour cette tâche
                const aDejaVote = data.votes && 
                                  data.votes[nouvelleTache] && 
                                  data.votes[nouvelleTache][pseudo] !== undefined
                
                // Réinitialiser si la tâche a changé OU si on n'a plus de vote (revote)
                if (tacheAChange || (aVote && !aDejaVote)) {
                    console.log(`Réinitialisation: tâche=${nouvelleTache}, avait voté=${aVote}, a encore son vote=${aDejaVote}`)
                    setVote('')
                    setAVote(false)
                    setAValideOk(false)
                    setTacheActuellePrecedente(nouvelleTache)
                }
            } catch (error) {
                console.error('Erreur:', error)
            }
        }

        chargerPartie()

        // Rafraîchir toutes les 2 secondes pour voir les votes des autres
        const interval = setInterval(chargerPartie, 2000)

        return () => clearInterval(interval)
    }, [code, tacheActuellePrecedente, aVote, pseudo])

    const validerVote = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/voter/${code}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pseudo: pseudo,
                    vote: vote,
                    tacheIndex: partie.tacheActuelle || 0
                })
            })
            const data = await response.json()
            console.log('Vote enregistré:', data)
            setAVote(true)
            //alert('vote enregistré')
        } catch (error) {
            console.error('Erreur:', error)
            alert('erreur enregitsrement vote')
        }
    }

    const validerOk = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/verification-votes/${code}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pseudo: pseudo
                })
            })
            const data = await response.json()
            console.log('OK validé:', data)
            setAValideOk(true)
            // La réinitialisation se fera automatiquement via useEffect quand la tâche change
        } catch (error) {
            console.error('Erreur:', error)
        }
    }

    if (!partie) {
        return <div>Chargement...</div>
    }

    // Vérifier si tout le monde a voté pour la tâche actuelle
    const tousOntVote = () => {
        const tacheActuelle = partie.tacheActuelle || 0
        if (!partie.votes || !partie.votes[tacheActuelle]) return false
        const votesActuels = partie.votes[tacheActuelle]
        return partie.participants.every(participant => votesActuels[participant] !== undefined)
    }

    const afficherResultats = tousOntVote()

    const tacheActuelle = partie.tacheActuelle || 0

    return (
        <div>
            <button onClick={() => navigate('/')}>Retour à l'accueil</button>
            <h1>Partie {code}</h1>
            <p>Mode de jeu : {partie.modeDeJeu}</p>
            <p>Votre pseudo : {pseudo}</p>

            {afficherResultats ? (
                <div>
                    <h2>Résultats des votes :</h2>
                    <h3>{partie.taches[tacheActuelle].nom}</h3>
                    <p>{partie.taches[tacheActuelle].description}</p>
                    <ul>
                        {partie.participants.map((participant, index) => (
                            <li key={index}>
                                {participant} : {partie.votes[tacheActuelle][participant]}
                            </li>
                        ))}
                    </ul>
                    <button onClick={validerOk} disabled={aValideOk}>
                        {aValideOk ? 'En attente...' : 'OK'}
                    </button>
                </div>
            ) : (
                <>
                    <h3>Participants :</h3>
                    <ul>
                        {partie.participants.map((participant, index) => (
                            <li key={index}>{participant}</li>
                        ))}
                    </ul>
                </>
            )}

            {!afficherResultats && partie.taches && partie.taches.length > tacheActuelle && (
                <div>
                    <h2>Tâche à voter :</h2>
                    <h3>{partie.taches[tacheActuelle].nom}</h3>
                    <p>{partie.taches[tacheActuelle].description}</p>

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
                        <button onClick={validerVote} disabled={vote === '' || aVote}>
                            {aVote ? 'Vote enregistré' : 'Valider'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Jeu
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

                // détecter si la tâche a changé ou si les votes ont été réinitialisés
                const nouvelleTache = data.tacheActuelle || 0
                const tacheAChange = nouvelleTache !== tacheActuellePrecedente
                
                // Vérifier si l'utilisateur a déjà voté pour cette tache
                const aDejaVote = data.votes && 
                                  data.votes[nouvelleTache] && 
                                  data.votes[nouvelleTache][pseudo] !== undefined
                
                //réinitialiser si la tâche a changé ou si on n'a plus de vote
                if (tacheAChange || (aVote && !aDejaVote)) {
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

        // rafraichir toutes les 2 sec
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
    const partieTerminee = tacheActuelle >= partie.taches.length

    const telechargerResultats = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/resultats/${code}`)
            const data = await response.json()
            
            // Créer un blob et télécharger le fichier
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `resultats_planning_poker_${code}.json`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Erreur:', error)
        }
    }

    return (
        <div>
            <button onClick={() => navigate('/')}>Retour à l'accueil</button>
            <h1>Partie {code}</h1>
            <p>Mode de jeu : {partie.modeDeJeu}</p>
            <p>Votre pseudo : {pseudo}</p>

            {partieTerminee && (
                <div>
                    {partie.pauseCafe ? (
                        <>
                            <h2>Pause café</h2>
                            <p>La partie a été mise en pause pour une pause café. Vous pourrez reprendre la partie en important le json ci-dessous</p>
                        </>
                    ) : (
                        <>
                            <h2>Partie terminée !</h2>
                            <p>Toutes les taches ont été estimées.</p>
                        </>
                    )}
                    <button onClick={telechargerResultats}>Télécharger les résultats (JSON)</button>
                </div>
            )}

            {!partieTerminee && afficherResultats ? (
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
            ) : !partieTerminee ? (
                <>
                    <h3>Participants :</h3>
                    <ul>
                        {partie.participants.map((participant, index) => (
                            <li key={index}>{participant}</li>
                        ))}
                    </ul>
                </>
            ) : null}

            {!partieTerminee && !afficherResultats && partie.taches && partie.taches.length > tacheActuelle && (
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
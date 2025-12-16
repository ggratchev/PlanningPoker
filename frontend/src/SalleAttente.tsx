import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'

function SalleAttente() {

    const { code } = useParams()
    const location = useLocation()
    const { pseudo, createur } = location.state || {}
    const [partie, setPartie] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const chargerPartie = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/partie/${code}`)
                const data = await response.json()
                setPartie(data)

                // Rediriger vers la page de jeu si la partie est démarrée
                if (data.statut === 'en_cours') {
                    navigate(`/jeu/${code}`, {
                        state: { pseudo: pseudo }
                    })
                }
            } catch (error) {
                console.error('Erreur:', error)
            }
        }

        chargerPartie()

        // Vérifier toutes les 2 secondes si la partie a démarré
        const interval = setInterval(chargerPartie, 2000)

        return () => clearInterval(interval)
    }, [code, navigate, pseudo])


    const demarrerPartie = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/demarrer-partie/${code}`, {
                method: 'POST'
            })
            const data = await response.json()
            console.log('Partie démarrée:', data)

            // Rediriger le créateur vers la page de jeu
            navigate(`/jeu/${code}`, {
                state: { pseudo: pseudo }
            })
        } catch (error) {
            console.error('Erreur:', error)
        }
    }

    if (!partie) {
        return <div>Chargement...</div>
    }

    return (
        <div>
            <h1>Salle d'attente</h1>
            <h2>Code de la partie : {code}</h2>
            <p>Mode de jeu : {partie.modeDeJeu}</p>

            <h3>Participants :</h3>
            <ul>
                {partie.participants.map((participant, index) => (
                    <li key={index}>{participant}</li>
                ))}
            </ul>


            {createur && (
                <button onClick={demarrerPartie}>Démarrer la partie</button>
            )}
        </div>
    )
}

export default SalleAttente
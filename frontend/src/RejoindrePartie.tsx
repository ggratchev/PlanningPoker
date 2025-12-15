import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function RejoindrePartie() {
    const [pseudo, setPseudo] = useState('')
    const [code, setCode] = useState('')
    const navigate = useNavigate()

    const valider = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/rejoindre-partie/${code}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pseudo: pseudo
                })
            })
            //console.log("pseudo :", pseudo)
            //console.log("code de la partie :", code)
            const data = await response.json()

            if (data.error) {
                alert(data.error)
                return
            }

            console.log('Partie rejointe:', data)

            // Rediriger vers la salle d'attente
            navigate(`/salle-attente/${code}`)
        } catch (error) {
            console.error('Erreur:', error)
            alert('Erreur lors de la connexion à la partie')
        }
    }

    return (
        <div>
            <h1>Rejoindre une partie</h1>
            <input type="text"
                placeholder='Entrez le code de la partie'
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <input type="text"
                placeholder='Entrez votre pseudo'
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
            />
            <button onClick={valider} disabled={
                pseudo.trim() === '' ||
                code.trim() === ''}>Valider</button>
        </div>
    )
}

export default RejoindrePartie
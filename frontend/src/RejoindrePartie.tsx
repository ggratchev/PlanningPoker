import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function RejoindrePartie() {
    const [pseudo, setPseudo] = useState('')
    const [code, setCode] = useState('')
    const navigate = useNavigate()

    const valider = async () => {
        try {
            //const response = await fetch(`http://localhost:5000/api/rejoindre-partie/${code}`, {
            const response = await fetch(`https://planningpoker-0aph.onrender.com/api/rejoindre-partie/${code}`, {
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

            navigate(`/salle-attente/${code}`, {
                state: { pseudo: pseudo, createur: false }
            })

        } catch (error) {
            console.error('Erreur:', error)
            alert('Erreur lors de la connexion à la partie')
        }
    }

    return (
        <div className="Rejoindre_partie">
            <button className="bouton_retour" onClick={() => navigate('/')}> Retour à l'accueil </button>
            <div className="carte_rejoindre_partie">
                <h1 className="titre_rejoindre_partie">Rejoindre une partie</h1>

                <div className="ligne_formulaire_rejoindre">
                    <input
                        className="champ_texte_rejoindre"
                        type="text"
                        placeholder="Entrez le code de la partie"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />

                    <input
                        className="champ_texte_rejoindre"
                        type="text"
                        placeholder="Entrez votre pseudo"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                    />

                    <button
                        className="bouton_valider_rejoindre"
                        onClick={valider}
                        disabled={pseudo.trim() === "" || code.trim() === ""}
                    >
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
}
export default RejoindrePartie
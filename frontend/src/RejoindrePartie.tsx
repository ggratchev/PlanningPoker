import { useState } from 'react'

function RejoindrePartie() {
    const [pseudo, setPseudo] = useState('')

    const valider = () => {
        console.log("pseudo :", pseudo)
    }

    return (
        <div>
            <h1>Rejoindre une partie</h1>
            <input type="text"
                placeholder='Entrez votre pseudo'
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
            />
            <button onClick={valider} disabled={pseudo.trim() === ''}>Valider</button>
        </div>
    )
}

export default RejoindrePartie
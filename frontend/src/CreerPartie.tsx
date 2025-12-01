import { useState } from 'react'

function CreerPartie() {
    const [pseudo, setPseudo] = useState('')

    const valider = () => {
        console.log("pseudo :", pseudo)
    }

    return (
        <div>
            <h1>Créer une partie</h1>
            <input type="text"
                placeholder='Entrez votre pseudo'
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
            />
            <button onClick={valider}>Valider</button>
        </div>
    )
}

export default CreerPartie
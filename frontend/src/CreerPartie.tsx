import { useState } from 'react'

function CreerPartie() {
    const [pseudo, setPseudo] = useState('')
    const [modeDeJeu, setModeDeJeu] = useState('unanimite')

    const valider = () => {
        console.log("pseudo :", pseudo)
        console.log("modeDeJeu :", modeDeJeu)
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
            </select><button onClick={valider}>Valider</button>
        </div>
    )
}

export default CreerPartie
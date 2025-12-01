import { useState } from 'react'

function RejoindrePartie() {
    const [pseudo, setPseudo] = useState('')
    const [code, setCode] = useState('')

    const valider = () => {
        console.log("pseudo :", pseudo)
        console.log("code de la partie :", code)
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
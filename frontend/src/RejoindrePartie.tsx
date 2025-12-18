import { useState } from 'react'

function RejoindrePartie() {
    const [pseudo, setPseudo] = useState('')

    const valider = () => {
        console.log("pseudo :", pseudo)
    }

    return (
    <div className="Rejoindre_partie">
      <div className="carte_rejoindre_partie">
        <h1 className="titre_rejoindre_partie">Rejoindre une partie</h1>

        <div className="ligne_formulaire_rejoindre">
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
            disabled={pseudo.trim() === ""}
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejoindrePartie
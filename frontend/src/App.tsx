import { useNavigate } from "react-router-dom"
import "./global.css";
import "./principale.css";
import "./RejoindrePartie.css";

function App() {
  const navigate = useNavigate();

  const CreerPartie = () => {
    navigate("/creer-partie");
  }

  const RejoindrePartie = () => {
    navigate("/rejoindre-partie");
  }

  return (
    <div className="Div_principal">
      <div className="texte_principal">
        <h1 className="titre_principal">
          Planning Poker
        </h1>
        <p className="description">
          Estimez vos tâches en équipe de façon ludique
        </p>
      </div>

      <div className="boutons1">
        <button onClick={CreerPartie} className="bouton_principal">
        Créer une partie
        </button>
        <button onClick={RejoindrePartie} className="bouton_principal">
          Rejoindre une partie
        </button>
      </div>
    </div>
  )
}

export default App
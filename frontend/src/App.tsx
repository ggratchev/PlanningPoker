import { useNavigate } from "react-router-dom"
import "./App.css";

function App() {
  const navigate = useNavigate();

  const CreerPartie = () => {
    navigate("/creer-partie");
  }

  const RejoindrePartie = () => {
    navigate("/rejoindre-partie");
  }

  return (
    <div>
      <div class="texte_principal">
        <h1>Planning Poker</h1>
      </div>
      <div class="boutons1">
        <button onClick={CreerPartie} class="bouton_principal">Créer une partie</button>
        <button onClick={RejoindrePartie} class="bouton_principal">Rejoindre une partie</button>
      </div>
    </div>
  )
}

export default App
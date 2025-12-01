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
      <h1>Planning Poker</h1>
      <button onClick={CreerPartie} class="bouton_principal">Créer une partie</button>
      <button onClick={RejoindrePartie} class="bouton_principal">Rejoindre une partie</button>
    </div>
  )
}

export default App
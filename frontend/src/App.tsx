import { useNavigate } from "react-router-dom"

function App() {
  const navigate = useNavigate();

  const CreerPartie = () => {
    navigate("/creer-partie");
  }

  return (
    <div>
      <h1>Planning Poker</h1>
      <button onClick={CreerPartie}>Créer une partie</button>
      <button>Rejoindre une partie</button>
    </div>
  )
}

export default App
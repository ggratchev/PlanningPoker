import { useParams } from "react-router-dom"

function SalleAttente() {

    return (
        <div>
            <h1>Salle d'attente</h1>
            <h2>Code de la partie :</h2> {useParams().code}
        </div>
    )
}

export default SalleAttente
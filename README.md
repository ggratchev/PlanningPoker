
# Application Planning Poker

Projet réalisé dans le cadre du module de M1 Informatique Conception agile de projets informatiques (Valentin Lachand-Pascal 2025-26) à l'université Lyon 2.


## Auteurs

- [@ggratchev](https://www.github.com/ggratchev)
- [@Gast225245](https://github.com/Gast225245)


## Démo

Le projet est hébergé sur Vercel (Frontend) et render.com (Backend). L'url peut changer avec le temps à cause des limitations pour les comptes gratuits mais un lien valide se trouve à droite du bouton vert "Code" sous la section "About" en haut à droite de la page de ce repo.




## Pour lancer le projet en local

Cloner le projet

```bash
  git clone https://github.com/ggratchev/PlanningPoker.git
```

#### Lancement du frontend
Se déplacer dans le dossier frontend

```bash
  cd frontend
```

Installer les dépendances

```bash
  npm install
```

Démarrer le serveur

```bash
  npm run dev
```

#### Lancement du backend
Il faut tout d'abord commenter toutes les lignes contenant ```planningpoker-0aph.onrender.com``` et décommenter celles contenant ```localhost:5000``` car sinon le backend utilisé sera celui hébergé sur render.com et ne sera pas lancé en local.

```
const response = await fetch('http://localhost:5000/api/creer-partie', {
//const response = await fetch('https://planningpoker-0aph.onrender.com/api/creer-partie', {
```

Puis se rendre dans le dossier backend
```bash
  cd backend
```

Créer un environnement virtuel Python
```bash
python -m venv venv
```

Activer l'environnement virtuel
```bash
venv\Scripts\activate
```

Installer les dépendances
```bash
pip install -r requirements.txt
```

Lancer le serveur Flask
```bash
python app.py
```

Le projet sera ensuite accessible sur [http://localhost:5173](http://localhost:5173)


## Documentation
La documentation Doxygen du backend est accessible sur https://ggratchev.github.io/PlanningPoker/


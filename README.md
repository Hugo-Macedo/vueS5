### Prérequis

- [Node.js](https://nodejs.org/en/)
- [Npm](https://www.npmjs.com/get-npm)
- Projet Backend [WR506](https://github.com/Hugo-Macedo/symfonyS5)

### Installation

1. Cloner le projet
2. Installer les dépendances
    ```bash
    npm install
    ```
3. Créer le fichier .env.local et renseigner les variables d'environnement
    ```bash
    cp .env .env.local
    ```
4. Renseigner les variables suivantes :
    ```dotenv
    VITE_SERVER_API_URL #(url de l'api)
    ```
5. Lancer le serveur
- Development
```bash
npm run dev
```

Identifiants par défaut pour se connecter a l'application :
```
Admin:
    email: admin@gmail.com
    password: admin
Users:
    email: baptiste@gmail.com
    password: user0

    email: erwan@gmail.com
    password: user1

    email: paul@gmail.com
    password: user2

    email: oscar@gmail.com
    password: user3
```

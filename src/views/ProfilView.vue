<template>
    <main>
        <Nav />
        <div>
            <h1>Profil</h1>
            <p>Email : {{ email }}</p>
            <button @click="toggleUserEmail">Edit</button>
            <button @click="toggleUserPasswordForm = !toggleUserPasswordForm">Change Password</button>
            <form v-if="toggleUserPasswordForm" @submit.prevent="updateUserPassword">
                <label for="email">Confirmez votre mot de passe :</label>
                <input type="password" id="previousPassword" v-model="previousPassword" required>
                <label for="password">Nouveau Mot de passe:</label>
                <input type="password" id="password" v-model="password" required>
                <label for="password">Confirmez votre mot de passe</label>
                <input type="password" id="confirmPassword" v-model="confirmPassword" required>
                <button type="submit">Confirmer</button>
            </form>
        </div>
    </main>
</template>

<script>
import Nav from '../components/Nav.vue';
import Swal from 'sweetalert2';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export default {
    components: {
        Nav,
    },
    data() {
        return {
            email: '',
            userId: 0,
            editedUserEmail: '',
            toggleUserPasswordForm: false,
            previousPassword: '',
            password: '',
            confirmPassword: '',
        };
    },
    created() {
        this.getUserEmail()
    },
    methods: {
        getUserEmail() {

            const token = localStorage.getItem('token');
            if (!token) {
                //--- rediriger l'utilisateur vers la page de connexion
                this.$router.push('/login');
                return;
            }
            const tokenDecoded = jwtDecode(token)
            const userEmail = tokenDecoded.username
            this.email = userEmail               

            // On récupère l'id de l'utilisateur dans le payload du jwt
            const userId = tokenDecoded.id
            this.userId = userId
            
        }, 
        async toggleUserEmail(){
            this.editedUserEmail = this.email
            const inputValue = this.editedUserEmail
            const { value } = await Swal.fire({
                title: "Modifier Votre email " + this.email,
                input: "email",
                inputValue,
                showCancelButton: true,
                reverseButtons: true,
                inputValidator: (value) => {
                    if (!value) {
                        return "Vous devez écrire un email";
                    }
                }
            });

            

            if (value) {
                // Si l'utilisateur a saisi un nouveau titre et a cliqué sur "OK"
                // Mettre à jour le titre du film avec la nouvelle valeur
                this.editedUserEmail = value;
                // Appeler la méthode pour mettre à jour le titre du film dans la base de données, par exemple
                this.updateUserEmail();
            } else {
                // Si l'utilisateur a annulé ou n'a pas saisi de nouveau titre
                const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
                });
                Toast.fire({
                icon: "error",
                title: "Email non modifié"
                });
            }
            
        },
        async updateUserEmail() {       

            try {
                const token = localStorage.getItem('token'); // Récupérer le token d'authentification
                if (!token) {
                    //--- rediriger l'utilisateur vers la page de connexion
                    this.$router.push('/login');
                    return;
                }
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/merge-patch+json',
                };
                const updatedEmail = { email: this.editedUserEmail }; // Nouvel email

                // Envoyer la requête PATCH à l'API pour mettre à jour l'email
                const response = await axios.patch(`${import.meta.env.VITE_API_URL}/users/${this.userId}`, updatedEmail, { headers });

                const newToken = response.data.token
                this.email = response.data.email

                // Réinitialiser editedUserEmail après la mise à jour
                this.editedUserEmail = '';
                

                const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                    }
                });
                Toast.fire({
                    icon: "success",
                    title: "Email modifié avec succès"
                });
                localStorage.removeItem('token')
                localStorage.setItem('token', newToken)

            } catch (error) {
                console.error(error.response.data.message);
            }
        },
        async updateUserPassword() {
            try {
                const token = localStorage.getItem('token'); // Récupérer le token d'authentification
                if (!token) {
                    //--- rediriger l'utilisateur vers la page de connexion
                    this.$router.push('/login');
                    return;
                }
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/merge-patch+json',
                };
                const updatedPassword = { 
                    email: this.email,
                    previousPassword: this.previousPassword, 
                    password: this.password, 
                    confirmPassword: this.confirmPassword, 
                }; // Nouvel email

                // Envoyer la requête PATCH à l'API pour mettre à jour le mot de passe
                const response = await axios.patch(`${import.meta.env.VITE_API_URL}/users/${this.userId}`, updatedPassword, { headers });
                
                const newToken = response.data.token
                const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                    }
                });
                Toast.fire({
                    icon: "success",
                    title: "Mot de passe modifié avec succès"
                });
                localStorage.removeItem('token')
                localStorage.setItem('token', newToken)
            } catch (error) {

                alert(error.response.data.message);

            }
        }   
    }
}
</script>
<style scoped>
    main {
  margin: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

p {
  margin-bottom: 10px;
}

button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  margin-right: 10px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

input[type="password"] {
  padding: 8px;
  margin-bottom: 10px;
  width: 100%;
}

form {
  margin-top: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

</style>
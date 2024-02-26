<template>
    <div>
      <h2>Connexion</h2>
      <form @submit.prevent="login">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
        <label for="password">Mot de passe:</label>
        <input type="password" id="password" v-model="password" required>
        <button type="submit">Se connecter</button>
      </form>
      <a href="#" @click="forgotPassword">Mot de passe oublié ?</a>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async login() {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/login_check`, {
            username: this.email,
            password: this.password
        })
          
            const token = response.data.token
            localStorage.setItem('token', token)

            // Redirect to home
            this.$router.push('/')

          
        } catch (error) {

            if (localStorage.getItem('token')) {
                localStorage.removeItem('token')
            }
            console.log(error)
            alert('identifiants incorrects')
        }
      },
      forgotPassword() {
        // Envoyer une demande de mot de passe oublié
        // Vous pouvez implémenter cette fonctionnalité en utilisant Axios pour envoyer une requête au serveur
        console.log("Envoyer une demande de mot de passe oublié");
      }
    }
  };
  </script>
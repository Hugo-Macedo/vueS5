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
    }
  };
</script>
<style scoped>
  .login-container {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

</style>
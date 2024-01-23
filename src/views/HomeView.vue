<script>
import TheWelcome from '../components/TheWelcome.vue'
import axios from 'axios';

export default {
  data() {
    return {
      movies: [],
    };
  },
  created() {
    this.getMovies();
  },
  methods: {
    async getMovies() {
      try {
        // TODO DECOMENT WHEN LOGIN FORM IS AVAILABLE   

        // const token = localStorage.getItem('token');
        // if (!token) {
        //   //--- rediriger l'utilisateur vers la page de connexion
        //   this.$router.push('/');
        //   return;
        // }
        const response = await axios.get('http://localhost:80/api/movies', {
          headers: {
            // TODO DECOMENT WHEN LOGIN FORM IS AVAILABLE   
            // Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        this.movies = response.data;
        console.log (response.data);
      } catch (error) {
        console.error('Error', error);
        console.log(error.response.data.code);
        if(error.response.data.code==401){
        // TODO DECOMENT WHEN LOGIN FORM IS AVAILABLE   
          //---- détruire le token
          // localStorage.removeItem('token');
          //--- rediriger l'utilisateur vers la page de connexion
          this.$router.push('/');
          return;
        }
      }
    },
  }
};
</script>

<template>
  <main>
    <TheWelcome />
  <div>
    <h1>Liste des 4 derniers films</h1>
    <div v-for="(movie, index) in movies" :key="movie.id">
      <span v-if="index > 25">
        {{ movie.title }}
        <br>
        {{ movie.category.name }}
        <br>
        <br>
      </span>
    </div>
  </div>
  </main>
</template>

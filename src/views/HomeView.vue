<template>
  <main>
    <Nav />
    <div>
      <h1>Liste des 4 derniers films</h1>
      <div v-for="movie in movies.slice(0, 4)" :key="movie.id">
        <span>
          <MovieCard :movie="movie"/>
        </span>
      </div>
    </div>
    <div>
      <h1>Liste des 4 derniers acteurs</h1>
      <div v-for="actor in actors.slice(0, 4)">
        <span>
          <ActorCard :actor="actor"/>
        </span>
      </div>
    </div>
  </main>
</template>

<script>
import Nav from '../components/Nav.vue';
import axios from 'axios';
import MovieCard from '../components/MovieCard.vue';
import ActorCard from '../components/ActorCard.vue';


export default {
  components: {
    Nav,
    MovieCard,
    ActorCard,    
  },
  data() {
    return {
      movies: [],
      actors: [],
    };
  },
  created() {
    this.getForLastMovies();
    this.getForLastActors();
  },
  methods: {
    async getForLastMovies() {
      try {  

        const token = localStorage.getItem('token');
        if (!token) {
          //--- rediriger l'utilisateur vers la page de connexion
          this.$router.push('/login');
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/movies?order[releaseDate]=desc`, {
          headers: {  
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        this.movies = response.data;
      } catch (error) {
        console.error('Error', error);
        if(error.response.data.code==401){
          //---- détruire le token
          localStorage.removeItem('token');
          //--- rediriger l'utilisateur vers la page de connexion
          location.reload();
          return;
        }
      }
    },
    async getForLastActors() {
      try{

        const token = localStorage.getItem('token');
        if (!token) {
          //--- rediriger l'utilisateur vers la page de connexion
          this.$router.push('/login');
          return;
        }
        const response = await axios.get('http://localhost:80/api/actors?&order[id]=desc', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        this.actors = response.data;
      } catch (error) {
        console.error('Error', error);
        console.log(error.response.data.code);
        if(error.response.data.code==401){
        //---- détruire le token
        localStorage.removeItem('token');
        //--- rediriger l'utilisateur vers la page de connexion
        location.reload();
        return;
        }
      }
    }
  }
};
</script>

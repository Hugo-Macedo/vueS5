<template>
  <div>
    <h1>Liste des films</h1>
    <div>
      <input type="text" @input="searchMovie" v-model="searchMovieTitle" placeholder="Rechercher un film">
    </div>
    <router-link :to="{name: 'addmovie'}">
      <button>+ Ajouter un film</button>
    </router-link>
    <div class="container">
      <div class="row">
        <div class="col-md-9">
          <div class="row">
            <div v-if="!searchMovieTitle" class="col-md-6 border" v-for="movie in movies" :key="movie.id" >
              <router-link :to="{ name: 'moviedetails', params: { id: movie.id } }">{{ movie.title }}</router-link>
              <a @click="movie.editing = !movie.editing">Edit</a>
              <a @click="removeMovie(movie.id)">Remove</a>
              <form v-if="movie.editing" @submit.prevent="updateMovie(movie)">
                <label>Titre :</label>
                <input type="text" v-model="movie.title" required>
                <label>Catégorie :</label>
                <select v-model="selectedCategory" required>
                    <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
                </select>
                <label>Description :</label>
                <input type="textarea" v-model="movie.description" required>
                <label>Date de sortie :</label>
                <input type="date" v-model="releaseDate">
                <label>Durée (min):</label>
                <input type="number" min="0" max="400" v-model="movie.duration">
                <label>En ligne :</label>
                <input type="checkbox" v-model="movie.online">
                <label>Note sur 10 :</label>
                <input type="number" min="0" max="10" v-model="movie.note">
                <label>Nombres d'entrées :</label>
                <input type="number" min="0" max="50000000" v-model="movie.entries"> <br />
                <label>Acteurs:</label>
                <select v-model="selectedActors" multiple required>
                    <option v-for="actor in actors" :value="actor.id">{{ actor.firstName }} {{ actor.lastName }}</option>
                </select>
                <button type="submit">Mettre à jour le film</button>
              </form>
            </div>
            <div v-if="!searchMovieTitle" class="pagination">
              <button v-if="firstPageForGetMoviesRequest !== pageForGetMoviesRequest" @click="updatePaginationOfMovies(firstPageForGetMoviesRequest)">&lt;&lt;First</button>
              <button v-else disabled>&lt;&lt;First</button>
              <button v-if="previousPageForGetMoviesRequest" @click="updatePaginationOfMovies(previousPageForGetMoviesRequest)">&lt;Previous</button>
              <button v-else disabled>&lt;Previous</button>
              <button v-if="nextPageForGetMoviesRequest" @click="updatePaginationOfMovies(nextPageForGetMoviesRequest)">Next></button>
              <button v-else disabled>Next></button>
              <button v-if="lastPageForGetMoviesRequest !== pageForGetMoviesRequest" @click="updatePaginationOfMovies(lastPageForGetMoviesRequest)">Last>></button>
              <button v-else disabled>Last>></button>
            </div>
            <div v-if="searchMovieTitle.length">
              <div v-for="movie in searchResults" :key="movie.id">
                <router-link :to="{ name: 'moviedetails', params: { id: movie.id } }">{{ movie.title }}</router-link>
                <a @click="movie.editing = !movie.editing">Edit</a>
                <a @click="removeMovie(movie.id)">Remove</a>
              </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2'
import { RouterLink } from 'vue-router'

export default {
  data() {
    return {
      movies: [],
      categories: [],
      searchMovieTitle: '',
      searchResults: [],
      pageForGetMoviesRequest : '/movies?page=1',
      previousPageForGetMoviesRequest :'',
      nextPageForGetMoviesRequest : '',
      firstPageForGetMoviesRequest :'',
      lastPageForGetMoviesRequest :'',
      selectedCategory: null,
      actors: [], 
      selectedActors: [],
      releaseDate: ''
    };
  },
  created() {
    this.getMovies()
    this.getCategories()
    this.getActors()
  },
  methods: {
    async getMovies() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          //--- rediriger l'utilisateur vers la page de connexion
          this.$router.push('/login');
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}${this.pageForGetMoviesRequest}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json',
          },
        });
        this.movies = response.data['hydra:member'];
        this.movies.forEach(movie => {
          movie.editing = false; // Par défaut, le formulaire d'édition est masqué pour tous les films
        });

        //met à jour les variables vues pour la pagination
        
        this.pageForGetMoviesRequest = response.data['hydra:view']['@id'].replace("/api", "")
  
        if (response.data['hydra:view']['hydra:previous']) {
          this.previousPageForGetMoviesRequest = response.data['hydra:view']['hydra:previous'].replace("/api", "")
        } else {
          this.previousPageForGetMoviesRequest = ''
        }

        if (response.data['hydra:view']['hydra:next']) {
          this.nextPageForGetMoviesRequest = response.data['hydra:view']['hydra:next'].replace("/api", "")
        } else {
          this.nextPageForGetMoviesRequest = ''
        }

        this.firstPageForGetMoviesRequest = response.data['hydra:view']['hydra:first'].replace("/api", "")
        this.lastPageForGetMoviesRequest = response.data['hydra:view']['hydra:last'].replace("/api", "")

      } catch (error) {
        console.error('Error', error);
        if(error.response.data.code==401){
          //---- détruire le token
          localStorage.removeItem('token');
          //--- rediriger l'utilisateur vers la page de connexion
          this.$router.push('/login');
          return;
        }
      }
    },
    async getCategories() {
        try {
        const token = localStorage.getItem('token');

        if (!token) {

            this.$router.push('/login');
            return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`, {
            headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            },
        })

        this.categories = response.data

        } catch (error) {
            console.error('Error', error);
            (error.response.data.code);

            if(error.response.data.code==401){

              localStorage.removeItem('token');
              this.$router.push('/login');
              return;
            }
        }
    },
    async getActors() {
        try {
        const token = localStorage.getItem('token');

        if (!token) {

            this.$router.push('/login');
            return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/actors`, {
            headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            },
        })

        this.actors = response.data

        } catch (error) {
            console.error('Error', error);
            (error.response.data.code);

            if(error.response.data.code==401){

            localStorage.removeItem('token');
            this.$router.push('/login');
            return;
            }
      }
    },
    async searchMovie() {
      if(this.searchMovieTitle.length) {
        try {
          // reset la pagination par defaut
          this.pageForGetMoviesRequest = "/movies?page=1"

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

          const response = await axios.get(`${import.meta.env.VITE_API_URL}/movies?title=${this.searchMovieTitle}`, { headers });

          this.searchResults = response.data['hydra:member']

        } catch (error) {
          console.error('Erreur lors de la mise à jour du titre du film :', error);
        }
      } else {
         // relance l'\affichage des movies
         this.getMovies()
      }
    },
    async updateMovie(movie) {
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

          let releaseDateForApiFormat = null
          if (this.releaseDate) {
              const date = new Date(this.releaseDate);
              releaseDateForApiFormat =  date.toISOString();
          }

          const actorsUrls = this.selectedActors.map(id => `/api/actor/${id}`);

          const updatedMovie = { 
            "online": movie.online,
            "category": `/api/categories/${this.selectedCategory}`,
            "title": `${movie.title}`,
            "description": `${movie.description}`,
            "duration": Number(movie.duration),
            "releaseDate": releaseDateForApiFormat,
            "actors": actorsUrls,
            "entries": movie.entries !==null ? movie.entries : null,
            "note":  movie.note !== null ? movie.note : null 
          }; // Nouveau titre du film

          // Envoyer la requête PATCH à l'API pour mettre à jour le titre le film
          await axios.patch(`${import.meta.env.VITE_API_URL}/movies/${movie.id}`, updatedMovie, { headers });


          // Rafraîchir la liste des films
          this.getMovies();

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
            title: "Titre du film modifié avec succès"
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour du titre du film :', error);
        }
    },
    removeMovie(movieId) {
      Swal.fire({
        title: 'Suppression',
        text: 'Êtes vous sûr de vouloir supprimer le film ?',
        icon: 'warning',
        confirmButtonText: 'Supprimer',
        showDenyButton: true,
        denyButtonText: 'Annuler',
        reverseButtons: true,
      }).then(async (result) => {
        // Vérifie si l'utilisateur a cliqué sur le bouton de confirmation
        if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token'); // Récupérer le token d'authentification
          if (!token) {
            //--- rediriger l'utilisateur vers la page de connexion
            this.$router.push('/login');
            return;
          }
          const headers = {
            Authorization: `Bearer ${token}`,
          };

          await axios.delete(`${import.meta.env.VITE_API_URL}/movies/${movieId}`,{ headers });

          // Rafraîchir la liste des films
          await this.getMovies();

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
            title: "Film supprimé avec succès"
          });

        } catch (error) {
          console.error('Erreur lors de la mise à jour du titre du film :', error);
        }
        } else if (result.isDenied) {
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
            title: "Film non supprimé"
          });
        }
      });
    },

    updatePaginationOfMovies(newPage) {

      this.pageForGetMoviesRequest = newPage
      this.getMovies();
    },
  },
  
};
</script>
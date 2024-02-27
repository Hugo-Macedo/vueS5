<template>
  <ul>
    <li>Ajout d'un bouton "Add movie"</li>
    <li>La page contient un formulaire permettant d'ajouter un film</li>
    <li>Ajouter la possibilité de sélectionner un ou plusieurs acteurs liés au film</li>
    <li>Chaque "Movie" peut être supprimée</li>
    <li>Ajouter un popin de validation de suppression</li>
  </ul>
  <div>
    <h1>Liste des films</h1>
    <div>
      <input type="text" @input="searchMovie" v-model="searchMovieTitle" placeholder="Rechercher un film">
    </div>
    <div class="container">
      <div class="row">
        <div class="col-md-9">
          <div class="row">
            <div v-if="!searchMovieTitle" class="col-md-6 border" v-for="movie in movies" :key="movie.id" >
              <router-link :to="{ name: 'moviedetails', params: { id: movie.id } }">{{ movie.title }}</router-link>
              <a @click="toggleDetails(movie.id)">Edit</a>
            </div>
            <div v-if="!searchMovieTitle" class="pagination">
              <button v-if="firstPageForGetMoviesRequest !== pageForGetMoviesRequest" @click="updatePaginationOfMovies(firstPageForGetMoviesRequest)">Première page</button>
              <button v-else disabled>Première page</button>
              <button v-if="previousPageForGetMoviesRequest" @click="updatePaginationOfMovies(previousPageForGetMoviesRequest)">Page précédente</button>
              <button v-else disabled>Page précédente</button>
              <button v-if="nextPageForGetMoviesRequest" @click="updatePaginationOfMovies(nextPageForGetMoviesRequest)">Page suivante</button>
              <button v-else disabled>Page suivante</button>
              <button v-if="lastPageForGetMoviesRequest !== pageForGetMoviesRequest" @click="updatePaginationOfMovies(lastPageForGetMoviesRequest)">Dernière page</button>
              <button v-else disabled>Dernière page</button>
            </div>
            <div v-if="searchMovieTitle.length">
              <div v-for="movie in searchResults" :key="movie.id">
                <router-link :to="{ name: 'moviedetails', params: { id: movie.id } }">{{ movie.title }}</router-link>
                <a @click="toggleDetails(movie.id)">Edit</a>
              </div>
          </div>
          </div>
        </div>
        <div :class="['col-md-3', { 'd-none': !selectedMovieId }]">
          <h2 v-if="selectedMovie">{{ selectedMovie.title }}</h2>
          <form v-if="selectedMovie" @submit.prevent="updateMovieTitle">
            <div class="form-group">
              <label for="editMovieTitle">Titre du film :</label>
              <input
                  type="text"
                  class="form-control"
                  id="editMovieTitle"
                  v-model="editedMovieTitle"
              />
            </div>
            <button v-if="selectedMovie" type="submit" class="btn btn-primary">Modifier</button>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      movies: [],
      selectedMovieId: null,
      selectedMovie: null,
      editedMovieTitle:'',
      searchMovieTitle: '',
      searchResults: [],
      pageForGetMoviesRequest : '/movies?online=true&page=1',
      previousPageForGetMoviesRequest :'',
      nextPageForGetMoviesRequest : '',
      firstPageForGetMoviesRequest :'',
      lastPageForGetMoviesRequest :'',
    };
  },
  created() {
    this.getMovies();
  },
  methods: {
    toggleDetails(movieId) {
      // Permuter l'état du film sélectionné
      this.selectedMovieId = this.selectedMovieId === movieId ? null : movieId;
      this.selectedMovie = this.movies.find(movie => movie.id === this.selectedMovieId);
      this.editedMovieTitle = this.selectedMovie ? this.selectedMovie.title : '';
    },
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
        console.log(error.response.data.code);
        if(error.response.data.code==401){
          //---- détruire le token
          localStorage.removeItem('token');
          //--- rediriger l'utilisateur vers la page de connexion
          this.$router.push('/login');
          return;
        }
      }
    },
    async searchMovie() {
      if(this.searchMovieTitle.length) {
        try {
          // reset la pagination par defaut
          this.pageForGetMoviesRequest = "/movies?online=true&page=1"

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

          const response = await axios.get(`${import.meta.env.VITE_API_URL}/movies?online=true&title=${this.searchMovieTitle}`, { headers });

          this.searchResults = response.data['hydra:member']
          // Réinitialiser editedMovieTitle après la mise à jour
          this.editedMovieTitle = '';
          
          // relance l'\affichage des movies
          this.getMovies()
          // Réinitialiser la sélection du film après modification
          this.selectedMovieId = null;
        } catch (error) {
          console.error('Erreur lors de la mise à jour du titre du film :', error);
        }
      }
    },
    async updateMovieTitle() {
      if (this.selectedMovie && this.editedMovieTitle) {
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
          const updatedMovie = { title: this.editedMovieTitle }; // Nouveau titre du film

          // Envoyer la requête PATCH à l'API pour mettre à jour le titre du film
          await axios.patch(`${import.meta.env.VITE_API_URL}/movies/${this.selectedMovie.id}`, updatedMovie, { headers });

          // Réinitialiser editedMovieTitle après la mise à jour
          this.editedMovieTitle = '';

          // Rafraîchir la liste des films
          this.getMovies();

          // Réinitialiser la sélection du film après modification
          this.selectedMovieId = null;
        } catch (error) {
          console.error('Erreur lors de la mise à jour du titre du film :', error);
        }
      }
    },

    updatePaginationOfMovies(newPage) {

      this.pageForGetMoviesRequest = newPage
      this.getMovies();
    },
  },
};
</script>
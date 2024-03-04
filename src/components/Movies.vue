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
              <a @click="toggleDetails(movie.id)">Edit</a>
              <a @click="removeMovie(movie.id)">Remove</a>
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
                <a @click="toggleDetails(movie.id)">Edit</a>
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
      selectedMovieId: null,
      selectedMovie: null,
      editedMovieTitle:'',
      searchMovieTitle: '',
      searchResults: [],
      pageForGetMoviesRequest : '/movies?page=1',
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
    async toggleDetails(movieId) {
      // Permuter l'état du film sélectionné
      this.selectedMovieId = this.selectedMovieId === movieId ? null : movieId;
      this.selectedMovie = this.movies.find(movie => movie.id === this.selectedMovieId);
      this.editedMovieTitle = this.selectedMovie ? this.selectedMovie.title : '';

      const inputValue = this.editedMovieTitle;
      const { value } = await Swal.fire({
        title: "Modifier le titre du film " + this.selectedMovie.title,
        input: "text",
        inputValue,
        showCancelButton: true,
        reverseButtons: true,
        inputValidator: (value) => {
          if (!value) {
            return "Vous devez écrire un titre";
          }
        }
      });

      if (value) {
      // Si l'utilisateur a saisi un nouveau titre et a cliqué sur "OK"
      // Mettre à jour le titre du film avec la nouvelle valeur
      this.editedMovieTitle = value;
      // Appeler la méthode pour mettre à jour le titre du film dans la base de données, par exemple
      this.updateMovieTitle();
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
          title: "Titre du film non modifié"
        });
      }
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
          // Réinitialiser editedMovieTitle après la mise à jour
          this.editedMovieTitle = '';
          
         
          // Réinitialiser la sélection du film après modification
          this.selectedMovieId = null;
        } catch (error) {
          console.error('Erreur lors de la mise à jour du titre du film :', error);
        }
      } else {
         // relance l'\affichage des movies
         this.getMovies()
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

          // Réinitialiser la sélection du film après modification
          this.selectedMovieId = null;
        } catch (error) {
          console.error('Erreur lors de la mise à jour du titre du film :', error);
        }
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
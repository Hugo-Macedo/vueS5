<template>
    <div class="movie-details">
        <button @click="goBack" class="back-button">Retour</button>
        <h2>{{ movie.title}}</h2>
        <p v-if="movie.releaseDate"><strong>Date de sortie:</strong> {{ formatReleaseDate(movie.releaseDate) }}</p>
        <p v-if="movie.category"><strong>Catégorie:</strong> {{ movie.category.name }}</p>
        <p v-if="movie.duration"><strong>Durée:</strong> {{ movie.duration }}</p>
        <p v-if="movie.entries"><strong>Nombre d'entrée :</strong> {{ movie.entries }}</p>
        <p v-if="movie.description"><strong>Résumé :</strong> {{ movie.description }}</p>
        <p v-if="movie.note"><strong>Note :</strong> {{ movie.note }}</p>
        <p v-if="movie.online"><strong>En ligne :</strong> {{ movie.online }}</p>
        <p v-if="movie.actors"><strong>Acteurs:</strong></p>
        <p v-if="movie.actors" v-for="actor in movie.actors"><ActorCard :actor="actor" /></p>
    </div>
</template>
  
<script>
    import axios from 'axios';
    import ActorCard from '../components/ActorCard.vue';


    export default {
        components: {
            ActorCard,    
        },
        created() {
            // Recover the id of the movie
            const movieId = this.$route.params.id
            this.getInfosOfTheMovie(movieId)
        },
        data() {
            return {
            movie: [],
            };
        },
        methods: {
            formatReleaseDate(isoDateString) {
                const date = new Date(isoDateString);
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                return date.toLocaleDateString(undefined, options);
            },
            async getInfosOfTheMovie(movieId){
                try {  
                    const token = localStorage.getItem('token');
                    if (!token) {
                    //--- rediriger l'utilisateur vers la page de connexion
                    this.$router.push('/login');
                    return;
                    }
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/movies?id=${movieId}`, {
                    headers: {  
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                    });

                    this.movie = response.data[0];
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
            },
            goBack() {
                this.$router.go(-1); // Redirige vers la route précédente
            },
        },
    }
</script>
<style scoped>
    .movie-details {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  margin-bottom: 10px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #0056b3;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

strong {
  font-weight: bold;
}

p {
  margin-bottom: 10px;
}

</style>
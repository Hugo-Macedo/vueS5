<template>
    <div class="actor-details">
        <button @click="goBack" class="back-button">Retour</button>
        <h2>{{ actor.firstName}} {{ actor.lastName }}</h2>
        <p v-if="actor.nationality"><strong>Origine:</strong> {{ actor.nationality.name}}</p>
        <p><strong>Films:</strong></p>
        <p v-for="movie in actor.movies"><MovieCard :movie="movie" /></p>
    </div>
</template>
  
<script>
import axios from 'axios'
import MovieCard from '../components/MovieCard.vue'

    export default {
        components: {
            MovieCard
        },
        created() {
            const actorId = this.$route.params.id
            this.getInfosOfTheActor(actorId)
        },
        data() {
            return {
            actor: [],
            };
        },
        methods: {
            async getInfosOfTheActor(actorId){
                try {  
                    const token = localStorage.getItem('token');
                    if (!token) {
                        //--- rediriger l'utilisateur vers la page de connexion
                        this.$router.push('/login');
                        return;
                    }
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/actors?id=${actorId}`, {
                    headers: {  
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                    });
                    this.actor = response.data[0];
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
            goBack() {
                this.$router.go(-1); // Redirige vers la route précédente
            },
        },
    }
</script>
  
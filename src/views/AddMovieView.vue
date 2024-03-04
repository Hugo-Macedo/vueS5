<template>
<div>
    <button @click="goBack" class="back-button">Retour</button>
    <h1>Ajouter un film</h1>
    <form @submit.prevent="addMovie">
        <label>Titre :</label>
        <input type="text" v-model="title" required>
        <label>Catégorie :</label>
        <select v-model="selectedCategory" required>
            <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
        </select>
        <label>Description :</label>
        <input type="text" v-model="description" required>
        <label>Date de sortie :</label>
        <input type="date" v-model="releaseDate">
        <label>Durée (min):</label>
        <input type="number" min="0" max="400" v-model="duration">
        <label>En ligne :</label>
        <input type="checkbox" v-model="online">
        <label>Note sur 10 :</label>
        <input type="number" min="0" max="10" v-model="note">
        <label>Nombres d'entrées :</label>
        <input type="number" min="0" max="50000000" v-model="entries"> <br />
        <label>Actors:</label>
        <select v-model="selectedActors" multiple required>
            <option v-for="actor in actors" :value="actor.id">{{ actor.firstName }} {{ actor.lastName }}</option>
        </select>
        <button type="submit">Ajouter le film</button>
    </form>
  </div>
</template>
<script>
import axios from 'axios'
import Swal from 'sweetalert2'


export default {
  data() {
    return {
      title: '',
      description: null,
      releaseDate: null,
      duration: null,
      online: false,
      note: null,
      entries: null,
      selectedActors: [],
      selectedCategory: null,
      actors: [], 
      categories: [],     
    }
  },
  mounted() {
    this.getActors()
    this.getCategories()
  },
  methods: {

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
    async addMovie() {

        // Format date pour post à l'API

        let releaseDateForApiFormat = null
        if (this.releaseDate) {
            const date = new Date(this.releaseDate);
            releaseDateForApiFormat =  date.toISOString();
        }

        const actorsUrls = this.selectedActors.map(id => `/api/actor/${id}`);

        // Pour les valeurs qui peuvent être null en bd, vérifié si on envoie la valeur ou si on envoie null
        const dataToSend = {
            "online": this.online,
            "category": `/api/categories/${this.selectedCategory}`,
            "title": `${this.title}`,
            "description": `${this.description}`,
            "duration": this.duration !==null ? this.duration : null,
            "releaseDate": null,
            "actors": actorsUrls,
            "entries": this.entries !==null ? this.entries : null,
            "note":  this.note !== null ? this.note : null
        }

        try {
        const token = localStorage.getItem('token');

        if (!token) {
            this.$router.push('/login');
            return;
        }
        
        await axios.post(`${import.meta.env.VITE_API_URL}/movies`, dataToSend, {
            headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            },
        })

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
            title: "Film ajouté avec succès"
        });

        // rénitialiser les variables vues du formulaire
        this.title = ''
        this.category = null
        this.description = null
        this.releaseDate = null
        this.duration = null
        this.online = false
        this.note = null
        this.entries = null
        this.selectedActors = []
        this.selectedCategory = null
          
        } catch (error) {
            console.error('Error', error);
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
            title: "Film non ajouté"
          });
            if(error.response.data.code==401){

            localStorage.removeItem('token');
            this.$router.push('/login');
            return;
            }
      }
    },
    goBack() {
        this.$router.go(-1); // Redirige vers la route précédente
    },
  },
  watch: {
    online(newVal) {
      // Inverser la valeur de online lorsque la case à cocher est cochée ou décochée
      this.online = newVal;
    }
  }
}
</script>
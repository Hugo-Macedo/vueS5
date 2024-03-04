
<template>
  <div id="actorList">
    <h1>Liste des Acteurs</h1>
    <div class="search-bar">
      <input type="text" @input="searchActor" v-model="searchActorLastName" placeholder="Rechercher par nom de famille" id="searchInput">
    </div>
    <router-link :to="{name: 'addactor'}">
      <button id="addActorButton">+ Ajouter un acteur</button>
    </router-link>
    <div class="container">
      <div class="row">
        <div class="col-md-9">
          <div class="row">
            <div v-if="!searchActorLastName" class="col-md-6 border actor-card" v-for="actor in actors" :key="actor.id" >
              <router-link :to="{ name: 'actordetails', params: { id: actor.id } }" class="actor-name">{{ actor.firstName }} {{ actor.lastName }}</router-link>
              <a @click="actor.editing = !actor.editing" class="edit-link">Edit</a>
              <a @click="removeActor(actor.id)" class="remove-link">Remove</a>
              <form v-if="actor.editing" @submit.prevent="updateActor(actor)" class="edit-form">
                <label for="firstName">Prénom :</label>
                <input type="text" v-model="actor.firstName" required id="firstName">
                <label for="lastName">Nom :</label>
                <input type="text" v-model="actor.lastName" required id="lastName">
                <label for="nationality">Nationalité :</label>
                <select v-model="actor.nationality.name" required id="nationality">
                  <option v-for="nationality in nationalities" :value="nationality.id">{{ nationality.name}}</option>
                </select>
                <button type="submit" id="updateActorButton">Modifier l'acteur</button>
              </form>
            </div>
            <div v-if="!searchActorLastName" class="pagination">
              <button v-if="firstPageForGetActorsRequest !== pageForGetActorsRequest" @click="updatePaginationOfActors(firstPageForGetActorsRequest)" id="firstPageButton">&lt;&lt;First</button>
              <button v-else disabled>&lt;&lt;First</button>
              <button v-if="previousPageForGetActorsRequest" @click="updatePaginationOfActors(previousPageForGetActorsRequest)" id="previousPageButton">&lt;Previous</button>
              <button v-else disabled>&lt;Previous</button>
              <button v-if="nextPageForGetActorsRequest" @click="updatePaginationOfActors(nextPageForGetActorsRequest)" id="nextPageButton">Next></button>
              <button v-else disabled>Next></button>
              <button v-if="lastPageForGetActorsRequest !== pageForGetActorsRequest" @click="updatePaginationOfActors(lastPageForGetActorsRequest)" id="lastPageButton">Last>></button>
              <button v-else disabled>Last>></button>
            </div>
            <div v-if="searchActorLastName.length" class="search-results">
              <div v-for="actor in searchResults" :key="actor.id">
                <router-link :to="{ name: 'actordetails', params: { id: actor.id } }" class="actor-name">{{ actor.firstName }} {{ actor.lastName }}</router-link>
                <a @click="actor.editing = !actor.editing" class="edit-link">Edit</a>
                <a @click="removeActor(actor.id)" class="remove-link">Remove</a>
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
      actors: [],
      searchActorLastName: '',
      searchResults: [],
      pageForGetActorsRequest : '/actors?page=1',
      previousPageForGetActorsRequest :'',
      nextPageForGetActorsRequest : '',
      firstPageForGetActorsRequest :'',
      lastPageForGetActorsRequest :'',
      nationalities: []
    };
  },
  created() {
    this.getActors();
    this.getNationalities();
  },
  methods: {
    async getActors() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          //--- rediriger l'utilisateur vers la page de connexion
          this.$router.push('/login');
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}${this.pageForGetActorsRequest}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json',
          },
        });
        this.actors = response.data['hydra:member'];
        this.actors.forEach(actor => {
          actor.editing = false; // Par défaut, le formulaire d'édition est masqué pour tous les acteurs
        });

        //met à jour les variables vues pour la pagination
        
        this.pageForGetActorsRequest = response.data['hydra:view']['@id'].replace("/api", "")
  
        if (response.data['hydra:view']['hydra:previous']) {
          this.previousPageForGetActorsRequest = response.data['hydra:view']['hydra:previous'].replace("/api", "")
        } else {
          this.previousPageForGetActorsRequest = ''
        }

        if (response.data['hydra:view']['hydra:next']) {
          this.nextPageForGetActorsRequest = response.data['hydra:view']['hydra:next'].replace("/api", "")
        } else {
          this.nextPageForGetActorsRequest = ''
        }

        this.firstPageForGetActorsRequest = response.data['hydra:view']['hydra:first'].replace("/api", "")
        this.lastPageForGetActorsRequest = response.data['hydra:view']['hydra:last'].replace("/api", "")

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
    async searchActor() {
      if(this.searchActorLastName.length) {
        try {
          // reset la pagination par defaut
          this.pageForGetActorsRequest = "/actors?page=1"

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

          const response = await axios.get(`${import.meta.env.VITE_API_URL}/actors?lastName=${this.searchActorLastName}`, { headers });

          this.searchResults = response.data['hydra:member']
          
          // relance l'\affichage des acteurs
          
        } catch (error) {
          console.error('Erreur lors de la mise à jour du titre de l\'acteur:', error);
        }
      } else {
        this.getActors()
      }
    },
    async updateActor(actor) {

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
        const updatedActor = {
          "firstName": `${actor.firstName}`,
          "lastName": `${actor.lastName}`,
          "nationality": `api/nationalities/${actor.nationality.name}`
        };
        // Envoyer la requête PATCH à l'API pour mettre à jour l'acteur
        await axios.patch(`${import.meta.env.VITE_API_URL}/actors/${actor.id}`, updatedActor, { headers });

        // Rafraîchir la liste des acteurs
        this.getActors();

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
          title: "Acteur modifié avec succès"
        });

      } catch (error) {
        console.error('Erreur lors de la mise à jour du titre de l\'acteur :', error);
      }
    },
    removeActor(actorId) {
      Swal.fire({
        title: 'Suppression',
        text: 'Êtes vous sûr de vouloir supprimer l\'acteur ?',
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

          await axios.delete(`${import.meta.env.VITE_API_URL}/actors/${actorId}`,{ headers });

          // Rafraîchir la liste des acteurs
          await this.getActors();

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
            title: "Acteur supprimé avec succès"
          });

        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'acteur :'+ error);
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
            title: "Acteur non supprimé"
          });
        }
      });
    },

    updatePaginationOfActors(newPage) {

      this.pageForGetActorsRequest = newPage
      this.getActors();
    },

    async getNationalities() {
        try {
        const token = localStorage.getItem('token');

        if (!token) {

            this.$router.push('/login');
            return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/nationalities`, {
            headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            },
        })

        this.nationalities = response.data

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
  },
};
</script>
<style scoped>
  #actorList {
  margin-top: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

#searchInput {
  padding: 8px;
  width: 300px;
}

#addActorButton {
  margin-left: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actor-card {
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.actor-name {
  color: #333333;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
}

.edit-link,
.remove-link {
  color: #007bff;
  text-decoration: none;
  margin-right: 10px;
}

.edit-form {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
}

.search-results {
  margin-top: 20px;
}

</style>
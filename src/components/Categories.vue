<template>
  <div>
    <h1>Liste des Catégories</h1>
    <div>
      <input type="text" @input="searchCategory" v-model="searchCategoryName" placeholder="Rechercher une catégorie">
    </div>
    <router-link :to="{name: 'addcategory'}">
      <button>+ Ajouter une catégorie</button>
    </router-link>
    <div class="container">
      <div class="row">
        <div class="col-md-9">
          <div class="row">
            <div v-if="!searchCategoryName" class="col-md-6 border" v-for=" category in categories" :key="category.id" >
              <p>{{ category.name }}</p>
              <a @click="category.editing = !category.editing">Edit</a>
              <a @click="removeCategory(category)">Remove</a>
              <form v-if="category.editing" @submit.prevent="updateCategory(category)">
                <label>Nom de la catégorie :</label>
                <input type="text" v-model="category.name" required>
                <button type="submit">Modifier la catégorie</button>
            </form>
            </div>
            <div v-if="!searchCategoryName" class="pagination">
              <button v-if="firstPageForGetCategoriesRequest && firstPageForGetCategoriesRequest !== pageForGetCategoriesRequest" @click="updatePaginationOfCategories(firstPageForGetCategoriesRequest)">&lt;&lt;First</button>
              <button v-else disabled>&lt;&lt;First</button>
              <button v-if="previousPageForGetCategoriesRequest" @click="updatePaginationOfCategoriess(previousPageForGetCategoriesRequest)">&lt;Previous</button>
              <button v-else disabled>&lt;Previous</button>
              <button v-if="nextPageForGetCategoriesRequest" @click="updatePaginationOfCategories(nextPageForGetCategoriesRequest)">Next></button>
              <button v-else disabled>Next></button>
              <button v-if="lastPageForGetCategoriesRequest && lastPageForGetCategoriesRequest !== pageForGetCategoriesRequest" @click="updatePaginationOfCategories(lastPageForGetCategoriesRequest)">Last>></button>
              <button v-else disabled>Last>></button>
            </div>
            <div v-if="searchCategoryName.length">
              <div v-for="category in searchResults" :key="category.id">
                <p>{{ category.name }}</p>
                <a @click="category.editing = !category.editing">Edit</a>
                <a @click="removeCategory(category)">Remove</a>
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

export default {
  data() {
    return {
      categories: [],
      searchCategoryName: '',
      searchResults: [],
      pageForGetCategoriesRequest : '/categories?page=1',
      previousPageForGetCategoriesRequest :'',
      nextPageForGetCategoriesRequest : '',
      firstPageForGetCategoriesRequest :'',
      lastPageForGetCategoriesRequest :'',
    };
  },
  created() {
    this.getCategories();
  },
  methods: {
    async getCategories() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          //--- rediriger l'utilisateur vers la page de connexion
          this.$router.push('/login');
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}${this.pageForGetCategoriesRequest}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json',
          },
        });
        this.categories = response.data['hydra:member'];
        this.categories.forEach(category => {
          category.editing = false; // Par défaut, le formulaire d'édition est masqué pour tous les catégories
        });

        if(response.data['hydra:view']){
          //met à jour les variables vues pour la pagination  
                this.pageForGetCategoriesRequest = response.data['hydra:view']['@id'].replace("/api", "")
          
          if (response.data['hydra:view']['hydra:previous']) {
            this.previousPageForGetCategoriesRequest = response.data['hydra:view']['hydra:previous'].replace("/api", "")
          } else {
            this.previousPageForGetCategoriesRequest = ''
          }

          if (response.data['hydra:view']['hydra:next']) {
            this.nextPageForGetCategoriesRequest = response.data['hydra:view']['hydra:next'].replace("/api", "")
          } else {
            this.nextPageForGetCategoriesRequest = ''
          }

          if (response.data['hydra:view']['hydra:first']) {
            this.firstPageForGetCategoriesRequest = response.data['hydra:view']['hydra:first'].replace("/api", "")
          }
          if (response.data['hydra:view']['hydra:last']) {
            this.lastPageForGetCategoriesRequest = response.data['hydra:view']['hydra:last'].replace("/api", "")
          }
        }
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
    async searchCategory() {
      if(this.searchCategoryName.length) {
        try {
          // reset la pagination par defaut
          this.pageForGetCategoriesRequest = "/categories?page=1"

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

          const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories?name=${this.searchCategoryName}`, { headers });

          this.searchResults = response.data['hydra:member']
          
          // relance l'\affichage des categories
          
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la catégorie :', error);
        }
      } else {
        this.getCategories()
      }
    },
    async updateCategory(category) {

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
        const updatedCategory = {
          "name": `${category.name}`
        };
        // Envoyer la requête PATCH à l'API pour mettre à jour le titre du film
        await axios.patch(`${import.meta.env.VITE_API_URL}/categories/${category.id}`, updatedCategory, { headers });

        // Rafraîchir la liste des catégories
        this.getCategories();

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
          title: "Catégorie modifié avec succès"
        });

      } catch (error) {
        console.error('Erreur lors de la mise à jour du titre de la catégorie :', error);
      }
    },
    removeCategory(category) {
      if(category.movies.length === 0) {
        Swal.fire({
          title: 'Suppression',
          text: 'Êtes vous sûr de vouloir supprimer la catégorie ?',
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

            await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${category.id}`,{ headers });

            // Rafraîchir la liste des films
            await this.getCategories();

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
              title: "Catégorie supprimé avec succès"
            });

          } catch (error) {
            console.error('Erreur lors de la mise à jour de la catégorie :'+ error);
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
              title: "Catégorie non supprimé"
            });
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "La catégorie est liée à un ou plusieurs films",
        });
      }
    },

    updatePaginationOfCategories(newPage) {

      this.pageForGetCategoriesRequest = newPage
      this.getCategories();
    },
  },
};
</script>

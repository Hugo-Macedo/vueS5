<template>
    <div>
        <button @click="goBack" class="back-button">Retour</button>
        <h1>Ajouter un Acteur</h1>
        <form @submit.prevent="addActor">
            <label>Prénom :</label>
            <input type="text" v-model="actorFirstName" required>
            <label>Nom :</label>
            <input type="text" v-model="actorLastName" required>
            <label>Nationalité :</label>
            <select v-model="actorNationality" required>
                <option v-for="nationality in nationalities" :value="nationality.id">{{ nationality.name}}</option>
            </select>
            <button type="submit">Ajouter l'acteur</button>
        </form>
    </div>
</template>
<script>
    import axios from 'axios'
    import Swal from 'sweetalert2'
    
    
    export default {
      data() {
        return {
          nationalities : [],
          movies : [],
          actorFirstName : '',
          actorLastName : '',
          actorNationality : '',
        }
      },
      mounted() {
        this.getNationalities()
      },
      methods: {
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
        async addActor() {

            const dataToSend = {
                "firstName": this.actorFirstName,
                "lastName": this.actorLastName,
                "nationality": `/api/nationalities/${this.actorNationality}`,
            }

            try {
            const token = localStorage.getItem('token');

            if (!token) {
                this.$router.push('/login');
                return;
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/actors`, dataToSend, {
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
                title: "Acteur ajouté avec succès"
            });

            // rénitialiser les variables vues du formulaire
            this.actorFirstName = ''
            this.actorLastName = ''
            this.actorNationality = ''
            
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
                title: "Acteur non ajouté"
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
      }
    }
</script>    
<style scoped>
.add-actor {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  margin-bottom: 20px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #0056b3;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

</style>

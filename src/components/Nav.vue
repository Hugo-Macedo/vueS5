<template>
  <header id="mainHeader">
    <nav class="mainNav">
      <router-link to="/" class="navLink">Home</router-link>
      <router-link to="/movies" class="navLink">Movies</router-link>
      <router-link to="/actors" class="navLink">Actors</router-link>
      <router-link to="/categories" class="navLink">Catégories</router-link>
      <router-link to="/profil" class="navLink">Profil</router-link>
      <input type="button" value="Déconnexion" @click="deconnectUser()" id="logoutButton">
    </nav>
  </header>
</template>
<script>
  export default {
    methods: {
      deconnectUser() {
        localStorage.removeItem('token')
        location.reload()
      },
    }
  };
</script>

<style scoped>
  #mainHeader {
  padding: 10px;
}

.mainNav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navLink {
  color: black;
  text-decoration: none;
  margin-right: 20px;
}

#logoutButton {
  background-color: transparent;
  color: #007bff;
  border: none;
  cursor: pointer;
}

</style>
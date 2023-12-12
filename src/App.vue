<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Nav from './components/Nav.vue';
</script>

<template>
  <Nav />
  <RouterView />
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: row;
}
</style>

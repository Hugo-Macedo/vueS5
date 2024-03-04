<script>
   export default {
      props: ['actor']
   }
</script>
<template>
   <div class="ActorCard">
      <router-link :to="{ name: 'actordetails', params: { id: actor.id } }">{{ actor.firstName }} {{ actor.lastName }}</router-link>
      <p v-if="actor.nationality">{{ actor.nationality.name }}</p>
   </div>
</template>
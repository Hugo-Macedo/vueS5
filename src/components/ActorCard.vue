<script>
   export default {
      props: ['actor']
   }
</script>
<template>
   <div class="ActorCard" :id="'actorCard-' + actor.id">
      <router-link :to="{ name: 'actordetails', params: { id: actor.id } }" class="actorName" :id="'actorName-' + actor.id">{{ actor.firstName }} {{ actor.lastName }}</router-link>
      <p v-if="actor.nationality" class="nationality" :id="'nationality-' + actor.id">{{ actor.nationality.name }}</p>
   </div>
</template>
<style scoped>
   .ActorCard {
    background-color: #ffffff; 
    border: 1px solid #eaeaea; 
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
   }

   .ActorCard a {
      color: #333333; 
      text-decoration: none; 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 10px; 
      display: block; 
   }
   
   .ActorCard p {
      color: #666666; 
      font-size: 16px; 
      margin-top: 0; 
   }
</style>
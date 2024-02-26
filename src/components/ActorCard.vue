<script>
export default {
    props: ['actor']
}
</script>
<template>
   <div class="ActorCard">
      {{ actor.firstName }} {{ actor.lastName }}
      <br>  
      {{ actor.nationality.name }}
   </div>
</template>
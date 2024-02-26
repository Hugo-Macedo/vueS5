<script>
   export default {
  props: ['movie'],
  methods: {
    formatReleaseDate(isoDateString) {
      //To have date like dd/mm/YYYY
      const date = new Date(isoDateString);
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    },
  },
}
</script>
<template>
   <div class="MovieCard">
    <router-link :to="{ name: 'moviedetails', params: { id: movie.id } }">{{ movie.title }}</router-link>
    <br>
    {{ formatReleaseDate(movie.releaseDate) }}
    <br>
    {{ movie.category.name }}
   </div>
</template>
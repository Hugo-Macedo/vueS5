<script>
   export default {
  props: ['movie', 'movie.id'],
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
      <a :href="'/movies/'+movie.id">{{ movie.title }}</a>
      <br>
      {{ formatReleaseDate(movie.releaseDate) }}
      <br>
      {{ movie.category.name }}
   </div>
</template>
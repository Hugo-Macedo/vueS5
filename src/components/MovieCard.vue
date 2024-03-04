<template>
  <div class="MovieCard" :id="'movieCard-' + movie.id">
     <router-link :to="{ name: 'moviedetails', params: { id: movie.id } }" class="movieTitle" :id="'movieTitle-' + movie.id">{{ movie.title }}</router-link>
     <p v-if="movie.releaseDate" class="releaseDate" :id="'releaseDate-' + movie.id">{{ formatReleaseDate(movie.releaseDate) }}</p>
     <p v-if="movie.category" class="category" :id="'category-' + movie.id">{{ movie.category.name }}</p>
  </div>
</template>
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
<style scoped>
  .MovieCard {
    background-color: #ffffff;
    border: 1px solid #eaeaea; 
    border-radius: 8px; 
    padding: 20px; 
    margin-bottom: 20px; 
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); 
  }
  
  .MovieCard a {
      color: #333333;
      text-decoration: none; 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 10px; 
      display: block;
  }

  .MovieCard p {
      color: #666666;
      font-size: 16px;
      margin-top: 0;
  }
</style>
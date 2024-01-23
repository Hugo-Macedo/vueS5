<script>
    export default {
        props: ['movie', 'movie.id']
    }
</script>
<template>
    <div class="movie_details">
        {{ movie.title }} <br>
        {{ movie.releaseDate }}<br>
        {{ movie.duration }} <br>
        {{ movie.category.name }} <br>   

    </div>
</template>
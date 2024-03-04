import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue' 
import HomeView from '../views/HomeView.vue'
import MoviesView from '../views/MoviesView.vue'
import ActorsView from '../views/ActorsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ProfilView from '../views/ProfilView.vue'
import MovieDetailsView from '../views/MovieDetailsView.vue'
import ActorDetailsView from '../views/ActorDetailsView.vue'
import AddMovieView from '../views/AddMovieView.vue'
import AddActorView from '../views/AddActorView.vue'
import AddCategoryView from '../views/AddCategoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login', 
      component: LoginView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/movies',
      name: 'movies',
      component: MoviesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/actors',
      name: 'actors',
      component: ActorsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profil',
      name: 'profil',
      component: ProfilView,
      meta: { requiresAuth: true }
    },
    {
      path: '/movies/:id',
      name: 'moviedetails',
      component: MovieDetailsView
    },
    {
      path: '/actors/:id',
      name: 'actordetails',
      component: ActorDetailsView
    },
    {
      path: '/movies/add',
      name: 'addmovie',
      component: AddMovieView
    },
    {
      path: '/actors/add',
      name: 'addactor',
      component: AddActorView
    },
    {
      path: '/category/add',
      name: 'addcategory',
      component: AddCategoryView
    }
  ]
})

// Navigation guard global pour toutes les routes
router.beforeEach((to, from, next) => {
  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    // Vérifier si l'utilisateur est connecté en vérifiant la présence du token JWT dans le localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      // Rediriger vers la page de connexion si le token JWT n'est pas présent
      next({ name: 'login' });
    } else {
      // Autoriser l'accès à la route si l'utilisateur est connecté
      next();
    }
  } else {
    // Autoriser l'accès à la route si elle ne nécessite pas d'authentification
    next();
  }
})
export default router

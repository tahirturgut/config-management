<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="text-center mt-2">
    <h1 style="font-size: 4rem;">404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for does not exist or has been moved.</p>
    <Button 
      label="Back to Home" 
      icon="pi pi-home" 
      @click="goHome" 
      class="mt-1"
    />
  </div>
</template> 
<script setup>
import Header from './components/header/header.vue'
import { getUser } from '../db/user.js'
import { logout } from '../api/auth.js'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, provide, watch } from 'vue'
import Drawer from './components/drawer/drawer.vue'

const router = useRouter()
const route = useRoute();

const user = ref(getUser());
provide("user", user);

const isUserConnected = computed(() => !!user.value);

const handleLoggout = () => {
    logout();
    user.value = null;
    router.push('/');
};

watch(isUserConnected, (newValue, oldValue) => {
    if (!newValue) {
        router.push('/');
    } else {
        if (route.path === '/') {
            // Redirect based on user role
            connected();
        }
    }
});


const connected = () => {
    // Redirect user to their role-specific default page
    if (user.value) {
        switch (user.value.type) {
            case 'dev':
                router.push('/kanban');
                break;
            case 'manager':
                router.push('/dashboard');
                break;
            case 'admin':
                router.push('/users');
                break;
            default:
                router.push('/kanban');
        }
    } else {
        router.push('/kanban');
    }
}


if (isUserConnected.value) {
    // If user is already connected, redirect to their role-specific default page
    connected();
}
</script>

<template>
    <header v-if="isUserConnected">
        <Header 
            :username="user?.first_name + ' ' + user?.last_name" 
            :isConnected="isUserConnected"
            @disconnect="handleLoggout"
        />
    </header>
    <main>
      <Drawer 
        :isConnected="isUserConnected" 
        :userRole="user?.type"
      >
        <RouterView @connected="connected"/>
      </Drawer>
    </main>
</template>

<style scoped>
  
</style>

<style>
  h4 {
    margin: 0px
  }
  p {
    margin: 0px
  }
</style>
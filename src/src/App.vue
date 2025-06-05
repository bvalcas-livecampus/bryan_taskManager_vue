<script setup>
import Header from './components/header/Header.vue'
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

console.log("route", route.path)
watch(isUserConnected, (newValue, oldValue) => {
    if (!newValue) {
        router.push('/');
    } else {
      if (route.path === '/') {
        router.push('/kanban');
      }
    }
});

const connected = () => {
    router.push('/kanban');
}
</script>

<template>
    <header>
        <Header 
            :username="user?.name" 
            :isConnected="isUserConnected"
            @disconnect="handleLoggout"
        />
    </header>
    <main>
      <Drawer :isConnected="isUserConnected" >
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
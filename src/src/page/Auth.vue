<script setup>
import { ref } from 'vue'
import Input from '../components/input/input.vue'
import Button from '../components/button/button.vue'
import { login, signup } from '../../api/auth.js'

const email = ref('')
const password = ref('')
const name = ref('')
const isLoginMode = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  const result = await login(email.value, password.value)
  
  if (result.success) {
    console.log('Login successful:', result.user)
    // Redirect to main app or emit success event
  } else {
    errorMessage.value = result.error
  }
  
  isLoading.value = false
}

const handleSignup = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  const result = await signup(email.value, password.value, name.value)
  
  if (result.success) {
    console.log('Signup successful:', result.user)
    // Redirect to main app or emit success event
  } else {
    errorMessage.value = result.error
  }
  
  isLoading.value = false
}

const handleSubmit = () => {
  if (isLoginMode.value) {
    handleLogin()
  } else {
    handleSignup()
  }
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
  // Clear form when switching modes
  email.value = ''
  password.value = ''
  name.value = ''
}
</script>

<template>
    <div class="container">
        <h1>{{ isLoginMode ? 'Connexion' : 'Inscription' }}</h1>
        
        <div v-if="errorMessage" class="error">
            {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit">
            <Input
                v-if="!isLoginMode"
                id="name"
                name="name"
                label="Nom"
                :value="name"
                @update="val => name = val"
            />
            
            <Input
                id="email"
                name="email"
                label="Email"
                :value="email"
                @update="val => email = val"
            />
            
            <Input
                id="password"
                name="password"
                label="Mot de passe"
                
                :value="password"
                @update="val => password = val"
            />
            
            <Button 
                type="submit" 
                :label="isLoading ? 'Chargement...' : (isLoginMode ? 'Se connecter' : 'S\'inscrire')"
                @click="handleSubmit"
            />
        </form>

        <div class="toggle-mode">
            <p>
                {{ isLoginMode ? 'Pas encore de compte ?' : 'Déjà un compte ?' }}
                <button @click="toggleMode" class="link-button">
                    {{ isLoginMode ? 'S\'inscrire' : 'Se connecter' }}
                </button>
            </p>
        </div>
    </div>
</template>

<style scoped>
.container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
}

form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.error {
    background-color: #fee;
    color: #c33;
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid #fcc;
    margin-bottom: 1rem;
}

.toggle-mode {
    text-align: center;
    margin-top: 1.5rem;
}

.link-button {
    background: none;
    border: none;
    color: #007bff;
    text-decoration: underline;
    cursor: pointer;
    font-size: inherit;
}

.link-button:hover {
    color: #0056b3;
}
</style>
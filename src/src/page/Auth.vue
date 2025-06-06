<script setup>
import { ref, inject } from 'vue'
import Input from '../components/input/input.vue'
import Button from '../components/button/button.vue'
import Alert from '../components/alert/Alert.vue'
import { login, signup } from '../../api/auth.js'

const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
const isLoginMode = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')
const user = inject('user')
const emit = defineEmits(['connected'])

const handleLogin = async () => {
    isLoading.value = true
    errorMessage.value = ''
    
    const result = await login(email.value, password.value)
    
    if (result.success) {
        user.value = result.user
        emit('connected')
    } else {
        errorMessage.value = result.error
    }
  
  isLoading.value = false
}

const handleSignup = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  const result = await signup(email.value, password.value, firstName.value, lastName.value)
  
  if (result.success) {
    user.value = result.user
    emit('connected')
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
  firstName.value = ''
  lastName.value = ''
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Brand Header -->
      <div class="brand-header">
        <div class="brand-logo">🦕</div>
        <h1 class="brand-title">Donezilla</h1>
        <p class="brand-subtitle">Task Management Made Simple</p>
      </div>

      <!-- Auth Card -->
      <div class="auth-card">
        <div class="card-header">
          <h2>{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h2>
          <p>{{ isLoginMode ? 'Sign in to your account' : 'Join us today' }}</p>
        </div>

        <!-- Alert Message -->
        <Alert :message="errorMessage" type="error" />

        <!-- Auth Form -->
        <form @submit.prevent="handleSubmit" class="auth-form">
          <!-- Name Fields (Signup only) -->
          <div v-if="!isLoginMode" class="name-fields">
            <div class="field-group">
              <label for="firstName">First Name</label>
              <Input
                id="firstName"
                name="firstName"
                :value="firstName"
                @update="val => firstName = val"
                placeholder="Enter your first name"
              />
            </div>
            <div class="field-group">
              <label for="lastName">Last Name</label>
              <Input
                id="lastName"
                name="lastName"
                :value="lastName"
                @update="val => lastName = val"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div class="field-group">
            <label for="email">Email Address</label>
            <Input
              id="email"
              name="email"
              type="email"
              :value="email"
              @update="val => email = val"
              placeholder="Enter your email"
            />
          </div>

          <!-- Password Field -->
          <div class="field-group">
            <label for="password">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              :value="password"
              @update="val => password = val"
              placeholder="Enter your password"
            />
          </div>

          <!-- Submit Button -->
          <Button 
            type="submit" 
            :label="isLoading ? 'Loading...' : (isLoginMode ? 'Sign In' : 'Create Account')"
            :loading="isLoading"
            variant="primary"
            class="submit-button"
          />
        </form>

        <!-- Toggle Mode -->
        <div class="auth-footer">
          <p>
            {{ isLoginMode ? "Don't have an account?" : 'Already have an account?' }}
            <button @click="toggleMode" class="toggle-button">
              {{ isLoginMode ? 'Sign Up' : 'Sign In' }}
            </button>
          </p>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="auth-info">
        <p>🚀 Streamline your team's workflow</p>
        <p>📊 Track progress in real-time</p>
        <p>👥 Collaborate seamlessly</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Brand Header */
.brand-header {
  text-align: center;
  color: white;
  margin-bottom: 1rem;
}

.brand-logo {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.brand-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

/* Auth Card */
.auth-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.card-header p {
  color: #718096;
  margin: 0;
  font-size: 1rem;
}

/* Auth Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.submit-button {
  margin-top: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Auth Footer */
.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.auth-footer p {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.toggle-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  font-size: inherit;
  transition: color 0.2s;
}

.toggle-button:hover {
  color: #5a67d8;
  text-decoration: underline;
}

/* Auth Info */
.auth-info {
  text-align: center;
  color: white;
  opacity: 0.9;
}

.auth-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 300;
}

/* Responsive Design */
@media (max-width: 640px) {
  .auth-page {
    padding: 0.5rem;
  }
  
  .auth-card {
    padding: 1.5rem;
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .brand-logo {
    font-size: 3rem;
  }
  
  .name-fields {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .card-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .auth-container {
    max-width: 100%;
  }
  
  .auth-card {
    padding: 1.25rem;
    margin: 0 0.5rem;
  }
  
  .brand-header {
    margin-bottom: 0.5rem;
  }
  
  .brand-title {
    font-size: 1.75rem;
  }
  
  .brand-subtitle {
    font-size: 1rem;
  }
}

/* Animation */
.auth-card {
  animation: fadeInUp 0.6s ease-out;
}

.brand-header {
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
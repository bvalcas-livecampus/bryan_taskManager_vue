<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    isConnected: {
        type: Boolean,
        default: false
    },
    isOpen: {
        type: Boolean,
        default: false
    },
    width: {
        type: String,
        default: '280px'
    },
    userRole: {
        type: String,
        default: null
    }
})

// Define navigation items based on user role
const navigationItems = computed(() => {
    if (!props.userRole) return []
    
    switch (props.userRole) {
        case 'dev':
            return [
                { path: '/kanban', label: '📋 Kanban', icon: '📋' }
            ]
        case 'manager':
            return [
                { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
                { path: '/kanban', label: '📋 Kanban', icon: '📋' },
                { path: '/projects', label: '📁 Projects', icon: '📁' },
                { path: '/tasks', label: '✅ Tasks', icon: '✅' }
            ]
        case 'admin':
            return [
                { path: '/users', label: '👥 Users', icon: '👥' },
                { path: '/teams', label: '🏢 Teams', icon: '🏢' }
            ]
        default:
            return []
    }
})

const emit = defineEmits(['close', 'toggle'])

const isDrawerOpen = ref(props.isOpen)

const toggleDrawer = () => {
    isDrawerOpen.value = !isDrawerOpen.value
    emit('toggle', isDrawerOpen.value)
}

const closeDrawer = () => {
    isDrawerOpen.value = false
    emit('close')
}

const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
        closeDrawer()
    }
}
</script>

<template>
    <div class="layout-container">
        <!-- Hamburger Menu Button -->
        <button v-if="isConnected" @click="toggleDrawer" class="menu-toggle">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        </button>

        <!-- Drawer Overlay -->
        <div 
            v-if="isConnected && isDrawerOpen"
            class="drawer-overlay" 
            @click="handleOverlayClick"
        >
            <div 
                class="drawer-container"
                :class="{ 'drawer-open': isDrawerOpen }"
                :style="{ width: width }"
            >
                <div class="drawer-header">
                    <h3>Menu</h3>
                    <button @click="closeDrawer" class="close-btn">
                        ×
                    </button>
                </div>
                <div class="drawer-content">
                    <!-- Navigation/Menu Content -->
                    <nav class="drawer-nav">
                        <ul>
                            <li v-for="item in navigationItems" :key="item.path">
                                <RouterLink :to="item.path">{{ item.label }}</RouterLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content" :class="{ 'drawer-open': isDrawerOpen }">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.layout-container {
    position: relative;
    min-height: 100vh;
}

.menu-toggle {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1001;
    background-color: #2c3e50;
    border: none;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background-color 0.3s;
}

.menu-toggle:hover {
    background-color: #34495e;
}

.hamburger-line {
    width: 20px;
    height: 2px;
    background-color: white;
    transition: all 0.3s;
}

.drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: flex-start;
    animation: fadeIn 0.3s ease-in-out;
}

.drawer-container {
    background-color: white;
    height: 100vh;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
}

.drawer-container.drawer-open {
    transform: translateX(0);
}

.drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e0e0e0;
    background-color: #f8f9fa;
}

.drawer-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.2rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #e9ecef;
    color: #333;
}

.drawer-content {
    flex: 1;
    padding: 0;
    overflow-y: auto;
}

.drawer-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.drawer-nav li {
    border-bottom: 1px solid #f0f0f0;
}

.drawer-nav a {
    display: block;
    padding: 1rem 1.5rem;
    text-decoration: none;
    color: #2c3e50;
    font-size: 1rem;
    transition: all 0.3s;
}

.drawer-nav a:hover {
    background-color: #f8f9fa;
    color: #007bff;
    padding-left: 2rem;
}

.main-content {
    transition: margin-left 0.3s ease-in-out;
    min-height: 100vh;
    padding: 20px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .menu-toggle {
        top: 15px;
        left: 15px;
        padding: 10px;
    }
    
    .hamburger-line {
        width: 18px;
    }
    
    .main-content {
        padding: 15px;
    }
}
</style>
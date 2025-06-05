<script setup>
    const props = defineProps({
        username: {
            type: String,
            default: null
        },
        isConnected: {
            type: Boolean,
            default: false
        }
    })
    const emit = defineEmits(['disconnect'])
    const disconnect = () => {
        emit('disconnect')
    }
</script>

<template>
    <header class="header">
        <div class="header-content">
            <div class="user-info" v-if="isConnected && username">
                <span class="username">{{ username }}</span>
            </div>
            <div class="app-title" v-else>
                <h2>Task Manager</h2>
            </div>
            <button v-if="isConnected" @click="disconnect" class="disconnect-btn">
                Disconnect
            </button>
        </div>
    </header>
</template>



<style scoped>
.header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-info {
    display: flex;
    align-items: center;
}

.username {
    font-weight: 500;
    font-size: 1.1rem;
}

.disconnect-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s;
}

.disconnect-btn:hover {
    background-color: #c0392b;
}

.app-title {
    flex: 1;
}

.app-title h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
}
</style>
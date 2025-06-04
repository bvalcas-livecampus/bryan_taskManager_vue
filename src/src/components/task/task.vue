<script setup>
    const props = defineProps({
        title: { type: String, require: true },
        description: { type: String},
        done: { type: Boolean }
    })

    const emit = defineEmits(['delete', 'toggle'])

    function handleDelete() {
        emit('delete')
    }

    function handleToggle() {
        emit('toggle')
    }
</script>

<template >
    <div class="container" :class="{ 'task-done': props.done }">
        <div class="task-content">
            <h4 :class="{ 'text-done': props.done }">{{ props.title }}</h4>
            <p :class="{ 'text-done': props.done }">{{ props.description }}</p>
        </div>
        <div class="actions">
            <input type="checkbox" :checked="props.done" @change="handleToggle">
            <button type="button" @click="handleDelete">supprimer</button>
        </div>
    </div>
</template>

<style scoped>
    .container {
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 20px;
        padding-right: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-style: solid;
        border-width: 1px;
        border-color: black;
        transition: all 0.3s ease;
    }

    .task-done {
        background-color: #f0f8ff;
        border-color: #28a745;
        opacity: 0.8;
    }

    .text-done {
        text-decoration: line-through;
        color: #6c757d;
    }

    .task-content {
        display: flex;
        flex-direction: column;
    }

    .actions {
        display: flex;
        gap: 20px;
        align-items: center;
    }
</style>
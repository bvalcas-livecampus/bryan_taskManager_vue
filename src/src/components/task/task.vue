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
    <div class="container">
        <div>
            <h4>{{ props.title }}</h4>
            <p>{{ props.description }}</p>
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
    }
    .text {
        display: flex;
    }
    .actions {
        display: flex;
        gap: 20px
    }
</style>
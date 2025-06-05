<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    id: { type: String, require: true },
    name: { type: String, require: true },
    placeholder: { type: String },
    label: { type: String },
    value: { type: String, default: '' } // Ajout de la prop value
})

const emit = defineEmits(['update'])
const text = ref(props.value)

// Synchronise text avec la prop value
watch(() => props.value, (newVal) => {
    text.value = newVal
})

function onInput(event) {
    text.value = event.target.value
    emit('update', text.value)
}
</script>

<template >
    <div class="container">
        <label :for="props.name" >{{ props.label }}</label>
        <input
            type="text"
            :id="props.id"
            :name="props.name"
            :placeholder="props.placeholder"
            :value="text"
            @input="onInput"
        />
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
}
</style>
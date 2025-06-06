<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    id: { type: String, require: true },
    name: { type: String, require: true },
    type: { type: String, default: 'text' },
    placeholder: { type: String },
    label: { type: String },
    value: { type: String, default: '' }
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
            :type="props.type"
            :id="props.id"
            :name="props.name"
            :placeholder="props.placeholder"
            :value="text"
            @input="onInput"
            class="input-field"
        />
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
}

.input-field {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    color: #2d3748;
    background-color: #ffffff;
    transition: all 0.2s;
    outline: none;
}

.input-field:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
    color: #a0aec0;
}
</style>
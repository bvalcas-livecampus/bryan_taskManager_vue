<script setup>
const props = defineProps({
    label: { type: String },
    type: { type: String, default: 'button' },
    variant: { 
        type: String, 
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning'].includes(value)
    },
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    icon: { type: String, default: '' }
})

const emit = defineEmits(['click'])

function handleClick() {
    if (!props.disabled && !props.loading) {
        emit('click')
    }
}
</script>

<template>
    <button 
        :type="props.type" 
        :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-loading': loading }]"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <span v-if="loading" class="spinner"></span>
        <span v-if="icon && !loading" class="btn-icon">{{ icon }}</span>
        <span v-if="label">{{ label }}</span>
        <slot></slot>
    </button>
</template>

<style scoped>
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Sizes */
.btn-small {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
}

.btn-medium {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
}

.btn-large {
    padding: 1rem 2rem;
    font-size: 1rem;
}

/* Variants */
.btn-primary {
    background: #3182ce;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2b6cb0;
}

.btn-secondary {
    background: #edf2f7;
    color: #2d3748;
}

.btn-secondary:hover:not(:disabled) {
    background: #e2e8f0;
}

.btn-success {
    background: #48bb78;
    color: white;
}

.btn-success:hover:not(:disabled) {
    background: #38a169;
}

.btn-danger {
    background: #e53e3e;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #c53030;
}

.btn-warning {
    background: #ed8936;
    color: white;
}

.btn-warning:hover:not(:disabled) {
    background: #d69e2e;
}

/* Loading spinner */
.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.btn-icon {
    display: flex;
    align-items: center;
}
</style>
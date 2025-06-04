<script setup>
    const props = defineProps({
        label: { type: String },
        type: { type: String }
    })

    const emit = defineEmits(['click'])

    function handleClick() {
        emit('click')
    }
</script>

<template >
    <div>
       <button :type="props.type" @click="handleClick">{{ props.label }}</button> 
    </div>
</template>

<style scoped>

</style>
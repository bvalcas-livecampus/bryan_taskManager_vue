<script setup>
    const props = defineProps({
        label: { type: String },
        type: { type: String }
    })
</script>

<template >
    <div>
       <button :type="props.type">{{ props.label }}</button> 
    </div>
</template>

<style scoped>

</style>
<script setup>
    const props = defineProps({
        id: { type: String, require: true },
        name: { type: String, require: true },
        placeholder: { type: String },
        label: { type: String },
    })
</script>

<template >
    <div class="container">
        <label :for="props.name" >{{ props.label }}</label>
        <input
            type="text"
            v-model="text"
            :id="props.id"
            :name="props.name"
            :placeholder="props.placeholder"
        />
    </div>
</template>

<style scoped>

    .container {
        display: flex;
        flex-direction: column;
    }

</style>
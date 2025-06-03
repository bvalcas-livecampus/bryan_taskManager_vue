<script setup>
  import Input from './components/input/input.vue'
  import Button from './components/button/button.vue'
  import Task from './components/task/task.vue'
  const tasks = [
    { id: 0, title: "example task", description: "this is the descripit", done: false },
    { id: 1, title: "example task 2", description: "this is the descripit", done: false },
  ]
</script>

<template>
  <header>
  </header>

  <form>
    <Input id="button" v-model:name="title" label="Renseignez le titre"></Input>
    <Input id="button" v-model:name="description" label="Renseignez la description"></Input>
    <Button @click="addTask" type="submit" label="Ajouter une task"></Button>
  </form>

  <div> Vous avez {{ tasks.length }} tâche{{ tasks.length > 1 ? "s" : "" }}</div>
  <div> Vous avez {{ tasks.filter((task) => !task.done).length }} tâche{{ tasks.filter((task) => !task.done).length > 1 ? "s" : "" }} en cours</div>
  <div> Vous avez {{ tasks.filter((task) => task.done).length }} tâche{{ tasks.filter((task) => task.done).length > 1 ? "s" : "" }} terminée{{ tasks.filter((task) => task.done).length > 1 ? "s" : "" }}</div>

  <div class="list">
    <Task v-for="(task, index) in tasks" :title="task.title" :description="task.description" :done="task.done"></Task>
  </div>
</template>

<style scoped>

@media (min-width: 1024px) {

}

  .list {
    display: flex;
    flex-direction: column;
    gap: 5px 
  }
</style>


<style >
  h4 {
    margin: 0px
  }
  p {
    margin: 0px
  }
</style>
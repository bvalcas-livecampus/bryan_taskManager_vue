<script setup>
import { ref, computed, onMounted } from 'vue'
import Input from './components/input/input.vue'
import Button from './components/button/button.vue'
import Task from './components/task/task.vue'
import { 
  tasks, 
  getTasks, 
  addTask as addTaskToStore, 
  deleteTask as deleteTaskFromStore, 
  toggleTask as toggleTaskInStore 
} from '../db/tasks.js'

const title = ref('')
const description = ref('')

const addTask = (e) => {
  e.preventDefault()
  if (!title.value) return
  
  addTaskToStore({
    title: title.value,
    description: description.value
  })
  
  title.value = ''
  description.value = ''
}

const deleteTask = (index) => {
  const task = tasks.value[index]
  if (task) {
    deleteTaskFromStore(task.id)
  }
}

const toggleTask = (index) => {
  const task = tasks.value[index]
  if (task) {
    toggleTaskInStore(task.id)
  }
}

const totalTask = computed(() => tasks.value.length)
const totalTaskNotDone = computed(() => tasks.value.filter((task) => !task.done).length)
const totalTaskDone = computed(() => tasks.value.filter((task) => task.done).length)

onMounted(() => {
  getTasks()
})
</script>

<template>
  <header>
  </header>

  <form @submit="addTask">
    <Input
      id="title"
      name="title"
      label="Renseignez le titre"
      placeholder="Titre de la tâche"
      :value="title"
      @update="val => title = val"
    />
    <Input
      id="description"
      name="description"
      label="Renseignez la description"
      placeholder="Description de la tâche"
      :value="description"
      @update="val => description = val"
    />
    <Button type="submit" label="Ajouter une task" />
  </form>

  <div> Vous avez {{ totalTask }} tâche{{ totalTask > 1 ? "s" : "" }}</div>
  <div> Vous avez {{ totalTaskNotDone }} tâche{{ totalTaskNotDone > 1 ? "s" : "" }} en cours</div>
  <div> Vous avez {{ totalTaskDone }} tâche{{ totalTaskDone > 1 ? "s" : "" }} terminée{{ totalTaskDone > 1 ? "s" : "" }}</div>

  <div class="list">
    <Task
      v-for="(task, index) in tasks"
      :key="task.id"
      :title="task.title"
      :description="task.description"
      :done="task.done"
      @delete="deleteTask(index)"
      @toggle="toggleTask(index)"
    />
  </div>
</template>

<style scoped>
  .list {
    display: flex;
    flex-direction: column;
    gap: 5px 
  }
</style>

<style>
  h4 {
    margin: 0px
  }
  p {
    margin: 0px
  }
</style>
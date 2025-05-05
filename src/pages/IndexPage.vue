<template>
  <q-page class="row">
    <!-- <div class="col-4">
      <ExampleComponent title="My Todos" :todos="todos" :meta="meta" :active="true" />
    </div> -->
    <div class="col">
      <PutDataComponent />
    </div>
  </q-page>
</template>

<script setup lang="ts">
//import { ref } from 'vue';
//import type { Todo, Meta } from 'components/models';
//import ExampleComponent from 'components/ExampleComponent.vue';
import PutDataComponent from 'components/convert/PutDataComponent.vue';

/* const todos = ref<Todo[]>([
  {
    id: 1,
    content: 'ct1',
  },
  {
    id: 2,
    content: 'ct2',
  },
  {
    id: 3,
    content: 'ct3',
  },
  {
    id: 4,
    content: 'ct4',
  },
  {
    id: 5,
    content: 'ct5',
  },
  {
    id: 5,
    content: 'ct5',
  },
]);

const meta = ref<Meta>({
  totalCount: 1200,
}); */
</script>

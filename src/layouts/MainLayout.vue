<template>
  <div class="q-pa-md">
    <q-layout view="lHh lpr lFf" class="shadow-5 rounded-borders">
      <q-header elevated>
        <q-toolbar style="background-color: purple; border: #999999; color: white">
          <!--use svg fedex-->
          <i
            class="fa-brands fa-fedex"
            style="font-size: 60px; color: white; margin-right: 10px"
            title="FedEx Logo"
          ></i>
          <q-toolbar-title> Convertidor ShipFast </q-toolbar-title>

          <!--agregar una etiqeta al boton cuando el mouse este encima del boton-->

          <q-btn flat dense icon="whatshot" label="V1.9" class="q-ml-md" style="color: white">
            <q-tooltip class="bg-accent">Creado por: Sannchiss Pérez</q-tooltip>
          </q-btn>
          <q-separator vertical spaced />
          <q-btn flat @click="drawerRight = !drawerRight" round dense icon="settings" />
        </q-toolbar>
      </q-header>

      <q-drawer
        side="right"
        v-model="drawerRight"
        show-if-above
        bordered
        :width="200"
        :breakpoint="500"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-scroll-area class="fit">
          <ConfigurationComponent />
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import ConfigurationComponent from 'src/components/configuration/ConfigurationComponent.vue';

export default {
  setup() {
    return {
      drawerRight: ref(false),
    };
  },
  components: {
    ConfigurationComponent,
  },
};
</script>

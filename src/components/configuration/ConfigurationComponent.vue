<template>
  <div>
    <h1 class="text-h6 q-mb-md text-weight-bold text-center">Configuración</h1>
    <div class="q-pa-sm">
      <q-toggle
        label="Dims. fijas"
        v-model="config.staticDimensions"
        size="xs"
        @update:model-value="
          (val) => {
            if (val) config.dynamicDimensions = false;
          }
        "
      />
      <!-- ingresar las dimensiones de la caja x, y, z  -->
      <q-input
        type="number"
        label="Largo"
        v-model="config.largo"
        dense
        filled
        class="q-mb-sm"
        :readonly="!config.staticDimensions"
      />
      <q-input
        type="number"
        label="Ancho"
        v-model="config.ancho"
        dense
        filled
        class="q-mb-sm"
        :readonly="!config.staticDimensions"
      />
      <q-input
        type="number"
        label="Alto"
        v-model="config.alto"
        dense
        filled
        :readonly="!config.staticDimensions"
      />
      <q-separator class="q-mt-md q-mb-md" />
      <!-- activar dimensiones dinamicas -->
      <q-toggle
        label="Dims. dinámicas"
        v-model="config.dynamicDimensions"
        size="xs"
        @update:model-value="
          (val) => {
            if (val) config.staticDimensions = false;
          }
        "
      />
      <p v-if="config.dynamicDimensions" class="q-mb-sm q-mt-sm text-caption text-justify">
        Las dimensiones dinámicas permiten ajustar el tamaño de la caja en tiempo real. dando así un
        aproximado de volumen declarado por el envío.
      </p>

      <q-separator class="q-mt-md q-mb-md" />
      <!-- configurar documento fijo y tipo de servicio -->
      <q-toggle label="Documento fijo" v-model="config.staticDocument" size="xs" />

      <q-select
        v-if="config.staticDocument"
        label="Retorno de documentos"
        transition-show="flip-up"
        transition-hide="flip-down"
        v-model="config.modelReturnDoc"
        :options="optionsReturnDoc"
        emit-value
        map-options
        style="max-width: 180px"
        class="q-mb-md"
      />

      <q-separator class="q-mt-md q-mb-md" />

      <q-toggle label="Servicio fijo" v-model="config.staticService" size="xs" />

      <q-select
        v-if="config.staticService"
        label="Tipo de servicio"
        transition-show="flip-up"
        transition-hide="flip-down"
        v-model="config.modelServiceType"
        :options="optionsServiceType"
        emit-value
        map-options
        style="max-width: 180px"
        class="q-mb-md"
      />
    </div>

    <q-separator class="q-mt-md q-mb-md" />

    <q-btn
      label="Guardar configuración"
      color="primary"
      class="full-width q-mt-md"
      @click="saveConfiguration"
    />
  </div>

  <q-separator class="q-mt-md q-mb-md" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { LocStorage } from 'src/localstorage/localStore';
import { watch } from 'vue';
import { toRaw } from 'vue';
import type { ConfigurationInterface } from 'src/interfaces/Configuration.interface';

const config = ref<ConfigurationInterface>({
  staticDimensions: false,
  dynamicDimensions: false,
  largo: 20,
  ancho: 20,
  alto: 20,
  modelReturnDoc: 'FACT',
  modelServiceType: 'D2',
  staticDocument: false,
  staticService: false,
});

export default defineComponent({
  name: 'ConfigurationComponent',
  setup() {
    const saveConfiguration = () => {
      LocStorage.setItem('configuration', toRaw(config.value));
    };

    const loadConfiguration = () => {
      const configuration = LocStorage.getItem('configuration');
      if (configuration) {
        config.value = configuration as ConfigurationInterface;
      }
    };

    loadConfiguration();

    // Si se activa staticDimensions, desactiva dynamicDimensions
    watch(
      () => config.value.staticDimensions,
      (newVal) => {
        if (newVal) config.value.dynamicDimensions = false;
      }
    );

    // Si se activa dynamicDimensions, desactiva staticDimensions
    watch(
      () => config.value.dynamicDimensions,
      (newVal) => {
        if (newVal) config.value.staticDimensions = false;
      }
    );

    return {
      saveConfiguration,
      config,
      dynamicDimensions: ref(false),
      optionsReturnDoc: [
        { label: 'FACTURA', value: 'FACT' },
        { label: 'GUIA DE DESPACHO', value: 'GD' },
        { label: 'CARTA DE PORTE', value: 'CARTA' },
        { label: 'BOLETA DE ENTREGA', value: 'BOL' },
        { label: 'FORMULARIO ÚNICO', value: 'FUE' },
        { label: 'GUIA DE CARGA', value: 'GC' },
        { label: 'IDENTICKET', value: 'IT' },
      ],
      optionsServiceType: [
        { label: 'FEDEX PRIORITY EXPRESS D2', value: 'D2' },
        { label: 'FEDEX PRIORITY D3', value: 'D3' },
        { label: 'FEDEX ECONOMY SELECT D4', value: 'D4' },
        { label: 'FEDEX PRIORITY EXPRESS FREIGHT D5', value: 'D5' },
        { label: 'FEDEX PRIORITY FREIGHT D6', value: 'D6' },
        { label: 'FEDEX ECONOMY FREIGHT D7', value: 'D7' },
      ],
    };
  },
});
</script>


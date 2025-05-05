<template>
  <div class="col col-xs-12 col-md-12 col-lg-12">
    <q-card class="q-pa-lg">
      <div>
        <q-input
          type="textarea"
          v-model="pasteData"
          label="Pega aquí tu tabla de Excel"
          hint="Pega aquí tu tabla de Excel"
          color="red-12"
          clearable
          filled
          @paste="handlePaste"
        >
          <template v-slot:prepend>
            <q-btn
              flat
              round
              dense
              icon="content_paste"
              @click="pasteToClipboard"
              class="q-ml-xs"
            />
          </template>
        </q-input>
      </div>
    </q-card>
  </div>

  <q-slide-transition>
    <div v-show="rows.length > 0 ? (visible = true) : (visible = false)" class="q-pa-lg">
      <q-card v-if="rows.length > 0" class="q-pa-lg">
        <div class="q-gutter-sm q-mb-md text-center">
          <q-btn
            label="Generar Excel"
            @click="descargarExcel"
            icon="file_download"
            color="secondary"
            class="q-ml-xs"
          />
          <q-btn label="Limpiar" @click="clearData" icon="clear" class="q-ml-xs" />
        </div>

        <q-table
          v-if="rows.length > 0"
          title="Datos Pegados"
          :columns="columns"
          separator="cell"
          flat
          bordered
          :rows="rows"
          :loading="flagTable"
          @virtual-scroll="flagTable = true"
          row-key="nombre_cliente"
          :pagination="initialPagination"
        />
      </q-card>
    </div>
  </q-slide-transition>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { QTableColumn } from 'quasar';
import { Notify } from 'quasar';
// Clipboard functionality is available via $q.clipboard, no need to import Clipboard.

//import { useDataExcelStore } from 'src/stores/dataExcel/index'; // Asegúrate de que la ruta sea correcta
import type { RowData, RowDataShipFast } from 'src/interfaces/RowData.interface'; // Asegúrate de que la ruta sea correcta
import { TableColumns } from 'src/constants/tableColumns'; // Asegúrate de que la ruta sea correcta
import { getZipCodeByCity } from 'src/utils/getZipCodeByCity';
import { generarExcelConPestanas } from 'src/utils/exportExcel.utils';

interface DatosExcel {
  [key: string]: (string | number)[][];
  SHIP: (string | number)[][];
  MPS: (string | number)[][];
  DOCS: (string | number)[][];
}

const useGetZipCodeByCity: (city: string) => Promise<string | null> = async (city: string) => {
  return Promise.resolve(getZipCodeByCity(city));
};

export default defineComponent({
  name: 'PasteGrid',

  setup() {
    const pasteData = ref('');
    const columns = ref<QTableColumn<RowData>[]>([...TableColumns]);
    const rows = ref<RowData[]>([]);
    const flagTable = ref(false);

    const pasteToClipboard = () => {
      navigator.clipboard
        .readText()
        .then((text) => {
          pasteData.value = text;
          rows.value = [];
          // llamar a handlePaste para procesar el texto pegado
          handlePaste({
            clipboardData: {
              getData: (format: string) => {
                if (format === 'text') {
                  return text;
                }
                return '';
              },
            } as DataTransfer,
          });
        })
        .catch((err) => {
          Notify.create({
            message: 'Error al leer el portapapeles',
            color: 'negative',
            position: 'top',
          });
          console.error('Error al leer el portapapeles: ', err);
        });
    };

    const handlePaste = (event: ClipboardEvent | { clipboardData: DataTransfer }) => {
      const clipboardData = event.clipboardData;
      const pastedText = clipboardData?.getData('text');

      // limpiar el textarea
      pasteData.value = '';

      if (pastedText) {
        // limpiar la tabla
        rows.value = [];

        const lines = pastedText.trim().split('\n');
        if (lines.length > 0) {
          const dataRows = lines.slice(0);

          dataRows.map((line: string) => {
            const values = line.split('\t').map((value) => value.trim());

            const newRow: RowData = {
              tdc_fact: '',
              tdc_gd: '',
              nombre_cliente: '',
              referencia: '',
              producto: '',
              observaciones1: '',
              poblacion_consignatario: '',
              nombre_consignatario: '',
              direccion_consignatario: '',
              contacto_consignatario: '',
              telefono_consignatario: '',
              nif_consignatario: '',
              bultos: '',
              kilos: '',
              volumen: '',
            };

            // Asignamos los valores a las columnas correspondientes.
            // Esta lógica asume que el orden de las columnas en el Excel copiado
            // coincide con el orden definido en 'columns'. Si no es así,
            // necesitarás una lógica más robusta para mapear por tdc_fact de columna.
            if (values.length >= columns.value.length) {
              flagTable.value = true;
              newRow.tdc_fact = values[0] || '';
              newRow.tdc_gd = values[1] || '';
              newRow.nombre_cliente = values[2] || '';
              newRow.referencia = values[3] !== undefined ? values[3] : '';
              newRow.producto = values[4] !== undefined ? values[4] : '';
              newRow.observaciones1 = values[5] !== undefined ? values[5] : '';
              newRow.poblacion_consignatario = values[6] !== undefined ? values[6] : '';
              newRow.nombre_consignatario = values[7] !== undefined ? values[7] : '';
              newRow.direccion_consignatario = values[8] !== undefined ? values[8] : '';
              newRow.contacto_consignatario = values[9] !== undefined ? values[9] : '';
              newRow.telefono_consignatario = values[10] !== undefined ? values[10] : '';
              newRow.nif_consignatario = values[11] !== undefined ? values[11] : '';
              newRow.bultos = values[12] !== undefined ? values[12] : '';
              newRow.kilos = values[13] !== undefined ? values[13] : '';
              newRow.volumen = values[14] !== undefined ? values[14] : '';

              // si el tamaño de la tabla es mayor a 0, entonces agregar la fila
              rows.value.push(newRow);
            } else {
              // add noityfication
              Notify.create({
                message: 'El número de columnas no coincide con el esperado',
                color: 'negative',
                position: 'top',
              });
              console.error('El número de columnas no coincide con el esperado');
            }

            setTimeout(() => {
              flagTable.value = false;
            }, 3000);

            return newRow;
          });

          if (event instanceof ClipboardEvent) {
            event.preventDefault();
            event.stopPropagation();
          }
        } else {
          Notify.create({
            message: 'El número de filas no puede ser mayor a 300',
            color: 'negative',
            position: 'top',
          });
          console.error('El número de filas no puede ser mayor a 300');
        }
      }
    };

    return {
      pasteToClipboard,
      flagTable,
      visible: ref(true),
      initialPagination: {
        sortBy: 'desc',
        descending: false,
        rowsPerPage: 20,
        page: 1,
      },
      pasteData,
      columns,
      rows,
      handlePaste,
    };
  },

  methods: {
    generarLibroExcel() {
      // Implementar la lógica para generar el libro de Excel aquí
    },

    async descargarExcel() {
      const newRowShipFast: RowDataShipFast[] = [];

      // Verifica si hay filas en this.rows
      if (this.rows.length === 0) {
        Notify.create({
          message: 'No hay datos para generar el Excel',
          color: 'negative',
          position: 'top',
        });
        return;
      }

      const rowsMax = this.rows.length / 300;
      // redondear hacia arriba
      const rowsMaxCeil = Math.ceil(rowsMax);
      let rowView: RowData[] = [];

      for (let i = 0; i < rowsMaxCeil; i++) {
        rowView = this.rows.slice(i * 300, (i + 1) * 300);

        await Promise.all(
          rowView.map(async (row: RowData) => {
            newRowShipFast.push({
              // add max characters to rec
              rec: row.tdc_fact.slice(0, 20),
              company: row.nombre_consignatario.slice(0, 35),
              contact: row.contacto_consignatario.slice(0, 35),
              adr1: row.direccion_consignatario.slice(0, 35),
              adr2: '',
              adr3: '',
              phone: (row.telefono_consignatario == '' || row.telefono_consignatario == '0'
                ? '56123456789'
                : row.telefono_consignatario
              ).slice(0, 15),
              city: row.poblacion_consignatario.slice(0, 30),
              state: 'RM',
              zipcode: ((await useGetZipCodeByCity(row.poblacion_consignatario)) || '').slice(0, 7),
              country: 'CL',
              package: row.bultos,
              lenght: '20',
              width: '20',
              height: '20',
              weight: String(row.kilos),
              carriage: '0',
              service: 'D2',
              packaging: 'YOUR PACKAGING',
              description: row.observaciones1.slice(0, 35),
              ref: row.tdc_fact.slice(0, 30),
              dep: '',
              po: '',
              invoice: '',
              hal: '',
              recipient_emal: 'none@gmail.com',
              other1_email: '',
              return: 'RD',
            });
          }),
        );

        // Crea array tab: MPS dependiendo de la cantidad de bultos en this.rows
        const newMps = newRowShipFast.map((row: RowDataShipFast) => {
          const mps = [];
          for (let i = 0; i < Number(row.package) - 1; i++) {
            mps.push({
              rec: row.rec,
              lenght: row.lenght,
              width: row.width,
              height: row.height,
              weight: (Number(Number(row.weight).toFixed(2)) / Number(row.package)).toString(),
            });
          }
          return mps;
        });

        // Array tab: DOCS

        const datosExcel: DatosExcel = {
          SHIP: [
            [
              'REC',
              'COMPANY',
              'CONTACT',
              'ADR1',
              'ADR2',
              'ADR3',
              'PHONE',
              'CITY',
              'STATE',
              'ZIPCODE',
              'COUNTRY',
              'LENGHT',
              'WIDTH',
              'HEIGHT',
              'WEIGHT',
              'CARRIAGE',
              'SERVICE',
              'PACKAGING',
              'DESCRIPTION',
              'REF',
              'DEP',
              'PO',
              'INVOICE',
              'HAL',
              'RECIPIENT_EMAL',
              'OTHER1_EMAIL',
              'RETURN',
            ],

            ...newRowShipFast.map((row: RowDataShipFast) => [
              row.rec,
              row.company,
              row.contact,
              row.adr1,
              row.adr2,
              row.adr3,
              row.phone,
              row.city,
              row.state,
              row.zipcode,
              row.country,
              row.lenght,
              row.width,
              row.height,
              (Number(Number(row.weight).toFixed(2)) / Number(row.package)).toFixed(2),
              row.carriage,
              row.service,
              row.packaging,
              row.description,
              row.ref,
              row.dep,
              row.po,
              row.invoice,
              row.hal,
              row.recipient_emal,
              row.other1_email,
              row.return,
            ]),
          ],
          // Agregar más pestañas según sea necesario
          MPS: [
            ['REC', 'LENGHT', 'WIDTH', 'HEIGHT', 'WEIGHT'],
            // crear filas dependiendo de la cantidad de bultos en this.rows
            ...newMps.flatMap(
              (
                rows: {
                  rec: string;
                  lenght: string;
                  width: string;
                  height: string;
                  weight: string;
                }[],
              ) =>
                // solo 3 decimales en el weight
                rows.map((row) => [
                  row.rec,
                  row.lenght,
                  row.width,
                  row.height,
                  Number(row.weight).toFixed(2),
                ]),
            ),

            // con la cantidad de bultos
          ],
          DOCS: [
            ['REC', 'docID', 'docType'],
            // crear filas dependiendo de la cantidad de bultos en this.rows
            ...newRowShipFast.map((row: RowDataShipFast) => [row.rec, row.ref, 'FACT']),
          ],
        };

        generarExcelConPestanas(
          datosExcel,
          `${i + 1}_archivo_${new Date().toISOString().slice(0, 10)}.xls`,
        );

        // Limpiar el array newRowShipFast para la siguiente iteración
        newRowShipFast.length = 0;
      }
    },

    clearData() {
      this.pasteData = '';
      this.rows = [];
    },
  },
});
</script>

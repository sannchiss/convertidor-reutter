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
            color="purple"
            class="q-ml-xs"
          />
          <q-btn label="Limpiar" @click="clearData" icon="clear" color="red" class="q-ml-xs" />
        </div>

        <q-table
          v-if="rows.length > 0"
          class="my-sticky-virtscroll-table"
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

//import { useDataExcelStore } from 'src/stores/dataExcel/index'; // Asegúrate de que la ruta sea correcta
import type { RowData, RowDataShipFast } from 'src/interfaces/RowData.interface'; // Asegúrate de que la ruta sea correcta
import { TableColumns } from 'src/constants/tableColumns'; // Asegúrate de que la ruta sea correcta
import { getZipCodeByCity } from 'src/utils/getZipCodeByCity';
import { generarExcelConPestanas } from 'src/utils/exportExcel.utils';
import { LocStorage } from 'src/localstorage/localStore';
import allActionEvent from '../../handlers/allActionEvent';
import type { ConfigurationInterface } from 'src/interfaces/Configuration.interface';

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
    const config = ref(<ConfigurationInterface>{});
    const pasteData = ref('');
    const columns = ref<QTableColumn<RowData>[]>([...TableColumns]);
    const rows = ref<RowData[]>([]);
    const flagTable = ref(false);

    const modelReturnDoc = ref<string | null>('FACT');
    const modelServiceType = ref<string | null>('D2');

    const handlerFunction = allActionEvent();

    const getConfig = () => {
      const savedConfig = LocStorage.getItem('configuration');
      if (savedConfig) {
        // asignar los valores guardados a la configuración actual
        config.value = savedConfig as ConfigurationInterface;
      }
    };

    getConfig();

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

            // Vaciado de datos del formato ShipFast para luego generar el Excel con pestañas ShipFast, MPS y DOCS
            const newRow: RowData = {
              doc_retorno: '',
              tipo_documento: '',
              tipo_servicio: '',
              nombre_cliente: '',
              referencia: '',
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
              valor_seguro: '',
            };

            // Asignamos los valores a las columnas correspondientes.
            // Esta lógica asume que el orden de las columnas en el Excel copiado
            // coincide con el orden definido en 'columns'. Si no es así,
            // necesitarás una lógica más robusta para mapear por tdc_fact de columna.
            if (values.length >= columns.value.length) {
              // de la tabla cambiar el nombre de la columna a la que corresponde el valor

              flagTable.value = true;
              newRow.doc_retorno = values[0] || '';
              newRow.tipo_documento = values[1] || '';
              newRow.tipo_servicio = values[2] || '';
              newRow.nombre_cliente = values[3] || '';
              newRow.referencia = values[4] !== undefined ? values[4] : '';
              newRow.observaciones1 = values[5] !== undefined ? values[5] : '';
              newRow.poblacion_consignatario = values[6] !== undefined ? values[6] : '';
              newRow.nombre_consignatario = values[7] !== undefined ? values[7] : '';
              newRow.direccion_consignatario = values[8] !== undefined ? values[8] : '';
              newRow.contacto_consignatario = values[9] !== undefined ? values[9] : '';
              newRow.telefono_consignatario = values[10] !== undefined ? values[10] : '';
              newRow.nif_consignatario = values[11] !== undefined ? values[11] : '';
              newRow.bultos = values[12] !== undefined ? values[12] : '';
              newRow.kilos = parseFloat(String(values[13]).replace(/,/g, '.')).toFixed(2);
              newRow.volumen = values[14] !== undefined ? values[14] : '0';
              newRow.valor_seguro = values[15] !== undefined ? values[15] : '0';
              // newRow.valor_seguro = handlerFunction.formatNumber(String(values[15]));

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
      config,
      modelReturnDoc,
      optionsReturnDoc: [
        { label: 'FACTURA', value: 'FACT' },
        { label: 'GUIA DE DESPACHO', value: 'GD' },
        { label: 'CARTA DE PORTE', value: 'CARTA' },
        { label: 'BOLETA DE ENTREGA', value: 'BOL' },
        { label: 'FORMULARIO ÚNICO', value: 'FUE' },
        { label: 'GUIA DE CARGA', value: 'GC' },
        { label: 'IDENTICKET', value: 'IT' },
      ],
      modelServiceType,
      optionsServiceType: [
        { label: 'FEDEX PRIORITY EXPRESS D2', value: 'D2' },
        { label: 'FEDEX PRIORITY D3', value: 'D3' },
        { label: 'FEDEX ECONOMY SELECT D4', value: 'D4' },
        { label: 'FEDEX PRIORITY EXPRESS FREIGHT D5', value: 'D5' },
        { label: 'FEDEX PRIORITY FREIGHT D6', value: 'D6' },
        { label: 'FEDEX ECONOMY FREIGHT D7', value: 'D7' },
      ],
      options: [],
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
      handlerFunction,
    };
  },
  watch: {
    // genera una funcion para el select de retorno de documentos motrar el label
    modelServiceType(newValue) {
      return this.optionsServiceType.find((option) => option.value === newValue)?.label;
    },
    modelReturnDoc(newValue) {
      console.log('Nuevo valor de modelReturnDoc:', newValue);
    },
  },
  methods: {
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

      this.rows.forEach((row: RowData) => {
        console.log('Fila actual:', row.tipo_documento);
      });

      const rowsMax = this.rows.length / 300;
      // redondear hacia arriba
      const rowsMaxCeil = Math.ceil(rowsMax);
      let rowView: RowData[] = [];

      for (let i = 0; i < rowsMaxCeil; i++) {
        rowView = this.rows.slice(i * 300, (i + 1) * 300);

        await Promise.all(
          rowView.map(async (row: RowData) => {
            const dimensiones = this.handlerFunction.volumenPorBulto(
              row.volumen,
              row.bultos,
              this.config
            );

            newRowShipFast.push({
              // add max characters to rec
              rec: row.doc_retorno.slice(0, 300),
              company: row.nombre_consignatario.slice(0, 35),
              contact: row.contacto_consignatario.slice(0, 35),
              adr1: row.direccion_consignatario.slice(0, 35),
              adr2: row.direccion_consignatario.slice(35, 70),
              adr3: '',
              phone: (row.telefono_consignatario == '' || row.telefono_consignatario == '0'
                ? '56123456789'
                : row.telefono_consignatario
              ).slice(0, 15),
              city: row.poblacion_consignatario.slice(0, 30),
              state: 'CL',
              zipcode: ((await useGetZipCodeByCity(row.poblacion_consignatario)) || '').slice(0, 7),
              country: 'CL',
              package: row.bultos,
              lenght: dimensiones.largo.toString(),
              width: dimensiones.ancho.toString(),
              height: dimensiones.alto.toString(),
              weight: row.kilos ? row.kilos : '0',
              carriage: row.valor_seguro ? row.valor_seguro.toString() : '0',
              service: this.config.modelServiceType?.toString() || 'D2',
              packaging: 'YOUR PACKAGING',
              description: row.observaciones1.slice(0, 35),
              ref: String(row.referencia).slice(0, 35),
              dep: '',
              po: '',
              invoice: '',
              hal: '',
              recipient_emal: 'none@gmail.com',
              other1_email: '',
              return: 'RD',
            });
          })
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
              weight: (
                Number(String(row.weight).replace(',', '.')) / Number(String(row.package))
              ).toFixed(2),
            });
          }
          return mps;
        });

        // Llamo a la funcion separarDatosRec para separar los datos de REC y convertirlos en un array list
        /*   const resultRecDoc = this.separarDatosRec(
          newRowShipFast.map((row: RowDataShipFast) => row.rec).join('\n'),
        ); */

        const resultRecDoc = this.handlerFunction.separarDatosRec(
          newRowShipFast
            .map(
              (row: RowDataShipFast) =>
                `${row.rec}; ${
                  this.rows.find((r) => r.doc_retorno === row.rec)?.tipo_documento || ' '
                }`
            )
            .join('\n')
            .split('\n')
        );

        // asignar el tipo de documento con el doc_retorno
        /*   newRowShipFast.forEach((row: RowDataShipFast, index: number) => {
          row.rec = resultRecDoc[index]?.[0] ?? '';
          row.doc_retorno = resultRecDoc[index]?.[0] ?? '';
        }); */

        console.time('separarDatosRec');
        console.log('Llamando a separarDatosRec con los siguientes datos:');
        console.log('resultRecDoc:', resultRecDoc);

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
              // copiar el rec hasta el ; y sino hay ; copiar todo
              row.rec.indexOf(';') !== -1 ? row.rec.slice(0, row.rec.indexOf(';')) : row.rec || '',
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
              (
                parseFloat(String(row.weight).replace(/,/g, '.')) / Number(String(row.package))
              ).toFixed(2),
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
                }[]
              ) =>
                // solo 3 decimales en el weight
                rows.map((row) => [
                  // copiar el rec hasta el ; y sino hay ; copiar todo
                  row.rec.indexOf(';') !== -1
                    ? row.rec.slice(0, row.rec.indexOf(';'))
                    : row.rec || '',
                  row.lenght,
                  row.width,
                  row.height,
                  row.weight,
                ])
            ),

            // con la cantidad de bultos
          ],
          DOCS: [
            ['REC', 'docID', 'docType'],
            // recorrer el array resultRecDoc con lengthDoc
            //...resultRecDoc[0].map((rec, index) => [
            //   rec ?? '',
            //   resultRecDoc[1][index] ?? '',
            //    this.rows[index]?.tipo_documento ?? '',
            //   ]),
            ...resultRecDoc.map((doc) => [doc[0] ?? '', doc[1] ?? '', doc[2] ?? '']),
          ],
        };

        generarExcelConPestanas(
          datosExcel,
          `${i + 1}_archivo_${new Date().toISOString().slice(0, 10)}.xls`
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

<style lang="scss">
@import '../../assets/styles/putData-component-styles.scss';
</style>

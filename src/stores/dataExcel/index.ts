import { defineStore, acceptHMRUpdate } from 'pinia';
import type { RowData } from 'src/interfaces/RowData.interface';
import { ref } from 'vue';

export const useDataExcelStore = defineStore('myStore', {
  state: () => ({
    rows: ref<RowData[]>([]),
  }),
  getters: {},
  actions: {},
});

/* export function useDataExcel() {
  const store = useDataExcelStore();
  return {
    rows: store.rows,
  };
}
export function setRows(newRows: RowData[]) {
  const store = useDataExcelStore();
  store.rows.value = newRows;
} */

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataExcelStore, import.meta.hot));
}

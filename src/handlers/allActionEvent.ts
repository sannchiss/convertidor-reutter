import { ref } from 'vue';
import { Notify } from 'quasar';

//import { generarExcelConPestanas } from 'src/utils/exportExcel.utils';

export default function allActionEvent() {
  const pasteData = ref('');

  const pasteToClipboard = (event: ClipboardEvent | { clipboardData: DataTransfer }) => {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text');
    if (pastedText) {
      pasteData.value = pastedText;
      console.log(pasteData.value);
      Notify.create({
        message: 'Data pasted successfully',
        color: 'green',
        position: 'top',
        timeout: 2000,
      });
    } else {
      Notify.create({
        message: 'No data found in clipboard',
        color: 'red',
        position: 'top',
        timeout: 2000,
      });
    }
  };

  return {
    pasteToClipboard,
  };
}

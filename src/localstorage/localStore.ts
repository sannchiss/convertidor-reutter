import { LocalStorage } from 'quasar';

import { Notify } from 'quasar';
import type { ConfigurationInterface } from 'src/interfaces/Configuration.interface';

export const LocStorage = {
  setItem(key: string, value: ConfigurationInterface | string | number | boolean) {
    LocalStorage.setItem(key, value);
    Notify.create({
      message: `Se ha guardado correctamente`,
      color: 'positive',
      position: 'top-right',
    });
    console.log(`Se ha guardado correctamente`);
  },
  getItem(key: string) {
    return LocalStorage.getItem(key);
  },
  removeItem(key: string) {
    LocalStorage.removeItem(key);
    Notify.create({
      message: `Se ha borrado correctamente`,
      color: 'negative',
      position: 'top',
    });
    console.log(`Se ha borrado correctamente`);
  },
  clear() {
    LocalStorage.clear();
  },
};

//import { generarExcelConPestanas } from 'src/utils/exportExcel.utils';
import { Notify } from 'quasar';
import type { ConfigurationInterface } from 'src/interfaces/Configuration.interface';

export default function allActionEvent() {
  const formatNumber = (value: string) => {
    // Normaliza la entrada: elimina puntos de miles y reemplaza comas decimales por puntos.
    const numero =
      typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(/,/g, '.')) : value;

    // Si después de la conversión el número no es válido, devuelve una cadena vacía.
    if (isNaN(numero)) {
      return '';
    }

    // Usa Intl.NumberFormat para formatear con punto para miles y coma para decimales,
    // asegurando siempre 2 decimales.
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true, // Habilita el separador de miles si es necesario
    }).format(numero);
  };

  const separarDatosRec = (datos: string[]): string[][] => {
    const resultado: string[][] = [];

    for (const item of datos) {
      // 1. Dividir la cadena por el punto y coma
      const partes = item.split(';');

      // Si no hay al menos dos partes (código principal y descripción), saltar
      if (partes.length < 2) {
        continue;
      }

      // El último elemento es la 'Descripción' y se extrae.
      const descripcion = partes.pop()!.trim();

      // El primer elemento es el 'Código Principal'
      const primerCodigo = partes[0]?.trim() ?? '';

      // Los elementos restantes son los códigos a usar en la segunda posición (incluyendo el primero)

      // PASO 1: Generar la salida con el código principal duplicado
      // ESTO SIEMPRE SE HACE. (e.g., ["033037", "033037", "FACT"] o ["033038", "033038", "GD"])
      resultado.push([primerCodigo, primerCodigo, descripcion]);

      // PASO 2: Generar salidas por cada código intermedio (si existen)
      // El array 'partes' ahora contiene solo los códigos (e.g., ["033037", "0357485"] o ["033038"])

      // Iteramos desde el índice 1 para omitir el primer código, ya que ya lo manejamos arriba.
      for (let i = 1; i < partes.length; i++) {
        const codigoIntermedio = partes[i]?.trim() ?? '';
        // (e.g., ["033037", "0357485", "FACT"])
        resultado.push([primerCodigo, codigoIntermedio, descripcion]);
      }
    }

    console.log('Resultado de separarDatosRec:', resultado);

    return resultado;

    /*  const resultado: [string, string][] = [];

    const lineas = input.trim().split('\n');

    console.log('Lineas a procesar:', lineas);

    for (const linea of lineas) {
      const partes = linea
        .split(';')
        .map((p) => p.trim())
        .filter((p): p is string => p !== '' && p !== null && p !== undefined);

      console.log('Partes procesadas:', partes);

      // revisar que cada uno de los valores de parte su longitud no sea mayor a 6 si es mayor arrojar error

      for (const parte of partes) {
        if (parte.length > 14) {
          // add notification
          Notify.create({
            message: `Documento "${parte}" excede la longitud máxima de 14 caracteres.`,
            color: 'negative',
            position: 'top',
          });
          console.error(`Documento "${parte}" excede la longitud máxima de 13 caracteres.`);
          throw new Error(`Documento "${parte}" excede la longitud máxima de 13 caracteres.`);
        }
      }

      if (partes.length >= 1 && partes.length <= 20) {
        const codigoBase = partes[0];
        // Siempre incluir [codigo, codigo]
        resultado.push([codigoBase || '', codigoBase || '']);

        // Si hay más valores, agregar también esas tuplas
        for (let i = 1; i < partes.length; i++) {
          resultado.push([codigoBase || '', partes[i] || '']);
        }
      } else {
        // add notification
        const lineNumber = lineas.indexOf(linea) + 1;
        Notify.create({
          message: `Se ingresaron "${partes.length}" documentos en la celda "${lineNumber}", esta no puede ser mayor a 20 documentos.`,
          color: 'negative',
          position: 'top',
        });
        console.error(
          `Se ingresaron "${partes.length}" documentos en la celda "${lineNumber}", esta no puede ser mayor a 20 documentos.`,
        );
        throw new Error(
          `Se ingresaron "${partes.length}" documentos en la celda "${lineNumber}", esta no puede ser mayor a 20 documentos.`,
        );
      }
    }

    const firstArray = resultado.map((item) => item[0]);
    const secondArray = resultado.map((item) => item[1]);

    return [firstArray, secondArray]; */
  };

  // Calcular volumen por bulto
  const volumenPorBulto = (
    volumen: string | number,
    bultos: string | number,
    config: ConfigurationInterface,
  ) => {
    if (!config.dynamicDimensions) {
      console.log(config.dynamicDimensions);
      return {
        ancho: config.ancho,
        largo: config.largo,
        alto: config.alto,
      };
    }

    // pasar el volumen a cm3
    const volumenCm3: number = Number(volumen) * 1000000;

    // dividir el volumen por la cantidad de bultos
    if (Number(bultos) === 0) {
      Notify.create({
        message: `La cantidad de bultos no puede ser cero.`,
        color: 'negative',
        position: 'top',
      });
      console.error(`La cantidad de bultos no puede ser cero.`);
      throw new Error(`La cantidad de bultos no puede ser cero.`);
    }

    // calcular las dimensiones cubicas en cm y rededondear hacia arriba si el resultado tiene decimales por ejemplo 12.34 -> 12 y si es 12.50 -> 13
    console.log('Volumen en cm3:', Math.cbrt(volumenCm3 / Number(bultos)));

    const dimensionCubica = Math.round(Math.cbrt(volumenCm3 / Number(bultos)));

    // redondear hacia arriba y quitar decimales por ejemplo 12.34 -> 13

    console.log('Dimensión cúbica redondeada:', dimensionCubica);

    return {
      ancho: dimensionCubica,
      largo: dimensionCubica,
      alto: dimensionCubica,
    };
  };

  return {
    formatNumber,
    separarDatosRec,
    volumenPorBulto, // Exportar la función
  };
}

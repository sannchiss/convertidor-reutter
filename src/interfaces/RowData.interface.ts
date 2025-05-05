export interface RowData {
  tdc_fact: string;
  tdc_gd: string;
  nombre_cliente: string;
  referencia: string | number;
  producto: string;
  observaciones1: string;
  poblacion_consignatario: string;
  nombre_consignatario: string;
  direccion_consignatario: string;
  contacto_consignatario: string;
  telefono_consignatario: string;
  nif_consignatario: string;
  bultos: string | number;
  kilos: string | number;
  volumen: string | number;
}

export interface RowDataShipFast {
  rec: string;
  company: string;
  contact: string;
  adr1: string;
  adr2: string;
  adr3: string;
  phone: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  package: number | string;
  lenght: string;
  width: string;
  height: string;
  weight: string;
  carriage: string;
  service: string;
  packaging: string;
  description: string;
  ref: string;
  dep: string;
  po: string;
  invoice: string;
  hal: string;
  recipient_emal: string;
  other1_email: string;
  return: string;
}

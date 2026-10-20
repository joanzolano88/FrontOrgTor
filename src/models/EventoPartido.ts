export type TipoEventoPartido = 'GOL' | 'AUTOGOL' | 'ASISTENCIA' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | 'ENTRA_TITULAR' | 'SALE_TITULAR';

export class EventoPartido {
  id?: number;
  tipo?: TipoEventoPartido;
  minuto?: number;
  jugadorId?: number;
  asistidorId?: number;
  equipoId?: number;
  penalti?: boolean;
  dobleAmarilla?: boolean;
  jugadorSaleId?: number;
}
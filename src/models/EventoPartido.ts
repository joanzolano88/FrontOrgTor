export type TipoEventoPartido = 'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | 'ENTRA_TITULAR' | 'SALE_TITULAR';

export class EventoPartido {
  id?: number;
  tipo?: TipoEventoPartido;
  minuto?: number;
  jugador?: any;
}
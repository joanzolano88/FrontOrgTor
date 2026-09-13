export type EstadoPago = 'PENDIENTE' | 'PARCIAL' | 'PAGADO';

export class PagoInscripcion {
  id?: number;
  monto = 0;
  estado: EstadoPago = 'PENDIENTE';
  fechaPago?: string;
  observacion?: string;
  equipoId?: number;
  totalInscripcion = 0;
  totalPagado = 0;
  saldoPendiente = 0;
}
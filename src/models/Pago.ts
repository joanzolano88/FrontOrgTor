export class Pago {
    id?: number;
    valor = 0;
    tipo: 'INSCRIPCION' | 'ARBITRAJE' | 'MULTA' | 'OTRO' = 'INSCRIPCION';
    fecha?: string;
    concepto?: string;
    observacion?: string;
    torneoId?: number;
    torneoNombre?: string;
    equipoId?: number;
    equipoNombre?: string;
    delegadoNumeroCelular?: string;
    jugadorId?: number;
    jugadorNombre?: string;
    jugadorNumeroCelular?: string;
}
import { Jugador } from './Jugador';

export class ConvocatoriaPartido {
  id?: number;
  jugador?: Jugador;
  titular?: boolean;
  numeroUniforme?: number;
  fueTitular?: boolean;
  expulsado?: boolean;
  cambiosRealizados?: number;
}

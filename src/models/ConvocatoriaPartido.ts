import { Jugador } from './Jugador';
import { Equipo } from './Equipo';

export class ConvocatoriaPartido {
  id?: number;
  jugador?: Jugador;
  equipo?: Equipo;
  titular?: boolean;
  numeroUniforme?: number;
  fueTitular?: boolean;
  expulsado?: boolean;
  cambiosRealizados?: number;
}

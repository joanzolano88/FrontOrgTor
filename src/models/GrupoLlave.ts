import { FaseActual } from 'src/enums/FaseActual';
import { Equipo } from './Equipo';
import { Torneo } from './Torneo';

export class GrupoLlave {
  id?: number;
  equipo?: Equipo;
  grupoLlave?: number;
  torneo?: Torneo;
  faseTorneo?: FaseActual;
  goles?: number;
  partidosJugados?: number;
  partidosGanados?: number;
  partidosPerdidos?: number;
  partidosEmpatados?: number;
  golesFavor?: number;
  golesContra?: number;
  puntos?: number;
}
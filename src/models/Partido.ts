import { Arbitro } from "./Arbitro";
import { Equipo } from "./Equipo";
import { Cancha } from "./Cancha";
import { Torneo } from "./Torneo";
import { FaseActual } from "src/enums/FaseActual";
import { EstadoPartido } from "src/enums/EstadoPartido";

export class Partido {
    id?: number;
    fechaPartido?: Date;
    arbitrajeLocal?: number;
    arbitrajeVisitante?: number;
    horaFinalPrimerTiempo?: Date;
    horaInicioPrimerTiempo?: Date;
    horaFinalSegundoTiempo?: Date;
    horaInicioSegundoTiempo?: Date;
    tiempoExtraPrimerTiempo?: number;
    tiempoExtraSegundoTiempo?: number;
    anotacionesEquipoLocal?: number;
    anotacionesEquipoVisitante?: number;
    faseEncuentro?: FaseActual;
    cancha?: Cancha;
    equipoLocal?: Equipo;
    equipoVisitante?: Equipo;
    torneo?: Torneo;
    grupo?: number;
    estadoPartido?: EstadoPartido;
    penaltisEquipoVisitante?: number;
    penaltisEquipoLocal?: number;
    listaArbitros?: Arbitro[];
}
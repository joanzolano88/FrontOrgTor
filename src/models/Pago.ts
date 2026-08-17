import { TipoAmonestacion } from "src/enums/TipoAmonestacion";
import { Jugador } from "./Jugador";
import { Equipo } from "./Equipo";
import { Torneo } from "./Torneo";

export class Pago {
    id?: number;
    valor?: number;
    fecha?: Date;
    tipoAmonestacion?: TipoAmonestacion;
    jugador?: Jugador;
    equipo?: Equipo;
    torneo?: Torneo;
}
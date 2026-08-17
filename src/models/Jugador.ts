import { TipoAmonestacion } from "src/enums/TipoAmonestacion";
import { Equipo } from "./Equipo";
import { Persona } from "./Persona";
import { EstadoJugador } from "src/enums/EstadoJugador";
import { InformacionPersona } from "./InformacionPersonal";

export class Jugador extends InformacionPersona {
    estadoJugador?: EstadoJugador;
    numeroCamiseta?: number;
    amonestacionActual?: TipoAmonestacion;
    cantidadTarjetasRojas?: number;
    cantidadTarjetasAmarillas?: number;
    equipo?: Equipo;
}
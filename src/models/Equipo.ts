import { FaseActual } from "src/enums/FaseActual";
import { Jugador } from "./Jugador";
import { Persona } from "./Persona";
import { Torneo } from "./Torneo";

export class Equipo {
    id?: number;
    nombre?: string;
    puntos?: number;
    escudo?: string;
    bandera?: string;
    anotacionesAFavor?: number;
    anotacionesEnContra?: number;
    partidosJugados?: number;
    partidosGanados?: number;
    partidosPerdidos?: number;
    partidosEmpatados?: number;
    faseActual?: FaseActual;
    delegado?: Persona;
    entrenador?: Persona;
    torneo?: Torneo;
    grupo?: number;
    grupoEliminatoria?: number;
    puntosEliminatoria?: number;
    partidosJugadosEliminatoria?: number;
    partidosGanadosEliminatoria?: number;
    partidosPerdidosEliminatoria?: number;
    partidosEmpatadosEliminatoria?: number;
    anotacionesAFavorEliminatoria?: number;
    anotacionesEnContraEliminatoria?: number;
    listaJugadoresActivos?: Jugador[];
    listaJugadoresInactivos?: Jugador[];
}
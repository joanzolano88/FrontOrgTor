import { TipoAnotacion } from "src/enums/TipoAnotacion";
import { Jugador } from "./Jugador";
import { Partido } from "./Partido";

export class AnotacionPartido {
    id?: number;
    minuto?: number;
    tipoAnotacion?: TipoAnotacion;
    jugador?: Jugador;
    partido?: Partido;
}
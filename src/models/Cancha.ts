import { Torneo } from "./Torneo";

export class Cancha{
    id?: number;
    largo?: number;
    ancho?: number;
    nombre?: string;
    latitud?: string;
    longitud?: string;
    direccion?: string;
    torneo?: Torneo;
}
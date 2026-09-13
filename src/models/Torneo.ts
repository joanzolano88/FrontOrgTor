import { EstadoTorneo } from "src/enums/EstadoTorneo";
import { Usuario } from "./Usuario";
import { ModalidadTorneo } from "src/enums/ModalidadTorneo";
import { ModalidadFase } from "src/enums/ModalidadFase";
import { FaseActual } from "src/enums/FaseActual";
import { Ciudad } from "./Ciudad";
import { Deporte } from "./Deporte";

export class Torneo {
    id?: number;
    nombre?: string;
    ciudad?: Ciudad;
    ubicacion?: string;
    encargadoTorneo?: Usuario;
    cantidadGrupos?: number;
    cantidadEquipos?: number;
    valorInscripcion?: number;
    estadoTorneo?: EstadoTorneo;
    modalidadTorneo?: ModalidadTorneo;
    faseTorneo?: FaseActual;
    modalidadGrupos?: ModalidadFase;
    modalidadEliminatorias?: ModalidadFase;
    faseInicioEliminatorias?: FaseActual;
    cantidadEquiposEliminatoriaGrupos?: number;
    duracionMinutos?: number;
    cantidadGruposEliminatoriaGrupos?: number;
    modalidadEliminatoriasGrupos?: ModalidadFase;
    deporte?: Deporte;
}
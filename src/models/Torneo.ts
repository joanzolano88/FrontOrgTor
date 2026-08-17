import { EstadoTorneo } from "src/enums/EstadoTorneo";
import { Usuario } from "./Usuario";
import { ModalidadTorneo } from "src/enums/ModalidadTorneo";
import { ModalidadFase } from "src/enums/ModalidadFase";
import { FaseActual } from "src/enums/FaseActual";

export class Torneo {
    id?: number;
    nombre?: string;
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
    cantidadGruposEliminatoriaGrupos?: number;
    modalidadEliminatoriasGrupos?: ModalidadFase;
}
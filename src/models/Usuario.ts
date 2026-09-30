import { TipoUsuario } from "src/enums/TipoUsuario";
import { InformacionContacto } from "./InformacionContacto";
import { InformacionPersona } from "./InformacionPersonal";
import { Torneo } from "./Torneo";

export class Usuario extends InformacionPersona {
    nombreUsuario?: string;
    contrasena?: string;
    ubicacion?: string;
    fechaNacimiento?: string;
    torneo?: Torneo;
    tipoUsuario?: TipoUsuario;
}
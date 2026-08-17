import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ExtraerInfService {

  constructor() { }

  enums(objeto: any): any[]{
    const lista: any [] = [];
    for (const key in objeto) {
      lista.push(objeto[key]);
    }
    return lista;
  }
  erroresForm(errores: any): string {
    let mensajeError = "";
    if (errores != undefined && errores.errors != undefined) {
      if (errores.errors!['required'] != undefined && errores.errors!['required'] ) {
        mensajeError = "Campo obligatorio"
      } else if (errores.errors!['minlength'] != undefined && errores.errors!['minlength']) {
        mensajeError = "Minimo " + errores.errors!['minlength']['requiredLength'] + " caractetes"
      }
    }
    return mensajeError;
  }
  tituloTab(opcion: boolean): string {
    if (opcion) {
      return "Crear"
    }
    return "Configurar"
  }
}

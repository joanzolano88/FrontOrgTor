import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { Persona } from 'src/models/Persona';

@Component({
  selector: 'app-participante-configurar',
  templateUrl: './participante-configurar.page.html',
  styleUrls: ['./participante-configurar.page.scss'],
  standalone: false
})
export class ParticipanteConfigurarPage{
  delegado: Persona = new Persona();
  identificacionDelegado: any;
  nombreIdentificacion: string = "";
  constructor() { }
  cargaridentificacion(input: Event) {
    this.identificacionDelegado = input.target;
    this.identificacionDelegado = this.identificacionDelegado.files[0];
    this.nombreIdentificacion = this.identificacionDelegado == undefined? null: this.identificacionDelegado.name;
  }
  activarSubirArchivo(elemtIon: IonInput){
    let btnFile: any = elemtIon["el"].children[0];
    btnFile.click();
  }
  onSubmit(form: NgForm) {

  }
}

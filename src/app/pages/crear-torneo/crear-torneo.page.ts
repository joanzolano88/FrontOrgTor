import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { ExtraerInfService } from 'src/app/services/extraer-inf.service';
import { ModalidadFase } from 'src/enums/ModalidadFase';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Torneo } from 'src/models/Torneo';
import { Usuario } from 'src/models/Usuario';

@Component({
  selector: 'app-crear-torneo',
  templateUrl: './crear-torneo.page.html',
  styleUrls: ['./crear-torneo.page.scss'],
  standalone: false
})
export class CrearTorneoPage {
  isAlertOpen = false;
  listaModalidadToreno: string[] = [];
  listaModalidadFase: string[] = [];
  nombreArchivo: string = "";
  archivo: any;
  torneo: Torneo = new Torneo();

  constructor(private extraerInf: ExtraerInfService, private crud: CrudService,
              private router: Router, private route: ActivatedRoute) {
    this.listaModalidadToreno = extraerInf.enums(ModalidadTorneo);
    this.listaModalidadFase = extraerInf.enums(ModalidadFase);
    let idTorneo = route.snapshot.paramMap.get('idTorneo');
    if (idTorneo) {
      crud.obtenerParametro(idTorneo, "torneo").subscribe((respT: Torneo) =>{
        this.torneo = respT;
      });
    }
  }

  activarSubirArchivo(elemtIon: IonInput){
    let btnFile: any = elemtIon["el"].children[0];
    btnFile.click();
  }

  cargarArchivo(input: Event) {
    this.archivo = input.target;
    this.archivo = this.archivo.files[0];
    this.nombreArchivo = this.archivo == undefined? null: this.archivo.name;
  }
  
  onSubmit(form: NgForm) {
    let usuario: Usuario = this.crud.obtenerUsuario();
    if (form.invalid && usuario != undefined) {
      this.isAlertOpen = true;
      return;
    }
    this.torneo.encargadoTorneo = usuario;
    this.crud.crearArchivo(this.torneo, "torneo", this.archivo)?.subscribe((resp) =>{
    });
  }
  tituloTab() {
    return this.extraerInf.tituloTab(this.router.url.includes('crear-torneo'));
  }
  textoCantidadEquipos() {
    if (this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS || this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS) {
      return 'por Grupo';
    }
    return '';
  }
}
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { FaseActual } from 'src/enums/FaseActual';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-informacion-torneo',
  templateUrl: './informacion-torneo.component.html',
  styleUrls: ['./informacion-torneo.component.scss'],
  standalone: false
})
export class InformacionTorneoComponent  implements OnInit {
  @Input() torneo: Torneo = new Torneo();
  @Input() validarOrganizador: Boolean = false;
  get esPropietario(): boolean {
    const usuario = this.crud.obtenerUsuario();
    return this.validarOrganizador && this.torneo.encargadoTorneo?.id === usuario?.id;
  }
  mensajeError: string = "";
  isAlertOpen = false;

  constructor(private crud: CrudService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
  }

  configurarTorneo() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/configuracion-torneo');
  }

  cantidadEquipos() {
    return (this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS || this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS)? this.torneo.cantidadEquipos!*this.torneo.cantidadGrupos!: this.torneo.cantidadEquipos;
  }
  cambiarFase() {
    if (this.torneo.faseTorneo == FaseActual.FINAL || !this.esPropietario) {
      return;
    }
    this.crud.actualizar(null,'torneo/cambiar_fase/' + this.torneo.id).subscribe((resp: Torneo) =>{
      this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/cambio-fase');
    }, (err: HttpErrorResponse) =>{
      this.mensajeError = err.error.message;
      this.setOpen(true);
    });
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }

  contactarOrganizador() {
    const numero = this.torneo.encargadoTorneo?.numeroCelular;
    if (!numero) {
      this.mensajeError = 'El organizador no tiene un número de WhatsApp registrado.';
      this.setOpen(true);
      return;
    }
    const telefono = numero.replace(/\D/g, '');
    window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent('Hola, quisiera información sobre el torneo ' + this.torneo.nombre + '.')}`, '_blank');
  }
}

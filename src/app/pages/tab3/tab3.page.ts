import { Component, OnInit } from '@angular/core';
import { AlertController, IonInput } from '@ionic/angular';
import { ExtraerInfService } from 'src/app/services/extraer-inf.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CrudService } from 'src/app/services/crud.service';
import { Usuario } from 'src/models/Usuario';
import { Equipo } from 'src/models/Equipo';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit {
  imagenDef = "assets/images/avatar-placeholder.svg";
  foto: any;
  identificacion: any;
  usuario: Usuario = new Usuario();
  confirmarContrasena: string = "";
  url: string = "";
  paises: any[] = [];
  departamentos: any[] = [];
  ciudades: any[] = [];
  paisSeleccionado?: number;
  departamentoSeleccionado?: number;
  ciudadSeleccionada?: number;
  torneosCreados: Torneo[] = [];
  equiposDelegado: Equipo[] = [];
  equiposJugador: Equipo[] = [];
  participacionesJugador: any[] = [];
  invitacionesEquipoJugador: any[] = [];
  cargandoInvitacionesEquipo = false;
  errorInvitacionesEquipo = '';
  notificacionesPendientes = 0;
  editarPerfilOpen = false;

  constructor(private router: Router, private crud: CrudService, public extraer: ExtraerInfService,
          private alertController: AlertController) {
    this.url =  router.url
  }
  ngOnInit() {
    this.cargarPerfil();
  }

  ionViewWillEnter() {
    this.cargarPerfil();
  }

  private cargarPerfil() {
    if (this.url == '/auth/usuario') {
      const usuarioSesion = this.crud.obtenerUsuario();
      if (usuarioSesion.id) {
        this.usuario = new Usuario();
        this.confirmarContrasena = '';
        this.crud.obtenerParametro(usuarioSesion.id, 'usuario').subscribe({
          next: (usuarioActual: Usuario) => {
            this.usuario = usuarioActual;
            this.imagenDef = usuarioActual.foto ? 'data:image/png;base64,' + usuarioActual.foto : 'assets/images/avatar-placeholder.svg';
            localStorage.setItem('usuario', JSON.stringify(usuarioActual));
            this.cargarPerfilRol(usuarioActual.id);
            if (usuarioActual.id) this.cargarContadorNotificaciones(usuarioActual.id);
            if (usuarioActual.tipoUsuario === 'JUGADOR' && usuarioActual.id) this.cargarInvitacionesEquipo(usuarioActual.id);
            this.cargarPaises();
          },
          error: () => this.cargarPaises()
        });
        return;
      }
    }
    this.usuario = new Usuario();
    this.confirmarContrasena = '';
    this.cargarPaises();
  }

  private cargarContadorNotificaciones(usuarioId: number) {
    this.crud.obtenerNotificacionesPendientesCantidad(usuarioId).subscribe({
      next: cantidad => this.notificacionesPendientes = cantidad || 0,
      error: () => this.notificacionesPendientes = 0
    });
  }

  abrirNotificaciones() {
    this.router.navigateByUrl('/auth/notificaciones');
  }

  private cargarPerfilRol(id?: number) {
    if (!id) return;
    this.crud.obtenerPerfilCompleto(id).subscribe(perfil => {
      this.torneosCreados = perfil.torneosCreados || [];
      this.equiposDelegado = perfil.equiposDelegado || [];
      this.equiposJugador = perfil.equiposJugador || [];
      this.participacionesJugador = perfil.participaciones || [];
    });
  }

  private cargarInvitacionesEquipo(usuarioId: number) {
    this.cargandoInvitacionesEquipo = true;
    this.errorInvitacionesEquipo = '';
    this.crud.obtenerInvitacionesEquipoJugador(usuarioId).subscribe({
      next: invitaciones => {
        this.invitacionesEquipoJugador = invitaciones || [];
        this.cargandoInvitacionesEquipo = false;
      },
      error: err => {
        this.invitacionesEquipoJugador = [];
        this.errorInvitacionesEquipo = err?.error?.message || 'No se pudieron cargar las invitaciones.';
        this.cargandoInvitacionesEquipo = false;
      }
    });
  }

  responderInvitacionEquipo(invitacion: any, aceptar: boolean) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !invitacion?.id) return;
    this.crud.responderInvitacionEquipo(invitacion.id, usuarioId, aceptar).subscribe({
      next: () => {
        this.invitacionesEquipoJugador = this.invitacionesEquipoJugador.filter(item => item.id !== invitacion.id);
        if (aceptar && invitacion.equipoId && !this.equiposJugador.some(equipo => equipo.id === invitacion.equipoId)) {
          this.equiposJugador = [...this.equiposJugador, { id: invitacion.equipoId, nombre: invitacion.equipoNombre } as Equipo];
        }
      },
      error: err => this.errorInvitacionesEquipo = err?.error?.message || 'No se pudo responder la invitación.'
    });
  }

  participacionDeEquipo(equipo?: Equipo): any {
    return this.participacionesJugador.find(item => item.equipo?.id === equipo?.id);
  }

  abrirEquipo(equipo?: Equipo) {
    if (!equipo?.id) return;
    const rutaEquipo = equipo.torneo?.id
      ? `/auth/torneos/torneo/${equipo.torneo.id}/equipo/${equipo.id}`
      : `/auth/equipo/${equipo.id}`;
    this.router.navigateByUrl(rutaEquipo);
  }

  abrirTorneo(torneo?: Torneo) {
    if (torneo?.id) this.router.navigateByUrl(`/auth/torneos/torneo/${torneo.id}`);
  }

  crearEquipoDelegado() {
    this.router.navigateByUrl('/auth/equipo-configurar');
  }

  abrirEdicionPerfil() {
    this.editarPerfilOpen = true;
  }

  cerrarEdicionPerfil() {
    this.editarPerfilOpen = false;
    this.foto = undefined;
    this.cargarPerfil();
  }

  private normalizar(texto: string): string {
    return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  cargarPaises() {
    this.crud.obtenerPaises().subscribe((resp: any[]) => {
      this.paises = resp || [];
      const colombia = this.paises.find(p => p.nombre?.toLowerCase() === 'colombia');
      if (colombia) {
        this.paisSeleccionado = colombia.id;
        this.cargarDepartamentos(colombia.id, this.url == '/auth/usuario');
      }
    });
  }

  cargarUbicacionActual() {
    const ubicacion = this.usuario.ubicacion || '';
    const partes = ubicacion.split('-').map(p => p.trim()).filter(Boolean);
    if (partes.length === 0) {
      return;
    }
    const pais = this.paises.find(p => this.normalizar(p.nombre) === this.normalizar(partes[0]));
    if (pais) {
      this.paisSeleccionado = pais.id;
      this.cargarDepartamentos(pais.id, true);
    }
    const ciudadNombre = partes[partes.length - 1];
    const departamentoNombre = partes[partes.length - 2];
  }

  cargarDepartamentos(paisId: number, restaurarUbicacion = false) {
    this.crud.obtenerDepartamentosPorPais(paisId).subscribe((resp: any[]) => {
      this.departamentos = resp || [];
      if (restaurarUbicacion) {
        const partes = (this.usuario.ubicacion || '').split('-').map(p => p.trim()).filter(Boolean);
        const departamento = this.departamentos.find(d => this.normalizar(d.nombre) === this.normalizar(partes[partes.length - 2] || ''));
        this.departamentoSeleccionado = departamento?.id;
        if (this.departamentoSeleccionado) {
          this.cargarCiudades(this.departamentoSeleccionado, true);
        }
      } else if (this.departamentos.length > 0) {
        this.departamentoSeleccionado = this.departamentos[0].id;
        const departamentoId = this.departamentoSeleccionado;
        if (departamentoId !== undefined) {
          this.cargarCiudades(departamentoId);
        }
      }
    });
  }

  cargarCiudades(departamentoId: number, restaurarUbicacion = false) {
    this.crud.obtenerCiudadesPorDepartamento(departamentoId).subscribe((resp: any[]) => {
      this.ciudades = resp || [];
      if (restaurarUbicacion) {
        const partes = (this.usuario.ubicacion || '').split('-').map(p => p.trim()).filter(Boolean);
        const ciudad = this.ciudades.find(c => this.normalizar(c.nombre) === this.normalizar(partes[partes.length - 1] || ''));
        this.ciudadSeleccionada = ciudad?.id;
      } else if (this.ciudades.length > 0) {
        this.ciudadSeleccionada = this.ciudades[0].id;
      }
      if (this.url !== '/auth/usuario' || restaurarUbicacion) {
        this.actualizarUbicacion();
      }
    });
  }

  seleccionarPais(paisId: number) {
    this.paisSeleccionado = paisId;
    this.cargarDepartamentos(paisId);
  }

  seleccionarDepartamento(departamentoId: number) {
    this.departamentoSeleccionado = departamentoId;
    this.cargarCiudades(departamentoId);
  }

  seleccionarCiudad(ciudadId: number) {
    this.ciudadSeleccionada = ciudadId;
    this.actualizarUbicacion();
  }

  actualizarUbicacion() {
    const pais = this.paises.find(p => p.id === this.paisSeleccionado)?.nombre || '';
    const departamento = this.departamentos.find(d => d.id === this.departamentoSeleccionado)?.nombre || '';
    const ciudad = this.ciudades.find(c => c.id === this.ciudadSeleccionada)?.nombre || '';
    const ubicacion = [pais, departamento, ciudad].filter(Boolean).join(' - ');
    if (ubicacion) {
      this.usuario.ubicacion = ubicacion;
    }
  }
  textoBtnSubmit(): string {
    if (this.url == '/auth/usuario') {
      return "Editar"
    } else if (this.url == '/auth/login/registrar') {
      return "Registrar"
    } 
    return "";
  }
  async onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.usuario.contrasena != this.confirmarContrasena) {
      const alert = await  this.alertController.create({
        header: 'Las contraseñas no son iguales',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }
    if (this.url == '/auth/usuario') {
      this.crud.actualizarArchivo(this.usuario,'usuario', this.foto).subscribe(async (resp: Usuario) =>{
        this.usuario = resp;
        localStorage.setItem('usuario', JSON.stringify(resp));
        this.imagenDef = resp.foto ? 'data:image/png;base64,' + resp.foto : this.imagenDef;
        this.editarPerfilOpen = false;
        const alert = await  this.alertController.create({
          header: 'Informacion usuario actulizada',
          buttons: ['Aceptar'],
        });
        await alert.present();
      });
    } else if (this.url == '/auth/login/registrar') {
      this.crud.crearUsuario(this.usuario,'usuario', this.foto, this.identificacion).subscribe(async (resp) =>{
        this.usuario = resp;
        const alert = await  this.alertController.create({
          header: 'Usuario Creado',
          buttons: ['Aceptar'],
        });
        let elemeto: any = document.getElementsByClassName('back-button-has-icon-only')[0];
        elemeto.click();
        await alert.present();
      });
    } 
  }
  validarBackBtn() {
    return this.url == '/auth/login/registrar';
  }
  activarSubirArchivo(elemento: IonInput | HTMLInputElement){
    if (elemento instanceof HTMLInputElement) {
      elemento.click();
      return;
    }
    const btnFile: any = elemento['el'].children[0];
    btnFile.click();
  }
  cargarImg(input: Event) {
    let elemetHTML: any = input.target;
    if (elemetHTML.files.length > 0) {
      this.foto = elemetHTML.files[0];
      this.imagenDef = URL.createObjectURL(this.foto);
    }
  }
  cerrarSesion() {
    this.crud.cerrarSesion();
    this.router.navigateByUrl('/auth/login');
  }
}

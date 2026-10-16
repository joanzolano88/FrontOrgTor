import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { EstadoTorneo } from 'src/enums/EstadoTorneo';
import { Torneo } from 'src/models/Torneo';

interface PerfilPlanilla {
  nombre: string;
  identificacion: string;
  numeroCelular?: string;
}

@Component({
  selector: 'app-registro-planilla',
  templateUrl: './registro-planilla.page.html',
  styleUrls: ['./registro-planilla.page.scss'],
  standalone: false
})
export class RegistroPlanillaPage implements OnInit {
  torneo = new Torneo();
  idTorneo: string | null = null;
  puedeRegistrar = false;
  cargando = true;
  enviando = false;
  mensajeEstado = '';
  nombreEquipo = '';
  delegado: PerfilPlanilla = this.nuevoPerfil();
  jugadores: PerfilPlanilla[] = [this.nuevoPerfil()];

  constructor(
    private crud: CrudService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit(): void {
    this.idTorneo = this.route.snapshot.paramMap.get('idTorneo');
    if (!this.idTorneo) {
      this.cargando = false;
      this.mensajeEstado = 'No se encontró el torneo solicitado.';
      return;
    }

    this.crud.obtenerParametro(this.idTorneo, 'torneo').subscribe({
      next: (torneo: Torneo) => {
        this.torneo = torneo;
        if (torneo.estadoTorneo !== EstadoTorneo.INSCRIPCIONES && torneo.estadoTorneo !== EstadoTorneo.INSCRIPCIONES_ACTIVO) {
          this.cargando = false;
          this.mensajeEstado = 'El registro de equipos está cerrado para este torneo.';
          return;
        }
        this.crud.obtener(`torneo/${this.idTorneo}/puede-registrar-equipos`).subscribe({
          next: (puede: unknown) => {
            this.puedeRegistrar = puede === true;
            this.cargando = false;
            if (!this.puedeRegistrar) this.mensajeEstado = 'Solo el organizador o un ayudante autorizado puede registrar equipos.';
          },
          error: () => {
            this.cargando = false;
            this.mensajeEstado = 'No se pudo verificar el permiso para registrar equipos.';
          }
        });
      },
      error: error => {
        this.cargando = false;
        this.mensajeEstado = error?.error?.message || 'No se pudo cargar el torneo.';
      }
    });
  }

  agregarJugador(): void {
    this.jugadores.push(this.nuevoPerfil());
  }

  quitarJugador(indice: number): void {
    if (this.jugadores.length > 1) this.jugadores.splice(indice, 1);
  }

  volverAlTorneo(): void {
    if (this.idTorneo) this.router.navigateByUrl(`/auth/torneos/torneo/${this.idTorneo}`);
  }

  registrar(form: any): void {
    if (form.invalid || !this.puedeRegistrar || !this.idTorneo || this.enviando) return;
    const perfiles = [this.delegado, ...this.jugadores];
    const identificaciones = perfiles.map(perfil => perfil.identificacion.trim().toLocaleLowerCase());
    if (new Set(identificaciones).size !== identificaciones.length) {
      void this.mostrarAviso('Identificaciones repetidas', 'Cada perfil del equipo debe tener una identificación distinta.');
      return;
    }

    const planilla = {
      nombreEquipo: this.nombreEquipo.trim(),
      delegado: this.limpiarPerfil(this.delegado),
      jugadores: this.jugadores.map(jugador => this.limpiarPerfil(jugador))
    };
    this.enviando = true;
    this.crud.crear(planilla, `equipo/torneo/${this.idTorneo}/registro-planilla`).subscribe({
      next: (resultado: any) => {
        this.enviando = false;
        void this.registroCompletado(resultado?.jugadoresRegistrados || this.jugadores.length);
      },
      error: error => {
        this.enviando = false;
        void this.mostrarAviso('No se pudo registrar el equipo', error?.error?.message || 'Revisa los datos e inténtalo de nuevo.');
      }
    });
  }

  private async registroCompletado(cantidadJugadores: number): Promise<void> {
    const nombreRegistrado = this.nombreEquipo.trim();
    await this.mostrarAviso('Equipo registrado', `${nombreRegistrado} quedó inscrito con ${cantidadJugadores} jugador${cantidadJugadores === 1 ? '' : 'es'}.`);
    this.nombreEquipo = '';
    this.delegado = this.nuevoPerfil();
    this.jugadores = [this.nuevoPerfil()];
  }

  private async mostrarAviso(header: string, message: string): Promise<void> {
    const alerta = await this.alertController.create({ header, message, buttons: ['Aceptar'] });
    await alerta.present();
  }

  private nuevoPerfil(): PerfilPlanilla {
    return { nombre: '', identificacion: '' };
  }

  private limpiarPerfil(perfil: PerfilPlanilla): PerfilPlanilla {
    return {
      nombre: perfil.nombre.trim(),
      identificacion: perfil.identificacion.trim(),
      numeroCelular: perfil.numeroCelular?.trim()
    };
  }
}
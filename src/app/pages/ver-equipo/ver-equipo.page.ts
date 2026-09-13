import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { Equipo } from 'src/models/Equipo';
import { AlertController } from '@ionic/angular';
import { SesionService } from 'src/app/services/restriccion/sesion.service';
import { PagoInscripcion } from 'src/models/PagoInscripcion';

@Component({
  selector: 'app-ver-equipo',
  templateUrl: './ver-equipo.page.html',
  styleUrls: ['./ver-equipo.page.scss'],
  standalone: false
})
export class VerEquipoPage {
  equipo: Equipo = new Equipo();
  esOrganizador = false;
  esDelegado = false;
  idTorneo = '';
  pagos: PagoInscripcion[] = [];
  nuevoPago = new PagoInscripcion();
  mensajePago = '';

  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router, sesion: SesionService, private alertController: AlertController) {
    this.idTorneo = this.route.snapshot.paramMap.get('idTorneo') || '';
    this.esOrganizador = sesion.validacionOrganizador();
    const idEquipo = this.route.snapshot.paramMap.get('idEquipo');
    this.crud.obtenerParametro(idEquipo, 'equipo').subscribe((equipo: Equipo) => {
      this.equipo = equipo;
      const usuario = this.crud.obtenerUsuario();
      this.esDelegado = !!usuario.numeroCelular && usuario.numeroCelular === equipo.delegado?.numeroCelular;
      if (this.esOrganizador && equipo.id) {
        this.cargarPagos(equipo.id);
      }
    });
  }

  editar() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.idTorneo + '/tabla-equipos/crear-equipo/' + this.equipo.id);
  }

  abrirWhatsapp(numero?: string, mensaje = '') {
    if (!numero) {
      return;
    }
    const telefono = numero.replace(/\D/g, '');
    window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  cargarPagos(idEquipo: number) {
    this.crud.obtenerPagosEquipo(idEquipo).subscribe(pagos => this.pagos = pagos || []);
  }

  registrarPago() {
    if (!this.equipo.id || this.nuevoPago.monto <= 0) {
      this.mensajePago = 'Ingresa un monto mayor que cero.';
      return;
    }
    const total = this.equipo.torneo?.valorInscripcion || 0;
    const pagado = this.pagos.reduce((sum, pago) => sum + (pago.estado === 'PENDIENTE' ? 0 : pago.monto), 0);
    const nuevoTotal = pagado + this.nuevoPago.monto;
    const faltante = Math.max(total - nuevoTotal, 0);
    if (nuevoTotal > total) {
      this.mensajePago = 'El monto supera el total de la inscripción.';
      return;
    }
    const estado = nuevoTotal === total ? 'PAGADO' : 'PARCIAL';
    this.confirmarPago(total, pagado, nuevoTotal, faltante, estado);
  }

  async confirmarPago(total: number, pagado: number, nuevoTotal: number, faltante: number, estado: string) {
    const alerta = await this.alertController.create({
      header: 'Confirmar pago',
      message: `Equipo: ${this.equipo.nombre}<br>Total inscripción: ${total.toLocaleString('es-CO')}<br>Pago a registrar: ${this.nuevoPago.monto.toLocaleString('es-CO')}<br>Total aportado: ${nuevoTotal.toLocaleString('es-CO')}<br>Faltante: ${faltante.toLocaleString('es-CO')}<br>Estado automático: ${estado}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', role: 'confirm', handler: () => this.enviarPago(total, nuevoTotal, faltante) }
      ]
    });
    await alerta.present();
  }

  enviarPago(total: number, nuevoTotal: number, faltante: number) {
    if (!this.equipo.id) {
      return;
    }
    const montoAportado = this.nuevoPago.monto;
    this.crud.registrarPagoEquipo(this.equipo.id, this.nuevoPago).subscribe({
      next: (pago: PagoInscripcion) => {
        this.pagos = [pago, ...this.pagos];
        this.mensajePago = 'Pago registrado correctamente.';
        this.abrirWhatsapp(this.equipo.delegado?.numeroCelular, `Hola, el pago del equipo ${this.equipo.nombre} fue registrado. Aporte realizado: $${montoAportado.toLocaleString('es-CO')}. Estado: ${pago.estado}. Faltante: $${faltante.toLocaleString('es-CO')}. Total inscripción: $${total.toLocaleString('es-CO')}.`);
        this.nuevoPago = new PagoInscripcion();
      },
      error: err => this.mensajePago = err.error?.message || 'No se pudo registrar el pago.'
    });
  }
}

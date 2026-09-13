import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-invitacion-partido',
  templateUrl: './invitacion-partido.page.html',
  styleUrls: ['./invitacion-partido.page.scss'],
  standalone: false
})
export class InvitacionPartidoPage implements OnInit {
  mensaje = 'Procesando invitación...';
  error = false;

  constructor(private route: ActivatedRoute, private crud: CrudService) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    const jugadorId = this.crud.obtenerUsuario().id;
    if (!token || !jugadorId) {
      this.error = true;
      this.mensaje = 'Debes iniciar sesión con tu usuario jugador para aceptar esta invitación.';
      return;
    }
    this.crud.crear({}, `partido/invitacion/${token}/aceptar?usuarioId=${jugadorId}`).subscribe({
      next: () => this.mensaje = 'Te agregaste correctamente a la lista de jugadores del partido.',
      error: err => {
        this.error = true;
        this.mensaje = err?.error?.message || 'No se pudo aceptar la invitación.';
      }
    });
  }
}

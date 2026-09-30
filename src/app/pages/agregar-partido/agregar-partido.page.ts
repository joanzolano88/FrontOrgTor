import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-agregar-partido',
  templateUrl: './agregar-partido.page.html',
  styleUrls: ['./agregar-partido.page.scss'],
  standalone: false
})
export class AgregarPartidoPage {

  mensaje = '';

  constructor(private crud: CrudService, private route: ActivatedRoute) { }

  generarPartidos() {
    this.crud.obtener("partido/generar_partidos/" + this.route.snapshot.paramMap.get('idTorneo')).subscribe({
      next: () => this.mensaje = 'Generación de partidos completada.',
      error: err => this.mensaje = err?.error?.message || 'No se pudieron generar los partidos.'
    });
  }
}

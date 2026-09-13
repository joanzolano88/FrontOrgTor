import { Component, OnInit } from '@angular/core';
import { CrudService } from 'src/app/services/crud.service';
import { Deporte } from 'src/models/Deporte';

@Component({
  selector: 'app-deportes',
  templateUrl: './deportes.page.html',
  styleUrls: ['./deportes.page.scss'],
  standalone: false
})
export class DeportesPage implements OnInit {
  deportes: Deporte[] = [];
  deporte = new Deporte();
  mensaje = '';

  constructor(private crud: CrudService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.crud.obtener('deporte').subscribe((resp: Deporte[]) => this.deportes = resp || [], error => this.mensaje = error?.error?.message || 'No se pudieron cargar los deportes.');
  }

  guardar() {
    if (!this.deporte.nombre?.trim()) {
      this.mensaje = 'El nombre del deporte es obligatorio.';
      return;
    }
    const peticion = this.deporte.id ? this.crud.actualizar(this.deporte, `deporte/${this.deporte.id}`) : this.crud.crear(this.deporte, 'deporte');
    peticion.subscribe({ next: () => { this.mensaje = 'Deporte guardado correctamente.'; this.deporte = new Deporte(); this.cargar(); }, error: err => this.mensaje = err?.error?.message || 'No se pudo guardar el deporte.' });
  }

  editar(deporte: Deporte) { this.deporte = { ...deporte }; }
}

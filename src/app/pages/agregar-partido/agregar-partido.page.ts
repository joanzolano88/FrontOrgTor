import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { Partido } from 'src/models/Partido';

@Component({
  selector: 'app-agregar-partido',
  templateUrl: './agregar-partido.page.html',
  styleUrls: ['./agregar-partido.page.scss'],
  standalone: false
})
export class AgregarPartidoPage implements OnInit {

  listaPartidos: Partido[] = [];
  cantidadPartidos: number | null = null;
  fecha: string = new Date().toISOString();
  hora: string = new Date().toISOString();

  constructor(private crud: CrudService, private route: ActivatedRoute) { }

  ngOnInit() {
  }
  
  generarPartidos() {
    this.crud.obtener("partido/generar_partidos/" + this.route.snapshot.paramMap.get('idTorneo')).subscribe((resp: Partido[]) =>{
      console.log(resp);
    });
  }
  generarPartido() {  
    
  }
}

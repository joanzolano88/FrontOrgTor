import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SolicitudesEquipoPageRoutingModule } from './solicitudes-equipo-routing.module';
import { SolicitudesEquipoPage } from './solicitudes-equipo.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SolicitudesEquipoPageRoutingModule, SharedModule],
  declarations: [SolicitudesEquipoPage]
})
export class SolicitudesEquipoPageModule {}

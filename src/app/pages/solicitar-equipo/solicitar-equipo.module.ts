import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SolicitarEquipoPageRoutingModule } from './solicitar-equipo-routing.module';
import { SolicitarEquipoPage } from './solicitar-equipo.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SolicitarEquipoPageRoutingModule],
  declarations: [SolicitarEquipoPage]
})
export class SolicitarEquipoPageModule {}

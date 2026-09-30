import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SolicitarEquipoPageRoutingModule } from './solicitar-equipo-routing.module';
import { SolicitarEquipoPage } from './solicitar-equipo.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SolicitarEquipoPageRoutingModule, SharedModule],
  declarations: [SolicitarEquipoPage]
})
export class SolicitarEquipoPageModule {}

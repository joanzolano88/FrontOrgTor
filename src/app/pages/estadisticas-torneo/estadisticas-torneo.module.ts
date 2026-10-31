import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EstadisticasTorneoPageRoutingModule } from './estadisticas-torneo-routing.module';
import { EstadisticasTorneoPage } from './estadisticas-torneo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EstadisticasTorneoPageRoutingModule
  ],
  declarations: [EstadisticasTorneoPage]
})
export class EstadisticasTorneoPageModule {}

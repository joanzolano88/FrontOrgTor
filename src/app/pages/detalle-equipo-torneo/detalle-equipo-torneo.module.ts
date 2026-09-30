import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DetalleEquipoTorneoPageRoutingModule } from './detalle-equipo-torneo-routing.module';
import { DetalleEquipoTorneoPage } from './detalle-equipo-torneo.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DetalleEquipoTorneoPageRoutingModule],
  declarations: [DetalleEquipoTorneoPage]
})
export class DetalleEquipoTorneoPageModule {}
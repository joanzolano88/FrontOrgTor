import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EquipoConfigurarPageRoutingModule } from './equipo-configurar-routing.module';
import { EquipoConfigurarPage } from './equipo-configurar.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EquipoConfigurarPageRoutingModule
  ],
  declarations: [EquipoConfigurarPage]
})
export class EquipoConfigurarPageModule {}

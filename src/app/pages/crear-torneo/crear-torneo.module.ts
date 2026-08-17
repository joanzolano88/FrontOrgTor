import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearTorneoPageRoutingModule } from './crear-torneo.routing';

import { CrearTorneoPage } from './crear-torneo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearTorneoPageRoutingModule
  ],
  declarations: [CrearTorneoPage]
})
export class CrearTorneoPageModule {}

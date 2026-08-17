import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TorneoPageRoutingModule } from './torneo-routing.module';
import { TorneoPage } from './torneo.page';
import { TorneoComponent } from '../shared/torneo/torneo.component';
import { InformacionTorneoComponent } from '../shared/informacion-torneo/informacion-torneo.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TorneoPageRoutingModule
  ],
  declarations: [TorneoPage, TorneoComponent, InformacionTorneoComponent]
})
export class TorneoPageModule {}

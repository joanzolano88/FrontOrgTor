import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TorneosPageRoutingModule } from './torneos-routing.module';

import { TorneosPage } from './torneos.page';
import { TorneoFabButtonComponent } from './shared/torneo-fab-button/torneo-fab-button.component';
import { ListaTorneoComponent } from './shared/lista-torneo/lista-torneo.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TorneosPageRoutingModule
  ],
  declarations: [TorneosPage, TorneoFabButtonComponent,
    ListaTorneoComponent]
})
export class TorneosPageModule {}

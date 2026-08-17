import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { TorneoFabButtonComponent } from '../organizador/torneos/shared/torneo-fab-button/torneo-fab-button.component';
import { ListaTorneoComponent } from '../organizador/torneos/shared/lista-torneo/lista-torneo.component';
import { TorneosPage } from '../organizador/torneos/torneos.page';
import { TorneosPageModule } from '../organizador/torneos/torneos.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    TorneosPageModule
  ],
  declarations: [
    Tab2Page
  ],
})
export class Tab2PageModule {}

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TablaEquiposPageRoutingModule } from './tabla-equipos-routing.module';
import { TablaEquiposPage } from './tabla-equipos.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TablaEquiposPageRoutingModule,
  ],
  declarations: [TablaEquiposPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TablaEquiposPageModule {}

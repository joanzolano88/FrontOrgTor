import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CambiarFaseTorneoPageRoutingModule } from './cambiar-fase-torneo-routing.module';

import { CambiarFaseTorneoPage } from './cambiar-fase-torneo.page';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CambiarFaseTorneoPageRoutingModule,
    CdkDropList, CdkDrag,
    CdkDropListGroup
  ],
  declarations: [CambiarFaseTorneoPage]
})
export class CambiarFaseTorneoPageModule {}

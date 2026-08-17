import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CanchasPageRoutingModule } from './canchas-routing.module';

import { CanchasPage } from './canchas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CanchasPageRoutingModule
  ],
  declarations: [CanchasPage]
})
export class CanchasPageModule {}

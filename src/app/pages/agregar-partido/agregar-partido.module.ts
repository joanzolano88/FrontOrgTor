import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarPartidoPageRoutingModule } from './agregar-partido-routing.module';

import { AgregarPartidoPage } from './agregar-partido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarPartidoPageRoutingModule
  ],
  declarations: [AgregarPartidoPage]
})
export class AgregarPartidoPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaPartidosPageRoutingModule } from './lista-partidos-routing.module';

import { ListaPartidosPage } from './lista-partidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaPartidosPageRoutingModule
  ],
  declarations: [ListaPartidosPage]
})
export class ListaPartidosPageModule {}

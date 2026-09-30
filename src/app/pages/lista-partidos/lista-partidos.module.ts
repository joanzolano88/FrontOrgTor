import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaPartidosPageRoutingModule } from './lista-partidos-routing.module';

import { ListaPartidosPage } from './lista-partidos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ListaPartidosPageRoutingModule
  ],
  declarations: [ListaPartidosPage]
})
export class ListaPartidosPageModule {}

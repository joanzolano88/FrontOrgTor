import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { PartidoPageRoutingModule } from './partido-routing.module';

import { PartidoPage } from './partido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DragDropModule,
    PartidoPageRoutingModule
  ],
  declarations: [PartidoPage]
})
export class PartidoPageModule {}

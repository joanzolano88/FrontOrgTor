import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { PartidoPageRoutingModule } from './partido-routing.module';

import { PartidoPage } from './partido.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DragDropModule,
    SharedModule,
    PartidoPageRoutingModule
  ],
  declarations: [PartidoPage]
})
export class PartidoPageModule {}

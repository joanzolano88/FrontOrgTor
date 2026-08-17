import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParticipantesConfigurarPageRoutingModule } from './participante-configurar-routing.module';

import { ParticipanteConfigurarPage } from './participante-configurar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParticipantesConfigurarPageRoutingModule
  ],
  declarations: [ParticipanteConfigurarPage]
})
export class ParticipantesConfigurarPageModule {}

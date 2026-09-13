import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InvitacionPartidoPageRoutingModule } from './invitacion-partido-routing.module';
import { InvitacionPartidoPage } from './invitacion-partido.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, InvitacionPartidoPageRoutingModule],
  declarations: [InvitacionPartidoPage]
})
export class InvitacionPartidoPageModule {}

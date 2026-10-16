import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilJugadorPageRoutingModule } from './perfil-jugador-routing.module';
import { PerfilJugadorPage } from './perfil-jugador.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PerfilJugadorPageRoutingModule, SharedModule],
  declarations: [PerfilJugadorPage]
})
export class PerfilJugadorPageModule {}

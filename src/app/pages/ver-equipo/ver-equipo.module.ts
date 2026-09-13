import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VerEquipoPageRoutingModule } from './ver-equipo-routing.module';
import { VerEquipoPage } from './ver-equipo.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, VerEquipoPageRoutingModule],
  declarations: [VerEquipoPage]
})
export class VerEquipoPageModule {}

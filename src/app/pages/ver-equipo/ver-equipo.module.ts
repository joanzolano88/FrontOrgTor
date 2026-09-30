import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VerEquipoPageRoutingModule } from './ver-equipo-routing.module';
import { VerEquipoPage } from './ver-equipo.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, VerEquipoPageRoutingModule, SharedModule],
  declarations: [VerEquipoPage]
})
export class VerEquipoPageModule {}

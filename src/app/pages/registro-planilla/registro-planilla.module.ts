import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegistroPlanillaPageRoutingModule } from './registro-planilla-routing.module';
import { RegistroPlanillaPage } from './registro-planilla.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RegistroPlanillaPageRoutingModule],
  declarations: [RegistroPlanillaPage]
})
export class RegistroPlanillaPageModule {}
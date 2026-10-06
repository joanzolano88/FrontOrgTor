import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistroPlanillaPage } from './registro-planilla.page';

const routes: Routes = [{ path: '', component: RegistroPlanillaPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroPlanillaPageRoutingModule {}
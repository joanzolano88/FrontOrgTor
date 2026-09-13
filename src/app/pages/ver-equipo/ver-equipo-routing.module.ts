import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerEquipoPage } from './ver-equipo.page';

const routes: Routes = [{ path: '', component: VerEquipoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerEquipoPageRoutingModule {}

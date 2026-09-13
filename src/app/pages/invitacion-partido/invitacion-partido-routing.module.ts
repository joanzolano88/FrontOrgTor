import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvitacionPartidoPage } from './invitacion-partido.page';

const routes: Routes = [{ path: '', component: InvitacionPartidoPage }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class InvitacionPartidoPageRoutingModule {}

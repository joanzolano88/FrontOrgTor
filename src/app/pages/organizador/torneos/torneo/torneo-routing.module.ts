import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TorneoPage } from './torneo.page';
import { ListaPartidosPageModule } from '../../../lista-partidos/lista-partidos.module';

const routes: Routes = [
  {
    path: '',
    component: TorneoPage
  },{
    path: 'crear-cancha',
    loadChildren: () => import('../../../cancha/cancha.module').then( m => m.CanchaPageModule)
  },{
    path: 'configuracion-cancha/:idCancha',
    loadChildren: () => import('../../../cancha/cancha.module').then( m => m.CanchaPageModule)
  },{
    path: 'configuracion-torneo',
    loadChildren: () => import('../../../crear-torneo/crear-torneo.module').then(m => m.CrearTorneoPageModule) 
  },{
    path: 'tabla-equipos/crear-equipo/:idEquipo',
    loadChildren: () => import('../../../equipo-configurar/equipo-configurar.module').then( m => m.EquipoConfigurarPageModule)
  },{
    path: 'crear-equipo',
    loadChildren: () => import('../../../equipo-configurar/equipo-configurar.module').then( m => m.EquipoConfigurarPageModule)
  },{
    path: 'tabla-equipos',
    loadChildren: () => import('../../../tabla-equipos/tabla-equipos.module').then( m => m.TablaEquiposPageModule)
  },{
    path: 'agregar-partido',
    loadChildren: () => import('../../../agregar-partido/agregar-partido.module').then( m => m.AgregarPartidoPageModule)
  },{
    path: 'lista-partidos',
    loadChildren: () => import('../../../lista-partidos/lista-partidos.module').then( m => m.ListaPartidosPageModule)
  },{
    path: 'cambio-fase',
    loadChildren: () => import('../../../cambiar-fase-torneo/cambiar-fase-torneo.module').then( m => m.CambiarFaseTorneoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TorneoPageRoutingModule {}

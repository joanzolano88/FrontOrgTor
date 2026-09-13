import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TorneoPage } from './torneo.page';
import { ListaPartidosPageModule } from '../../../lista-partidos/lista-partidos.module';
import { PropietarioTorneoGuard } from 'src/app/services/restriccion/propietario-torneo.guard';

const routes: Routes = [
  {
    path: '',
    component: TorneoPage
  },{
    path: 'crear-cancha',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../cancha/cancha.module').then( m => m.CanchaPageModule)
  },{
    path: 'configuracion-cancha/:idCancha',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../cancha/cancha.module').then( m => m.CanchaPageModule)
  },{
    path: 'configuracion-torneo',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../crear-torneo/crear-torneo.module').then(m => m.CrearTorneoPageModule) 
  },{
    path: 'tabla-equipos/crear-equipo/:idEquipo',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../equipo-configurar/equipo-configurar.module').then( m => m.EquipoConfigurarPageModule)
  },{
    path: 'crear-equipo',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../equipo-configurar/equipo-configurar.module').then( m => m.EquipoConfigurarPageModule)
  },{
    path: 'tabla-equipos',
    loadChildren: () => import('../../../tabla-equipos/tabla-equipos.module').then( m => m.TablaEquiposPageModule)
  },{
    path: 'equipo/:idEquipo',
    loadChildren: () => import('../../../ver-equipo/ver-equipo.module').then(m => m.VerEquipoPageModule)
  },{
    path: 'solicitar-equipo',
    loadChildren: () => import('../../../solicitar-equipo/solicitar-equipo.module').then(m => m.SolicitarEquipoPageModule)
  },{
    path: 'solicitudes',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../solicitudes-equipo/solicitudes-equipo.module').then(m => m.SolicitudesEquipoPageModule)
  },{
    path: 'agregar-partido',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../agregar-partido/agregar-partido.module').then( m => m.AgregarPartidoPageModule)
  },{
    path: 'lista-partidos',
    loadChildren: () => import('../../../lista-partidos/lista-partidos.module').then( m => m.ListaPartidosPageModule)
  },{
    path: 'asignar-grupos',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../cambiar-fase-torneo/cambiar-fase-torneo.module').then( m => m.CambiarFaseTorneoPageModule)
  },{
    path: 'cambio-fase',
    canActivate: [PropietarioTorneoGuard],
    loadChildren: () => import('../../../cambiar-fase-torneo/cambiar-fase-torneo.module').then( m => m.CambiarFaseTorneoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TorneoPageRoutingModule {}

import { Routes } from '@angular/router';
import { LoadingPage } from './shared/page/loadingPage/loadingPage';
import { Login } from './shared/page/Login/Login';
import { RegisterComponent } from './shared/page/register/registerComponent/registerComponent';
import { AdminDashboardComponent } from './shared/page/admin/admin-dashboard.component';
import { UserDashboardComponent } from './shared/page/user/user-dashboard.component';
import { AdminHome } from './spacebook/admin/page/admin-home/admin-home';
import { CalendarioDisponibilidad } from './spacebook/admin/page/calendario-disponibilidad/calendario-disponibilidad';
import { AdministrarEspacios } from './spacebook/admin/page/administrar-espacios/administrar-espacios';
import { VisualizacionDisponibilidadComponent } from './spacebook/admin/page/visualizacion-disponibilidad/visualizacion-disponibilidad';
import { UserHome } from './spacebook/user/page/user-home/user-home';
import { CatalogoEspacios } from './spacebook/user/page/catalogo-espacios/catalogo-espacios';
import { SistemaReservas } from './spacebook/user/page/sistema-reservas/sistema-reservas';
import { NotificacionesComponent } from './spacebook/user/page/notificaciones/notificaciones';
import { MisReservasComponent } from './spacebook/user/page/mis-reservas/mis-reservas';
import { ComentariosComponent } from './spacebook/user/page/comentarios/comentarios';
import { IncidenciasComponent } from './spacebook/user/page/incidencias/incidencias';
import { GestionarIncidenciasComponent } from './spacebook/admin/page/gestionar-incidencias/gestionar-incidencias';
import { GestionarReservasComponent } from './spacebook/admin/page/gestionar-reservas/gestionar-reservas';
import { adminGuard } from './shared/guards/admin.guard';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: LoadingPage
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [adminGuard],
        children: [
            {
                path: '',
                component: AdminHome
            },
            {
                path: 'calendario',
                component: CalendarioDisponibilidad
            },
            {
                path: 'administrar-espacios',
                component: AdministrarEspacios
            },
            {
                path: 'visualizacion-disponibilidad',
                component: VisualizacionDisponibilidadComponent
            },
            {
                path: 'incidencias',
                component: GestionarIncidenciasComponent
            },
            {
                path: 'reservas',
                component: GestionarReservasComponent
            }
        ]
    },
    {
        path: 'user-dashboard',
        component: UserDashboardComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: UserHome
            },
            {
                path: 'catalogo-espacios',
                component: CatalogoEspacios
            },
            {
                path: 'sistema-reservas',
                component: SistemaReservas
            },
            {
                path: 'notificaciones',
                component: NotificacionesComponent
            },
            {
                path: 'mis-reservas',
                component: MisReservasComponent
            },
            {
                path: 'comentario/:reservaId',
                component: ComentariosComponent
            },
            {
                path: 'incidencias',
                component: IncidenciasComponent
            },
            {
                path: 'notificaciones',
                component: NotificacionesComponent
            }
        ]
    },
    {
        path:'spacebook',
        loadChildren: () => import('./spacebook/spacebook.routes').then(m => m.spaceBookRoutes)
    },
];

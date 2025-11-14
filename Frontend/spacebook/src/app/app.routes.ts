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
            }
        ]
    },
    {
        path: 'user-dashboard',
        component: UserDashboardComponent,
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
            }
        ]
    },
    {
        path:'spacebook',
        loadChildren: () => import('./spacebook/spacebook.routes').then(m => m.spaceBookRoutes)
    },
];

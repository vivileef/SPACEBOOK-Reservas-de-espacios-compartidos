import { Routes } from '@angular/router';
import { LoadingPage } from './shared/page/loadingPage/loadingPage';
import { Login } from './shared/page/Login/Login';
import { RegisterComponent } from './shared/page/register/registerComponent/registerComponent';

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
        path:'spacebook',
        loadChildren: () => import('./spacebook/spacebook.routes').then(m => m.spaceBookRoutes)
    },
    {
        path: 'register',
        component: RegisterComponent
    },
];

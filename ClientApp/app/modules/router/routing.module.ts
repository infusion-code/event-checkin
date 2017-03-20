import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from '../../components/error';
import { LoginComponent } from '../../components/login';
import { EventDashboard } from '../../components/eventDashboard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },   
    { path: 'login', component: LoginComponent, pathMatch: 'full', data: { breadcrumb: 'Login to Eventbrite' } },
    { path: 'events/:id/:name', component: EventDashboard, data: { breadcrumb: 'Event' } },
    { path: 'error', component: ErrorComponent, data: { breadcrumb: 'Error' } },
    { path: '**', redirectTo: 'error' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
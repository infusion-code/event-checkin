import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../../components/home/home.component';
import { LoginComponent } from '../../components/login';
import { EventDashboard } from '../../components/eventDashboard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'start', component: HomeComponent, pathMatch: 'full', data: { breadcrumb: 'Dashboard' } },    
    { path: 'login', component: LoginComponent, pathMatch: 'full', data: { breadcrumb: 'Login to Eventbrite' } },
    { path: 'events/:id/:name', component: EventDashboard, data: { breadcrumb: 'Event' } },
    { path: '**', redirectTo: 'start' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
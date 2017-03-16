import { NgModule } from '@angular/core';
import { UniversalModule } from 'angular2-universal';
import { AppRoutingModule } from './modules/router/routing.module';
import { Http } from '@angular/http';
import { AppScaffoldModule, AppComponent, ConfigService, HeroService, CurrentNavProvider } from 'ng2-app-scaffold';
import { TilesAndCardsModule } from 'ng2-cards-and-tiles';
import { ActivatedRoute , Router } from '@angular/router';

import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from './components/login';
import { EventDashboard } from './components/eventDashboard';
import { EventCard } from './components/eventCard';
import { AttendeeCard } from './components/attendeeCard';
import { AppConfigService } from "./services/configService";
import { UserService } from './services/userService';
import { UserProfileService } from './services/heroService';
import { EventsService } from './services/eventsService';
import { CurrentNavService } from './services/currentNavService';

@NgModule({
    bootstrap: [ AppComponent ],
    declarations: [ HomeComponent, LoginComponent, EventDashboard, EventCard, AttendeeCard ],
    imports: [
        UniversalModule, // Must be first import. This automatically imports BrowserModule, HttpModule, and JsonpModule too.
        AppScaffoldModule,
        AppRoutingModule,
        TilesAndCardsModule
    ],
    providers: [
        AppConfigService,
        EventsService,
        {  
            provide: CurrentNavProvider, deps: [AppConfigService, EventsService, UserService], useFactory: (config : AppConfigService, events: EventsService, user: UserService) => {
                return new CurrentNavService(config, events, user);
            }
        },
        { 
            provide: UserService, deps: [Router], useFactory: (router: Router) => {
                return new UserService(router);
            }
        },
        { 
            provide: HeroService, deps: [AppConfigService, Http], useFactory: (config: AppConfigService, http: Http) => {
                return new UserProfileService(config, http);
            }
        },
        { provide: ConfigService, useExisting: AppConfigService }
    ]
})
export class AppModule {    
}

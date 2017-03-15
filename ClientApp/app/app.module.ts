import { NgModule } from '@angular/core';
import { UniversalModule } from 'angular2-universal';
import { AppRoutingModule } from './modules/router/routing.module';
import { Http } from '@angular/http';
import { AppScaffoldModule, AppComponent, ConfigService, HeroService } from 'ng2-app-scaffold';
import { TilesAndCardsModule } from 'ng2-cards-and-tiles';
import { ActivatedRoute , Router } from '@angular/router';

import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from './components/login';
import { AppConfigService } from "./services/configService";
import { UserService } from './services/userService';
import { UserProfileService } from './services/heroService';

@NgModule({
    bootstrap: [ AppComponent ],
    declarations: [ HomeComponent, LoginComponent ],
    imports: [
        UniversalModule, // Must be first import. This automatically imports BrowserModule, HttpModule, and JsonpModule too.
        AppScaffoldModule,
        AppRoutingModule,
        TilesAndCardsModule
    ],
    providers: [
        AppConfigService,
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

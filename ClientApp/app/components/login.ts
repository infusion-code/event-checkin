import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';
import { UserService } from '../services/userService';
import { CurrentNavService } from '../services/currentNavService';
import { AppConfigService } from '../services/configService';

@Component({
    selector: 'login',
    template: `
        <div class="side-body">
            <div style="background-color: #888; margin-bottom: 20px; padding: 20px">
                You will be redirected to Eventbrite for login and trusting the app if necessary. After successful login, you will be returned 
                to this app. 

                Standby for login redirection to event brite...
            </div>
        </div>
    `
})
export class LoginComponent implements OnInit, OnDestroy {
    private _initialNavSubscription: Subscription = null;

    constructor(private _config: AppConfigService, private _userService: UserService, private _currentNav: CurrentNavService){ }

    public ngOnInit(){
        let timer: Observable<number> = null;
        this._userService.EnsureLogin("/login");
        this._initialNavSubscription = this._currentNav.RouteRequest.subscribe(u => {
            if(u != "" && this._config.IsAuthenticated) this._currentNav.Route(u);
        })
    }

    public ngOnDestroy(){
        if(this._initialNavSubscription) this._initialNavSubscription.unsubscribe();
    }

    private RedirectToEventBriteLogin(t: number){
        window.location.href = this._userService.LoginEndPoint;
    }
}


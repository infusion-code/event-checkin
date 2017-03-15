import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';
import { UserService } from '../services/userService';

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
    private _loginTimerSubscription:Subscription = null;
    private _querySubscription: Subscription = null;

    constructor(private _userService: UserService, private _route: ActivatedRoute){ }

    public ngOnInit(){
        let timer: Observable<number> = null;
        this._userService.EnsureLogin("/start");
    }

    public ngOnDestroy(){
        if(this._querySubscription) this._querySubscription.unsubscribe();
    }

    private RedirectToEventBriteLogin(t: number){
        this._loginTimerSubscription.unsubscribe();
        window.location.href = this._userService.LoginEndPoint;
    }
}


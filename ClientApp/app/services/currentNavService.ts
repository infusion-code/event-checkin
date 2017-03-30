import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { NavNode , CurrentNavProvider } from 'ng2-app-scaffold';
import { AppConfigService } from './configService';
import { EventsService } from './eventsService';
import { UserService } from './userService';
import { ErrorService } from './errorService';
import { Event } from '../models/event';

@Injectable()
export class CurrentNavService extends CurrentNavProvider {

    private _subscription: Subscription;
    private _routeRequest:BehaviorSubject<string> = new BehaviorSubject<string>("");

    public get RouteRequest():Observable<string> { return this._routeRequest.asObservable();}

    constructor(private _config: AppConfigService, private _events: EventsService, private _userService: UserService, private _log: ErrorService,  private _router: Router) { 
        super();
        this._userService.AuthenticationChanged.subscribe(authenticated => {
            if(authenticated) this.GetData();
            else this._root.Children.length = 0;
        });
    }

    protected GetData() {
        if(this._root == null) this._root = new NavNode("root", "/", "curNavNode_root");
        if(this._config.IsAuthenticated){ 
            let events: Observable<Array<Event>> = this._events.Events;
            this._subscription = events.subscribe(x => {
                this._root.Children.length = 0;
                x.forEach(r => {
                    this._root.Children.push(new NavNode(r.Name, this._config.FormatString("/events/{0}/{1}", r.Id, r.Name), "curNavNode_" + r.Id, "fa-calendar "));
                });
                // regiater nav propvider with user service so that post authentication navigation can happen from here on out
                this._userService.RegisterNavProvider();

                // check whether there is a pending navigation request or attempt to route to most recent event 
                if(this._userService.RequestedPostAuthenticationRedirect != null && this._userService.RequestedPostAuthenticationRedirect !== "") {
                    //Observable.timer(1).subscribe(e => {
                        this._router.navigateByUrl(this._userService.RequestedPostAuthenticationRedirect);
                    //});
                }
                else if(this._root.Children.length > 0){
                    Observable.timer(1).subscribe(e => {
                        this._routeRequest.next(this._root.Children[0].Url);
                    });
                }
                else{
                    this._log.LogError("There do not seem to be any pending events.");
                    this.Route("/error");
                }
            });
        }
    }

    public Route(url:string){
        this._router.navigateByUrl(url);
    }

    public ngOnDestoy() {
        if (this._subscription) this._subscription.unsubscribe();
    }

}
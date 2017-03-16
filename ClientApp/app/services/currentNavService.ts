import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, Subscription, Subject } from 'rxjs/Rx';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { NavNode , CurrentNavProvider } from 'ng2-app-scaffold';
import { AppConfigService } from './configService';
import { EventsService } from './eventsService';
import { UserService } from './userService';
import { Event } from '../models/event';

@Injectable()
export class CurrentNavService extends CurrentNavProvider {

    private _subscription: Subscription;

    constructor(private _config: AppConfigService, private _events: EventsService, private _userService: UserService) { 
        super();
        this._userService.AuthenticationChanged.subscribe(authenticated => {
            if(authenticated) this.GetData();
            else this._root.Children.length = 0;
        });
    }

    protected GetData() {
        if(this._root == null) this._root = new NavNode("root", "/", "curNavNode_root");
        if(this._config.IsAuthenticated){ 
            let events: Observable<Array<Event>>;

            events = this._events.Events;
            this._subscription = events.subscribe(x => {
                this._root.Children.length = 0;
                x.forEach(r => {
                    this._root.Children.push(new NavNode(r.Name, this._config.FormatString("/events/{0}/{1}", r.Id, r.Name), "curNavNode_" + r.Id, "fa-calendar "));
                });
            });
        }
    }

    public ngOnDestoy() {
        if (this._subscription) this._subscription.unsubscribe();
    }

}
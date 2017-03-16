import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Event } from '../models/event'
import { AppConfigService } from '../services/configService';
import { EventsService } from '../services/eventsService';

@Component({
    selector: 'event-dashboard',
    template: `
        <ng-container *ngIf="_config.IsAuthenticated">
            <div class="side-body padding-top">
                <event-card [Event]="Event"></event-card>
            </div>
        </ng-container>
    `,
    styles: [

    ]
})
export class EventDashboard implements OnInit, OnDestroy {

    private _parameterSubscription: Subscription = null;
    private _id: string;
    private _name: string;
    private _event: Event; 

    public get EventId() { return this._id; }
    public get Event(): Event { return this._event; }

    constructor(private _route: ActivatedRoute, private _config: AppConfigService, private _events: EventsService) { }

    public ngOnInit() {
        if(!this._config.IsAuthenticated) this._config.Authenticate(this._route.snapshot.url.toString());
        this._parameterSubscription = this._route.params.subscribe(params => {
            this._id = params['id'];
            this._name = params['name'];
            //this._events.GetEvent(this._id).then(e => this._event = e);

            this._events.GetEventObservable(this._id).subscribe(e => this._event = e);
        });
    }

    public ngOnDestroy() {
        if (this._parameterSubscription) this._parameterSubscription.unsubscribe();
    }

}

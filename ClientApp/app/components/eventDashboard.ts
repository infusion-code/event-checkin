import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Event } from '../models/event'
import { Attendee } from '../models/attendee'
import { AppConfigService } from '../services/configService';
import { EventsService } from '../services/eventsService';

@Component({
    selector: 'event-dashboard',
    template: `
        <ng-container *ngIf="_config.IsAuthenticated">
            <div class="side-body padding-top">
                <event-card [Event]="Event"></event-card>
                <div *ngIf="Attendees != null" class="row attendeeContainer">
                    <div *ngFor="let attendee of Attendees" class="col-xs-12 col-sm-6 col-md-6 col-lg-4 col-xl-3">
                        <attendee-card [ngClass]="{'green': attendee.CheckedIn, 'red': !attendee.CheckedIn}"  [Attendee]="attendee" ></attendee-card>
                    </div> 
                </div>
            </div>
        </ng-container>
    `,
    styles: [`
        .attendeeContainer { margin-top: 25px; }
    `]
})
export class EventDashboard implements OnInit, OnDestroy {

    private _parameterSubscription: Subscription = null;
    private _id: string;
    private _name: string;
    private _event: Event; 
    private _attendees: Array<Attendee>;

    public get EventId() { return this._id; }
    public get Event(): Event { return this._event; }
    public get Attendees(): Array<Attendee> { return this._attendees; }

    constructor(private _route: ActivatedRoute, private _config: AppConfigService, private _events: EventsService) { }

    public ngOnInit() {
        if(!this._config.IsAuthenticated && this._config.Authenticate(this._route.snapshot.url.toString()) == false) return;
        this._parameterSubscription = this._route.params.subscribe(params => {
            this._id = params['id'];
            this._name = params['name'];
            this._attendees = null;
            this._events.GetEvent(this._id).subscribe(e => this._event = e);
            this._events.GetAttendees(this._id).subscribe(a => this._attendees = a)
        });
    }

    public ngOnDestroy() {
        if (this._parameterSubscription) this._parameterSubscription.unsubscribe();
    }

}

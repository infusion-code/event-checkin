import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl} from '@angular/platform-browser';
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
                <div *ngIf="RegisteredAttendees != null && RegisteredAttendees.length > 0" class="row attendeeContainer align-items-start">
                    <h4>Registered Attendees</h4>
                    <div *ngFor="let attendee of RegisteredAttendees" class="col-xs-12 col-sm-6 col-md-6 col-lg-4 col-xl-3">
                        <attendee-card [ngClass]="{'green': attendee.CheckedIn, 'red': !attendee.CheckedIn}"  [Attendee]="attendee" [Event]="Event" (Checkout)="OnCheckout($event)" (Checkin)="OnCheckin($event)" ></attendee-card>
                    </div>
                </div> 
                <div *ngIf="CheckedInAttendees != null && CheckedInAttendees.length > 0" class="row attendeeContainer align-items-start">
                    <h4>CheckedIn Attendees</h4>
                    <div *ngFor="let attendee of CheckedInAttendees" class="col-xs-12 col-sm-6 col-md-6 col-lg-4 col-xl-3">
                        <attendee-card [ngClass]="{'green': attendee.CheckedIn, 'red': !attendee.CheckedIn}"  [Attendee]="attendee" [Event]="Event" (Checkout)="OnCheckout($event)" (Checkin)="OnCheckin($event)" ></attendee-card>
                    </div> 
                </div>
            </div>
        </ng-container>
        <iframe *ngIf="IFrameUrl != null" [src] = "IFrameUrl" class="invisibleiframe" ></iframe>
    `,
    styles: [`
        .attendeeContainer { margin-top: 25px; }
        .invisibleiframe { position: absolute; top: -100000px; }
    `]
})
export class EventDashboard implements OnInit, OnDestroy {
    private readonly _checkinUrl = "https://www.eventbrite.com/checkin_update?eid={0}&attendee={1}&quantity={2}";

    private _parameterSubscription: Subscription = null;
    private _id: string;
    private _name: string;
    private _event: Event; 
    private _checkedInAttendees: Array<Attendee>;
    private _registeredAttendees: Array<Attendee>;
    private _iframeUrl: SafeUrl;

    public get EventId() { return this._id; }
    public get Event(): Event { return this._event; }
    public get CheckedInAttendees(): Array<Attendee> { return this._checkedInAttendees; }
    public get RegisteredAttendees(): Array<Attendee> { return this._registeredAttendees; }
    private get IFrameUrl():SafeUrl { return this._iframeUrl; } 

    constructor(private _route: ActivatedRoute, private _config: AppConfigService, private _events: EventsService, private _sanitizer: DomSanitizer) { }

    public ngOnInit() {
        if(!this._config.IsAuthenticated && this._config.Authenticate(this._route.snapshot.url.toString()) == false) return;
        this._parameterSubscription = this._route.params.subscribe(params => {
            this._id = params['id'];
            this._name = params['name'];
            this._checkedInAttendees = null;
            this._registeredAttendees = null;
            this._events.GetEvent(this._id).subscribe(e => this._event = e);
            this._events.GetCheckedInAttendees(this._id).subscribe(a => this._checkedInAttendees = a);
            this._events.GetRegisteredAttendees(this._id).subscribe(a => this._registeredAttendees = a);    
        });
    }


    public OnCheckin(attendee: Attendee){
        let u:string = this._config.FormatString(this._checkinUrl,  this._event.Id, attendee.Id, 1);

        // The following will result in a console error about cross domain origin iframes, but the operation actually succeeds. 
        this._iframeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(u);
        console.log("The following X-Frame-Options error can be safely ignored. The payload executes fine, which is all we are interested in.");
        
        // preliminary set attended status prior to confirm
        attendee.CheckedIn = true;
        this._checkedInAttendees.push(attendee);
        this._checkedInAttendees.sort((a,b) => { 
                if (a.Name < b.Name) return -1; 
                if (a.Name > b.Name) return 1; 
                return 0;});
        this._registeredAttendees = this._registeredAttendees.filter((a:Attendee) => { return a.Id != attendee.Id; });
    }

    public OnCheckout(attendee: Attendee){
        let u:string = this._config.FormatString(this._checkinUrl,  this._event.Id, attendee.Id, 0);

        // The following will result in a console error about cross domain origin iframes, but the operation actually succeeds. 
        this._iframeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(u);
        console.log("The following X-Frame-Options error can be safely ignored. The payload executes fine, which is all we are interested in.");
        
        // preliminary set attended status prior to confirm
        attendee.CheckedIn = false;
        this._registeredAttendees.push(attendee);
        this._registeredAttendees.sort((a,b) => { 
                if (a.Name < b.Name) return -1; 
                if (a.Name > b.Name) return 1; 
                return 0;});
        this._checkedInAttendees = this._checkedInAttendees.filter((a:Attendee) => { return a.Id != attendee.Id; });
    }

    //private {}

    public ngOnDestroy() {
        if (this._parameterSubscription) this._parameterSubscription.unsubscribe();
    }

}

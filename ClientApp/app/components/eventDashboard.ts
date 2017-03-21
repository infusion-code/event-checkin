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
                <div class="attendeeSection">
                    <ng-container *ngIf="RegisteredAttendees != null && RegisteredAttendees.length > 0">
                        <a class="sectionheader" data-toggle="collapse" href="#registered_section"><h4>Registered Attendees</h4><span class="icon fa"></span></a>
                        <div class="row attendeeContainer align-items-start collapse in" id="registered_section">
                            <div *ngFor="let attendee of RegisteredAttendees" class="col-xs-12 col-sm-6 col-md-6 col-lg-4 col-xl-3" >
                                <attendee-card [ngClass]="{'green': attendee.CheckedIn, 'red': !attendee.CheckedIn}"  [Attendee]="attendee" [Event]="Event" (Checkout)="OnCheckout($event)" (Checkin)="OnCheckin($event)" ></attendee-card>
                            </div>
                        </div> 
                    </ng-container>
                    <ng-container *ngIf="CheckedInAttendees != null && CheckedInAttendees.length > 0">
                        <a class="sectionheader" data-toggle="collapse" href="#checked-in_section"><h4>CheckedIn Attendees</h4><span class="icon fa"></span></a>
                        <div class="row attendeeContainer align-items-start collapse in" id="checked-in_section">   
                            <div *ngFor="let attendee of CheckedInAttendees" class="col-xs-12 col-sm-6 col-md-6 col-lg-4 col-xl-3">
                                <attendee-card [ngClass]="{'green': attendee.CheckedIn, 'red': !attendee.CheckedIn}"  [Attendee]="attendee" [Event]="Event" (Checkout)="OnCheckout($event)" (Checkin)="OnCheckin($event)" ></attendee-card>
                            </div> 
                        </div>
                    </ng-container>
                </div>
            </div>
        </ng-container>
    `,
    styles: [`
        .attendeeSection { margin-top: 25px; }
        .attendeeContainer { margin-top: 0px; }
        a.sectionheader, a.sectionheader:hover, a.sectionheader:focus, a.sectionheader:active, a.sectionheader:visited { color: white; display: block; }
        a.sectionheader h4:after { font-family: FontAwesome; content: "\\f107"; padding-left: 5px; }
        a.sectionheader.collapsed h4:after { font-family: FontAwesome; content: "\\f106"; padding-left: 5px; }
        h4 { margin-bottom: 5px; }
        event-card { margin-bottom: 15px }
    `]
})
export class EventDashboard implements OnInit, OnDestroy {
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
            this._checkedInAttendees = new Array<Attendee>();
            this._registeredAttendees = new Array<Attendee>();
            this._events.GetEvent(this._id).subscribe(e => this._event = e);
            this._events.GetCheckedInAttendees(this._id).subscribe(a => { 
                this._checkedInAttendees = this._checkedInAttendees.concat(a); 
            });
            this._events.GetRegisteredAttendees(this._id).subscribe(a => { 
                this._registeredAttendees = this._registeredAttendees.concat(a); 
            });    
        });
    }


    public OnCheckin(attendee: Attendee){
        this._events.Checkin(this._event.Id, attendee.Id).subscribe(e => {
            attendee.CheckedIn = e;
            if(attendee.CheckedIn){
                this._checkedInAttendees.push(attendee);
                this._checkedInAttendees.sort((a,b) => { 
                    if (a.Name < b.Name) return -1; 
                    if (a.Name > b.Name) return 1; 
                    return 0;
                });
                this._registeredAttendees = this._registeredAttendees.filter((a:Attendee) => { return a.Id != attendee.Id; });
            }
        });
    }

    public OnCheckout(attendee: Attendee){
        this._events.Checkout(this._event.Id, attendee.Id).subscribe(e => {
            attendee.CheckedIn = e;
            if(!attendee.CheckedIn){
                this._registeredAttendees.push(attendee);
                this._registeredAttendees.sort((a,b) => { 
                        if (a.Name < b.Name) return -1; 
                        if (a.Name > b.Name) return 1; 
                        return 0;});
                this._checkedInAttendees = this._checkedInAttendees.filter((a:Attendee) => { return a.Id != attendee.Id; });
            }
        });
    }

    public ngOnDestroy() {
        if (this._parameterSubscription) this._parameterSubscription.unsubscribe();
    }

}

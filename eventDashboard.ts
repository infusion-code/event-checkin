import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
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
                <event-card [Event]="Event" (Launch)="OnEventLaunch($event)"></event-card>
                <div class="attendeeSection">
                    <div class="registerAttendeeBadge" title="Register Attendee" (click)="OnNewRegistrant()"><span class="icon fa fa-plus fa-plus-square-o"></span></div>
                    <ng-container *ngIf="RegisteredAttendees != null && RegisteredAttendees.length > 0">
                        <a class="sectionheader" data-toggle="collapse" href="#registered_section"><h4>Registered Attendees ({{RegisteredAttendees.length}})</h4><span class="icon fa"></span></a>
                        <div class="row attendeeContainer align-items-start collapse in" id="registered_section"> 
                            <div *ngFor="let attendee of RegisteredAttendees" class="col-xs-12 col-sm-6 col-md-6 col-lg-4 col-xl-3" >
                                <attendee-card [ngClass]="{'green': attendee.CheckedIn, 'red': !attendee.CheckedIn}"  [Attendee]="attendee" [Event]="Event" (Checkout)="OnCheckout($event)" (Checkin)="OnCheckin($event)" ></attendee-card>
                            </div>
                        </div> 
                    </ng-container>
                    <ng-container *ngIf="CheckedInAttendees != null && CheckedInAttendees.length > 0">
                        <a class="sectionheader" data-toggle="collapse" href="#checked-in_section"><h4>CheckedIn Attendees ({{CheckedInAttendees.length}})</h4><span class="icon fa"></span></a>
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
        .registerAttendeeBadge { float: right; font-size: 24px; line-height: 24px; }
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
    private _checkedinSubscription: Subscription = null;
    private _registeredSubscription: Subscription = null;
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

    constructor(private _router: Router, private _route: ActivatedRoute, private _config: AppConfigService, private _events: EventsService, private _sanitizer: DomSanitizer) { }

    public ngOnInit() {
        if(!this._config.IsAuthenticated && this._config.Authenticate(document ? document.location.pathname : "") == false) return;
        this._parameterSubscription = this._route.params.subscribe(params => {
            this._id = params['id'];
            this._name = params['name'];
            this._checkedInAttendees = new Array<Attendee>();
            this._registeredAttendees = new Array<Attendee>();
            this._events.GetEvent(this._id).subscribe(e => this._event = e);
            
            if(this._registeredSubscription) this._registeredSubscription.unsubscribe();
            if(this._checkedinSubscription) this._checkedinSubscription.unsubscribe();
            this._registeredSubscription = this._events.GetRegisteredAttendees(this._id).subscribe(a => { 
                this._registeredAttendees = this._registeredAttendees.concat(a).sort((a,b) => { 
                        if (a.Name < b.Name) return -1; 
                        if (a.Name > b.Name) return 1; 
                        return 0;}); 
            }); 
            this._checkedinSubscription = this._events.GetCheckedInAttendees(this._id).subscribe(a => { 
                this._checkedInAttendees = this._checkedInAttendees.concat(a).sort((a,b) => { 
                        if (a.Name < b.Name) return -1; 
                        if (a.Name > b.Name) return 1; 
                        return 0;}); 
            });   
        });
    }

    public OnNewRegistrant(){
        if(window) window.open(this._event.DetailUrl, "eventbritereg");;
    }

    public OnCheckin(attendee: Attendee){
        attendee.UpdateInProgress = true;
        this._events.Checkin(this._event.Id, attendee).subscribe(e => {
            attendee.CheckedIn = e;
            if(attendee.CheckedIn && this._checkedInAttendees.find(a => a.Id === attendee.Id) == null){
                this._checkedInAttendees.push(attendee);
                this._checkedInAttendees = this._checkedInAttendees.sort((a,b) => { 
                    if (a.Name < b.Name) return -1; 
                    if (a.Name > b.Name) return 1; 
                    return 0;
                });
                this._registeredAttendees = this._registeredAttendees.filter((a:Attendee) => { return a.Id != attendee.Id; });
            }
            attendee.UpdateInProgress = false;
        });
    }

    public OnCheckout(attendee: Attendee){
        attendee.UpdateInProgress = true;
        this._events.Checkout(this._event.Id, attendee).subscribe(e => {
            attendee.CheckedIn = e;
            if(!attendee.CheckedIn && this._registeredAttendees.find(a => a.Id === attendee.Id) == null){
                this._registeredAttendees.push(attendee);
                this._registeredAttendees = this._registeredAttendees.sort((a,b) => { 
                        if (a.Name < b.Name) return -1; 
                        if (a.Name > b.Name) return 1; 
                        return 0;});
                this._checkedInAttendees = this._checkedInAttendees.filter((a:Attendee) => { return a.Id != attendee.Id; });
            }
            attendee.UpdateInProgress = false;
        });
    }

    public OnEventLaunch(){
        this._router.navigateByUrl("/greeter/" + this._event.Id);
    }

    public ngOnDestroy() {
        if (this._parameterSubscription) this._parameterSubscription.unsubscribe();
        if (this._checkedinSubscription) this._checkedinSubscription.unsubscribe();
        if (this._registeredSubscription) this._registeredSubscription.unsubscribe();
    }

}

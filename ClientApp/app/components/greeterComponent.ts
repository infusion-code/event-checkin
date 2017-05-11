import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, Subscription } from 'rxjs';
import { Event } from '../models/event';
import { Attendee } from '../models/attendee';
import { AppConfigService } from '../services/configService';
import { GreeterService } from '../services/greeterService';
import { EventsService } from '../services/eventsService';

@Component({
    selector: 'greeter',
    template: `
        <div class="side-body" [ngStyle]="{'background-image': Event &&  Event.ImageUrl && Event.ImageUrl != '' ? 'url(' + Event.ImageUrl + ')' : ''}">
            <div class="overlay"></div>
            <div class="greeting-outer-container">
                <div class="event-info-container">
                    <div class="exit" (click)="ExitGreeter()"><span class="icon fa fa-arrow-circle-o-left"></span></div>
                    <ng-container *ngIf="Event != null">
                        <div class="eventInfoOverlay">
                            <div class="title"><span [innerHTML]='Event.NameAsHtml'></span><a class="expandToggle" data-toggle="collapse" href=".description"></a></div>
                            <div class="description collapse in" [innerHTML]='Event.DescriptionAsHtml'></div>
                        </div>
                        <div class="eventInfo">
                            <div class="title"><span [innerHTML]='Event.NameAsHtml'></span><a class="expandToggle" data-toggle="collapse" href=".description"></a></div>
                            <div id="event-description" class="description collapse in" [innerHTML]='Event.DescriptionAsHtml'></div>
                        </div>
                    </ng-container>
                </div>
                <div class="greeting animated zoomIn" *ngIf="Notices.length > 0" >
                    <div class="spacer"></div>
                    <div class="stem">
                        <span *ngIf="Notices[0].type == 'checkin'">Look who's just arrived...</span>
                        <span *ngIf="Notices[0].type == 'checkout'">Leaving the party...</span>
                    </div>
                    <attendee-card [ngClass]="{'green': Notices[0].type=='checkin', 'red': Notices[0].type=='checkout'}"  [UseHeroStyling]="true" [Attendee]="Notices[0].attendee" [ShowAction]="false"></attendee-card>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .side-body {font-size: 10pt; position: fixed; top: 0; left: 0; bottom: 0; right: 0; z-index: 100000; background-color: black; padding: 0px!important; margin: 0px!important; background-position: center; background-size: cover; background-repeat: no-repeat; }
        .greeting-outer-container { height: 100%; display: flex; flex-direction: column; }
        .title { font-size: 2em; padding: 20px 20px 10px 20px;  }
        .description {font-size: 1em; padding: 0px 20px 10px 20px; }
        .expandToggle{ color: white; font-weight: 700; margin-left: 20px; }
        .expandToggle:after { font-family: FontAwesome; content: "\\f106" }
        .expandToggle.collapsed:after { font-family: FontAwesome; content: "\\f107" }
        .exit { position: relative; z-index: 10; float: right; font-size: 2em; padding: 20px 25px 10px 25px }
        .eventInfo { position: relative; }
        .eventInfoOverlay { position: absolute; background-color: black; opacity: 0.6; left: 0px; right: 0px; }
        .eventInfoOverlay * { visibility: hidden; }
        .overlay { width: 100%; height: 100%; background-color: black; opacity: 0.3; position: absolute; }
        .greeting { background-color: rgba(0,0,0,0.3); position: relative; top: 0; left: 0; bottom: 0; right: 0; padding: 2em; display: flex; flex-direction: column;  flex-grow: 1; align-items: flex-start; font-size: 2em; line-height: 2em; }
        .green { background-color: #0d6f2b }
        .red { background-color: #df6868 }
        .spacer {flex-grow: 0.35}
        .stem { padding: 0.75em 0}
        attendee-card { }
        attendee-card /deep/ .nocompany { display: block !Important; }
        @media screen and (min-aspect-ratio: 4/4){
            .expandToggle { display: none; }
            .greeting-outer-container { flex-direction: row; }
            .eventInfoOverlay { bottom: 0px; top: 0px; }
            .event-info-container { position: relative; max-width: 35% } 
        }
        @media (max-width: 549px){.side-body {font-size: 8pt; }}
        @media (min-width: 550px){.side-body {font-size: 10pt; }}
        @media (min-width: 768px){.side-body {font-size: 12pt; }}
        @media (min-width: 992px){.side-body {font-size: 14pt; }}
        @media (min-width: 1200px){.side-body {font-size: 16pt;}}
        @media (min-width: 1900px){.side-body {font-size: 18pt;}}
        @media screen and (max-aspect-ratio: 4/4) and (max-height: 610px) and (max-width: 549px), screen and (max-height: 745px) and (max-width: 767px){ .description, .expandToggle { display: none;}}
        @media screen and (min-aspect-ratio: 4/4) and (max-height: 400px ){ .description { display: none;}}
        @media screen and (min-aspect-ratio: 4/4) and (max-width: 767px) { .event-info-container { max-width: 25% }}
        @media screen and (min-aspect-ratio: 4/4) and (min-width: 768px) and (max-width: 900px) { 
            .title { font-size: 1.6em; }
            .description { font-size: 0.75em; display: block; }
            .greeting { font-size: 1.5em; }
        }}

    `]
})
export class GreeterComponent implements OnInit, OnDestroy {
    private _notices: Array<any> = new Array<any>(); 
    private _parameterSubscription: Subscription = null;
    private _event: Event = null;
    private _id: string;
    private _timer: Observable<number> = Observable.interval(15000);
    private _timerSubscription: Subscription = null;
    public get Notices(): Array<any> { return this._notices; }
    public get Event():Event { return this._event; }

    constructor(private _config: AppConfigService, private _router: Router, private _route: ActivatedRoute, private _greeter: GreeterService, private _events: EventsService, private _change: ChangeDetectorRef) { }
    
    private ExitGreeter(){
        if(this._event){
            this._router.navigateByUrl(this._config.FormatString("/events/{0}/{1}", this._event.Id, this._event.Name));
        }
        else{
            this._router.navigateByUrl("/");
        }
    }

    public ngOnInit() {
        if(!this._config.IsAuthenticated && this._config.Authenticate(document ? document.location.pathname : "") == false) return;
        this._greeter.Notifications.subscribe(s => {
            if(s.type == "checkin" || s.type == "checkout") {
                this._notices.push(s);
                if(this._timerSubscription == null){
                    this._timerSubscription = this._timer.subscribe(t => { 
                        this._notices.splice(0, 1 )
                        if(this._notices.length == 0) {
                            this._timerSubscription.unsubscribe();
                            this._timerSubscription = null;
                        }
                        this._change.detectChanges();
                    });
                    this._change.detectChanges();
                };
            }
        });

        // determine if we have an event from the route...
        this._parameterSubscription = this._route.params.subscribe(params => {
            this._id = params['id'];
            if(this._id) {
                this._events.GetEvent(this._id).subscribe(e => this._event = e);
            }
        });
    }

    public ngOnDestroy(){
        if(this._parameterSubscription)  this._parameterSubscription.unsubscribe();
        if(this._timerSubscription) this._timerSubscription.unsubscribe();
        this._greeter.CloseSSEChannel();
    }

}

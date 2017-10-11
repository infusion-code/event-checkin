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
            <img class="logo top" src="https://cdn2.xamarin.com/consulting-partners/Infusion_Logo_200px.png">
            <div class="greeting-outer-container">
                <div class="event-info-container">
                    <div class="exit" (click)="ExitGreeter()"><span class="icon fa fa-arrow-circle-o-left"></span></div>
                    <ng-container *ngIf="Event != null">
                        <div class="eventInfoOverlay">
                            <div class="title"><span [innerHTML]='Event.NameAsHtml'></span>
                                <a class="expandToggle" [ngClass]="{'collapsed': Collapsed}" data-toggle="collapse" href=".description" (click)="ToggleCollapse()"></a>
                            </div>
                            <div class="description collapse" [innerHTML]='Event.DescriptionAsHtml'></div>
                        </div>
                        <div class="eventInfo">
                            <div class="title">
                                <span [innerHTML]='Event.NameAsHtml'></span>
                                <a class="expandToggle" [ngClass]="{'collapsed': Collapsed}" data-toggle="collapse" href=".description" (click)="ToggleCollapse()"></a>
                            </div>
                            <div id="event-description" class="description collapse" [innerHTML]='Event.DescriptionAsHtml'></div>
                        </div>
                    </ng-container>
                </div>
                <div class="greeting zoomIn" *ngIf="Notices.length > 0" >
                    <div class="spacer"></div>
                    <div class="stem">
                        <span *ngIf="Notices[0].type == 'checkin'">Thanks for joining us,</span>
                        <span *ngIf="Notices[0].type == 'checkout'">Thanks for attending,</span>
                    </div>
                    <div class="hero name">
                        {{Notices[0].attendee.Name}}
                    </div>
                    <div class="hero email">
                        {{Notices[0].attendee.Email}}
                    </div>
                </div>
                <div class="footer">
                    <ng-container *ngIf="Event != null">
                        <div class="exit" (click)="ExitGreeter()"><span class="icon fa fa-arrow-circle-o-left"></span></div>
                        <div class="title">
                            <span [innerHTML]='Event.NameAsHtml'></span>
                            <a class="expandToggle" [ngClass]="{'collapsed': Collapsed}" data-toggle="collapse" href=".description" (click)="ToggleCollapse()"></a>
                        </div>
                    </ng-container>
                </div>
                <div class="countdown">
                    <span *ngIf="Seconds === -2">The event is over.</span>
                    <span *ngIf="Seconds === -1">The event is in progress.</span>
                    <span *ngIf="Seconds >= 0 && Hours < 24">
                        Begins today in <span class="highlight">{{MinTwoDigits(Hours)}}</span>:<span class="highlight">{{MinTwoDigits(Minutes)}}</span>:<span class="highlight">{{MinTwoDigits(Seconds)}}</span>.
                    </span>
                    <span *ngIf="Seconds >= 0 && Hours >= 24">
                        Begins in <span class="highlight">{{Floor(Hours/24)}}</span> days, <span class="highlight">{{MinTwoDigits(Hours%24)}}</span>:<span class="highlight">{{MinTwoDigits(Minutes)}}</span>:<span class="highlight">{{MinTwoDigits(Seconds)}}</span>.
                    </span>
                    <img class="logo bottom" src="https://cdn2.xamarin.com/consulting-partners/Infusion_Logo_200px.png">
                </div>
            </div>
        </div>
    `,
    styles: [`
        .side-body {font-size: 10pt; position: fixed; top: 0; left: 0; bottom: 0; right: 0; z-index: 100000; background-color: black; padding: 0px!important; margin: 0px!important; background-position: center; background-size: cover; background-repeat: no-repeat; }
        .greeting-outer-container { height: 100%; display: flex; flex-direction: column; }
        .title { font-size: 2em; padding: 20px 20px 10px 20px;  }
        .logo { height: 1.3em; float: right; }
        .logo.top { display: none; }
        .description {font-size: 1em; padding: 0px 20px 10px 20px; }
        .expandToggle{ color: white; font-weight: 700; margin-left: 5px; }
        .expandToggle:after { font-family: FontAwesome; content: "\\f107" }
        .expandToggle.collapsed:after { font-family: FontAwesome; content: "\\f106" }
        .exit { position: relative; z-index: 10; float: left; font-size: 2em; padding: 20px 25px 10px 20px }
        .eventInfo { position: relative; }
        .eventInfoOverlay { position: absolute; background-color: black; opacity: 0.6; left: 0px; right: 0px; }
        .eventInfoOverlay * { visibility: hidden; }
        .countdown { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 25px 20px 20px; background-color: rgba(0,0,0,0.3); font-size:2em; color: #bbb; font-weight: 300}
        .countdown .highlight { color: #fff }
        .footer { display: none; position: absolute; bottom: 0; left: 0; right: 40%; padding: 20px 25px 20px 20px; background-color: rgba(25, 154, 214, 0.76); font-size:2em; color: #fff; font-weight: 300 }
        .footer .title { padding: 0px; font-size: 1em; }
        .footer .exit { font-size: 1em; font-weight: 300; padding: 0 15px 0 0; }
        .overlay { width: 100%; height: 100%; background-color: black; opacity: 0.3; position: absolute; }
        .greeting { background-color: rgba(0,0,0,0.3); position: relative; top: 0; left: 0; bottom: 0; right: 0; padding: 2em; display: flex; flex-direction: column;  flex-grow: 1; align-items: flex-start; font-size: 2em; line-height: 2em; }
        .green { background-color: #0d6f2b }
        .red { background-color: #df6868 }
        .spacer {flex-grow: 0.35}
        .stem { padding: 0.75em 0 0.1em 0; color: #ccc}
        .hero.name { font-size: 2em; color: #fff }
        .hero.email { font-size: 0.8em; color: #ccc}
        attendee-card { }
        attendee-card /deep/ .nocompany { display: block !Important; }
        @media screen and (min-aspect-ratio: 4/4){
            .expandToggle { font-weight: 300; position: relative; top: -2px; margin-left: 5px; font-size: 0.8em }
            .greeting-outer-container { flex-direction: row; }
            .eventInfoOverlay { bottom: 0px; top: 0px; }
            .eventInfoOverlay .title, .eventInfo .title { display: none; }
            .eventInfo { padding-top: 25px; }
            .event-info-container { position: relative; max-width: 35%; } 
            .event-info-container .exit { display: none; }
            .logo.bottom { display: none; }
            .logo.top { display: block; position: absolute; right: 0; height: 5em; padding: 1em; }
            .countdown { left: 60% }
            .footer { display: block; }
            .stem {font-size: 1.3em; }
            .hero.name { font-size: 3em; }
            .hero.email { font-size: 1em;}
        }
        @media (max-width: 559px){.side-body {font-size: 5.5pt; }}
        @media (min-width: 560px){.side-body {font-size: 6pt; }}
        @media (min-width: 560px){.side-body {font-size: 6.5pt; }}
        @media (min-width: 625px){.side-body {font-size: 7pt; }}
        @media (min-width: 700px){.side-body {font-size: 8pt; }}
        @media (min-width: 780px){.side-body {font-size: 9pt; }}
        @media (min-width: 875px){.side-body {font-size: 10pt; }}
        @media (min-width: 925px){.side-body {font-size: 11pt; }}
        @media (min-width: 1000px){.side-body {font-size: 12pt; }}
        @media (min-width: 1070px){.side-body {font-size: 13pt; }}
        @media (min-width: 1170px){.side-body {font-size: 14pt; }}
        @media (min-width: 1220px){.side-body {font-size: 15pt;}}
        @media (min-width: 1320px){.side-body {font-size: 16pt;}}
        @media (min-width: 1440px){.side-body {font-size: 17pt;}}
        @media (min-width: 1500px){.side-body {font-size: 18pt;}}       
        @media (min-width: 1650px){.side-body {font-size: 19pt;}}
        @media screen and (max-aspect-ratio: 4/4) and (max-height: 610px) and (max-width: 549px), screen and (max-height: 745px) and (max-width: 767px){ .description, .expandToggle { display: none;}}
        @media screen and (min-aspect-ratio: 4/4) and (max-height: 400px ){ .description { display: none;}}
        @media screen and (min-aspect-ratio: 4/4) and (max-width: 767px) { .event-info-container { max-width: 25% }}
        @media screen and (min-aspect-ratio: 4/4) and (min-width: 768px) and (max-width: 900px) { 
            .title { font-size: 1.6em; }
            .description { font-size: 0.75em; }
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
    private _countdownSubscription: Subscription = null;
    private _collapsed: boolean = false;
    private _hours: number = 0;
    private _minutes:number = 0;
    private _seconds: number = -3;

    public get Notices(): Array<any> { return this._notices; }
    public get Event():Event { return this._event; }
    public get Collapsed(): boolean { return this._collapsed; }
    public get Hours(): number { return this._hours; }
    public get Minutes(): number { return this._minutes; }
    public get Seconds(): number { return this._seconds; }

    constructor(private _config: AppConfigService, private _router: Router, private _route: ActivatedRoute, private _greeter: GreeterService, private _events: EventsService, private _change: ChangeDetectorRef) { }
    
    private ExitGreeter(){
        if(this._event){
            this._router.navigateByUrl(this._config.FormatString("/events/{0}/{1}", this._event.Id, this._event.Name));
        }
        else{
            this._router.navigateByUrl("/");
        }
    }

    private SetupCountDownTimer() {
        // setup countdow timer
        this._minutes = 0;
        this._hours = 0;
        let start: Date = this.Event.Start;
        let end: Date = this.Event.End;
        if(start > new Date() || end > new Date()) {
            this._countdownSubscription = Observable.interval(1000)
                .subscribe((x) => {
                    this._minutes = 0;
                    this._hours = 0;
                    const diff: number = start.valueOf() - new Date().valueOf();
                    if(diff > 0) {
                        this._hours = Math.floor(diff/(1000*60*60));
                        this._minutes = Math.floor(diff/(1000*60)%60);
                        this._seconds = Math.floor(diff/(1000)%60);
                    }
                    else if(end && end > new Date()) {
                        this._seconds = -1;
                    }
                    else{
                        this._seconds = -2;
                        this._countdownSubscription.unsubscribe();
                        this._countdownSubscription = null;
                    }
                });
        }
        else {
            this._seconds = -2;
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
                this._events.GetEvent(this._id).subscribe(e => {
                    this._event = e;
                    this.SetupCountDownTimer();
                });
            }
        });
    }

    public ngOnDestroy(){
        if(this._parameterSubscription)  this._parameterSubscription.unsubscribe();
        if(this._timerSubscription) this._timerSubscription.unsubscribe();
        if(this._countdownSubscription) this._countdownSubscription.unsubscribe();
        this._greeter.CloseSSEChannel();
    }

    public ToggleCollapse() {
        this._collapsed = !this._collapsed;
    }

    public MinTwoDigits(n: number): string {
        return (n < 10 ? '0': '') + n;
    }

    public Floor(n:number): number {
        return Math.floor(n);
    }

}

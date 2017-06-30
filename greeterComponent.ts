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
            <img class="logo" src="https://cdn2.xamarin.com/consulting-partners/Infusion_Logo_200px.png">
            <div class="footer1">Houston Live</div>
            <div class="footer3"><span style="color:#9E9E9E">Begins today in </span><b>{{Fhours}}</b> <span style="color:#9E9E9E">hr</span> <b>{{Fmin}}</b> <span style="color:#9E9E9E">min.</span></div>
            <div class="greeting-outer-container">
                <div class="event-info-container">
                    <div class="exit" (click)="ExitGreeter()"><span class="icon fa fa-arrow-circle-o-left"></span></div>
                    <ng-container *ngIf="Event != null">
                        <div [style.display]="Ntext?'none':'inherit'" class="eventInfoOverlay">
                            <div class="title"><span [innerHTML]='Event.NameAsHtml'></span><a class="expandToggle" data-toggle="collapse" href=".description"></a></div>
                            <div class="description collapse in" [innerHTML]='Event.DescriptionAsHtml'></div>
                        </div>
                        <div [style.visibility]="Ntext?'hidden':'visible'" class="eventInfo">
                            <div class="title"><span [innerHTML]='Event.NameAsHtml'></span><a class="expandToggle" data-toggle="collapse" href=".description"></a></div>
                            <div id="event-description" class="description collapse in" [innerHTML]='Event.DescriptionAsHtml'></div>
                        </div>
                    </ng-container>
                    <button class="footer2" (click)="PullUpInfo()">{{Event.Footer2}}</button>
                    <div class="blackbox"></div>
                </div>
                <div class="greeting animated zoomIn" *ngIf="Notices.length > 0" >
                    <div class="greetoverlay"></div>
                    <div class="spacer"></div>
                    <div class="stem">
                        <span *ngIf="Notices[0].type == 'checkin'">Thank's for joining us,</span>
                        <span *ngIf="Notices[0].type == 'checkout'">Leaving the party...</span>
                    </div>
                    <attendee-card [class.green]="Notices[0].type=='checkin'" [class.red]="Notices[0].type=='checkout'"
                    [UseHeroStyling]="true" [Attendee]="Notices[0].attendee" [ShowAction]="false" [EmailPadding]="35"
                    [NameSize]="9.5" [EmailSize]="3.5" [hidePic]="true" [FirstPadding]="35" [LastPadding]="35"></attendee-card>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .logo {position:absolute; width:17%}
        .blackbox {background-color: black; height: 1.3%; width: 4000px; position: absolute ;bottom:0px; left:0px;}
        .footer1 {background-color: #1565C0; height: 12%; width: 28%;padding: 20px; text-align: center; font-size: 2.7em; position: absolute; bottom: 10px;}
        .footer2 {background-color: #039BE5; height: 12%; width: 90%; text-align: center; font-size: 26pt; position: absolute; bottom: 10px; left: 80%; border: none}
        .footer3 {background-color: #616161; height: 12%; width: 48%; font-size: 30pt; position: absolute; bottom: 10px; right: -5%; padding: 20px; background: rgba(0,0,0,.6); text-align: center;}
        .F3Overlay {background-color: black; position: absolute; opacity:0.6 ;height: 12%; width: 100%; bottom: 10px; left: 900px }
        .Fhours {position: absolute; font-size:30pt; bottom:28px; left: 1200px}
        .Fmin {position: absolute; font-size:30pt; bottom: 28px; left: 1304px}
        .side-body {font-size: 10pt; position: fixed; top: 0; left: 0; bottom: 0; right: 0; z-index: 100000; background-color: black; padding: 0px!important; margin: 0px!important; background-position: center; background-size: cover; background-repeat: no-repeat; }
        .greeting-outer-container { height: 100%; display: flex; flex-direction: column; }
        .title { font-size: 3em; padding: 20px 20px 10px 20px;  }
        .description {font-size: 1.5em; padding: 0px 20px 10px 20px; max-height:24em; overflow:hidden; }
        .expandToggle{ color: white; font-weight: 700; margin-left: 20px;}
        .expandToggle:after { font-family: FontAwesome; content: "\\f106" }
        .expandToggle.collapsed:after { font-family: FontAwesome; content: "\\f107" }
        .exit { position: relative; z-index: 10; float: right; font-size: 2em; padding: 20px 25px 10px 25px }
        .eventInfo { position: relative;}
        .eventInfoOverlay { position: absolute; background-color: black; opacity: 0.6; left: 0px; right: 0px; height:86.8% }
        .eventInfoOverlay * { visibility: hidden; }
        .overlay { width: 100%; height: 100%; background-color: black; opacity: 0.3; position: absolute; }
        .greeting {position: fixed; top:42%; left:67.5%;transform:translate(-50%,-50%);padding: 0em; display: flex; flex-direction: column;  flex-grow: 1; align-items: flex-start; font-size: 2em; line-height: 2em; height: 89.5%; width:65%; background-color: rgba(0,0,0,.3)}
        .green { background-color: transparent; }
        .red { background-color: transparent; }    
        .spacer {flex-grow: 0.35}
        .stem { padding:15px 45px; font-size: 2.5em}
        attendee-card { }
        attendee-card /deep/ .nocompany { display: block !Important; }
        @media (min-aspect-ratio: 4/4){
            .expandToggle { display: none; }
            .greeting-outer-container { flex-direction: row; }
            .eventInfoOverlay { bottom: 0px; top: 0px; }
            .event-info-container { position: relative; max-width: 35% } 
        }
    @media  (max-width:479px){
            .title { font-size: 4vh; padding: 20px 20px 10px 20px;}
            .description {font-size: 2.1vh; max-height: 60%; overflow: hidden}
            .side-body {font-size: 4pt; }
            .footer1{visibility: hidden;}
            .footer2 {background-color: #039BE5; height: 9%; width: 100%; bottom: 8.5%; left: 0px; border: none; font-size: 3em;text-align: center;}
            .footer3 {height: 10%; width: 100%; font-size: 3.5em; position: absolute; bottom: 0px; left: 0px; padding: 20px 12px 0px 0px; text-align: center}
            .F3Overlay {background-color: black; position: absolute; opacity:0.6 ;height: 12%; width: 100%; bottom: 3px; left: 0px }
            .exit { position: relative; z-index: 10; float: right; font-size: 18pt; padding: 20px 25px 10px 25px }
            .greeting{top:48%; left:72%; margin-top:-50px; margin-left:-80px; width:104%; background-color: rgba(0,0,0,.5); height: 84%}
            .stem{font-size:2.5em}
}
       @media (min-width:480px) and (max-width:736px){
            .side-body {font-size: 12pt; }
            .blackbox {visibility: hidden}
            .title { font-size:4.5vh; padding: 20px 20px 10px 20px; width:25%}
            .description {font-size: 3.75vh; max-height: 84%; overflow: hidden; position: fixed; left:25%; top:0px; max-width: 75%; background: rgba(0,0,0,.6);padding: 10px}
            .side-body {font-size: 4pt; }
            .footer1{visibility: hidden;}
            .footer2 {background-color: #039BE5; position: fixed; height: 16%; width: 50%; bottom: 0px; left: 0px; border: none; font-size: 3.5em;text-align: center;padding: 0px 0px 0px}
            .footer3 {position: fixed; height: 16%; width: 50%; font-size: 3.5em; position: absolute; bottom: 0px; left: 50%;padding: 20px 0px;}
            .exit { position: absolute; font-size: 18pt; padding: 0px 0px 0px; left:60%; padding:10px }
            .greeting{ position: absolute; height:84.7%; left:76%; width:100%; background-color:rgba(0,0,0,.5); display: flex }
            .stem{ font-size:3em}
            .eventInfoOverlay { position: fixed; background-color: black; opacity: 0.6; left: 0px; right: 0px; height:87%; width:25%}
        }
           @media (min-width:737px) and (max-width:899px){
            .side-body {font-size: 12pt; }
            .blackbox {visibility: hidden}
            .title { font-size: 4vh; padding: 20px 20px 10px 20px; width:25%}
            .description {font-size: 2.7vh; max-height: 84%; overflow: hidden; position: fixed; left:35%; top:0px; max-width: 65%; background: rgba(0,0,0,.6);}
            .side-body {font-size: 4pt; }
            .footer1{visibility: hidden;}
            .footer2 {background-color: #039BE5; position: fixed; height: 16%; width: 50%; bottom: 0px; left: 0px; border: none; font-size: 4em;text-align: center;padding: 0px 0px 50px}
            .footer3 {position: fixed; height: 16%; width: 50%; font-size: 4em; position: absolute; bottom: 0px; left: 50%;padding: 7px 0px; opacity:.99}
            .F3Overlay {background-color: black; position: absolute; opacity:0.6 ;height: 12%; width: 100%; bottom: 3px; left: 0px }
            .exit { position: absolute; font-size: 18pt; padding: 0px 0px 0px 25px; left:45%; }
            .greeting{ position: absolute; height:85%; left:83%; width:100%; background-color:rgba(0,0,0,.5)}
            .stem{ font-size:4em}
            .eventInfoOverlay { position: fixed; background-color: black; opacity: 0.6; left: 0px; right: 0px; height:86%; width:35%}
            }
   
@media (min-width:900px) and (max-width: 1260px){
            .side-body {font-size: 12pt; }
            .description {font-size: 3.1vh; max-height: 88%; overflow: hidden; position: fixed; left:35%; top:0px;max-width: 67%;background: rgba(0,0,0,.6);}
            .footer1{visibility: hidden;}
            .footer2 {background-color: #039BE5; position: fixed; height: 13.1%; width: 50%; bottom: 0px; left: 0px; border: none; font-size: 21pt;text-align: center;}
            .footer3 {position: fixed; height: 13.2%; width: 50%; font-size: 21pt; position: absolute; bottom: 0px; left: 50%;padding: 37px 10px;
            .F3Overlay {background-color: black; position: absolute; opacity:0.6 ;height: 12%; width: 100%; bottom: 3px; left: 0px }
            .exit { position: relative; z-index: 10; float: right; font-size: 18pt; padding: 0px 0px 0px 25px }
            .eventInfoOverlay { position: fixed; background-color: black; opacity: .6; left: 0px; right: 0px; height:103%; width: 90% }
            .title { font-size: 4vh; padding: 20px 20px 10px 20px; position: relative; width: 20%;}
            .exit { position: absolute; z-index: 10;  font-size: 4em; padding: 20px 25px 10px 25px; left:25%; }
            .greeting{ position: fixed; left:10% !important;}
}
        @media (min-width: 1200px){.side-body {font-size: 16pt;}}
        @media (min-width: 1900px){.side-body {font-size: 18pt;}}
        @media screen and (max-aspect-ratio: 4/4) and (max-height: 610px) and (max-width: 549px), screen and (max-height: 745px) and (max-width: 767px){
            .expandToggle { display: none;}}
        @media screen and (min-aspect-ratio: 4/4) and (max-height: 400px ){ }
        @media screen and (min-aspect-ratio: 4/4) and (max-width: 767px) { .event-info-container { max-width: 25% }}
        @media screen and (min-aspect-ratio: 4/4) and (min-width: 768px) and (max-width: 900px) { }

    `],
})
export class GreeterComponent implements OnInit, OnDestroy {
    private _notices: Array<any> = new Array<any>(); 
    private _parameterSubscription: Subscription = null;
    private _event: Event = null;
    private _id: string;
    private _timer: Observable<number> = Observable.interval(15000);
    private _timerSubscription: Subscription = null;
    private _start:Date;
    public get Notices(): Array<any> { return this._notices; }
    public get Event():Event { return this._event; }
    public get Start(): Date { return this._start; }
    private eventDate;
    private Sevent: Event;
    private diff:number;
    private days:number;
    private hours: number;
    private min:number;
    private sec:number;
    private Fhours;
    private Fmin;
    //make textbox appear and disappear
    private Ntext: boolean;
 



    constructor(private _config: AppConfigService, private _router: Router, private _route: ActivatedRoute, private _greeter: GreeterService, private _events: EventsService, private _change: ChangeDetectorRef) { }
    
    private ExitGreeter(){
        if(this._event){
            this._router.navigateByUrl(this._config.FormatString("/events/{0}/{1}", this._event.Id, this._event.Name));
        }
        else{
            this._router.navigateByUrl("/");
        }
    }
    private PullUpInfo(){
        if(this.Ntext){
            this.Ntext=false;
        }
        else{
            this.Ntext=true;
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
        // countdown timer
        this.eventDate=this.Event.Start;
        Observable.interval(1000).map((x)=>{
            this.diff= Date.parse(this.eventDate)- Date.parse(new Date().toString());
        }).subscribe((x)=>{
            this.days=Math.floor(this.diff/(1000*60*60*24));
            this.hours=Math.floor(this.diff/(1000*60*60)%24);
            this.min=Math.floor(this.diff/(1000*60)%60);
            this.sec=Math.floor(this.diff/(1000)%60);

            this.Fhours=minTwoDigits(this.hours);
            this.Fmin= minTwoDigits(this.min);
        })
        function minTwoDigits(n){
            return(n < 10 ? '0': '')+n;
        }
        function createFooter2(n){

        }
    }

    public ngOnDestroy(){
        if(this._parameterSubscription)  this._parameterSubscription.unsubscribe();
        if(this._timerSubscription) this._timerSubscription.unsubscribe();
        this._greeter.CloseSSEChannel();
    }

}

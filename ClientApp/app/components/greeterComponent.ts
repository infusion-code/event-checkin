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
            <div class="greeting" *ngIf="Notices.length > 0" [ngClass]="{'green': Notices[0].type=='checkin', 'red': Notices[0].type=='checkout'}" >
                <span *ngIf="Notices[0].type == 'checkin'">{{Notices[0].attendee.Name}} has just arrived. Say 'Hi' and get to know {{Notices[0].attendee.Name.split(" ")[0]}}.</span>
                <span *ngIf="Notices[0].type == 'checkout'">{{Notices[0].attendee.Name}} has just left. Thanks for coming and see you again soon.</span>
            </div>
        </div>
    `,
    styles: [`
        .side-body {position: fixed; top: 0; left: 0; bottom: 0; right: 0; z-index: 100000; background-color: black; padding: 0px!important; margin: 0px!important; background-position: center; background-size: cover; background-repeat: no-repeat; }
        .title { font-size: 3.5rem; padding: 20px 20px 10px 20px;  }
        .description {font-size: 1.5rem; padding: 0px 20px 10px 20px; }
        .expandToggle{ color: white; font-weight: 700; margin-left: 20px; }
        .expandToggle:after { font-family: FontAwesome; content: "\\f106" }
        .expandToggle.collapsed:after { font-family: FontAwesome; content: "\\f107" }
        .exit { position: relative; z-index: 10; float: right; font-size: 3.5rem; padding: 15px 25px }
        .eventInfo { position: relative; }
        .eventInfoOverlay { position: absolute; background-color: black; opacity: 0.3; left: 0px; right: 0px; }
        .eventInfoOverlay * { visibility: hidden; }
        .overlay { width: 100%; height: 100%; background-color: black; opacity: 0.6; position: absolute; }
        .greeting { position: absolute; top: 10rem; left: 10rem; bottom: 10rem; right: 10rem; padding: 9rem; text-align: center; display: flex; align-items: center; font-size: 6rem; line-height: 12rem; }
        .green { background-color: #0d6f2b }
        .red { background-color: #df6868 }
    `]
})
export class GreeterComponent implements OnInit, OnDestroy {
    private _notices: Array<any> = new Array<any>(); 
    private _parameterSubscription: Subscription = null;
    private _event: Event = null;
    private _id: string;
    private _timer: Observable<number> = Observable.interval(15000);
    private _timerSubscription: Subscription = null;
    public get Notices(): Array<String> { return this._notices; }
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

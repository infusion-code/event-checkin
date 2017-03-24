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
                    <div class="title"><span [innerHTML]='Event.NameAsHtml'></span><a class="expandToggle" data-toggle="collapse" href="#event-description"></a></div>
                    <div id="event-description" class="description collapse in" [innerHTML]='Event.DescriptionAsHtml'></div>
                </div>
                <div class="eventInfo">
                    <div class="title"><span [innerHTML]='Event.NameAsHtml'></span><a class="expandToggle" data-toggle="collapse" href="#event-description"></a></div>
                    <div id="event-description" class="description collapse in" [innerHTML]='Event.DescriptionAsHtml'></div>
                </div>
            </ng-container>
            <div style="padding: 0px 20px 10px 20px; position: relative;">
                <h2>Notice Stream</h2>
                <div *ngFor="let notice of Notices" class="row">
                    <div class="col text-left input-group-addon" [ngClass]="{'green' : notice.type == 'checkin', 'red': notice.type == 'checkout'}">                   
                        <span *ngIf="notice.type == 'checkin'">{{notice.attendee.Name}} just arrived at the event. Say Hi and get to know {{notice.attendee.Name}}.</span>
                        <span *ngIf="notice.type == 'checkout'">{{notice.attendee.Name}} has just left.</span>
                        <span *ngIf="notice.type != 'checkin' && notice.type != 'checkout'">{{notice.type}}</span>
                    </div>
                </div>
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
        .eventInfoOverlay { position: absolute; background-color: black; opacity: 0.3; }
        .eventInfoOverlay * { visibility: hidden; }
        .overlay { width: 100%; height: 100%; background-color: black; opacity: 0.6; position: absolute; }
        .row { margin-bottom: 10px; margin-left: 5px;  }
        .row > .col { text-align: left; white-space: normal; padding: 10px; background-color: #666; color: white }
        .row > .col.red { background-color: #df6868 }
        .row > .col.green { background-color: #0d6f2b }
        h2 { padding-bottom: 15px; }
    `]
})
export class GreeterComponent implements OnInit, OnDestroy {
    private _notices: Array<any> = new Array<any>(); 
    private _parameterSubscription: Subscription = null;
    private _event: Event = null;
    private _id: string;
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
            this._notices.push(s);
            this._change.detectChanges();
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
    }

}
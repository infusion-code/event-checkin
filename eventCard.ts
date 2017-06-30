import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../models/event'

@Component({
    selector: 'event-card',
    template: `
        <ng-container *ngIf="Event != null">
            <div class="row event">
                <div class="col-xl-1 col-lg-3 col-md-4 hidden-sm hidden-xs eventImage" [ngStyle]="{'background-image': Event.ImageUrl && Event.ImageUrl!='' ? 'url(' + Event.ImageUrl + ')' : ''}"></div>
                <div class="col-xl-9 col-lg-6 col-sm-8 col-md-5 col-xs-7">
                    <div class="title"><span [innerHTML]='Event.NameAsHtml'></span><a class="expandToggle hidden-xs hidden-sm hidden-xl" data-toggle="collapse" href="#event-description"></a></div>
                    <div id="event-description" class="description hidden-xs hidden-sm collapse in" [innerHTML]='Event.DescriptionAsHtml'></div>
                    <div class="location hidden-xs" [innerHTML]='Event.Location'></div>
                </div>
                <div class="col-xl-1 col-lg-2 col-sm-3 col-md-2 col-xs-3">
                    <div class="date hidden-xs">{{Event.Start.toLocaleDateString()}}</div>
                    <div class="time hidden-xs">{{Event.Start.toLocaleTimeString()}} - {{Event.End.toLocaleTimeString()}}</div>
                    <div class="time hidden-xl hidden-lg hidden-md hidden-sm">{{Event.Start.toLocaleDateString()}}, {{Event.Start.toLocaleTimeString()}} - {{Event.End.toLocaleTimeString()}}</div>
                </div>
                <div class="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-xs-2 launch" title="Launch Event" (click)="LaunchEvent()"><span class="icon fa fa-sign-in"></span></div>
            </div>
        </ng-container>
    `,
    styles: [`
        .row > [class*='col-'] { margin-bottom: 5px;}
        .row.event { margin: -25px -30px 0px -30px; padding-top: 15px; padding-bottom: 10px; background-color: #444; display: flex; }
        .title { font-size: 1.5em; font-weight: 700; margin-bottom: 10px; }
        .date { font-weight: 700; font-size: 1.5em }
        .time { font-style: italic; }
        .eventImage { background-position: center; background-size: cover; background-repeat: no-repeat; padding: 0px; margin: 8px 4px 8px 15px }
        .expandToggle{ color: white; font-weight: 700; margin-left: 10px; }
        .expandToggle:after { font-family: FontAwesome; content: "\\f106";  }
        .expandToggle.collapsed:after { font-family: FontAwesome; content: "\\f107";  }
        .launch { text-align: center; font-weight: 600; font-size: 3rem; cursor: pointer}
    `]
})
export class EventCard {

    private _event: Event;

    @Input()
        public get Event(): Event { return this._event; }
        public set Event(val: Event) { this._event = val; }

    @Output() Launch: EventEmitter<void> =  new EventEmitter<void>();

    private LaunchEvent(){
        this.Launch.next();
    }

}
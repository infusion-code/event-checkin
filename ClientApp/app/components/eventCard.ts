import { Component, Input } from '@angular/core';
import { Event } from '../models/event'

@Component({
    selector: 'event-card',
    template: `
        <ng-container *ngIf="Event != null">
            <div class="row event">
                <div class="col-xl-1 col-lg-3 col-md-4 hidden-sm hidden-xs">
                    <img [src]="Event.ImageUrl"/>
                </div>
                <div class="col-xl-10 col-lg-7 col-sm-9 col-md-6 col-xs-12">
                    <div class="title" [innerHTML]='Event.NameAsHtml'></div>
                    <div class="description hidden-xs hidden-sm" [innerHTML]='Event.DescriptionAsHtml'></div>
                    <div class="location hidden-xs" [innerHTML]='Event.Location'></div>
                </div>
                <div class="col-xl-1 col-lg-2 col-sm-3 col-md-2 col-xs-12">
                    <div class="date hidden-xs">{{Event.Start.toLocaleDateString()}}</div>
                    <div class="time hidden-xs">{{Event.End.toLocaleTimeString()}} - {{Event.End.toLocaleTimeString()}}</div>
                    <div class="time hidden-xl hidden-lg hidden-md hidden-sm">{{Event.Start.toLocaleDateString()}}, {{Event.Start.toLocaleTimeString()}} - {{Event.End.toLocaleTimeString()}}</div>
                </div>
            </div>
        </ng-container>
    `,
    styles: [`
        .row > [class*='col-'] { margin-bottom: 5px;}
        .row.event { margin: -25px -30px 0px -30px; padding-top: 15px; padding-bottom: 10px; background-color: #444; }
        .row.event img { width: 100%; height: auto; margin-top: 8px; margin-left: 8px; }
        .title { font-size: 1.5em; font-weight: 700; margin-bottom: 10px; }
        .date { font-weight: 700; font-size: 1.5em }
        .time { font-style: italic; }
    `]
})
export class EventCard {

    private _event: Event;

    @Input()
        public get Event(): Event { return this._event; }
        public set Event(val: Event) { this._event = val; }

}
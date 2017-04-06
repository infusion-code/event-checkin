import { Component, Input, Output , EventEmitter} from '@angular/core';
import { Attendee } from '../models/attendee';
import { Event } from '../models/event';
import { EventsService } from '../services/eventsService';

@Component({
    selector: 'attendee-card',
    template: `
        <div class="profile-img" [ngClass]="{'hidden-xs hidden-sm col-md-3 col-lg-2 col-xl-1': !UseHeroStyling, 'col-xs-3': UseHeroStyling}" [ngStyle]="{'background-image': 'url(' + Image + ')'}"></div>
        <div [ngClass]="{
                'col-xs-10 col-sm-9 col-md-7 col-lg-8 col-xl-10': ShowAction && !UseHeroStyling, 
                'col-xs-12 col-sm-12 col-md-9 col-lg-10 col-xl-11': !ShowAction && !UseHeroStyling,
                'col-xs-6': ShowAction && UseHeroStyling,
                'col-xs-9': !ShowAction && UseHeroStyling
             }" >
            <div class="title">{{Attendee.Name}}</div>
            <div [ngClass]="{'nocompany': Attendee.Company==null || Attendee.Company == ''}" class="company">{{Attendee.Company}}&nbsp;</div>
            <div class="email" title="{{Attendee.Email}}">{{Attendee.Email}}</div>
        </div>
        <div *ngIf="ShowAction" class="checkin" (click)="ToggleCheckedInStatus()" [ngClass]="{'green': Attendee.CheckedIn, 'red': !Attendee.CheckedIn, 'col-xs-2 col-sm-3 col-md-2 col-lg-2 col-xl-1': !UseHeroStyling,'col-xs-3': UseHeroStyling}">
            <span class="icon fa"  [ngClass]="{'fa-sign-out': Attendee.CheckedIn && !Attendee.UpdateInProgress, 'fa-sign-in': !Attendee.CheckedIn && !Attendee.UpdateInProgress, 'fa-circle-o-notch fa-spin': Attendee.UpdateInProgress}" ></span>
        </div>
    `,
    styles: [`
        :host { display: inline-block; background-color: #666; width: 100%; min-height: 100px; border-top: 3px solid #666; display: flex; }
        :host(.red) { border-top-color: #df6868; }
        :host(.green) { border-top-color: #0d6f2b; }
        .title { font-weight: 700; font-size: 1.2em; padding: 10px 5px 5px 5px; }
        .company { padding: 5px; }
        .email { font-style: italic; padding: 0px 5px 10px 5px; overflow: hidden; text-overflow: ellipsis; }
        .profile-img { padding: 0px; margin: 0px; background-position: center; background-size: cover; background-repeat: no-repeat; }
        .green { background-color: #0d6f2b }
        .red { background-color: #df6868 }
        .checkin { display: flex; align-items: center; justify-content: center; cursor: pointer }
        .checkin .icon { font-size: 4rem; }
        .nocompany {display: none; }
    `]
})
export class AttendeeCard {
    static readonly DefaultImage = "/static/img/personcheckedin.jpg";
    static readonly DefaultImage2 = "/static/img/personcheckedout.jpg";
    private _attendee: Attendee;
    private _event: Event;
    private _showAction: boolean = true;
    private _useHeroStyling: boolean = false;

    @Input()
        public get UseHeroStyling(): boolean { return this._useHeroStyling; }
        public set UseHeroStyling(val: boolean) { this._useHeroStyling = val; }

    @Input()
        public get ShowAction(): boolean { return this._showAction; }
        public set ShowAction(val: boolean) { this._showAction = val; }

    @Input()
        public get Attendee(): Attendee { return this._attendee; }
        public set Attendee(val: Attendee) { this._attendee = val; }

    @Input()
        public get Event(): Event { return this._event; }
        public set Event(val: Event) { this._event = val; } 

    @Output() Checkin: EventEmitter<Attendee> =  new EventEmitter();
    @Output() Checkout: EventEmitter<Attendee> = new EventEmitter();


    constructor(private _events : EventsService) {}

    public get Image(): string {
        if(this._attendee.ImageUrl && this._attendee.ImageUrl != "") return this._attendee.ImageUrl;
        if(this._attendee.CheckedIn) return AttendeeCard.DefaultImage;
        return AttendeeCard.DefaultImage2;
    }

    private ToggleCheckedInStatus(){
        // note: the subscriber is responsible for setting Attendee.CheckedIn appropriately 
        // based on the action taken in response to the event...

        if(this._attendee.CheckedIn) {
            this.Checkout.emit(this._attendee);
        }
        else{
            this.Checkin.emit(this._attendee);
        }
    }

}
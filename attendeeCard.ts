import { Component, Input, Output , EventEmitter} from '@angular/core';
import { Attendee } from '../models/attendee';
import { Event } from '../models/event';
import { EventsService } from '../services/eventsService';

@Component({
    selector: 'attendee-card',
    template: `
         <div *ngIf="!hidePic" class="profile-img" [ngClass]="{'hidden-xs hidden-sm col-md-3 col-lg-2 col-xl-1': !hidePic, 'col-xs-3': UseHeroStyling}" [ngStyle]="{'background-image': 'url(' + Image + ')'}"></div>
        <div [ngClass]="{
                'col-xs-10 col-sm-9 col-md-7 col-lg-8 col-xl-10': ShowAction && !UseHeroStyling, 
                'col-xs-12 col-sm-12 col-md-9 col-lg-10 col-xl-11': !ShowAction && !UseHeroStyling,
                'col-xs-6': ShowAction && UseHeroStyling,
                'col-xs-9': !ShowAction && UseHeroStyling
             }" >
            <div class="firstname" [style.font-size]="NameSize" [style.padding]="FirstPadding"><b>{{Attendee.FirstName}}</b></div>
            <div class="lastname" [style.font-size]="NameSize" [style.padding]="LastPadding"><b>{{Attendee.LastName}}</b></div>
            <div class="email" [style.font-size]="EmailSize" [style.padding]="EmailPadding">{{Attendee.Email}}</div>
        </div>
        <div *ngIf="ShowAction" class="checkin" (click)="ToggleCheckedInStatus()" [ngClass]="{'green': Attendee.CheckedIn, 'red': !Attendee.CheckedIn, 'col-xs-2 col-sm-3 col-md-2 col-lg-2 col-xl-1': !UseHeroStyling,'col-xs-3': UseHeroStyling}">
            <span class="icon fa"  [ngClass]="{'fa-sign-out': Attendee.CheckedIn && !Attendee.UpdateInProgress, 'fa-sign-in': !Attendee.CheckedIn && !Attendee.UpdateInProgress, 'fa-circle-o-notch fa-spin': Attendee.UpdateInProgress}" ></span>
        </div>
    `,
    styles: [`
        :host { display: inline-block; background-color: #666; width: 100%; min-height: 100px; border-top: 3px solid #666; display: flex; }
        :host(.red) { border-top-color: transparent; }
        :host(.green) { border-top-color: transparent; }
        .firstname { font-weight: 900; font-size:1.5em; padding: 5px 0px 20px 0px; }
        .lastname { font-weight: 900; font-size:1.5em; padding: 10px 0px 0px 0px; }
        .company { padding: 5px; }
        .email { font-style: italic; text-overflow: ellipsis; font-size:1.5em; padding: 10px 90px 0px 0px}
        .profile-img { padding: 95px 95px 25px 5px; margin: 0px; background-position: center; background-size: cover; background-repeat: no-repeat;}
        .green { background-color: transparent;}
        .red { background-color: transparent; }
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
    private _nameSize: string;
    private _emailSize: string;
    private _hidePic:boolean;
    private _FirstPadding:string;
    private _lastPadding: string;
    private _emailPadding: string;

    @Input()
        public get FirstPadding(): string { return this._FirstPadding; }
        public set FirstPadding(val: string) { this._FirstPadding = val + 'px'; }
     @Input()
        public get EmailPadding(): string { return this._emailPadding; }
        public set EmailPadding(val: string) { this._emailPadding = val + 'px'; }
    @Input()
        public get LastPadding(): string { return this._lastPadding; }
        public set LastPadding(val: string) { this._lastPadding = val + 'px'; }
    @Input()
        public get NameSize(): string { return this._nameSize; }
        public set NameSize(val: string) { this._nameSize = val + 'rem'; }
    @Input()
        public get EmailSize(): string { return this._emailSize; }
        public set EmailSize(val: string) { this._emailSize = val + 'rem'; }

    @Input()
        public get UseHeroStyling(): boolean { return this._useHeroStyling; }
        public set UseHeroStyling(val: boolean) { this._useHeroStyling = val; }
    @Input()
        public get hidePic(): boolean { return this._hidePic; }
        public set hidePic(val: boolean) { this._hidePic = val; }
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
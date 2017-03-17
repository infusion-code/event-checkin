import { Component, Input } from '@angular/core';
import { Attendee } from '../models/attendee'

@Component({
    selector: 'attendee-card',
    template: `
        <div class="hidden-xs hidden-sm col-sm-4 col-md-3 col-lg-2 col-xl-1 profile-img" [ngStyle]="{'background-image': 'url(' + Image + ')'}"></div>
        <div class="col-xs-9 col-sm-9 col-md-7 col-lg-8 col-xl-10">
            <div class="title">{{Attendee.Name}}</div>
            <div *ngIf="Attendee.Company && Attendee.Company != ''" class="company">{{Attendee.Company}}</div>
            <div class="email" title="{{Attendee.Email}}">{{Attendee.Email}}</div>
        </div>
        <div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 col-xl-1 green">
           {{Attendee.CheckedIn}}
        </div>
    `,
    styles: [`
        :host { display: inline-block; background-color: #666; width: 100%; min-height: 100px; border-top: 3px solid #666; display: flex; }
        :host(.red) { border-top-color: #aa7777; }
        :host(.green) { border-top-color: #77aa77; }
        .title { font-weight: 700; font-size: 1.2em; padding: 10px 5px 5px 5px; }
        .company { padding: 5px; }
        .email { font-style: italic; padding: 0px 5px 10px 5px; overflow: hidden; text-overflow: ellipsis; }
        .profile-img { padding: 0px; margin: 0px; background-position: center; background-size: cover; background-repeat: no-repeat; }
        .green { background-color: #0d6f2b }
    `]
})
export class AttendeeCard {
    static readonly DefaultImage = "http://www.istar.ac.uk/wp-content/themes/iSTARMB/library/img/headshot_placeholder.jpg";
    static readonly DefaultImage2 = "https://www.houseoffinance.se/wp-content/uploads/2016/05/people-placeholder.png";
    private _attendee: Attendee;

    @Input()
        public get Attendee(): Attendee { return this._attendee; }
        public set Attendee(val: Attendee) { this._attendee = val; }

    public get Image(): string {
        if(this._attendee.ImageUrl && this._attendee.ImageUrl != "") return this._attendee.ImageUrl;
        if(this._attendee.CheckedIn) return AttendeeCard.DefaultImage;
        return AttendeeCard.DefaultImage2;
    }

}
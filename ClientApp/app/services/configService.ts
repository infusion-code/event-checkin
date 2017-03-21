import { Injectable, OnDestroy } from '@angular/core';
import { UrlTree } from '@angular/router';
import { ConfigService } from 'ng2-app-scaffold';
import { UserService } from './userService';

const { version: appVersion } = require('../../../package.json');

@Injectable()
export class AppConfigService extends ConfigService {

    private readonly _clientId = "S543YN2COZYPIISRPP";
    private readonly _authServiceBase = "https://www.eventbrite.com";
    private readonly _apiEndPointBase = "https://www.eventbriteapi.com";
    private _organizerId: string = "9457428809";
    private _pastEventWindow: number = 365;
    private _futuerEventWindow: number = 90; 


    public get BearerToken(): string { return this._userService.BearerToken; } 
    public get ClientId(): string { return this._clientId; }
    public get IsAuthenticated(): boolean { return this._userService.IsAuthenticated; }
    public get ApiEndPointBase(): string { return this._apiEndPointBase; }
    public get OrganizerId(): string {return this._organizerId; }
    public get PastEventWindow(): number { return this._pastEventWindow; }
    public get FutureEventWindow(): number { return this._futuerEventWindow; }

    constructor(private _userService: UserService) {
        super();
        this._title = "Event Checkin";
        this._faIcon = "fa-calendar-check-o";
        this._showSubscriptions = false;
        this._showHero = false;
        this._showNotifications = false;
        this._expandCurrentNavOnLoad = false;
        this._version = appVersion;
        
        this._userService.ClientId = this._clientId;
        this._userService.EndPointBase = this._authServiceBase;
        this._userService.LoginScreenPath = "/login";

        this._userService.AuthenticationChanged.subscribe(authenticated => {
            this._showHero = authenticated;
        });
    }

    public Authenticate(redirectAfterSuccessUrl?:string | UrlTree): boolean{
        if(this.IsAuthenticated) return true; 
        if(this._userService.EnsureLogin(redirectAfterSuccessUrl) == "") return false;
        return true;
    }

    public FormatString(stringToFormat: string, ...replacements: any[]): string {
        let args = Array.prototype.slice.call(arguments, 1);
        return stringToFormat.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number] 
                : match
        });
    }

}
import { Injectable, OnDestroy } from '@angular/core';
import { ConfigService } from 'ng2-app-scaffold';
import { UserService } from './userService';

@Injectable()
export class AppConfigService extends ConfigService {

    private readonly _clientId = "S543YN2COZYPIISRPP";
    private readonly _authServiceBase = "https://www.eventbrite.com";
    private readonly _apiEndPointBase = "https://www.eventbriteapi.com";

    public get BearerToken(): string { return this._userService.BearerToken; } 
    public get ClientId(): string { return this._clientId; }
    public get IsAuthenticated(): boolean { return this._userService.IsAuthenticated; }
    public get ApiEndPointBase(): string { return this._apiEndPointBase; }

    constructor(private _userService: UserService) {
        super();
        this._title = "Event Checkin";
        this._faIcon = "fa-calendar-check-o";
        this._showSubscriptions = false;
        this._showHero = false;
        this._showNotifications = false;
        this._version = "0.0.1";
        
        this._userService.ClientId = this._clientId;
        this._userService.EndPointBase = this._authServiceBase;
        this._userService.LoginScreenPath = "/login";

        this._userService.AuthenticationChanged.subscribe(authenticated => {
            this._showHero = authenticated;
        });
    }


}
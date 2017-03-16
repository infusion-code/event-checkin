import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, Subscription, Subject } from 'rxjs/Rx';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { HeroService , Hero } from 'ng2-app-scaffold';
import { AppConfigService } from './configService';

@Injectable()
export class UserProfileService extends HeroService {
    private static readonly _profileUrl = "https://www.eventbrite.com/account";
    private static readonly _defaultProfilePic = "https://yt3.ggpht.com/-rFWA1Ct-6M4/AAAAAAAAAAI/AAAAAAAAAAA/DpW3rhW3N-Q/s900-c-k-no-mo-rj-c0xffffff/photo.jpg";

    constructor(private _config: AppConfigService, private _http: Http) { 
        super();
        this._supportsLogout = false;
    }

    public get Hero(): Promise<Hero> {
        if(this._hero) return new Promise<Hero>((resolve, reject) => { resolve(this._hero)});
        else{
            let p:Promise<Hero> = this.GetDataObservable().toPromise();
            p.then(h => { this._hero=h; });
            return p;
        }
    }

    protected GetDataObservable(): Observable<Hero>{
        let options:RequestOptions = new RequestOptions();
        options.headers = new Headers();
        options.headers.append("Authorization", "Bearer " + this._config.BearerToken);
        let o: any = {};

        let h:Observable<Hero> = this._http.get(this._config.ApiEndPointBase + "/v3/users/me/", options)
            .map((r:Response) => { 
                let x = r.json();
                o.id = x.id;
                o.name = x.name || "";
                o.emails = x.emails || [];
                o.image = null;
                o.url = x.url || null;
                return x;
            })
            .flatMap((u) => { 
                if(u.image_id) return this._http.get(this._config.ApiEndPointBase + this._config.FormatString("/v3/media/{0}/", u.image_id), options);
                else {
                    let response = new Response({
                        merge: null,
                        url: '',
                        headers: null,
                        status: 999,
                        body: ""});
                    return Observable.of(response);
                } 
            })
            .map((r:Response) => {
                if(r.status == 200){
                    let x = r.json();
                    o.image = (x.original && x.original.url) ? x.original.url : null;
                }
                return  UserProfileService.HeroFromJSON(o);
            })
            .catch((e:any) => Observable.throw(e || "Server Error"));
        return h;
    }

    private static HeroFromJSON(o: any):Hero {
        return new Hero(
            o.id,
            o.name,
            o.emails[0].email,
            o.image ? o.image : UserProfileService._defaultProfilePic,
            o.url ? o.url : UserProfileService._profileUrl
        );
    }

}
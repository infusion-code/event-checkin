import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, Subscription, Subject } from 'rxjs/Rx';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { HeroService , Hero } from 'ng2-app-scaffold';
import { AppConfigService } from './configService';

@Injectable()
export class UserProfileService extends HeroService {
    private readonly _profileUrl = "https://www.eventbrite.com/account";
    private readonly _defaultProfilePic = "https://yt3.ggpht.com/-rFWA1Ct-6M4/AAAAAAAAAAI/AAAAAAAAAAA/DpW3rhW3N-Q/s900-c-k-no-mo-rj-c0xffffff/photo.jpg";

    constructor(private _config: AppConfigService, private _http: Http) { 
        super();
        this._supportsLogout = false;
    }

    public get Hero(): Promise<Hero> {
        return new Promise<Hero>((resolve, reject) => {
            try {
                if (!this._hero) this.GetDataPromise("/v3/users/me/")
                    .then(r => {
                        let d = r.json();
                        if(d.image_id) {
                            this.GetDataPromise("/v3/media/{0}/".replace("{0}", d.image_id))
                                .then(x => {
                                    let e = x.json();
                                    this._hero = new Hero( d.id, d.name, d.emails[0].email, e.original.url, this._profileUrl);         
                                    resolve(this._hero);                        
                                })
                                .catch(e => { console.log(e);})
                        }
                        else{
                            this._hero = new Hero(d.id,d.name,d.emails[0].email, this._defaultProfilePic,this._profileUrl);
                            resolve(this._hero);
                        }
                    })
                    .catch(e => { console.log(e)});
                
            }
            catch (e) {
                reject(e);
            }
        });
    }

    protected GetDataPromise(path: string): Promise<Response>{
        let url:string = this._config.ApiEndPointBase + path;
        let options:RequestOptions = new RequestOptions();
        options.headers = new Headers();
        options.headers.append("Authorization", "Bearer " + this._config.BearerToken);

        return this._http.get(url, options).toPromise<Response>();
    }


}
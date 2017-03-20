import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, Subscription, Subject } from 'rxjs/Rx';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { AppConfigService } from './configService';
import { UserService } from './userService';
import { Event } from '../models/event';
import { Attendee, AttendeeCollection } from '../models/attendee';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class EventsService  {
    private readonly _meQuery: string = "/v3/users/me/events/?expand=venue&order_by=start_desc";
    private readonly _orgnizerQuery: string = "/v3/organizers/{0}/events/?expand=venue&start_date.range_start={1}&start_date.range_end={2}&order_by=start_desc";
    private readonly _attendeeQuery: string = "/v3/events/{0}/attendees/";
    private _events:Array<Event>;


    constructor(private _config:AppConfigService, private _http: Http) {};

    public get Events():Observable<Event[]> { 
        if(this._events) return Observable.of(this._events);
        return this.GetEvents();
    } 

    public get EventsWithRefresh():Observable<Event[]> { 
        return this.GetEvents();
    }
    
    public Checkin(eventId: string, attendeeId: string):Observable<boolean>{
        return Observable.of(false)
            .map((v:boolean) => {
                Observable.throw("The checkin operation is not currently implemented due to lack of support in the EventBrite APIs.");
                return false;
            })
            .do(x => { 
                console.log("The checkin operation is not currently implemented due to lack of support in the EventBrite APIs.")
            });
    }

    public GetEvent(id:string): Observable<Event>{
        return this.Events.map((r:Array<Event>) => {
            let evt:Event = r.find( x => x.Id == id);
            if(evt == null){
                let e = {error: "Not found", message: this._config.FormatString("An event with ID {0} was not found in event collection", id)};
                console.log(e);
                throw(e);
            }
            return evt;
        }).do(x => console.log(x));
    }

    public GetAttendees(id:string): Observable<Array<Attendee>>{
        if(!this._config.IsAuthenticated) return Observable.of(new Array<Attendee>());

        let callAndMap = (page_number) => this.GetAttendeesPage(id, page_number).map(res => { return { page: page_number, data: res.json()}}); 
        return callAndMap(0)
            .expand(obj => (obj.data.pagination.page_count != obj.data.pagination.page_number  ? callAndMap(obj.page + 1) : Observable.empty()))
            .map(obj => {
                let u = new Array<Attendee>();
                obj.data.attendees.forEach(a => {
                    let att:Attendee = new Attendee(a.id, a.profile.name, a.profile.company, a.profile.url, a.profile.email, a.profile.image, a.checked_in);
                    u.push(att);
                });
                u.sort((a,b) => { 
                    if (a.Name < b.Name) return -1; 
                    if (a.Name > b.Name) return 1; 
                    return 0;});
                return u; })
            .catch((e:any) => Observable.throw(e || 'Server Error')); ;
    }

    public GetCheckedInAttendees(id:string): Observable<Array<Attendee>>{
        return this.GetAttendees(id).map((attendees: Array<Attendee>) => { return attendees.filter((a:Attendee) => { return a.CheckedIn;}); });
    }

    public GetRegisteredAttendees(id:string): Observable<Array<Attendee>>{
        return this.GetAttendees(id).map((attendees: Array<Attendee>) => { return attendees.filter((a:Attendee) => { return !a.CheckedIn;}); });
    }

    protected GetEvents(): Observable<Event[]>{
        if(!this._config.IsAuthenticated) return Observable.of(new Array<Event>());
        let startDate: Date = new Date(Date.now() - (this._config.PastEventWindow * 86400000));
        let endDate: Date =  new Date(Date.now() + (this._config.PastEventWindow * 86400000));
        let url:string = this._config.ApiEndPointBase +  this._config.FormatString(this._orgnizerQuery, this._config.OrganizerId, 
            startDate.toISOString().substr(0, 19), 
            endDate.toISOString().substr(0, 19));
        let options:RequestOptions = new RequestOptions();
        options.headers = new Headers();
        options.headers.append("Authorization", "Bearer " + this._config.BearerToken);

        return this._http.get(url, options).map((r:Response) => {
            this._events = new Array<Event>();
            let ej = r.json();
            ej.events.forEach(e => {
                let evt = new Event(
                    e.id,
                    e.name.text,
                    e.description.text,
                    e.url,
                    new Date(e.start.utc),
                    new Date(e.end.utc),
                    e.venue.address.localized_address_display,
                    e.logo ? e.logo.url || null : null,
                    e.name.html,
                    e.description.html
                );
                this._events.push(evt);
            });
            return this._events;
        }).catch((e:any) => Observable.throw(e || 'Server Error'));  
    }

    private GetAttendeesPage(id: string, page: number): Observable<Response> {
        let url:string = this._config.ApiEndPointBase +  this._config.FormatString(this._attendeeQuery, id) + (page != null ? this._config.FormatString("?page={0}", page) : "");
        let options:RequestOptions = new RequestOptions();
        options.headers = new Headers();
        options.headers.append("Authorization", "Bearer " + this._config.BearerToken);
        return this._http.get(url, options);
    }
}

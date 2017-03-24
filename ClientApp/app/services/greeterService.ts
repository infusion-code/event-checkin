import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, Subject } from 'rxjs/Rx';
import { AppConfigService } from './configService';
import { EventsService } from './eventsService';

declare class EventSource {
    close: () => void;
    onopen: () => void;
    onerror: () => void;
    onmessage: (data: any) => void;
    addEventListener(event: string, cb: (data: any) => void): void;
    constructor(name: string);
}

@Injectable()
export class GreeterService implements OnDestroy {
    private _stream: Subject<any> = new Subject<any>();
    private _source: EventSource = null;
    private _initialized:boolean = false;

    public get Notifications(): Observable<any> {
        if(!this._initialized) this.Initialize();
        return this._stream.asObservable(); 
    }

    constructor(private _config: AppConfigService, private _events: EventsService) {}

    private Initialize(){
        if(this._initialized) return;
        this._source = new EventSource(this._config.NotificationEndpoint);

        this._source.onopen = () => this._stream.next({ 'type': 'Connection established.'}); 
        this._source.onerror = () =>  this._stream.next({ 'type': 'Connection failed.'}); 
        this._source.onmessage = (event) => {
            console.log('SSE EVENT: { id: "' + event.lastEventId + '", data: "' + event.data + '" }');
            this._stream.next(event.data);
            if (event.lastEventId == "close") this.ngOnDestroy(); 
        }
        this._initialized = true;

        this._source.addEventListener("checkin", (event) => {
            console.log('Checkin EVENT: { id: "' + event.lastEventId+ '", data: "' + event.data + '" }');
            let d:any = JSON.parse(event.data);
            this._events.GetAttendees(d.evt).subscribe(e => {
                let att = e.find(a => a.Id == d.attendee);
                this._stream.next({ type: "checkin", attendee: att });
            });
        });
        this._source.addEventListener("checkout", (event) => {
            console.log('Checkout EVENT: { id: "' + event.lastEventId + '", data: "' + event.data + '" }');
            let d:any = JSON.parse(event.data);
            this._events.GetAttendees(d.evt).subscribe(e => {
                let att = e.find(a => a.Id == d.attendee);
                this._stream.next({ type: "checkout", attendee: att });
            });
        })
    }

    public ngOnDestroy(){
        if(this._source) this._source.close();
        this._source = null;
        this._initialized = false;
    }
    
}
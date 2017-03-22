import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AppConfigService } from '../services/configService';
import { GreeterService } from '../services/greeterService';

@Component({
    selector: 'greeter',
    template: `
        <div class="side-body">
            <h2>Notice Stream</h2>
            <div *ngFor="let notice of Notices" class="row">
                <div class="col text-left input-group-addon" [ngClass]="{'green' : notice.type == 'checkin', 'red': notice.type == 'checkout'}">                   
                    <span *ngIf="notice.type == 'checkin' || notice.type == 'checkout'">{{notice.type}} of attendee {{notice.attendee}} for event {{notice.evt}}.</span>
                    <span *ngIf="notice.type != 'checkin' && notice.type != 'checkout'">{{notice.type}}</span>
                </div>
            </div>
        </div>
    `,
    styles: [`
        h2 { padding-bottom: 15px; }
        .row { margin-bottom: 10px; margin-left: 5px;  }
        .row > .col { text-align: left; white-space: normal; padding: 10px; background-color: #666; color: white }
        .row > .col.red { background-color: #df6868 }
        .row > .col.green { background-color: #0d6f2b }
    `]
})
export class GreeterComponent implements OnInit {
    private _notices: Array<any> = new Array<any>(); 
    public get Notices(): Array<String> { return this._notices; }

    constructor(private _config: AppConfigService, private _greeter: GreeterService, private _change: ChangeDetectorRef) { }
    
    public ngOnInit() {
        this._greeter.Notifications.subscribe(s => {
            this._notices.push(s);
            this._change.detectChanges();
        });
    }

}
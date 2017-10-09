import { Component } from '@angular/core';
import { AppConfigService } from '../services/configService';
import { ErrorService } from '../services/errorService';

@Component({
    selector: 'error',
    template: `
        <div class="side-body has-error">
            <h2>There seem to be some issues....</h2>
            <div *ngFor="let e of Errors" class="row">
                <div class="col text-left input-group-addon">                   
                    {{e}}
                </div>
            </div>
        </div>
    `,
    styles: [`
        h2 { padding-bottom: 15px; }
        .row { margin-bottom: 10px; margin-left: 5px;  }
        .row > .col { text-align: left; white-space: normal; padding: 10px }
    `]
})
export class ErrorComponent {

    public get Errors(): Array<String> { return this._errors.Errors; }

    constructor(private _config: AppConfigService, private _errors: ErrorService) { }

}

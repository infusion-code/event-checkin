import { Component } from '@angular/core';
import { AppConfigService } from '../../services/configService';

@Component({
    selector: 'home',
    template: require('./home.component.html')
})
export class HomeComponent {

    constructor(private _config: AppConfigService) {
        let token:string = _config.BearerToken;
    }

}

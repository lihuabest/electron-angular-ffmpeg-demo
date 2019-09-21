import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ElectronService } from './services/electron.service';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [
        ElectronService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

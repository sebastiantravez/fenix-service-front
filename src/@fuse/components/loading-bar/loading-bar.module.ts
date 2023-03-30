import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar/loading-bar.component';
import { BlockUIModule } from 'ng-block-ui';

@NgModule({
    declarations: [
        FuseLoadingBarComponent
    ],
    imports     : [
        CommonModule,
        MatProgressBarModule,
        BlockUIModule.forRoot()
    ],
    exports     : [
        FuseLoadingBarComponent
    ]
})
export class FuseLoadingBarModule
{
}

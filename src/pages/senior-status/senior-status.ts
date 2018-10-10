import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MqttClientProvider } from '../../providers/mqtt-client/mqtt-client';

@Component({
  selector: 'page-senior-status',
  templateUrl: 'senior-status.html'
})

export class SeniorStatusPage {
  lastRefreshed: number;

  private timer: number;

  constructor(public navCtrl: NavController, private changeDetectorRef: ChangeDetectorRef, public mqtt: MqttClientProvider) {
    this.changeDetectorRef.detach();
    this.timer = setInterval(_ => {
      this.lastRefreshed = Date.now();
      this.changeDetectorRef.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}

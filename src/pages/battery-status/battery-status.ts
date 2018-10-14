import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MqttClientProvider } from '../../providers/mqtt-client/mqtt-client';

@Component({
  selector: 'page-battery-status',
  templateUrl: 'battery-status.html',
})
export class BatteryStatusPage {
  objectKeys = Object.keys;
  //lastRefreshed: number;
  
  //private timer: number;

  constructor(public navCtrl: NavController, private changeDetectorRef: ChangeDetectorRef, public navParams: NavParams, public mqtt: MqttClientProvider) {
    this.changeDetectorRef.detach();
    setInterval(_ => {
      //this.lastRefreshed = Date.now();
      this.changeDetectorRef.detectChanges();
    }, 1000);
  }
}

import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MqttClientProvider } from '../../providers/mqtt-client/mqtt-client';

@Component({
  selector: 'page-battery-status',
  templateUrl: 'battery-status.html',
})
export class BatteryStatusPage {
  objectKeys = Object.keys;

  constructor(public navCtrl: NavController, public navParams: NavParams, public mqtt: MqttClientProvider) {
  }

  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}

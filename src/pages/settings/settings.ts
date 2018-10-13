import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MqttClientProvider } from '../../providers/mqtt-client/mqtt-client';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public mqtt: MqttClientProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

}

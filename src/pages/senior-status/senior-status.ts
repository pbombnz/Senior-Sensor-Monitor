import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MqttClientProvider } from '../../providers/mqtt-client/mqtt-client';

@Component({
  selector: 'page-senior-status',
  templateUrl: 'senior-status.html'
})

export class SeniorStatusPage {
  constructor(public navCtrl: NavController, public mqttClientProvider: MqttClientProvider) {}
}

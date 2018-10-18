import { Component } from '@angular/core';
import { MqttClientProvider } from '../../providers/mqtt-client/mqtt-client';

@Component({
  selector: 'mqtt-status',
  templateUrl: 'mqtt-status.html'
})
export class MqttStatusComponent {
  constructor(public mqtt : MqttClientProvider) {
  }

}

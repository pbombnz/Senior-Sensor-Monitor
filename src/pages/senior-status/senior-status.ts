import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { MqttClientProvider } from '../../providers/mqtt-client/mqtt-client';

declare const h337: any;

@Component({
  selector: 'page-senior-status',
  templateUrl: 'senior-status.html'
})
export class SeniorStatusPage {
  objectKeys = Object.keys;

  private changeDetectorTimer: number;
  private heatmap;

  constructor(public navCtrl: NavController, public platform: Platform, private changeDetectorRef: ChangeDetectorRef, public mqtt: MqttClientProvider) {
    this.changeDetectorRef.detach();
    this.changeDetectorTimer = setInterval(_ => {
      if(this.heatmap && this.mqtt.motionActivity_heatmapData) {
        this.heatmap.setData({
          data: this.mqtt.motionActivity_heatmapData
        });
      }

      this.changeDetectorRef.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.changeDetectorTimer);
  }

  ngAfterViewInit() {
    this.heatmap = h337.create({
      container: window.document.querySelector('#heatmap'),
      maxOpacity: 0.4,
      minOpacity: 0.6,
      radius: 10,
    });
    /*this.heatmap.setData({
      data: [
        {x: 50, y: 50, value: 1}, // Living Room
        {x: 90, y: 210, value: 1}, // Bedroom
       ]
    });*/
  }
}

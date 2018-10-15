import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MqttClientProvider } from '../../providers/mqtt-client/mqtt-client';

@Component({
  selector: 'page-battery-status',
  templateUrl: 'battery-status.html',
})
export class BatteryStatusPage {
  objectKeys = Object.keys;
  
  private changeDetectorTimer: number;

  constructor(public navCtrl: NavController, private changeDetectorRef: ChangeDetectorRef, public navParams: NavParams, public mqtt: MqttClientProvider) {
    this.changeDetectorRef.detach();
    this.changeDetectorTimer = setInterval(_ => {
      this.changeDetectorRef.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.changeDetectorTimer);
  }

  batteryPercentageText(batteryPercentage: number): string {
    let text: string;

    /*if(batteryPercentage >= 80) { // Full Battery
      text = '';
    } else if(batteryPercentage >= 60) { // High Battery 
      text = '';
    } else*/ if(batteryPercentage >= 40) { // Medium Battery
      text = '';
    } else if(batteryPercentage >= 20) { // Low Battery
      text = 'Battery is low. Please replace/recharge the battery soon.';
    } else { // Extremely-Low Battery
      text = 'Battery is critcally Low! Replace/recharge the battery urgently.'
    }
    return text;
  }

  batteryPercentageColor(batteryPercentage: number): string {
    let color: string;

    if(batteryPercentage >= 80) { // Full Battery
      color = 'DarkGreen';
    } else if(batteryPercentage >= 60) { // High Battery 
      color = 'Green';
    } else if(batteryPercentage >= 40) { // Medium Battery
      color = 'Gold';
    } else if(batteryPercentage >= 20) { // Low Battery
      color = 'DarkOrange';
    } else { // Extremely-Low Battery
      color = 'Red'
    }
    return color;
  }
}

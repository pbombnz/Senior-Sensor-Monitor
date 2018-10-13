import { Component  } from '@angular/core';
import { Platform, AlertController  } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


import { BatteryStatusPage } from '../pages/battery-status/battery-status';
import { SeniorStatusPage } from '../pages/senior-status/senior-status';
import { MqttClientProvider } from '../providers/mqtt-client/mqtt-client';

import * as moment from 'moment';
import 'rxjs/add/observable/interval';
import { Observable } from 'rxjs/Observable';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  tab1Root:any = SeniorStatusPage;
  tab2Root:any = BatteryStatusPage;

  isAlertOpen = false;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, mqtt: MqttClientProvider, public alertCtrl: AlertController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // Do stuff here
      let sub = Observable.interval(60000).subscribe((val) => { 
        console.log('called'); 
        let noMotionSinceTime: moment.Moment = mqtt.getNoMotionTimer();
        let nowTime: moment.Moment = moment();
        console.log(nowTime.diff(noMotionSinceTime, 'minutes'));
        if (nowTime.diff(noMotionSinceTime, 'minutes') >= 5) {
          this.showAlert();
        }
      });
    });
  }

  showAlert() {
    if(this.isAlertOpen) {
      return;
    }

    let alert = this.alertCtrl.create({
      title: 'Prolonged inactivity',
      subTitle: 'No motion has been detected for the last 5 minutes. Please contact the individual for safety.\n\nIts suggested to ring emergency services if the individual is not available.',
      buttons: ['OK']
    });

    alert.onDidDismiss(() => this.isAlertOpen = false);

    this.isAlertOpen = true;
    alert.present();
  }
}


import { Component  } from '@angular/core';
import { Platform, AlertController  } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalNotifications  } from '@ionic-native/local-notifications';


import { BatteryStatusPage } from '../pages/battery-status/battery-status';
import { SeniorStatusPage } from '../pages/senior-status/senior-status';
import { SettingsPage } from '../pages/settings/settings';
import { MqttClientProvider } from '../providers/mqtt-client/mqtt-client';

//import * as moment from 'moment';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  tab1Root:any = SeniorStatusPage;
  tab2Root:any = BatteryStatusPage;
  tab3Root:any = SettingsPage;

  isAlertOpen = false;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public mqtt: MqttClientProvider, public alertCtrl: AlertController, private localNotifications: LocalNotifications) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // Do stuff here
      mqtt.connect();
      mqtt.onNoMotionDetected = this.onNoMotionDetected.bind(this);
    });
  }

  onNoMotionDetected() {
    this.scheduleNotification();
    this.showAlert();
  }

  scheduleNotification() {
    this.localNotifications.schedule({
      id: 1,
      title: 'Prolonged inactivity for the Last 5 minutes',
      text: 'Its suggested to ring emergency services if the individual is not available in attempts to contact them.',
    })
  }

  showAlert() {
    if(this.isAlertOpen) {
      return;
    }

    let alert = this.alertCtrl.create({
      title: 'Prolonged Inactivity',
      subTitle: 'No motion has been detected for the last 5 minutes',
      message: 'Please contact the individual for safety.\n\nIts suggested to ring emergency services if the individual is not available.',
      buttons: ['OK']
    });

    alert.onDidDismiss(() => this.isAlertOpen = false);

    this.isAlertOpen = true;
    alert.present();
  }
}


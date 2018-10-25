import { Component  } from '@angular/core';
import { Platform, AlertController, ToastController  } from 'ionic-angular';
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
  
  notificationType: string;


  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public mqtt: MqttClientProvider, public toastCtrl: ToastController, public alertCtrl: AlertController, private localNotifications: LocalNotifications) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // Do stuff here
      mqtt.connect();

      // Identifying how to issue notifications to a device this application is running on.
      if(platform.is('mobile')) {
        this.notificationType = 'native';
      } else {
        //Platform is some form of Browser

        // Check for Notification API (only works on newer browsers).
        if (!("Notification" in window)) {
          // Notification API support not found, alert boxes will be used.
          this.presentNoNotificationToast();
          this.notificationType = 'alert';
        } else {
          //console.log(Notification);
          if (Notification.permission === "default") {
            this.notificationType = 'alert';
            Notification.requestPermission().then(function (permission) {
              // If the user accepts, let's create a notification
              if (permission === "granted") {
                this.notificationType = 'browser';
              }
            }.bind(this));
          } else if (Notification.permission === "granted") {
            this.notificationType = 'browser';
          } else if (Notification.permission === "denied") {
            this.notificationType = 'alert';
          }
        }
      }
      mqtt.onNoMotionDetected = this.onNoMotionDetected.bind(this);
    });
  }

  presentNoNotificationToast() {
    const toast = this.toastCtrl.create({
      message: 'Notifications are not supported platform/browser. We will use Alternative methods...',
      duration: 7000
    });
    toast.present();
  }

  onNoMotionDetected() {
    if(this.notificationType === 'native') {
      this.scheduleNativeNotification();
    } else if(this.notificationType === 'browser') {
      this.scheduleBrowserNotification();
    } else if(this.notificationType === 'alert') {
      this.showAlert();
    }
  }

  scheduleBrowserNotification() {
    new Notification('Prolonged inactivity for the Last 5 minutes', {
      body: 'Its suggested to ring emergency services if the individual is not available in attempts to contact them.'
    });
  }

  scheduleNativeNotification() {
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


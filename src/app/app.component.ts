import { Component, ViewChild  } from '@angular/core';
import { Platform, AlertController, ToastController, Tabs  } from 'ionic-angular';
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
  @ViewChild('myTabs') tabRef: Tabs;

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
        this.localNotifications.on('click').subscribe((notification) => {
          //console.log('PBOMB: ', notification);
          if(this.tabRef) {
            this.tabRef.select(0); // Navigate to Senior Status (specified by handout)
          }
        });
      } else {
        //Platform is some form of Browser
        try {
          // Check for Notification API (only works on newer browsers).
          if (!("Notification" in window)) {
            // Notification API support not found, alert boxes will be used.
            this.presentNoNotificationToast();
            this.notificationType = 'alert';
          } else {
            //console.log(Notification);
            if ((Notification as any).permission === "default") {
              this.notificationType = 'alert';
              (Notification as any).requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                  this.notificationType = 'browser';
                }
              }.bind(this));
            } else if ((Notification as any).permission === "granted") {
              this.notificationType = 'browser';
            } else if ((Notification as any).permission === "denied") {
              this.notificationType = 'alert';
            }
          }
        } catch(e) { }
      }
      mqtt.onNoMotionDetected = this.onNoMotionDetected.bind(this);
    });
  }

  presentNoNotificationToast() {
    const toast = this.toastCtrl.create({
      message: 'Notifications are not supported on this platform/browser. We will use alert boxes to notify you of serious events.',
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
    let notification = new Notification('Prolonged inactivity for the Last 5 minutes', {
      body: 'Its suggested to ring emergency services if the individual is not available in attempts to contact them.'
    });
    notification.onclick = (event) => {
        //event.preventDefault(); // prevent the browser from focusing the Notification's tab
        if(this.tabRef) {
          this.tabRef.select(0); // Navigate to Senior Status (specified by handout)
        }
    }
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


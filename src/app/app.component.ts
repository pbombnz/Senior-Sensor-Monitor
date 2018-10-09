import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { BatteryStatusPage } from '../pages/battery-status/battery-status';
import { SeniorStatusPage } from '../pages/senior-status/senior-status';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  tab1Root:any = SeniorStatusPage;
  tab2Root:any = BatteryStatusPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}


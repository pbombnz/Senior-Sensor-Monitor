import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { SeniorStatusPage } from '../pages/senior-status/senior-status';
import { BatteryStatusPage } from '../pages/battery-status/battery-status';
import { MqttClientProvider } from '../providers/mqtt-client/mqtt-client';

@NgModule({
  declarations: [
    MyApp,
    SeniorStatusPage,
    BatteryStatusPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SeniorStatusPage,
    BatteryStatusPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    MqttClientProvider
  ]
})
export class AppModule {}

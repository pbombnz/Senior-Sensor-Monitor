import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { LocalNotifications  } from '@ionic-native/local-notifications';
import { MyApp } from './app.component';
import { SeniorStatusPage } from '../pages/senior-status/senior-status';
import { BatteryStatusPage } from '../pages/battery-status/battery-status';
import { MqttClientProvider } from '../providers/mqtt-client/mqtt-client';
import { SettingsPage } from '../pages/settings/settings';
import { MqttStatusComponent } from '../components/mqtt-status/mqtt-status';

@NgModule({
  declarations: [
    MyApp,
    SeniorStatusPage,
    BatteryStatusPage,
    SettingsPage,
    MqttStatusComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SeniorStatusPage,
    BatteryStatusPage,
    SettingsPage,
    MqttStatusComponent,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    MqttClientProvider,
    LocalNotifications
  ]
})
export class AppModule {}

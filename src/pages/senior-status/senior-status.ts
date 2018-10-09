import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import Paho from 'paho-mqtt';

//declare var Paho: any;

@Component({
  selector: 'page-senior-status',
  templateUrl: 'senior-status.html'
})

export class SeniorStatusPage {

mqttStatus: string = 'Disconnected';
mqttClient: any = null;
message: any = '';
messageToSend: string = 'Your message';

topic: string = 'swen325/a3';
clientId: string = 'bhikhupras'

  constructor(public navCtrl: NavController) {

  }

  public connect = () => {
    this.mqttStatus = 'Connecting...';
    //this.mqttClient = new Paho.Client('m10.cloudmqtt.com', 31796, '/mqtt', this.clientId);
    let host = "barretts.ecs.vuw.ac.nz";
     host = 'localhost';
    this.mqttClient = new Paho.Client(host, 8883, '/mqtt', this.clientId);

    // set callback handlers
    this.mqttClient.onConnectionLost = this.onConnectionLost;
    this.mqttClient.onMessageArrived = this.onMessageArrived;

    // connect the client
    console.log('Connecting to mqtt via websocket');
    //this.mqttClient.connect({timeout:10, userName:'ptweqash', password:'ncU6vlGPp1mN', useSSL:true, onSuccess:this.onConnect, onFailure:this.onFailure});
    this.mqttClient.connect({
      timeout: 10,
      useSSL: false,
      onSuccess: this.onConnect,
      onFailure: this.onFailure
    });
  }

  public disconnect() {
    if (this.mqttStatus == 'Connected') {
      this.mqttStatus = 'Disconnecting...';
      this.mqttClient.disconnect();
      this.mqttStatus = 'Disconnected';
    }
  }

  public sendMessage() {
    if (this.mqttStatus == 'Connected') {
      this.mqttClient.publish(this.topic, this.messageToSend);
    }
  }

  public onConnect = () => {
    console.log('Connected');
    this.mqttStatus = 'Connected';

    // subscribe
    this.mqttClient.subscribe(this.topic, {
		onSuccess: () => {
			console.log('Subscribe: Success');
		},
		onFailure: () => {
			console.log('Subscribe: Failed');
		}
	});
  }

  public onFailure = (responseObject) => {
    console.log('Failed to connect');
    this.mqttStatus = 'Failed to connect';
  }

  public onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      this.mqttStatus = 'Disconnected';
    }
  }

  public onMessageArrived = (message) => {
	console.log('Received message: ', message.payloadString);
	this.message = message.payloadString;
	//console.log(this.message);
  }
}

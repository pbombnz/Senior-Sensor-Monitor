import { Injectable } from '@angular/core';
import * as moment from 'moment';

declare var Paho: any;

@Injectable()
export class MqttClientProvider {
  status: string = 'Disconnected';
  client: any = null;
  message: any = '';
  messageToSend: string = 'Your message';
  topic: string = 'swen325/a3';
  clientId: string = 'bhikhupras';

  messagesBuffer: any = {};

  constructor() {

  }

  public connect = () => {
  	this.status = 'Connecting...';
    //this.client = new Paho.MQTT.Client('m10.cloudmqtt.com', 31796, '/mqtt', this.clientId);
    let host = 'barretts.ecs.vuw.ac.nz';
    host = 'localhost';
  	this.client = new Paho.MQTT.Client(host, 8883, '/mqtt', this.clientId);
 	
	// set callback handlers
	this.client.onConnectionLost = this.onConnectionLost;
	this.client.onMessageArrived = this.onMessageArrived;

	// connect the client
	console.log('Connecting to mqtt via websocket');
	//this.client.connect({timeout:10, userName:'ptweqash', password:'ncU6vlGPp1mN', useSSL:true, onSuccess:this.onConnect, onFailure:this.onFailure});
	this.client.connect({timeout:10, useSSL:false, onSuccess:this.onConnect, onFailure:this.onFailure});
  }

  public disconnect () {
  	if(this.status == 'Connected') {
  		this.status = 'Disconnecting...';
      this.client.disconnect();
      this.messagesBuffer = {};
  		this.status = 'Disconnected';
  	}
  }

  public sendMessage () {
  	if(this.status == 'Connected') {
  		this.client.publish(this.topic, this.messageToSend);
  	}
  }

  public onConnect = () => {
  	console.log('Connecting/Connected - Subscribing');

  	// subscribe
	this.client.subscribe(this.topic, {
		onSuccess: () => {
      console.log('Connected - Subscribe Suceeded');
      this.status = 'Connected';
    },
		onFailure: (responseObject) => {
      console.log('Connected - Subscribe Failed');
      this.onFailure(responseObject);
    }
	});
  }

  public onFailure = (responseObject) => {
  	console.log('Failed to connect');
  	this.status = 'Failed to connect';
  }

  public onConnectionLost = (responseObject) => {
   	if (responseObject.errorCode !== 0) {
   		this.status = 'Disconnected';
  	} 	
  }

  public onMessageArrived = (message) => {
  	console.log('Received message: ', message.payloadString);
    this.message = message.payloadString;
    this.addMessageToBuffer(message.payloadString);
    
    console.log(this.messagesBuffer);
  }


  public addMessageToBuffer(message) {
    let messageSplit: string[] = message.split(',');
    
    let timestamp = moment(messageSplit[0]);
    let location = messageSplit[1];
    let motion_status = Number.parseInt(messageSplit[2]);
    let battery_status = Number.parseInt(messageSplit[3]);

    this.messagesBuffer = Object.assign(this.messagesBuffer, { [location]: { timestamp, location, motion_status, battery_status }});
  }
}

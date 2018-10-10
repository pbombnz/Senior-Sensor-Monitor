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

  startDate: moment.Moment = moment().subtract(1,'days');
  locationBuffer: any = {};
  lastSeenLocations: any[]; // The message that holds the latest (parsed) message that had motion detected.

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
      //this.locationBuffer = {};
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

      // Check if first time app has ran.
      if(!((Object.keys(this.locationBuffer).length === 0 && this.locationBuffer.constructor === Object) && this.lastSeenLocations == undefined)) {
        console.log('yeah')
        this.startDate = moment();
      }
      this.locationBuffer = {};
      this.lastSeenLocations = [];
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
  	//console.log('Received message: ', message.payloadString);
    this.message = message.payloadString;
    this.addMessageToBuffer(message.payloadString);
    
    console.log(this.locationBuffer);
  }


  public addMessageToBuffer(message) {
    let messageSplit: string[] = message.split(',');
    
    let timestamp = moment(messageSplit[0]);
    let location = messageSplit[1];
    let motion_status = Number.parseInt(messageSplit[2]);
    let battery_status = Number.parseInt(messageSplit[3]);

    this.locationBuffer = Object.assign(this.locationBuffer, { [location]: { timestamp, location, motion_status, battery_status }});

    if(motion_status === 1) {
      for(let lastSeenLocation of this.lastSeenLocations) {
        //console.log('lastSeenLocation: ', lastSeenLocation);
        //console.log('timestamp:', timestamp);
        //console.log('lastSeenLocation.timestamp: ', lastSeenLocation.timestamp);
        //console.log('timestamp.isAfter(lastSeenLocation.timestamp): ', timestamp.isAfter(lastSeenLocation.timestamp));
        if(timestamp.isAfter(lastSeenLocation.timestamp)) {
          this.lastSeenLocations = [{ timestamp, location, motion_status, battery_status }];
          return;
        }
      }
      this.lastSeenLocations.push({ timestamp, location, motion_status, battery_status });
    }
  }

  prettifyLocation(location: string): string {
    if(!location) {
      return null;
    }

    // Capitalise first letter of Location name
    let str: string = location.charAt(0).toUpperCase() + location.slice(1);

    if(location === 'living' || location === 'dining') {
      return str + " Room";
    } else {
      return str;
    }
  }
}

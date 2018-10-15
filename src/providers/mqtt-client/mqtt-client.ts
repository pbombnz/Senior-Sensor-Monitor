import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';

declare var Paho: any;

@Injectable()
export class MqttClientProvider {
  status: string = 'Disconnected';
  client: any = null;
  //message: any = '';
  //messageToSend: string = 'Your message';
  topic: string = 'swen325/a3';
  clientId: string = 'bhikhupras';

  /**
   * Holds latest sensor information on each location/room.
   */
  locationBuffer: any;

    /**
   * Holds a single or multiple sensor's information where motion was last detected.
   */
  locationBuffer_lastSeen: any[];

  /**
   * When there has not been any motion detection, which is common when application has just 
   * started, the application will use this time to determine how long the individual has
   * not been detected for.
   */
  noMotionDetectedTime: moment.Moment = moment();

  /**
   * Data to help visualise motion on a Heatmap.
   */
  motionActivity_heatmapData: any[];
  
  /**
   * Data to help count motion per location/room.
   */
  motionActivity_count: any;

  /**
   * Checks if the MQTT is running on its first run/ when the application launched and not
   * restarted by the user.
   */
  isFirstRun = true;

  /**
   * The obverable that gets called every interval to check if no motion has been detected for 
   * a specified amount of minutes
   */
  noMotionTimer: Subscription;



  /**
   * The number of milliseconds that the timer waits to be called again. Defaults to 60000 (1 minute).
   */
  noMotionTimer_interval: number = 60000;

  /**
   * 
   */
  noMotionTimer_durationOfNoMotion_minutes: number = 5; 

  /**
   * 
   */
  onNoMotionDetected: Function;

  constructor() {
    this.createNoMotionTimer();
  }

  private createNoMotionTimer() {
    this.noMotionTimer = Observable.interval(this.noMotionTimer_interval).subscribe((val) => { 
      this._onNoMotionDetected();
    });
  }

  private _onNoMotionDetected() {
    let noMotionSinceTime: moment.Moment = this.getNoMotionDetectedTime();
    let nowTime: moment.Moment = moment();

    console.log("nowTime.diff(noMotionSinceTime, 'minutes'): ", nowTime.diff(noMotionSinceTime, 'minutes'));
    if (nowTime.diff(noMotionSinceTime, 'minutes') >= this.noMotionTimer_durationOfNoMotion_minutes) {
      if(this.onNoMotionDetected) {
        this.onNoMotionDetected();
      }
    }
  }

  getNoMotionDetectedTime(): moment.Moment {
    if (this.locationBuffer_lastSeen && this.locationBuffer_lastSeen.length > 0) {
      return this.locationBuffer_lastSeen[0].timestamp;
    }
    return this.noMotionDetectedTime;
  }

  public connect = () => {
  	this.status = 'Connecting...';
    let host = 'barretts.ecs.vuw.ac.nz';
    //host = 'localhost';
  	this.client = new Paho.MQTT.Client(host, 8883, '/mqtt', this.clientId);
 	
	// set callback handlers
	this.client.onConnectionLost = this.onConnectionLost;
	this.client.onMessageArrived = this.onMessageArrived;

	// connect the client
	console.log('Connecting to mqtt via websocket');
	this.client.connect({timeout:10, useSSL:false, onSuccess:this.onConnect, onFailure:this.onFailure});
  }

  public disconnect () {
  	if(this.status == 'Connected') {
  		this.status = 'Disconnecting...';
      this.client.disconnect();
  		this.status = 'Disconnected';
  	}
  }

  /*public sendMessage () {
  	if(this.status == 'Connected') {
  		this.client.publish(this.topic, this.messageToSend);
  	}
  }*/

  public onConnect = () => {
    console.log('Connecting/Connected - Subscribing');

  	// subscribe
	this.client.subscribe(this.topic, {
		onSuccess: () => {
      console.log('Connected - Subscribe Suceeded');
      this.status = 'Connected';

      // Checks if this is NOT the first time, that way we can reset the last seen timer.
      //if(!this.isFirstRun) {
        this.noMotionDetectedTime = moment();
      //} else {
      //  this.isFirstRun = false;
      //}
      this.noMotionTimer.unsubscribe();
      this.createNoMotionTimer();

      this.locationBuffer = {};
      this.locationBuffer_lastSeen = [];
      this.motionActivity_heatmapData = [];
      this.motionActivity_count = {};
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
    //this.message = message.payloadString;
    this.addMessageToBuffer(message.payloadString);
    
    //console.log(this.locationBuffer);
    //console.log(this.motionActivity_count)
  }


  addMessageToBuffer(message) {
    let messageSplit: string[] = message.split(',');
    
    let timestamp = moment(messageSplit[0]);
    let location = messageSplit[1];
    let motion_status = Number.parseInt(messageSplit[2]);
    let battery_status = Number.parseInt(messageSplit[3]);

    this.locationBuffer = Object.assign(this.locationBuffer, { [location]: { timestamp, location, motion_status, battery_status }});

    if(motion_status === 1) {

      let freshMotion = false;
      for(let lastSeenLocation of this.locationBuffer_lastSeen) {
        if(timestamp.isAfter(lastSeenLocation.timestamp)) {
          freshMotion = true;
          break;
        }
      }

      if(freshMotion) {
        this.locationBuffer_lastSeen = [{ timestamp, location, motion_status, battery_status }];
        this.noMotionDetectedTime = timestamp;
      } else {
        this.locationBuffer_lastSeen.push({ timestamp, location, motion_status, battery_status });
      }
      let generateFunc = this.roomPos[location].bind(this);
      this.motionActivity_heatmapData.push(generateFunc());
      this.updateMotionActivityCount(location);
    }
  }

  updateMotionActivityCount(location: string) {
    if(this.motionActivity_count.hasOwnProperty(location)) {
      this.motionActivity_count[location] = this.motionActivity_count[location] + 1;
    } else {
      this.motionActivity_count[location] = 1;
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

  roomPos: any = {
    'bedroom' : this.generateBedroomPos,
    'toilet' : this.generateToiletPos,
    'living' : this.generateLivingRoomPos,
    'dining' : this.generateDiningRoomPos,
    'kitchen' : this.generateKitchenPos,
  };

  /*generateHousePos(): any {
    let generateFunctions = [this.generateKitchenPos, this.generateBedroomPos, this.generateToiletPos, this.generateLivingRoomPos, this.generateDiningRoomPos];
    let rnd_idx = this.getRandomInt(0, generateFunctions.length-1);
    let func = generateFunctions[rnd_idx].bind(this);
    return func();
  }*/

  generateBedroomPos(): any {
    return {x: this.getRandomInt(15,105), y: this.getRandomInt(145,200)};
  }

  generateToiletPos(): any {
    return {x: this.getRandomInt(135,180), y: this.getRandomInt(170,195)};
  }

  generateLivingRoomPos(): any {
    return {x: this.getRandomInt(15,120), y: this.getRandomInt(15,115)};
  }

  generateDiningRoomPos(): any {
    return {x: this.getRandomInt(250,350), y: this.getRandomInt(50,145)};
  }

  generateKitchenPos(): any {
    return {x: this.getRandomInt(230,335), y: this.getRandomInt(178,180)};
  }

  getRandomInt(min, max): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

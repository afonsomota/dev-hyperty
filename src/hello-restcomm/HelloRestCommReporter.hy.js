/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';
//import hello from './hello';

/**
* Hyperty Connector;
* @author Paulo Chainho [paulo-g-chainho@telecom.pt]
* @version 0.1.0
*/
class HelloRestCommReporter {

  /**
  * Create a new HelloWorldReporter
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */
  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');


    let _this = this;

    let domain = divideURL(hypertyURL).domain;
    _this._domain = domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/HelloWorldDataSchema';

    _this.bus = bus;
    
/*
    let msg = {
      type: 'create', from: hypertyURL, to: 'domain://restcomm/%2B351968332643', body: { }
    };

    bus.postMessage(msg);
*/
  }

  /**
  * Create HelloWorld Data Object
  * @param  {HypertyURL} HypertyURL - Invited
  */

  hello(hypertyURL) {
        let request = new XMLHttpRequest();
    	let user = 'AC031d14fff8b708f33e60b35604a9456f';
    	let password = '6c66676d97f8f332f568452ce950da20';
        let url = 'https://tadhack.restcomm.com/restcomm/2012-04-24/Accounts/AC031d14fff8b708f33e60b35604a9456f/SMS/Messages';
        let data="To=%2B351916193769&From=%2B351927945201&Body=This%20TADHACK%20hype";
        request.open('POST', url, true);
	request.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + password))
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send(JSON.parse(JSON.stringify(data)));
    /*let msg = {
      type: 'create', from: hypertyURL, to: 'domain://restcomm/%2B351968332643', body: { }
    };

    this.bus.postMessage(msg);*/
  }

  /**
  * Update HelloWorld Data Object
  *
  */

  bye(byeMsg) {
    
  }


}



export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'HelloRestCommReporter',
    instance: new HelloRestCommReporter(hypertyURL, bus, configuration)
  };

}

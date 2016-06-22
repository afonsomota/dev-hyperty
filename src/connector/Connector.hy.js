/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

/* jshint undef: true */

// Service Framework
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import {divideURL} from '../utils/utils';

// Internals
import ConnectionController from './ConnectionController';
import { connection } from './connection';
import Search from './Search';

/**
 *
 */
class Connector {

  /**
  * Create a new Hyperty Connector
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */
  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    _this._hypertyURL = hypertyURL;
    _this._bus = bus;
    _this._configuration = configuration;
    _this._domain = divideURL(hypertyURL).domain;

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Connection';

    _this._controllers = {};
    _this.connectionObject = connection;

    let discovery = new Discovery(hypertyURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

    _this.discovery = discovery;
    _this.identityManager = identityManager;

    _this.search = new Search(discovery, identityManager);

    console.log('Discover: ', discovery);
    console.log('Identity Manager: ', identityManager);

    let syncher = new Syncher(hypertyURL, bus, configuration);

    syncher.onNotification((event) => {

      let _this = this;

      console.log('On Notification: ', event);

      if (event.type === 'create') {
        console.info('------------ Acknowledges the Reporter - Create ------------ \n');
        event.ack();

        if (_this._controllers[event.from]) {
          _this._autoSubscribe(event);
        } else {
          _this._autoAccept(event);
        }

        console.info('------------------------ End Create ---------------------- \n');

      }

      if (event.type === 'delete') {
        console.info('------------ Acknowledges the Reporter - Delete ------------ \n');
        event.ack(200);

        console.log(_this._controllers);
        if (_this._controllers) {
          Object.keys(_this._controllers).forEach((controller) => {
            _this._controllers[controller].deleteEvent = event;
            delete _this._controllers[controller];

            console.log('Controllers:', _this._controllers);
          });
        }

        console.info('------------------------ End Create ---------------------- \n');
      }

    });

    _this._syncher = syncher;
  }

  _autoSubscribe(event) {
    let _this = this;
    let syncher = _this._syncher;

    console.info('---------------- Syncher Subscribe (Auto Subscribe) ---------------- \n');
    console.info('Subscribe URL Object ', event);
    syncher.subscribe(_this._objectDescURL, event.url).then(function(dataObjectObserver) {
      console.info('1. Return Subscribe Data Object Observer', dataObjectObserver);
      _this._controllers[event.from].dataObjectObserver = dataObjectObserver;
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  _autoAccept(event) {
    let _this = this;
    let syncher = _this._syncher;

    console.info('---------------- Syncher Subscribe (Auto Accept) ---------------- \n');
    console.info('Subscribe URL Object ', event);
    syncher.subscribe(_this._objectDescURL, event.url).then(function(dataObjectObserver) {
      console.info('1. Return Subscribe Data Object Observer', dataObjectObserver);

      let connectionController = new ConnectionController(syncher, _this._domain, _this._configuration);
      connectionController.connectionEvent = event;
      connectionController.dataObjectObserver = dataObjectObserver;
      _this._controllers[event.from] = connectionController;

      if (_this._onInvitation) _this._onInvitation(connectionController, event.identity);

      console.info('------------------------ END ---------------------- \n');
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  /**
   * This function is used to create a new connection providing the identifier of the user to be notified.
   * @param  {URL.UserURL}        userURL      user to be invited that is identified with reTHINK User URL.
   * @param  {MediaStream}        stream       WebRTC local MediaStream retrieved by the Application
   * @param  {string}             name         is a string to identify the connection.
   * @return {<Promise>ConnectionController}   A ConnectionController object as a Promise.
   */
  connect(userURL, stream, name) {
    // TODO: Pass argument options as a stream, because is specific of implementation;
    // TODO: CHange the hypertyURL for a list of URLS
    let _this = this;
    let syncher = _this._syncher;

    return new Promise(function(resolve, reject) {

      let connectionController;
      let selectedHyperty;
      console.info('------------------------ Syncher Create ---------------------- \n');

      let connectionName = 'Connection';
      if (name) {
        connectionName = name;
      }

      _this.search.myIdentity().then(function(identity) {

        console.log('identity: ', identity, _this.connectionObject);

        // Initial data
        _this.connectionObject.name = connectionName;
        _this.connectionObject.scheme = 'connection';
        _this.connectionObject.status = '';
        _this.connectionObject.owner = identity.userURL;
        _this.connectionObject.peer = '';

        return _this.search.users([userURL]);
      })
      .then(function(hyperties) {

        let hypertiesURLs = hyperties.map(function(hyperty) {
          return hyperty.hypertyID;
        });

        // Only support one to one connection;
        selectedHyperty = hypertiesURLs[0];
        console.info('Only support communication one to one, selected hyperty: ', selectedHyperty);
        return syncher.create(_this._objectDescURL, [selectedHyperty], _this.connectionObject);
      })
      .catch(function(reason) {
        console.error(reason);
        reject(reason);
      })
      .then(function(dataObjectReporter) {
        console.info('1. Return Create Data Object Reporter', dataObjectReporter);

        connectionController = new ConnectionController(syncher, _this._domain, _this._configuration);
        connectionController.mediaStream = stream;
        connectionController.dataObjectReporter = dataObjectReporter;

        _this._controllers[selectedHyperty] = connectionController;

        resolve(connectionController);
        console.info('--------------------------- END --------------------------- \n');
      })
      .catch(function(reason) {
        console.error(reason);
        reject(reason);
      });

    });
  }

  /**
   * This function is used to handle notifications about incoming requests to create a new connection.
   * @param  {Function} callback
   * @return {event}
   */
  onInvitation(callback) {
    let _this = this;
    _this._onInvitation = callback;
  }

}

/**
 * Function will activate the hyperty on the runtime
 * @param  {URL.URL} hypertyURL   url which identifies the hyperty
 * @param  {MiniBus} bus          Minibus used to make the communication between hyperty and runtime;
 * @param  {object} configuration configuration
 */
export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'Connector',
    instance: new Connector(hypertyURL, bus, configuration)
  };

}
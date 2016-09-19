import IdentityManager from 'service-framework/dist/IdentityManager';
import {Syncher} from 'service-framework/dist/Syncher';
import Discovery from 'service-framework/dist/Discovery';
import {divideURL} from '../utils/utils';
import Search from '../utils/Search';

class BraceletSensorObserver {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');
    let _this = this;
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
    console.log('hypertyURL->', hypertyURL);
    _this._domain = divideURL(hypertyURL).domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Context';

    console.log('Init BraceletSensorObserver: ', hypertyURL);
    _this._syncher = new Syncher(hypertyURL, bus, configuration);
    let discovery = new Discovery(hypertyURL, bus);
    _this._discovery = discovery;
    _this.identityManager = identityManager;
    _this.search = new Search(discovery, identityManager);
    window.discovery = _this._discovery;
  }

  discovery(email,domain)
  {
    let _this = this;
    return new Promise(function(resolve,reject) {
      _this.search.users([email], [domain], ['context'], ['steps', 'battery']).then(function(a) {
        console.log('result search users->', a);
        resolve(a);
      });
    });
  }

  connect(hypertyID)
  {
    let _this = this;
    return new Promise(function(resolve,reject) {
        _this._discovery.discoverDataObjectPerReporter(hypertyID, _this._domain).then(function(dataObject) {
          console.log('discovery dataobject', dataObject);
          let key = Object.keys(dataObject);
          console.log('URL DATA Object', key[0]);
          resolve(key[0]);
        });
      });
  }

  ObserveBracelet(url) {
    let _this = this;
    return new Promise(function(resolve,reject) {
        _this._syncher.subscribe(_this._objectDescURL, url).then((observer) => {
          console.log('data object observer', observer);
          resolve(observer);
          observer.onChange('*', (event) => {
            console.log('event->->->->->:', event);

            if (_this._onChange) _this._onChange(event);
          });
        });
      });

  }

  onChange(callback) {
    let _this = this;
    _this._onChange = callback;
  }
}

export default function activate(hypertyURL, bus, configuration) {
  return {
    name: 'BraceletSensorObserver',
    instance: new BraceletSensorObserver(hypertyURL, bus, configuration)
  };
}

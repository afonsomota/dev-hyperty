/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';
import room from './room';
import EventEmitter from '../utils/EventEmitter';

class RoomUIReporter extends EventEmitter {

    /**
     * Create a new RoomUIReporter
     * @param  {Syncher} syncher - Syncher provided from the runtime core
     */
    constructor(hypertyURL, bus, configuration) {

        if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
        if (!bus) throw new Error('The MiniBus is a needed parameter');
        if (!configuration) throw new Error('The configuration is a needed parameter');

        super();

        let _this = this;
        _this._domain = divideURL(hypertyURL).domain;

        _this._objectDescURL = 'hyperty-catalogue://' + _this._domain + '/.well-known/dataschemas/RoomUIDataSchema';

        console.log("My hyperty URL: ", hypertyURL);
        _this.hypertyURL = hypertyURL;

        let syncher = new Syncher(hypertyURL, bus, configuration);

        _this._syncher = syncher;

        syncher.create(_this._objectDescURL, [hypertyURL], {"test": "testval"}).then(function (roomObjtReporter) {
            console.info('1. Return Created Room Data Object Reporter', roomObjtReporter);

            _this.roomObjtReporter = roomObjtReporter;

            _this.trigger('objUrl', roomObjtReporter._url);

            roomObjtReporter.onSubscription(function (event) {
                console.info('-------- Room Reporter received subscription request --------- \n');

                // All subscription requested are accepted

                event.accept();
                _this.trigger('onSubscribe', event);
            });

        }).catch(function (reason) {
            console.error(reason);
        });


    }

    modifyRoom() {
        let _this = this;
        _this.roomObjtReporter.data.test = Math.random().toString(36).substr(2, 5);
    }
}


export default function activate(hypertyURL, bus, configuration) {

    return {
        name: 'RoomUIReporter',
        instance: new RoomUIReporter(hypertyURL, bus, configuration)
    };

}

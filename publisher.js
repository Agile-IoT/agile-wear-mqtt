const mqtt      = require('mqtt');
const noble     = require('noble');
const async     = require('async');
const int64buf  = require('int64-buffer');
const ambio     = require('./assets/ambiotex-utils');
const tuAddr    = require('./assets/ambiotex-ble-addresses');
const client    = mqtt.connect('mqtt://localhost');

console.log('Waiting for MQTT server...')

var peripheralGlobal            = null;
var peripheralGlobalInfo        = null;
var collectionWasInterrupted    = false;
var unitDataPackages            = [];
var unitDataRecordsPackages     = {};
var unitDataFinal               = [];
var fetchedRecords              = 0;
var collectorObj                = {
    currentRecord: {
        record_index: 0,
        record_id: null,
        packages_pool: 0,
        package_fragments_pool: 0,
        packages_collected: 0
    },
    records_pool: 0,
    records_collected: 0
}

function liveNotifications() {
    peripheralGlobal.discoverServices([tuAddr.addr().SYNCHRONIZATION_SERVICE_INFO], function(error, services) {
        var target_service = services[0];

        target_service.discoverCharacteristics([tuAddr.addr().TRANSMIT_LIVE_RECORD_CHAR], function(error, characteristics) {
            var liveRecord_char = characteristics[0];
            
            function subscribeToLiveRecord() {
                console.log("\n\n Subscribed for Live Records...");
                liveRecord_char.subscribe(function (error) {
                    if (error) console.log(error);
                    isSubscribed = 1;
                });
            };

            liveRecord_char.on('data', function (data, isNotification) {
                if (data.length > 4) {
                    console.log(data);
                    client.publish('live-data', data);
                }
            });

            subscribeToLiveRecord();
        });
    });

    return null;
};

function stopScanningForPeripherals(peripheral, callback) {
    try {
        noble.stopScanning();
    } catch(e) {
        appBlockingError(e);
    }
    callback(null, peripheral);
}

async function connectToPeripheral(peripheral) {
    var peripheral      = await ambio.connectToPeripheral(peripheral);
    peripheralGlobal    = peripheral
    
    return peripheral;
}

async function getPeripheralInformation(peripheral) {
    var model_number        = await ambio.readDataFromCharacteristic(
        peripheral, 
        tuAddr.addr().DEVICE_INFO_SERVICE, 
        tuAddr.addr().MODEL_NUMBER_CHAR
    )
    var firmware_version    = await ambio.readDataFromCharacteristic(
        peripheral,
        tuAddr.addr().DEVICE_INFO_SERVICE,
        tuAddr.addr().FIRMWARE_VERSION_CHAR
    )
    var hardware_serial     = await ambio.readDataFromCharacteristic(
        peripheral,
        tuAddr.addr().DEVICE_INFO_SERVICE,
        tuAddr.addr().HARDWARE_SERIAL_CHAR
    )
    var battery_level       = await ambio.readDataFromCharacteristic(
        peripheral,
        tuAddr.addr().BATTERY_SERVICE,
        tuAddr.addr().BATTERY_LEVEL_CHAR
    )
    var maximum_storage     = await ambio.readDataFromCharacteristic(
        peripheral,
        tuAddr.addr().INTERNAL_STORAGE_SERVICE,
        tuAddr.addr().MAXIMUM_STORAGE_CHAR
    )
    var free_storage        = await ambio.readDataFromCharacteristic(
        peripheral,
        tuAddr.addr().INTERNAL_STORAGE_SERVICE,
        tuAddr.addr().FREE_STORAGE_CHAR
    )
    
    peripheralGlobalInfo = {
        model_number:       model_number.toString('utf8'),
        firmware_version:   firmware_version.toString('utf8'),
        hardware_serial:    hardware_serial.toString('utf8'),
        battery_level:      battery_level.readUInt8(0) + "%",
        maximum_storage:    maximum_storage.readUInt32LE(0),
        free_storage:       Math.floor(((free_storage.readUInt32LE(0) * 100) / maximum_storage.readUInt32LE(0))) + "%"
    };

    liveNotifications();

    return peripheralGlobalInfo
}

function scan_for_device(state) {
    if (state === 'poweredOn') {
        noble.startScanning([tuAddr.addr().RESPIRATORY_SERVICE_INFO], false);
        console.log("Started scanning for Ambiotex TU...");
    } else {
        noble.stopScanning();
        console.log("There seems to be a problem with the Bluetooth Adapter.");
    }
}

function find_device(peripheral) {
    console.log('discovered: ' + peripheral.advertisement.localName);
    async.waterfall([
        function (callback) {
            callback(null, peripheral);
        },
        stopScanningForPeripherals,
        connectToPeripheral,
        getPeripheralInformation
    ], function (err, result) {
        if(collectionWasInterrupted) getDataFromAmbiotexTU();
    });
}

client.on('connect', function () {
    noble.on('stateChange', scan_for_device);
    noble.on('discover', find_device);
})
exports.parsePackageBuffer              = function (timestamp, packageBuffer) {
    var rs1                 = packageBuffer.slice(0,2).readInt16LE(0);
    var rs2                 = packageBuffer.slice(2,4).readInt16LE(0);
    var rs3                 = packageBuffer.slice(4,6).readInt16LE(0);
    var rs4                 = packageBuffer.slice(6,8).readInt16LE(0);
    var rs5                 = packageBuffer.slice(8,10).readInt16LE(0);
    var rs6                 = packageBuffer.slice(10,12).readInt16LE(0);
    var rs7                 = packageBuffer.slice(12,14).readInt16LE(0);
    var rs8                 = packageBuffer.slice(14,16).readInt16LE(0);
    var rs9                 = packageBuffer.slice(16,18).readInt16LE(0);
    var rs10                = packageBuffer.slice(18,20).readInt16LE(0);
    var rs11                = packageBuffer.slice(20,22).readInt16LE(0);
    var rs12                = packageBuffer.slice(22,24).readInt16LE(0);
    var rs13                = packageBuffer.slice(24,26).readInt16LE(0);
    var rs14                = packageBuffer.slice(26,28).readInt16LE(0);
    var rs15                = packageBuffer.slice(28,30).readInt16LE(0);
    var rs16                = packageBuffer.slice(30,32).readInt16LE(0);
    var rrIntervalArray1    = packageBuffer.slice(32,34).readUInt16LE(0);
    var rrIntervalArray2    = packageBuffer.slice(34,36).readUInt16LE(0);
    var rrIntervalArray3    = packageBuffer.slice(36,38).readUInt16LE(0);
    var rrIntervalArray4    = packageBuffer.slice(38,40).readUInt16LE(0);
    var rrToRsOffset        = packageBuffer.slice(40,42).readInt16LE(0);
    var rsRate              = packageBuffer.slice(42,44).readUInt16LE(0);
    var hr                  = packageBuffer.slice(44,46).readUInt16LE(0);
    var activityLevel       = packageBuffer.slice(46,47).readUInt8(0);
    var pedometer           = packageBuffer.slice(47,48).readUInt8(0);

    return timestamp 
        + "," + hr 
        + "," + rrIntervalArray1 
        + "," + rrIntervalArray2 
        + "," + rrIntervalArray3 
        + "," + rrIntervalArray4
        + "," + activityLevel
        + "," + pedometer
        + "," + rsRate
        + "," + rs1
        + "," + rs2
        + "," + rs3
        + "," + rs4
        + "," + rs5
        + "," + rs6
        + "," + rs7
        + "," + rs8
        + "," + rs9
        + "," + rs10
        + "," + rs11
        + "," + rs12
        + "," + rs13
        + "," + rs14
        + "," + rs15
        + "," + rs16
        + "\n";
}

exports.parseSavedRecordBuffer          = function (recordBuffer) {
    return {
        id:                 recordBuffer.slice(0, 4),
        flag:               recordBuffer.slice(4, 5).readUInt8(0),
        seconds:            recordBuffer.slice(5, 6).readUInt8(0),
        minutes:            recordBuffer.slice(6, 7).readUInt8(0),
        hours:              recordBuffer.slice(7, 8).readUInt8(0),
        day:                recordBuffer.slice(8, 9).readUInt8(0),
        month:              recordBuffer.slice(9, 10).readUInt8(0),
        year:               recordBuffer.slice(10, 12).readUInt16LE(0),
        numberOfPackages:   recordBuffer.slice(12, 16).readUInt32LE(0),
        durationInSeconds:  recordBuffer.slice(12, 16).readUInt32LE(0)
    }

}

exports.genCharacteristicPayload        = function (data) {
    var arrayData = Buffer.concat([
        data.record_id,
        new Buffer([0,0,0,0,0,0,0,0])
    ], 12);

    return arrayData;
}

exports.connectToPeripheral             = function (peripheral) {
    return new Promise(resolve => {
        peripheral.connect(function (error) {
            resolve(peripheral);
        });
    });
}

exports.readDataFromCharacteristic      = function (peripheral, service, characteristic) {
    var data;

    return new Promise(resolve => {
        peripheral.discoverServices([service], function (error, services) {
            var target_service = services[0];

            target_service.discoverCharacteristics([characteristic], function (error, characteristics) {
                var target_char = characteristics[0];
                
                target_char.read(function(error, data) {
                    resolve(data);
                });
            })
        });
    });
}
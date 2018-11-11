# Ambiotex MQTT Broker

## Description

This project features an MQTT server (based on [Mosca](https://github.com/mcollina/mosca)) and a publisher which connects to the Ambiotex Tech Unit and publishes sensor data.

## Requirements

- NodeJS and NPM installed
- Ambiotex Tech Unit (firmware v.3.2.0)
- [Noble requirements based on your OS](https://github.com/noble/noble)

## Installation

Clone this repository to your preferred directory:
```
$ git clone <this repository>
```

Once you are in the project's root directory, run:
```
$ npm i
```

Afterwards, to start the MQTT server, simply run:
```
$ npm run-script server
```

And then, to run the publisher:
```
$ npm run-script publisher
```

This will initiate both processes and emit data which you can subscribe to from another client.

## Help & Support

contact: stefanos@wearhealth.com


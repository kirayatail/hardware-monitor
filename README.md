# hardware-monitor
A small application which ties Open Hardware Monitor to Arduino in order to visualize monitor data using physical electronics. 

## Requirements

This app relies on [Open Hardware Monitor](https://github.com/openhardwaremonitor/openhardwaremonitor) or [Libre Hardware Monitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) (or a similar clone), exposing its data to a local web server. Pick a version which supports your devices (motherboard, CPU, GPU and so on)

It also requires a [NodeJS](https://nodejs.org) runtime with npm, and you'll probably need some Javascript skills to configure the app to fit your purpose.

Finally, it needs a microcontroller that can receive data over a serial port (USB for example), I've included code for [Arduino](https://www.arduino.cc) which you need the Arduino development environment to compile and upload to your board. I'm running this on an Arduino Uno, using 3 independent PWM enabled output ports.

## Installation

1. Install NodeJS on your system
2. Download or clone this repository, navigate to it using a terminal with Node and NPM
3. Run `npm install` to get dependencies and your personal copy of the file `monitor/settings.js`
4. Install and run Open Hardware Monitor, make sure to enable the feature 'remote web server'
5. See the section about editing `settings.js` to customize and configure the application
6. Compile and upload the Arduino program to your Arduino board. See section about Arduino for more information
7. Run the program using the command `npm start` or `node monitor/main.js`

## Configuration - settings.js

Start by running Open Hardware Monitor, open either its own GUI or the web page associated with its server. You will be finding and registering paths to different sensor values in the settings file for hardware-monitor

Open the file `monitor/settings.js` in your favorite text editor. It is designed as a JS object which is exposed as a Node module. The exposed object should contain two properties, the `ohmUrl` which points at the Open Hardware Monitor web server (make sure the URL is correct for your system), and a `values` property, which is an array of the values you wish to track. 

Each entry in the `values` property should contain a `path` and a `map`. The `path` is an array of strings which should represent the path to a certain value in the Open Hardware Monitor tree structure. The example `['Computername', 'CPUname', 'Load', 'CPU Total']` is valid for a computer with the system name `Computername`, and a CPU model named `CPUname`. Change these values to match the parameters of your system. Sometimes you may have several devices or sensors sharing a name (for example two identical GPUs), and in those cases both paths will be followed, and an average of the values will be returned.

The `map` is a mapping function for formatting the data and preparing it for being sent to the Arduino. It's useful for transforming a data range to utilize the full value range of the Arduino output, which for PWM on an Arduino Uno is a full `byte`, a value from 0 to 255. The example shows a linear mapping from a value between 0 and 100 (as expected from a CPU load percentage), to between 0 and 255. Expect more useful mapping functions to be available in the future, or write your own.

Copy the whole value entry as many times as you have sensors to include, modify the `path` and `map` according to your needs. Make sure to take note of the order of the entries, this will be the order the data is sent to the Arduino.

## Arduino

The Arduino program included is written to handle three data points, and expose them by receiving the value over serial communication, and setting the value as PWM voltage to each of the three ports. This configuration is according to my personal setup, so modification may be necessary.

The important point to make the Arduino program work with the NodeJS program, is the serial communication. The whole system is based on the Arduino sending a `ready\r\n` signal to show that it's ready to receive data, upon which, the NodeJS program fetches fresh data from Open Hardware Monitor and sends the formatted result to the Arduino, and then wait for the next `ready` signal. The data is sent as a single byte per entry in the `settings.values` array, this is what the Arduino should expect to read from the Serial port.

Make sure that the order the values are read and handled matches the order of entries in the `settings.values` array. Also note that the system won't work out of the box, the Arduino expects three values and the initial settings file only has one. Modify both to match your system.

Before running the NodeJS program, make sure the Arduino is connected via USB, and the serial port isn't blocked by another application (for example the Arduino IDE Serial Monitor). Once you start the NodeJS program, the Arduino will reboot and the serial port will be blocked. Once the setup sequence is complete and the Arduino sends its first `ready\r\n` signal, the NodeJS program will start sending data.

## Future development

A new valueMap will be designed for a non-linear curve (designed for the temperature gauge). 

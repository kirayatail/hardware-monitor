# Documentation

Here you'll find the human-readable algorithm I chose for implementing the program.
This document may be useful if you're not familiar with Javascript or the functional
style I'm using.

## General algorithm

The application basically does this:

1. Set up dependencies

2. Try to find which port the Arduino is connected to (see Serial Port for more)

3. Listen and wait for the `ready\r\n` signal

  a. When received, get data from Open Hardware Monitor (see OHM for more)

  b. If data from OHM is nicely defined, send the data directly to arduino

  c. Loop back and listen for the next `ready\r\n` signal

4. Terminate the program when the Arduino is disconnected

  x. In any case any external call fails (for example, OHM is offline) an error will be written to the console.

## Serial Port

This application uses the 3rd party package [SerialPort](https://serialport.io/)
for communicating with the Arduino. It's based on a couple of event handlers and
a set of convenience functions called parses, which will help you read the stream
and format the data received.

To make this application more robust and automated, it tries to get a list of
connected com port devices, and filter that list to find the Arduino. See code example below.

```
// Get list of ports -> Filter on manufacturer containing 'Arduino' ->
// Transform to expose comName (name of the serial port)
SerialPort.list().then(
  ports => {
    const portNames = ports.filter(p => p.manufacturer.indexOf('Arduino') > -1).map(p => p.comName)
```
If all goes well, there should be at least one item in the portNames array.
A port connection is set up, with a standard baudrate of 9600 on the first com
port from the portNames list. Set up a Parser object that listens to the predetermined
message from the Arduino (`ready\r\n` in my case).
```
parser.on('data', data => {
  OHM.getValues().then(data => {
    port.write(data);
  },
  console.error);
});
```
Once data is received from the Arduino, trigger the `getValues()` function from
the OHM module and then write that data to the serial port.

## OHM

The OHM module is a utility which wraps the `http.get` function and does some
computation/formatting to the data which is fetched from the Open Hardware Monitor
web service.

Here's a diagram of the data processing done by the OHM util

The Open Hardware Monitor `data.json` resource is formatted in a very verbose way,
matching their own requirements for displaying all entity steps in the device hierarchy.
Each device, devices within the device and properties within them, follow the
same pattern:
```
{
  Text: "name of entity",
  Children: [
    <objects of the same format>
  ],
  ...
}
```
The first part takes the set of paths that are defined in the Settings file, and
use the paths to drill down into the Children-arrays, filtering on the Text property
along the way. Since devices and properties are allowed to have the same name, the
filtering function treats all incoming objects as an equal set of entities, drilling
down into all of them simultaneously using the same criteria. In the end, you may
end up with a whole set of values. All of them are converted to numbers and reduced
to an average, leaving a single value per original path from the Settings file.

The value is then mapped through the value mapping function which is also provided
in the Settings file. Each value may specify their own mapper, so you can have
different scales for temps and percentages for example. The mapping functions are
further described in the next chapter.

## Value maps

Apart from the Settings file, the valuemap file is the second place I encourage
you to modify and add your own functions. The goal of each mapping function is to
take the value that comes out in the middle of the OHM util and transform it to
match the range for the Arduino, which generally is an unsigned byte, or 0-255.

The mapping can be linear, polynomial, parametrized, or any other kind of
pseudo-continuous function. The example I provide are designed to limit the output
at the bounds specified in the call, to avoid unexpected behavior on the Arduino.
I strongly suggest that all mapping functions (including the ones you decide to
write yourself) should follow the same pattern, however, setting a more restricted
output range may give you effects like only using a certain part of the meter for
example.

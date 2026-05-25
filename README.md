# Fabrica-IO Data Visualizer
This is a module to add a simple data visualizer to the Fabrica-IO web frontend. This will render graphs for each sensor parameter from data recorded locally on the device.

## Installation
This uses the [D3](https://d3js.org/) library to render the graphs. A copy of that library is included in this repository for convenience, but it can also be downloaded directly from their website [here](https://d3js.org/d3.v7.min.js).

This visualizer requires use of the Fabrica-IO [LocalDataLogger](https://github.com/FabricaIO/actor-LocalDataLogger) actor to collect the data for rendering. After including that actor in your project, set the file name of the LocalDataLogger to `Data.csv` from the Device Manager.

Using the Storage Manager on your device, upload the following files from this repository to `WWW`:

1. [d3.v7.min.js](/d3.v7.min.js)
2. [visualize.html](/visualize.html)
3. [visualize-script.js](/visualize-script.js)

## Usage

It's strongly recommended to make sure the time is set correctly on your device. By default this is done by NTP if connecting the device to your WiFi and internet, or you can set the time manually from the home page or use an external [RTC module](https://github.com/FabricaIO/actor-DFDS1307RTC). While this can work without setting the time, the data points recorded won't link to the correct date and time.

To view the graphs of all sensor parameters visit the `/visualize.html` path. That is, `http://<device_address>/visualize.html`, replacing `<device_address>` with the web interface address of your device.

That's it! You'll see graphs of all the sensor parameters. The Refresh Data button will update the graphs with any new data collected (the graphs will not refresh automatically).

> [!IMPORTANT]
> Make sure you enable the LocalDataLogger from the Device Manager, and that you enable tasks from the Hub Configuration. If no data has been collected then no graphs will be rendered. The longest period you set for either the Sampling Period for the LocalDataLogger or the device taskPeriod will set how frequently data points are collected.

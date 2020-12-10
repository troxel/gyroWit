# gyroWit
A node module to communicate with a Wit Motion IMU. Specifically this works the WitMotion HWT905 but I suspect will work with other similar Wit Motion devices. In fact, it probably works with any device using the MPU6050 IC.

# Synopsis 

    Gyro = require('./gyrowit');

    const gyroConf = { comm:'COM17',baudRate:57600 };

    port = Gyro.open(gyroConf);

The module emits a "state" event at the output rate 

    port.on('state',function() { console.log(State); doSomething(state); };
    
Where State is an object consisting of    

    State['angle']     = [angles]
    State['angleRate'] = [angle rates]
    State['acc']       = [acceleration];

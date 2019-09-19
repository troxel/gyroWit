const SerialPort = require('serialport')

var State = new Object;
State['angle']     = new Float32Array(3);
State['angleRate'] = new Float32Array(3);
State['acc']       = new Float32Array(3);

module.exports.State;

module.exports.open = function(gyroConf)
{
   var chunk= new Uint8Array;
   var timestamp_past = Date.now();

   var count = 0;

   var acc_str,angleRate_str,angle_str;

   const port = new SerialPort(gyroConf['comm'], {
      baudRate: gyroConf['baudRate']
   })

   // Setup events
   port.on('error', function(err) {
      console.log('Error: ', err.message)
   })

   port.on('readable', function () {

      // Read while there 11 bytes of data
      while ( chunk = port.read(11) )
      {
         if ( chunk == null ) { return; }
         if ( chunk[0] != 0x55 )
         {
            console.log("\n out of sync ",chunk.byteLength)
            console.log(chunk.map(x => x.toString(16)));
            port.read(1);
            //while ( port.read() )
            //{
            //   continue; // drain buffer
            //}
            return;
         }

         //var timestamp_now = Date.now();
         //delta = timestamp_now - timestamp_past;
         //timestamp_past = timestamp_now;
         //console.log('Data1:', timestamp_now, delta, chunk);

         switch( chunk[1] )
         {
         case 0x51:

            const conv_acc = 16/32768.0;
            State['acc'] = muster_byte_data(chunk, conv_acc);

            acc_str = State['acc'].map(x => x.toFixed(3)).join(" ");

            break;
         case 0x52:

            var conv_angleRate = 2000/32768.0;

            State['angleRate'] = muster_byte_data(chunk, conv_angleRate);
            //for (var i=0;i<3;i++)
            //{
            //   let inx = (i*2);
            //   State['angleRate'][i] = ( ( (chunk[(inx+3)]<<8 | chunk[(inx+2)]) << 16) >> 16) * conv_angleRate;
            //}

            angleRate_str = State['angleRate'].map(x => x.toFixed(3)).join(" ");

            break;
         case 0x53:

            var conv_angle = (180/32768.0);
            State['angle'] = muster_byte_data(chunk, conv_angle);

            angle_str = State['angle'].map(x => x.toFixed(3)).join(" ");

            //if ( State && (( count % 10 ) == 0 ) )
            //{
               //console.log(angle_str," | ",angleRate_str," | ",acc_str);

               State['ts'] = Date.now();
               State['count'] = count;

               port.emit('state',State);
            //}
            count++;

            //T = (short(chunk[9]<<8| chunk[8]))/340.0+36.25;

            break;
         }
      }
   })

   return(port);

} // End Open...

// Common pattern building 3-D vectors
function muster_byte_data(chunk, conv_factor)
{
   let valVector = [3];
   for (var i=0;i<3;i++)
   {
      let inx = (i*2);
      valVector[i] = ( ( (chunk[(inx+3)]<<8 | chunk[(inx+2)]) <<16 )>>16) * conv_factor;
   }

   return valVector;
}

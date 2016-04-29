# blocktool
utilities for blockchain systems integration

### installation
* ```git clone https://github.com/colealbon/blocktool.git;```  
* ```cd blocktool;```  
* ```npm install;```  
* ```cp config/options.js.example config/options.js;```  
* ```npm test;``` or ```mocha --harmony test``` (optional)

### usage ( a month of txids )
```
starttime=`dconv -i '%Y%m%d%H%M%S' 20160401000000 -f %s`;
endtime=`dconv -i '%Y%m%d%H%M%S'   20160501000000 -f %s`
chunktimeperiodseconds=3600;
chunkstart=$starttime;
while [ $chunkstart -le $endtime ];
do
    chunkstop=`expr $chunkstart + $chunktimeperiodseconds + 1`;
    if [ $endtime -le $chunkstop ]; then chunkstop=`expr $endtime`; fi;
    curl -s --insecure https://127.0.0.1:9000/txid?starttime=$chunkstart\&endtime=$chunkstop\&api_key=special-key
    chunkstart=$chunkstop;
    if [ $chunkstart -ge $endtime ];then break; fi;
done;
```

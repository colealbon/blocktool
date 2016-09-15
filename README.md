# blocktool
utilities for blockchain systems integration

### installation
* ```git clone https://github.com/colealbon/blocktool.git;```  
* ```cd blocktool;```  
* ```npm install;```  
* ```cp config/options.js.example config/options.js;```  
* ```npm test;``` or ```mocha --harmony test``` (optional)

### screenshots

[![live satus](https://github.com/colealbon/blocktool/blob/master/public/screenshots/index.png?raw=true)](#monitor)
[![swagger](https://github.com/colealbon/blocktool/blob/master/public/screenshots/swagger.png?raw=true)](#swaggerapi)
[![days destroyed](https://github.com/colealbon/blocktool/blob/master/public/screenshots/transaction_summary.png?raw=true)](#transaction)


### usage ( a day of txids  ./scratch.sh 20160404000000 1 )
node --harmony app.js
or 
koa-cluster app.js

go to here: 
https://127.0.0.1:9000

```
targetdate=$1;
days_to_process=$2;
seconds_to_process=`expr $days_to_process \\* 24 \\* 60 \\* 60`
starttime=`dconv -i '%Y%m%d%H%M%S' $targetdate -f %s`;
endtime=`expr $starttime + $seconds_to_process - 1`;
chunktimeperiodseconds=3600;
chunkstart=$starttime;
mkdir -p work/$targetdate;
while [ $chunkstart -lt $endtime ];
do
    chunkstop=`expr $chunkstart + $chunktimeperiodseconds`;
    chunkstop=`expr $chunkstop - 1`;
    if [ $chunkstop -gt $endtime ]; then chunkstop=`expr $endtime`; fi;
    fileexists="./work/$targetdate/$chunkstart.json";
    if [ -f $fileexists ];
    then
        sleep .1;
    else
        curl -s --retry 5 --insecure https://127.0.0.1:9000/txid?starttime=$chunkstart\&endtime=$chunkstop\&api_key=special-key|jq -r .txid|grep --line-buffered .| \
        sed 's/,//g' | \
        awk '{system("curl -s --retry 5 --insecure https://127.0.0.1:9000/transactionsignature?txid="$1)}' | jq -c . >> ./work/$targetdate/$chunkstart.json;
    fi;
    chunkstart=`expr $chunkstart + $chunktimeperiodseconds`;
done;
cd work;
tar -jcf $targetdate.tar.bz2 $targetdate;
rm -r $targetdate;
cd ..;
```

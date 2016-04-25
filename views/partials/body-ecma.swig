
<script src='/socket.io/socket.io.js'></script>

<script>
   {# load socket io after rest of content seemed like good idea at some point#}
    function socketconnect () {
        var socket = io('https://{{ https_host }}:{{ https_port }}');
    }
    var socketioElement=document.createElement('script')
    socketioElement.setAttribute("type", "text/javascript")
    socketioElement.setAttribute("src", "/socket.io/socket.io.js")
    document.head.appendChild(socketioElement)
</script>

<script>
    var socket = io();
    var LATEST_BLOCKTIME;
    socket.on('pulsetime', function(timestamp) {
        const timestampStr = new Date(timestamp).toLocaleString();
        document.getElementById('pulsetime').innerHTML = timestampStr;
        LATEST_BLOCKTIME = Date.parse(document.getElementById('blocktime').innerHTML) / 1000;
        const seconds_since_last_block = parseInt((timestamp / 1000), 10) - LATEST_BLOCKTIME
        var time_since_last_block = new Date(null);
        time_since_last_block.setSeconds(seconds_since_last_block);
        document.getElementById('time_since_last_block').innerHTML = time_since_last_block.toISOString().substr(11, 8);
    });
    socket.on('blockcount', function(blockcount) {
        console.log('blockcount: ', blockcount);
        document.getElementById('blockcount').innerHTML = blockcount;
    });
    socket.on('blocktime', function(blocktime) {
        const blockTimeStr = new Date(blocktime * 1000).toLocaleString();
        LATEST_BLOCKTIME = Date.parse(document.getElementById('blocktime').innerHTML)/1000;
        document.getElementById('blocktime').innerHTML = blockTimeStr;
    });
</script>

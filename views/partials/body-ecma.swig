
<script src='/socket.io/socket.io.js'></script>

<script>
   {# load socket io after rest of content #}
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
    var old_timestampStr;
    socket.on('pulsetime', function(timestamp) {
        const timestampStr = new Date(timestamp).toLocaleString();
        //console.log('pulse: ', timestampStr);
        document.getElementById('pulsetime').innerHTML = timestampStr;
    });
    socket.on('blockcount', function(blockcount) {
        console.log('blockcount: ', blockcount);
        document.getElementById('blockcount').innerHTML = blockcount;
    });
    socket.on('blocktime', function(blocktime) {
        const blockTimeStr = new Date(blocktime * 1000).toLocaleString();
        console.log('blocktime: ', blockTimeStr);
        document.getElementById('blocktime').innerHTML = blockTimeStr;
    });
</script>

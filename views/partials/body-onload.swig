const timestampStr = new Date({{ timestamp }}).toLocaleString();
document.getElementById('pulsetime').innerHTML = timestampStr;

const blockTimeStr = new Date({{ blocktime }}).toLocaleString();
document.getElementById('blocktime').innerHTML = blockTimeStr;

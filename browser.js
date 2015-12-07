
var ipc = require('ipc');

var authButton = document.getElementById('auth-button');

authButton.addEventListener('click', function(){
    ipc.send('invokeAction', 'someData');
    ipc.on('actionReply', function(response){ 
        alert(response);
    })
});
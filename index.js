'use strict';
const electron = require('electron');
const app = electron.app;
const fs = require('fs');
const path  = require('path');
// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400,
		// kiosk: true
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

var ipc = require('ipc');
var execa = require('execa');


ipc.on('invokeAction', function(event, data){
    var programmPath = path.resolve('C:/Program Files/WebSoft/WebTutorAdmin/spxml.exe');
    var programmPath2 = path.resolve('Program Files/WebSoft/WebTutorAdmin/spxml.exe');
    var pathVar = path.resolve('./');
    
    execa.shell(programmPath).then(function(result){
      event.sender.send('actionReply', result);
    });
    fs.writeFile( pathVar + '/smt', 'asdasda', function(err, data){
    	event.sender.send('actionReply', [pathVar, programmPath, programmPath2].join('\n') || err || data);
    });
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});

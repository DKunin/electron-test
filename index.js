'use strict';
const electron = require('electron');
const app = electron.app;
const fs = require('fs');
const path  = require('path');
const ipc = require('ipc');
// report crashes to the Electron project
//require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
//require('electron-debug')();

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
		kiosk: true
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

ipc.on('invokeAction', function(event, data){
    var pathVar = path.resolve('./');
    fs.writeFile( pathVar + '/nameOfFileToSave.txt', 'Строчка в файл', function(err, data){
    	event.sender.send('actionReply', 'ok');
    });
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});

'use strict';
const electron   = require('electron');
const app        = electron.app;
const fs         = require('fs');
const path       = require('path');
const ipc        = require('ipc');
const R          = require('ramda');
const PdfPrinter = require('pdfmake');
const fontsPath  = path.resolve('./fonts');

const fonts = {
	Roboto: {
		normal: fontsPath + '/Roboto-Regular.ttf',
		bold: fontsPath + '/Roboto-Medium.ttf',
		italics: fontsPath + '/Roboto-Italic.ttf',
		bolditalics: fontsPath + '/Roboto-Italic.ttf'
	}
};

var printer = new PdfPrinter(fonts);
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
		width: 960,
		height: 700,
		kiosk: true
	});

	win.loadURL(`file://${__dirname}/publictest/start.html`);
	//win.loadURL(`file://${__dirname}/index.html`);
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

ipc.on('sendToPdf', function(event, data){
    var pathVar = path.resolve('./');
		var now = new Date();
		var pdfDoc = printer.createPdfKitDocument(data);
		var fileName = R.compose(R.prop('text'), R.head, R.filter(function(item){
			return item.style === 'UserName';
		}), R.prop('content'))(data); 
		pdfDoc.pipe(fs.createWriteStream(path.resolve(pathVar + '/pdfs/' + fileName + now.getTime() + '.pdf')));
		pdfDoc.end();
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});

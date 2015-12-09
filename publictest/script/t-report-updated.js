

var PdfPrinter = require('pdfmake');
var fs = require('fs');
var path = require('path');
var fontsPath = path.resolve('./fonts/');

var fonts = {
	Roboto: {
		normal: fontsPath + '/Roboto-Regular.ttf',
		bold: fontsPath + '/Roboto-Medium.ttf',
		italics: fontsPath + '/Roboto-Italic.ttf',
		bolditalics: fontsPath + '/Roboto-Italic.ttf'
	}
};

var tReport = {
	style: {
		/*OptionMargins: [[20, 0, 0, 5], [12, 0, 0, 5]],*/ // array contains margins
		OptionColor : ['black', 'green'],
		CompleteStyles: {
			Page1Title: {
				fontSize: 22,
				bold: true,
				alignment: 'center',
				margin: [0, 80, 0, 50] //[0, 100, 0, 50]
			},
			Page2Title: {
				fontSize: 22,
				bold: true,
				alignment: 'center',
				margin: [0, 80, 0, 20] //[0, 100, 0, 50]
			},
			Page2SubTitle: {
				fontSize: 14,
				alignment: 'center',
				margin: [0, 0, 0, 50] //[0, 100, 0, 50]
			},
			BlockTitle: {
				fontSize: 18,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 30] // [0, 60, 0, 30]
			},
			SectionTitle: {
				fontSize: 12,
				bold: true,
				alignment: 'left',
				margin: [0, 30, 0, 10]
			},
			UserName: {
				fontSize: 18,
				bold: true,
				margin: [0, 0, 0, 25]
			},
			extraUserDataTitles: {
				fontSize: 8, // 10
				italics: true,
				margin: [0, 0, 0, 4] // [0, 0, 0, 5]
			},
			extraUserData: {
				fontSize: 10,
				margin: [0, 0, 0, 10]
				// fontSize: 14, was 12
				// margin: [0, 0, 0, 15]
			},
			b1TotalResults: {
				fontSize: 12,
				bold: true,
				alignment: 'left',
				margin: [0, 0, 0, 0]
			},
			b1SecTotalResults: {
				fontSize: 10,
				margin: [0, 0, 0, 5]
			},
			qTxt: {
				fontSize: 10,
				margin: [0, 20, 0, 10]
			},
			qOption: {
				fontSize: 10,
				margin: [12, 0, 0, 5]
			},
			b1QuestionCorrect: {
				fontSize: 10,
				color: 'green',
				italics: true,
				margin: [0, 5, 0, 20]
			},
			b1QuestionWrong: {
				fontSize: 10,
				color: 'red',
				italics: true,
				margin: [0, 5, 0, 20]
			},
			b2SecTitle: {
				fontSize: 12,
				bold: true,
				alignment: 'left',
				margin: [0, 30, 0, 10]
			},
			b2SecResults: {
				fontSize: 10,
				margin: [0, 0, 0, 5]
			},
			testTimeOut: {
				alignment: 'center',
				fontSize: 10,
				margin: [0, 0, 0, 50],
				color: 'red'
			},
			SignaturesTitles: {
				fontSize: 10,
				margin: [0, 40, 0, 20]
			},
			SignaturesFields: {
				fontSize: 10,
				margin: [0, 0, 0, 0]
			},
			SignaturesDateField: {
				fontSize: 10,
				margin: [0, 60, 0, 0]
			},
			footerTxt: {
				alignment: 'center',
				fontSize: 8,
				margin: [0, 20, 10, 0]
			}
		}
	},
	
	createBlock1QuestionParagraph: function(qObj, optStatus) {
		var s = [];
		var j=1; // extra counter
		// create PDF line for question text
		var qTxt = qObj.OrdinalNumber.toString()+'. '+qObj.txt[0];
		s[0] = {text: qTxt, style: 'qTxt'};
		
		// create PDF line for each option
		// optStatus is an array of numbers, where 1 = checked, 0 = nonchecked
		for (i=0; i<qObj.options.length; i++) {
			var optTxt = qObj.options[i][0];
			var optColor = qObj.options[i][1];
			var optMarker;
			if (optStatus[i]) {
				optMarker = '>';
				s[j] = { 
					columns: [ 
						{ width: 5, text: optMarker, style: 'qOption', color: tReport.style.OptionColor[optColor] }, 
						{ width: '*', text: optTxt, style: 'qOption', color: tReport.style.OptionColor[optColor] } 
					], columnGap: 5 
				};
				j++;
			}
			else {
				/*optMarker = '';*/
			}	
			
		}
		// returns an array of objects; each object defines a pdf line for final report
		return s
	},
	
	createBlock2SectionParagraph: function(template) {
		var s = [];
		for (i=0; i<template.length; i++) {
			s[i] = { text: template[i], style: 'b2SecResults' };
		}
		// returns an array of objects; each object defines a pdf line for final report
		return s
	},
	
	content: [],
	
	createContent: function(bank, TotalBlock1Scores, Block1Results, qToGetFromBlock1, Block1Success, UserData, StartTime) {
		// if repeat saving - clear content and make again, otherwise image doesn't work correctly
		if (tReport.content.length>0) {
			tReport.content = [];
		}

		// PAGE 1
		tReport.content.push({ image: tReport.logo, width: 100 }); // tReport.logo is 64base image
		tReport.content.push({ text: 'Протокол результатов тестирования', style: 'Page1Title' });
		if (mt.Control.tTimeOut) {
			tReport.content.push({ text: 'Время, отведенное на тестирования истекло раньше, чем сотрудник успел ответить на все вопросы. Тест был завершен принудительно. В отчете отражены результаты лишь по отвеченным вопросам.', style: 'testTimeOut' });
		}
		
		// Name
		tReport.content.push({ text: UserData.FullName, style: 'UserName' });
		
		// Extra user data
		var Position = 'Должность: '+UserData.Position;
		tReport.content.push({ text: Position, style: 'extraUserData' });
		var Status = 'Статус: '+UserData.Status;
		tReport.content.push({ text: Status, style: 'extraUserData' });
		var OfficeType = 'Вид образовательного учреждения: '+UserData.OfficeType;
		tReport.content.push({ text: OfficeType, style: 'extraUserData' });
		var OfficeName = 'Наименование учреждения: '+UserData.OfficeName;
		tReport.content.push({ text: OfficeName, style: 'extraUserData' });
		var CertType = 'Вид аттестации: '+UserData.CertificationType;
		tReport.content.push({ text: CertType, style: 'extraUserData' });
		var TryNumber = 'Номер попытки: '+UserData.TryNumber;
		tReport.content.push({ text: TryNumber, style: 'extraUserData' });
		var TestDate = 'Дата и время начала тестирования: '+StartTime;
		tReport.content.push({ text: TestDate, style: 'extraUserData' });
		tReport.content.push({ text: 'Минимальный порог прохождения теста: 70%', style: 'extraUserData' });
		var Result = 'Фактический результат прохождения теста: '+Block1Success;
		tReport.content.push({ text: Result, style: 'extraUserData'});
		// Signatures
		tReport.content.push({ text: 'Аналитик 1-й категории / Психолог 1-й категории отдела аттестации ГБУ города Москвы "Кадровый центр Департамента культуры города Москвы"', style: 'SignaturesTitles' });
		tReport.content.push({ columns: [ { width: 220, text: 'Подпись: ______________________________', style: 'SignaturesFields' }, { width: 350, text: 'Расшифровка: ________________________________________', style: 'SignaturesFields' } ], columnGap: 15});
		tReport.content.push({ text: 'Тестируемый с результатами ознакомлен(а)', style: 'SignaturesTitles' });
		tReport.content.push({ columns: [ { width: 220, text: 'Подпись: ______________________________', style: 'SignaturesFields' }, { width: 350, text: 'Расшифровка: ________________________________________', style: 'SignaturesFields' } ], columnGap: 15});
		tReport.content.push({ text: 'Дата ознакомления с результатом: ________________________________ (дд.мм.гг)', style: 'SignaturesDateField', pageBreak: 'after' });
		
		
		// PAGE 2
		tReport.content.push({ image: tReport.logo, width: 100 }); // tReport.logo is 64base image
		tReport.content.push({ text: 'Протокол результатов тестирования', style: 'Page2Title' });
		tReport.content.push({ text: '(для кадрового центра)', style: 'Page2SubTitle' });
		if (mt.Control.tTimeOut) {
			tReport.content.push({ text: 'Время, отведенное на тестирования истекло раньше, чем сотрудник успел ответить на все вопросы. Тест был завершен принудительно. В отчете отражены результаты лишь по отвеченным вопросам.', style: 'testTimeOut' });
		}
		
		// Name
		tReport.content.push({ text: UserData.FullName, style: 'UserName' });
		
		// Extra user data, repeat from Page 1
		tReport.content.push({ text: Position, style: 'extraUserData' });
		tReport.content.push({ text: Status, style: 'extraUserData' });
		tReport.content.push({ text: OfficeType, style: 'extraUserData' });
		tReport.content.push({ text: OfficeName, style: 'extraUserData' });
		tReport.content.push({ text: CertType, style: 'extraUserData' });
		tReport.content.push({ text: TryNumber, style: 'extraUserData' });
		tReport.content.push({ text: TestDate, style: 'extraUserData' });
		tReport.content.push({ text: 'Минимальный порог прохождения теста: 70%', style: 'extraUserData' });
		tReport.content.push({ text: Result, style: 'extraUserData'});
		
		// add questions
		// Block 1
		tReport.content.push({ text: bank.meta.titles.B1, style: 'BlockTitle', pageBreak: 'before' });
		TotalBlock1Scores = 'Общая сумма правильных ответов: '+TotalBlock1Scores;
		tReport.content.push({ text: TotalBlock1Scores, style: 'b1TotalResults' });
		// for each section in block
		for (i=0; i<bank.questions[0].length; i++) {
			var sectionTitle = 'B1Sec'+(i+1).toString();
			tReport.content.push({ text: bank.meta.titles[sectionTitle], style: 'SectionTitle' });
			var SecTotalQ = 'Количество вопросов: '+qToGetFromBlock1[i];
			var SecTotalCorrect = 'Количество верных ответов: '+Block1Results[i][0];
			var SecSuccess = 'Успешность: '+Block1Results[i][1];
			tReport.content.push({ text: SecTotalQ, style: 'b1SecTotalResults' });
			tReport.content.push({ text: SecTotalCorrect, style: 'b1SecTotalResults' });
			tReport.content.push({ text: SecSuccess, style: 'b1SecTotalResults' });
	
			// for each question in section
			for (var j=0; j<bank.questions[0][i].length; j++) {
				var pdfLines = bank.questions[0][i][j].DataForReport; // DataForReport = ['q txt data', 'q options data']
				// put question txt to content
				tReport.content.push(pdfLines[0]);
				// put question options to content
				for (k=1; k<pdfLines.length; k++) {
					tReport.content.push(pdfLines[k]);
				}
				// put question correctness status to content
				var CorrectnessStatus = bank.questions[0][i][j].CorrectnessStatus; // 0 or 1
				if (CorrectnessStatus===1) {
					tReport.content.push({ text: 'Ответ верный', style: 'b1QuestionCorrect' });
				}
				else if (CorrectnessStatus===0) {
					tReport.content.push({ text: 'Ответ неверный', style: 'b1QuestionWrong' });
				}
			}	
		}
		
		// Block 2
		tReport.content.push({ text: bank.meta.titles.B2, style: 'BlockTitle', pageBreak: 'before'  });
		for (var i=0; i<bank.Block2DataForReport.length; i++) {
			// Omit Section 7, its data for report is 0
			if (bank.Block2DataForReport[i]!=0) {
				var sectionTitle = 'B2Sec'+(i+1).toString();
				tReport.content.push({ text: bank.meta.titles[sectionTitle], style: 'b2SecTitle' });
				for (var j=0; j<bank.Block2DataForReport[i].length; j++) {
					var pdfLine = bank.Block2DataForReport[i][j];
					tReport.content.push(pdfLine);
				}
			}
		}
		return true
	},
	
	make: function() {
		// Create PDF
		var docDefinition = {			
			info: {
				title: 'Test Results',
				author: 'Department of Culture',
				subject: 'Test Results',
				keywords: 'none',
			},
			footer: function(currentPage, pageCount) { 
				var t = currentPage.toString(); /*'Страница ' + currentPage.toString() + ' из ' + pageCount;*/
				return { text: t, style: 'footerTxt' } 
			},
			content: tReport.content,
			styles: tReport.style.CompleteStyles
			
		};


		var printer = new PdfPrinter(fonts);
		var now = new Date();
		var pdfDoc = printer.createPdfKitDocument(docDefinition);
		pdfDoc.pipe(fs.createWriteStream(path.resolve('./pdfs/'+now.getTime()+'.pdf')));
		pdfDoc.end();
		/*pdfMake.createPdf(docDefinition).download('Test-Results.pdf');*/
		
	},
	
	logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABECAYAAADEKno9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOkY4N0YxMTc0MDcyMDY4MTE4QTZEQkExM0Y3OTRENDQ0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjBBNkQwRjFERDI5RDExRTJBMjI2REU2MDdDMkE3QTg4IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBBNkQwRjFDRDI5RDExRTJBMjI2REU2MDdDMkE3QTg4IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzUgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjY4NDAxMkE2Q0Q5REUyMTE5NEEzQTM2ODlEQjA2MjkzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkY4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'
};
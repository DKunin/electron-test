var mt = {
	Model : {},
	DOM: {},
	Visual : {},
	Control : {},
	
	init : function() {
		mt.Visual.init();
		mt.Control.createQuestionsSelection();
	}
}

mt.Model = {
	UserData: {
		FullName: '',
		FirstName: '',
		Position: '',
		Status: '',
		OfficeType: '',
		OfficeName: ''
	},
	AdminPass: 'admin2015',
	IsAdmin: true,
	TotalBlock1Scores: 0, // Total scores for Block 1. Conunting per question
	Block1Scores: [0, 0, 0, 0, 0, 0, 0], // Scores for Block 1 per Section
	Block2Scores: [], // Scores for Block 2. Only scores for each section, except Section 10
	Block2Section10Scores: [0, 0, 0, 0, 0], // Scores for Section 10 in Block 2.
	Block2Section4Question1Answer: ['Ответ на Кейс 1:', ''], // Stores text asnwer for Question 1 in Section 4, Block 2
	Block2Section5Question2Answer: ['Ответ на Вопрос 2:', ''], // Stores text asnwer for Question 2 in Section 5, Block 2
	Block2Section5Question5Answer: ['Ответ на Вопрос 5:', ''], // Stores text asnwer for Question 2 in Section 5, Block 2
	FairGrade: 3,
	MaxScores: 3,
	StartTime: '',
	EndTime: '',
	TestDuration: 7200 //  2 hours in seconds 7200
}

mt.DOM = {
	tBody: 'div#t_body',
	Title1: 'h1',
	Title2: 'h2',
	tContent: 'div#t_content',
	tIntro: 'div#intro',
	qBox: 'div.q_box',
	qTemplate: '<div class=q_box><p class=q_txt></p><form><ul class=q_options></ul></form></div>',
	UserNameInput: 'input#user-name-input',
	UserPositionInput: 'input#user-position-input',
	UserStatusSelect: 'select#user-status',
	OfficeTypeSelect: 'select#user-office-type',
	OfficeNameInput: 'input#user-office-name',
	TxtInputs: 'input.txt',
	bStart : 'button#b-start',
	bProceed: 'button#b-proceed',
	bFinish: 'button#b-finish',
	bSave: 'button#b-save',
	tServicePanel: 'div#t_service',
	tMainTimer: 'p#timer',
	B2Sec9Timer: 'p#b2sec9timer',
	tNotification: 'div#notification',
	ModalWin: 'div#modal-win',
	ModalWinBgr: 'div#modal-win-bgr',	
	ModalWinTemplate: '<div id=modal-win><div id=modal-win-bgr></div></div>',
	Toggler: '<p><span class=toggler></span></p>',
	
	remove: function($elem) {
		$elem.remove();
	},
	
	add: function($elem, $place, method) {
		switch (method) {
			case 'appendTo': 
				$elem.appendTo($place);
				break;
			
			case 'prepend':
				$place.prepend($elem);
				break;
			
			case 'insertafter':
				$elem.insertAfter($place);
				break;
		}
	}
}

mt.Visual = {
	b2sec2SelectedOptions: [],
	
	init : function() {
		// Notify user before closing window
		window.onbeforeunload = function () {
			return 'Вы собираетесь закрыть или перезагрузить тест. Убедитесь, что результаты текущего тестирования сохранены. В дальнейшем они будут недоступны.';
		};
		
		// Prevent forms from defaults
		$(document).on('submit', 'form', function(event){
			event.preventDefault();
			// handle press 'Enter'
			if (event.keyCode===13) {
				//do smth
				return false
			}
		});
		
		// Put user name input in focus
		var $UserNameInput = $(mt.DOM.UserNameInput);
		$UserNameInput.focus();
		
		// Attach listeners and events
		// focus on inputs removes notifications
		$(document).on('focus', mt.DOM.TxtInputs, mt.Visual.UserNotification.remove);
		
		// and click on selects removes notifications
		$(document).on('click', 'select', mt.Visual.UserNotification.remove);
			
		// click on inputs, li, textareas removes notifications
		$(document).on('click', 'li, input:radio, input:checkbox, textarea', mt.Visual.UserNotification.remove);
		
		// Buttons
		$(document).on('click', 'button', {target: 'button'}, function(event){
			event.data.action = $(event.target).attr('id').split('-')[1];
			mt.Control.bHandler (event);
		});
		
		// Modal Window
		$(document).on('click', mt.DOM.ModalWinBgr, {target: mt.DOM.ModalWinBgr}, function(event){
			var $ModalWin = $(mt.DOM.ModalWin);
			mt.Visual.UserNotification.remove();
			mt.Visual.Effects.hide($ModalWin, 'Fastfade');
			$ModalWin.queue(function(){
				mt.DOM.remove(this);
			});
		});
		// separated to turn off if time will be out
		$(document).on('click', mt.DOM.ModalWinBgr, mt.Visual.UserNotification.remove);
		
		// Option inputs, choices
		this.enableLiToggleChecks();
		$(document).on('click', 'li input', function(event) {
			event.stopPropagation();
		});
		
		// Toggler for Block 2, Section 2 Case
		$(document).on('click', 'span.toggler', function() {
			mt.Visual.ModalWindow.make('Block2Section2CaseReminder');
		});
		
		// LIs in Section 9 Guide
		$(document).on('click', 'div.q_box.b2sec9guide ul.q_options li', function(event) {
			var $LI = $(event.target);
			if ($LI.children('input').val()=='1') {
				$LI.addClass('correct');
			}
			else if ($LI.children('input').val()=='0') {
				$LI.addClass('wrong');
			}
		});
	},
	
	enableLiToggleChecks: function() {
		$(document).on('click', 'li', function(event){
			// if child input is checked - uncheck it, except for radios
			if ($(this).children('input:checked').length) {
				$(this).children('input:checkbox').prop('checked', false);
			}
			// if not checked - check, for both radio and checkboxes
			else if (!$(this).children('input:checked').length) {
				$(this).children('input').prop('checked', true);
			}
		});
	},
	
	Effects: {
		Fade: {
			effect: 'fade', 
			easing: 'linear', 
			duration: 300
		},
		Fastfade: {
			effect: 'fade', 
			easing: 'linear', 
			duration: 1
		},
		Dropleft: {
			effect: 'drop', 
			direction: 'left', 
			easing: 'easeOutQuart', 
			duration: 600
		},
		Slidedown: {
			effect: 'slide', 
			direction: 'up', 
			easing: 'easeOutQuart', 
			duration: 600
		},
		Slideup: {
			effect: 'slide', 
			direction: 'down', 
			easing: 'easeOutQuart', 
			duration: 600
		},
		
		show: function(elem, type) {
			elem.show(mt.Visual.Effects[type]);
		},
		
		hide: function(elem, type) {
			elem.hide(mt.Visual.Effects[type]);
		}
	},
	
	ModalWindow: {
		AdminValidation: '<div class="validation admin"><p>Посмотреть и сохранить результаты может только руководитель тестирования. Введите пароль руководителя.</p><form><input class="txt active" id=pass type="password"></input></form><button class=t_button id=b-checkpass type=button>ОК</button></div>',
		Block2Section2CaseReminder: '<div class=modal-regular-content><p><b>Кейс «Переезд в новое здание»</b></p><p>Вы – руководитель одного из учреждений, подведомственного Департаменту Культуры г. Москвы. Административное здание вашего учреждения последние четыре года располагалась в старом уютном особняке в центре города, однако недавно вышестоящим руководством было принято решение о том, что целесообразно  переехать в новое более современное здание. Новое помещение предоставит больше возможностей для решения задач вашего учреждения и будет более комфортно для пребывания, как сотрудников, так и клиентов. Территориально  новое здание расположено в двух кварталах от старого здания (в 15 минутах ходьбы). Новое здание уже арендовано, все договоры заключены, транспорт и грузчики заказаны, и многочисленные помещения, рассчитанные на размещение сотрудников и клиентов, ждут новых хозяев.</p> <p>Сегодня  у вас трудный день. Вы ответственны за переезд. Именно вы отвечаете за то, чтобы переезд прошел спокойно, плавно, без лишних волнений и с минимальным ущербом для рабочего процесса. День переезда – обычный рабочий день для большинства сотрудников вашей организации. Только Вы и ваш секретарь имеете возможность на сегодня отложить часть привычных обязанностей и заниматься организацией переезда. Дело в том, что арендодатели - хозяева особняка, настойчиво требуют к концу рабочего дня освободить помещения для новых арендаторов.</p><button class=t_button id=b-close type=button>Закрыть</button></div>',
		
		create: function(topic, showFunction) {
			$ModalWin = $(mt.DOM.ModalWinTemplate);
			$ModalWinContent = $(this[topic]);
			mt.DOM.add($ModalWinContent, $ModalWin, 'appendTo');
			mt.DOM.add($ModalWin, $('body'), 'appendTo');
			showFunction($ModalWin, 'Fastfade');
			// Make TxtInput in focus
			$ModalWin.queue(function(){
				$ModalWinContent.find(mt.DOM.TxtInputs).focus();
				$(this).dequeue();
			});
		},
		
		make: function(topic) {
			this.create(topic, mt.Visual.Effects.show)
		}
	},
	
	// User Notification
	UserNotification: {
		Messages: {
			NoUserData: {
				content: '<div id=notification class=warning><p>Пожалуйста, введите свои данные. Они необходимы для фиксации и обработки результатов тестирования.</p></div>',
				place: mt.DOM.tBody
			},
			NoAnswer: {
				content: '<div id=notification class=warning><p>Чтобы продолжить тестирование необходимо ответить на вопрос.</p></div>',
				place: mt.DOM.tBody
			},
			IncorrectAdminPass: {
				content: '<div id=notification class=warning><p>Неверный пароль.</p></div>',
				place: mt.DOM.tBody
			},
			TimeOut: {
				content: '<div id=notification class="warning test-time-out"><p>К сожалению, время тестирования истекло.</p></div>',
				place: mt.DOM.tBody 
			},
			TimeOutSection9: {
				content: '<div id=notification class=warning><p>Время, отведенное на данный раздел теста истекло. Ваши результаты будут рассчитаны с учетом лишь тех вопросов раздела, на которые вы успели ответить. Продолжайте тестирование.</p></div>',
				place: mt.DOM.tBody 
			},
			FinalMessage: {
				content: '<div id=final-message><h1>Тест завершен. Спасибо за работу!</h1><p>Обратитесь к специалисту, сопровождающему процедуру аттестации.</p></div>',
				place: mt.DOM.tContent
			},
			PostSaveMessage: {
				content: '<h2>Результаты тестирования сохранены</h2><ul class=post-save-message><li>Если вы хотите еще раз сохранить результаты, то нажмите кнопку «Повторить сохранение».</li><li>Если вы хотите начать новое тестирование, то обновите страницу. После этого все текущие результаты тестирования будут удалены из памяти, их невозможно будет восстановить.</li></ul>',
				place: 'div#final-message'
			}
		},
		
		create: function(topic, showFunction) {
			var $Message = $(this.Messages[topic].content);
			var $Place = $(this.Messages[topic].place);
			// if warning message - show yellow plate on top of the screen, so use prepend
			if ($Message.hasClass('warning')) {
				// if there's already notifiation, set this z-index to maximum, so as to show it on top
				if ($(mt.DOM.tNotification).length>0) {
					$Message.css('z-index', 999);
				}
				mt.DOM.add($Message, $Place, 'prepend');
				showFunction($Message, 'Slidedown');
			}
			// otherwise use appendTo
			else {
				mt.DOM.add($Message, $Place, 'appendTo');
				showFunction($Message, 'Fade');
			}
		},
		
		remove: function() {
			// if this is test time out message - never hide it
			var $notification = $(mt.DOM.tNotification).not('.test-time-out');
			mt.Visual.Effects.hide($notification, 'Slidedown');
			$notification.queue(function(){
				mt.DOM.remove(this);
			});
		},
			
		make: function(topic) {
			this.create(topic, mt.Visual.Effects.show);
		}
	},

	// Check Form
	Forms: {
		getAnswer: function(block, section, question) {
			// if fill-in-the-blank question
			if ($('textarea').length>0) {
				var ans = {
					val: '',
					type: 'fillInTheBlank'
				}
				ans.val = $('textarea').val();
				return ans
			}
			// if choices question
			else {
				//check answers, return an object 'ans' containing input total values and which options are checked
				var ans = {
					totalVal: 0, // all correct answers
					checkedOptVal: [], // sequence of each checked option values
					optStatus: [], // which options are checked
					type: 'choices'
				};
				$('ul.q_options input').each(function(){
					var optVal = parseInt($(this).val());
					ans.totalVal += optVal;
					if ($(this).prop('checked')) {
						ans.checkedOptVal.push(optVal);
						ans.optStatus.push(1);
					}
					else {
						ans.optStatus.push(0);
					}
				});
				
				// Block 2, Section 2, Special Cases (questions 13-16)
				if ((block===1)&&(section===1)) {
					if ((question===6)||(question===7)||(question===8)||(question===9)) {
						$('ul.q_options input').each(function(index){
							if ($(this).prop('checked')) {
								mt.Visual.b2sec2SelectedOptions[index] = 1;
							}
						});
					}
				}
					
				return ans
			}
		},
		checkHasAsnwer: function() {
			if ($('input:radio, input:checkbox').length) {
				return Boolean($('input:radio:checked, input:checkbox:checked').length)
			}
			else if ($('textarea').length) {
				return Boolean($('textarea').val().length)
			}
			
		},
		getUserData: function() {
			var ud = {};
			ud.Name = $(mt.DOM.UserNameInput).val();
			ud.Position = $(mt.DOM.UserPositionInput).val();
			ud.Status = $(mt.DOM.UserStatusSelect).val();
			ud.OfficeType = $(mt.DOM.OfficeTypeSelect).val();
			ud.OfficeName = $(mt.DOM.OfficeNameInput).val();
			
			return ud
		},
		getAdminPass: function() {
			return $('#pass').val();
		},
		
		disable: function() {
			$('input, textarea').prop('disabled', true);
		}
	},
	
	// Assemble particular question from selection to HTML as jQuery object
	assembleQuestion: function(qObj) {
		var $NewQuestion = $(mt.DOM.qTemplate);
		// put question txt into box
		$NewQuestion.find('p.q_txt').text(qObj.txt[0]);
		if (qObj.txt.length>1) {
			for (i=1; i<qObj.txt.length; i++) {
				var $elem = $('<p class=q_txt>'+qObj.txt[i]+'</p>');
				var $place = $NewQuestion.find('p.q_txt').filter(':last');
				$place.css('margin-bottom', 20);
				mt.DOM.add($elem, $place, 'insertafter');
			}
		}
		
		if (qObj.type==='multi') {
			var $elem = $('<p class=remark>Возможно несколько вариантов ответа.</p>');
			var $place = $NewQuestion.find('p.q_txt').filter(':last');
			$place.css('margin-bottom', 20);
			mt.DOM.add($elem, $place, 'insertafter');
		}
		
		// If this is Case from Block 2, Section 2 which has special toggler, append toggler
		if (qObj.toggler) {
			var $elem = $(mt.DOM.Toggler);
			// add text to toggler
			$elem.find('span').text(qObj.toggler);
			var $place = $NewQuestion.find('p.q_txt').filter(':last');
			$place.css('margin-bottom', 20);
			mt.DOM.add($elem, $place, 'insertafter');
		}
		
		// put options
		var intype; // input type
		var invalue; // input value
		var opTxt; // option text
		var opHTML; // option HTML line
		// get input type
		switch (qObj.type) {
			case 'simple':
				intype = 'radio';
				break;
			case 'multi':
				intype = 'checkbox';
				break;
			case 'textarea':
				intype = 'textarea'
				break;
			default: // question type is mistyped or doesn't exist
				intype = false;
				break;
		}
		
		if (qObj.options.length>0) {
			// if choice questions - go through options
			for (i=0; i<qObj.options.length; i++) {
				opTxt = qObj.options[i][0]; // option text is first in option array
				invalue = qObj.options[i][1]; // option value is second in option array
				opHTML = '<li><input name=option type='+intype+' value='+invalue+'>'+opTxt+'</li>';
				$NewQuestion.find('ul.q_options').append(opHTML);
			}
		}
		else {
			// if fill-in-the-blank question - create textarea instead options
			$NewQuestion.find('form').remove();
			var $elem = $('<textarea></textarea>');
			var $place = $NewQuestion.find('p.q_txt').filter(':last');
			mt.DOM.add($elem, $place, 'insertafter');
		}
		
		// Block 2, Section 2, Special Cases
		if (qObj.SpecialCase>1) {
			var $elem = $('<p class=remark>Некоторые варианты ответов выделены серым цветом, чтобы показать, что вы их уже отмечали.</p>');
			var $place = $NewQuestion.find('p.remark').filter(':last');
			$place.css('margin-bottom', 20);
			mt.DOM.add($elem, $place, 'insertafter');
			$NewQuestion.find('ul.q_options li').each(function(index){
				if (mt.Visual.b2sec2SelectedOptions[index]===1) {
					$(this).addClass('b2sec2-selected-options');
				}
			})
		}
			
		return $NewQuestion		
	},
	
	// Timer
	updateTimer: function(h, m, s) {
		var hour = h < 10 ? '0'+h : h;
		var min = m < 10 ? '0'+m : m;
		var sec = s < 10 ? '0'+s : s;
		var t = hour+':'+min+':'+sec;
		$Timer = $(mt.DOM.tMainTimer)
		$Timer.text(t);
		
		if (mt.Block2Section9.Guide.IsInAction) {
			mt.Block2Section9.Timer.update('guide');
		}
		if (mt.Block2Section9.IsInAction) {
			mt.Block2Section9.Timer.update('main');
		}
	},
	
	// Test process
	start: function($NewQuestion, qOrdinal) {
		var $TestBody = $(mt.DOM.tBody);
		var $Intro = $(mt.DOM.tIntro);
		var $ServicePanel = $(mt.DOM.tServicePanel);
		var $Content = $(mt.DOM.tContent);
		var $Title1 = $(mt.DOM.Title1);
		var $Title2 = $('<h2></h2>');
		var $BStart = $(mt.DOM.bStart);
		var $BProceed = $(mt.DOM.bProceed);
		
		// Show service panel with main timer
		mt.Visual.Effects.show($ServicePanel, 'Slideup');
		
		// Remove Title 1
		mt.Visual.Effects.hide($Title1, 'Dropleft');
		$Title1.queue(function(){
			mt.DOM.remove(this);
		});
		
		
		// Remove intro
		mt.Visual.Effects.hide($Intro, 'Dropleft');
		$Intro.queue(function(){
			// Show first question
			mt.DOM.add($NewQuestion, $Content, 'appendTo');
			mt.DOM.add($Title2, $TestBody, 'prepend');
			$Title2.text('Вопрос ' +qOrdinal);
			mt.Visual.Effects.show($Title2, 'Fade');
			mt.Visual.Effects.show($NewQuestion, 'Fade');
			mt.DOM.remove(this);
		});
				
		// Change buttons
		mt.Visual.Effects.hide($BStart, 'Fade');
		$BStart.queue(function(){
			mt.DOM.remove(this);
			mt.Visual.Effects.show($BProceed, 'Fade');
			$BProceed.css('display', 'block'); // Otherwise jQ sets block-inline for button
		});
		
				
		// Enter Full Screen mode
		setTimeout(function(){ 
			var elem = document.documentElement;
			if(elem.requestFullscreen) {
				elem.requestFullscreen();
			}
			else if(elem.mozRequestFullScreen) {
				elem.mozRequestFullScreen();
			}
			else if(elem.webkitRequestFullscreen) {
				elem.webkitRequestFullscreen();
			} 
			else if(elem.msRequestFullscreen) {
				elem.msRequestFullscreen();
			} 
		}, 800);
				
	},
	
	proceed: function($NewQuestion, qOrdinal) {
		var $Content = $(mt.DOM.tContent);
		var $Title2 = $(mt.DOM.Title2);
		var $OldQuestion = $(mt.DOM.qBox);
		var $BProceed = $(mt.DOM.bProceed);
		
				
		// if proceed button text was changed for Block 2 Section 9 Guide
		if ($BProceed.text()==='Далее') {
			$BProceed.text('Следующий вопрос');
		}
		
		$Title2.text('Вопрос ' +qOrdinal);
		
		mt.Visual.Effects.hide($OldQuestion, 'Dropleft');
		$OldQuestion.queue(function(){
			mt.DOM.remove(this);
			mt.DOM.add($NewQuestion, $Content, 'appendTo');
			mt.Visual.Effects.show($NewQuestion, 'Fade');
		});
	},
	
	preFinish: function() {
		var $BProceed = $(mt.DOM.bProceed);
		var $BFinish = $(mt.DOM.bFinish);
		
		mt.Visual.Effects.hide($BProceed, 'Fade');
		$BProceed.queue(function(){
			mt.DOM.remove(this);
			mt.Visual.Effects.show($BFinish, 'Fade');
			$BFinish.css('display', 'block'); // Otherwise jQ sets block-inline for button
		});		
	},
	
	finish: function() {
		var $Title2 = $(mt.DOM.Title2);
		var $BFinish = $(mt.DOM.bFinish);
		var $BSave = $(mt.DOM.bSave);
		var $ServicePanel = $(mt.DOM.tServicePanel);
		var $LastQuestion = $(mt.DOM.qBox);
		
		mt.Visual.Effects.hide($BFinish, 'Fade');
		$BFinish.queue(function(){
			mt.DOM.remove(this);
			/*mt.Visual.Effects.show($BSave, 'Fade');
			$BSave.css('display', 'block');*/ // Otherwise jQ sets block-inline for button
		});
		
		mt.Visual.Effects.hide($ServicePanel, 'Slideup');
		$ServicePanel.queue(function(){
			mt.DOM.remove(this);
		});
		
		mt.Visual.Effects.hide($Title2, 'Fade');
		
		mt.Visual.Effects.hide($LastQuestion, 'Dropleft');
		$LastQuestion.queue(function(){
			mt.DOM.remove(this);
			mt.DOM.remove($Title2);
			mt.Visual.UserNotification.make('FinalMessage');
		});
	},
	
	postSave: function() {
		var $FinalMessageTxt = $('div#final-message').find('p');
		// if this is first saving
		if ($FinalMessageTxt.length>0) {
			var $BSave = $(mt.DOM.bSave);
			$FinalMessageTxt.remove();
			mt.Visual.UserNotification.make('PostSaveMessage');
			$BSave.text('Повторить сохранение');
		}
	}
}

mt.Control = {
	// 'q' = question
	// qSelection is an array of elems, representing order of questions to display. Each elem is an array containing three numbers: block, section, question
	qSelection: [],
	currentPosInSelection: -1, // Current position in question selection
	qToGetFromBlock1: [8, 5, 3, 8, 8, 5, 5], //  Each number is an amount of questions to get from corresponding Section of Block1
	qCurrentOrdinalNum: 0, // Current question ordinal number
	qCurrentIndex: [], // Current question index in qSelection. Each elem - array of 3 numbers (block, section, question)
	tTimeOut: false, // If test time is out flag
	tTimer: '',
	
	bHandler: function(event) {
		mt.Control[event.data.action](event);
	},
	
	start: function(event) {
		var n = this.getUserData();
		if (n) {
			mt.Model.StartTime = this.getStartTime(); // Get test start time
			this.launchTimer(); // Launch timer
			this.getNextPosInSelection();
			var block = mt.Control.qCurrentIndex[0];
			var section = mt.Control.qCurrentIndex[1];
			var question = mt.Control.qCurrentIndex[2];
			this.changeQuestionOrdinal(block, section, question);
			var $NewQuestion = mt.Visual.assembleQuestion(qBank.questions[block][section][question]);
			if ($NewQuestion) {
				mt.Visual.start($NewQuestion, mt.Control.qCurrentOrdinalNum.toString());
			}
		}
		
		// Create array for monitoring Block 2, Section 2, Special Cases
		for (i=0; i<22; i++) {
			mt.Visual.b2sec2SelectedOptions[i] = 0;
		}
	},
	
	proceed: function(event) {
		var block = mt.Control.qCurrentIndex[0];
		var section = mt.Control.qCurrentIndex[1];
		var question = mt.Control.qCurrentIndex[2];
		// checking if current question is unanswered
		if (mt.Visual.Forms.checkHasAsnwer()===false) {
			if (mt.Block2Section9.Guide.IsInAction) {
				// do nothing
			}
			else if ((section===8)&&(mt.Block2Section9.IsInAction===false)) {
				// do nothing
			}
			else {
				mt.Visual.UserNotification.make('NoAnswer');
				return false
			}
		}
		
		// if this is Block2Section9 Guide - no assessment is needed, just go to the next question
		if (mt.Block2Section9.Guide.IsInAction) {
			var a = true;
		}
		// otherwise, assess current question
		else {
			var a = mt.Control.Assessment.make(block, section, question);			
		}
		
		// if assessment was successfull, go next
		if (a) {
			// if this was the last question in Block 2, Section 8, don't go to the next question, but show Section 9 Guide
			if ((block==1)&&(section==7)&&(question==qBank.questions[block][section].length-1)&&(!mt.Block2Section9.Guide.IsInAction)) {
				mt.Block2Section9.Guide.IsInAction = true;
				var g = mt.Block2Section9.Guide.create(qBank.Block2Section9Guide);
				mt.Block2Section9.Guide.show(g);
				return true
			}
			else if (mt.Block2Section9.Guide.IsInAction) {
				// turn off Section 9 guide flag
				mt.Block2Section9.Guide.IsInAction = false;
			}
				
			this.getNextPosInSelection();
			var block = mt.Control.qCurrentIndex[0];
			var section = mt.Control.qCurrentIndex[1];
			var question = mt.Control.qCurrentIndex[2];
			this.changeQuestionOrdinal(block, section, question);
			// Omit Section 4. If so - get next position again
			if ((block===1)&&(section===3)) {
				this.getNextPosInSelection();
				var block = mt.Control.qCurrentIndex[0];
				var section = mt.Control.qCurrentIndex[1];
				var question = mt.Control.qCurrentIndex[2];
			}
			// Omit Section 5. If so - get next position again
			if ((block===1)&&(section===4)) {
				this.getNextPosInSelection();
				var block = mt.Control.qCurrentIndex[0];
				var section = mt.Control.qCurrentIndex[1];
				var question = mt.Control.qCurrentIndex[2];
			}
			// Omit Section 7. If so - get next position again
			if ((block===1)&&(section===6)) {
				this.getNextPosInSelection();
				var block = mt.Control.qCurrentIndex[0];
				var section = mt.Control.qCurrentIndex[1];
				var question = mt.Control.qCurrentIndex[2];
			}
			
			// Set flag for timer if this is Section 9
			// It get back to false either automatically by timer, or here when the Section 10 starts
			if ((block==1)&&(section==8)&&(question==0)) {
				mt.Block2Section9.IsInAction = true;
			}
			// If Section 10 start - stop everything with Section 9
			if ((block==1)&&(section==9)&&(question==0)) {
				var $Section9Timer = $(mt.DOM.B2Sec9Timer);
				// hide Section 9 Timer
				mt.Visual.Effects.hide($Section9Timer, 'Fade');
				// Enable back LIs to toggle checks
				mt.Visual.enableLiToggleChecks();
				// Set Section 9 flag to false
				mt.Block2Section9.IsInAction = false;
				// Remove Notification about Section 9 time is over, if its visible
				mt.Visual.UserNotification.remove();
			}
			
			var $NewQuestion = mt.Visual.assembleQuestion(qBank.questions[block][section][question]);
			var qNum = mt.Control.qCurrentOrdinalNum.toString();
			if ($NewQuestion) {
				mt.Visual.proceed($NewQuestion, qNum);
				// if this is the last question - show preFinish (change button)
				if (mt.Control.currentPosInSelection===mt.Control.qSelection.length-1) {
					mt.Visual.preFinish();
				}
			}
		}
	},
	
	finish: function(event) {
		var block = mt.Control.qCurrentIndex[0];
		var section = mt.Control.qCurrentIndex[1];
		var question = mt.Control.qCurrentIndex[2];
		// assess current question
		var a = mt.Control.Assessment.make(block, section, question);
		
		// if successfully collected, go finish
		if (a) {
			// Turn off timer, if time is not out
			if (!mt.Control.tTimeOut) {
				clearInterval(mt.Control.tTimer);
			}
			// Clear the selection if time is out
			else if (mt.Control.tTimeOut) {
				mt.Control.clearSelection();
			}
			
			mt.Visual.finish();
			
			mt.Control.save();
			
		}
	},
	
	save: function(event) {
		// All nums are converted to strings, since 'pdfmaker' doesn't get numbers 
		// 1. Create report data about Block 1 Sections 
		var Block1Results = [];
		var qToGetFromBlock1 = [];
		var TotalBlock1Scores = mt.Model.TotalBlock1Scores;
		var TotalBlock1Questions = 0;
		var Block1Success;
		
		// Count summary results for each Section in Block 1, returns an array ['scores','success']
		for (i=0; i< mt.Model.Block1Scores.length; i++) {
			var SecRes = [];
			var TotalSecQ = mt.Control.qToGetFromBlock1[i];
			var CorrectAns = mt.Model.Block1Scores[i];
			var Success = Math.floor((CorrectAns/TotalSecQ)*100);
			SecRes[0] = CorrectAns.toString();
			SecRes[1] = Success.toString()+'%';
			Block1Results[i] = SecRes;
		}
		
		// Count total questions for Block 1, convert everything to string
		for (i=0; i<mt.Control.qToGetFromBlock1.length; i++) {
			TotalBlock1Questions += mt.Control.qToGetFromBlock1[i];
			qToGetFromBlock1[i] = mt.Control.qToGetFromBlock1[i].toString();
		}
		
		// Count overall success for Block 1, convert everything to string
		Block1Success = Math.floor((TotalBlock1Scores/TotalBlock1Questions)*100);
		Block1Success = Block1Success.toString() + '%';
				
		// Convert to string Total Block 1 Scores
		TotalBlock1Scores = TotalBlock1Scores.toString(); 
		
		// 2. Create full content for report
		var x = tReport.createContent(qBank, TotalBlock1Scores, Block1Results, qToGetFromBlock1, Block1Success, mt.Model.UserData, mt.Model.StartTime);
		
		// making report depends on admin or not admin
		if (mt.Model.IsAdmin) {
			// if admin, then check if content for report is ready and make PDF report
			if (x) {
				tReport.make();
				mt.Visual.postSave();
			}
		}
		else {
			mt.Visual.ModalWindow.make('AdminValidation'); // if not admin - start validation
		}
	},
	
	close: function() {
		var $ModalWin = $(mt.DOM.ModalWin);
		mt.Visual.Effects.hide($ModalWin, 'Fastfade');
	},
	
	getUserData: function() {
		var ud = mt.Visual.Forms.getUserData();
		mt.Model.UserData.FullName = ud.Name; // Get user full name
		mt.Model.UserData.FirstName = mt.Model.UserData.FullName.split(' ')[1]; // Get user first name
		mt.Model.UserData.Position = ud.Position;
		mt.Model.UserData.Status = ud.Status;
		mt.Model.UserData.OfficeType = ud.OfficeType;
		mt.Model.UserData.OfficeName = ud.OfficeName;
		mt.Model.UserData.CertificationType = ud.CertType;
		mt.Model.UserData.TryNumber = ud.TryNumber;
		
		var GotData;
		for (x in mt.Model.UserData) {
			if (mt.Model.UserData[x]==='') {
				mt.Visual.UserNotification.make('NoUserData');
				GotData = false
				break
			}
			else {
				GotData = true
			}
		}
		
		return GotData
		
	},
	
	// Get questions
	createQuestionsSelection: function() {

		// 1. Thin out the Block1 - randomly exclude questions. 
		var block1 = qBank.questions[0];
		for (i=0; i<block1.length; i++) {
			var howManyQuestionsInSection = block1[i].length;
			var howManyToExclude = howManyQuestionsInSection - mt.Control.qToGetFromBlock1[i];
				
			// Create array of section questions indexes
			var indexes = [];
			for (j=0; j<block1[i].length; j++) {
				indexes[j] = j;
			}
			
			// Shuffle array of indexes
			mt.Control.shuffleArray(indexes);
						
			// Randomly false questions in the bank
			for (j=0; j<howManyToExclude; j++) {
				var pos = indexes[j];
				block1[i][pos] = false;
			}
			
			// Keep the original ordinal numbers of surviving questions
			for (j=0; j<block1[i].length; j++) {
				if (block1[i][j]!=false) {
					block1[i][j].OrdinalNumber = j+1;
				}
			}
			
			// Remove all 'false' from the bank
			for (j=block1[i].length-1; j>=0; j--) {
				if (block1[i][j]===false) {
					block1[i].splice(j, 1); //removes 1 elem from pos i
				}
			}
		}
		
		
		// 2. Create array of indexes, representng question sequence of Block1.
		var block1QuestionsSequence = [];
		for (i=0; i<block1.length; i++) {
			for (j=0; j<block1[i].length; j++) {
				var qIndexes = [0, i, j]
				block1QuestionsSequence.push(qIndexes);
			}
		}

		// 3. Shuffle array of indexes for Block1.
		mt.Control.shuffleArray(block1QuestionsSequence);
		
		
		// 4. Thin out Block 2, Section 1 questions
		var block2section1 = qBank.questions[1][0];
		// Now work with each consequential pairs of questions in array. Randomly set false to one from the pair 
		for (i=0; i<block2section1.length; i+=2) {
			var j = i+Math.floor(Math.random() * 2);
			block2section1[j] = false;
		}
		// Remove from questions array all elems set to false
		for (i=block2section1.length-1; i>=0; i--) {
			if (block2section1[i]===false) {
				block2section1.splice(i, 1); //removes 1 elem from pos i
			}
		}
		
		// 5. Thin out Block 2, Section 2 questions
		var block2section2 = qBank.questions[1][1];
		// Now work with each consequential pairs of questions in array. Randomly set false to one from the pair
		// '-4' because the last 4 questions are obligatory cases
		for (i=0; i<block2section2.length-4; i+=2) {
			var j = i+Math.floor(Math.random() * 2);
			block2section2[j] = false;
		}
		// Remove from questions array all elems set to false
		for (i=block2section2.length-1; i>=0; i--) {
			if (block2section2[i]===false) {
				block2section2.splice(i, 1); //removes 1 elem from pos i
			}
		}
		
		
		// 6. Thin out Block 2, Section 3 questions
		var block2section3 = qBank.questions[1][2];
		// Now work with each consequential pairs of questions in array. Randomly set false to one from the pair 
		for (i=0; i<block2section3.length; i+=2) {
			var j = i+Math.floor(Math.random() * 2);
			block2section3[j] = false;
		}
		// Remove from questions array all elems set to false
		for (i=block2section3.length-1; i>=0; i--) {
			if (block2section3[i]===false) {
				block2section3.splice(i, 1); //removes 1 elem from pos i
			}
		}
		
		
		// 7. Thin out and shuffle Block 2, Section 8 questions
		// The Section 8 consists of two logical two subsection
		// Needed to randomly get 10 questions from first subsection (totally 60), and then 1 from second (totally 10)
		// Create two temp arrays for each subsection
		var Sec8Sub1 = qBank.questions[1][7].slice(0, 60);
		var Sec8Sub2 = qBank.questions[1][7].slice(60, 70);
			
		// Create an array of numbers from 0 to 59 - indexes of first subsection
		var sub1Indexes = [];
		for (i=0; i<Sec8Sub1.length; i++) {
			sub1Indexes[i] = i;
		}
		// Randomly shuffle this array of indexes
		mt.Control.shuffleArray(sub1Indexes);
		// Now go through the shuffled array
		// Take first 45 numbers and set to false elements on corresponding position in subsection first (temp array)
		for (i=0; i<50; i++) {
			Sec8Sub1[sub1Indexes[i]] = false;
		}
		
		// Now shuffle the first subsection
		mt.Control.shuffleArray(Sec8Sub1);
		
		// Do the same for the second subsection (needed to get random 2 from 10)
		var sub2Indexes = [];
		for (i=0; i<Sec8Sub2.length; i++) {
			sub2Indexes[i] = i;
		}
		mt.Control.shuffleArray(sub2Indexes);
		for (i=0; i<9; i++) {
			Sec8Sub2[sub2Indexes[i]] = false;
		}
		
		mt.Control.shuffleArray(Sec8Sub2);
		
		// Concat two temp subsection 1 and 2 arrays
		var Section8NewSequence = Sec8Sub1.concat(Sec8Sub2);
		
		// Go through the entire Section 8 new sequence array and remove all elems set to false
		for (i=Section8NewSequence.length-1; i>=0; i--) {
			if (Section8NewSequence[i]===false) {
				Section8NewSequence.splice(i, 1); //removes 1 elem from pos i
			}
		}
		
		// Finally, reset the original Section 8 array in qBank
		qBank.questions[1][7] = Section8NewSequence;
		
		
		// 8. Create array of indexes, representing question sequence of Block2
		var block2 = qBank.questions[1];
		var block2QuestionsSequence = [];
		for (i=0; i<block2.length; i++) {
			for (j=0; j<block2[i].length; j++) {
				var qIndexes = [1, i, j]
				block2QuestionsSequence.push(qIndexes);
			}
		}
		
		
		// 9. Concatenate two arrays of indexes. The resulting array of indexes is a sequence of all question for displaying to user
		mt.Control.qSelection = block1QuestionsSequence.concat(block2QuestionsSequence);

	},
	
	clearSelection: function() {
		// Clear the rest of the Selection
		var block = mt.Control.qCurrentIndex[0];
		var section = mt.Control.qCurrentIndex[1];
		var question = mt.Control.qCurrentIndex[2];
		// if block 1, clear all the unanswered question from qBank
		for (i=mt.Control.currentPosInSelection+1; i<mt.Control.qSelection.length; i++) {
			var b = mt.Control.qSelection[i][0];
			var s = mt.Control.qSelection[i][1];
			var q = mt.Control.qSelection[i][2];
			qBank.questions[b][s][q] = false;
		}

		for (b=qBank.questions.length-1; b>=0; b--) {
			for (s=qBank.questions[b].length-1; s>=0; s--) {
				for (q=qBank.questions[b][s].length-1; q>=0; q--) {
					if (qBank.questions[b][s][q]===false) {
						qBank.questions[b][s].splice(q, 1);
					}
				}
			}
		}
	},

	shuffleArray: function(array) {
		var m = array.length;
		var t;
		var u;
		// While there remain elements to shuffle…
		while (m) {
			// Pick a remaining element…
			u = Math.floor(Math.random() * m--);

			// And swap it with the current element.
			t = array[m];
			array[m] = array[u];
			array[u] = t;
		}
	},
	
	getNextPosInSelection: function() {
		// Switch current position in selection
		this.currentPosInSelection++;
		// Get new question index
		this.qCurrentIndex = this.qSelection[mt.Control.currentPosInSelection];
	},
	
	changeQuestionOrdinal: function(block, section, question) {
		// Block 1 last two sections get new count
		if ((block===1)&&(section==8)&&(question===0)||(block===1)&&(section==9)&&(question===0)) {
			this.qCurrentOrdinalNum = 0;
		}
		// Switch question ordinal number
		this.qCurrentOrdinalNum++;
	},
	
	Assessment: {
		choices: function(ans, block, section, question) {
			// If not Section 10 in Block 2
			if ((block===0)||((block===1)&&(section<9))) {
				var ansScore = 0;
				var fairScore;
				// count scores for answer
				for (i=0; i<ans.checkedOptVal.length; i++) {
					// if correct was checked, ok
					if (ans.checkedOptVal[i]) {
						ansScore++;
					}
					// if incorrect was checked, break immediately
					else {
						ansScore = 0;
						break
					}
				}
				
				if (ansScore===0) {
					return 0;
				}
				else if (ansScore>0) {
					if (ans.totalVal<=2) {
						fairScore = Math.ceil((ans.totalVal/3)*2);
					}
					else {
						fairScore = Math.floor((ans.totalVal/3)*2);
					}
					
					if (ansScore>=fairScore) {
						// Each correct answer in cases of section 3 block 2 gets 2 points
						if ((block==1)&&(section==3)) {
							return 2;
						}
						// Each correct answer in section 8 block 2 gets different points
						else if ((block==1)&&(section==7)) {
							// 4 points for questions, except arithmetic (questions 16 and 17 in selection)
							if(question<15) {
								return 4
							}
							// 20 points for arithmetic
							else if ((question===15)||(question===16)) {
								return 20
							}
						}
						// All the rest get 1 points
						else {
							return 1;
						}
						
					}
					else {
						return 0;
					}
				}
			}
			else if ((block===1)&&(section===9)) {
				// In Section 10 all radio options. There're values are corresponding types of behavior in report template
				var r = ans.checkedOptVal[0]-1;
				return r
			}
			
		},
		fillInTheBlank: function(ans, block, section) {
			var r = ans.val
			return r
		},
		make: function(block, section, question) {
			var ans = mt.Visual.Forms.getAnswer(block, section, question);
			var result = this[ans.type](ans, block, section, question);
			mt.Control.countScores(result, block, section);
			mt.Control.collectDataForReport(ans, block, section, question, result);
			return true
		}
	},
	
	countScores: function(result, block, section) {
		if (block===0) {
			// Scores are total for the entire block
			mt.Model.TotalBlock1Scores += result;
			mt.Model.Block1Scores[section] += result;
		}
		else if (block===1) {
			// Scores counts per section in the block
			// All sections from 1 to 9
			if (section<9) {
				// in case this position in array is yet undefined
				if (!mt.Model.Block2Scores[section]) { 
					mt.Model.Block2Scores[section] = 0 
				}; 
				// in B2Sec4Q1, B2Sec5Q2, B2Sec5Q5 has string as result, check it
				if (isNaN(result)) {
					mt.Model.Block2Scores[section] += 0;
				}
				// for all other questions - count scores
				else {
					mt.Model.Block2Scores[section] += result;
				}
				
			}
			// Section 10
			else if (section===9) {
				if (result>=0) {
					mt.Model.Block2Section10Scores[result] += 1;
				}
			}
		}
	},
	
	collectDataForReport: function(ans, block, section, question, result) {
		// 'block' is a position in questions array. So Block 0 is Block 1 in human
		// if Block 1
		if (block===0) {
			// create question paragraph for report
			var rep = tReport.createBlock1QuestionParagraph(qBank.questions[block][section][question], ans.optStatus);
			// if paragraph was successfully created, attach it to corresponding question in qBank
			if (rep) {
				qBank.questions[block][section][question].DataForReport = rep;
			}
			// Set question correctness status
			qBank.questions[block][section][question].CorrectnessStatus = result;
		}
		// if Block 2
		else if (block===1) {
			if (section<9) {
				// in Block 2 Section 4 Question 1 the result is a txt-answer, that should be put in the report
				if (section===3) {
					var scores = mt.Model.Block2Scores[section];
					var template = this.applyBlock2ReportTemplates(scores, section);
					// Section 4, question 1 is excluded 
					/*for (i=0; i<mt.Model.Block2Section4Question1Answer.length; i++) {
						template.push(mt.Model.Block2Section4Question1Answer[i])
					}*/
					var rep = tReport.createBlock2SectionParagraph(template);
					if (rep) {
						qBank.Block2DataForReport[section] = rep;
					}
				}
				// in Block 2 Section 5 Question 2 and 5 the result is a txt-answer, that should be put in the report
				else if (section===4) {
					// if this Question 2 - just store the result
					if (question===1) {
						mt.Model.Block2Section5Question2Answer[1] = result;
					}
					// or Question 5 - just store the result
					else if (question===4) {
						mt.Model.Block2Section5Question5Answer[1] = result;
					}
					// else - get template, but add there Question 1 answer
					else {
						var scores = mt.Model.Block2Scores[section];
						var template = this.applyBlock2ReportTemplates(scores, section);
						for (i=0; i<mt.Model.Block2Section5Question2Answer.length; i++) {
							template.push(mt.Model.Block2Section5Question2Answer[i])
						}
						for (i=0; i<mt.Model.Block2Section5Question5Answer.length; i++) {
							template.push(mt.Model.Block2Section5Question5Answer[i])
						}
						var rep = tReport.createBlock2SectionParagraph(template);
						if (rep) {
							qBank.Block2DataForReport[section] = rep;
						}
					}
				}
				else {
					var scores = mt.Model.Block2Scores[section];
					var template = this.applyBlock2ReportTemplates(scores, section);
					var rep = tReport.createBlock2SectionParagraph(template);
					if (rep) {
						qBank.Block2DataForReport[section] = rep;
					}
				}
			}
			else if (section===9) {
				var scores = mt.Model.Block2Section10Scores;
				var template = this.applyBlock2ReportTemplates(scores, section);
				var rep = tReport.createBlock2SectionParagraph(template);
				if (rep) {
					qBank.Block2DataForReport[section] = rep;
				}
			}
		}
	},
	
	applyBlock2ReportTemplates: function(scores, section) {
		// 'section' is a position in block array. So section < 8 are all sections less than 9 in human
		if (section<7) {
			if (scores<=2) {
				var l = qBank.meta.Block2ReportTemplates.Regular[0].length;
				var template = qBank.meta.Block2ReportTemplates.Regular[0].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores===3)||(scores===4)) {
				var l = qBank.meta.Block2ReportTemplates.Regular[1].length;
				var template = qBank.meta.Block2ReportTemplates.Regular[1].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores===5)||(scores===6)) {
				var l = qBank.meta.Block2ReportTemplates.Regular[2].length;
				var template = qBank.meta.Block2ReportTemplates.Regular[2].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores===7)||(scores===8)) {
				var l = qBank.meta.Block2ReportTemplates.Regular[3].length;
				var template = qBank.meta.Block2ReportTemplates.Regular[3].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores===9)||(scores===10)) {
				var l = qBank.meta.Block2ReportTemplates.Regular[4].length;
				var template = qBank.meta.Block2ReportTemplates.Regular[4].slice(0, l);
				template[0] += scores.toString();
				return template
			}
		}
		else if (section===7) {
			if (scores<=20) {
				var l = qBank.meta.Block2ReportTemplates.Section8[0].length;
				var template = qBank.meta.Block2ReportTemplates.Section8[0].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=21)&&(scores<=40)) {
				var l = qBank.meta.Block2ReportTemplates.Section8[1].length;
				var template = qBank.meta.Block2ReportTemplates.Section8[1].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=41)&&(scores<=60)) {
				var l = qBank.meta.Block2ReportTemplates.Section8[2].length;
				var template = qBank.meta.Block2ReportTemplates.Section8[2].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=61)&&(scores<=80)) {
				var l = qBank.meta.Block2ReportTemplates.Section8[3].length;
				var template = qBank.meta.Block2ReportTemplates.Section8[3].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=81)&&(scores<=100)) {
				var l = qBank.meta.Block2ReportTemplates.Section8[4].length;
				var template = qBank.meta.Block2ReportTemplates.Section8[4].slice(0, l);
				template[0] += scores.toString();
				return template
			}
		}
		else if (section===8) {
			if (scores<=8) {
				var l = qBank.meta.Block2ReportTemplates.Section9[0].length;
				var template = qBank.meta.Block2ReportTemplates.Section9[0].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=9)&&(scores<=11)) {
				var l = qBank.meta.Block2ReportTemplates.Section9[1].length;
				var template = qBank.meta.Block2ReportTemplates.Section9[1].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=12)&&(scores<=15)) {
				var l = qBank.meta.Block2ReportTemplates.Section9[2].length;
				var template = qBank.meta.Block2ReportTemplates.Section9[2].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=16)&&(scores<=20)) {
				var l = qBank.meta.Block2ReportTemplates.Section9[3].length;
				var template = qBank.meta.Block2ReportTemplates.Section9[3].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=21)&&(scores<=25)) {
				var l = qBank.meta.Block2ReportTemplates.Section9[4].length;
				var template = qBank.meta.Block2ReportTemplates.Section9[4].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if ((scores>=26)&&(scores<=29)) {
				var l = qBank.meta.Block2ReportTemplates.Section9[5].length;
				var template = qBank.meta.Block2ReportTemplates.Section9[5].slice(0, l);
				template[0] += scores.toString();
				return template
			}
			else if (scores>=30) {
				var l = qBank.meta.Block2ReportTemplates.Section9[6].length;
				var template = qBank.meta.Block2ReportTemplates.Section9[6].slice(0, l);
				template[0] += scores.toString();
				return template
			}
		}
		else if (section===9) {
			var l = qBank.meta.Block2ReportTemplates.Section10.length;
			var tempArray = qBank.meta.Block2ReportTemplates.Section10.slice(0, l);
			var template = [];
			for (i=0; i<scores.length; i++) {
				tempArray[i][1] = scores[i];
			}
			
			tempArray.sort(function(a, b) {
				if (a[1] === b[1]) {
					return 0;
				}
				else {
					return (a[1] > b[1]) ? -1 : 1;
				}
			});
			
			for (i=0; i<tempArray.length; i++) {
				template[i] = tempArray[i][0]+tempArray[i][1].toString();
			}
			
			return template
		}
	},
	
	// Check admin pass
	checkpass: function(event) {
		var $ModalWindow = $(mt.DOM.ModalWin);
		if (mt.Visual.Forms.getAdminPass()===mt.Model.AdminPass) {
			mt.Model.IsAdmin = true; // if pass is correct, this is admin
			mt.Visual.Effects.hide($ModalWindow, 'Fastfade'); // hide Modal Window with Admin Validation
			this.save(); // repeat save action
		}
		else {
			mt.Visual.UserNotification.make('IncorrectAdminPass');
		}
	},
	
	// Timer
	getStartTime: function () {
		var D = new Date();
		
		var d = D.getDate();
		d = d.toString().length < 2 ? '0'+d : d;
		
		var m = D.getMonth()+1;
		m = m.toString().length < 2 ? '0'+m : m;
		
		var y = D.getFullYear();
		
		var hour = D.getHours();
		hour = hour.toString().length < 2 ? '0'+hour : hour;
		
		var min = D.getMinutes();
		min = min.toString().length < 2 ? '0'+min : min;
		
		return d+'.'+m+'.'+y+', '+hour+':'+min;		
		
	},
	
	launchTimer: function() {
		mt.Visual.updateTimer(2, 0, 0); // 2 hours left in H:M:S format
		var totalSeconds = mt.Model.TestDuration;
		var h, m, s;
		mt.Control.tTimer = setInterval(function(){ 
			totalSeconds--;
			h = Math.floor(totalSeconds/3600);
			m = Math.floor(totalSeconds/60)%60;
			s = totalSeconds%60;
			mt.Visual.updateTimer(h, m, s);
			
			// WHEN TIME IS OUT
			// stop timer, show notification, disable any inputs, clear the rest questions from selection, go to prefinish
			if ((h+m+s)===0) {
				// Set time out flag, used in t-report for 'time-out' line
				mt.Control.tTimeOut = true;
				// Stop Timer
				clearInterval(mt.Control.tTimer);
				// Notify user
				mt.Visual.UserNotification.make('TimeOut');
				// Hide Block 2 Section 9, if shown
				mt.Visual.Effects.hide($(mt.DOM.B2Sec9Timer), 'Fade');
				// Disable any inputs
				mt.Visual.Forms.disable();
				// clear li toggling input checks
				$(document).off('click', 'li');
								
				// Clear all elems from removing notification
				// clear Modal Window Background from removing notification
				$(document).off('click', mt.DOM.ModalWinBgr, mt.Visual.UserNotification.remove);
				// clear all elems from removeing notification
				$(document).off('click', 'li, input:radio, input:checkbox, textarea', mt.Visual.UserNotification.remove);
				
				// Change button to finish button
				mt.Visual.preFinish();
			}
		}, 1000);
	}
}

mt.Block2Section9 = {
	// flag for timer
	IsInAction: false,
	TimeIsOut: false,
	
	Timer: {
		guide: 180, // seconds = 3 min. 180
		main: 720, // seconds = 12 min.
				
		// Gets h, m, s from main Timer Update
		update: function(type) {
			this[type] --;
			totalSeconds = this[type];
			m = Math.floor(totalSeconds/60)%60;
			s = totalSeconds%60;
			
			var min = m < 10 ? '0'+m : m;
			var sec = s < 10 ? '0'+s : s;
			var t = min+':'+sec;
			
			$Timer = $(mt.DOM.B2Sec9Timer);
			$Timer.text(t);
			
			if ((m+s)===0) {
				if (mt.Block2Section9.Guide.IsInAction) {
					$(mt.DOM.bProceed).trigger('click');
				}
				else if (mt.Block2Section9.IsInAction) {
					// Set Section 9 flag to false
					mt.Block2Section9.IsInAction = false;
					// Disable inputs
					mt.Visual.Forms.disable();
					// Make notification
					mt.Visual.UserNotification.make('TimeOutSection9');
					// Temporarily clear li toggling input checks, set back on proceed button, when nex section
					$(document).off('click', 'li');
					// Clear rest of the question from Section 9, from qSelection
					var section = mt.Control.qCurrentIndex[1];
					var question = mt.Control.qCurrentIndex[2];
					for (i=mt.Control.qSelection.length-1; i>=0; i--) {
						for (j=0; j<mt.Control.qSelection[i].length; j++) {
							if ((mt.Control.qSelection[i][1]==8)&&(mt.Control.qSelection[i][2]>question)) {
								mt.Control.qSelection.splice(i, 1);
							}
						}
					}
				}
			}
		}
	},
	
	Guide: {
		Template: '<div class="q_box b2sec9guide"><p class=q_txt></p><form><ul class="q_options"></ul></form></div>',
		IsInAction: false,
		
		create: function(guideObj) {
			var $guide = $(this.Template);
			var $elem;
			var $place;
			// put guide txt into the box
			$guide.find('p.q_txt').text(guideObj.txt[0]);
			if (guideObj.txt.length>1) {
				for (i=1; i<guideObj.txt.length; i++) {
					if (i<guideObj.txt.length-1) {
						$elem = $('<p class=q_txt>'+guideObj.txt[i]+'</p>');
					}
					else if (i===guideObj.txt.length-1) {
						$elem = $('<p class="q_txt highlight">'+guideObj.txt[i]+'</p>');
					}
					$place = $guide.find('p.q_txt').filter(':last');
					mt.DOM.add($elem, $place, 'insertafter');
				}
			}
			
			// put questions 1 after the guide text
			var q1txt = guideObj.questions[0].txt[0];
			$elem = $('<p class=q_txt>'+q1txt+'</p>');
			$place = $guide.find('p.q_txt').filter(':last');
			mt.DOM.add($elem, $place, 'insertafter');
			// put options of question 1
			var intype = guideObj.questions[0].type; // input type
			var invalue; // input value
			var opTxt; // option text
			var opHTML; // option HTML line
			for (i=0; i<guideObj.questions[0].options.length; i++) {
				opTxt = guideObj.questions[0].options[i][0]; // option text is first in option array
				invalue = guideObj.questions[0].options[i][1]; // option value is second in option array
				opHTML = '<li><input name=option type='+intype+' value='+invalue+'>'+opTxt+'</li>';
				$guide.find('ul.q_options').append(opHTML); // $guide.find('ul.q_options.b2sec9guide').append(opHTML);
			}
						
			// put rest of the questions, starting from the 2nd
			for (i=1; i<guideObj.questions.length; i++) {
				// put question txt after the last form
				var qtxt = guideObj.questions[i].txt[0];
				$elem = $('<p class=q_txt>'+qtxt+'</p>');
				$place = $guide.find('form').filter(':last');
				mt.DOM.add($elem, $place, 'insertafter');
				intype = guideObj.questions[i].type; // input type
				// put form
				$elem = $('<form><ul class="q_options"></ul></form>'); // $elem = $('<form><ul class="q_options b2sec9guide"></ul></form>');
				$place = $guide.find('p.q_txt').filter(':last');
				mt.DOM.add($elem, $place, 'insertafter');
				// put options
				for (j=0; j<guideObj.questions[i].options.length; j++) {
					opTxt = guideObj.questions[i].options[j][0]; // option text is first in option array
					invalue = guideObj.questions[i].options[j][1]; // option value is second in option array
					opHTML = '<li><input name=option type='+intype+' value='+invalue+'>'+opTxt+'</li>';
					$guide.find('ul.q_options').filter(':last').append(opHTML); // $guide.find('ul.q_options.b2sec9guide').filter(':last').append(opHTML);
				}
			}
			
			return $guide
		},
		
		show: function($guide) {
			var $Content = $(mt.DOM.tContent);
			var $Title2 = $(mt.DOM.Title2);
			var $OldQuestion = $(mt.DOM.qBox);
			var $BProceed = $(mt.DOM.bProceed);
			
			$Title2.text('Инструкция');
			$BProceed.text('Далее');
			
			mt.Visual.Effects.hide($OldQuestion, 'Dropleft');
			$OldQuestion.queue(function(){
				mt.DOM.remove(this);
				mt.DOM.add($guide, $Content, 'appendTo');
				mt.Visual.Effects.show($guide, 'Fade');
			});
		}
	}
}


$(document).ready(mt.init);
/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 *************************************************************************************/

jQuery(function(){

	// PRODUCTION
	var GUIDER_URL = 'https://help.vtiger.com/guiders/index.php';

	var pageGuiders = false;
	var handler = null;
	var guiderStartIndex = -1;

	function init() {
		handler = jQuery('#guiderHandler');
		if (!handler.length) {
			handler = jQuery('<div id="guiderHandler">');
			handler.css({
				padding: '2px 10px',
				fontSize: '15px',
				fontWeight: 'bold',
				background: '#333',
				color: 'white',
				borderRadius: '15px',
				textDecoration: 'none',
				'vertical-align': 'middle'
			});
			handler.addClass('btn-group cursorPointer');
			handler.html("?");
			jQuery('.commonActionsButtonContainer').prepend(handler);
		}
		handler.css({visibility: 'hidden'}); // Enable if there is any help available.
		handler.click(initGuiders);
	}

	// http://stackoverflow.com/a/901144
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.search);
		return (results == null)? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function getGuiderURL() {
		var url = GUIDER_URL;
		var category = 'vtiger6';
		var topic = getParameterByName('module') || 'Home';
		var subtopic = getParameterByName('view')|| '';

		// Special cases
		if (topic == 'Home') { subtopic = ''; }
		// END

		return url + '?'+
			'category='+encodeURIComponent(category)+
			'&topic='+ encodeURIComponent(topic)+
			'&subtopic='+encodeURIComponent(subtopic);
	}

	// NOTE: Attempt for JSONP caching
	window.helpmenow__onLoadGuiderJSONP = function(guiderItems) {
		var start = -1;

		if (!guiderItems.length) {
			handler.css({visibility: 'hidden'});
		} else {
			handler.css({visibility: 'visible'});
		}

		for (var index in guiderItems) {
			var guiderItem = guiderItems[index];
			var buttons = [];

			// Transform some values.
			guiderItem['overlay'] = parseInt(guiderItem['overlay']) > 0;

			guiderItem['attachTo'] = guiderItem['attachto'];
			delete guiderItem['attachto'];

			// Pre-check the element existence.
			if (jQuery(guiderItem['attachTo']).length == 0) {
				delete guiderItem['attachTo'];
			}

			if (!parseInt(guiderItem['width']) > 0) delete guiderItem['width'];
			if (!parseInt(guiderItem['height'])> 0) delete guiderItem['height'];

			guiderItem['highlight'] = true;
			guiderItem['xButton'] = true;

			if (parseInt(guiderItem['nextid'])) {
				buttons.push({name: 'Next'});
				guiderItem['next'] = guiderItem['nextid'];
				delete guiderItem['nextid'];
			}
			if (parseInt(guiderItem['start'])) {
				start = guiderItem['id'];
				delete guiderItem['start'];
			}

			var offset = { top: null, left: null };
			var hasOffset = false;
			if (parseInt(guiderItem['offsettop'])) {
				hasOffset = true;
				offset.top = parseInt(guiderItem['offsettop']);
				delete guiderItem['offsettop'];
			}
			if (parseInt(guiderItem['offsetleft'])) {
				hasOffset = true;
				offset.left = parseInt(guiderItem['offsetleft']);
				delete guiderItem['offsetleft'];
			}
			if (hasOffset) guiderItem['offset'] = offset;

			if (buttons.length) {
				guiderItem['buttons'] = buttons;
			}

			guiders.createGuider(guiderItem);
		}

		// Initialize for re-use
		guiderStartIndex = start;
		pageGuiders = guiderItems;

		var firstTime = app.cacheGet('guiderjs.first', true);
		if (guiderStartIndex > -1 && firstTime) {
			app.cacheSet('guiderjs.first', false);
			guiders.show(guiderStartIndex);
		}
	}

	function initGuiders() {
		if (pageGuiders == false) {
			pageGuiders = [];

			jQuery.ajax({
				url: getGuiderURL(),
				type: 'GET',
				dataType: 'jsonp',
				jsonpCallback: 'helpmenow__onLoadGuiderJSONP' // (ref: http://bugs.jquery.com/ticket/7621)
			});
		} else if (guiderStartIndex != -1) {
			guiders.show(guiderStartIndex);
		}
	}

	//init();
	//initGuiders();
});

iFrameResize({
    log                     : false,
    heightCalculationMethod : 'taggedElement'
});

var TabUtils = new (function () {
	var keyPrefix = "_tabutils_";
	this.CallOnce = function (lockname, fn, timeout) {timeout = timeout || 3000;
		if (!lockname) throw "empty lockname";
		if (!window.localStorage) {
			fn();
			return;
		}
		var localStorageKey = keyPrefix + lockname;
		localStorage.setItem(localStorageKey, myTabId);
		setTimeout(function () {
			if (localStorage.getItem(localStorageKey) == myTabId)
				fn();
			}, 150);
		setTimeout(function () {localStorage.removeItem(localStorageKey);}, timeout);
	}
	this.BroadcastMessageToAllTabs = function (messageId, eventData) {
		if (!window.localStorage) return;
		var data = {data: eventData,timeStamp: (new Date()).getTime()};
		localStorage.setItem(keyPrefix + "event" + messageId, JSON.stringify(data));
		try {handlers[messageId](eventData);}
		catch(x) { }
		setTimeout(function () {localStorage.removeItem(keyPrefix + "event" + messageId);}, 3000);
	}
	var handlers = {};
	this.OnBroadcastMessage = function (messageId, fn) {
		if (!window.localStorage) return;
		window.addEventListener('storage', function (ev) {
			if (ev.key != keyPrefix + "event" + messageId) return;
			if (!ev.newValue) return;
			var messageData = JSON.parse(ev.newValue);
			fn(messageData.data);
		});
		handlers[messageId] = fn;
	}
	function someNumber() {
		return Math.random() * 1000000000 | 0;
	}
	var myTabId = performance.now() + ":" + someNumber();
	sessionStorage.setItem("TabId", myTabId);
});

TabUtils.CallOnce("lockname", function () {console.log("Run only once in multiple tabs"); });

function fadeIn(el, time) {
	el.style.opacity = 0;
	var last = +new Date();
	var tick = function() {
		el.style.opacity = +el.style.opacity + (new Date() - last) / time;
		last = +new Date();

		if (+el.style.opacity < 1) {
			(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
		}
	};
	tick();
}

var PhotosIframe = document.getElementById("photos-iframe");

PhotosIframe.onload = function(){
	document.getElementById("spinner").style.display = 'none';
	var doc = PhotosIframe.contentDocument || PhotosIframe.contentWindow.document;
	doc.getElementById("username").value = sessionStorage.getItem("UserName");
}

jQuery(document).ready(function() {

	// PhotoSwipe TopBar elements
	var referenceNode = document.querySelector('.pswp__preloader');
	
	var comments = document.createElement('button');
	comments.setAttribute('class', 'pswp__button pswp__button--comments');
	comments.title = "Comments";
	referenceNode.before(comments);
	comments.innerHTML += '<span><i id="photoComments" class="fa fa-comment-o"></i></span>';

	var likes = document.createElement('button');
	likes.setAttribute('class', 'pswp__button pswp__button--like');
	likes.title = "Like";
	referenceNode.before(likes);
	likes.innerHTML += '<span><i id="photoLikes" class="fa fa-heart-o"></i></span>';
	
	var i = 0;
	document.querySelectorAll('.rl-gallery-link').forEach(function(a) {
		var likeCount = ('likeCount-'+i);
		var commentCount = ('commentCount-'+i);
		i++;
		var div = document.createElement('div');
		div.setAttribute('class', 'content-overlay');
		a.prepend(div);
		var counts = document.createElement('div');
		counts.setAttribute('class', 'content-details fadeIn-top');
		counts.style.display = "inline-block";
		counts.id = '';
		a.append(counts);

		GraphJS.getStar(a.href, response => {
			//console.log("Star count...: " + a.href + ' Response : ' + response.count);
			counts.innerHTML += '<span style="padding: 10px;"><i id='+likeCount+' class="fa fa-heart-o">&nbsp;'+response.count+'</i></span>';
		});
		GraphJS.getComments(a.href, response => {
			//console.log("Comment count...: " + a.href + ' Response : ' + response.comments.length);
			counts.innerHTML += '<span style="padding: 10px;"><i id='+commentCount+' class="fa fa-comment-o">&nbsp;'+response.comments.length+'</i></span>';
		});
	});
	
	var parent = document.getElementById('rl-gallery-1');
	var imageList = parent.getElementsByTagName("img");
	for(i = 0; i < imageList.length; i++) {
		imageList[i].classList.add('content-image');
		//index = i+1;
		//imageList[i].classList.add('pid-'+index);
	}

	/*jQuery(".star").on('hover',function(){
		console.log('Love clicked ...: ');
		event.preventDefault();
	});*/

	/*jQuery(".rl-gallery-item").hover(function(event){
		elem = event.target;
		comments_count = 0;
		star_count = 0;
		

		
		GraphJS.getStar(elem.href, response => {
		  star_count = response.count;
		  console.log("Star count...: " + elem.href + ' Response : ' + star_count);
		  
		  GraphJS.getComments(elem.href, response => {
		  comments_count = response.comments.length;
		  console.log("Comment count...: " + elem.href + ' Response : ' + comments_count);

		


		
		
		console.log("Mouse is OVER...: " + elem);
		div = document.createElement('div');
		div.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
		div.id = "added";
		div.style.height = "100%";
		div.style.zIndex = "9";
		div.style.position = "absolute";
		div.style.bottom = "0";
		div.style.width = "100%";
		//div.style.height = "100%";
		//div.style.backgroundSize = "cover";
		
		window.setTimeout(()=>{
			div.innerHTML += '<div style="position: absolute; width: 100%; bottom: 50%; color: white; font-weight: 300; font-size: 18px;"><span id="star" style="z-index: 9; cursor: pointer;"><i class="fa fa-heart"></i>&nbsp;&nbsp;'+star_count+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id="comment" style="z-index: 9; cursor: pointer;"><i class="fa fa-comment"></i>&nbsp;&nbsp;'+comments_count+'</span></div>';
			this.appendChild(div);

			var commentIcon = document.getElementById("comment");
			commentIcon.addEventListener("click", comments);
			var starIcon = document.getElementById("star");
			starIcon.addEventListener("click", stars);
		}, 500);
		
			});
		});
		
		function comments() {
			GraphJS.addComment(
				elem.href,
				"This is a test comment.",
				function(response) {
					if(response.success) {
						
						//username.value = response.username;
						console.log("Comment ADDED...: " + elem + ' Response : ' + response.success);
					} else {
						GraphJS.showLogin();
					}
				}
			)
		}



		function stars() {
			GraphJS.star(
				elem.href,
				function(response) {
					if(response.success) {
						
						//username.value = response.username;
						console.log("Star ADDED...: " + elem + ' Response : ' + response.success);
					} else {
						GraphJS.showLogin();
					}
				}
			)
		}

		
	}, function(event){
				window.setTimeout(()=>{
		document.getElementById("added").outerHTML = "";
			//var elem = event.target;
			console.log("Mouse is OUT...: ");
			//this.removeChild(div);
			//remove(added);
				}, 500);

	}); */
	
	var eventDataString = "";
	var graphStatus = document.getElementById("graphStatus");
	var cameraIcon = document.getElementById("camera-icon");
	var doc = PhotosIframe.contentDocument || PhotosIframe.contentWindow.document;
	var username = doc.getElementById("username");
	
	function Success(username) {	
		graphStatus.style.display = 'block';
		cameraIcon.style.display = 'none';
		username.value = username;
		sessionStorage.setItem("UserName", username);
		PhotosIframe.contentWindow.location.reload();
		jQuery(PhotosIframe).slideDown();
		fadeIn(PhotosIframe, 2000);
	}

	GraphJS.getSession(
		function(response) {
			if(response.success) {
				//username.value = response.username;
				Success(response.username);
			} else {
				sessionStorage.removeItem("UserName");
				//username.value = "";
				cameraIcon.style.display = 'block';
				graphStatus.style.display = 'none';
			}
		}
	)
	GraphJS.on("afterLogin", function() {
		GraphJS.getSession(
			function(response) {
				if(response.success) {
					Success(response.username);
				}
			}
		)
		var tab = sessionStorage.getItem("TabId")+"/";
		var user = sessionStorage.getItem("UserName")+"/";
		TabUtils.BroadcastMessageToAllTabs("auth", tab+user+"LOGIN");
	}); 
	
	function aLogout() {
		sessionStorage.removeItem("UserName");
		//username.value = "";
		jQuery(PhotosIframe).slideUp();
		cameraIcon.style.display = 'block';
		graphStatus.style.display = 'none';
	}
	
	GraphJS.on("afterLogout", function() {
		var tab = sessionStorage.getItem("TabId")+"/";
		var user = sessionStorage.getItem("UserName")+"/";
		TabUtils.BroadcastMessageToAllTabs("auth", tab+user+"LOGOUT");
		aLogout();
	});

	cameraIcon.addEventListener("click", logStatus);
		function logStatus() {
			GraphJS.showLogin();
		}

    //Handle Broadcast message
	TabUtils.OnBroadcastMessage("auth", function (eventDataString) {
		result = eventDataString.split('/');
		var tab = sessionStorage.getItem("TabId");
		var user = sessionStorage.getItem("UserName");
		if (result[0] != tab && result[1] == user && result[2] == "LOGOUT") {
			aLogout();
		}
		if (result[0] != tab && user == undefined && result[2] == "LOGIN") {
			location.reload();
		}
	});
});

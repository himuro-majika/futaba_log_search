// ==UserScript==
// @name           futaba log search
// @namespace      https://github.com/himuro-majika
// @description    img,dat,may,junのスレが消えた時に過去ログを表示しちゃう
// @include        http://img.2chan.net/b/res/*.htm
// @include        http://dat.2chan.net/b/res/*.htm
// @include        http://may.2chan.net/b/res/*.htm
// @include        http://jun.2chan.net/b/res/*.htm
// @require        http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @version        1.1.0
// @grant          GM_xmlhttpRequest
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAPUExURYv4i2PQYy2aLUe0R////zorx9oAAAAFdFJOU/////8A+7YOUwAAAElJREFUeNqUj1EOwDAIQoHn/c88bX+2fq0kRsAoUXVAfwzCttWsDWzw0kNVWd2tZ5K9gqmMZB8libt4pSg6YlO3RnTzyxePAAMAzqMDgTX8hYYAAAAASUVORK5CYII=
// ==/UserScript==
this.$ = this.jQuery = jQuery.noConflict(true);

(function ($) {
	var waitnum = 10;	//404時のページ遷移ウェイト[秒]

	var title = document.title;								//ページタイトル

	//パターン:http://dat.2chan.net/b/res/11111111.htm
	var $S = document.domain.match(/^[^.]+/);			//鯖名(dat)
	var $F = location.pathname.match(/\d+\.htm/);		//ファイル名(11111111.htm)
	var $D = $F[0].match(/\d+/);						//ファイル名の数字(11111111)

	//ログ保管サービスジャンプ先URL
	var logService = {
		img: [
			{
				site: "logbox",
				url: "http://parupunte.net/logbox/detail.html?no=" + $D,
			},
			{
				site: "ふたろぐばこ",
				url: "http://imgbako.com/" + $F,
			},
			{
				site: "ぽかん庫",
				url: "http://u.magipoka.net/res/" + $F,
			},
			{
				site: "iFutaba",
				url: "http://ifutaba.net/" + $S + "/" + $F,
			},
			{
				site: "FTBucket",
				url: "http://dev.ftbucket.info/scrapshot/" + $S + "/cont/" + $S + ".2chan.net_b_res_" + $D + "/index.htm",
			},
		],
		dat: [
			{
				site: "リッチー",
				url: "http://appsweets.net/tatelog/dat/thread/" + $D,
			},
			{
				site: "iFutaba",
				url: "http://ifutaba.net/" + $S + "/" + $F,
			},
		],
		may: [
			{
				site: "ふたろぐばこ",
				url: "http://futalog.com/" + $F,
			},
			{
				site: "iFutaba",
				url: "http://ifutaba.net/" + $S + "/" + $F,
			},
			{
				site: "FTBucket",
				url: "http://dev.ftbucket.info/scrapshot/" + $S + "/cont/" + $S + ".2chan.net_b_res_" + $D + "/index.htm",
			},
		],
		jun: [
			{
				site: "ふたばログギャラリー",
				url: "http://kmlg.jp/logview/kmlg.jp/archive/jun_b/" + $F + "/index.htm",
			},
			{
				site: "iFutaba",
				url: "http://ifutaba.net/" + $S + "/" + $F,
			},
			{
				site: "FTBucket",
				url: "http://dev.ftbucket.info/scrapshot/" + $S + "/cont/" + $S + ".2chan.net_b_res_" + $D + "/index.htm",
			},
		]
	};
	//鯖毎の振り分け
	var logService_server = logService[$S];

	//通常時
	if (title !== "404 File Not Found") {
		makelogsitebutton();
	}
	//404時
	else {
		var $h1 = $("body > h1");
		$h1.before("<div><span id='countdown'>" + waitnum + "</span>秒後に外部ログサイト(" + logService_server[0].site + ")に移動します</div>");
		$h1.before("<div>ログサイトリスト :</div>");
		$h1.before("<ul id='loglist'></ul>");
		var $li = $("#loglist");
		logService_server.forEach(function(item) {
			$li.append("<li><a href='" + item.url + "' target='_blank' rel=noreferrer>" + item.site + "*</a></li>");
		});
		satty();
		msmht();
		setTimeout(redirect, waitnum * 1000);
		setInterval(countdown, 1000);
	}

	function makelogsitebutton() {
		var toggle_flag = true;
		var $logsitelink = $("<a>", {
			id: "futaba_log_search_loglist_button",
			text: "[外部ログサイト]",
			css: {
				cursor: "pointer",
			},
			click: function() {
				showlogsitelist();
			}
		});
		$("body > table").before($logsitelink);

		function showlogsitelist() {
			if(toggle_flag) {
				$("#futaba_log_search_loglist_button").after($("<ul id='loglist'>"));
				var $li = $("#loglist");
				logService_server.forEach(function(item) {
					$li.append("<li><a href='" + item.url + "' target='_blank' rel=noreferrer>" + item.site + "*</a></li>");
				});
				toggle_flag = false;
			}
			else {
				$("#loglist").remove();
				toggle_flag = true;
			}
		}
	}


	/*
	 * ログ保管先にジャンプ
	 */
	function redirect() {
		location.href = logService_server[0].url;
	}

	function countdown() {
		if(waitnum > 0){
			waitnum--;
		}
		$("#countdown").text(waitnum);
	}

	/*
	 * サッチーのログを検索
	 */
	function satty(){
		var url_prefix = "http://tsumanne.net";
		var url_ss;
		var url_cgi = "indexes.php?format=json&sbmt=URL&w=";
		if ($S == "img") {
			url_ss = "/si/";
		}
		else if ($S == "dat") {
			url_ss = "/sa/";
		}
		else if ($S == "may") {
			url_ss = "/my/";
		}
		else {
			return;
		}
		var url_req = url_prefix + url_ss + url_cgi + $D;
		GM_xmlhttpRequest({
			method: "GET",
			url: url_req,
			onload: function(response) {
				var res = JSON.parse(response.responseText);
				if (res.success) {
					$li.append("<li><a href='" + url_prefix + res.path + "' target='_blank'>「」ッチー*</a></li>");
				}
			}
		});
	}
	function msmht() {
		var url_prefix = "http://kokoromati.orz.hm/mm/view";
		var url_ss;
		var url_cgi = "catalog";
		if ($S == "may") {
			url_ss = "/11/";
		}
		else if ($S == "img") {
			url_ss = "/14/";
		}
		else if ($S == "dat") {
			url_ss = "/15/";
		}
		else {
			return;
		}
		var url_req = url_prefix + url_ss + url_cgi	;
		GM_xmlhttpRequest({
			method: "POST",
			url: url_req,
			data: "filter=%24mht_name%3D%3D%22" + $S + ".b." + $D + ".mht%22",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload: function(response) {
				var exp = new RegExp(/<td class="td03"><a href="\/mm\/view(\/mht\/\d+)" target="_blank">/);
				var path = response.responseText.match(exp);
				if( path ){
					$li.append("<li><a href='" + url_prefix + path[1] + "' target='_blank'>Ms.MHT*</a></li>");
				}
			}
		});
	}
})(jQuery);

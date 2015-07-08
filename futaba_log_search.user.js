// ==UserScript==
// @name           futaba log search
// @namespace      https://github.com/himuro-majika
// @description    img,dat,may,junのスレが消えた時に過去ログを表示しちゃう
// @include        http://img.2chan.net/b/res/*.htm
// @include        http://dat.2chan.net/b/res/*.htm
// @include        http://may.2chan.net/b/res/*.htm
// @include        http://jun.2chan.net/b/res/*.htm
// @require        http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @grant          GM_xmlhttpRequest
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAPUExURYv4i2PQYy2aLUe0R////zorx9oAAAAFdFJOU/////8A+7YOUwAAAElJREFUeNqUj1EOwDAIQoHn/c88bX+2fq0kRsAoUXVAfwzCttWsDWzw0kNVWd2tZ5K9gqmMZB8libt4pSg6YlO3RnTzyxePAAMAzqMDgTX8hYYAAAAASUVORK5CYII=
// ==/UserScript==
this.$ = this.jQuery = jQuery.noConflict(true);

(function ($) {
	var waitnum = 3;	//404時のページ遷移ウェイト[秒]

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
		]
	};
	//鯖毎の振り分け
	var logService_server = logService[$S];

	//404時
	if (title == "404 File Not Found") {
		var $h1 = $("body > h1");
		$h1.before("<div><span id='countdown'>" + waitnum + "</span>秒後に外部ログサイト(" + logService_server[0].site + ")に移動します</div>");
		$h1.before("<div>ログサイトリスト :</div>");
		$h1.before("<ul id='loglist'></ul>");
		var $li = $("#loglist");
		logService_server.forEach(function(item) {
			$li.append("<li><a href='" + item.url + "' target='_blank' rel=noreferrer>" + item.site + "*</a></li>");
		});
		satty($S, $D);
		setTimeout(redirect, waitnum * 1000);
		setInterval(countdown, 1000);
	}
	//通常時
	else {
		$("body > table").before("<a href='" + logService_server[0].url + "' target='_blank' rel=noreferrer>外部ログサイト*</a>");
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
	function satty(saba, name){
		var url_prefix = "http://tsumanne.net";
		var url_ss;
		var url_cgi = "indexes.php?format=json&sbmt=URL&w=";
		if (saba == "img") {
			url_ss = "/si/";
		}
		else if (saba == "dat") {
			url_ss = "/sa/";
		}
		else {
			return;
		}
		var url_req = url_prefix + url_ss + url_cgi + name;
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
})(jQuery);

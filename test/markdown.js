var Markdown = require('../markdown').Markdown,
	fs = require('fs'),
	_ = require('underscore');

var tests = [
	{ 
		str: "some stuff [a link](https://google.bsd) and http://yngwie.sci/hey/now/#/foo?bar=true\n" +
	"Some more stuff glip.bsd and [awesome is awesome](reddit.sci/foo/bar?hey=now#hoes) dont forget about \nhookers.asia",
		len: 398,
		escaped_len: 398 
	},
	{ 
		str: "some stuff [a link](https://google.com) and https://yngwie.com/hey/now/#/foo?bar=true\n" +
	"Some more stuff ftp://glip.com and [awesome is awesome](http://reddit.com/foo/bar?hey=now#hoes) dont forget about \nhookers.com",
		len: 517,
		escaped_len: 517 
	},
	{
		str: 'test.com jeff@gmail.com<a class="at_mention_post ico ico-files" mid="1234">jeff@gmail.com hey.com</a><b>jeff@gmail.com test.com</b><a href=foo.com>alreadyalink.com test.com foo.com</a>google.com jeff@gmail.com',
		len: 607,
		escaped_len: 1052
	},
	{
		str: '<a href="http://google.com" class="heynow"><img src="http://heynow.com">Words</a> https://google.com',
		len: 166,
		escaped_len: 344
	},
	{
		str: '{{-{{a href="http://google.com" class="heynow"}}-}}{{-{{img src="http://heynow.com"}}-}} http://legit.com',
		len: 105,
		escaped_len: 135
	},
	{
		str: '[code]\n|test|test|\n[/code]\n|test|test|',
		len: 125,
		escaped_len: 125
	},
	{
		str: '[code]\n* awesome\n[/code]\n* awesome',
		len: 66,
		escaped_len: 66
	},
	{
		str: '[code]\n**awesome**\n[/code]\n**awesome**',
		len: 57,
		escaped_len: 57
	},
	{
		str: '[code]\n*awesome*\n[/code]\n*awesome*',
		len: 55,
		escaped_len: 55
	},
	{
		str: '[code]\n__awesome__ google.com\n[/code]\n__awesome__ google.com',
		len: 209,
		escaped_len: 209
	},
	{
		str: '[code]\n~~awesome~~ google.com\n[/code]\n~~awesome google.com~~',
		len: 219,
		escaped_len: 219 
	},
	{
		str: '&gt; some stuff[code]\n&gt; some more stuff[/code]\n&gt; even moar',
		len: 84,
		escaped_len: 92
	},
	{
		str: '[code][some link](http://heynow.com)[/code][legit](http://legit.com)',
		len: 172,
		escaped_len: 172
	},
	{
		str: '[oiasjdf@Ooijasdf.com](mailto:oiasjdf@Ooijasdf.com)',
		len: 95,
		escaped_len: 95
	},
	{
		str: '[Ooijasdf.com](Ooijasdf.com)',
		len: 72,
		escaped_len: 72
	},
	{
		str: '<a href class="at_mention_post ico ico-link" mid="1581073">http://glipdev.atlassian.net/browse/GLIP-3668</a>',
		len: 108,
		escaped_len: 243
	},
	{ 
		str: '{{-{{a href class="at_mention_post ico ico-link" mid="1581073"}}-}}http://glipdev.atlassian.net/browse/GLIP-3668{{-{{/a}}-}}',
		len: 124,
		escaped_len: 144
	},
	{
		str: 'mentioning <a class=\'at_mention_compose\' rel=\'{"id":1581073}\'>@https://glipdev.atlassian.net/browse/GLIP-3668</a> ',
		len: 114,
		escaped_len: 260
	},
	{
		str: 'this is a full.email@address.com for you',
		len: 117,
		escaped_len: 117
	},
	{
		str: 'this is a https://d2.glip.net:10150 link with port',
		len: 123,
		escaped_len: 123
	},
	{
		str: 'this is a https://10.0.1.11:12345 ip with port',
		len: 117,
		escaped_len: 117
	},
	{
		str: 'this is a weird but valid url https://foo-bar.fack-10.bar:8080',
		len: 142,
		escaped_len: 142
	},
	{
		str: 'this is a number 1.1415926 1.2.3 1.2.3.4',
		len: 40,
		escaped_len: 40
	},
	{
		str: '<body class="listing-chooser-collapsed with-listing-chooser front-page loggedin hot-page listing-page" ><div id="header" role="banner"><a tabindex="1" href="#content" id="jumpToContent">jump to content</a><div id="sr-header-area"><div class="width-clip"><div class="dropdown srdrop" onclick="open_menu(this)" onmouseover="hover_open_menu(this)"><span class="selected title">my subreddits</span></div><div class="drop-choices srdrop"><a href="http://www.reddit.com/r/ABitFuckedIfYouAskMe/" class="choice" >ABitFuckedIfYouAskMe</a><a href="http://www.reddit.com/r/analytics/" class="choice" >analytics</a><a href="http://www.reddit.com/r/Android/" class="choice" >Android</a><a href="http://www.reddit.com/r/aww/" class="choice" >aww</a><a href="http://www.reddit.com/r/bestof/" class="choice" >bestof</a><a href="http://www.reddit.com/r/budgetfood/" class="choice" >budgetfood</a><a href="http://www.reddit.com/r/civbeyondearth/" class="choice" >civbeyondearth</a><a href="http://www.reddit.com/r/climateskeptics/" class="choice" >climateskeptics</a><a href="http://www.reddit.com/r/compsci/" class="choice" >compsci</a><a href="http://www.reddit.com/r/conspiracy/" class="choice" >conspiracy</a><a href="http://www.reddit.com/r/CraftBeer/" class="choice" >CraftBeer</a><a href="http://www.reddit.com/r/DestructionPorn/" class="choice" >DestructionPorn</a><a href="http://www.reddit.com/r/DoesAnybodyElse/" class="choice" >DoesAnybodyElse</a><a href="http://www.reddit.com/r/drunkencookery/" class="choice" >drunkencookery</a><a href="http://www.reddit.com/r/EDC/" class="choice" >EDC</a><a href="http://www.reddit.com/r/environment/" class="choice" >environment</a><a href="http://www.reddit.com/r/funny/" class="choice" >funny</a><a href="http://www.reddit.com/r/GamePhysics/" class="choice" >GamePhysics</a><a href="http://www.reddit.com/r/gaming/" class="choice" >gaming</a><a href="http://www.reddit.com/r/geek/" class="choice" >geek</a><a href="http://www.reddit.com/r/getdisciplined/" class="choice" >getdisciplined</a><a href="http://www.reddit.com/r/gifextra/" class="choice" >gifextra</a><a href="http://www.reddit.com/r/glip/" class="choice" >glip</a><a href="http://www.reddit.com/r/HeavySeas/" class="choice" >HeavySeas</a><a href="http://www.reddit.com/r/HighQualityGifs/" class="choice" >HighQualityGifs</a><a href="http://www.reddit.com/r/homelab/" class="choice" >homelab</a><a href="http://www.reddit.com/r/ilerminaty/" class="choice" >ilerminaty</a><a href="http://www.reddit.com/r/InfernalMachine/" class="choice" >InfernalMachine</a><a href="http://www.reddit.com/r/investing/" class="choice" >investing</a><a href="http://www.reddit.com/r/JusticePorn/" class="choice" >JusticePorn</a><a href="http://www.reddit.com/r/Marinas_Boating/" class="choice" >Marinas_Boating</a><a href="http://www.reddit.com/r/marketing/" class="choice" >marketing</a><a href="http://www.reddit.com/r/Moviefails/" class="choice" >Moviefails</a><a href="http://www.reddit.com/r/netsec/" class="choice" >netsec</a><a href="http://www.reddit.com/r/PeterSchiff/" class="choice" >PeterSchiff</a><a href="http://www.reddit.com/r/philosophy/" class="choice" >philosophy</a><a href="http://www.reddit.com/r/politics/" class="choice" >politics</a><a href="http://www.reddit.com/r/programming/" class="choice" >programming</a><a href="http://www.reddit.com/r/pwned/" class="choice" >pwned</a><a href="http://www.reddit.com/r/QuarkCoin/" class="choice" >QuarkCoin</a><a href="http://www.reddit.com/r/rage/" class="choice" >rage</a><a href="http://www.reddit.com/r/restoretheforthfl/" class="choice" >restoretheforthfl</a><a href="http://www.reddit.com/r/Silverbugs/" class="choice" >Silverbugs</a><a href="http://www.reddit.com/r/SouthFlorida/" class="choice" >SouthFlorida</a><a href="http://www.reddit.com/r/space/" class="choice" >space</a><a href="http://www.reddit.com/r/startups/" class="choice" >startups</a><a href="http://www.reddit.com/r/technology/" class="choice" >technology</a><a href="http://www.reddit.com/r/todayilearned/" class="choice" >todayilearned</a><a href="http://www.reddit.com/r/WastedGifs/" class="choice" >WastedGifs</a><a href="http://www.reddit.com/r/Whatcouldgowrong/" class="choice" >Whatcouldgowrong</a><a href="http://www.reddit.com/subreddits/" class="bottom-option choice" >edit subscriptions</a></div><div class="sr-list"><ul class="flat-list sr-bar hover" ><li class=\'selected\'><a href="http://www.reddit.com/" class="choice" >front</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/all" class="choice" >all</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/random/" class="random choice" >random</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/mod" class="choice" >mod</a></li></ul><span class="separator">&nbsp;|&nbsp;</span><ul class="flat-list sr-bar hover" ><li ><a href="http://www.reddit.com/r/funny/" class="choice" >funny</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/aww/" class="choice" >aww</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/todayilearned/" class="choice" >todayilearned</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/gaming/" class="choice" >gaming</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/technology/" class="choice" >technology</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/politics/" class="choice" >politics</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/bestof/" class="choice" >bestof</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/conspiracy/" class="choice" >conspiracy</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/Android/" class="choice" >Android</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/JusticePorn/" class="choice" >JusticePorn</a></li><li ><span class="separator">-</span><a href="http://www.reddit.com/r/space/" class="choice" >space</a></li>',
		len: 6088,
		escaped_len: 14770 
	},
	{
		str: "**File**\n[calendar-jeff.ics](https://trello-attachments.s3.amazonaws.com/5463e14ac46008b0ec6feccf/553e4f4aa147ee4561e8c580/b66fa91c8224cfb458831a9618118c2f/calendar-jeff.ics)",
		len: 221,
		escaped_len: 221
	},
	{
		str: 'text text https://glip.com/#foo=__test__ text text text https://glip.com/#bar=__test__ foobar__text__ text',
		len: 265,
		escaped_len: 265
	},
	{
		str: '[code](a=$(location).attr("href").match(/https:\/\/([^\/]+)\/r(\/[^\?]+)?(.*)/))&&4<=a.length&&history.pushState(null,null,"https://"+a[1])',
		len: 156,
		escaped_len: 195
	},
	{
		str: '- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\r\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\r\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n',
		len: 9602,
		escaped_len: 9602
	},
	{
		str: fs.readFileSync('etc/largeslowmarkdown.txt', 'utf8'),
		len: 440048,
		escaped_len: 564936
	}
];

// tests = [tests[tests.length - 1]];

_.each(tests, function(test) {
	_.each([{key: 'escaped_len', opts: {}}, {key: 'len', opts: {dont_escape: true }}], function(settings) {
		var str = test.str;
		var start = +new Date();
		var marked = Markdown(str, settings.opts);
		var taken = +new Date() - start;
		var debug = false;

		if(debug === true) {
			console.warn("************************************* Original Text ***************\n");
			console.warn(str);
			console.warn("\n********************************** Marked Text ***************\n");
			console.warn(marked);
			console.warn("****************************************************************\n");
		}

		if (marked.length === test[settings.key]) { 
			console.warn("Passed - " + str.length + ' -> ' + marked.length + " bytes " + taken + "ms");
		}
		else {
			console.warn("############################################");
			console.warn(str);
			console.warn("--------------------------------------------");
			Markdown(str, { dont_escape: true, warns: true });
			console.warn("--------------------------------------------");
			console.warn(marked); 
			console.warn(marked.length, 'vs', test[settings.key]);
			console.warn("############################################");
			console.warn("FAILED - " + marked.length + " bytes " + taken + "ms");
		}
	});
});
var Markdown = require('../markdown').Markdown,
	fs = require('fs'),
	_ = require('underscore');

var tests = [
	{
		str: "{{-{{img src=x onerror=prompt(document.cookie)}}-}}{{-{{/img}}-}}",
		len: 65,
		escaped_len: 65
	},
	{
		str: "| **When** | 11:30am on Monday |\n| **Account** | dan@close.com |\n| **From** | Dave Varenos |\n| **To** | Dan Foody |",
		len: 431,
		escaped_len: 431
	},
	{
		str: "email me at mailto:foo@bar.com or [mail my friend](mailto:myfriend@bar.com)",
		len: 178,
		escaped_len: 178
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
		len: 144,
		escaped_len: 144
	},
	{
		str: '[code]\n~~awesome~~ google.com\n[/code]\n~~awesome google.com~~',
		len: 154,
		escaped_len: 154
	},
	{
		str: '&gt; some stuff[code]\n&gt; some more stuff[/code]\n&gt; even moar',
		len: 84,
		escaped_len: 92
	},
	{
		str: '[code][some link](http://heynow.com)[/code][legit](http://legit.com)',
		len: 184,
		escaped_len: 184
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
		escaped_len: 242
	},
	{
		str: '{{-{{a href class="at_mention_post ico ico-link" mid="1581073"}}-}}http://glipdev.atlassian.net/browse/GLIP-3668{{-{{/a}}-}}',
		len: 124,
		escaped_len: 144
	},
	{
		str: 'mentioning <a class=\'at_mention_compose\' rel=\'{"id":1581073}\'>@https://glipdev.atlassian.net/browse/GLIP-3668</a> ',
		len: 114,
		escaped_len: 259
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
		escaped_len: 14704
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
		len: 159,
		escaped_len: 195
	},
	{
		str: '- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\r\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\r\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n- **[e85b389b](https://github.com/glipdev/glip-mobile/commit/e85b389bcd5d5239416c2116dee4f14ccb2557dc)**: correctly render loading state - **trevis**\n',
		len: 9602,
		escaped_len: 9602
	},
	{
		str: fs.readFileSync('etc/largeslowmarkdown.txt', 'utf8'),
		len: 440100,
		escaped_len: 566128
	},
	/*
		tests whether or not a link's regex is properly replacing the characters
		".,?:;()*&!" so that they will not become apart of a link when placed at
		the end of one
	*/
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249:',
		len: 141,
		escaped_len: 141
	},
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249;',
		len: 141,
		escaped_len: 141
	},
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249(',
		len: 141,
		escaped_len: 141
	},
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249)',
		len: 141,
		escaped_len: 141
	},
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249*',
		len: 141,
		escaped_len: 141
	},
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249&',
		len: 141,
		escaped_len: 141
	},
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249!',
		len: 141,
		escaped_len: 141
	},
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249: test',
		len: 146,
		escaped_len: 146
	},
	{
		str: 'https://jira.ringcentral.com/browse/GLIP-16249 test',
		len: 145,
		escaped_len: 145
	}
];
var phone_tests = [
	{
		str: '88-52',
		expected_res: false
	},
	{
		str: '6-11,13-15,5-11',
		expected_res: false
	},
	{
		str: '2019-12-05 17:13:56',
		expected_res: false
	},
	{
		str: '+01 45-4444-4444',
		expected_res: true
	},
	{
		str: '2015-10-18 05:25:31 SCORE: 10-18, 14-13, 2-7',
		expected_res: false
	}
];
var score_tests = [
	{
		str: '88-52',
		expected_res: true
	},
	{
		str: '6-11,13-15,5-11',
		expected_res: true
	},
	{
		str: '2019-12-05 17:13:56',
		expected_res: false
	},
	{
		str: '+01 45-4444-4444',
		expected_res: false
	},
	{
		str: '2015-10-18 05:25:31 SCORE: 10-18, 14-13, 2-7',
		expected_res: true
	}
];
var timestamp_tests = [
	{
		str: '88-52',
		expected_res: false
	},
	{
		str: '6-11,13-15,5-11',
		expected_res: false
	},
	{
		str: '2019-12-05 17:13:56',
		expected_res: true
	},
	{
		str: '+01 45-4444-4444',
		expected_res: false
	},
	{
		str: '2015-10-18 05:25:31 SCORE: 10-18, 14-13, 2-7',
		expected_res: true
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
var phone_regex = Markdown.potential_phone_regex;
var timestamp_regex = Markdown.timestamp_regex;
var score_regex = Markdown.score_regex;
_.each(phone_tests, function(test){
	var str = test.str;
	var start = +new Date();
	var temp = phone_regex.test(str);
	var taken = +new Date() - start;
	if(temp === test.expected_res) {
		console.warn("Passed - " + str + " is " + test.expected_res + " for phone regex " + taken + "ms");
	}
	else {
		console.warn("############################################");
		console.warn(str);
		console.warn("--------------------------------------------");
		console.warn('RESULT: ' + temp + ' vs '+ 'EXPECTED: ' + test.expected_res);
		//console.warn(`typeof temp: ${typeof temp}, temp: ${temp}`);
		//console.warn(`typeof test.expected_res: ${typeof test.expected_res}, test.expected_res: ${test.expected_res}`);
		console.warn("FAILED " + str + " for phone regex");
	}
});
_.each(score_tests, function(test){
	var str = test.str;
	var start = +new Date();
	var temp = score_regex.test(str);
	var taken = +new Date() - start;
	if(temp === test.expected_res) {
		console.warn("Passed - " + str + " is " + test.expected_res + " for score regex " + taken + "ms");
	}
	else {
		console.warn("############################################");
		console.warn(str);
		console.warn("--------------------------------------------");
		console.warn('RESULT: ' + temp + ' vs '+ 'EXPECTED: ' + test.expected_res);
		//console.warn(`typeof temp: ${typeof temp}, temp: ${temp}`);
		//console.warn(`typeof test.expected_res: ${typeof test.expected_res}, test.expected_res: ${test.expected_res}`);
		console.warn("FAILED " + str + " for score regex");
	}
});
_.each(timestamp_tests, function(test){
	var str = test.str;
	var start = +new Date();
	var temp = timestamp_regex.test(str);
	var taken = +new Date() - start;
	if(temp === test.expected_res) {
		console.warn("Passed - " + str + " is " + test.expected_res + " for timestamp regex " + taken + "ms");
	}
	else {
		console.warn("############################################");
		console.warn(str);
		console.warn("--------------------------------------------");
		console.warn('RESULT: ' + temp + ' vs '+ 'EXPECTED: ' + test.expected_res);
		//console.warn(`typeof temp: ${typeof temp}, temp: ${temp}`);
		//console.warn(`typeof test.expected_res: ${typeof test.expected_res}, test.expected_res: ${test.expected_res}`);
		console.warn("FAILED " + str + " for timestamp regex");
	}
});

(function () {

	/////////////////////////
	// Helpers and globals //
	/////////////////////////
	var expect = require('chai').expect
	////////////////
	// Test suite //
	////////////////


	// With mocha we want to describe the module/component/behavior we are testing
	// with a describe block - describe('Component', function() { })
	describe('Markdown Phone Number Detection', function () {
		before(function(done) {
			global.Client = { 
				get_controller: function(controller) {
					return {
						is_valid_pstn: function(match) {
							return true;
						}
					}
				}
			}
			done();
		});
		it("should parse a number", function () {
			var number = '3053181328';
			expect(Markdown(number)).to.equal('<a href=\'tel:3053181328\' class=\'markdown_phone_number\'>3053181328</a>');
		});
		it("should not parse a timestamp with valid area code", function () {
			var number = '2019-07-01 17:27:59';
			expect(Markdown(number)).to.equal('2019-07-01 17:27:59');
		});
		it("should not parse a timestamp without valid area code", function () {
			var number = '1991-11-13 12:00:00';
			expect(Markdown(number)).to.equal('1991-11-13 12:00:00');
		});
		it("should return a marked phone number", function () {
			var text = 'this is a phone number 1-800-333-3333';
			expect(Markdown(text)).to.equal('this is a phone number <a href=\'tel:1-800-333-3333\' class=\'markdown_phone_number\'>1-800-333-3333</a>');
		});
		it("Scores with valid country code are not marked as number", function(){
			var text = '5-11';
			expect(Markdown(text)).to.equal('5-11');
		});
		it("Timestamp and phone numbers should only mark phone number", function() {
			var text = '2019-12-05 17:13:56 2019-07-01 17:27:59 3054944424';
			expect(Markdown(text)).to.equal('2019-12-05 17:13:56 2019-07-01 17:27:59 <a href=\'tel:3054944424\' class=\'markdown_phone_number\'>3054944424</a>')
		});
		it("Timestamp, score, and phone numbers should only mark phone number", function() {
			var text = '2019-12-05 17:13:56 23-16 2019-07-01 17:27:59 3054944424';
			expect(Markdown(text)).to.equal('2019-12-05 17:13:56 23-16 2019-07-01 17:27:59 <a href=\'tel:3054944424\' class=\'markdown_phone_number\'>3054944424</a>')
		});
	});
}());

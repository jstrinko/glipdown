var _ = _ || null;
if ((typeof require != 'undefined') && !_) {
	var _ = require('underscore');
}

var Markdown = function(raw, options) {
	var options = options || {};
	if (!raw) {
		return '';
	}
	if (!options.dont_escape) {
		raw = _.escape(raw);
	}
	var code_blocks = {};
	var block_count = 0;
	var quote_tag = options.use_blockquote ? 'span class="blockquote"' : 'q';
	var end_quote_tag = options.use_blockquote ? '/span' : '/q';
	var bench = +new Date();
	var link_last_offset = bold_last_offset = italic_last_offset = strike_last_offset = underline_last_offset = 0;
	var test = 0;
	var total = 0;
	var link_was_inside_tag = bold_in_url = italic_in_url = strike_in_url = underline_in_url = false;
	var val = raw.replace(/\&\#x2F;/g, '/'). // not sure why underscore replaces these...docs don't even claim that it does 
		replace(/\[([^\]]*?)\]\(([\s\S]*?)\)/g, function(full_match, text, link) {
			if (text === 'code') {
				return full_match;
			}
			return "<a href='" + link + "' target='_blank' rel='noreferrer'>" + text + "</a>";
		}).
		replace(Markdown.global_url_regex, function(
			full_match, 
			maybe_email1,
			maybe_email2,
			link, 
			proto_and_slashes, 
			protocol,
			junk,
			junkpoint5,
			junk1,
			junk2,
			junk3,
			junk4,
			junk5,
			junk6,
			last_char,
			offset,
			full_str
	) {
			// junkpoint5 might be the extension

			// If junkpoint5 is something like "2.3.4", it means it was an IP address detected/
			// We should not check against the list in those cases
			if (!junkpoint5.match(/[0-9.]+/)) {
				// If we don't have it in the list of valid extensions, return
				if (typeof Markdown.extensions_object[junkpoint5] === 'undefined') {
					return full_match;
				}
			}

			var sub_bench = +new Date();
			var start = full_str.substr(link_last_offset, offset - link_last_offset);
			link_last_offset = offset;
			if (start.match(/.*\($/)) {
				return full_match;
			}
			var inside_tag = link_was_inside_tag ? (start.match(/.*>[^<]*$/) ? false : true) : start.match(/.*<[^>]*$/);
			if (inside_tag) {
				link_was_inside_tag = true;
				return full_match;
			}
			link_was_inside_tag = false;
			var inside_post_tag = start.match(/.*(\{\{-\{\{)(?![\s\S]*\}\}-\}\})[\s\S]*$/);
			if (inside_post_tag) {
				return full_match;
			}
			var lead_match = full_str.substring(0, offset);
			var lead_str = lead_match + full_match;
			var link_matches = lead_str.replace(/\{\{\-\{\{/g, '<').replace(/\}\}-\}\}/g, '>').match(/^[\s\S]*<a[\s\S]*?>([\s\S]*?)$/);
			if (link_matches) {
				var link_match = link_matches[1];
				if (!link_match.match(/<\/a>/) || link_match.match(/<\/a>$/)) {
					return full_match;
				}
			}
			//console.warn("nomatch:", +new Date() - sub_bench);
			return "<a href='" + 
				(
					maybe_email2 && !protocol ? 'mailto:' + maybe_email2 : 
						(protocol ? '' : 'http://') 
				) + link.replace('&amp;', '&') + "' target='_blank' rel='noreferrer'>" + 
					(maybe_email2 ? maybe_email2 : '') + 
					link + "</a>" + last_char;
		}).
		replace(/\[code\]([\s\S]*?)(\[\/code\]|$)/gi, function(full_match, text) {
			var code;
			try {
				code = unescape(text);
			}
			catch(error) {
				code = text.replace(/(\%\w\w)/g, function(fm, esc) {
					return unescape(esc);
				});
			}
			code_blocks['code_' + block_count] = code;
			var to_return = '[code_' + block_count + ']';
			block_count++;
			return to_return;
		}).
		replace(/\|([^\n]*)\|(\s|\n|$)/g, function(full_match, text) {
			var cols = text.split(/\|/);
			if (!cols.length) {
				return text;
			}
			var percent = (100 / cols.length).toFixed(0);
			return "<table><tr valign='top'><td width='" + percent + "%'>" +
					cols.join("</td><td width='" + percent + "%'>") +
				"</tr></table>";
		}).
		replace(/<\/table><table>/, '').
		replace(/((^|\n)\* [^\*\n]*)+/g, function(full_match, junk, start) {
			var parts = full_match.split(/\n/);
			if (parts[0].length === 0) {
				parts.shift();
			}
			return start + "<ul><li>" + 
				parts.map(function(part) { return part.replace(/^\* /, ''); }).
					join("</li><li>") + 
				"</li></ul>";
		}).
		replace(/\*\*(\S[^\*\*]*?\S)\*\*/g, function(full_match, text, offset, full_str) {
			total++;
			if (Markdown.is_in_url(full_match, text, offset, full_str, bold_in_url, bold_last_offset)) {
				bold_last_offset = offset;
				bold_in_url = true;
				return full_match;
			}
			bold_last_offset = offset;
			bold_in_url = false;
			return "<b>" + text + "</b>";
		}).
		replace(/\*(\S[^\*]*?\S)\*/g, function(full_match, text, offset, full_str) {
			if (Markdown.is_in_url(full_match, text, offset, full_str, italic_in_url, italic_last_offset)) {
				italic_last_offset = offset;
				italic_in_url = true;
				return full_match;
			}
			italic_last_offset = offset;
			italic_in_url = false;
			return "<i>" + text + "</i>";
		}).
		replace(/__(\S[^__]*?\S)__/g, function(full_match, text, offset, full_str) {
			if (Markdown.is_in_url(full_match, text, offset, full_str, underline_in_url, underline_last_offset)) {
				underline_last_offset = offset;
				underline_in_url = true;
				return full_match;
			}
			underline_last_offset = offset;
			underline_in_url = false;
			return "<u>" + text + "</u>";
		}).
		replace(/~~(\S[^~~]*?\S)~~/g, function(full_match, text, offset, full_str) {
			if (Markdown.is_in_url(full_match, text, offset, full_str, strike_in_url, strike_last_offset)) {
				strike_last_offset = offset;
				strike_in_url = true;
				return full_match;
			}
			strike_last_offset = offset;
			strike_in_url = false;
			return "<strike>" + text + "</strike>";
		}).
		replace(/\{\{\[\[-([^\{\{\[\[]*?)-\]\]\}\}/g, function(full_match, text, offset, full_str) {
			return "<span class='search_match_stream'>" + text + "</span>";
		}).
		replace(/(^|\n)&gt; ([^\n]*)/g, function(full_match, start, text) {
			return start + "<" + quote_tag + ">" + text + "<" + end_quote_tag + ">";
		}).
		replace(/\[code_(\w+)\]/g, function(full_match, which) {
			return "<pre class=codesnippet>" + code_blocks['code_' + which] + "</pre>";
		});
	return val;
};

Markdown.is_in_url = function(full_match, text, offset, full_str, already_in_url, last_offset) {
	var start = full_str.substr(last_offset, offset - last_offset);
	var inside_tag = already_in_url ? !start.match(/.*>[^<]*$/) : start.match(/.*<[^>]*$/);
	if (inside_tag) { return true; }
	var last_str = /([A-Za-z0-9\!\#\$\%\&\'\*\+\-\/\=\?\%\_\`\{\|\}\~\.\:]+)$/g.exec(start);
	if (last_str) {
		var potential_url = last_str[0] + text;
		if (potential_url.match(Markdown.url_regex)) {
			return true;
		}
	}
	return false;
};

Markdown.url_regex = /^((ftp|https?):\/\/)?[-\w]+\.([-\w]+\.)*(\d+\.\d+\.\d+|[-A-Za-z]+)(:\d+)?($|(\/\S?(\/\S)*\/?)|(\#\S?)|(\?\S?))/i;
Markdown.global_url_regex = /(([a-zA-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\%\_\`\{\|\}\~\.]+@)?)(((ftp|https?):\/\/)?[-\w]+\.([-\w]+\.)*(\d+\.\d+\.\d+|[-A-Za-z]+)(:\d+)?(((\/([A-Za-z0-9-\._~:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=])*)+)\??([A-Za-z0-9-\._~:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\%])*)?)([^A-Za-z]|$)/gi;
Markdown.extensions_object = {"abb":true,"abbott":true,"abogado":true,"ac":true,"academy":true,"accenture":true,"accountant":true,"accountants":true,"active":true,"actor":true,"ad":true,"ads":true,"adult":true,"ae":true,"aeg":true,"aero":true,"af":true,"afl":true,"ag":true,"agency":true,"ai":true,"aig":true,"airforce":true,"al":true,"allfinanz":true,"alsace":true,"am":true,"amsterdam":true,"an":true,"android":true,"ao":true,"apartments":true,"aq":true,"aquarelle":true,"ar":true,"archi":true,"army":true,"arpa":true,"as":true,"asia":true,"associates":true,"at":true,"attorney":true,"au":true,"auction":true,"audio":true,"auto":true,"autos":true,"aw":true,"ax":true,"axa":true,"az":true,"azure":true,"ba":true,"band":true,"bank":true,"bar":true,"barclaycard":true,"barclays":true,"bargains":true,"bauhaus":true,"bayern":true,"bb":true,"bbc":true,"bbva":true,"bd":true,"be":true,"beer":true,"berlin":true,"best":true,"bf":true,"bg":true,"bh":true,"bharti":true,"bi":true,"bible":true,"bid":true,"bike":true,"bing":true,"bingo":true,"bio":true,"biz":true,"bj":true,"black":true,"blackfriday":true,"bloomberg":true,"blue":true,"bm":true,"bmw":true,"bn":true,"bnpparibas":true,"bo":true,"boats":true,"bond":true,"boo":true,"boutique":true,"br":true,"bridgestone":true,"broker":true,"brother":true,"brussels":true,"bs":true,"bt":true,"budapest":true,"build":true,"builders":true,"business":true,"buzz":true,"bv":true,"bw":true,"by":true,"bz":true,"bzh":true,"ca":true,"cab":true,"cafe":true,"cal":true,"camera":true,"camp":true,"cancerresearch":true,"canon":true,"capetown":true,"capital":true,"caravan":true,"cards":true,"care":true,"career":true,"careers":true,"cars":true,"cartier":true,"casa":true,"cash":true,"casino":true,"cat":true,"catering":true,"cba":true,"cbn":true,"cc":true,"cd":true,"center":true,"ceo":true,"cern":true,"cf":true,"cfa":true,"cfd":true,"cg":true,"ch":true,"channel":true,"chat":true,"cheap":true,"chloe":true,"christmas":true,"chrome":true,"church":true,"ci":true,"cisco":true,"citic":true,"city":true,"ck":true,"cl":true,"claims":true,"cleaning":true,"click":true,"clinic":true,"clothing":true,"club":true,"cm":true,"cn":true,"co":true,"coach":true,"codes":true,"coffee":true,"college":true,"cologne":true,"com":true,"commbank":true,"community":true,"company":true,"computer":true,"condos":true,"construction":true,"consulting":true,"contractors":true,"cooking":true,"cool":true,"coop":true,"corsica":true,"country":true,"coupons":true,"courses":true,"cr":true,"credit":true,"creditcard":true,"cricket":true,"crown":true,"crs":true,"cruises":true,"cu":true,"cuisinella":true,"cv":true,"cw":true,"cx":true,"cy":true,"cymru":true,"cyou":true,"cz":true,"dabur":true,"dad":true,"dance":true,"date":true,"dating":true,"datsun":true,"day":true,"dclk":true,"de":true,"deals":true,"degree":true,"delivery":true,"democrat":true,"dental":true,"dentist":true,"desi":true,"design":true,"dev":true,"diamonds":true,"diet":true,"digital":true,"direct":true,"directory":true,"discount":true,"dj":true,"dk":true,"dm":true,"dnp":true,"do":true,"docs":true,"dog":true,"doha":true,"domains":true,"doosan":true,"download":true,"drive":true,"durban":true,"dvag":true,"dz":true,"earth":true,"eat":true,"ec":true,"edu":true,"education":true,"ee":true,"eg":true,"email":true,"emerck":true,"energy":true,"engineer":true,"engineering":true,"enterprises":true,"epson":true,"equipment":true,"er":true,"erni":true,"es":true,"esq":true,"estate":true,"et":true,"eu":true,"eurovision":true,"eus":true,"events":true,"everbank":true,"exchange":true,"expert":true,"exposed":true,"express":true,"fail":true,"faith":true,"fan":true,"fans":true,"farm":true,"fashion":true,"feedback":true,"fi":true,"film":true,"finance":true,"financial":true,"firmdale":true,"fish":true,"fishing":true,"fit":true,"fitness":true,"fj":true,"fk":true,"flights":true,"florist":true,"flowers":true,"flsmidth":true,"fly":true,"fm":true,"fo":true,"foo":true,"football":true,"forex":true,"forsale":true,"foundation":true,"fr":true,"frl":true,"frogans":true,"fund":true,"furniture":true,"futbol":true,"fyi":true,"ga":true,"gal":true,"gallery":true,"garden":true,"gb":true,"gbiz":true,"gd":true,"gdn":true,"ge":true,"gent":true,"genting":true,"gf":true,"gg":true,"ggee":true,"gh":true,"gi":true,"gift":true,"gifts":true,"gives":true,"gl":true,"glass":true,"gle":true,"global":true,"globo":true,"gm":true,"gmail":true,"gmo":true,"gmx":true,"gn":true,"gold":true,"goldpoint":true,"golf":true,"goo":true,"goog":true,"google":true,"gop":true,"gov":true,"gp":true,"gq":true,"gr":true,"graphics":true,"gratis":true,"green":true,"gripe":true,"gs":true,"gt":true,"gu":true,"guge":true,"guide":true,"guitars":true,"guru":true,"gw":true,"gy":true,"hamburg":true,"hangout":true,"haus":true,"healthcare":true,"help":true,"here":true,"hermes":true,"hiphop":true,"hitachi":true,"hiv":true,"hk":true,"hm":true,"hn":true,"hockey":true,"holdings":true,"holiday":true,"homedepot":true,"homes":true,"honda":true,"horse":true,"host":true,"hosting":true,"hotmail":true,"house":true,"how":true,"hr":true,"ht":true,"hu":true,"ibm":true,"icbc":true,"icu":true,"id":true,"ie":true,"ifm":true,"il":true,"im":true,"immo":true,"immobilien":true,"in":true,"industries":true,"infiniti":true,"info":true,"ing":true,"ink":true,"institute":true,"insure":true,"int":true,"international":true,"investments":true,"io":true,"iq":true,"ir":true,"irish":true,"is":true,"it":true,"iwc":true,"java":true,"jcb":true,"je":true,"jetzt":true,"jewelry":true,"jlc":true,"jll":true,"jm":true,"jo":true,"jobs":true,"joburg":true,"jp":true,"juegos":true,"kaufen":true,"kddi":true,"ke":true,"kg":true,"kh":true,"ki":true,"kim":true,"kitchen":true,"kiwi":true,"km":true,"kn":true,"koeln":true,"komatsu":true,"kp":true,"kr":true,"krd":true,"kred":true,"kw":true,"ky":true,"kyoto":true,"kz":true,"la":true,"lacaixa":true,"land":true,"lasalle":true,"lat":true,"latrobe":true,"lawyer":true,"lb":true,"lc":true,"lds":true,"lease":true,"leclerc":true,"legal":true,"lgbt":true,"li":true,"liaison":true,"lidl":true,"life":true,"lighting":true,"limited":true,"limo":true,"link":true,"lk":true,"loan":true,"loans":true,"lol":true,"london":true,"lotte":true,"lotto":true,"love":true,"lr":true,"ls":true,"lt":true,"ltda":true,"lu":true,"lupin":true,"luxe":true,"luxury":true,"lv":true,"ly":true,"ma":true,"madrid":true,"maif":true,"maison":true,"management":true,"mango":true,"market":true,"marketing":true,"markets":true,"marriott":true,"mba":true,"mc":true,"md":true,"me":true,"media":true,"meet":true,"melbourne":true,"meme":true,"memorial":true,"men":true,"menu":true,"mg":true,"mh":true,"miami":true,"microsoft":true,"mil":true,"mini":true,"mk":true,"ml":true,"mm":true,"mma":true,"mn":true,"mo":true,"mobi":true,"moda":true,"moe":true,"monash":true,"money":true,"montblanc":true,"mormon":true,"mortgage":true,"moscow":true,"motorcycles":true,"mov":true,"movie":true,"mp":true,"mq":true,"mr":true,"ms":true,"mt":true,"mtn":true,"mtpc":true,"mu":true,"museum":true,"mv":true,"mw":true,"mx":true,"my":true,"mz":true,"na":true,"nadex":true,"nagoya":true,"name":true,"navy":true,"nc":true,"ne":true,"nec":true,"net":true,"netbank":true,"network":true,"neustar":true,"new":true,"news":true,"nexus":true,"nf":true,"ng":true,"ngo":true,"nhk":true,"ni":true,"nico":true,"ninja":true,"nissan":true,"nl":true,"no":true,"np":true,"nr":true,"nra":true,"nrw":true,"ntt":true,"nu":true,"nyc":true,"nz":true,"office":true,"okinawa":true,"om":true,"one":true,"ong":true,"onl":true,"online":true,"ooo":true,"oracle":true,"org":true,"organic":true,"osaka":true,"otsuka":true,"ovh":true,"pa":true,"page":true,"panerai":true,"paris":true,"partners":true,"parts":true,"party":true,"pe":true,"pf":true,"pg":true,"ph":true,"pharmacy":true,"philips":true,"photo":true,"photography":true,"photos":true,"physio":true,"piaget":true,"pics":true,"pictet":true,"pictures":true,"pink":true,"pizza":true,"pk":true,"pl":true,"place":true,"play":true,"plumbing":true,"plus":true,"pm":true,"pn":true,"pohl":true,"poker":true,"porn":true,"post":true,"pr":true,"praxi":true,"press":true,"pro":true,"prod":true,"productions":true,"prof":true,"properties":true,"property":true,"ps":true,"pt":true,"pub":true,"pw":true,"py":true,"qa":true,"qpon":true,"quebec":true,"racing":true,"re":true,"realtor":true,"recipes":true,"red":true,"redstone":true,"rehab":true,"reise":true,"reisen":true,"reit":true,"ren":true,"rent":true,"rentals":true,"repair":true,"report":true,"republican":true,"rest":true,"restaurant":true,"review":true,"reviews":true,"rich":true,"ricoh":true,"rio":true,"rip":true,"ro":true,"rocks":true,"rodeo":true,"rs":true,"rsvp":true,"ru":true,"ruhr":true,"run":true,"rw":true,"ryukyu":true,"sa":true,"saarland":true,"sale":true,"samsung":true,"sandvik":true,"sandvikcoromant":true,"sap":true,"sarl":true,"saxo":true,"sb":true,"sc":true,"sca":true,"scb":true,"schmidt":true,"scholarships":true,"school":true,"schule":true,"schwarz":true,"science":true,"scor":true,"scot":true,"sd":true,"se":true,"seat":true,"sener":true,"services":true,"sew":true,"sex":true,"sexy":true,"sg":true,"sh":true,"shiksha":true,"shoes":true,"show":true,"shriram":true,"si":true,"singles":true,"site":true,"sj":true,"sk":true,"ski":true,"sky":true,"skype":true,"sl":true,"sm":true,"sn":true,"sncf":true,"so":true,"soccer":true,"social":true,"software":true,"sohu":true,"solar":true,"solutions":true,"sony":true,"soy":true,"space":true,"spiegel":true,"spreadbetting":true,"sr":true,"st":true,"starhub":true,"statoil":true,"study":true,"style":true,"su":true,"sucks":true,"supplies":true,"supply":true,"support":true,"surf":true,"surgery":true,"suzuki":true,"sv":true,"swiss":true,"sx":true,"sy":true,"sydney":true,"systems":true,"sz":true,"taipei":true,"tatar":true,"tattoo":true,"tax":true,"taxi":true,"tc":true,"td":true,"team":true,"tech":true,"technology":true,"tel":true,"temasek":true,"tennis":true,"tf":true,"tg":true,"th":true,"thd":true,"theater":true,"tickets":true,"tienda":true,"tips":true,"tires":true,"tirol":true,"tj":true,"tk":true,"tl":true,"tm":true,"tn":true,"to":true,"today":true,"tokyo":true,"tools":true,"top":true,"toray":true,"toshiba":true,"tours":true,"town":true,"toys":true,"tr":true,"trade":true,"trading":true,"training":true,"travel":true,"trust":true,"tt":true,"tui":true,"tv":true,"tw":true,"tz":true,"ua":true,"ug":true,"uk":true,"university":true,"uno":true,"uol":true,"us":true,"uy":true,"uz":true,"va":true,"vacations":true,"vc":true,"ve":true,"vegas":true,"ventures":true,"versicherung":true,"vet":true,"vg":true,"vi":true,"viajes":true,"video":true,"villas":true,"vision":true,"vista":true,"vistaprint":true,"vlaanderen":true,"vn":true,"vodka":true,"vote":true,"voting":true,"voto":true,"voyage":true,"vu":true,"wales":true,"walter":true,"wang":true,"watch":true,"webcam":true,"website":true,"wed":true,"wedding":true,"weir":true,"wf":true,"whoswho":true,"wien":true,"wiki":true,"williamhill":true,"win":true,"windows":true,"wme":true,"work":true,"works":true,"world":true,"ws":true,"wtc":true,"wtf":true,"xbox":true,"xerox":true,"xin":true,"xxx":true,"xyz":true,"yachts":true,"yandex":true,"ye":true,"yodobashi":true,"yoga":true,"yokohama":true,"youtube":true,"yt":true,"za":true,"zip":true,"zm":true,"zone":true,"zuerich":true,"zw":true};

var Markdown_For_Search = function(raw, options) {
	options = options || {};
	if (!raw) { return ''; }
	if (!options.dont_escape) {
		raw = _.escape(raw);
	}
	return raw.replace(/\{\{\[\[-([^\{\{\[\[]*?)-\]\]\}\}/g, function(full_match, text) {
		return "<span class='search_match_stream'>" + text + "</span>";
	});
};

var Remove_Markdown = function(raw, options) {
	options = options || {};
	return (options.dont_escape ? raw : _.escape(raw)).
		replace(/\&\#x2F;/g, '/'). // not sure why underscore replaces these...docs don't even claim that it does 
		replace(/\[code\]/g, '').
		replace(/\[\/code\]/g,'').
		replace(/\|([^\n]*)\|/g, function(full_match, text) {
			var cols = text.split(/\|/);
			if (!cols.length) {
				return text;
			}
			return cols.join('\t');
		}).
		replace(/\*\*(\S[^\*\*]*?\S)\*\*/g, function(full_match, text) {
			return text;
		}).
		// replace(/\`(.*?)\`/g, function(full_match, text) {
		// 	return text;
		// }).
		replace(/\*(\S[^\*]*?\S)\*/g, function(full_match, text) {
			return text;
		}).
		replace(/__(\S[^__]*?\S)__/g, function(full_match, text) {
			return text;
		}).
		replace(/~~(\S[^~~]*?\S)~~/g, function(full_match, text) {
			return text;
		}).
		replace(/(^|\n)&gt; ([^\n]*)/g, function(full_match, start, text) {
			return start + " " + text + " ";
		}).
		replace(/\[([^\]]*?)\]\(([\s\S]*?)\)/g, function(full_match, text, link) {
			return text;
		});
};

if (typeof exports == 'object') {
	exports.Markdown = Markdown;
	exports.Remove_Markdown = Remove_Markdown;
	exports.Markdown_For_Search = Markdown_For_Search;
}

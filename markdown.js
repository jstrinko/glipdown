var TLDS = require('./tlds.js');

function loadValidTLDS() {
	var tldsArray = [];

	TLDS.forEach(function(tld){
		tldsArray.push('\\.' + tld + '(?!\\w)');
	});

	return tldsArray.join('|');
}

var validLinkMarkDownRegEx = new RegExp(loadValidTLDS() + '|^https?:\\/\\/', "i");

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

			if(!validLinkMarkDownRegEx.test(link)) {
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
			if(!validLinkMarkDownRegEx.test(link)) {
				return full_match;
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

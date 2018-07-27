/*globals window, Client */

var TLDS = TLDS || [];
if (typeof require != 'undefined') {
	TLDS = require('./tlds').TLDS;
}

function loadValidTLDS() {
	var tldsArray = [];

	TLDS.forEach(function(tld){
		tldsArray.push('\\.' + tld + '(?!\\.|\\w)');
	});

	return tldsArray.join('|');
}

var validLinkMarkDownRegEx = new RegExp('[a-zA-Z0-9](' + loadValidTLDS() + ')|^https?:\\/\\/[a-zA-Z0-9]', "i");

var _ = _ || null;
if ((typeof require != 'undefined') && !_) {
	var _ = require('underscore');
}

var Markdown = function(raw, options) {
	var options = options || {};
	// var phone_util;

	if (!raw) {
		return '';
	}
	if (!options.dont_escape) {
		raw = _.escape(raw);
	}
	/*
	if (typeof Client !== 'undefined') {
		phone_util = Client.get_controller('Phone_Number');
	}
	*/

	var code_blocks = {};
	var block_count = 0;
	var quote_tag = options.use_blockquote ? 'span class="blockquote"' : 'q';
	var end_quote_tag = options.use_blockquote ? '/span' : '/q';
	var bench = +new Date();
	var link_last_offset = 0;
	var bold_last_offset = 0;
	var italic_last_offset = 0;
	var strike_last_offset = 0;
	var underline_last_offset = 0;
	var test = 0;
	var total = 0;
	var link_was_inside_tag = 0;
	var bold_in_url = false;
	var italic_in_url = false;
	var strike_in_url = false;
	var underline_in_url = false;
	var val = raw.replace(/\&\#x2F;/g, '/') // not sure why underscore replaces these...docs don't even claim that it does
		.replace(/\[(.*?[^\\])\]\((.*?[^\\])\)/g, function(full_match, text, link) {
			if (text === 'code') {
				return full_match;
			}

			if(!validLinkMarkDownRegEx.test(link)) {
				return full_match;
			}

			text = text.replace(/\\([\[\]()])/g, '$1');

			if (typeof window !== 'undefined') {
				if (window.location && window.location.origin) {
					if (link.indexOf(window.location.origin) === 0) {
						if (link.indexOf('join') !== 0) {
							var link_pieces = link.split('/');
							var group_id = link_pieces[link_pieces.length - 1];
							return "<div onclick='Router.join_from_url(" + group_id + ", true)' class='team_join_link'>" + link + "</div>";
						}
						return "<a href='" + link + "'>" + text + "</a>";
					}
				}
			}

			return "<a href='" + link + "' target='_blank' rel='noreferrer'>" + text + "</a>";

		})
		.replace(/((^|\n)&gt; ([^\n]*))+/g, function(full_match) {
			return "<" + quote_tag + ">\n" + full_match.trim().replace(/^&gt; /gm, '') + "\n<" + end_quote_tag + ">";
		})
		.replace(/\[code\]([\s\S]*?)(\[\/code\]|$)/gi, function(full_match, text) {
			var code;
			try {
				code = unescape(text);
				code = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
		})
		.replace(Markdown.global_url_regex, function(
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
			var no_blank = false;
			if (typeof window !== 'undefined') {
				if (window.location && window.location.origin) {
					if (link.indexOf(window.location.origin) === 0) {
						if (link.indexOf('join') !== 0) {
							var link_pieces = link.split('/');
							var group_id = link_pieces[link_pieces.length - 1];
							return "<div onclick='Router.join_from_url(" + group_id + ", true)' class='team_join_link'>" + link + "</div>";
						}
						no_blank = true;
					}
				}
			}
			// ensures that the characters ".,?:;()*&!" will not become
			// apart of a link if they are placed at the end of one
			link = link.replace('&amp;', '&');
			link = link.replace(/[.,?:;()*&!]$/, function(m) { last_char = m + ' '; return ''; });
			return "<a href='" +
				(
					maybe_email2 && !protocol ? 'mailto:' + maybe_email2 :
						(protocol ? '' : 'http://')
				) + link + (no_blank ? "" : "' target='_blank'") + " rel='noreferrer'>" +
					(maybe_email2 ? maybe_email2 : '') +
					link + "</a>" + last_char;
		})
		.replace(/\|([^\n]*)\|(\s|\n|$)/g, function(full_match, text) {
			var cols = text.split(/\|/);
			if (!cols.length) {
				return text;
			}
			var percent = (100 / cols.length).toFixed(0);
			return "<table><tr valign='top'><td width='" + percent + "%'>" +
					cols.join("</td><td width='" + percent + "%'>") +
				"</tr></table>";
		})
		.replace(/<\/table><table>/g, '')
		.replace(/((^|\n)\* [^\n]*)+/g, function(full_match) {
			var parts = full_match.split(/\n/);
			if (parts[0].length === 0) {
				parts.shift();
			}
			return "<ul><li>" +
				parts.map(function(part) { return part.replace(/^\* /, ''); }).
					join("</li><li>") +
				"</li></ul>";
		})
		.replace(/((^|\n)\d+\. [^\n]*)+/g, function (full_match) {
			var parts = full_match.split(/\n/);
			var start = parseInt(full_match, 10);
			var start_text = "";
			if (parts[0].length === 0) {
				parts.shift();
			}
			if (!isNaN(start) && start > 1) {
				start_text = " start=" + start + " style='counter-reset: li " + (start - 1) + "'";
			}
			return "<ol" + start_text +"><li>" +
				parts.map(function (part) {
					return part.replace(/^\d+. /, '');
				}).join("</li><li>") +
				"</li></ol>";
		})
		.replace(/<\/([ou])l>\n/g, '</$1l>')
		.replace(/\*\*([^\*\*]+)\*\*/g, function(full_match, text, offset, full_str) {
			total++;
			if (Markdown.is_in_url(full_match, text, offset, full_str, bold_in_url, bold_last_offset)) {
				bold_last_offset = offset;
				bold_in_url = true;
				return full_match;
			}
			bold_last_offset = offset;
			bold_in_url = false;
			return "<b>" + text + "</b>";
		})
		.replace(/\*([^\*]+)\*/g, function(full_match, text, offset, full_str) {
			if (Markdown.is_in_url(full_match, text, offset, full_str, italic_in_url, italic_last_offset)) {
				italic_last_offset = offset;
				italic_in_url = true;
				return full_match;
			}
			italic_last_offset = offset;
			italic_in_url = false;
			return "<i>" + text + "</i>";
		})
		.replace(/__([^__]+)__/g, function(full_match, text, offset, full_str) {
			if (Markdown.is_in_url(full_match, text, offset, full_str, underline_in_url, underline_last_offset)) {
				underline_last_offset = offset;
				underline_in_url = true;
				return full_match;
			}
			underline_last_offset = offset;
			underline_in_url = false;
			return "<u>" + text + "</u>";
		})
		.replace(/~~([^~~]+)~~/g, function(full_match, text, offset, full_str) {
			if (Markdown.is_in_url(full_match, text, offset, full_str, strike_in_url, strike_last_offset)) {
				strike_last_offset = offset;
				strike_in_url = true;
				return full_match;
			}
			strike_last_offset = offset;
			strike_in_url = false;
			return "<strike>" + text + "</strike>";
		})
		.replace(/\{\{\[\[-([^\{\{\[\[]*?)-\]\]\}\}/g, function(full_match, text, offset, full_str) {
			return "<span class='search_match_stream'>" + text + "</span>";
		})
		.replace(/\[code_(\w+)\]/g, function(full_match, which) {
			return "<pre class=codesnippet>" + code_blocks['code_' + which] + "</pre>";
		})
		.replace(/mailto:<a href=/g, function(full_match, which) {
			return "<a href=";
		});
		/*
		.replace(/(?:\+)?(?:\d)?(?:\s|\.|-)?(?:\()?\d{3}(?:\))?(?:-|\s|.)?\d{3}(?:-|\s|\.)?\d{2}(?:\s|\.|-)?\d{2}/g, function mark_phone_numbers(match) {
			if (!phone_util || !phone_util.is_valid_pstn(match)) {
				return match;
			}

			return "<a href='tel:" + match + "' class='markdown_phone_number'>" + match + '</a>';
		});
		*/
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

var Markdown_Is_Valid_Link = function(link) {
	return validLinkMarkDownRegEx.test(link);
};

Markdown.tld_url_regex = validLinkMarkDownRegEx;
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
	exports.Markdown_Is_Valid_Link = Markdown_Is_Valid_Link;
}

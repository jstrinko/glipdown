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

var anchor_tag_regexp = new RegExp('<a.*?>.*?<\/a>', 'g');
var tokenized_anchor_tag_regexp = new RegExp('{{-{{a.*?}}-}}.*?{{-{{\/a}}-}}', 'g');
var escaped_anchor_tag_regexp = new RegExp('&(?:amp;){0,2}lt;a.*?&(?:amp;){0,2}gt;.*?&(?:amp;){0,2}lt;(?:\/|&(?:amp;){0,2}#x2F;)a&(?:amp;){0,2}gt;', 'g');
var any_tag_regexp = new RegExp('<[a-z].*?>', 'g');
var tokenized_any_tag_regexp = new RegExp('{{-{{[a-z].*?}}-}}', 'g');
var escaped_any_tag_regexp = new RegExp('&(?:amp;){0,2}lt;[a-z].*?&(?:amp;){0,2}?gt;', 'g');


function build_location_cache(cache, raw_string, match_pattern_array) {
	var location_cache;
	var string_to_match = typeof raw_string === 'string' ? raw_string : '';
	var regexp_array = Array.isArray(match_pattern_array) ? match_pattern_array : [];

	if (cache && cache.built) {
		return cache;
	};

	location_cache = {
		built: true,
		locations: []
	};

	regexp_array.forEach(function(match_pattern) {
		var index = 0;
		var position;
		var match_regexp = match_pattern instanceof RegExp ? match_pattern : new RegExp();
		var matches = string_to_match.match(match_regexp) || [];
		var matched_tag_locations = {};

		for (index = 0; index < matches.length; index++) {
			current_match = matches[index];
			position = string_to_match.indexOf(
				current_match,
				matched_tag_locations[current_match] || 0
			);
			matched_tag_locations[current_match] = position + 1;

			location_cache.locations.push({
				start: position,
				end: position + current_match.length
			});
		}
	});

	return location_cache;
}

function is_in_location_cache(cache, location_to_check) {
	var found_in_cache;
	var location_object_array;
	var array_length;
	var location_object;

	if (!cache ||
		!cache.locations ||
		!Array.isArray(cache.locations) ||
		typeof location_to_check !== 'number'
	) {
		return false;
	}

	location_object_array = cache.locations.slice().reverse();
	array_length = location_object_array.length;

	while(array_length && !found_in_cache) {
		location_object = location_object_array[array_length -1];
		found_in_cache = location_to_check > location_object.start &&
			location_to_check < location_object.end;
		array_length -= 1;
	}

	return found_in_cache;
}

var Markdown = function(raw, options) {
	var options = options || {};
	var phone_util;
	var is_valid_pstn = function () {
		return false;
	};
	var team_join_link_regexp;

	if (!raw) {
		return '';
	}
	if (!options.dont_escape) {
		raw = _.escape(raw);
	}
	if (typeof Client !== 'undefined') {
		phone_util = Client.get_controller('Phone_Number');
		is_valid_pstn = phone_util && typeof phone_util.is_valid_pstn === 'function' ?
			phone_util.is_valid_pstn :
			is_valid_pstn;
	}

	var code_blocks = {};
	var block_count = 0;
	var quote_tag = options.use_blockquote ? 'span class="blockquote"' : 'q';
	var end_quote_tag = options.use_blockquote ? '/span' : '/q';
	var link_last_offset = 0;
	var link_was_inside_tag = 0;
	var link_array = [];
	var score_array= [];
	var timestamp_array = [];
	var anchor_tag_location_cache;

	if (typeof window !== 'undefined' && window.location && window.location.origin) {
		team_join_link_regexp = new RegExp('^' + window.location.origin + '/r/join/');
	}

	var val = raw.replace(/\&\#x2F;/g, '/') // not sure why underscore replaces these...docs don't even claim that it does
		.replace(/\\]|\\\)/g, function (match) {
			return {
				'\\]': '%5D',
				'\\\)': '%29'
			}[match]
		})
		.replace(/\[([^\]]*?)]\(([^)]*?)\)/g, function(full_match, text, link) {
			var link_pieces;
			var group_id;

			text = String(text).replace(/%5D/g, ']');
			link = String(link).replace(/'%29/g, ')');

			if (text === 'code' || !validLinkMarkDownRegEx.test(link)) {
				return full_match;
			}

			text = text.replace(/\\([\[\]()])/g, '$1');
			link_pieces = link.split('/');
			group_id = link_pieces[link_pieces.length - 1];

			return team_join_link_regexp && link.match(team_join_link_regexp) && link.indexOf('join') !== 0 ?
				"<div onclick='Router.join_from_url(" + group_id + ", true)' class='team_join_link'>" + link + "</div>" :
				"<a href='" + link + "' target='_blank' rel='noreferrer'>" + text + "</a>";
		})
		.replace(/%5D|%29/g, function (match) { //for the rare cases of escaped brackets happening outside of links
			return {
				'%5D': '\\]',
				'%29': '\\\)'
			}[match]
		})
		.replace(/((^|\n)&gt; ([^\n]*))+\n?/g, function(full_match) {
			return "<" + quote_tag + ">\n" + full_match.trim().replace(/^&gt; /gm, '') + "\n<" + end_quote_tag + ">";
		})
		.replace(/\[code\]([\s\S]*?)(\[\/code\]|$)/gi, function(full_match, text) {
			var code;
			try {
				code = unescape(text);
				code = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			}
			catch (error) {
				code = text.replace(/(\%\w\w)/g, function (fm, esc) {
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
			var link_pieces;
			var group_id;
			var link_token = '{{--LINK-' + link_array.length + '--}}';
			var include_space = full_match.match(/ $/);

			if (!validLinkMarkDownRegEx.test(link)) {
				return full_match;
			}

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

			if (team_join_link_regexp && link.match(team_join_link_regexp) && link.indexOf('join') !== 0) {
				link_pieces = link.split('/');
				group_id = link_pieces[link_pieces.length - 1];

				link_array.push("<div onclick='Router.join_from_url(" + group_id + ", true)' class='team_join_link'>" + link + "</div>");

				return link_token;
			}

			// ensures that the characters ".,?:;()*&!" will not become
			// apart of a link if they are placed at the end of one
			link = link.replace('&amp;', '&');
			link = link.replace(/[.,?:;()*&!~]$/, function (m) {
				last_char = m + (include_space ? ' ' : '');
				return '';
			});

			link_array.push("<a href='" +
				(
					maybe_email2 && !protocol ? 'mailto:' + maybe_email2 :
					(protocol ? '' : 'http://')
				) + link + "' target='_blank' rel='noreferrer'>" +
				(maybe_email2 ? maybe_email2 : '') +
				link + "</a>");

			return link_token + last_char;
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
				parts.map(function (part) { return part.replace(/^\* /, ''); }).
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
		}).replace(new RegExp("<" + quote_tag + ">((?:.|\\n)+)<" + end_quote_tag + ">", 'gm'), function(full_match, p1) {
			return "<" + quote_tag + ">" + p1.trim() + "<" + end_quote_tag + ">";
		})
		.replace(/<\/([ou])l>\n/g, '</$1l>')
		.replace(/\*\*([^\*\*]+)\*\*/g, function (full_match, text) {
			return "<b>" + text + "</b>";
		})
		.replace(/\*([^\*]+)\*/g, function (full_match, text) {
			return "<i>" + text + "</i>";
		})
		.replace(/__([^__]+)__/g, function (full_match, text) {
			return "<u>" + text + "</u>";
		})
		.replace(/~~([^~~]+)~~/g, function (full_match, text) {
			return "<strike>" + text + "</strike>";
		})
		.replace(/\{\{\[\[-([^\{\{\[\[]*?)-\]\]\}\}/g, function(full_match, text) {
			return "<span class='search_match_stream'>" + text + "</span>";
		})
		.replace(/\[code_(\w+)\]/g, function(full_match, which) {
			return "<pre class=codesnippet>" + code_blocks['code_' + which] + "</pre>";
		})
		.replace(Markdown.timestamp_regex, function skip_timestamps(
			match,
			offset,
			full_str) {
			var time_token = '{{--TIME-' + timestamp_array.length + '--}}';
			timestamp_array.push(match);
			return time_token;
		})
		.replace(Markdown.score_regex, function skip_score(
				match, 
				offset,
				full_str) {
			var score_token = '{{--SCORE-' + score_array.length + '--}}';
			score_array.push(match);
			return score_token;
		})
		.replace(Markdown.potential_phone_regex, function mark_phone_numbers(
			match,
			offset,
			full_str
		) {
			var in_anchor_tag;
			var is_valid_number = match !== '911' && match !== '999' && is_valid_pstn(match);
			var regexp_to_check;

			if (!is_valid_number) {
				return match;
			}

			regexp_to_check = [
				anchor_tag_regexp,
				tokenized_anchor_tag_regexp,
				escaped_anchor_tag_regexp,
				any_tag_regexp,
				tokenized_any_tag_regexp,
				escaped_any_tag_regexp
			];
			anchor_tag_location_cache = build_location_cache(
				anchor_tag_location_cache,
				full_str,
				regexp_to_check
			);
			in_anchor_tag = is_in_location_cache(anchor_tag_location_cache, offset);

			return !in_anchor_tag ?
				"<a href='tel:" + match + "' class='markdown_phone_number'>" + match + '</a>' :
				match;
		})
		.replace(/{{--LINK-(\d*)--}}/g, function (link_token, link_index) {
			return link_array[link_index] || link_token;
		})
		.replace(/mailto:<a href=/g, function (full_match, which) {
			return "<a href=";
		})
		.replace(/{{--TIME-(\d*)--}}/g, function(time_token, time_index) {
			return timestamp_array[time_index] || time_token;
		})
		.replace(/{{--SCORE-(\d*)--}}/g, function(score_token, score_index) {
			return score_array[score_index] || score_token;
		});
		

	return val;
};

var Markdown_Is_Valid_Link = function (link) {
	return validLinkMarkDownRegEx.test(link);
};

Markdown.tld_url_regex = validLinkMarkDownRegEx;
Markdown.url_regex = /^((ftp|https?):\/\/)?[-\w]+\.([-\w]+\.)*(\d+\.\d+\.\d+|[-A-Za-z]+)(:\d+)?($|(\/\S?(\/\S)*\/?)|(\#\S?)|(\?\S?))/i;
Markdown.global_url_regex = /(([a-zA-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\%\_\`\{\|\}\~\.]+@)?)(((ftp|https?):\/\/)?[-\w]+\.([-\w]+\.)*(\d+\.\d+\.\d+|[-A-Za-z]+)(:\d+)?(((\/([A-Za-z0-9-\._~:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=])*)+)\??([A-Za-z0-9-\._~:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\%])*)?)([^A-Za-z]|$)/gi;
Markdown.score_regex = /(?:(\s|\n|^|,))\d{1,2}-(\d{1,2}(?!\d|-))/g;
Markdown.timestamp_regex = /\d\d\d\d(?:[-, ])[01]\d(?:[-, ])[0-3]\d [0-2]\d:\d\d:[0-5]\d/g;
Markdown.potential_phone_regex = /\+?(?:\d{1,4} ?)?(?:(?:\(\d{1,4}\)|\d(?:(?: |\-)?\d){0,3})(?:(?: |\-)?\d){2,}|(?:\(\d{2,4}\)|\d(?:(?: |\-)?\d){1,3})(?:(?: |\-)?\d){1,})(?:(?: x| ext.?)\d{1,5}){0,1}/g;

var Markdown_For_Search = function (raw, options) {
	options = options || {};
	if (!raw) { return ''; }
	if (!options.dont_escape) {
		raw = _.escape(raw);
	}
	return raw.replace(/\{\{\[\[-([^\{\{\[\[]*?)-\]\]\}\}/g, function(full_match, text) {
		return "<span class='search_match_stream'>" + text + "</span>";
	});
};

var Remove_Markdown = function (raw, options) {
	options = options || {};
	return (options.dont_escape ? raw : _.escape(raw)).
	replace(/\&\#x2F;/g, '/'). // not sure why underscore replaces these...docs don't even claim that it does
	replace(/\[code\]/g, '').
	replace(/\[\/code\]/g, '').
	replace(/\|([^\n]*)\|/g, function (full_match, text) {
		var cols = text.split(/\|/);
		if (!cols.length) {
			return text;
		}
		return cols.join('\t');
	}).
	replace(/\*\*(\S[^\*\*]*?\S)\*\*/g, function (full_match, text) {
		return text;
	}).
	// replace(/\`(.*?)\`/g, function(full_match, text) {
	// 	return text;
	// }).
	replace(/\*(\S[^\*]*?\S)\*/g, function (full_match, text) {
		return text;
	}).
	replace(/__(\S[^__]*?\S)__/g, function (full_match, text) {
		return text;
	}).
	replace(/~~(\S[^~~]*?\S)~~/g, function (full_match, text) {
		return text;
	}).
	replace(/(^|\n)&gt; ([^\n]*)/g, function (full_match, start, text) {
		return start + " " + text + " ";
	}).
	replace(/\[([^\]]*?)\]\(([\s\S]*?)\)/g, function (full_match, text, link) {
		return text;
	});
};

if (typeof exports == 'object') {
	exports.Markdown = Markdown;
	exports.Remove_Markdown = Remove_Markdown;
	exports.Markdown_For_Search = Markdown_For_Search;
	exports.Markdown_Is_Valid_Link = Markdown_Is_Valid_Link;
}

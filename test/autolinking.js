var Markdown = require('../markdown').Markdown,
	_ = require('underscore');

var tests = [
	{
		raw: 'http://example.com',
		expected: "<a href='http://example.com' target='_blank' rel='noreferrer'>http://example.com</a>"
	},
	{
		raw: 'http://subdomain.example.com',
		expected: "<a href='http://subdomain.example.com' target='_blank' rel='noreferrer'>http://subdomain.example.com</a>"
	},
	{
		raw: 'example.com',
		expected: "<a href='http://example.com' target='_blank' rel='noreferrer'>example.com</a>"
	},
	{
		raw: 'example.co.uk',
		expected: "<a href='http://example.co.uk' target='_blank' rel='noreferrer'>example.co.uk</a>"
	},
	{
		raw: '192.168.1.1',
		expected: "<a href='http://192.168.1.1' target='_blank' rel='noreferrer'>192.168.1.1</a>"
	},
	{
		raw: 'subdomain.example.com',
		expected: "<a href='http://subdomain.example.com' target='_blank' rel='noreferrer'>subdomain.example.com</a>"
	},
	{
		raw: 'ftp://example.com',
		expected: "<a href='ftp://example.com' target='_blank' rel='noreferrer'>ftp://example.com</a>"
	},
	{
		raw: 'hello@example.com',
		expected: "<a href='mailto:hello@example.com' target='_blank' rel='noreferrer'>hello@example.com</a>"
	},
	{
		raw: 'hello@subdomain.example.com',
		expected: "<a href='mailto:hello@subdomain.example.com' target='_blank' rel='noreferrer'>hello@subdomain.example.com</a>"
	},
	{
		raw: 'hello@example.definitelyinvaliddomain',
		expected: "hello@example.definitelyinvaliddomain"
	},
	{
		raw: "Lorem ipsum dolor sit amet, an pro alterum eligendi praesent, no aperiam admodum est. Quem amet id mei. Nec sale copiosae praesent ne, mei solum eripuit mnesarchum te. Eam ne civibus noluisse, no duo ponderum intellegat consetetur." +
			 "Ea sed laudem euripidis. Has ut aliquid persequeris. Iuvaret vituperata mei in, vel an esse elitr periculis. Quis aliquid oportere ex ius, quot dolorem perpetua eam cu. Has no mutat civibus corpora, nam vocent blandit ut." +
			 "Ad pri admodum offendit. Duo ex minim tempor consectetuer. Qui in dico mundi persecuti, sanctus corrumpit usu te. Eu stet cibo quodsi eum, no per quaeque praesent, has scaevola nominati neglegentur ei. Virtute commune ne has, ad sit prima ipsum. Sea ex clita saepe, no prima partem antiopam sit. Ne vix labitur legimus appetere, id his dicant nostrum concludaturque, mel eu putent inimicus." +
			 " example.com " +
			 "Eius harum ancillae ne quo, duo cu stet officiis gloriatur, qui eu atqui vidisse similique. Id eos stet recteque mnesarchum, eos laudem labitur nonumes in, vel purto munere constituto ne. Ius mazim vocent vivendo id, qui et tation animal inimicus, ex inani ponderum dissentiunt per. Per verear eloquentiam ne, ocurreret scribentur philosophia his no. Mei viris verear patrioque an." +
			 "Nihil admodum at duo, sea at cibo mundi delectus, pro harum aliquid vocibus te. Ut luptatum vulputate scriptorem pri, libris nonumes eu duo, tota mandamus recteque cu est. Exerci evertitur an per. Vocibus insolens voluptaria has an. Maluisset accommodare qui ad, sit erat tritani corrumpit an. Usu eu mucius consetetur, pro id minimum persecuti.",
		expected: "Lorem ipsum dolor sit amet, an pro alterum eligendi praesent, no aperiam admodum est. Quem amet id mei. Nec sale copiosae praesent ne, mei solum eripuit mnesarchum te. Eam ne civibus noluisse, no duo ponderum intellegat consetetur." +
			 "Ea sed laudem euripidis. Has ut aliquid persequeris. Iuvaret vituperata mei in, vel an esse elitr periculis. Quis aliquid oportere ex ius, quot dolorem perpetua eam cu. Has no mutat civibus corpora, nam vocent blandit ut." +
			 "Ad pri admodum offendit. Duo ex minim tempor consectetuer. Qui in dico mundi persecuti, sanctus corrumpit usu te. Eu stet cibo quodsi eum, no per quaeque praesent, has scaevola nominati neglegentur ei. Virtute commune ne has, ad sit prima ipsum. Sea ex clita saepe, no prima partem antiopam sit. Ne vix labitur legimus appetere, id his dicant nostrum concludaturque, mel eu putent inimicus." +
			 " <a href='http://example.com' target='_blank' rel='noreferrer'>example.com</a> " +
			 "Eius harum ancillae ne quo, duo cu stet officiis gloriatur, qui eu atqui vidisse similique. Id eos stet recteque mnesarchum, eos laudem labitur nonumes in, vel purto munere constituto ne. Ius mazim vocent vivendo id, qui et tation animal inimicus, ex inani ponderum dissentiunt per. Per verear eloquentiam ne, ocurreret scribentur philosophia his no. Mei viris verear patrioque an." +
			 "Nihil admodum at duo, sea at cibo mundi delectus, pro harum aliquid vocibus te. Ut luptatum vulputate scriptorem pri, libris nonumes eu duo, tota mandamus recteque cu est. Exerci evertitur an per. Vocibus insolens voluptaria has an. Maluisset accommodare qui ad, sit erat tritani corrumpit an. Usu eu mucius consetetur, pro id minimum persecuti."
	},
	{
		// link detecting is case sensitive
		raw: 'example.COM',
		expected: "example.COM"
	},
	{
		// link detecting is case sensitive
		raw: 'hello@example.COM',
		expected: "hello@example.COM"
	},
	{
		// link detecting is case sensitive, which protects us from making this a link
		raw: '...I will try and help.Business here has been great...',
		expected: "...I will try and help.Business here has been great..."
	},
	{
		raw: 'https://example.asia',
		expected: "<a href='https://example.asia' target='_blank' rel='noreferrer'>https://example.asia</a>"
	},
	{
		raw: 'example.business',
		expected: "<a href='http://example.business' target='_blank' rel='noreferrer'>example.business</a>"
	},
	{
		raw: 'example,business',
		expected: "example,business"
	},
	{
		raw: 'example.definitelyaninvaliddomain',
		expected: "example.definitelyaninvaliddomain"
	}
];

_.each(tests, function(test) {
	var str = test.raw;
	var start = +new Date();
	var marked = Markdown(str, {});
	var taken = +new Date() - start;
	if (marked === test.expected) {
		console.warn("Passed - " + taken + "ms");
	}
	else {
		console.warn("############################################");
		console.warn(marked, 'vs', test.expected);
		console.warn("############################################");
		console.warn("FAILED - " + taken + "ms");
	}
});

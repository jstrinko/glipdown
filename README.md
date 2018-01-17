# glipdown
Glip-flavored markdown with URI auto-linking
## Install
```
npm install glipdown
```
## Usage
```
var Markdown = require('../markdown').Markdown

Markdown(string[, param]);
```
## Syntax
***********
```
Original Text:

https://jira.ringcentral.com

Marked Text:

<a href='https://jira.ringcentral.com' target='_blank' rel='noreferrer'>https://jira.ringcentral.com</a>
```
***********
```
Original Text:

| **When** | 11:30am on Monday |
| **Account** | dan@close.com |
| **From** | Dave Varenos |
| **To** | Dan Foody |

Marked Text:

<table>
    <tr valign='top'>
        <td width='50%'> <b>When</b> </td>
        <td width='50%'> 11:30am on Monday
    </tr>
    <tr valign='top'>
        <td width='50%'> <b>Account</b> </td>
        <td width='50%'> <a href='mailto:dan@close.com' target='_blank' rel='noreferrer'>dan@close.com</a> 
    </tr>
    <tr valign='top'>
        <td width='50%'> <b>From</b> </td>
        <td width='50%'> Dave Varenos 
    </tr>
    <tr valign='top'>
        <td width='50%'> <b>To</b> </td>
        <td width='50%'> Dan Foody 
    </tr>
</table>
```
***********
```
Original Text:

email me at mailto:foo@bar.com or [mail my friend](mailto:myfriend@bar.com)

Marked Text:

email me at <a href='mailto:foo@bar.com' target='_blank' rel='noreferrer'>foo@bar.com</a> or <a href='mailto:myfriend@bar.com' target='_blank' rel='noreferrer'>mail my friend</a>
```
***********
```
Original Text:

[code]
|test|test|
[/code]
|test|test|

Marked Text:

<pre class=codesnippet>
    |test|test|
</pre>
<table>
    <tr valign='top'>
        <td width='50%'>test</td>
        <td width='50%'>test
    </tr>
</table>
```
***********
```
Original Text:

* awesome

Marked Text:

<ul><li>awesome</li></ul>
```
***********
```
Original Text:

**awesome**

Marked Text:

<b>awesome</b>
```
***********
```
Original Text:

*awesome*

Marked Text:

<i>awesome</i>
```
***********
```
Original Text:

__awesome__ google.com

Marked Text:

<u>awesome</u> <a href='http://google.com' target='_blank' rel='noreferrer'>google.com</a>
```
***********
```
Original Text:

~~awesome google.com~~

Marked Text:

<strike>awesome <a href='http://google.com' target='_blank' rel='noreferrer'>google.com</a></strike>
```
***********
```
Original Text:

[code][some link](http://heynow.com)[/code][legit](http://legit.com)

Marked Text:

<pre class=codesnippet>&lt;a href='http://heynow.com' target='_blank' rel='noreferrer'&gt;some link&lt;/a&gt;</pre><a href='http://legit.com' target='_blank' rel='noreferrer'>legit</a>
```
***********
```
Original Text:

[oiasjdf@Ooijasdf.com](mailto:oiasjdf@Ooijasdf.com)

Marked Text:

<a href='mailto:oiasjdf@Ooijasdf.com' target='_blank' rel='noreferrer'>oiasjdf@Ooijasdf.com</a>
```
***********
```
Original Text:

[Ooijasdf.com](Ooijasdf.com)

Marked Text:

<a href='Ooijasdf.com' target='_blank' rel='noreferrer'>Ooijasdf.com</a>
```
***********
```
Original Text:

this is a full.email@address.com for you

Marked Text:

this is a <a href='mailto:full.email@address.com' target='_blank' rel='noreferrer'>full.email@address.com</a> for you
```
***********
```
Original Text:

**File**
[calendar-jeff.ics](https://trello-attachments.s3.amazonaws.com/5463e14ac46008b0ec6feccf/553e4f4aa147ee4561e8c580/b66fa91c8224cfb458831a9618118c2f/calendar-jeff.ics)

Marked Text:

<b>File</b>
<a href='https://trello-attachments.s3.amazonaws.com/5463e14ac46008b0ec6feccf/553e4f4aa147ee4561e8c580/b66fa91c8224cfb458831a9618118c2f/calendar-jeff.ics' target='_blank' rel='noreferrer'>calendar-jeff.ics</a>
```
***********
```
Original Text:

some stuff [a link](https://google.bsd) and http://yngwie.sci/hey/now/#/foo?bar=true
Some more stuff glip.bsd and [awesome is awesome](reddit.sci/foo/bar?hey=now#hoes) dont forget about
hookers.asia

Marked Text:

some stuff <a href='https://google.bsd' target='_blank' rel='noreferrer'>a link</a> and <a href='http://yngwie.sci/hey/now/#/foo?bar=true' target='_blank' rel='noreferrer'>http://yngwie.sci/hey/now/#/foo?bar=true</a>
Some more stuff glip.bsd and [awesome is awesome](reddit.sci/foo/bar?hey=now#hoes) dont forget about
<a href='http://hookers.asia' target='_blank' rel='noreferrer'>hookers.asia</a>
```
***********
```
Original Text:

<a href="http://google.com" class="heynow"><img src="http://heynow.com">Words</a> https://google.com

Marked Text:

&lt;a href=&quot;<a href='http://google.com' target='_blank' rel='noreferrer'>http://google.com</a>&quot; class=&quot;heynow&quot;&gt;&lt;img src=&quot;<a href='http://heynow.com' target='_blank' rel='noreferrer'>http://heynow.com</a>&quot;&gt;Words&lt;/a&gt; <a href='https://google.com' target='_blank' rel='noreferrer'>https://google.com</a>
```
***********
```
Original Text:

{{-{{a href="http://google.com" class="heynow"}}-}}{{-{{img src="http://heynow.com"}}-}} http://legit.com

Marked Text:

{{-{{a href=&quot;http://google.com&quot; class=&quot;heynow&quot;}}-}}{{-{{img src=&quot;http://heynow.com&quot;}}-}} http://legit.com
```
***********

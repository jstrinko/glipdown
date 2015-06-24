# GlipDown

Glip-flavored markdown parser with URI auto-linking.
 
## Building TLD variable

Glipdown has a list defined with [all the valid TLDs](http://data.iana.org/TLD/tlds-alpha-by-domain.txt).

If the list is updated, we'll need to update the library with the new list.

There is a script included in `etc` which builds the variable we need:

```shell
node etc/build_tld_object.js
```

Copy the object which gets outputted in the terminal window, and replace the existing variable in `markdown.js`.

## Running tests

```shell
npm test
```

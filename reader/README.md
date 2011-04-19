## Play.rules

### Reader "v2"

New approach. This one builds up a simple and single web page, most like a pdf file would render.

Probably, the neat thing with this new approach is that it allows further configuration and allow us to specify each file to render, and in which order. We could have a complex folder structure, we just have to update accordingly the config.yml file.

May make use of infinite scrolling pattern for that page. Anyway, the jquery sausage widget is used, because it's a pretty great plugin. Tiny and providing a very sweet feature (that certainly well match the purpose of an online book).

Book's content is either retrieved by using local xhr (webapp and "articles" sharing the same domain) or using jsonp requests. We might just don't want to go overboard. Using local xhr seems enough (thereby lowering latency even with smart caching system).


### How

1. _optionnal_ First, we grab various and general repo information. Numbers of watchers, last commits, ...

2. the `config.yml` file is parsed and used to builds up both the toc and page structure.

3. A webpage is generated with chapters following the structure defined in `config.yml`

4. Success! You can spread the word about the last version of your book.

 
### Cons

Since, it's all done client side, the whole thing is not really SEO compliant. Anyway, that may be done using a nodejs variation of this.
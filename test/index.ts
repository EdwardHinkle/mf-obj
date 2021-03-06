import assert = require('assert');
import mfo = require('../index');

describe('event', function() {
    var orig_request;
    var pages;
    
    before(function() {
        orig_request = mfo.request;
        mfo.request = url => Promise.resolve(pages[url] ? {statusCode: 200, body: pages[url]} : {statusCode: 404, body: ''});
    });
    
    after(function() {
        mfo.request = orig_request;
    });

    it('can be constructed with no args', function() {
        var event = new mfo.Event();
        assert.equal(event.url, null);
        assert.equal(event.start, null);
        assert.equal(event.location, null);
    });
    
    it('can be constructed from url', function() {
        var url = 'http://2016.indieweb.org';
        var event = new mfo.Event(url);
        assert.equal(event.url, url);
    });
   
    it('can load an event', function(done) {
        pages = {
            'http://2016.indieweb.org': '<div class="h-event">\
            <h1 class="p-name">Indieweb Summit</h1>\
            <time class="dt-start" datetime="2016-06-03">June 3</time>\
            <time class="dt-end" datetime="2016-06-05">5</time>\
            <span class="h-card p-location">\
                <span class="p-name">Vadio</span>, \
                <span class="p-street-address">919 SW Taylor St, Ste 300</span>, \
                <span class="p-locality">Portland</span>, <span class="p-region">Oregon</span>\
            </span>\
            </div>'};
        mfo.getEvent('http://2016.indieweb.org')
        .then(event => {
            assert.equal(event.url, 'http://2016.indieweb.org');
            assert.equal(event.name, 'Indieweb Summit');
            assert.deepEqual(event.start, new Date('2016-06-03'));
            assert.deepEqual(event.end, new Date('2016-06-05'));
            assert.equal(event.location.name, 'Vadio');
        })
        .then(done)
        .catch(done);
    });
    
    it('getEventFromUrl works', function(done) {
        pages = {
            'http://2016.indieweb.org': '<div class="h-event">\
            <h1 class="p-name">Indieweb Summit</h1>\
            <time class="dt-start" datetime="2016-06-03">June 3</time>\
            <time class="dt-end" datetime="2016-06-05">5</time>\
            <span class="h-card p-location">\
                <span class="p-name">Vadio</span>, \
                <span class="p-street-address">919 SW Taylor St, Ste 300</span>, \
                <span class="p-locality">Portland</span>, <span class="p-region">Oregon</span>\
            </span>\
            </div>',
        };
        mfo.getEvent('http://2016.indieweb.org')
        .then(e => {
            assert(e.name === 'Indieweb Summit');
        })
        .then(done)
        .catch(done);
    });
});

describe('feed', function() {
    var orig_request;
    var pages;
    
    before(function() {
        orig_request = mfo.request;
        mfo.request = url => Promise.resolve(pages[url] ? {statusCode: 200, body: pages[url]} : {statusCode: 404, body: ''});
    });
    
    after(function() {
        mfo.request = orig_request;
    });

    it('can be constructed with no args', function() {
        var feed = new mfo.Feed();
        assert.equal(feed.url, null);
        assert.equal(feed.name, null);
        assert.equal(feed.author, null);
        assert.deepEqual(feed.getChildren(), []);
    });
    
    it('can be constructed from url', function() {
        var url = 'http://sometsite';
        var feed = new mfo.Feed(url);
        assert.equal(feed.url, url);
    });

    it('getFeed (h-feed)', function(done) {
        pages = {
            'http://somesite': '<div class="h-feed">\
            <a class="u-url" href="http://somesite"></a>\
            <div class="p-name">Notes</div>\
            <div class="h-entry">\
                <a class="u-url" href="/3"></a>\
                <div class="p-name e-content">Hello 3</div>\
            </div>\
            <div class="h-entry">\
                <a class="u-url" href="/2"></a>\
                <div class="p-name e-content">Hello 2</div>\
            </div>\
            <div class="h-entry">\
                <a class="u-url" href="/1"></a>\
                <div class="p-name e-content">Hello 1</div>\
            </div>\
            <a rel="prev" href="prev"></a>\
            <a rel="next" href="next"></a>\
        </div>'};
        mfo.getFeed('http://somesite')
        .then(feed => {
            assert.equal(feed.url, 'http://somesite');
            assert.equal(feed.name, 'Notes');
            var children = feed.getChildren();
            assert.equal(children.length, 3);
            assert.equal(children[0].url, 'http://somesite/3');
            assert.equal(children[0].name, 'Hello 3');
            assert.equal(children[2].url, 'http://somesite/1');
            assert.equal(children[2].name, 'Hello 1');
            assert.equal(feed.prev, 'http://somesite/prev');
            assert.equal(feed.next, 'http://somesite/next');
        })
        .then(done)
        .catch(done);
    });

    it('getFeed (implied)', function(done) {
        pages = {
            'http://somesite': '<html>\
            <head><title>Notes</title></head>\
            <body>\
            <div>\
                <div class="h-entry">\
                    <a class="u-url" href="/3"></a>\
                    <div class="p-name e-content">Hello 3</div>\
                </div>\
                <div class="h-entry">\
                    <a class="u-url" href="/2"></a>\
                    <div class="p-name e-content">Hello 2</div>\
                </div>\
                <div class="h-entry">\
                    <a class="u-url" href="/1"></a>\
                    <div class="p-name e-content">Hello 1</div>\
                </div>\
                <a rel="prev" href="prev"></a>\
                <a rel="next" href="next"></a>\
            </div>\
            </body>\
            </html>'
        };
        mfo.getFeed('http://somesite')
        .then(feed => {
            assert.equal(feed.url, 'http://somesite');
            assert.equal(feed.name, 'Notes');
            var children = feed.getChildren();
            assert.equal(children.length, 3);
            assert.equal(children[0].url, 'http://somesite/3');
            assert.equal(children[0].name, 'Hello 3');
            assert.equal(children[2].url, 'http://somesite/1');
            assert.equal(children[2].name, 'Hello 1');
            assert.equal(feed.prev, 'http://somesite/prev');
            assert.equal(feed.next, 'http://somesite/next');
        })
        .then(done)
        .catch(done);
    });

    it('getFeed authorship (h-feed)', function(done) {
        pages = {
            'http://somesite': '<div class="h-feed">\
        <a class="p-author h-card" href="/"><img src="me.jpg">Test User</a>\
        <div class="p-name">Notes</div>\
            <div class="h-entry">\
                <a class="u-url" href="/3"></a>\
                <div class="p-name e-content">Hello 3</div>\
            </div>\
            <div class="h-entry">\
                <a class="u-url" href="/2"></a>\
                <div class="p-name e-content">Hello 2</div>\
            </div>\
            <div class="h-entry">\
                <a class="u-url" href="/1"></a>\
                <div class="p-name e-content">Hello 1</div>\
            </div>\
        </div>'};
        mfo.getFeed('http://somesite')
        .then(feed => {
            assert.equal(feed.url, 'http://somesite');
            assert.equal(feed.name, 'Notes');
            var children = feed.getChildren();
            assert.equal(children[0].author.name, 'Test User');
            assert.equal(children[0].author.url, 'http://somesite/');
            assert.equal(children[0].author.photo, 'http://somesite/me.jpg');
        })
        .then(done)
        .catch(done);
    });

    it('getFeed authorship (implied)', function(done) {
        pages = {
            'http://somesite/': '<div>\
        <a class="h-card u-url u-uid" href="/"><img src="me.jpg">Test User</a>\
            <div class="h-entry">\
                <a class="u-url" href="/3"></a>\
                <div class="p-name e-content">Hello 3</div>\
            </div>\
            <div class="h-entry">\
                <a class="u-url" href="/2"></a>\
                <div class="p-name e-content">Hello 2</div>\
            </div>\
            <div class="h-entry">\
                <a class="u-url" href="/1"></a>\
                <div class="p-name e-content">Hello 1</div>\
            </div>\
        </div>'
        };
        mfo.getFeed('http://somesite/')
        .then(feed => {
            assert.equal(feed.url, 'http://somesite/');
            var children = feed.getChildren();
            assert.equal(children[0].author.name, 'Test User');
            assert.equal(children[0].author.url, 'http://somesite/');
            assert.equal(children[0].author.photo, 'http://somesite/me.jpg');
        })
        .then(done)
        .catch(done);
    });

    it('getFeed authorship (h-feed, separate author-page)', function(done) {
        pages = {
            'http://somesite/': '<div class="h-card"><a class="u-uid" href="/"><img src="me.jpg">Test User</a></div>\
            <div class="h-feed">\
        <a class="u-author" href="/"></a>\
        <div class="p-name">Notes</div>\
            <div class="h-entry">\
                <a class="u-url" href="/3"></a>\
                <div class="p-name e-content">Hello 3</div>\
            </div>\
            <div class="h-entry">\
                <a class="u-url" href="/2"></a>\
                <div class="p-name e-content">Hello 2</div>\
            </div>\
            <div class="h-entry">\
                <a class="u-url" href="/1"></a>\
                <div class="p-name e-content">Hello 1</div>\
            </div>\
        </div>'
        };
        mfo.getFeed('http://somesite/')
        .then(feed => {
            assert.equal(feed.url, 'http://somesite/');
            assert.equal(feed.name, 'Notes');
            var children = feed.getChildren();
            assert.equal(children[0].author.name, 'Test User');
            assert.equal(children[0].author.url, 'http://somesite/');
            assert.equal(children[0].author.photo, 'http://somesite/me.jpg');
        })
        .then(done)
        .catch(done);
    });

});

describe('entry', function() {
    var orig_request;
    var pages;
    
    before(function() {
        orig_request = mfo.request;
        mfo.request = url => Promise.resolve(pages[url] ? {statusCode: 200, body: pages[url]} : {statusCode: 404, body: ''});
    });
    
    after(function() {
        mfo.request = orig_request;
    });

    it('can be constructed with no args', function() {
        var entry = new mfo.Entry();
        assert.equal(entry.url, null);
        assert.deepEqual(entry.replyTo, []);
        assert.deepEqual(entry.getChildren(), []);
    });

    it('can be constructed from url string', function() {
        var url = 'http://localhost:8000/firstpost';
        var entry = new mfo.Entry(url);
        assert.equal(url, entry.url);
    });

    var serializeEntry = new mfo.Entry();
    serializeEntry.url = 'http://testsite/2015/8/28/2';
    serializeEntry.name = 'Hello World!';
    serializeEntry.published = new Date('2015-08-28T08:00:00Z');
    serializeEntry.content = {"value":"Hello World!","html":"Hello <b>World!</b>"};
    serializeEntry.summary = "Summary";
    serializeEntry.category = ['indieweb'];
    serializeEntry.author = new mfo.Card();
    serializeEntry.author.name = 'Test User';
    serializeEntry.author.url = 'http://testsite';
    serializeEntry.replyTo = [new mfo.Entry('http://testsite/2015/8/28/2')];
    serializeEntry.addChild(new mfo.Entry('http://testsite/2015/8/28/3'));

    var serializeJson = '{"name":"Hello World!",\
"published":"2015-08-28T08:00:00.000Z",\
"content":{"value":"Hello World!","html":"Hello <b>World!</b>"},\
"summary":"Summary",\
"url":"http://testsite/2015/8/28/2",\
"author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},\
"category":["indieweb"],\
"syndication":[],\
"syndicateTo":[],\
"photo":[],\
"audio":[],\
"video":[],\
"replyTo":["http://testsite/2015/8/28/2"],\
"likeOf":[],\
"repostOf":[],\
"embed":null,\
"children":["http://testsite/2015/8/28/3"]}';

    it('can be serialized', function() {
        assert.equal(serializeEntry.serialize(), serializeJson);
    });

    it('can be deserialized', function() {
        assert.deepEqual(mfo.Entry.deserialize(serializeJson), serializeEntry);
    });
    
    it('can deserialize null values', function() {
        var json = '{"name":null,\
"published":null,\
"content":null,\
"url":"http://testsite/2015/10/6/1",\
"author":null,\
"category":[],\
"syndication":[],\
"replyTo":[],\
"likeOf":[],\
"repostOf":[],\
"children":[]}';
        var entry = mfo.Entry.deserialize(json);
        assert.equal(entry.name, null);
        assert.equal(entry.published, null);
        assert.equal(entry.content, null);
        assert.equal(entry.author, null);
    });

    it('err for no entry', function(done) {
        pages = {
            'http://testsite': '<html></html>'
        };
        mfo.getEntry('http://testsite')
        .then(() => assert(false))
        .catch(err => done(err.message.endsWith('No h-entry found') ? null : err));
    });

    it('err for multiple entries', function(done) {
        pages = {
            'http://testsite': '<html><div class="h-entry"></div><div class="h-entry"></div></html>'
        };
        mfo.getEntry('http://testsite')
        .then(() => assert(false))
        .catch(err => done(err.message.endsWith('Multiple h-entries found') ? null : err));
    });
    
    it('getEntryFromUrl marshal (event)', function(done) {
        pages = {
            'http://2016.indieweb.org': '<div class="h-event">\
            <h1 class="p-name">Indieweb Summit</h1>\
            <time class="dt-start" datetime="2016-06-03">June 3</time>\
            <time class="dt-end" datetime="2016-06-05">5</time>\
            <span class="h-card p-location">\
                <span class="p-name">Vadio</span>, \
                <span class="p-street-address">919 SW Taylor St, Ste 300</span>, \
                <span class="p-locality">Portland</span>, <span class="p-region">Oregon</span>\
            </span>\
            </div>',
        };
        mfo.getEntry('http://2016.indieweb.org', ['entry','event'])
        .then(e => {
            assert.equal(e.url, 'http://2016.indieweb.org');
            assert.equal(e.name, 'Indieweb Summit');
        })
        .then(done)
        .catch(done);
    });
    
    it('getEntryFromUrl marshal (html)', function(done) {
        pages = {
            'http://testsite/nonmf.html': '<html>\
                <head><title>Content title</title></head>\
                <body>\
                <p>Lorem ipsum <i>dolor</i>\
                </body>\
                </html>'
        };
        mfo.getEntry('http://testsite/nonmf.html', ['entry','html'])
        .then(e => {
            assert.equal(e.url, 'http://testsite/nonmf.html');
            assert.equal(e.name, 'Content title');
            assert.equal(e.content.value.replace(/\s+/g, ' ').trim(), 'Lorem ipsum dolor');
        })
        .then(done)
        .catch(done);
    });
    
    it('getEntryFromUrl marshal (oembed)', function(done) {
        pages = {
            'http://testsite/nonmf': '<html>\
                <head>\
                <title>Content title</title>\
                <link rel="alternate" type="application/json+oembed" href="http://testsite/oembed?url=nonmf">\
                </head>\
                <body>\
                <p>Lorem ipsum <i>dolor</i>\
                </body>\
                </html>',
            'http://testsite/oembed?url=nonmf': '{\
                "title": "Content title",\
                "author_name": "Test user",\
                "author_url": "http://testsite/testuser",\
                "html": "Lorem ipsum"\
                }'
        };
        mfo.getEntry('http://testsite/nonmf', ['entry','oembed'])
        .then(e => {
            assert.equal(e.url, 'http://testsite/nonmf');
            assert.equal(e.name, 'Content title');
            assert.equal(e.author.name, 'Test user');
            assert.equal(e.author.url, 'http://testsite/testuser');
            assert.equal(e.content.html, 'Lorem ipsum');
        })
        .then(done)
        .catch(done);
    });
    
    it('getEntryFromUrl marshal (opengraph)', function(done) {
        pages = {
            'http://testsite/nonmf': '<html>\
                <head>\
                <title>Content title</title>\
                <meta property="og:title" content="Content title" />\
                <meta property="og:description" content="Lorem ipsum" />\
                <meta property="og:url" content="http://testsite/nonmf" />\
                </head>\
                <body>\
                <p>Lorem ipsum <i>dolor</i>\
                </body>\
                </html>'
        };
        mfo.getEntry('http://testsite/nonmf', ['entry','opengraph'])
        .then(e => {
            assert.equal(e.url, 'http://testsite/nonmf');
            assert.equal(e.name, 'Content title');
            assert.equal(e.content.html, 'Lorem ipsum');
        })
        .then(done)
        .catch(done);
    });

    
    it('all strategy failure', function(done) {
        pages = {
            'http://testsite/nonmf.html': '<html>\
                <head><title>Content title</title></head>\
                <body>\
                <p>Lorem ipsum <i>dolor</i>\
                </body>\
                </html>'
        };
        mfo.getEntry('http://testsite/nonmf.html', ['entry','event','oembed'])
       .then(() => assert(false))
       .catch(err => done(err.message.startsWith('All strategies failed') ? null : err));
    });


    it('can load a note', function(done) {
        pages = {
            'http://testsite/2015/8/28/1': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/1"></a>\
                <time class="dt-published" datetime="2015-08-28T08:00:00Z"></time>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <span class="p-category">indieweb</span>\
                <div class="p-name e-content">Hello <b>World!</b></div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/1')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Hello World!",
                "published":new Date("2015-08-28T08:00:00Z"),
                "content":{"value":"Hello World!","html":"Hello <b>World!</b>"},
                "summary":null,
                "url":"http://testsite/2015/8/28/1",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":["indieweb"],
                "syndication":[],
                "syndicateTo":[],
                "photo":[],
                "audio":[],
                "video":[],
                "replyTo":[],
                "likeOf":[],
                "repostOf":[],
                "embed": null,
                "children":[]
            });
        })
        .then(done)
        .catch(done);
    });

    it('can load a photo', function(done) {
        pages = {
            'http://testsite/2015/8/28/1': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/1"></a>\
                <time class="dt-published" datetime="2015-08-28T08:00:00Z"></time>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content"><img class="u-photo" src="teacup.jpg"> Caption</div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/1')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Caption",
                "published":new Date("2015-08-28T08:00:00Z"),
                "content":{"value":"Caption","html":'<img class="u-photo" src="http://testsite/2015/8/28/teacup.jpg" /> Caption'},
                "summary":null,
                "url":"http://testsite/2015/8/28/1",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":[],
                "syndication":[],
                "syndicateTo":[],
                "photo":["http://testsite/2015/8/28/teacup.jpg"],
                "audio":[],
                "video":[],
                "replyTo":[],
                "likeOf":[],
                "repostOf":[],
                "embed": null,
                "children":[]
            });
        })
        .then(done)
        .catch(done);
    });

    it('can load audio', function(done) {
        pages = {
            'http://testsite/2015/8/28/1': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/1"></a>\
                <time class="dt-published" datetime="2015-08-28T08:00:00Z"></time>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content"><audio class="u-audio" src="track.ogg"></audio> Caption</div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/1')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Caption",
                "published":new Date("2015-08-28T08:00:00Z"),
                "content":{"value":"Caption","html":'<audio class="u-audio" src="http://testsite/2015/8/28/track.ogg"></audio> Caption'},
                "summary":null,
                "url":"http://testsite/2015/8/28/1",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":[],
                "syndication":[],
                "syndicateTo":[],
                "photo":[],
                "audio":["http://testsite/2015/8/28/track.ogg"],
                "video":[],
                "replyTo":[],
                "likeOf":[],
                "repostOf":[],
                "embed": null,
                "children":[]
            });
        })
        .then(done)
        .catch(done);
    });

    it('can load video', function(done) {
        pages = {
            'http://testsite/2015/8/28/1': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/1"></a>\
                <time class="dt-published" datetime="2015-08-28T08:00:00Z"></time>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content"><video class="u-video" src="movie.mp4"></video> Caption</div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/1')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Caption",
                "published":new Date("2015-08-28T08:00:00Z"),
                "content":{"value":"Caption","html":'<video class="u-video" src="http://testsite/2015/8/28/movie.mp4"></video> Caption'},
                "summary":null,
                "url":"http://testsite/2015/8/28/1",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":[],
                "syndication":[],
                "syndicateTo":[],
                "photo":[],
                "audio":[],
                "video":["http://testsite/2015/8/28/movie.mp4"],
                "replyTo":[],
                "likeOf":[],
                "repostOf":[],
                "embed": null,
                "children":[]
            });
        })
        .then(done)
        .catch(done);
    });

    it('can load a reply', function(done) {
        pages = {
            'http://testsite/2015/8/28/2': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/2"></a>\
                <time class="dt-published" datetime="2015-08-28T08:10:00Z"></time>\
                <a class="u-in-reply-to" href="/2015/8/28/1"></a>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content">Here is a <i>reply</i></div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/2')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Here is a reply",
                "published":new Date("2015-08-28T08:10:00Z"),
                "content":{"value":"Here is a reply","html":"Here is a <i>reply</i>"},
                "summary":null,
                "url":"http://testsite/2015/8/28/2",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":[],
                "syndication":[],
                "syndicateTo":[],
                "photo":[],
                "audio":[],
                "video":[],
                "replyTo":[{
                    "name":null,
                    "published":null,
                    "content":null,
                    "summary":null,
                    "url":"http://testsite/2015/8/28/1",
                    "author":null,
                    "category":[],
                    "syndication":[],
                    "syndicateTo":[],
                    "photo":[],
                    "audio":[],
                    "video":[],
                    "replyTo":[],
                    "likeOf":[],
                    "repostOf":[],
                    "embed": null,
                    "children":[]
                }],
                "likeOf":[],
                "repostOf":[],
                "embed": null,
                "children":[]}
            );
        })
        .then(done)
        .catch(done);
    });
    
    it('can load a like', function(done) {
        pages = {
            'http://testsite/2015/8/28/2': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/2"></a>\
                <time class="dt-published" datetime="2015-08-28T08:10:00Z"></time>\
                <a class="u-like-of" href="/2015/8/28/1"></a>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content">Here is a <i>like</i></div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/2')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Here is a like",
                "published":new Date("2015-08-28T08:10:00Z"),
                "content":{"value":"Here is a like","html":"Here is a <i>like</i>"},
                "summary":null,
                "url":"http://testsite/2015/8/28/2",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":[],
                "syndication":[],
                "syndicateTo":[],
                "photo":[],
                "audio":[],
                "video":[],
                "replyTo": [],
                "likeOf":[{
                    "name":null,
                    "published":null,
                    "content":null,
                    "summary":null,
                    "url":"http://testsite/2015/8/28/1",
                    "author":null,
                    "category":[],
                    "syndication":[],
                    "syndicateTo":[],
                    "photo":[],
                    "audio":[],
                    "video":[],
                    "replyTo":[],
                    "likeOf":[],
                    "repostOf":[],
                    "embed": null,
                    "children":[]
                }],
                "repostOf":[],
                "embed": null,
                "children":[]}
            );
        })
        .then(done)
        .catch(done);
    });
    
    it('can load a repost', function(done) {
        pages = {
            'http://testsite/2015/8/28/2': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/2"></a>\
                <time class="dt-published" datetime="2015-08-28T08:10:00Z"></time>\
                <a class="u-repost-of" href="/2015/8/28/1"></a>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content">Here is a <i>repost</i></div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/2')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Here is a repost",
                "published":new Date("2015-08-28T08:10:00Z"),
                "content":{"value":"Here is a repost","html":"Here is a <i>repost</i>"},
                "summary":null,
                "url":"http://testsite/2015/8/28/2",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":[],
                "syndication":[],
                "syndicateTo":[],
                "photo":[],
                "audio":[],
                "video":[],
                "replyTo":[],
                "likeOf":[],
                "repostOf":[{
                    "name":null,
                    "published":null,
                    "content":null,
                    "summary":null,
                    "url":"http://testsite/2015/8/28/1",
                    "author":null,
                    "category":[],
                    "syndication":[],
                    "syndicateTo":[],
                    "photo":[],
                    "audio":[],
                    "video":[],
                    "replyTo":[],
                    "likeOf":[],
                    "repostOf":[],
                    "embed": null,
                    "children":[]
                }],
                "embed": null,
                "children":[]}
            );
        })
        .then(done)
        .catch(done);
    });
    
    it('can load an article', function(done) {
        pages = {
            'http://testsite/2015/8/28/1': '<div class="h-entry">\
                <h1 class="p-name">First Post</h1>\
                <a class="u-url" href="/2015/8/28/1"></a>\
                <time class="dt-published" datetime="2015-08-28T08:00:00Z"></time>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content"><div class="p-summary">Summary</div> Hello <b>World!</b></div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/1')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"First Post",
                "published":new Date("2015-08-28T08:00:00Z"),
                "content":{"value":"Summary Hello World!","html":"<div class=\"p-summary\">Summary</div> Hello <b>World!</b>"},
                "summary":"Summary",
                "url":"http://testsite/2015/8/28/1",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":[],
                "syndication":[],
                "syndicateTo":[],
                "photo":[],
                "audio":[],
                "video":[],
                "replyTo":[],
                "likeOf":[],
                "repostOf":[],
                "embed": null,
                "children":[]
            });
        })
        .then(done)
        .catch(done);
    });
    
    it('can read e-x-embed', function(done) {
        pages = {
            'http://testsite/2015/8/28/1': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/1"></a>\
                <time class="dt-published" datetime="2015-08-28T08:00:00Z"></time>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <span class="p-category">indieweb</span>\
                <div class="p-name e-content">Hello <b>World!</b></div>\
                <div class="e-x-embed">some <i>embed</i> content</div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/1')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Hello World!",
                "published":new Date("2015-08-28T08:00:00Z"),
                "content":{"value":"Hello World!","html":"Hello <b>World!</b>"},
                "summary":null,
                "url":"http://testsite/2015/8/28/1",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":["indieweb"],
                "syndication":[],
                "syndicateTo":[],
                "photo":[],
                "audio":[],
                "video":[],
                "replyTo":[],
                "likeOf":[],
                "repostOf":[],
                "embed": {html:"some <i>embed</i> content",value:"some embed content"},
                "children":[]
            });
        })
        .then(done)
        .catch(done);
    });
    
    it('can read u-syndicate-to', function(done) {
        pages = {
            'http://testsite/2015/8/28/1': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/1"></a>\
                <time class="dt-published" datetime="2015-08-28T08:00:00Z"></time>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <span class="p-category">indieweb</span>\
                <div class="p-name e-content">Hello <b>World!</b></div>\
                <a class="u-syndicate-to" href="http://twitter.com">twitter</a>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/1')
        .then(function(entry) {
            assert.deepEqual(entry, {
                "name":"Hello World!",
                "published":new Date("2015-08-28T08:00:00Z"),
                "content":{"value":"Hello World!","html":"Hello <b>World!</b>"},
                "summary":null,
                "url":"http://testsite/2015/8/28/1",
                "author":{"name":"Test User","photo":null,"url":"http://testsite","uid":null},
                "category":["indieweb"],
                "syndication":[],
                "syndicateTo":["http://twitter.com"],
                "photo":[],
                "audio":[],
                "video":[],
                "replyTo":[],
                "likeOf":[],
                "repostOf":[],
                "embed": null,
                "children":[]
            });
        })
        .then(done)
        .catch(done);
    });
    
    it('isArticle works (photo without caption)', function(done) {
        pages = {
            'http://testsite/2015/8/28/1': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/1"></a>\
                <time class="dt-published" datetime="2015-08-28T08:00:00Z"></time>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content"><img class="u-photo" src="photo.jpg"/></div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/1')
        .then(function(entry){
            assert.equal(entry.isArticle(), false);
        })
        .then(done)
        .catch(done);
    });
    
    it('getDomain works', function() {
        assert.equal((new mfo.Entry('http://somesite.com/2015/1/2/3')).getDomain(), 'http://somesite.com');
        assert.equal((new mfo.Entry('https://somesite.com:8080/2015/1/2/3')).getDomain(), 'https://somesite.com:8080');
    });
    
    it('getPath works', function() {
        assert.equal((new mfo.Entry('http://somesite.com/2015/1/2/3')).getPath(), '/2015/1/2/3');
        assert.equal((new mfo.Entry('https://somesite.com:8080/2015/1/2/3')).getPath(), '/2015/1/2/3');
    });
    
    it('getReferences works', function(done) {
        pages = {
            'http://testsite/2015/8/28/4': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/4"></a>\
                <time class="dt-published" datetime="2015-08-28T08:10:00Z"></time>\
                <a class="u-in-reply-to" href="/2015/8/28/1"></a>\
                <a class="u-like-of" href="/2015/8/28/2"></a>\
                <a class="u-repost-of" href="/2015/8/28/3"></a>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content">Here is a <a href="http://othersite/1/2/3">content link</a></div>\
                <div class="h-cite">\
                <a class="u-url" href="/2015/8/28/5"></a>\
                <a class="u-like-of" href="/2015/8/28/4"></a>\
                </div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/4')
        .then(e => {
            assert.deepEqual(e.getReferences(), [
                'http://testsite/2015/8/28/1',
                'http://testsite/2015/8/28/2',
                'http://testsite/2015/8/28/3'
            ]);
        })
        .then(done)
        .catch(done);
    });
    
    it('getMentions works', function(done) {
        pages = {
            'http://testsite/2015/8/28/4': '<div class="h-entry">\
                <a class="u-url" href="/2015/8/28/4"></a>\
                <time class="dt-published" datetime="2015-08-28T08:10:00Z"></time>\
                <a class="u-in-reply-to" href="/2015/8/28/1"></a>\
                <a class="u-like-of" href="/2015/8/28/2"></a>\
                <a class="u-repost-of" href="/2015/8/28/3"></a>\
                <a class="p-author h-card" href="http://testsite">Test User</a>\
                <div class="p-name e-content">Here is a <a href="http://othersite/1/2/3">content link</a></div>\
                <div class="h-cite">\
                <a class="u-url" href="/2015/8/28/5"></a>\
                <a class="u-like-of" href="/2015/8/28/4"></a>\
                </div>\
            </div>'};
        mfo.getEntry('http://testsite/2015/8/28/4')
        .then(e => {
            assert.deepEqual(e.getMentions(), [
                'http://testsite/2015/8/28/1',
                'http://testsite/2015/8/28/2',
                'http://testsite/2015/8/28/3',
                'http://othersite/1/2/3'
            ]);
        })
        .then(done)
        .catch(done);
    });
    
    it('deduplicate works', function() {
        var entry = new mfo.Entry('http://testsite/2015/10/6/1');
        var c1 = new mfo.Entry('http://testsite/2015/10/6/2');
        var c2 = new mfo.Entry('http://testsite/2015/10/6/3');
        entry.addChild(c1);
        entry.addChild(c2);
        entry.addChild(c1);
        assert.deepEqual(entry.getChildren(), [c1,c2]);
    });
    
    it('getEntryFromUrl', function(done) {
        pages = {
            'http://somesite/post': '<div class="h-entry">Test post</div>',
        };
        mfo.getEntry('http://somesite/post')
        .then(e => {
            assert(e.name === 'Test post');
        })
        .then(done)
        .catch(done);
    });
    
    it('getEntryFromUrl 404', function(done) {
        pages = {};
        mfo.getEntry('http://somesite/nonexistentpost')
       .then(() => assert(false))
       .catch(err => done(err.message == 'Server returned status 404' ? null : err));
    });

    it('authorship author-page by url', function(done) {
        pages = {
            'http://somesite/post': '<div class="h-entry"><a class="u-author" href="/author"></a></div>'
        };
        mfo.getEntry('http://somesite/post')
        .then(e => {
            assert(e.author !== null);
            assert(e.author.url === 'http://somesite/author');
        })
        .then(done)
        .catch(done);
    });
        
    it('authorship author-page by rel-author', function(done) {
        pages = {
            'http://somesite/post': '<div class="h-entry"></div><a rel="author" href="/author"></a>'
        };
        mfo.getEntry('http://somesite/post')
        .then(e => {
            assert(e.author !== null);
            assert(e.author.url === 'http://somesite/author');
        })
        .then(done)
        .catch(done);
    });
    
    it('authorship author-page url/uid', function(done) {
        pages = {
            'http://somesite/post': '<div class="h-entry"><a class="u-author" href="/"></a></div>',
            'http://somesite/': '<div class="h-card"><a class="u-uid" href="/"><img src="me.jpg">Test User</a></div>'
        };
        mfo.getEntry('http://somesite/post')
        .then(e => {
            assert(e.author !== null);
            assert(e.author.name === 'Test User');
            assert(e.author.photo === 'http://somesite/me.jpg');
        })
        .then(done)
        .catch(done);
    });
    
    it('authorship author-page rel-me', function(done) {
        pages = {
            'http://somesite/post': '<div class="h-entry"><a class="u-author" href="/"></a></div>',
            'http://somesite/': '<a class="h-card" rel="me" href="/"><img src="me.jpg">Test User</a>'
        };
        mfo.getEntry('http://somesite/post')
        .then(e => {
            assert(e.author !== null);
            assert(e.author.name === 'Test User');
            assert(e.author.photo === 'http://somesite/me.jpg');
        })
        .then(done)
        .catch(done);
    });
    
    it('authorship author-page url only', function(done) {
        pages = {
            'http://somesite/post': '<div class="h-entry"><a class="u-author" href="/"></a></div>',
            'http://somesite/': '<a class="h-card" href="/"><img src="me.jpg">Test User</a>'
        };
        mfo.getEntry('http://somesite/post')
        .then(e => {
            assert(e.author !== null);
            assert(e.author.name === 'Test User');
            assert(e.author.photo === 'http://somesite/me.jpg');
        })
        .then(done)
        .catch(done);
    });
    
    it('authorship author-page no match', function(done) {
        pages = {
            'http://somesite/post': '<div class="h-entry"><a class="u-author" href="/"></a></div>',
            'http://somesite/': '<a class="h-card" href="/notme"><img src="me.jpg">Test User</a>'
        };
        mfo.getEntry('http://somesite/post')
        .then(e => {
            assert(e.author !== null);
            assert(e.author.name === null);
            assert(e.author.photo === null);
        })
        .then(done)
        .catch(done);
    });
    
    it('authorship author-page 404', function(done) {
        pages = {
            'http://somesite/post': '<div class="h-entry"><a class="u-author" href="/"></a></div>'
        };
        mfo.getEntry('http://somesite/post')
        .then(e => {
            assert(e.author !== null);
            assert(e.author.name === null);
            assert(e.author.photo === null);
        })
        .then(done)
        .catch(done);
    });
    
    it('filters non-cite from children', function(done) {
        pages = {
            'http://testsite': '<div class="h-entry">\
        <div class="h-cite"><a class="u-url" href="http://othersite/123"></a>a comment</div>\
        <div class="h-card"><a class="u-url" href="http://testsite"></a>a card</div>\
        </div>'};
        mfo.getEntry('http://testsite')
        .then(e => {
            assert(e.getChildren().length === 1);
            assert(e.getChildren()[0].name === 'a comment');
        })
        .then(done)
        .catch(done);
    });
});

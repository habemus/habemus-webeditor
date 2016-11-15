# habemus-editor-v2

## Docker

image: `gcr.io/habemus-web/static-assets-editor`

# i18n

Date: 2016-11-14

Internationalization will use a custom service. That is due to the fact
that in this application there are many js files that require translations
themselves.

We've discarded the idea of making translations at build-time because that
would require the nginx static server to understand the user's preferences
through cookies (or another equivalent mechanism). That looks way too complicated
and messing separation of concerns, thus we've opted for js-client-based i18n

Some solutions like https://t2ym.github.io/i18n-behavior/components/i18n-behavior/
emerged for Polymer, but look quite complicated and Simon is not quite fond of
that kind of over-engineering. We've opted for airbnb's Polyglot, but the `language`
service is not tied to its API, which means it can be changed in the future.

Polyglot was chosen because it looks really small and does not try to do lots of stuff.
And Airbnb must have some expertise in translating stuff, right?

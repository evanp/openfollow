openfollow
================

API server to find people on the federated social web by email
address, Twitter handle, or Facebook ID.

License
-------

Copyright 2012, StatusNet Inc. and others.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

API
---

There one main API endpoint.

* /v1/ids
  
  Takes a JSON document with fields "hook", "ids", "filter".

  "hook" is a Webhook to return additional results "later".
  
  "filter" is a filter for the results. Current values include:
  
  * "pubsub": only accounts that provide PubSubHubbub-enabled feeds

  "ids" is an array of identifier strings. Identifiers can be:
  
  * An URL like "http://tantek.com"
  * An email address like "evan@status.net"
  
  Notable kinds of URLs are:
  
  * Twitter profile URL like "https://twitter.com/evanpro"
  * Facebook profile URL like "http://facebook.com/evan.prodromou"
  * Google+ profile URL like "https://plus.google.com/104323674441008487802/posts"

  Returns a JSON document that maps those identifiers to known
  accounts for the same user.
  
  Example:
  
      {
          "hook": "http://example.com/search-results/SOMETHINGUNIQUE",
          "filter": "pubsub",
          "ids": [
              "@t",
              "evan@status.net",
              "http://facebook.com/faddah",
              "https://plus.google.com/113651174506128852447/posts",
              "Jan-Christoph Borchardt"
          ]
      }
  
  returns
  
      {
          "@t": ["http://tantek.com/"],
          "evan@status.net": ["http://identi.ca/evan", "http://evanpro.tumblr.com/"],
          "http://facebook.com/faddah": [],
          "https://plus.google.com/113651174506128852447/posts": ["http://blog.romeda.org/"],
          "Jan-Christoph Borchardt": ["https://joindiaspora.com/u/jancborchardt"]
      }

  Note: every ID is returned, even if we don't have info on it.
  
  Every result would return as an array, even if there's only one element.

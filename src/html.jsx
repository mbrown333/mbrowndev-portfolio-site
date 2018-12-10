/* eslint import/no-unresolved:"off" */
/* eslint import/extensions:"off" */
/* eslint global-require:"off" */
import React from "react";
import AdSense from 'react-adsense';
import favicon from "./favicon.png";

export default class HTML extends React.Component {
  render() {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          {/* Mobile Meta */}
          <meta name="HandheldFriendly" content="True" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          {/* Styles'n'Scripts */}
          <link
            rel="stylesheet"
            type="text/css"
            href="//fonts.googleapis.com/css?family=Merriweather:300,700,700italic,300italic|Open+Sans:700,400"
          />

          {this.props.headComponents}
          <link rel="shortcut icon" href={favicon} />
          <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
          <AdSense.Google
            client='ca-pub-6544681979376259'
            slot='7806394673'
          />
        </head>
        <body>
          <div
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    );
  }
}

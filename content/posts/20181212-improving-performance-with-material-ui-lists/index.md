---
title: How to Improve Material-UI List Performance
date: "2018-12-12T06:30:00Z"
cover: "https://unsplash.it/1280/500/?image=972"
author: "matthew"
category: "tech"
tags:
    - programming
    - stuff
    - other
---

##The Problem

If you've ever used Material UI components for a React project, you've most likely ran into performance issues with displaying large lists.  I ran into this issue several times where whenever I had a list over a certain length it made the list very unresponsive to user interaction, even in Chrome.

Check out this example on Stack Blitz: [https://react-smo644.stackblitz.io](https://react-smo644.stackblitz.io)

Try to open the list and select a number and you'll see the poor performance.  Now I did put 2000 items in this list so to be fair this may be an extreme case.

The whole example looks just like this:

```
import React, { Component } from 'react';
import { render } from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import './style.css';

const options = [];
for (var i = 1; i <= 2000; i++) options.push(i);

class App extends Component {
  state = {
    value: null
  };

  handleChange = (event, index, value) => this.setState({value});

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <SelectField
            floatingLabelText="Count"
            value={this.state.value}
            onChange={this.handleChange}
          >
            {options.map(o => <MenuItem key={o} value={o} primaryText={o} />)}
          </SelectField>
        </div>
      </MuiThemeProvider>
    );
  }
}

render(<App />, document.getElementById('root'));
```

##The Solution

There's an npm package that is excellent at solving this problem.  Check it out: [react-virtualized](https://www.npmjs.com/package/react-virtualized)

Here's our above example updated to use react-virtualized for the list:

```
import React, { Component } from 'react';
import { render } from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { List } from 'react-virtualized';
import './style.css';

const options = [];
for (var i = 1; i <= 2000; i++) options.push(i);

class App extends Component {
  state = {
    value: null
  };

  handleChange = value => this.setState({value});

  rowRenderer = ({
    key,
    index,
    isScrolling,
    isVisible,
    style
  }) => {
    return (
      <MenuItem 
        key={key} 
        style={style} 
        value={options[index]} 
        primaryText={options[index]}
        onClick={() => this.handleChange(options[index])}
      />
    )
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <SelectField
            floatingLabelText="Count"
            value={this.state.value}
            onChange={this.handleChange}
          >
            <List
              width={300}
              height={300}
              rowCount={options.length}
              rowHeight={40}
              rowRenderer={this.rowRenderer}
            />
          </SelectField>
        </div>
      </MuiThemeProvider>
    );
  }
}

render(<App />, document.getElementById('root'));
```

Check out a live example on stackblitz: [https://react-wxgkzm.stackblitz.io/](https://react-wxgkzm.stackblitz.io/).

You'll notice this list is much easier to interact with.  It pulls up faster, scrolls faster and closes faster.  This is due to react-virtualized taking care of only rendering a subsection of the list so that only those that are on display or near those on display are in the DOM.
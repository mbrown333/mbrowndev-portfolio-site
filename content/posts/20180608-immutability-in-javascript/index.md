---
title: Immutability in Javascript
date: "2018-06-08T22:00:00Z"
cover: "https://unsplash.it/1280/500/?image=1060"
author: "matthew"
category: "tech"
tags:
    - programming
    - stuff
    - other
---

I'm currently working on a project that uses React and Redux.  Both of these js libraries enforce immutability of objects as they won't let you mutate state.  I'm going to discuss exactly what that means and show examples of how to achieve immutability cleanly with ES6 features.

> Here’s the simple truth: you can’t innovate on products without first innovating the way you build them.
> — Alex Schleifer, The Way We Build

## Immutable vs Mutable
Let's start with the basic definition.  *Immutable* means once an object is assigned to a variable it doesn't change.  So when you want to change state in React or Redux you don't mutate an object in state.  Instead you build a new object instead and that new object reference replaces the old as the current state.  Achieving this can seem difficult if you aren't up to speed with modern js practices.  This is much easier to achieve using ES6 features which I will demonstrate below.

Strings in Javascript are immutable objects.  If you add one string to another it does not change the current string.  It will create a new string object and assign the reference to the variable storing the result.

> Immutable data cannot be changed once created, leading to much simpler application development, no defensive copying, and enabling advanced memoization and change detection techniques with simple logic. Persistent data presents a mutative API which does not update the data in-place, but instead always yields new updated data.
> — Immutable.js page

*Mutable* is just the opposite.  You have an object reference in memory and when the state of the app changes you update properties of that object to reflect the new state.  Achieving this in Javascript is very easy.  However there are drawbacks.  I know it has been my experience that as projects grow the amount of state that is held in the app grows along with it.  As this is happening the number of bugs that are difficult to resolve start to increase.  Usually the issue is the objects kept in the state are being mutated in several different places which makes it hard to track exactly where to fix it.  And if it does fix one bug then how many others does it create simultaneously?

This is the main advantage of making sure objects in state are immutable.  I've seen in building apps this way that it makes state changes really easy to debug.  Code for state changes is simple and easy to pinpoint if something is not correct.  Especially when [you use the Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en).

Let's take a look at examples of how to achieve immutability using ES6 features.  The examples will follow the typical Redux reducer pattern.

## Spread Operator
The spread operator is magic in my opinion.  It does a great job of keeping your code concise and saves a lot of work.  Take the example below:

```javascript
function app(state = initalState, action) {
  switch (action.type) {
    case FETCH_SUCCESS:
      return { ...state, pizzaList: action.data};
    default:
      return state;
  }
}
```

Rather than assigning `pizzaList` to state we use the spread operator to assign all the properties of state and the `pizzaList` property to a new object reference which is returned by the reducer.  This can also be achieved using `Object.assign`.

```javascript
function app(state = initalState, action) {
  switch (action.type) {
    case FETCH_SUCCESS:
      return Object.assign({}, state, { pizzaList: action.data });
    default:
      return state;
  }
}
```

Same result but my preference is to use the spread operator as it keeps things a bit more concise and explicit.  All just personal preference though.

The same result can be achieved if you want to make the property that is changed dynamic.  The following will assign whichever property that it receives in `action.field`.

```javascript
function app(state = initalState, action) {
  switch (action.type) {
    case FETCH_SUCCESS:
      return { ...state, [action.field]: action.data};
    default:
      return state;
  }
}
```

The spread operator also comes in handy for adding a new item to an array.

```javascript
    case ADD_PIZZA:
      return {
        ...state,
        pizzaList: [
          ...state.pizzaList,
          action.newPizza,
        ],
      };
```

## Arrays - map/filter/reduce
It's also very handy to use ES6 array operations (map/filter/reduce) since they all return new array references.  Let's take a look at some examples below.

_Updating all items in a list_
```javascript
    case INCREMENT_ALL_PIZZA_ORDER_COUNT:
      return {
        ...state,
        pizzaList: state.pizzaList.map(pizza => ({ ...pizza, orderCount: pizza.orderCount + 1 })),
      };
```

This constructs a new `pizzaList` by constructing a new object in the map for each item and updating the `orderCount` property.

_Removing an item from a list_
```javascript
    case REMOVE_PIZZA:
      return {
        ...state,
        pizzaList: state.pizzaList.filter(pizza => pizza.id !== action.removeId),
      };
```

This creates a new array by simply filtering out the object with the id that was removed.

_Updating an item in a list:_
```javascript
    case ADD_PIZZA:
      return {
        ...state,
        pizzaList: [
          ...state.pizzaList.filter(pizza => pizza.id !== action.updateId),
          action.updatedPizza,
        ],
      };
```

This updates an item in the list by first filtering out the updated id from the original list and then using the result plus the updated object to return a new array.

## Immutable JS
Facebook has a js library build around immutable principles called immutable.js.  I highly recommend you [check out their page if you'd like to learn more](https://facebook.github.io/immutable-js/).

>Much of what makes application development difficult is tracking mutation and maintaining state. Developing with immutable data encourages you to think differently about how data flows through your application.
> — Immutable.js page

## Wrap Up
We've talked about the principles behind immutability and some ES6 tools for achieving it.  Hopefully this gives you a clearer understanding as it an increasingly relevant topic in modern Javascript.

Thank you for reading!

---
title: Functional Stateless Components in React
date: "2018-04-09T22:02:52Z"
cover: "https://unsplash.it/1280/500/?image=1072"
author: "matthew"
category: "tech"
tags:
    - programming
    - stuff
    - other
---

In this article I'm going to explain functional stateless React components using simple code examples. Now this may sound abstract, but the idea behind this is very simple. The idea is that functional stateless components are just displaying data that is passed to them through props. That is it. No state, no methods, just plugging data into a template and returning a component to render.

When you see components in React they are normally declared in one of two ways. The first extends `React.Component`. 

```
class FancyComponent extends React.Component { 
    constructor(props) { 
      super(props); 
    } 
    ...
}
``` 

The example uses ES6 class notation to extend `React.Component`. You use this method when you are creating a component that does one of the following: 

* Uses state
* Uses a life cycle method (i.e. _componentDidMount_)

In all likelihood you will be using the class approach for your container Components that hold a fair amount of logic and are composed of presentational components. For the lower level building blocks you can simply declare a function that returns the component that you want to display like the following example. 

```
function NotSoFancyComponent(props) { 
  const { name, city, } = props; 
  return <div>Hello, {name} from {city}!</div> 
} 
```

In the `NotSoFancyComponent` we deconstruct the `props` object into the `name` and `city` constants. _(You don't have to do it this way. It is perfectly fine to use {props.name} that is just my preference.)_ This is an example of a functional stateless component. No state, no life cycle methods required. Just taking in data as props and plugging it into a component. 

We would use the component as follows. 
```
<NotSoFancyComponent name="Bob" city="Kansas City" />
```

We can also make this declaration more succinct using an ES6 arrow function. 

```
const NotSoFancyComponent = (props) => <div>Hello, {props.name} from {props.city}!</div>
```

The nice thing about keeping these components very simple is they can easily be re-used across your application or possibly multiple applications in a component library and you can be assured that they will display the same behavior everywhere. Cleaner code and better performance are two additional benefits to using this approach. 

And if you happen to come to a point where you need to use state or a life cycle method it is very easy to refactor these functions to do so. Let's say we want to leverage the `componentDidMount` life cycle hook with our example. This is the code changes we would need to make to make it work. 

```
class NotSoFancyComponent extends React.Component { 
  constructor(props) { 
    super(props); 
  } 
  
  componentDidMount() { 
    console.log('NotSoFancyComponent did mount!'); 
  } 
  
  render() { 
    const { name, city, } = this.props; return <div>Hello, {name} from {city}!</div> 
  } 
}
```

No drastic changes required. The declaration changes to a class extending `React.Component` and then move the function into the render function. 

I hope this enhances your understanding of functional stateless components as it is a foundational concept for building applications in React.
---
title: Functional Programming
date: "2018-06-21T06:30:00Z"
cover: "https://unsplash.it/1280/500/?image=1050"
author: "matthew"
category: "tech"
tags:
    - programming
    - stuff
    - other
---

In this article I'm going to discuss the functional programming paradigm and the benefits of using that paradigm in your code.  I'll be covering the core functional programming concepts along with higher order functions, functional composition, and pure functions.  

Functional programming has been growing in popularity in the last few years.  I work on a team that follows functional programming and have found it to be an effective approach for building web applications with React and Redux.  

If you haven't worked in fp before it can take a little while to catch on because you have to think about how you do things differently.  But as I'll show in this article none of the concepts behind functional programming are overly complicated to understand.

Let's dive in.

> “Object-oriented programming makes code understandable by encapsulating moving parts. Functional programming makes code understandable by minimizing moving parts." -Michael Feathers

##What is functional programming?
Let's start by going over the core principles behind the functional programming paradigm.  

1. Don't mutate state.
2. Avoid shared state.
3. Use pure functions with no side effects.

First, state should not be mutated.  One of the issues with OOP is that state can be mutated anywhere which makes it hard to track down unexpected changes in a program.  Rather the idea is that rather than mutating existing objects in state you should use the previous state and pure functions to calculate what the next state will be.

This is the concept that makes Redux's time travel debugging possible.  There can only be one value for state at any given time and stepping backward though actions will show what the state was at every step.

In Javascript don't confuse `const` with immutable.  `const` will prevent you from reassigning a new object reference to that variable, but you can still change the properties of that object.  `Object.freeze` will prevent all the top level properties from being mutated, but if there is an object as a property then that object's properties can still be changed unless you go traverse through and freeze each object property.

I previously wrote [an article on immutability in Javascript so you can read more on that here.](/20180608-immutability-in-javascript/)

Typically if you studied computer science in school you learned heavily in the Object Oriented Programming, but were likely exposed to functional programming as well.  In the past few years functional programming has been growing in popularity and this definitely holds true for the Javascript community.

Next we'll discuss some functional programming tools.

> Simplicity is prerequisite for reliability. -Edsger W. Dijkstra

##Pure Functions
A pure function has no side effects.  So for each input a pure function will give you the exact same result every time.  

The benefit of using pure functions is that they are typically easier to debug as they are predictable in their outcome and simple to read.

Examples of side effects are:
* an xhr call
* changing a variable outside of the function's scope
* console log
* outputting to a file
* calling other functions with side effects

Let's take a look at an example of a function with side effects:
```
const a = 1;
const a1 = () => a += 1;
a1(); 
console.log(a); // 2
a1();
console.log(a); // 3
```

The result of this function will give you a different result each time as every time it is called it continues to increment a because it's operating on a variable that is not an input to itself.

Let's change our example to a pure function.
```
const b = 1;
const b1 = (val) => val += 1;
console.log(b1(b)); // 2
console.log(b1(b)); // 2
```

In this case `b1` will give you the same result every time for any given input you pass into it unlike `a1` which mutates a variable outside of its own scope.  `b1` only operates on the variable that it takes in as an input.

##Higher Order Functions
Higher order functions are functions that can accept another function as a parameter or return another function as a result.  This is how functional programming achieves reusability with a set of reusable utility functions as opposed to *Object Oriented Programming* which locates functions and data together in classes.

Higher order functions are possible in javascript because it has *first class functions*.  Functions can be passed as parameters to other functions, assigned to variables, and returned from other functions.

The array methods `map`, `reduce`, and `filter` are examples of extremely useful and reusable higher order functions.  Once you learn to use these array methods it totally changes the way you write code, because they are fantastic.

Let's  demonstrate what a simple higher order function looks like:
```
const doubleArray = (a) => a.map(i => i * 2);
const reverseArray = (b) => b.reverse();

const compose = (a, b) => (input) => b(a(input));

const input = [1, 2, 3];
console.log(compose(doubleArray, reverseArray)(input)); // [6, 4, 2]
```

Here we define a couple of functions to operate on arrays.  The `compose` functions allow us to combine these two operations and gives us a function as a result.  We then can call that resulting function and pass in our `input` array.

> There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies and the other way is to make it so complicated that there are no obvious deficiencies. — C.A.R. Hoare, The 1980 ACM Turing Award Lecture

##Functional Composition
Functional composition is combining or chaining simple functions to make up more complex functions.  Again, since Javascript has first class functions it makes it easy to apply functions to the results of other functions.

This can be demonstrated using the array map, reduce, and filter methods by chaining them together:
```
const list = [1, 2, 6, 8];

const result = list.map(a => a * 3)
  .filter(b => b > 3)
  .reduce((sum, c) => {
    sum += c;
    return sum;
  });

console.log(result); // 48
```

The result of each function returns a new array and we call the next function in the chain on that resulting array.

Let's go over another example where we combine two simple functions into a single function.
```
const triple = (a) => a * 3;
const minus2 = (b) => b - 2;

const tripleMinus2 = (c) => triple(minus2(c));

console.log(tripleMinus2(5)); // 9
console.log(tripleMinus2(45)); // 129
console.log(tripleMinus2(678)); // 2028
```

These are trivial examples obviously, but in my experience organizing your code into small utility functions makes them easy to reuse and combine with other utility functions.

> The object-oriented version of spaghetti code is, of course, ‘lasagna code’. Too many layers. -Roberto Waltman

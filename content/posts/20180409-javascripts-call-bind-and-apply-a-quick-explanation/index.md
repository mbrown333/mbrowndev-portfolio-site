---
title: JavaScript's call, bind, and apply - A Quick Explanation
date: "2018-04-09T03:20:04Z"
cover: "https://unsplash.it/1280/500/?image=1071"
author: "matthew"
category: "tech"
tags:
    - programming
    - stuff
    - other
---

If you don't use JavaScript's call, bind, and apply regularly you might not be aware of what they do and how to use these native functions. I can remember for the longest time being aware they existed, but not really understanding what they were exactly. Having a good grasp on how these work will give you a deeper understanding of the JavaScript language. And if nothing else these functions tend to be a popular subject of JavaScript interview questions so being aware of how they work can still help you out even if you don't use them regularly. 

Bind, call, and apply are all part of the prototype object for all JavaScript functions. The reason these calls can come in handy is JavaScript's `this`. Let's take a look at some code. When you're calling an object's function and the object is the left of the dot as below then that object will be `this` when the `printPerson` function is called. 

```
(function() { 
  const person = { 
    age: 21, 
    name: 'Bob', 
    printPerson() { 
      console.log(`${this.name} is ${this.age}`); 
      } 
    }; 

    person.printPerson(); // Bob is 21 
})(); 
```

This works fine if you're working with objects in an object oriented fashion where data and functionality are grouped together in the object. If you're using a functional approach then this changes things. If we move the `printPerson` function out of the `person` object and declare it as a function elsewhere then we've lost the ability to use `this` in the function. 

```
(function() { 
  const person = { 
    age: 21, 
    name: 'Bob', 
  }; 
  
  function printPerson() { 
    console.log(`${this.name} is ${this.age}`); 
  } 
  
  printPerson(); // FAILS! 
})();
```

We could change the function to pass in person as a parameter or we can use `call` to specify to the function what the `this` context should be. 

```javascript
(function() { 
  const person = { age: 21, name: 'Bob', }; 
  
  function printPerson() { 
    console.log(`${this.name} is ${this.age}`); 
  } 
  
  printPerson.call(person); // Bob is 21 
})();
``` 

And voila, we passed in the `person` object and our `printPerson` function now knows to use this object as the `this` context. You can also pass parameters in addition to the context with call as below. 

```
(function() { 
  const person = { 
    age: 21, 
    name: 'Bob', 
  };

  function printPerson(city, state) { 
    console.log(`${this.name} is ${this.age} from ${city}, ${state}`); 
  }

  printPerson.call(person, 'Chicago', 'IL'); // Bob is 21 from Chicago, IL 
})();
```

This is the same thing as before just demonstrating that any number of parameters can be passed in after the context. The context is always the first parameter and then all others follow after.

That's the basic idea with call, now what about bind?

Bind is actually pretty much the same as call except the function won't be invoked immediately. It's just a way to defer execution until later. If you've used React this will look familiar to you as bind is often used to bind functions to React Components.

Let's update our code example to use bind this time. 

```
(function() { 
  const person = { 
    age: 21, 
    name: 'Bob', 
  }; 
  const printPersonDeferred = printPerson.bind(person); 
  
  function printPerson() { 
    console.log(`${this.name} is ${this.age}`); 
  } 
  
  printPersonDeferred(); // Bob is 21 
})();
```

And then expand on this to demonstrate parameters. This time we pass the parameters in when we make the deferred execution call rather than at the time bind is called. 

```
(function() { 
  const person = { age: 21, name: 'Bob', }; 
  
  const printPersonDeferred = printPerson.bind(person); 
  
  function printPerson(city, state) { 
    console.log(`${this.name} is ${this.age} from ${city}, ${state}`); 
  } 
  
  printPersonDeferred('Chicago', 'IL'); // Bob is 21 from Chicago, IL 
})();
```

All right we have bind and call down. Let's move on to apply. Apply is practically the same as call except apply requires you to pass in your parameters after the this context as an array. This is how we would need to modify our code to use apply below. 

```
(function() { 
  const person = { age: 21, name: 'Bob', }; 
  
  function printPerson(city, state) { 
    console.log(`${this.name} is ${this.age} from ${city}, ${state}`); 
  } 
  
  printPerson.apply(person, ['Chicago', 'IL']); // Bob is 21 from Chicago, IL 
})();
```

So you see when you use apply JavaScript unpacks your arguments array into the parameter variables of the function you are calling with apply.
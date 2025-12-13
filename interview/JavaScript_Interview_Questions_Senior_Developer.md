# JavaScript Interview Questions & Answers - Senior Developer Guide (10+ Years Experience)

A comprehensive collection of JavaScript interview questions for senior developers, covering fundamentals to advanced concepts, architectural patterns, and real-world coding challenges.

---

## Table of Contents

1. [Basic Level Questions](#basic-level-questions)
2. [Intermediate Level Questions](#intermediate-level-questions)
3. [Advanced Level Questions](#advanced-level-questions)
4. [Coding & Machine Test Questions](#coding--machine-test-questions)

---

## Basic Level Questions

### 1. What are the different data types in JavaScript?

JavaScript has 8 data types divided into two categories:

**Primitive Types (7):**
- `string` - textual data
- `number` - integers and floating-point numbers (including Infinity, -Infinity, NaN)
- `bigint` - integers of arbitrary length (ES2020)
- `boolean` - true or false
- `undefined` - uninitialized variables
- `null` - intentional absence of value
- `symbol` - unique identifiers (ES6)

**Non-Primitive Type (1):**
- `object` - collections of key-value pairs (includes arrays, functions, dates, etc.)

```javascript
typeof "hello"      // "string"
typeof 42           // "number"
typeof 42n          // "bigint"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object" (historical bug)
typeof Symbol()     // "symbol"
typeof {}           // "object"
typeof []           // "object"
typeof function(){} // "function" (special case)
```

### 2. Explain the difference between `==` and `===`

`==` (loose equality) performs type coercion before comparison, while `===` (strict equality) compares both value and type without coercion.

```javascript
// Loose equality (==) - type coercion
5 == "5"          // true (string converted to number)
0 == false        // true (false converted to 0)
null == undefined // true (special case)
"" == 0           // true (empty string to 0)

// Strict equality (===) - no coercion
5 === "5"          // false (different types)
0 === false        // false
null === undefined // false
"" === 0           // false

// Best practice: Always use === unless you specifically need type coercion
```

### 3. What is hoisting in JavaScript?

Hoisting is JavaScript's default behavior of moving declarations to the top of their scope during the compilation phase. Only declarations are hoisted, not initializations.

```javascript
// Variable hoisting
console.log(x); // undefined (declaration hoisted, not initialization)
var x = 5;

// Function declaration hoisting
sayHello(); // "Hello!" (entire function is hoisted)
function sayHello() {
    console.log("Hello!");
}

// let and const - hoisted but not initialized (Temporal Dead Zone)
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 10;

// Function expressions are NOT hoisted
greet(); // TypeError: greet is not a function
var greet = function() {
    console.log("Hi!");
};
```

### 4. Explain `var`, `let`, and `const` differences

```javascript
// var - function scoped, hoisted, can be redeclared
function varExample() {
    var x = 1;
    if (true) {
        var x = 2; // Same variable
        console.log(x); // 2
    }
    console.log(x); // 2
}

// let - block scoped, hoisted (TDZ), cannot be redeclared
function letExample() {
    let x = 1;
    if (true) {
        let x = 2; // Different variable
        console.log(x); // 2
    }
    console.log(x); // 1
}

// const - block scoped, must be initialized, cannot be reassigned
const PI = 3.14159;
PI = 3; // TypeError: Assignment to constant variable

// const with objects - reference is constant, not the content
const obj = { name: "John" };
obj.name = "Jane"; // Allowed
obj = {};          // TypeError
```

### 5. What is the difference between `null` and `undefined`?

```javascript
// undefined - variable declared but not assigned
let a;
console.log(a); // undefined

// null - intentional absence of value
let b = null;
console.log(b); // null

// Type differences
typeof undefined // "undefined"
typeof null      // "object" (historical bug)

// Equality
null == undefined  // true (loose equality)
null === undefined // false (strict equality)

// Use cases
// undefined: missing function parameters, uninitialized variables
// null: explicitly empty value, clearing object references

function greet(name) {
    console.log(name); // undefined if no argument passed
}

let user = { name: "John" };
user = null; // Explicitly clearing the reference
```

### 6. Explain JavaScript scope (Global, Function, Block)

```javascript
// Global scope - accessible everywhere
var globalVar = "I'm global";
let globalLet = "I'm also global";

function demonstrateScope() {
    // Function scope - accessible within function
    var functionVar = "I'm function scoped";
    
    if (true) {
        // Block scope - accessible within block
        let blockLet = "I'm block scoped";
        const blockConst = "I'm also block scoped";
        var notBlockScoped = "I'm function scoped, not block!";
        
        console.log(blockLet);      // Works
        console.log(functionVar);   // Works
        console.log(globalVar);     // Works
    }
    
    console.log(notBlockScoped);    // Works (var is function scoped)
    console.log(blockLet);          // ReferenceError
}

// Scope chain - inner scopes can access outer scopes
const outer = "outer";
function outerFn() {
    const middle = "middle";
    function innerFn() {
        const inner = "inner";
        console.log(outer, middle, inner); // All accessible
    }
    innerFn();
}
```

### 7. What is the Temporal Dead Zone (TDZ)?

The TDZ is the period between entering a scope and the point where a variable is declared, during which `let` and `const` variables cannot be accessed.

```javascript
// TDZ example
{
    // TDZ starts here for myVar
    console.log(myVar); // ReferenceError: Cannot access 'myVar' before initialization
    
    let myVar = "Hello"; // TDZ ends here
    console.log(myVar);  // "Hello"
}

// Why TDZ exists?
// 1. Catches programming errors (using variables before declaration)
// 2. Makes code more predictable
// 3. Helps with const (must be initialized at declaration)

// TDZ with function parameters
function example(a = b, b = 1) { } // ReferenceError: b is in TDZ
function correct(a = 1, b = a) { } // Works: a is already initialized
```

### 8. Explain truthy and falsy values

```javascript
// Falsy values (8 total) - evaluate to false in boolean context
false
0
-0
0n        // BigInt zero
""        // Empty string
null
undefined
NaN

// Everything else is truthy, including:
true
42
"0"       // Non-empty string (even "0" or "false")
"false"
[]        // Empty array
{}        // Empty object
function() {}

// Practical usage
const value = "";
if (value) {
    console.log("Truthy");
} else {
    console.log("Falsy"); // This runs
}

// Common patterns
const name = userName || "Guest";           // Logical OR fallback
const count = items?.length ?? 0;           // Nullish coalescing
const isValid = !!value;                    // Convert to boolean
```

### 9. What are template literals?

```javascript
// Basic syntax with backticks
const name = "John";
const greeting = `Hello, ${name}!`; // "Hello, John!"

// Multi-line strings
const multiLine = `
    This is line 1
    This is line 2
    This is line 3
`;

// Expression interpolation
const a = 10, b = 20;
console.log(`Sum: ${a + b}`);           // "Sum: 30"
console.log(`Is even: ${a % 2 === 0}`); // "Is even: true"

// Nested templates
const items = ["apple", "banana"];
const list = `Items: ${items.map(i => `<li>${i}</li>`).join("")}`;

// Tagged templates
function highlight(strings, ...values) {
    return strings.reduce((acc, str, i) => 
        acc + str + (values[i] ? `<mark>${values[i]}</mark>` : ""), "");
}

const user = "Alice";
const action = "logged in";
highlight`User ${user} has ${action}`; 
// "User <mark>Alice</mark> has <mark>logged in</mark>"
```

### 10. Explain the spread operator and rest parameters

```javascript
// Spread operator (...) - expands iterables
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Use cases
Math.max(...arr1);              // 3
const copy = [...arr1];         // Shallow copy
const merged = {...obj1, ...obj2}; // Merge objects

// Rest parameters - collects remaining arguments
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

function logFirst(first, ...rest) {
    console.log(first); // 1
    console.log(rest);  // [2, 3, 4]
}

// Destructuring with rest
const [head, ...tail] = [1, 2, 3, 4];
// head = 1, tail = [2, 3, 4]

const { name, ...others } = { name: "John", age: 30, city: "NYC" };
// name = "John", others = { age: 30, city: "NYC" }
```

### 11. What is destructuring in JavaScript?

```javascript
// Array destructuring
const [a, b, c] = [1, 2, 3];
const [first, , third] = [1, 2, 3]; // Skip elements
const [x = 10] = []; // Default values

// Swapping variables
let m = 1, n = 2;
[m, n] = [n, m];

// Object destructuring
const person = { name: "John", age: 30, city: "NYC" };
const { name, age } = person;
const { name: userName } = person; // Rename
const { country = "USA" } = person; // Default value

// Nested destructuring
const user = {
    id: 1,
    profile: {
        firstName: "John",
        address: { city: "NYC" }
    }
};
const { profile: { firstName, address: { city } } } = user;

// Function parameter destructuring
function greet({ name, age = 18 }) {
    console.log(`${name} is ${age}`);
}
greet({ name: "Alice" });

// Combined with rest
const { a: first, ...remaining } = { a: 1, b: 2, c: 3 };
```

### 12. Explain `this` keyword in different contexts

```javascript
// Global context
console.log(this); // Window (browser) or global (Node.js)

// Object method
const obj = {
    name: "John",
    greet() {
        console.log(this.name); // "John" - this refers to obj
    }
};

// Regular function (non-strict mode)
function regularFunc() {
    console.log(this); // Window/global
}

// Regular function (strict mode)
"use strict";
function strictFunc() {
    console.log(this); // undefined
}

// Arrow function - lexically bound, inherits from enclosing scope
const obj2 = {
    name: "Jane",
    greet: () => {
        console.log(this.name); // undefined (this is from enclosing scope)
    },
    delayedGreet() {
        setTimeout(() => {
            console.log(this.name); // "Jane" (arrow inherits from method)
        }, 100);
    }
};

// Constructor function
function Person(name) {
    this.name = name; // this refers to new instance
}

// Class
class Animal {
    constructor(name) {
        this.name = name; // this refers to instance
    }
}

// Event handlers
button.addEventListener("click", function() {
    console.log(this); // The button element
});
```

### 13. What are arrow functions and their limitations?

```javascript
// Arrow function syntax
const add = (a, b) => a + b;
const square = x => x * x;          // Single param: no parens needed
const greet = () => "Hello";        // No params: empty parens
const getObj = () => ({ a: 1 });    // Return object: wrap in parens

// Multi-line with explicit return
const process = (x) => {
    const result = x * 2;
    return result + 1;
};

// Limitations of arrow functions:

// 1. No own 'this' binding
const obj = {
    value: 42,
    getValue: () => this.value // undefined (doesn't bind to obj)
};

// 2. Cannot be used as constructors
const Foo = () => {};
new Foo(); // TypeError: Foo is not a constructor

// 3. No 'arguments' object
const func = () => {
    console.log(arguments); // ReferenceError
};

// Use rest parameters instead
const func2 = (...args) => {
    console.log(args);
};

// 4. No 'prototype' property
const Arrow = () => {};
console.log(Arrow.prototype); // undefined

// 5. Cannot be used as generators
const gen = *() => {}; // SyntaxError

// 6. Not suitable for methods that need 'this'
const calculator = {
    value: 0,
    // Bad
    add: (n) => { this.value += n; },
    // Good
    subtract(n) { this.value -= n; }
};
```

### 14. Explain call, apply, and bind methods

```javascript
const person = {
    name: "John"
};

function greet(greeting, punctuation) {
    console.log(`${greeting}, ${this.name}${punctuation}`);
}

// call - invokes function with given 'this' and arguments individually
greet.call(person, "Hello", "!"); // "Hello, John!"

// apply - same as call but arguments as array
greet.apply(person, ["Hi", "?"]); // "Hi, John?"

// bind - returns new function with bound 'this' (doesn't invoke immediately)
const boundGreet = greet.bind(person);
boundGreet("Hey", "."); // "Hey, John."

// Partial application with bind
const sayHelloTo = greet.bind(person, "Hello");
sayHelloTo("!!!"); // "Hello, John!!!"

// Common use cases

// 1. Borrowing methods
const numbers = { 0: 1, 1: 2, 2: 3, length: 3 };
const arr = Array.prototype.slice.call(numbers); // [1, 2, 3]

// 2. Finding max in array
Math.max.apply(null, [1, 2, 3]); // 3
// Modern: Math.max(...[1, 2, 3])

// 3. Preserving 'this' in callbacks
class Counter {
    constructor() {
        this.count = 0;
        this.increment = this.increment.bind(this);
    }
    increment() {
        this.count++;
    }
}
```

### 15. What is the prototype chain?

```javascript
// Every object has an internal [[Prototype]] link
const obj = { a: 1 };
console.log(obj.__proto__ === Object.prototype); // true

// Prototype chain lookup
const animal = {
    eats: true,
    walk() { console.log("Walking"); }
};

const rabbit = {
    jumps: true,
    __proto__: animal // or Object.setPrototypeOf(rabbit, animal)
};

console.log(rabbit.eats);  // true (found in prototype)
console.log(rabbit.jumps); // true (own property)
rabbit.walk();             // "Walking" (inherited method)

// Constructor function prototype
function Person(name) {
    this.name = name;
}
Person.prototype.greet = function() {
    return `Hello, ${this.name}`;
};

const john = new Person("John");
john.greet(); // "Hello, John"

// Prototype chain:
// john -> Person.prototype -> Object.prototype -> null

// Checking prototype
console.log(john.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true

// hasOwnProperty vs in
console.log(john.hasOwnProperty("name"));  // true
console.log(john.hasOwnProperty("greet")); // false
console.log("greet" in john);              // true
```

### 16. Explain Object.create() and prototypal inheritance

```javascript
// Object.create() creates object with specified prototype
const personProto = {
    greet() {
        return `Hello, I'm ${this.name}`;
    },
    introduce() {
        return `${this.name}, ${this.age} years old`;
    }
};

const john = Object.create(personProto);
john.name = "John";
john.age = 30;
john.greet(); // "Hello, I'm John"

// With property descriptors
const jane = Object.create(personProto, {
    name: { value: "Jane", writable: true, enumerable: true },
    age: { value: 25, writable: true, enumerable: true }
});

// Object.create(null) - no prototype (pure dictionary)
const dict = Object.create(null);
dict.hasOwnProperty = "value"; // Safe! No inherited methods

// Inheritance chain
const employeeProto = Object.create(personProto);
employeeProto.work = function() {
    return `${this.name} is working`;
};

const emp = Object.create(employeeProto);
emp.name = "Bob";
emp.greet(); // Works (inherited from personProto)
emp.work();  // Works (inherited from employeeProto)

// Modern class syntax (syntactic sugar over prototypes)
class Person {
    constructor(name) {
        this.name = name;
    }
    greet() {
        return `Hello, ${this.name}`;
    }
}

class Employee extends Person {
    constructor(name, role) {
        super(name);
        this.role = role;
    }
}
```

### 17. What are JavaScript modules (ES6)?

```javascript
// Named exports
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { }

// Named imports
import { PI, add, Calculator } from './math.js';
import { add as sum } from './math.js'; // Rename
import * as MathUtils from './math.js'; // Import all

// Default export (one per module)
// logger.js
export default class Logger {
    log(msg) { console.log(msg); }
}

// Default import
import Logger from './logger.js';
import MyLogger from './logger.js'; // Can use any name

// Mixed exports
// utils.js
export const VERSION = "1.0";
export default function main() { }

import main, { VERSION } from './utils.js';

// Dynamic imports (code splitting)
async function loadModule() {
    const module = await import('./heavy-module.js');
    module.doSomething();
}

// Or with .then()
import('./module.js').then(module => {
    module.default();
});

// Re-exporting
export { add, PI } from './math.js';
export { default as Logger } from './logger.js';
export * from './utils.js';
```

### 18. Explain the event loop

```javascript
// JavaScript is single-threaded but non-blocking via event loop

// Components:
// 1. Call Stack - executes code (LIFO)
// 2. Web APIs - handles async operations (setTimeout, fetch, DOM events)
// 3. Callback Queue (Task Queue) - holds callbacks ready to execute
// 4. Microtask Queue - holds promise callbacks (higher priority)
// 5. Event Loop - moves callbacks from queues to call stack

console.log("1"); // Sync - Call Stack

setTimeout(() => console.log("2"), 0); // Macro task - Callback Queue

Promise.resolve().then(() => console.log("3")); // Micro task - Microtask Queue

console.log("4"); // Sync - Call Stack

// Output: 1, 4, 3, 2
// Explanation:
// 1. Sync code runs first (1, 4)
// 2. Microtasks run before macrotasks (3)
// 3. Macrotasks run last (2)

// More complex example
console.log("Start");

setTimeout(() => console.log("Timeout 1"), 0);
setTimeout(() => console.log("Timeout 2"), 0);

Promise.resolve()
    .then(() => console.log("Promise 1"))
    .then(() => console.log("Promise 2"));

console.log("End");

// Output: Start, End, Promise 1, Promise 2, Timeout 1, Timeout 2
```

### 19. What is the difference between synchronous and asynchronous code?

```javascript
// Synchronous - blocks execution until complete
console.log("First");
console.log("Second");
console.log("Third");
// Output: First, Second, Third (in order)

// Asynchronous - doesn't block, continues execution
console.log("First");
setTimeout(() => console.log("Second"), 1000);
console.log("Third");
// Output: First, Third, Second

// Common async patterns:

// 1. Callbacks
function fetchData(callback) {
    setTimeout(() => {
        callback({ data: "result" });
    }, 1000);
}

// 2. Promises
function fetchDataPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve({ data: "result" }), 1000);
    });
}

// 3. Async/await
async function getData() {
    const result = await fetchDataPromise();
    return result;
}

// Async operations in JavaScript:
// - setTimeout/setInterval
// - fetch/XMLHttpRequest
// - File I/O (Node.js)
// - Database operations
// - Event handlers
```

### 20. Explain JSON and its methods

```javascript
// JSON - JavaScript Object Notation

// JSON.stringify() - Object to JSON string
const obj = { 
    name: "John", 
    age: 30,
    hobbies: ["reading", "coding"],
    address: { city: "NYC" }
};

const jsonString = JSON.stringify(obj);
// '{"name":"John","age":30,"hobbies":["reading","coding"],"address":{"city":"NYC"}}'

// With formatting
JSON.stringify(obj, null, 2); // 2-space indentation

// With replacer (filter/transform)
JSON.stringify(obj, ["name", "age"]); // Only include these keys
JSON.stringify(obj, (key, value) => {
    if (key === "age") return undefined; // Exclude
    return value;
});

// JSON.parse() - JSON string to Object
const parsed = JSON.parse(jsonString);

// With reviver (transform values)
JSON.parse(jsonString, (key, value) => {
    if (key === "age") return value + 1;
    return value;
});

// Limitations of JSON:
// - No functions, undefined, Symbol
// - No circular references
// - Dates become strings
// - No comments

const problematic = {
    fn: function() {},     // Ignored
    undef: undefined,      // Ignored
    sym: Symbol("id"),     // Ignored
    date: new Date()       // Becomes string
};
```

### 21. What are Map and Set in JavaScript?

```javascript
// Map - key-value pairs with any key type
const map = new Map();

map.set("string", "value1");
map.set(42, "value2");
map.set({ id: 1 }, "value3");

map.get("string"); // "value1"
map.has(42);       // true
map.size;          // 3
map.delete("string");
map.clear();

// Map from array of pairs
const map2 = new Map([
    ["a", 1],
    ["b", 2]
]);

// Iteration
for (const [key, value] of map2) {
    console.log(key, value);
}
map2.forEach((value, key) => console.log(key, value));
[...map2.keys()];   // ["a", "b"]
[...map2.values()]; // [1, 2]
[...map2.entries()]; // [["a", 1], ["b", 2]]

// Set - unique values
const set = new Set([1, 2, 3, 3, 3]); // {1, 2, 3}

set.add(4);
set.has(3);    // true
set.size;      // 4
set.delete(1);
set.clear();

// Use cases
// 1. Remove duplicates from array
const unique = [...new Set([1, 2, 2, 3, 3])]; // [1, 2, 3]

// 2. Fast lookup
const allowed = new Set(["admin", "user", "moderator"]);
allowed.has(role);

// WeakMap and WeakSet - garbage collection friendly
const weakMap = new WeakMap(); // Only object keys, garbage collected
const weakSet = new WeakSet(); // Only objects, garbage collected
```

### 22. Explain `for...in` vs `for...of`

```javascript
// for...in - iterates over enumerable property KEYS (including inherited)
const obj = { a: 1, b: 2, c: 3 };
for (const key in obj) {
    console.log(key);       // "a", "b", "c"
    console.log(obj[key]);  // 1, 2, 3
}

// for...of - iterates over iterable VALUES (arrays, strings, maps, sets)
const arr = ["x", "y", "z"];
for (const value of arr) {
    console.log(value); // "x", "y", "z"
}

// Key differences:
const array = ["a", "b"];
array.extra = "c";

for (const i in array) {
    console.log(i); // "0", "1", "extra" (includes non-index properties)
}

for (const v of array) {
    console.log(v); // "a", "b" (only values)
}

// for...in with objects (common use)
for (const key in obj) {
    if (obj.hasOwnProperty(key)) { // Filter out inherited
        console.log(key, obj[key]);
    }
}

// for...of with entries
for (const [index, value] of arr.entries()) {
    console.log(index, value);
}

// Iterating over strings
for (const char of "hello") {
    console.log(char); // "h", "e", "l", "l", "o"
}

// for...of with Map
const map = new Map([["a", 1], ["b", 2]]);
for (const [key, value] of map) {
    console.log(key, value);
}
```

### 23. What are higher-order functions?

```javascript
// Higher-order functions either:
// 1. Take functions as arguments, or
// 2. Return functions

// Taking function as argument
function executeOperation(a, b, operation) {
    return operation(a, b);
}
executeOperation(5, 3, (x, y) => x + y); // 8

// Returning a function
function multiplier(factor) {
    return function(number) {
        return number * factor;
    };
}
const double = multiplier(2);
double(5); // 10

// Built-in higher-order functions
const numbers = [1, 2, 3, 4, 5];

// map - transform each element
numbers.map(n => n * 2); // [2, 4, 6, 8, 10]

// filter - select elements
numbers.filter(n => n > 2); // [3, 4, 5]

// reduce - accumulate to single value
numbers.reduce((acc, n) => acc + n, 0); // 15

// find - first matching element
numbers.find(n => n > 3); // 4

// some - at least one matches
numbers.some(n => n > 4); // true

// every - all match
numbers.every(n => n > 0); // true

// forEach - iterate without returning
numbers.forEach(n => console.log(n));

// Chaining
numbers
    .filter(n => n > 2)
    .map(n => n * 2)
    .reduce((acc, n) => acc + n, 0); // 24
```

### 24. Explain the difference between `Object.keys()`, `Object.values()`, and `Object.entries()`

```javascript
const person = {
    name: "John",
    age: 30,
    city: "NYC"
};

// Object.keys() - array of keys
Object.keys(person); // ["name", "age", "city"]

// Object.values() - array of values
Object.values(person); // ["John", 30, "NYC"]

// Object.entries() - array of [key, value] pairs
Object.entries(person); // [["name", "John"], ["age", 30], ["city", "NYC"]]

// Common use cases

// 1. Iterate over object
Object.entries(person).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
});

// 2. Transform object
const doubled = Object.fromEntries(
    Object.entries({ a: 1, b: 2 }).map(([k, v]) => [k, v * 2])
); // { a: 2, b: 4 }

// 3. Filter object
const filtered = Object.fromEntries(
    Object.entries(person).filter(([k, v]) => typeof v === "string")
); // { name: "John", city: "NYC" }

// 4. Check if object is empty
Object.keys(person).length === 0; // false

// 5. Get property count
Object.keys(person).length; // 3

// Note: Only enumerable own properties
const obj = Object.create({ inherited: true });
obj.own = "value";
Object.keys(obj); // ["own"] - doesn't include inherited
```

### 25. What is optional chaining and nullish coalescing?

```javascript
// Optional chaining (?.) - safely access nested properties
const user = {
    name: "John",
    address: {
        city: "NYC"
    }
};

// Without optional chaining
const zip = user && user.address && user.address.zip; // undefined

// With optional chaining
const zip2 = user?.address?.zip; // undefined (no error)

// With arrays
const arr = [1, 2, 3];
arr?.[5]; // undefined

// With function calls
const obj = {
    method: () => "result"
};
obj.method?.();     // "result"
obj.nonExistent?.(); // undefined (no error)

// Nullish coalescing (??) - default for null/undefined only
const value = null ?? "default";     // "default"
const value2 = undefined ?? "default"; // "default"
const value3 = 0 ?? "default";       // 0 (not nullish)
const value4 = "" ?? "default";      // "" (not nullish)
const value5 = false ?? "default";   // false (not nullish)

// Compare with ||
const a = 0 || "default";  // "default" (0 is falsy)
const b = 0 ?? "default";  // 0 (0 is not nullish)

// Combining both
const city = user?.address?.city ?? "Unknown";

// Assignment operator
let x;
x ??= "default"; // x = "default" (only if null/undefined)
```

---

## Intermediate Level Questions

### 26. What are closures in JavaScript?

```javascript
// A closure is a function that has access to variables from its outer 
// (enclosing) scope, even after the outer function has returned

function createCounter() {
    let count = 0; // Private variable
    
    return {
        increment() { return ++count; },
        decrement() { return --count; },
        getCount() { return count; }
    };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
// count is not accessible directly, but the methods have closure over it

// Practical use cases:

// 1. Data privacy / encapsulation
function createBankAccount(initialBalance) {
    let balance = initialBalance;
    
    return {
        deposit(amount) { balance += amount; },
        withdraw(amount) { 
            if (amount <= balance) balance -= amount;
        },
        getBalance() { return balance; }
    };
}

// 2. Function factories
function createMultiplier(multiplier) {
    return function(number) {
        return number * multiplier;
    };
}
const double = createMultiplier(2);
const triple = createMultiplier(3);
double(5);  // 10
triple(5);  // 15

// 3. Memoization
function memoize(fn) {
    const cache = {};
    return function(...args) {
        const key = JSON.stringify(args);
        if (!(key in cache)) {
            cache[key] = fn.apply(this, args);
        }
        return cache[key];
    };
}

// 4. Module pattern
const Module = (function() {
    let privateVar = "I'm private";
    
    function privateMethod() {
        return privateVar;
    }
    
    return {
        publicMethod() {
            return privateMethod();
        }
    };
})();
```

### 27. What are Promises?

```javascript
// Promise represents eventual completion/failure of async operation

// Creating a Promise
const promise = new Promise((resolve, reject) => {
    const success = true;
    
    if (success) {
        resolve("Operation succeeded");
    } else {
        reject(new Error("Operation failed"));
    }
});

// Consuming Promises
promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("Cleanup"));

// Promise states:
// 1. Pending - initial state
// 2. Fulfilled - operation completed successfully
// 3. Rejected - operation failed

// Chaining
fetchUser(userId)
    .then(user => fetchPosts(user.id))
    .then(posts => fetchComments(posts[0].id))
    .then(comments => console.log(comments))
    .catch(error => console.error("Error:", error));

// Promise static methods
// Promise.all - all must succeed
Promise.all([promise1, promise2, promise3])
    .then(([result1, result2, result3]) => {});

// Promise.allSettled - wait for all, regardless of success/failure
Promise.allSettled([promise1, promise2])
    .then(results => {
        results.forEach(result => {
            if (result.status === "fulfilled") {
                console.log(result.value);
            } else {
                console.log(result.reason);
            }
        });
    });

// Promise.race - first to settle (resolve or reject)
Promise.race([promise1, promise2])
    .then(firstResult => {});

// Promise.any - first to fulfill (ignores rejections)
Promise.any([promise1, promise2])
    .then(firstSuccess => {});

// Promise.resolve / Promise.reject
Promise.resolve(42);
Promise.reject(new Error("Failed"));
```

### 28. Explain async/await

```javascript
// async/await is syntactic sugar over Promises

// async function always returns a Promise
async function fetchData() {
    return "data"; // Wrapped in Promise.resolve()
}
fetchData().then(data => console.log(data)); // "data"

// await pauses execution until Promise settles
async function getUser(id) {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
}

// Error handling with try/catch
async function getUserSafe(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error("User not found");
        return await response.json();
    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}

// Parallel execution
async function fetchAll() {
    // Sequential (slower)
    const user = await fetchUser();
    const posts = await fetchPosts();
    
    // Parallel (faster)
    const [user2, posts2] = await Promise.all([
        fetchUser(),
        fetchPosts()
    ]);
}

// await in loops
async function processItems(items) {
    // Sequential processing
    for (const item of items) {
        await processItem(item);
    }
    
    // Parallel processing
    await Promise.all(items.map(item => processItem(item)));
}

// Top-level await (ES2022, in modules)
const config = await loadConfig();

// async arrow functions
const getData = async () => {
    const result = await fetch("/api/data");
    return result.json();
};

// async methods
class DataService {
    async fetchData() {
        return await fetch("/api/data");
    }
}
```

### 29. What is event bubbling and capturing?

```javascript
// Event propagation has 3 phases:
// 1. Capturing phase - event goes down from window to target
// 2. Target phase - event reaches target element
// 3. Bubbling phase - event bubbles up from target to window

// HTML structure:
// <div id="grandparent">
//   <div id="parent">
//     <button id="child">Click me</button>
//   </div>
// </div>

// Event bubbling (default)
document.getElementById("child").addEventListener("click", () => {
    console.log("Child clicked");
});

document.getElementById("parent").addEventListener("click", () => {
    console.log("Parent clicked"); // Also fires when child is clicked
});

// Event capturing (third parameter = true)
document.getElementById("parent").addEventListener("click", () => {
    console.log("Parent capturing");
}, true); // Fires BEFORE child handler

// Order when clicking child:
// 1. Parent capturing
// 2. Child
// 3. Parent bubbling (default)

// Stop propagation
element.addEventListener("click", (e) => {
    e.stopPropagation(); // Stops bubbling/capturing
});

// Stop immediate propagation
element.addEventListener("click", (e) => {
    e.stopImmediatePropagation(); // Stops other handlers on same element too
});

// Prevent default behavior
link.addEventListener("click", (e) => {
    e.preventDefault(); // Prevents navigation
});

// Event delegation (leveraging bubbling)
document.getElementById("parent").addEventListener("click", (e) => {
    if (e.target.matches("button")) {
        console.log("Button clicked:", e.target.textContent);
    }
});
```

### 30. Explain event delegation

```javascript
// Event delegation uses bubbling to handle events on parent element
// Benefits: memory efficient, works with dynamic elements

// Without delegation (bad for many elements)
document.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", handleClick);
});

// With delegation (good)
document.getElementById("list").addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
        handleClick(e);
    }
});

// Practical example: Todo list
const todoList = document.getElementById("todos");

todoList.addEventListener("click", (e) => {
    const target = e.target;
    
    // Handle different actions
    if (target.classList.contains("delete-btn")) {
        const todoItem = target.closest(".todo-item");
        todoItem.remove();
    }
    
    if (target.classList.contains("checkbox")) {
        const todoItem = target.closest(".todo-item");
        todoItem.classList.toggle("completed");
    }
});

// Dynamic elements work automatically
function addTodo(text) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.innerHTML = `
        <input type="checkbox" class="checkbox">
        <span>${text}</span>
        <button class="delete-btn">Delete</button>
    `;
    todoList.appendChild(li);
    // No need to add event listeners - delegation handles it
}

// Using matches() for more specific targeting
container.addEventListener("click", (e) => {
    if (e.target.matches("button.primary")) {
        handlePrimaryButton(e);
    } else if (e.target.matches("button.secondary")) {
        handleSecondaryButton(e);
    }
});

// Using closest() for nested elements
container.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) {
        handleCardClick(card);
    }
});
```

### 31. What is debouncing and throttling?

```javascript
// Debouncing - delays execution until after a pause in calls
// Use case: search input, resize handler

function debounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Usage
const debouncedSearch = debounce((query) => {
    console.log("Searching:", query);
}, 300);

input.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
});

// Throttling - limits execution to once per time period
// Use case: scroll handler, mousemove

function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Usage
const throttledScroll = throttle(() => {
    console.log("Scroll position:", window.scrollY);
}, 100);

window.addEventListener("scroll", throttledScroll);

// Advanced debounce with leading/trailing options
function advancedDebounce(func, delay, { leading = false, trailing = true } = {}) {
    let timeoutId;
    let lastArgs;
    
    return function(...args) {
        lastArgs = args;
        
        if (!timeoutId && leading) {
            func.apply(this, args);
        }
        
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            if (trailing && lastArgs) {
                func.apply(this, lastArgs);
            }
            timeoutId = null;
        }, delay);
    };
}

// Throttle with trailing call
function throttleWithTrailing(func, limit) {
    let lastArgs;
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            
            setTimeout(() => {
                inThrottle = false;
                if (lastArgs) {
                    func.apply(this, lastArgs);
                    lastArgs = null;
                }
            }, limit);
        } else {
            lastArgs = args;
        }
    };
}
```

### 32. Explain shallow copy vs deep copy

```javascript
// Shallow copy - copies only first level, nested objects share reference

// Shallow copy methods
const original = { a: 1, nested: { b: 2 } };

const shallow1 = { ...original };
const shallow2 = Object.assign({}, original);
const shallow3 = Array.isArray(original) ? [...original] : null;

shallow1.a = 100;           // Doesn't affect original
shallow1.nested.b = 200;    // DOES affect original!
console.log(original.nested.b); // 200

// Deep copy - copies all levels recursively

// Method 1: JSON (limited - no functions, dates, undefined, circular refs)
const deep1 = JSON.parse(JSON.stringify(original));

// Method 2: structuredClone (modern, handles more types)
const deep2 = structuredClone(original);

// Method 3: Custom recursive function
function deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    if (Array.isArray(obj)) return obj.map(item => deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

// Method 4: Lodash
// _.cloneDeep(original);

// Comparison
const test = { 
    arr: [1, 2], 
    obj: { x: 1 },
    date: new Date(),
    func: () => "hello"
};

const jsonCopy = JSON.parse(JSON.stringify(test));
// jsonCopy.date is string, jsonCopy.func is undefined

const structuredCopy = structuredClone(test);
// structuredCopy.date is Date, but func throws error (can't clone functions)
```

### 33. What are getters and setters?

```javascript
// Getters and setters allow controlled access to object properties

const person = {
    firstName: "John",
    lastName: "Doe",
    
    // Getter
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    },
    
    // Setter
    set fullName(value) {
        const parts = value.split(" ");
        this.firstName = parts[0];
        this.lastName = parts[1];
    }
};

console.log(person.fullName); // "John Doe" (getter called)
person.fullName = "Jane Smith"; // Setter called
console.log(person.firstName); // "Jane"

// Using Object.defineProperty
const user = { _age: 0 };

Object.defineProperty(user, "age", {
    get() {
        return this._age;
    },
    set(value) {
        if (value < 0) throw new Error("Age cannot be negative");
        this._age = value;
    },
    enumerable: true,
    configurable: true
});

// In classes
class Circle {
    constructor(radius) {
        this._radius = radius;
    }
    
    get radius() {
        return this._radius;
    }
    
    set radius(value) {
        if (value <= 0) throw new Error("Radius must be positive");
        this._radius = value;
    }
    
    get area() {
        return Math.PI * this._radius ** 2;
    }
    
    get diameter() {
        return this._radius * 2;
    }
}

const circle = new Circle(5);
console.log(circle.area);     // 78.54...
console.log(circle.diameter); // 10
circle.radius = 10;
console.log(circle.area);     // 314.16...

// Use cases:
// 1. Computed properties
// 2. Data validation
// 3. Lazy evaluation
// 4. Encapsulation
// 5. Property watching/logging
```

### 34. Explain the Proxy object

```javascript
// Proxy wraps an object and intercepts operations on it

const target = {
    message: "Hello"
};

const handler = {
    get(target, property, receiver) {
        console.log(`Getting ${property}`);
        return Reflect.get(target, property, receiver);
    },
    
    set(target, property, value, receiver) {
        console.log(`Setting ${property} to ${value}`);
        return Reflect.set(target, property, value, receiver);
    }
};

const proxy = new Proxy(target, handler);
proxy.message;         // Logs: "Getting message"
proxy.message = "Hi";  // Logs: "Setting message to Hi"

// Available traps:
// get, set, has, deleteProperty, apply, construct,
// getOwnPropertyDescriptor, defineProperty, getPrototypeOf,
// setPrototypeOf, isExtensible, preventExtensions, ownKeys

// Practical examples:

// 1. Validation
const validator = {
    set(obj, prop, value) {
        if (prop === "age" && typeof value !== "number") {
            throw new TypeError("Age must be a number");
        }
        if (prop === "age" && value < 0) {
            throw new RangeError("Age must be positive");
        }
        obj[prop] = value;
        return true;
    }
};

const person = new Proxy({}, validator);
person.age = 25;  // OK
person.age = -5;  // RangeError

// 2. Default values
const withDefaults = new Proxy({}, {
    get(target, property) {
        return property in target ? target[property] : "Not found";
    }
});

// 3. Negative array indices
const negativeArray = (arr) => new Proxy(arr, {
    get(target, prop) {
        const index = Number(prop);
        if (index < 0) {
            return target[target.length + index];
        }
        return target[prop];
    }
});

const arr = negativeArray([1, 2, 3, 4, 5]);
arr[-1]; // 5
arr[-2]; // 4

// 4. Observable/Reactive objects
function makeReactive(obj, onChange) {
    return new Proxy(obj, {
        set(target, property, value) {
            const oldValue = target[property];
            target[property] = value;
            onChange(property, value, oldValue);
            return true;
        }
    });
}
```

### 35. What is the Reflect API?

```javascript
// Reflect provides methods for interceptable JavaScript operations
// Often used with Proxy for proper behavior

// Reflect.get - like obj[key]
const obj = { x: 1, y: 2 };
Reflect.get(obj, "x"); // 1

// Reflect.set - like obj[key] = value
Reflect.set(obj, "z", 3); // true
console.log(obj.z); // 3

// Reflect.has - like 'key' in obj
Reflect.has(obj, "x"); // true

// Reflect.deleteProperty - like delete obj[key]
Reflect.deleteProperty(obj, "x"); // true

// Reflect.ownKeys - all own keys (including symbols)
Reflect.ownKeys(obj); // ["y", "z"]

// Reflect.apply - like func.apply()
function greet(greeting) {
    return `${greeting}, ${this.name}`;
}
Reflect.apply(greet, { name: "John" }, ["Hello"]); // "Hello, John"

// Reflect.construct - like new Constructor()
class Person {
    constructor(name) {
        this.name = name;
    }
}
const person = Reflect.construct(Person, ["John"]);

// Why use Reflect with Proxy?
const handler = {
    get(target, property, receiver) {
        // Using Reflect ensures proper 'this' binding
        return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
        // Returns boolean indicating success
        return Reflect.set(target, property, value, receiver);
    }
};

// Benefits of Reflect:
// 1. Functional alternatives to imperative operations
// 2. Proper return values (booleans instead of throwing)
// 3. Works correctly with Proxy receivers
// 4. Single namespace for object operations
```

### 36. Explain Symbol and its use cases

```javascript
// Symbol is a primitive type for unique identifiers

// Creating symbols
const sym1 = Symbol();
const sym2 = Symbol("description");
const sym3 = Symbol("description");
console.log(sym2 === sym3); // false (always unique)

// Global symbol registry
const globalSym = Symbol.for("shared");
const sameSym = Symbol.for("shared");
console.log(globalSym === sameSym); // true

Symbol.keyFor(globalSym); // "shared"
Symbol.keyFor(sym1);      // undefined (not in registry)

// Use cases:

// 1. Private-ish properties
const _private = Symbol("private");
class MyClass {
    constructor() {
        this[_private] = "secret";
    }
    
    getPrivate() {
        return this[_private];
    }
}

// 2. Avoid property name collisions
const id = Symbol("id");
const user = {
    name: "John",
    [id]: 12345  // Won't conflict with any string key
};

// 3. Well-known symbols (customize object behavior)

// Symbol.iterator - make object iterable
const range = {
    start: 1,
    end: 5,
    [Symbol.iterator]() {
        let current = this.start;
        const end = this.end;
        return {
            next() {
                if (current <= end) {
                    return { value: current++, done: false };
                }
                return { done: true };
            }
        };
    }
};

for (const num of range) console.log(num); // 1, 2, 3, 4, 5

// Symbol.toStringTag - customize Object.prototype.toString
class MyArray {
    get [Symbol.toStringTag]() {
        return "MyArray";
    }
}
Object.prototype.toString.call(new MyArray()); // "[object MyArray]"

// Symbol.toPrimitive - customize type conversion
const obj = {
    [Symbol.toPrimitive](hint) {
        if (hint === "number") return 42;
        if (hint === "string") return "hello";
        return true; // default
    }
};

// Symbols are not enumerable
Object.keys(user);           // ["name"]
Object.getOwnPropertySymbols(user); // [Symbol(id)]
Reflect.ownKeys(user);       // ["name", Symbol(id)]
```

### 37. What are generators and iterators?

```javascript
// Iterator - object with next() method that returns {value, done}
const iterator = {
    current: 0,
    last: 5,
    next() {
        if (this.current <= this.last) {
            return { value: this.current++, done: false };
        }
        return { done: true };
    }
};

// Generator - function that can pause and resume execution
function* numberGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = numberGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Generators are iterable
for (const num of numberGenerator()) {
    console.log(num); // 1, 2, 3
}

[...numberGenerator()]; // [1, 2, 3]

// Infinite generators
function* infiniteSequence() {
    let i = 0;
    while (true) {
        yield i++;
    }
}

// Passing values to generators
function* twoWay() {
    const x = yield "First";
    const y = yield "Second";
    return x + y;
}

const gen2 = twoWay();
gen2.next();      // { value: "First", done: false }
gen2.next(10);    // { value: "Second", done: false } (x = 10)
gen2.next(20);    // { value: 30, done: true } (y = 20)

// Delegating generators
function* gen1() {
    yield 1;
    yield 2;
}

function* gen2() {
    yield* gen1();
    yield 3;
}

[...gen2()]; // [1, 2, 3]

// Async generators
async function* asyncGenerator() {
    yield await fetchData(1);
    yield await fetchData(2);
}

for await (const data of asyncGenerator()) {
    console.log(data);
}

// Use cases:
// 1. Lazy evaluation
// 2. Infinite sequences
// 3. State machines
// 4. Async iteration
// 5. Custom iterables
```

### 38. Explain WeakMap and WeakSet

```javascript
// WeakMap - Map with weakly held object keys
// - Keys must be objects
// - Keys are garbage collected when no other references exist
// - Not enumerable (no size, keys(), values(), entries())

const weakMap = new WeakMap();
let obj = { name: "John" };

weakMap.set(obj, "metadata");
weakMap.get(obj);  // "metadata"
weakMap.has(obj);  // true
weakMap.delete(obj);

obj = null; // Object can now be garbage collected

// Use cases:

// 1. Private data for objects
const privateData = new WeakMap();

class Person {
    constructor(name, age) {
        privateData.set(this, { name, age });
    }
    
    getName() {
        return privateData.get(this).name;
    }
}

// 2. Caching computed values
const cache = new WeakMap();

function expensiveOperation(obj) {
    if (cache.has(obj)) {
        return cache.get(obj);
    }
    
    const result = /* expensive computation */;
    cache.set(obj, result);
    return result;
}
// When obj is garbage collected, cache entry is automatically removed

// 3. Storing DOM element metadata
const elementData = new WeakMap();

document.querySelectorAll(".item").forEach(el => {
    elementData.set(el, { clicks: 0 });
});
// When element is removed from DOM and dereferenced, data is cleaned up

// WeakSet - Set with weakly held object values
const weakSet = new WeakSet();
let user = { id: 1 };

weakSet.add(user);
weakSet.has(user); // true
weakSet.delete(user);

user = null; // Object can be garbage collected

// Use cases:

// 1. Tracking object state
const processed = new WeakSet();

function processOnce(obj) {
    if (processed.has(obj)) {
        return;
    }
    
    // Process object
    processed.add(obj);
}

// 2. Cycle detection
function detectCycle(obj, seen = new WeakSet()) {
    if (typeof obj !== "object" || obj === null) return false;
    if (seen.has(obj)) return true;
    
    seen.add(obj);
    return Object.values(obj).some(val => detectCycle(val, seen));
}

// Key differences from Map/Set:
// - Only object keys/values allowed
// - No iteration methods
// - No size property
// - Entries are garbage collected when keys have no other references
```

### 39. What is the difference between `Object.freeze()` and `Object.seal()`?

```javascript
// Object.freeze() - no add, remove, or modify properties
const frozen = Object.freeze({ a: 1, nested: { b: 2 } });

frozen.a = 100;        // Silently fails (strict mode: TypeError)
frozen.c = 3;          // Silently fails
delete frozen.a;       // Silently fails
frozen.nested.b = 200; // Works! (shallow freeze)

Object.isFrozen(frozen); // true

// Object.seal() - no add or remove, but can modify existing
const sealed = Object.seal({ a: 1 });

sealed.a = 100;  // Works! (can modify)
sealed.b = 2;    // Silently fails (can't add)
delete sealed.a; // Silently fails (can't remove)

Object.isSealed(sealed); // true

// Object.preventExtensions() - no add, but can modify and delete
const nonExtensible = Object.preventExtensions({ a: 1 });

nonExtensible.a = 100;    // Works
nonExtensible.b = 2;      // Silently fails
delete nonExtensible.a;   // Works

Object.isExtensible(nonExtensible); // false

// Deep freeze utility
function deepFreeze(obj) {
    Object.freeze(obj);
    
    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== null 
            && (typeof obj[prop] === "object" || typeof obj[prop] === "function")
            && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });
    
    return obj;
}

// Summary:
// | Method           | Add | Remove | Modify |
// |------------------|-----|--------|--------|
// | preventExtensions| No  | Yes    | Yes    |
// | seal             | No  | No     | Yes    |
// | freeze           | No  | No     | No     |
```

### 40. Explain error handling in JavaScript

```javascript
// try...catch...finally
try {
    throw new Error("Something went wrong");
} catch (error) {
    console.error(error.message);
    console.error(error.stack);
} finally {
    console.log("Cleanup code - always runs");
}

// Error types
new Error("Generic error");
new TypeError("Wrong type");
new RangeError("Number out of range");
new ReferenceError("Variable not defined");
new SyntaxError("Syntax problem");
new URIError("URI problem");
new EvalError("eval problem");

// Custom error classes
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

class NotFoundError extends Error {
    constructor(resource) {
        super(`${resource} not found`);
        this.name = "NotFoundError";
        this.resource = resource;
    }
}

try {
    throw new ValidationError("Invalid email", "email");
} catch (error) {
    if (error instanceof ValidationError) {
        console.log(`Field ${error.field}: ${error.message}`);
    } else {
        throw error; // Re-throw if not handled
    }
}

// Async error handling
async function fetchData() {
    try {
        const response = await fetch("/api/data");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error; // Re-throw for caller to handle
    }
}

// Promise error handling
fetch("/api/data")
    .then(response => response.json())
    .catch(error => console.error(error));

// Global error handling
window.onerror = function(message, source, line, column, error) {
    console.log("Global error:", message);
};

window.addEventListener("unhandledrejection", event => {
    console.log("Unhandled promise rejection:", event.reason);
    event.preventDefault(); // Prevent default behavior
});

// Error aggregation (Promise.allSettled alternative)
async function fetchAll(urls) {
    const results = await Promise.allSettled(
        urls.map(url => fetch(url).then(r => r.json()))
    );
    
    const successes = results.filter(r => r.status === "fulfilled");
    const failures = results.filter(r => r.status === "rejected");
    
    return { successes, failures };
}
```

---

## Advanced Level Questions

### 41. Explain JavaScript memory management and garbage collection

```javascript
// JavaScript uses automatic garbage collection (primarily Mark-and-Sweep)

// Memory lifecycle:
// 1. Allocation - memory is allocated when values are declared
// 2. Use - reading/writing to allocated memory
// 3. Release - memory is freed when no longer needed

// Memory allocation examples
const num = 42;                    // Allocates memory for number
const str = "hello";               // Allocates memory for string
const obj = { a: 1, b: 2 };        // Allocates memory for object and values
const arr = [1, 2, 3];             // Allocates memory for array and elements
function fn() { return 1; }        // Allocates memory for function

// Garbage collection - Mark-and-Sweep algorithm:
// 1. Roots are marked (global object, local variables in call stack)
// 2. All objects reachable from roots are marked as "alive"
// 3. Unmarked objects are considered garbage and memory is freed

// Memory leaks - common causes:

// 1. Accidental global variables
function leak() {
    leaked = "I'm global!"; // Missing 'var/let/const'
}

// 2. Forgotten timers/callbacks
const id = setInterval(() => {
    const data = getHugeData();
    // If never cleared, data is kept in memory
}, 1000);
clearInterval(id); // Always clear when done

// 3. Closures holding references
function createClosure() {
    const hugeData = new Array(1000000).fill("data");
    
    return function() {
        // Even if hugeData isn't used, it's kept in memory
        return "small result";
    };
}

// 4. Detached DOM nodes
const elements = [];
document.getElementById("button").addEventListener("click", () => {
    const div = document.createElement("div");
    elements.push(div); // Reference kept even if div is removed from DOM
});

// 5. Event listeners not removed
class Component {
    constructor() {
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener("resize", this.handleResize);
    }
    
    destroy() {
        window.removeEventListener("resize", this.handleResize);
    }
    
    handleResize() { /* ... */ }
}

// Memory profiling tips:
// - Use Chrome DevTools Memory tab
// - Take heap snapshots before/after operations
// - Look for detached DOM trees
// - Check for growing memory in Timeline
```

### 42. What is the module pattern and revealing module pattern?

```javascript
// Module Pattern - uses IIFE and closures for encapsulation

const Calculator = (function() {
    // Private variables and functions
    let result = 0;
    
    function validate(n) {
        return typeof n === "number" && !isNaN(n);
    }
    
    // Public API (returned object)
    return {
        add(n) {
            if (validate(n)) result += n;
            return this;
        },
        subtract(n) {
            if (validate(n)) result -= n;
            return this;
        },
        getResult() {
            return result;
        },
        reset() {
            result = 0;
            return this;
        }
    };
})();

Calculator.add(5).add(3).subtract(2).getResult(); // 6

// Revealing Module Pattern - define all functions privately, reveal in return

const UserModule = (function() {
    // All private
    let users = [];
    
    function addUser(user) {
        users.push(user);
        return user;
    }
    
    function getUser(id) {
        return users.find(u => u.id === id);
    }
    
    function getAllUsers() {
        return [...users]; // Return copy
    }
    
    function deleteUser(id) {
        const index = users.findIndex(u => u.id === id);
        if (index > -1) {
            users.splice(index, 1);
            return true;
        }
        return false;
    }
    
    function formatUser(user) {
        return `${user.name} (${user.email})`;
    }
    
    // Reveal only what's needed
    return {
        add: addUser,
        get: getUser,
        getAll: getAllUsers,
        remove: deleteUser
        // formatUser is private
    };
})();

// Module with namespace
const MyApp = MyApp || {};

MyApp.Utils = (function() {
    function formatDate(date) { /* ... */ }
    function formatCurrency(amount) { /* ... */ }
    
    return { formatDate, formatCurrency };
})();

MyApp.DataService = (function() {
    function fetchData(url) { /* ... */ }
    
    return { fetchData };
})();

// Modern ES modules are preferred, but module pattern is still useful for:
// - Browser environments without module support
// - Immediately creating singleton instances
// - Libraries that need to work in various environments
```

### 43. Explain currying and partial application

```javascript
// Currying - transforming function with multiple arguments into 
// sequence of functions each taking a single argument

// Non-curried
function add(a, b, c) {
    return a + b + c;
}
add(1, 2, 3); // 6

// Curried
function curriedAdd(a) {
    return function(b) {
        return function(c) {
            return a + b + c;
        };
    };
}
curriedAdd(1)(2)(3); // 6

// Arrow function syntax
const curriedAdd2 = a => b => c => a + b + c;

// Generic curry function
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function(...moreArgs) {
            return curried.apply(this, args.concat(moreArgs));
        };
    };
}

const curriedSum = curry((a, b, c) => a + b + c);
curriedSum(1)(2)(3);    // 6
curriedSum(1, 2)(3);    // 6
curriedSum(1)(2, 3);    // 6

// Partial application - fixing some arguments, creating new function
function partial(fn, ...fixedArgs) {
    return function(...remainingArgs) {
        return fn.apply(this, [...fixedArgs, ...remainingArgs]);
    };
}

const add5 = partial(add, 5);
add5(3, 2); // 10

// Using bind for partial application
const multiply = (a, b, c) => a * b * c;
const double = multiply.bind(null, 2);
double(3, 4); // 24

// Practical examples

// 1. Configuration
const log = (level) => (message) => console.log(`[${level}] ${message}`);
const info = log("INFO");
const error = log("ERROR");
info("Application started");  // [INFO] Application started
error("Something failed");    // [ERROR] Something failed

// 2. Event handlers
const handleEvent = (type) => (id) => (event) => {
    console.log(`${type} event on ${id}`, event);
};
button.addEventListener("click", handleEvent("click")("submitBtn"));

// 3. Data transformation
const map = fn => arr => arr.map(fn);
const filter = pred => arr => arr.filter(pred);
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const processNumbers = pipe(
    filter(n => n > 0),
    map(n => n * 2),
    filter(n => n < 100)
);

processNumbers([1, -2, 3, 50, 100]); // [2, 6, 100]
```

### 44. What is function composition?

```javascript
// Function composition - combining functions to create new functions

// Simple compose (right to left)
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

// Pipe (left to right) - often more readable
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// Example functions
const add10 = x => x + 10;
const multiply2 = x => x * 2;
const subtract5 = x => x - 5;

// Composition
const composed = compose(subtract5, multiply2, add10);
composed(5); // ((5 + 10) * 2) - 5 = 25

const piped = pipe(add10, multiply2, subtract5);
piped(5); // Same result: 25

// Real-world example: data transformation
const users = [
    { name: "John", age: 25, active: true },
    { name: "Jane", age: 30, active: false },
    { name: "Bob", age: 35, active: true }
];

const getActive = users => users.filter(u => u.active);
const sortByAge = users => [...users].sort((a, b) => a.age - b.age);
const getNames = users => users.map(u => u.name);
const joinWithComma = arr => arr.join(", ");

const getActiveNamesSorted = pipe(
    getActive,
    sortByAge,
    getNames,
    joinWithComma
);

getActiveNamesSorted(users); // "John, Bob"

// Async composition
const pipeAsync = (...fns) => x =>
    fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(x));

const fetchUser = id => fetch(`/users/${id}`).then(r => r.json());
const getPostsForUser = user => fetch(`/users/${user.id}/posts`).then(r => r.json());
const filterPublished = posts => posts.filter(p => p.published);

const getPublishedPosts = pipeAsync(
    fetchUser,
    getPostsForUser,
    filterPublished
);

getPublishedPosts(1).then(posts => console.log(posts));

// Point-free style
const prop = key => obj => obj[key];
const map = fn => arr => arr.map(fn);

const getNames2 = map(prop("name"));
getNames2(users); // ["John", "Jane", "Bob"]
```

### 45. Explain the Observer pattern in JavaScript

```javascript
// Observer pattern - subject maintains list of dependents (observers)
// and notifies them of state changes

class Subject {
    constructor() {
        this.observers = new Set();
    }
    
    subscribe(observer) {
        this.observers.add(observer);
        return () => this.observers.delete(observer); // Unsubscribe function
    }
    
    unsubscribe(observer) {
        this.observers.delete(observer);
    }
    
    notify(data) {
        this.observers.forEach(observer => observer(data));
    }
}

// Usage
const subject = new Subject();

const unsubscribe1 = subject.subscribe(data => {
    console.log("Observer 1:", data);
});

const unsubscribe2 = subject.subscribe(data => {
    console.log("Observer 2:", data);
});

subject.notify("Hello"); // Both observers log

unsubscribe1();
subject.notify("World"); // Only Observer 2 logs

// EventEmitter pattern (Node.js style)
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }
    
    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
        return this;
    }
    
    once(event, listener) {
        const wrapper = (...args) => {
            listener.apply(this, args);
            this.off(event, wrapper);
        };
        return this.on(event, wrapper);
    }
    
    emit(event, ...args) {
        if (!this.events[event]) return false;
        this.events[event].forEach(listener => listener.apply(this, args));
        return true;
    }
    
    listenerCount(event) {
        return this.events[event]?.length || 0;
    }
}

// Usage
const emitter = new EventEmitter();

emitter.on("message", data => console.log("Received:", data));
emitter.once("connect", () => console.log("Connected!"));

emitter.emit("connect");  // "Connected!"
emitter.emit("connect");  // Nothing (once removed itself)
emitter.emit("message", "Hello"); // "Received: Hello"

// Practical example: State management
class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Set();
    }
    
    getState() {
        return this.state;
    }
    
    setState(updater) {
        const newState = typeof updater === "function" 
            ? updater(this.state) 
            : updater;
        
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener(this.state));
    }
    
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

const store = new Store({ count: 0, user: null });
store.subscribe(state => console.log("State changed:", state));
store.setState({ count: 1 });
store.setState(prev => ({ count: prev.count + 1 }));
```

### 46. What is the Singleton pattern?

```javascript
// Singleton ensures only one instance of a class exists

// ES6 Class implementation
class Singleton {
    static instance = null;
    
    constructor() {
        if (Singleton.instance) {
            return Singleton.instance;
        }
        
        this.data = [];
        Singleton.instance = this;
    }
    
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
    
    addData(item) {
        this.data.push(item);
    }
    
    getData() {
        return this.data;
    }
}

const instance1 = new Singleton();
const instance2 = new Singleton();
console.log(instance1 === instance2); // true

// Module pattern singleton (most common in JS)
const AppConfig = (function() {
    let instance;
    
    function createInstance() {
        return {
            apiUrl: "https://api.example.com",
            timeout: 5000,
            debug: false,
            
            setDebug(value) {
                this.debug = value;
            }
        };
    }
    
    return {
        getInstance() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

const config1 = AppConfig.getInstance();
const config2 = AppConfig.getInstance();
console.log(config1 === config2); // true

// ES modules are naturally singletons
// logger.js
class Logger {
    constructor() {
        this.logs = [];
    }
    
    log(message) {
        this.logs.push({ message, timestamp: new Date() });
        console.log(message);
    }
}

export default new Logger(); // Same instance exported every time

// Using closures
const Database = (() => {
    let connection = null;
    
    return {
        connect(connectionString) {
            if (!connection) {
                connection = { connectionString, connected: true };
                console.log("Connected to database");
            }
            return connection;
        },
        
        getConnection() {
            return connection;
        }
    };
})();

// Lazy singleton with Proxy
const createLazySingleton = (TargetClass) => {
    let instance = null;
    
    return new Proxy(TargetClass, {
        construct(target, args) {
            if (!instance) {
                instance = new target(...args);
            }
            return instance;
        }
    });
};

const LazySingleton = createLazySingleton(class {
    constructor() {
        console.log("Instance created");
        this.id = Math.random();
    }
});
```

### 47. Explain the Factory pattern

```javascript
// Factory pattern - creates objects without specifying exact class

// Simple Factory
class Car {
    constructor(options) {
        this.type = "car";
        this.doors = options.doors || 4;
        this.color = options.color || "white";
    }
}

class Truck {
    constructor(options) {
        this.type = "truck";
        this.payload = options.payload || 1000;
        this.color = options.color || "black";
    }
}

class Motorcycle {
    constructor(options) {
        this.type = "motorcycle";
        this.engine = options.engine || 600;
        this.color = options.color || "red";
    }
}

class VehicleFactory {
    static create(type, options = {}) {
        switch (type.toLowerCase()) {
            case "car":
                return new Car(options);
            case "truck":
                return new Truck(options);
            case "motorcycle":
                return new Motorcycle(options);
            default:
                throw new Error(`Unknown vehicle type: ${type}`);
        }
    }
}

const car = VehicleFactory.create("car", { doors: 2, color: "blue" });
const truck = VehicleFactory.create("truck", { payload: 2000 });

// Factory with registration
class ComponentFactory {
    static components = new Map();
    
    static register(type, component) {
        this.components.set(type, component);
    }
    
    static create(type, props = {}) {
        const Component = this.components.get(type);
        if (!Component) {
            throw new Error(`Component ${type} not registered`);
        }
        return new Component(props);
    }
}

// Register components
class Button {
    constructor({ label, onClick }) {
        this.label = label;
        this.onClick = onClick;
    }
    render() { return `<button>${this.label}</button>`; }
}

class Input {
    constructor({ placeholder, type = "text" }) {
        this.placeholder = placeholder;
        this.type = type;
    }
    render() { return `<input type="${this.type}" placeholder="${this.placeholder}">`; }
}

ComponentFactory.register("button", Button);
ComponentFactory.register("input", Input);

const btn = ComponentFactory.create("button", { label: "Click me" });
const input = ComponentFactory.create("input", { placeholder: "Enter name" });

// Abstract Factory
class UIFactory {
    createButton() { throw new Error("Must implement"); }
    createCheckbox() { throw new Error("Must implement"); }
}

class MaterialUIFactory extends UIFactory {
    createButton(props) { return new MaterialButton(props); }
    createCheckbox(props) { return new MaterialCheckbox(props); }
}

class BootstrapFactory extends UIFactory {
    createButton(props) { return new BootstrapButton(props); }
    createCheckbox(props) { return new BootstrapCheckbox(props); }
}

function createUI(factory) {
    const button = factory.createButton({ label: "Submit" });
    const checkbox = factory.createCheckbox({ label: "Accept" });
    return { button, checkbox };
}

const materialUI = createUI(new MaterialUIFactory());
const bootstrapUI = createUI(new BootstrapFactory());
```

### 48. What is the Pub/Sub pattern?

```javascript
// Pub/Sub (Publish/Subscribe) - decouples publishers from subscribers
// through a central event bus

class PubSub {
    constructor() {
        this.topics = {};
        this.subUid = -1;
    }
    
    subscribe(topic, callback) {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        
        const token = (++this.subUid).toString();
        this.topics[topic].push({ token, callback });
        
        return token;
    }
    
    unsubscribe(token) {
        for (const topic in this.topics) {
            const index = this.topics[topic].findIndex(sub => sub.token === token);
            if (index !== -1) {
                this.topics[topic].splice(index, 1);
                return true;
            }
        }
        return false;
    }
    
    publish(topic, data) {
        if (!this.topics[topic]) {
            return false;
        }
        
        this.topics[topic].forEach(sub => {
            sub.callback(data, topic);
        });
        
        return true;
    }
    
    // Subscribe once
    subscribeOnce(topic, callback) {
        const token = this.subscribe(topic, (data, topic) => {
            this.unsubscribe(token);
            callback(data, topic);
        });
        return token;
    }
    
    // Clear all subscriptions for a topic
    clearTopic(topic) {
        delete this.topics[topic];
    }
}

// Global event bus
const eventBus = new PubSub();

// Module A - Publisher
const userModule = {
    login(userData) {
        // ... login logic
        eventBus.publish("user:login", userData);
    },
    logout() {
        eventBus.publish("user:logout");
    }
};

// Module B - Subscriber
const analyticsModule = {
    init() {
        eventBus.subscribe("user:login", (user) => {
            console.log("Analytics: User logged in", user);
        });
        
        eventBus.subscribe("user:logout", () => {
            console.log("Analytics: User logged out");
        });
    }
};

// Module C - Another Subscriber
const notificationModule = {
    init() {
        eventBus.subscribe("user:login", (user) => {
            console.log(`Welcome back, ${user.name}!`);
        });
    }
};

// Usage
analyticsModule.init();
notificationModule.init();
userModule.login({ name: "John", email: "john@example.com" });

// Real-world example: Decoupled modules
class ShoppingCart {
    constructor(pubsub) {
        this.items = [];
        this.pubsub = pubsub;
    }
    
    addItem(item) {
        this.items.push(item);
        this.pubsub.publish("cart:itemAdded", { item, total: this.getTotal() });
    }
    
    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        this.pubsub.publish("cart:itemRemoved", { itemId, total: this.getTotal() });
    }
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }
}

// Subscribers don't know about ShoppingCart implementation
eventBus.subscribe("cart:itemAdded", ({ item, total }) => {
    updateCartUI(total);
    showNotification(`Added ${item.name} to cart`);
});
```

### 49. Explain Service Workers and Web Workers

```javascript
// Web Workers - run scripts in background threads
// Main thread remains responsive

// main.js
const worker = new Worker("worker.js");

// Send message to worker
worker.postMessage({ type: "calculate", data: [1, 2, 3, 4, 5] });

// Receive message from worker
worker.onmessage = function(e) {
    console.log("Result from worker:", e.data);
};

worker.onerror = function(error) {
    console.error("Worker error:", error);
};

// Terminate worker
worker.terminate();

// worker.js
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    if (type === "calculate") {
        // Expensive calculation
        const result = data.reduce((sum, n) => sum + n, 0);
        self.postMessage(result);
    }
};

// Shared Workers - shared between multiple scripts
const sharedWorker = new SharedWorker("shared-worker.js");
sharedWorker.port.start();
sharedWorker.port.postMessage("Hello");
sharedWorker.port.onmessage = (e) => console.log(e.data);

// Service Workers - proxy between web app and network
// Enable offline functionality, push notifications, background sync

// Register service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(registration => {
            console.log("SW registered:", registration.scope);
        })
        .catch(error => {
            console.error("SW registration failed:", error);
        });
}

// sw.js - Service Worker
const CACHE_NAME = "v1";
const urlsToCache = [
    "/",
    "/styles.css",
    "/app.js",
    "/offline.html"
];

// Install event - cache assets
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Activate event - clean old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Serve from cache
                }
                return fetch(event.request)
                    .then(response => {
                        // Cache new responses
                        if (response.status === 200) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, clone));
                        }
                        return response;
                    })
                    .catch(() => caches.match("/offline.html"));
            })
    );
});

// Push notifications
self.addEventListener("push", event => {
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/icon.png"
        })
    );
});
```

### 50. What are JavaScript design patterns for performance optimization?

```javascript
// 1. Object Pool Pattern - reuse objects to avoid GC
class ObjectPool {
    constructor(createFn, initialSize = 10) {
        this.createFn = createFn;
        this.pool = [];
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    acquire() {
        return this.pool.length > 0 ? this.pool.pop() : this.createFn();
    }
    
    release(obj) {
        // Reset object state before returning to pool
        if (obj.reset) obj.reset();
        this.pool.push(obj);
    }
}

// Usage for particles
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = 0;
        this.y = 0;
        this.velocity = { x: 0, y: 0 };
        this.active = false;
    }
}

const particlePool = new ObjectPool(() => new Particle(), 100);

// 2. Flyweight Pattern - share common data
class Character {
    constructor(char, font, size) {
        this.char = char;
        this.font = font;
        this.size = size;
    }
    
    draw(x, y) {
        console.log(`Drawing ${this.char} at (${x}, ${y})`);
    }
}

class CharacterFactory {
    static characters = new Map();
    
    static getCharacter(char, font, size) {
        const key = `${char}-${font}-${size}`;
        
        if (!this.characters.has(key)) {
            this.characters.set(key, new Character(char, font, size));
        }
        
        return this.characters.get(key);
    }
}

// 3. Lazy Initialization
class ExpensiveResource {
    static _instance = null;
    
    static get instance() {
        if (!this._instance) {
            this._instance = new ExpensiveResource();
        }
        return this._instance;
    }
}

// Lazy property
const obj = {
    get expensiveValue() {
        const value = computeExpensiveValue();
        Object.defineProperty(this, "expensiveValue", {
            value,
            writable: false,
            configurable: false
        });
        return value;
    }
};

// 4. Batch Processing
class BatchProcessor {
    constructor(batchSize = 100, delay = 0) {
        this.queue = [];
        this.batchSize = batchSize;
        this.delay = delay;
        this.processing = false;
    }
    
    add(item) {
        this.queue.push(item);
        this.scheduleProcess();
    }
    
    scheduleProcess() {
        if (this.processing) return;
        
        this.processing = true;
        requestIdleCallback(() => this.processBatch());
    }
    
    processBatch() {
        const batch = this.queue.splice(0, this.batchSize);
        
        batch.forEach(item => {
            // Process item
        });
        
        if (this.queue.length > 0) {
            requestIdleCallback(() => this.processBatch());
        } else {
            this.processing = false;
        }
    }
}

// 5. Virtual Scrolling Pattern
class VirtualList {
    constructor(container, items, itemHeight) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
        this.startIndex = 0;
        
        container.addEventListener("scroll", () => this.onScroll());
        this.render();
    }
    
    onScroll() {
        const scrollTop = this.container.scrollTop;
        const newStartIndex = Math.floor(scrollTop / this.itemHeight);
        
        if (newStartIndex !== this.startIndex) {
            this.startIndex = newStartIndex;
            this.render();
        }
    }
    
    render() {
        const endIndex = Math.min(
            this.startIndex + this.visibleCount + 1,
            this.items.length
        );
        
        const visibleItems = this.items.slice(this.startIndex, endIndex);
        // Render only visible items with proper offsetting
    }
}
```

### 51. Explain JavaScript Security Best Practices

```javascript
// 1. Prevent XSS (Cross-Site Scripting)

// Bad - vulnerable to XSS
element.innerHTML = userInput;

// Good - escape HTML
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
element.innerHTML = escapeHTML(userInput);

// Better - use textContent when possible
element.textContent = userInput;

// Use DOMPurify for HTML sanitization
import DOMPurify from "dompurify";
element.innerHTML = DOMPurify.sanitize(userInput);

// 2. Prevent CSRF (Cross-Site Request Forgery)
// Include CSRF token in requests
async function securePost(url, data) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken
        },
        credentials: "same-origin",
        body: JSON.stringify(data)
    });
}

// 3. Content Security Policy (CSP)
// Set via HTTP header or meta tag
// <meta http-equiv="Content-Security-Policy" content="default-src 'self'">

// 4. Secure data handling
// Never store sensitive data in localStorage (XSS accessible)
// Use httpOnly cookies for auth tokens

// 5. Input validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function sanitizeInput(input) {
    return input
        .trim()
        .replace(/[<>]/g, ""); // Remove < and >
}

// 6. Prototype pollution prevention
function safeAssign(target, source) {
    for (const key of Object.keys(source)) {
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            continue;
        }
        target[key] = source[key];
    }
    return target;
}

// Use Object.create(null) for dictionaries
const safeDict = Object.create(null);

// 7. Secure JSON parsing
function safeJSONParse(str) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

// 8. Avoid eval and Function constructor
// Bad
eval(userCode);
new Function(userCode)();

// 9. Use strict mode
"use strict";

// 10. Secure URL handling
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

// 11. Subresource Integrity (SRI)
// <script src="..." integrity="sha384-..." crossorigin="anonymous">
```

### 52. What is the Event Loop in detail (microtasks, macrotasks, rendering)?

```javascript
// Event Loop phases (in order):
// 1. Execute synchronous code (call stack)
// 2. Execute all microtasks
// 3. Execute one macrotask
// 4. Execute all microtasks again
// 5. Render (if needed)
// 6. Repeat

// Microtasks (higher priority):
// - Promise callbacks (.then, .catch, .finally)
// - queueMicrotask()
// - MutationObserver callbacks

// Macrotasks (lower priority):
// - setTimeout, setInterval
// - setImmediate (Node.js)
// - requestAnimationFrame
// - I/O operations
// - UI rendering
// - Event callbacks

console.log("1. Sync");

setTimeout(() => console.log("2. Timeout (macro)"), 0);

Promise.resolve()
    .then(() => console.log("3. Promise (micro)"))
    .then(() => console.log("4. Promise chain (micro)"));

queueMicrotask(() => console.log("5. queueMicrotask (micro)"));

console.log("6. Sync end");

// Output: 1, 6, 3, 5, 4, 2
// Explanation:
// - Sync code runs first (1, 6)
// - All microtasks run (3, 5, 4)
// - One macrotask runs (2)

// More complex example
console.log("Start");

setTimeout(() => {
    console.log("Timeout 1");
    Promise.resolve().then(() => console.log("Promise inside Timeout 1"));
}, 0);

setTimeout(() => {
    console.log("Timeout 2");
}, 0);

Promise.resolve()
    .then(() => {
        console.log("Promise 1");
        return Promise.resolve();
    })
    .then(() => console.log("Promise 2"));

console.log("End");

// Output: Start, End, Promise 1, Promise 2, Timeout 1, Promise inside Timeout 1, Timeout 2

// requestAnimationFrame and rendering
function animate() {
    // Called before next repaint (typically 60fps)
    element.style.transform = `translateX(${position}px)`;
    position += 5;
    
    if (position < 300) {
        requestAnimationFrame(animate);
    }
}
requestAnimationFrame(animate);

// requestIdleCallback - runs during browser idle time
requestIdleCallback((deadline) => {
    while (deadline.timeRemaining() > 0 && tasks.length > 0) {
        performTask(tasks.shift());
    }
}, { timeout: 2000 });

// Blocking the event loop (bad)
while (true) { } // Freezes everything

// Non-blocking heavy computation
function processChunk(data, index, chunkSize, callback) {
    const end = Math.min(index + chunkSize, data.length);
    
    for (let i = index; i < end; i++) {
        // Process item
    }
    
    if (end < data.length) {
        setTimeout(() => processChunk(data, end, chunkSize, callback), 0);
    } else {
        callback();
    }
}
```

### 53. Explain TypedArrays and ArrayBuffer

```javascript
// ArrayBuffer - fixed-length raw binary data buffer
const buffer = new ArrayBuffer(16); // 16 bytes
console.log(buffer.byteLength); // 16

// TypedArray views - interpret the buffer as specific types
const int32View = new Int32Array(buffer);
console.log(int32View.length); // 4 (16 bytes / 4 bytes per int32)

int32View[0] = 42;
int32View[1] = 1000;

// Different views of same buffer
const uint8View = new Uint8Array(buffer);
console.log(uint8View[0]); // 42 (same memory, different interpretation)

// TypedArray types:
// Int8Array, Uint8Array, Uint8ClampedArray
// Int16Array, Uint16Array
// Int32Array, Uint32Array
// Float32Array, Float64Array
// BigInt64Array, BigUint64Array

// Creating TypedArrays
const arr1 = new Uint8Array(5);           // 5 elements, all 0
const arr2 = new Uint8Array([1, 2, 3]);   // From array
const arr3 = new Uint8Array(buffer, 4, 2); // From buffer, offset 4, length 2

// DataView - more flexible, mixed types
const dataView = new DataView(buffer);
dataView.setInt8(0, 127);                  // Signed 8-bit at offset 0
dataView.setUint16(1, 65535, true);        // Little-endian uint16 at offset 1
dataView.setFloat32(4, 3.14, false);       // Big-endian float32 at offset 4

console.log(dataView.getInt8(0));          // 127
console.log(dataView.getUint16(1, true));  // 65535

// Use cases:

// 1. Binary file handling
async function readBinaryFile(file) {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    
    // Read file header
    const magic = view.getUint32(0, false);
    const version = view.getUint16(4, false);
}

// 2. Canvas pixel manipulation
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const pixels = imageData.data; // Uint8ClampedArray

// Invert colors
for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255 - pixels[i];       // Red
    pixels[i + 1] = 255 - pixels[i + 1]; // Green
    pixels[i + 2] = 255 - pixels[i + 2]; // Blue
    // pixels[i + 3] is alpha
}
ctx.putImageData(imageData, 0, 0);

// 3. WebGL
const vertices = new Float32Array([
    -1.0, -1.0, 0.0,
     1.0, -1.0, 0.0,
     0.0,  1.0, 0.0
]);

// 4. Audio processing
const audioContext = new AudioContext();
const buffer = audioContext.createBuffer(2, 44100, 44100);
const channelData = buffer.getChannelData(0); // Float32Array

// 5. WebSocket binary data
socket.binaryType = "arraybuffer";
socket.onmessage = (event) => {
    const data = new Uint8Array(event.data);
};
```

### 54. What are JavaScript Proxies used for in real applications?

```javascript
// 1. Reactive/Observable objects (Vue.js, MobX)
function reactive(target) {
    const handlers = new Set();
    
    return new Proxy(target, {
        get(target, property, receiver) {
            track(target, property); // Track dependency
            return Reflect.get(target, property, receiver);
        },
        set(target, property, value, receiver) {
            const result = Reflect.set(target, property, value, receiver);
            trigger(target, property); // Trigger effects
            return result;
        }
    });
}

// 2. Validation
function createValidatedObject(schema) {
    return new Proxy({}, {
        set(target, property, value) {
            if (schema[property]) {
                const { type, required, min, max } = schema[property];
                
                if (required && (value === null || value === undefined)) {
                    throw new Error(`${property} is required`);
                }
                
                if (type && typeof value !== type) {
                    throw new TypeError(`${property} must be ${type}`);
                }
                
                if (typeof value === "number") {
                    if (min !== undefined && value < min) {
                        throw new RangeError(`${property} must be >= ${min}`);
                    }
                    if (max !== undefined && value > max) {
                        throw new RangeError(`${property} must be <= ${max}`);
                    }
                }
            }
            
            target[property] = value;
            return true;
        }
    });
}

const user = createValidatedObject({
    age: { type: "number", min: 0, max: 150 },
    name: { type: "string", required: true }
});

// 3. Auto-vivification (auto-create nested objects)
function autovivify() {
    return new Proxy({}, {
        get(target, property) {
            if (!(property in target)) {
                target[property] = autovivify();
            }
            return target[property];
        }
    });
}

const data = autovivify();
data.deeply.nested.value = 42; // No errors, paths auto-created

// 4. Memoization
function memoize(fn) {
    const cache = new Map();
    
    return new Proxy(fn, {
        apply(target, thisArg, args) {
            const key = JSON.stringify(args);
            
            if (!cache.has(key)) {
                cache.set(key, target.apply(thisArg, args));
            }
            
            return cache.get(key);
        }
    });
}

// 5. Access logging / debugging
function withLogging(obj, name = "Object") {
    return new Proxy(obj, {
        get(target, property) {
            console.log(`${name}.${property} accessed`);
            return target[property];
        },
        set(target, property, value) {
            console.log(`${name}.${property} set to`, value);
            target[property] = value;
            return true;
        }
    });
}

// 6. Deprecation warnings
function deprecate(obj, deprecated) {
    return new Proxy(obj, {
        get(target, property) {
            if (deprecated[property]) {
                console.warn(`${property} is deprecated. Use ${deprecated[property]} instead.`);
            }
            return target[property];
        }
    });
}

const api = deprecate({
    oldMethod() { },
    newMethod() { }
}, {
    oldMethod: "newMethod"
});

// 7. Immutable objects
function immutable(obj) {
    return new Proxy(obj, {
        set() {
            throw new Error("Object is immutable");
        },
        deleteProperty() {
            throw new Error("Object is immutable");
        }
    });
}
```

### 55. Explain JavaScript testing strategies and patterns

```javascript
// Unit Testing with Jest

// Function to test
function calculateTotal(items, taxRate = 0.1) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * taxRate;
    return {
        subtotal,
        tax,
        total: subtotal + tax
    };
}

// Test file
describe("calculateTotal", () => {
    test("calculates correct total for single item", () => {
        const items = [{ price: 100, quantity: 2 }];
        const result = calculateTotal(items);
        
        expect(result.subtotal).toBe(200);
        expect(result.tax).toBe(20);
        expect(result.total).toBe(220);
    });
    
    test("handles empty array", () => {
        const result = calculateTotal([]);
        expect(result.total).toBe(0);
    });
    
    test("uses custom tax rate", () => {
        const items = [{ price: 100, quantity: 1 }];
        const result = calculateTotal(items, 0.2);
        expect(result.tax).toBe(20);
    });
});

// Mocking
jest.mock("./api", () => ({
    fetchUser: jest.fn()
}));

const mockUser = { id: 1, name: "John" };
api.fetchUser.mockResolvedValue(mockUser);

test("fetches user data", async () => {
    const user = await getUser(1);
    expect(api.fetchUser).toHaveBeenCalledWith(1);
    expect(user).toEqual(mockUser);
});

// Spy on methods
const spy = jest.spyOn(object, "method");
object.method();
expect(spy).toHaveBeenCalled();
spy.mockRestore();

// Testing async code
test("async test", async () => {
    const data = await fetchData();
    expect(data).toBeDefined();
});

test("testing promises", () => {
    return fetchData().then(data => {
        expect(data).toBeDefined();
    });
});

test("testing errors", async () => {
    await expect(failingFunction()).rejects.toThrow("Error message");
});

// Integration testing
describe("User Registration Flow", () => {
    beforeEach(async () => {
        await database.clear();
    });
    
    test("registers new user and sends welcome email", async () => {
        const emailSpy = jest.spyOn(emailService, "send");
        
        const user = await registerUser({
            email: "test@example.com",
            password: "password123"
        });
        
        expect(user.id).toBeDefined();
        expect(emailSpy).toHaveBeenCalledWith(
            "test@example.com",
            "welcome",
            expect.any(Object)
        );
    });
});

// Snapshot testing
test("renders correctly", () => {
    const tree = renderer.create(<Button label="Click" />).toJSON();
    expect(tree).toMatchSnapshot();
});

// Testing patterns:
// - AAA: Arrange, Act, Assert
// - Given-When-Then for BDD
// - Test doubles: mocks, stubs, spies, fakes
```

---

## Coding & Machine Test Questions

### 56. Implement a deep clone function

```javascript
// Method 1: Handle all types including circular references
function deepClone(obj, hash = new WeakMap()) {
    // Handle primitives and null
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    
    // Handle circular references
    if (hash.has(obj)) {
        return hash.get(obj);
    }
    
    // Handle Date
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    // Handle RegExp
    if (obj instanceof RegExp) {
        return new RegExp(obj.source, obj.flags);
    }
    
    // Handle Map
    if (obj instanceof Map) {
        const clonedMap = new Map();
        hash.set(obj, clonedMap);
        obj.forEach((value, key) => {
            clonedMap.set(deepClone(key, hash), deepClone(value, hash));
        });
        return clonedMap;
    }
    
    // Handle Set
    if (obj instanceof Set) {
        const clonedSet = new Set();
        hash.set(obj, clonedSet);
        obj.forEach(value => {
            clonedSet.add(deepClone(value, hash));
        });
        return clonedSet;
    }
    
    // Handle Array
    if (Array.isArray(obj)) {
        const clonedArr = [];
        hash.set(obj, clonedArr);
        obj.forEach((item, index) => {
            clonedArr[index] = deepClone(item, hash);
        });
        return clonedArr;
    }
    
    // Handle Object
    const clonedObj = Object.create(Object.getPrototypeOf(obj));
    hash.set(obj, clonedObj);
    
    // Copy all properties including symbols
    Reflect.ownKeys(obj).forEach(key => {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        if (descriptor.value !== undefined) {
            descriptor.value = deepClone(descriptor.value, hash);
        }
        Object.defineProperty(clonedObj, key, descriptor);
    });
    
    return clonedObj;
}

// Method 2: Using structuredClone (modern browsers)
const clone = structuredClone(original);

// Method 3: Simple JSON (limited)
const simpleClone = JSON.parse(JSON.stringify(obj));

// Test
const original = {
    name: "John",
    nested: { a: 1, b: [1, 2, 3] },
    date: new Date(),
    regex: /test/gi,
    map: new Map([["key", "value"]]),
    set: new Set([1, 2, 3])
};
original.circular = original; // Circular reference

const cloned = deepClone(original);
console.log(cloned.nested !== original.nested); // true
console.log(cloned.circular === cloned); // true (circular ref preserved)
```

### 57. Implement Promise.all, Promise.race, Promise.allSettled

```javascript
// Promise.all - resolves when all resolve, rejects on first rejection
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = [];
        let completed = 0;
        const promiseArray = Array.from(promises);
        
        if (promiseArray.length === 0) {
            resolve([]);
            return;
        }
        
        promiseArray.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(value => {
                    results[index] = value;
                    completed++;
                    
                    if (completed === promiseArray.length) {
                        resolve(results);
                    }
                })
                .catch(reject);
        });
    });
}

// Promise.race - resolves/rejects with first settled promise
function promiseRace(promises) {
    return new Promise((resolve, reject) => {
        const promiseArray = Array.from(promises);
        
        promiseArray.forEach(promise => {
            Promise.resolve(promise).then(resolve).catch(reject);
        });
    });
}

// Promise.allSettled - waits for all to settle, never rejects
function promiseAllSettled(promises) {
    return new Promise((resolve) => {
        const results = [];
        let completed = 0;
        const promiseArray = Array.from(promises);
        
        if (promiseArray.length === 0) {
            resolve([]);
            return;
        }
        
        promiseArray.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(value => {
                    results[index] = { status: "fulfilled", value };
                })
                .catch(reason => {
                    results[index] = { status: "rejected", reason };
                })
                .finally(() => {
                    completed++;
                    if (completed === promiseArray.length) {
                        resolve(results);
                    }
                });
        });
    });
}

// Promise.any - resolves with first fulfilled, rejects if all reject
function promiseAny(promises) {
    return new Promise((resolve, reject) => {
        const errors = [];
        let rejected = 0;
        const promiseArray = Array.from(promises);
        
        if (promiseArray.length === 0) {
            reject(new AggregateError([], "All promises were rejected"));
            return;
        }
        
        promiseArray.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(resolve)
                .catch(error => {
                    errors[index] = error;
                    rejected++;
                    
                    if (rejected === promiseArray.length) {
                        reject(new AggregateError(errors, "All promises were rejected"));
                    }
                });
        });
    });
}

// Test
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.reject("error");

promiseAll([p1, p2]).then(console.log); // [1, 2]
promiseAllSettled([p1, p3]).then(console.log);
// [{ status: "fulfilled", value: 1 }, { status: "rejected", reason: "error" }]
```

### 58. Implement a debounce function with leading/trailing options

```javascript
function debounce(func, wait, options = {}) {
    const { leading = false, trailing = true, maxWait } = options;
    
    let timeoutId = null;
    let lastArgs = null;
    let lastThis = null;
    let lastCallTime = null;
    let lastInvokeTime = 0;
    let result = null;
    
    function invokeFunc(time) {
        const args = lastArgs;
        const thisArg = lastThis;
        
        lastArgs = lastThis = null;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
    }
    
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        
        return (
            lastCallTime === null ||
            timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 ||
            (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
        );
    }
    
    function trailingEdge(time) {
        timeoutId = null;
        
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = null;
        return result;
    }
    
    function timerExpired() {
        const time = Date.now();
        
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        
        // Restart timer
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = wait - timeSinceLastCall;
        const maxTimeWaiting = maxWait !== undefined 
            ? maxWait - timeSinceLastInvoke 
            : timeWaiting;
        
        timeoutId = setTimeout(timerExpired, Math.min(timeWaiting, maxTimeWaiting));
    }
    
    function leadingEdge(time) {
        lastInvokeTime = time;
        timeoutId = setTimeout(timerExpired, wait);
        
        return leading ? invokeFunc(time) : result;
    }
    
    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);
        
        lastArgs = args;
        lastThis = this;
        lastCallTime = time;
        
        if (isInvoking) {
            if (timeoutId === null) {
                return leadingEdge(time);
            }
            if (maxWait !== undefined) {
                timeoutId = setTimeout(timerExpired, wait);
                return invokeFunc(time);
            }
        }
        
        if (timeoutId === null) {
            timeoutId = setTimeout(timerExpired, wait);
        }
        
        return result;
    }
    
    debounced.cancel = function() {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timeoutId = null;
    };
    
    debounced.flush = function() {
        return timeoutId === null ? result : trailingEdge(Date.now());
    };
    
    return debounced;
}

// Usage
const debouncedSearch = debounce(search, 300, { leading: true, trailing: true });
input.addEventListener("input", debouncedSearch);
```

### 59. Implement a throttle function

```javascript
function throttle(func, limit, options = {}) {
    const { leading = true, trailing = true } = options;
    
    let timeoutId = null;
    let lastArgs = null;
    let lastThis = null;
    let lastCallTime = 0;
    
    function invokeFunc() {
        const args = lastArgs;
        const thisArg = lastThis;
        lastArgs = lastThis = null;
        lastCallTime = Date.now();
        func.apply(thisArg, args);
    }
    
    function trailingCall() {
        timeoutId = null;
        if (trailing && lastArgs) {
            invokeFunc();
            timeoutId = setTimeout(trailingCall, limit);
        }
    }
    
    function throttled(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;
        
        lastArgs = args;
        lastThis = this;
        
        if (timeSinceLastCall >= limit) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            
            if (leading) {
                invokeFunc();
            } else {
                lastCallTime = now;
            }
            
            if (trailing) {
                timeoutId = setTimeout(trailingCall, limit);
            }
        } else if (!timeoutId && trailing) {
            timeoutId = setTimeout(trailingCall, limit - timeSinceLastCall);
        }
    }
    
    throttled.cancel = function() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastCallTime = 0;
        lastArgs = lastThis = null;
    };
    
    return throttled;
}

// Simple throttle
function simpleThrottle(func, limit) {
    let inThrottle = false;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Usage
const throttledScroll = throttle(handleScroll, 100);
window.addEventListener("scroll", throttledScroll);
```

### 60. Implement curry function

```javascript
// Basic curry
function curry(fn) {
    const arity = fn.length;
    
    return function curried(...args) {
        if (args.length >= arity) {
            return fn.apply(this, args);
        }
        
        return function(...moreArgs) {
            return curried.apply(this, args.concat(moreArgs));
        };
    };
}

// Curry with placeholder support
const _ = Symbol("placeholder");

function curryWithPlaceholder(fn) {
    const arity = fn.length;
    
    return function curried(...args) {
        // Check if we have enough non-placeholder args
        const filledArgs = args.filter(arg => arg !== _);
        
        if (filledArgs.length >= arity) {
            return fn.apply(this, args.filter(arg => arg !== _).slice(0, arity));
        }
        
        return function(...moreArgs) {
            // Replace placeholders with new args
            const combinedArgs = args.map(arg => {
                if (arg === _ && moreArgs.length > 0) {
                    return moreArgs.shift();
                }
                return arg;
            }).concat(moreArgs);
            
            return curried.apply(this, combinedArgs);
        };
    };
}

// Infinite curry (for variadic functions)
function infiniteCurry(fn) {
    return function curried(...args) {
        const next = (...moreArgs) => curried(...args, ...moreArgs);
        next[Symbol.toPrimitive] = () => fn(...args);
        next.valueOf = () => fn(...args);
        next.toString = () => String(fn(...args));
        return next;
    };
}

// Usage examples
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

curriedAdd(1)(2)(3);     // 6
curriedAdd(1, 2)(3);     // 6
curriedAdd(1)(2, 3);     // 6
curriedAdd(1, 2, 3);     // 6

// With placeholder
const curriedAdd2 = curryWithPlaceholder(add);
curriedAdd2(_, 2, 3)(1); // 6
curriedAdd2(1, _, 3)(2); // 6

// Infinite curry for sum
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
const curriedSum = infiniteCurry(sum);
console.log(+curriedSum(1)(2)(3)(4)); // 10
```

### 61. Implement pipe and compose functions

```javascript
// Pipe - left to right composition
function pipe(...fns) {
    return function(x) {
        return fns.reduce((v, fn) => fn(v), x);
    };
}

// Compose - right to left composition
function compose(...fns) {
    return function(x) {
        return fns.reduceRight((v, fn) => fn(v), x);
    };
}

// Async pipe
function pipeAsync(...fns) {
    return function(x) {
        return fns.reduce(
            (promise, fn) => promise.then(fn),
            Promise.resolve(x)
        );
    };
}

// Async compose
function composeAsync(...fns) {
    return function(x) {
        return fns.reduceRight(
            (promise, fn) => promise.then(fn),
            Promise.resolve(x)
        );
    };
}

// Pipe with multiple arguments for first function
function pipeWith(...fns) {
    return function(...args) {
        return fns.reduce((v, fn, i) => {
            return i === 0 ? fn(...args) : fn(v);
        }, null);
    };
}

// Usage
const add10 = x => x + 10;
const multiply2 = x => x * 2;
const subtract5 = x => x - 5;
const toString = x => `Result: ${x}`;

const process = pipe(add10, multiply2, subtract5, toString);
console.log(process(5)); // "Result: 25"

const processReverse = compose(toString, subtract5, multiply2, add10);
console.log(processReverse(5)); // "Result: 25"

// Async example
const fetchUser = async (id) => ({ id, name: "John" });
const fetchPosts = async (user) => ({ user, posts: ["Post 1"] });
const formatData = async (data) => JSON.stringify(data);

const getUserPosts = pipeAsync(fetchUser, fetchPosts, formatData);
getUserPosts(1).then(console.log);
```

### 62. Implement an EventEmitter class

```javascript
class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
        return this;
    }
    
    off(event, listener) {
        if (!this.events.has(event)) return this;
        
        if (!listener) {
            this.events.delete(event);
        } else {
            const listeners = this.events.get(event);
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
        return this;
    }
    
    once(event, listener) {
        const wrapper = (...args) => {
            listener.apply(this, args);
            this.off(event, wrapper);
        };
        wrapper.originalListener = listener;
        return this.on(event, wrapper);
    }
    
    emit(event, ...args) {
        if (!this.events.has(event)) return false;
        
        const listeners = this.events.get(event).slice();
        listeners.forEach(listener => {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        });
        return true;
    }
    
    listenerCount(event) {
        return this.events.get(event)?.length || 0;
    }
    
    eventNames() {
        return [...this.events.keys()];
    }
    
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
        return this;
    }
    
    // Async emit
    async emitAsync(event, ...args) {
        if (!this.events.has(event)) return false;
        
        const listeners = this.events.get(event).slice();
        for (const listener of listeners) {
            await listener.apply(this, args);
        }
        return true;
    }
    
    // Prepend listener
    prependListener(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).unshift(listener);
        return this;
    }
}

// Usage
const emitter = new EventEmitter();

emitter.on("data", (data) => console.log("Received:", data));
emitter.once("connect", () => console.log("Connected!"));

emitter.emit("connect");      // "Connected!"
emitter.emit("connect");      // Nothing (once removed)
emitter.emit("data", { id: 1 }); // "Received: { id: 1 }"

console.log(emitter.listenerCount("data")); // 1
console.log(emitter.eventNames()); // ["data"]
```

### 63. Implement Array methods (map, filter, reduce, find, some, every)

```javascript
// Array.prototype.map
Array.prototype.myMap = function(callback, thisArg) {
    if (typeof callback !== "function") {
        throw new TypeError(`${callback} is not a function`);
    }
    
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (i in this) {
            result[i] = callback.call(thisArg, this[i], i, this);
        }
    }
    return result;
};

// Array.prototype.filter
Array.prototype.myFilter = function(callback, thisArg) {
    if (typeof callback !== "function") {
        throw new TypeError(`${callback} is not a function`);
    }
    
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            result.push(this[i]);
        }
    }
    return result;
};

// Array.prototype.reduce
Array.prototype.myReduce = function(callback, initialValue) {
    if (typeof callback !== "function") {
        throw new TypeError(`${callback} is not a function`);
    }
    
    const hasInitial = arguments.length >= 2;
    let accumulator = hasInitial ? initialValue : undefined;
    let startIndex = 0;
    
    if (!hasInitial) {
        if (this.length === 0) {
            throw new TypeError("Reduce of empty array with no initial value");
        }
        
        // Find first existing element
        while (startIndex < this.length && !(startIndex in this)) {
            startIndex++;
        }
        accumulator = this[startIndex++];
    }
    
    for (let i = startIndex; i < this.length; i++) {
        if (i in this) {
            accumulator = callback(accumulator, this[i], i, this);
        }
    }
    
    return accumulator;
};

// Array.prototype.find
Array.prototype.myFind = function(callback, thisArg) {
    if (typeof callback !== "function") {
        throw new TypeError(`${callback} is not a function`);
    }
    
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            return this[i];
        }
    }
    return undefined;
};

// Array.prototype.findIndex
Array.prototype.myFindIndex = function(callback, thisArg) {
    if (typeof callback !== "function") {
        throw new TypeError(`${callback} is not a function`);
    }
    
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            return i;
        }
    }
    return -1;
};

// Array.prototype.some
Array.prototype.mySome = function(callback, thisArg) {
    if (typeof callback !== "function") {
        throw new TypeError(`${callback} is not a function`);
    }
    
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            return true;
        }
    }
    return false;
};

// Array.prototype.every
Array.prototype.myEvery = function(callback, thisArg) {
    if (typeof callback !== "function") {
        throw new TypeError(`${callback} is not a function`);
    }
    
    for (let i = 0; i < this.length; i++) {
        if (i in this && !callback.call(thisArg, this[i], i, this)) {
            return false;
        }
    }
    return true;
};

// Array.prototype.flat
Array.prototype.myFlat = function(depth = 1) {
    const result = [];
    
    const flatten = (arr, d) => {
        for (const item of arr) {
            if (Array.isArray(item) && d > 0) {
                flatten(item, d - 1);
            } else {
                result.push(item);
            }
        }
    };
    
    flatten(this, depth);
    return result;
};

// Array.prototype.flatMap
Array.prototype.myFlatMap = function(callback, thisArg) {
    return this.myMap(callback, thisArg).myFlat(1);
};

// Test
const arr = [1, 2, 3, 4, 5];
console.log(arr.myMap(x => x * 2));      // [2, 4, 6, 8, 10]
console.log(arr.myFilter(x => x > 2));   // [3, 4, 5]
console.log(arr.myReduce((a, b) => a + b, 0)); // 15
console.log(arr.myFind(x => x > 3));     // 4
console.log(arr.mySome(x => x > 4));     // true
console.log(arr.myEvery(x => x > 0));    // true
console.log([[1, 2], [3, [4, 5]]].myFlat(2)); // [1, 2, 3, 4, 5]
```

### 64. Implement Function.prototype.bind

```javascript
// Basic bind implementation
Function.prototype.myBind = function(context, ...boundArgs) {
    if (typeof this !== "function") {
        throw new TypeError("Bind must be called on a function");
    }
    
    const originalFunc = this;
    
    const boundFunction = function(...args) {
        // Check if called with 'new'
        const isNew = this instanceof boundFunction;
        
        return originalFunc.apply(
            isNew ? this : context,
            boundArgs.concat(args)
        );
    };
    
    // Maintain prototype chain for 'new' calls
    if (originalFunc.prototype) {
        boundFunction.prototype = Object.create(originalFunc.prototype);
    }
    
    return boundFunction;
};

// More complete implementation
Function.prototype.myBind2 = function(context, ...boundArgs) {
    if (typeof this !== "function") {
        throw new TypeError(`${this} is not callable`);
    }
    
    const originalFunc = this;
    const NOP = function() {};
    
    const boundFunction = function(...args) {
        return originalFunc.apply(
            // If used with 'new', 'this' should be the new instance
            NOP.prototype.isPrototypeOf(this) ? this : context,
            boundArgs.concat(args)
        );
    };
    
    // Set up prototype chain
    if (originalFunc.prototype) {
        NOP.prototype = originalFunc.prototype;
        boundFunction.prototype = new NOP();
    }
    
    return boundFunction;
};

// Test
function greet(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: "John" };
const boundGreet = greet.myBind(person, "Hello");
console.log(boundGreet("!")); // "Hello, John!"

// Test with constructor
function Person(name, age) {
    this.name = name;
    this.age = age;
}

const BoundPerson = Person.myBind(null, "John");
const p = new BoundPerson(30);
console.log(p.name, p.age); // "John" 30
```

### 65. Implement call and apply

```javascript
// Function.prototype.call
Function.prototype.myCall = function(context, ...args) {
    if (typeof this !== "function") {
        throw new TypeError(`${this} is not a function`);
    }
    
    // Handle null/undefined context
    context = context ?? globalThis;
    
    // Convert primitives to objects
    if (typeof context !== "object") {
        context = Object(context);
    }
    
    // Create unique property key
    const fnKey = Symbol("fn");
    
    // Attach function to context
    context[fnKey] = this;
    
    // Call the function
    const result = context[fnKey](...args);
    
    // Clean up
    delete context[fnKey];
    
    return result;
};

// Function.prototype.apply
Function.prototype.myApply = function(context, argsArray) {
    if (typeof this !== "function") {
        throw new TypeError(`${this} is not a function`);
    }
    
    // Handle null/undefined context
    context = context ?? globalThis;
    
    // Convert primitives to objects
    if (typeof context !== "object") {
        context = Object(context);
    }
    
    // Handle arguments array
    argsArray = argsArray ?? [];
    
    // Create unique property key
    const fnKey = Symbol("fn");
    
    // Attach function to context
    context[fnKey] = this;
    
    // Call the function with spread args
    const result = context[fnKey](...argsArray);
    
    // Clean up
    delete context[fnKey];
    
    return result;
};

// Test
function greet(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: "John" };

console.log(greet.myCall(person, "Hello", "!")); // "Hello, John!"
console.log(greet.myApply(person, ["Hi", "?"])); // "Hi, John?"
```

### 66. Implement a simple Virtual DOM diff algorithm

```javascript
// Virtual DOM node structure
function createElement(type, props = {}, ...children) {
    return {
        type,
        props: props || {},
        children: children.flat().map(child =>
            typeof child === "object" ? child : createTextElement(child)
        )
    };
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: { nodeValue: text },
        children: []
    };
}

// Render virtual DOM to real DOM
function render(vnode, container) {
    const dom = createDom(vnode);
    container.appendChild(dom);
}

function createDom(vnode) {
    if (vnode.type === "TEXT_ELEMENT") {
        return document.createTextNode(vnode.props.nodeValue);
    }
    
    const dom = document.createElement(vnode.type);
    
    // Set properties
    Object.entries(vnode.props)
        .filter(([key]) => key !== "children")
        .forEach(([name, value]) => {
            if (name.startsWith("on")) {
                const eventType = name.toLowerCase().substring(2);
                dom.addEventListener(eventType, value);
            } else {
                dom[name] = value;
            }
        });
    
    // Render children
    vnode.children.forEach(child => {
        dom.appendChild(createDom(child));
    });
    
    return dom;
}

// Diff algorithm
function diff(oldVNode, newVNode) {
    // Node was removed
    if (!newVNode) {
        return { type: "REMOVE" };
    }
    
    // Node was added
    if (!oldVNode) {
        return { type: "CREATE", newVNode };
    }
    
    // Different types - replace
    if (oldVNode.type !== newVNode.type) {
        return { type: "REPLACE", newVNode };
    }
    
    // Text node changed
    if (newVNode.type === "TEXT_ELEMENT") {
        if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
            return { type: "TEXT", newVNode };
        }
        return null;
    }
    
    // Same type - check props and children
    const propPatches = diffProps(oldVNode.props, newVNode.props);
    const childPatches = diffChildren(oldVNode.children, newVNode.children);
    
    if (propPatches.length > 0 || childPatches.length > 0) {
        return { type: "UPDATE", propPatches, childPatches };
    }
    
    return null;
}

function diffProps(oldProps, newProps) {
    const patches = [];
    const allProps = { ...oldProps, ...newProps };
    
    Object.keys(allProps).forEach(key => {
        if (key === "children") return;
        
        const oldValue = oldProps[key];
        const newValue = newProps[key];
        
        if (oldValue !== newValue) {
            patches.push({ key, value: newValue });
        }
    });
    
    return patches;
}

function diffChildren(oldChildren, newChildren) {
    const patches = [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);
    
    for (let i = 0; i < maxLength; i++) {
        patches.push(diff(oldChildren[i], newChildren[i]));
    }
    
    return patches;
}

// Apply patches to real DOM
function patch(parent, patches, index = 0) {
    if (!patches) return;
    
    const element = parent.childNodes[index];
    
    switch (patches.type) {
        case "CREATE":
            parent.appendChild(createDom(patches.newVNode));
            break;
            
        case "REMOVE":
            parent.removeChild(element);
            break;
            
        case "REPLACE":
            parent.replaceChild(createDom(patches.newVNode), element);
            break;
            
        case "TEXT":
            element.nodeValue = patches.newVNode.props.nodeValue;
            break;
            
        case "UPDATE":
            patches.propPatches.forEach(({ key, value }) => {
                if (key.startsWith("on")) {
                    // Handle event listeners
                } else if (value === undefined) {
                    element.removeAttribute(key);
                } else {
                    element[key] = value;
                }
            });
            
            patches.childPatches.forEach((childPatch, i) => {
                patch(element, childPatch, i);
            });
            break;
    }
}

// Usage
const vdom1 = createElement("div", { id: "app" },
    createElement("h1", null, "Hello"),
    createElement("p", null, "World")
);

const vdom2 = createElement("div", { id: "app" },
    createElement("h1", null, "Hello"),
    createElement("p", null, "Updated!")
);

const patches = diff(vdom1, vdom2);
// Apply patches to update the DOM
```

### 67. Implement LRU Cache

```javascript
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    
    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    
    put(key, value) {
        // If key exists, delete it first
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // If at capacity, remove oldest (first item)
        else if (this.cache.size >= this.capacity) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, value);
    }
}

// LRU Cache with Doubly Linked List (O(1) for all operations)
class LRUCacheOptimized {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        
        // Dummy head and tail
        this.head = { key: null, value: null };
        this.tail = { key: null, value: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    
    _addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    
    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    _moveToHead(node) {
        this._removeNode(node);
        this._addToHead(node);
    }
    
    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        
        const node = this.cache.get(key);
        this._moveToHead(node);
        return node.value;
    }
    
    put(key, value) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            node.value = value;
            this._moveToHead(node);
        } else {
            const newNode = { key, value };
            this.cache.set(key, newNode);
            this._addToHead(newNode);
            
            if (this.cache.size > this.capacity) {
                const lru = this.tail.prev;
                this._removeNode(lru);
                this.cache.delete(lru.key);
            }
        }
    }
}

// Test
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));  // 1
cache.put(3, 3);            // Evicts key 2
console.log(cache.get(2));  // -1 (not found)
```

### 68. Implement Pub/Sub with wildcard support

```javascript
class PubSubWildcard {
    constructor() {
        this.subscriptions = new Map();
    }
    
    subscribe(pattern, callback) {
        if (!this.subscriptions.has(pattern)) {
            this.subscriptions.set(pattern, new Set());
        }
        this.subscriptions.get(pattern).add(callback);
        
        return () => {
            this.subscriptions.get(pattern).delete(callback);
        };
    }
    
    publish(topic, data) {
        this.subscriptions.forEach((callbacks, pattern) => {
            if (this._matches(pattern, topic)) {
                callbacks.forEach(callback => {
                    try {
                        callback(data, topic);
                    } catch (error) {
                        console.error(`Error in subscriber for ${pattern}:`, error);
                    }
                });
            }
        });
    }
    
    _matches(pattern, topic) {
        // Exact match
        if (pattern === topic) return true;
        
        // Convert pattern to regex
        const patternParts = pattern.split(".");
        const topicParts = topic.split(".");
        
        let patternIndex = 0;
        let topicIndex = 0;
        
        while (patternIndex < patternParts.length && topicIndex < topicParts.length) {
            const p = patternParts[patternIndex];
            const t = topicParts[topicIndex];
            
            if (p === "#") {
                // # matches zero or more levels
                if (patternIndex === patternParts.length - 1) {
                    return true;
                }
                
                // Try to match remaining pattern
                for (let i = topicIndex; i <= topicParts.length; i++) {
                    if (this._matches(
                        patternParts.slice(patternIndex + 1).join("."),
                        topicParts.slice(i).join(".")
                    )) {
                        return true;
                    }
                }
                return false;
            }
            
            if (p === "*") {
                // * matches exactly one level
                patternIndex++;
                topicIndex++;
                continue;
            }
            
            if (p !== t) {
                return false;
            }
            
            patternIndex++;
            topicIndex++;
        }
        
        return patternIndex === patternParts.length && 
               topicIndex === topicParts.length;
    }
}

// Usage
const pubsub = new PubSubWildcard();

pubsub.subscribe("user.*", (data, topic) => {
    console.log(`User event [${topic}]:`, data);
});

pubsub.subscribe("user.#", (data, topic) => {
    console.log(`All user events [${topic}]:`, data);
});

pubsub.subscribe("user.profile.updated", (data) => {
    console.log("Profile updated:", data);
});

pubsub.publish("user.login", { userId: 1 });
pubsub.publish("user.profile.updated", { name: "John" });
pubsub.publish("user.profile.picture.changed", { url: "..." });
```

### 69. Implement a Retry mechanism with exponential backoff

```javascript
async function retryWithBackoff(fn, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 30000,
        factor = 2,
        jitter = true,
        shouldRetry = () => true,
        onRetry = () => {}
    } = options;
    
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn(attempt);
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries || !shouldRetry(error, attempt)) {
                throw error;
            }
            
            // Calculate delay with exponential backoff
            let delay = Math.min(baseDelay * Math.pow(factor, attempt), maxDelay);
            
            // Add jitter to prevent thundering herd
            if (jitter) {
                delay = delay * (0.5 + Math.random());
            }
            
            onRetry(error, attempt, delay);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

// Decorator version
function withRetry(options = {}) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args) {
            return retryWithBackoff(
                () => originalMethod.apply(this, args),
                options
            );
        };
        
        return descriptor;
    };
}

// Usage
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

const result = await retryWithBackoff(
    () => fetchData("https://api.example.com/data"),
    {
        maxRetries: 5,
        baseDelay: 1000,
        shouldRetry: (error) => {
            // Only retry on network errors or 5xx
            return error.message.includes("network") || 
                   error.message.includes("50");
        },
        onRetry: (error, attempt, delay) => {
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms`);
        }
    }
);

// Promise-based circuit breaker
class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 30000;
        this.state = "CLOSED";
        this.failures = 0;
        this.lastFailureTime = null;
    }
    
    async execute(fn) {
        if (this.state === "OPEN") {
            if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
                this.state = "HALF-OPEN";
            } else {
                throw new Error("Circuit breaker is OPEN");
            }
        }
        
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failures = 0;
        this.state = "CLOSED";
    }
    
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        
        if (this.failures >= this.failureThreshold) {
            this.state = "OPEN";
        }
    }
}
```

### 70. Implement a Task Queue with concurrency limit

```javascript
class TaskQueue {
    constructor(concurrency = 1) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
    
    async add(task, priority = 0) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, priority, resolve, reject });
            this.queue.sort((a, b) => b.priority - a.priority);
            this.processQueue();
        });
    }
    
    async processQueue() {
        while (this.running < this.concurrency && this.queue.length > 0) {
            const { task, resolve, reject } = this.queue.shift();
            this.running++;
            
            try {
                const result = await task();
                resolve(result);
            } catch (error) {
                reject(error);
            } finally {
                this.running--;
                this.processQueue();
            }
        }
    }
    
    get size() {
        return this.queue.length;
    }
    
    get pending() {
        return this.running;
    }
    
    clear() {
        this.queue = [];
    }
}

// Advanced queue with pause/resume
class AdvancedTaskQueue extends TaskQueue {
    constructor(concurrency = 1) {
        super(concurrency);
        this.paused = false;
    }
    
    pause() {
        this.paused = true;
    }
    
    resume() {
        this.paused = false;
        this.processQueue();
    }
    
    async processQueue() {
        if (this.paused) return;
        super.processQueue();
    }
}

// Usage
const queue = new TaskQueue(3); // Max 3 concurrent tasks

// Simulate API calls
const fetchUser = (id) => () => 
    new Promise(resolve => 
        setTimeout(() => resolve({ id, name: `User ${id}` }), 1000)
    );

// Add tasks
const results = await Promise.all([
    queue.add(fetchUser(1)),
    queue.add(fetchUser(2)),
    queue.add(fetchUser(3)),
    queue.add(fetchUser(4)),
    queue.add(fetchUser(5), 1), // Higher priority
]);

console.log(results);

// Async iterator version
class AsyncQueue {
    constructor(concurrency = 1) {
        this.concurrency = concurrency;
        this.queue = [];
        this.running = new Set();
        this.results = [];
    }
    
    async *[Symbol.asyncIterator]() {
        while (this.queue.length > 0 || this.running.size > 0) {
            // Start new tasks up to concurrency limit
            while (this.running.size < this.concurrency && this.queue.length > 0) {
                const task = this.queue.shift();
                const promise = task().then(result => {
                    this.running.delete(promise);
                    return result;
                });
                this.running.add(promise);
            }
            
            if (this.running.size > 0) {
                yield await Promise.race(this.running);
            }
        }
    }
    
    add(task) {
        this.queue.push(task);
    }
}
```

### 71. Implement a simple state management (Redux-like)

```javascript
function createStore(reducer, initialState, enhancer) {
    if (typeof enhancer === "function") {
        return enhancer(createStore)(reducer, initialState);
    }
    
    let state = initialState;
    let listeners = [];
    
    function getState() {
        return state;
    }
    
    function dispatch(action) {
        state = reducer(state, action);
        listeners.forEach(listener => listener());
        return action;
    }
    
    function subscribe(listener) {
        listeners.push(listener);
        return function unsubscribe() {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }
    
    // Initialize state
    dispatch({ type: "@@INIT" });
    
    return { getState, dispatch, subscribe };
}

// Combine reducers
function combineReducers(reducers) {
    return function(state = {}, action) {
        const nextState = {};
        let hasChanged = false;
        
        for (const key in reducers) {
            const reducer = reducers[key];
            const previousStateForKey = state[key];
            const nextStateForKey = reducer(previousStateForKey, action);
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        
        return hasChanged ? nextState : state;
    };
}

// Middleware support (applyMiddleware)
function applyMiddleware(...middlewares) {
    return function(createStore) {
        return function(reducer, initialState) {
            const store = createStore(reducer, initialState);
            let dispatch = store.dispatch;
            
            const middlewareAPI = {
                getState: store.getState,
                dispatch: (action) => dispatch(action)
            };
            
            const chain = middlewares.map(middleware => middleware(middlewareAPI));
            dispatch = compose(...chain)(store.dispatch);
            
            return {
                ...store,
                dispatch
            };
        };
    };
}

function compose(...fns) {
    if (fns.length === 0) return arg => arg;
    if (fns.length === 1) return fns[0];
    return fns.reduce((a, b) => (...args) => a(b(...args)));
}

// Logger middleware
const logger = store => next => action => {
    console.log("dispatching", action);
    const result = next(action);
    console.log("next state", store.getState());
    return result;
};

// Thunk middleware (async actions)
const thunk = store => next => action => {
    if (typeof action === "function") {
        return action(store.dispatch, store.getState);
    }
    return next(action);
};

// Usage
const counterReducer = (state = 0, action) => {
    switch (action.type) {
        case "INCREMENT": return state + 1;
        case "DECREMENT": return state - 1;
        default: return state;
    }
};

const store = createStore(
    combineReducers({ counter: counterReducer }),
    {},
    applyMiddleware(logger, thunk)
);

store.subscribe(() => console.log("State changed:", store.getState()));
store.dispatch({ type: "INCREMENT" });

// Async action with thunk
store.dispatch(async (dispatch, getState) => {
    const data = await fetchData();
    dispatch({ type: "SET_DATA", payload: data });
});
```

### 72. Implement a Dependency Injection Container

```javascript
class Container {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
    }
    
    // Register a service
    register(name, definition, options = {}) {
        this.services.set(name, {
            definition,
            singleton: options.singleton || false,
            dependencies: options.dependencies || []
        });
        return this;
    }
    
    // Register as singleton
    singleton(name, definition, dependencies = []) {
        return this.register(name, definition, { 
            singleton: true, 
            dependencies 
        });
    }
    
    // Resolve a service
    resolve(name) {
        const service = this.services.get(name);
        
        if (!service) {
            throw new Error(`Service '${name}' not found`);
        }
        
        // Return singleton if exists
        if (service.singleton && this.singletons.has(name)) {
            return this.singletons.get(name);
        }
        
        // Resolve dependencies
        const dependencies = service.dependencies.map(dep => this.resolve(dep));
        
        // Create instance
        let instance;
        if (typeof service.definition === "function") {
            instance = new service.definition(...dependencies);
        } else {
            instance = service.definition;
        }
        
        // Cache singleton
        if (service.singleton) {
            this.singletons.set(name, instance);
        }
        
        return instance;
    }
    
    // Factory registration
    factory(name, factoryFn, dependencies = []) {
        this.services.set(name, {
            definition: factoryFn,
            singleton: false,
            dependencies,
            isFactory: true
        });
        return this;
    }
}

// Decorator-based DI
const Injectable = (dependencies = []) => {
    return function(target) {
        target.$dependencies = dependencies;
        return target;
    };
};

// Usage
class Logger {
    log(message) {
        console.log(`[LOG] ${message}`);
    }
}

class HttpClient {
    constructor(logger) {
        this.logger = logger;
    }
    
    async get(url) {
        this.logger.log(`GET ${url}`);
        return fetch(url).then(r => r.json());
    }
}

class UserService {
    constructor(httpClient, logger) {
        this.httpClient = httpClient;
        this.logger = logger;
    }
    
    async getUser(id) {
        this.logger.log(`Fetching user ${id}`);
        return this.httpClient.get(`/api/users/${id}`);
    }
}

// Setup container
const container = new Container();
container.singleton("logger", Logger);
container.singleton("httpClient", HttpClient, ["logger"]);
container.register("userService", UserService, { 
    dependencies: ["httpClient", "logger"] 
});

// Resolve
const userService = container.resolve("userService");
userService.getUser(1);
```

### 73. Implement Memoization with cache expiration

```javascript
function memoize(fn, options = {}) {
    const {
        maxSize = 100,
        maxAge = Infinity,
        resolver = (...args) => JSON.stringify(args)
    } = options;
    
    const cache = new Map();
    const timestamps = new Map();
    
    function memoized(...args) {
        const key = resolver(...args);
        const now = Date.now();
        
        // Check if cached and not expired
        if (cache.has(key)) {
            const timestamp = timestamps.get(key);
            if (now - timestamp < maxAge) {
                // Move to end (LRU)
                const value = cache.get(key);
                cache.delete(key);
                cache.set(key, value);
                return value;
            }
            // Expired, remove
            cache.delete(key);
            timestamps.delete(key);
        }
        
        // Compute result
        const result = fn.apply(this, args);
        
        // Handle promise results
        if (result instanceof Promise) {
            return result.then(value => {
                setCache(key, value, now);
                return value;
            }).catch(error => {
                cache.delete(key);
                timestamps.delete(key);
                throw error;
            });
        }
        
        setCache(key, result, now);
        return result;
    }
    
    function setCache(key, value, timestamp) {
        // Enforce max size (LRU eviction)
        if (cache.size >= maxSize) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
            timestamps.delete(oldestKey);
        }
        
        cache.set(key, value);
        timestamps.set(key, timestamp);
    }
    
    memoized.clear = () => {
        cache.clear();
        timestamps.clear();
    };
    
    memoized.delete = (...args) => {
        const key = resolver(...args);
        cache.delete(key);
        timestamps.delete(key);
    };
    
    memoized.has = (...args) => {
        const key = resolver(...args);
        return cache.has(key);
    };
    
    return memoized;
}

// Usage
const expensiveCalculation = memoize(
    (n) => {
        console.log(`Computing for ${n}...`);
        return n * n;
    },
    { maxAge: 5000, maxSize: 10 }
);

console.log(expensiveCalculation(5)); // Computing... 25
console.log(expensiveCalculation(5)); // 25 (cached)

// With async function
const fetchUser = memoize(
    async (id) => {
        const response = await fetch(`/api/users/${id}`);
        return response.json();
    },
    { maxAge: 60000 } // Cache for 1 minute
);

// Custom resolver for object arguments
const searchMemoized = memoize(
    (query, options) => performSearch(query, options),
    {
        resolver: (query, options) => 
            `${query}-${options.page}-${options.limit}`
    }
);
```

### 74. Implement a simple Router

```javascript
class Router {
    constructor(options = {}) {
        this.routes = [];
        this.mode = options.mode || "hash"; // hash or history
        this.root = options.root || "/";
        this.notFound = options.notFound || (() => {});
        
        this.listen();
    }
    
    add(path, handler) {
        this.routes.push({
            path: this.parsePath(path),
            handler
        });
        return this;
    }
    
    parsePath(path) {
        // Convert /users/:id to regex with named groups
        const paramNames = [];
        const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return "([^/]+)";
        });
        
        return {
            regex: new RegExp(`^${regexPath}$`),
            paramNames
        };
    }
    
    getFragment() {
        let fragment = "";
        
        if (this.mode === "history") {
            fragment = window.location.pathname;
            fragment = fragment.replace(this.root, "");
        } else {
            const match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : "";
        }
        
        return "/" + fragment.replace(/^\//, "");
    }
    
    navigate(path, data = {}) {
        if (this.mode === "history") {
            window.history.pushState(data, "", this.root + path.replace(/^\//, ""));
        } else {
            window.location.href = `${window.location.href.replace(/#(.*)$/, "")}#${path}`;
        }
        
        this.resolve();
    }
    
    resolve() {
        const fragment = this.getFragment();
        
        for (const route of this.routes) {
            const match = fragment.match(route.path.regex);
            
            if (match) {
                const params = {};
                route.path.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                
                const query = this.parseQuery();
                
                route.handler({ params, query, path: fragment });
                return;
            }
        }
        
        this.notFound({ path: fragment });
    }
    
    parseQuery() {
        const query = {};
        const search = window.location.search.slice(1);
        
        if (search) {
            search.split("&").forEach(param => {
                const [key, value] = param.split("=");
                query[decodeURIComponent(key)] = decodeURIComponent(value || "");
            });
        }
        
        return query;
    }
    
    listen() {
        window.addEventListener("popstate", () => this.resolve());
        
        if (this.mode === "hash") {
            window.addEventListener("hashchange", () => this.resolve());
        }
        
        // Handle initial route
        this.resolve();
    }
}

// Usage
const router = new Router({ mode: "history" });

router
    .add("/", ({ params, query }) => {
        console.log("Home page");
    })
    .add("/users", ({ params, query }) => {
        console.log("Users list", query);
    })
    .add("/users/:id", ({ params }) => {
        console.log("User details", params.id);
    })
    .add("/users/:id/posts/:postId", ({ params }) => {
        console.log("User post", params);
    });

// Navigate programmatically
router.navigate("/users/123");
```

### 75. Implement Observable/RxJS-like functionality

```javascript
class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }
    
    subscribe(observerOrNext, error, complete) {
        const observer = typeof observerOrNext === "function"
            ? { next: observerOrNext, error, complete }
            : observerOrNext;
        
        return this._subscribe({
            next: (value) => observer.next?.(value),
            error: (err) => observer.error?.(err),
            complete: () => observer.complete?.()
        });
    }
    
    // Operators
    map(project) {
        return new Observable(observer => {
            return this.subscribe({
                next: (value) => observer.next(project(value)),
                error: (err) => observer.error(err),
                complete: () => observer.complete()
            });
        });
    }
    
    filter(predicate) {
        return new Observable(observer => {
            return this.subscribe({
                next: (value) => {
                    if (predicate(value)) {
                        observer.next(value);
                    }
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete()
            });
        });
    }
    
    take(count) {
        return new Observable(observer => {
            let taken = 0;
            const subscription = this.subscribe({
                next: (value) => {
                    if (taken < count) {
                        observer.next(value);
                        taken++;
                        if (taken >= count) {
                            observer.complete();
                            subscription?.unsubscribe?.();
                        }
                    }
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete()
            });
            return subscription;
        });
    }
    
    debounceTime(ms) {
        return new Observable(observer => {
            let timeoutId;
            return this.subscribe({
                next: (value) => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => observer.next(value), ms);
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete()
            });
        });
    }
    
    // Static creation methods
    static of(...values) {
        return new Observable(observer => {
            values.forEach(value => observer.next(value));
            observer.complete();
            return { unsubscribe: () => {} };
        });
    }
    
    static from(iterable) {
        return new Observable(observer => {
            for (const value of iterable) {
                observer.next(value);
            }
            observer.complete();
            return { unsubscribe: () => {} };
        });
    }
    
    static fromEvent(element, eventName) {
        return new Observable(observer => {
            const handler = (event) => observer.next(event);
            element.addEventListener(eventName, handler);
            return {
                unsubscribe: () => element.removeEventListener(eventName, handler)
            };
        });
    }
    
    static interval(ms) {
        return new Observable(observer => {
            let count = 0;
            const id = setInterval(() => observer.next(count++), ms);
            return { unsubscribe: () => clearInterval(id) };
        });
    }
}

// Subject (multicast)
class Subject extends Observable {
    constructor() {
        super(observer => {
            this.observers.add(observer);
            return {
                unsubscribe: () => this.observers.delete(observer)
            };
        });
        this.observers = new Set();
    }
    
    next(value) {
        this.observers.forEach(observer => observer.next(value));
    }
    
    error(err) {
        this.observers.forEach(observer => observer.error?.(err));
    }
    
    complete() {
        this.observers.forEach(observer => observer.complete?.());
    }
}

// BehaviorSubject (emits current value to new subscribers)
class BehaviorSubject extends Subject {
    constructor(initialValue) {
        super();
        this.value = initialValue;
    }
    
    subscribe(observerOrNext, error, complete) {
        const subscription = super.subscribe(observerOrNext, error, complete);
        
        // Emit current value
        const observer = typeof observerOrNext === "function"
            ? { next: observerOrNext }
            : observerOrNext;
        observer.next?.(this.value);
        
        return subscription;
    }
    
    next(value) {
        this.value = value;
        super.next(value);
    }
}

// Usage
const clicks$ = Observable.fromEvent(document, "click")
    .map(e => ({ x: e.clientX, y: e.clientY }))
    .debounceTime(300);

const subscription = clicks$.subscribe({
    next: pos => console.log("Clicked at:", pos),
    complete: () => console.log("Done")
});

// Later: subscription.unsubscribe();
```

---

## Quick Reference Tables

### JavaScript Data Type Comparison

| Type | typeof | instanceof | Array.isArray | Example |
|------|--------|------------|---------------|---------|
| String | "string" | ✗ | ✗ | `"hello"` |
| Number | "number" | ✗ | ✗ | `42`, `NaN` |
| BigInt | "bigint" | ✗ | ✗ | `42n` |
| Boolean | "boolean" | ✗ | ✗ | `true` |
| Undefined | "undefined" | ✗ | ✗ | `undefined` |
| Null | "object" | ✗ | ✗ | `null` |
| Symbol | "symbol" | ✗ | ✗ | `Symbol()` |
| Object | "object" | Object | ✗ | `{}` |
| Array | "object" | Array | ✓ | `[]` |
| Function | "function" | Function | ✗ | `() => {}` |

### Array Methods Comparison

| Method | Mutates | Returns | Purpose |
|--------|---------|---------|---------|
| push() | ✓ | length | Add to end |
| pop() | ✓ | removed item | Remove from end |
| shift() | ✓ | removed item | Remove from start |
| unshift() | ✓ | length | Add to start |
| splice() | ✓ | removed items | Add/remove anywhere |
| slice() | ✗ | new array | Copy portion |
| concat() | ✗ | new array | Merge arrays |
| map() | ✗ | new array | Transform elements |
| filter() | ✗ | new array | Select elements |
| reduce() | ✗ | single value | Accumulate |
| find() | ✗ | element/undefined | First match |
| findIndex() | ✗ | index/-1 | First match index |
| some() | ✗ | boolean | At least one matches |
| every() | ✗ | boolean | All match |
| sort() | ✓ | same array | Sort in place |
| reverse() | ✓ | same array | Reverse in place |
| flat() | ✗ | new array | Flatten nested |
| flatMap() | ✗ | new array | Map then flatten |

### Event Loop Priority

| Queue | Priority | Examples |
|-------|----------|----------|
| Microtasks | Highest | Promise.then, queueMicrotask, MutationObserver |
| Animation | High | requestAnimationFrame |
| Macrotasks | Normal | setTimeout, setInterval, setImmediate |
| Idle | Low | requestIdleCallback |

### Promise Methods Comparison

| Method | Resolves When | Rejects When |
|--------|---------------|--------------|
| Promise.all() | All fulfill | Any rejects |
| Promise.allSettled() | All settle | Never |
| Promise.race() | First settles | First rejects |
| Promise.any() | First fulfills | All reject |

### `this` Binding Rules (Priority Order)

| Rule | Context | `this` Value |
|------|---------|--------------|
| 1. new | `new Fn()` | New object |
| 2. Explicit | `call/apply/bind` | Specified object |
| 3. Implicit | `obj.method()` | Object before dot |
| 4. Default | `fn()` | globalThis (undefined in strict) |
| Arrow | Lexical | Enclosing scope's `this` |

### Module Syntax Comparison

| Syntax | Named Export | Default Export | Import |
|--------|--------------|----------------|--------|
| ES Modules | `export { x }` | `export default x` | `import { x } from` |
| CommonJS | `exports.x = x` | `module.exports = x` | `require()` |

### Common Time Complexities

| Operation | Array | Object | Map | Set |
|-----------|-------|--------|-----|-----|
| Access | O(1) | O(1) | O(1) | - |
| Search | O(n) | O(1) | O(1) | O(1) |
| Insert | O(n)* | O(1) | O(1) | O(1) |
| Delete | O(n) | O(1) | O(1) | O(1) |

*O(1) amortized for push/pop

---

## Common Interview Patterns

### 1. Two Pointers
```javascript
function twoSum(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        const sum = arr[left] + arr[right];
        if (sum === target) return [left, right];
        sum < target ? left++ : right--;
    }
    return [-1, -1];
}
```

### 2. Sliding Window
```javascript
function maxSum(arr, k) {
    let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
    let maxSum = windowSum;
    
    for (let i = k; i < arr.length; i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}
```

### 3. Hash Map for O(1) Lookup
```javascript
function twoSumHashMap(arr, target) {
    const map = new Map();
    for (let i = 0; i < arr.length; i++) {
        const complement = target - arr[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(arr[i], i);
    }
    return [-1, -1];
}
```

### 4. BFS/DFS for Trees and Graphs
```javascript
// BFS
function bfs(root) {
    if (!root) return [];
    const queue = [root];
    const result = [];
    
    while (queue.length) {
        const node = queue.shift();
        result.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return result;
}

// DFS
function dfs(root, result = []) {
    if (!root) return result;
    result.push(root.val);
    dfs(root.left, result);
    dfs(root.right, result);
    return result;
}
```

### 5. Dynamic Programming Template
```javascript
function dp(n) {
    const memo = new Map();
    
    function solve(i) {
        // Base case
        if (i <= 1) return i;
        
        // Check memo
        if (memo.has(i)) return memo.get(i);
        
        // Recurrence relation
        const result = solve(i - 1) + solve(i - 2);
        memo.set(i, result);
        return result;
    }
    
    return solve(n);
}
```

---

## Best Practices for Senior Developers

### Code Quality
1. Write pure functions when possible
2. Use meaningful variable and function names
3. Keep functions small and focused (single responsibility)
4. Handle errors gracefully
5. Add JSDoc comments for public APIs

### Performance
1. Use appropriate data structures (Map/Set for lookups)
2. Implement lazy loading and code splitting
3. Debounce/throttle expensive operations
4. Use Web Workers for CPU-intensive tasks
5. Profile before optimizing

### Security
1. Sanitize user input
2. Use Content Security Policy
3. Avoid eval() and Function constructor
4. Implement proper authentication/authorization
5. Use HTTPS and secure cookies

### Testing
1. Write unit tests for business logic
2. Use integration tests for workflows
3. Implement E2E tests for critical paths
4. Aim for meaningful coverage, not 100%
5. Test edge cases and error handling

### Architecture
1. Follow SOLID principles
2. Use dependency injection
3. Implement proper error boundaries
4. Design for scalability
5. Document architectural decisions

---

## Interview Tips

1. **Clarify requirements** before coding
2. **Think out loud** - explain your approach
3. **Start with brute force**, then optimize
4. **Consider edge cases** (empty input, single element, large input)
5. **Test your code** with examples
6. **Analyze time/space complexity**
7. **Ask about constraints** (size of input, time limits)
8. **Write clean, readable code**
9. **Handle errors** appropriately
10. **Be honest** about what you don't know

---

## Common Mistakes to Avoid

1. **Not handling `null`/`undefined`** - always check inputs
2. **Modifying arrays/objects** during iteration
3. **Using `==` instead of `===`** without intention
4. **Forgetting `await`** in async functions
5. **Memory leaks** from forgotten listeners/timers
6. **Blocking the main thread** with heavy computation
7. **Not cleaning up** in useEffect/componentWillUnmount
8. **Mutating state directly** in React/Redux
9. **Ignoring promise rejections**
10. **Over-engineering** simple solutions

---

*Document generated for senior JavaScript developer interview preparation. Always verify current best practices with official documentation.*

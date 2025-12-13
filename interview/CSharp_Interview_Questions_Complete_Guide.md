# C# Interview Questions & Answers - Complete Guide

A comprehensive collection of C# interview questions organized by difficulty level.

---

## Table of Contents

1. [Basic Level Questions](#basic-level-questions)
2. [Intermediate Level Questions](#intermediate-level-questions)
3. [Advanced Level Questions](#advanced-level-questions)
4. [Coding & Machine Test Questions](#coding--machine-test-questions)

---

## Basic Level Questions

### 1. What is C#?

C# (pronounced "C-Sharp") is a modern, object-oriented, type-safe programming language developed by Microsoft as part of the .NET initiative. It was designed by Anders Hejlsberg and first released in 2000. C# combines the power of C++ with the simplicity of Visual Basic and is primarily used for building Windows applications, web services, and enterprise software.

### 2. What are the main features of C#?

C# offers several key features including object-oriented programming support with classes and inheritance, strong type checking at compile time, automatic garbage collection for memory management, support for modern programming constructs like LINQ and async/await, cross-platform development through .NET Core and .NET 5+, rich standard library, and excellent IDE support through Visual Studio.

### 3. What is the difference between value types and reference types?

Value types store data directly in memory allocated on the stack. They include primitive types like int, float, bool, char, and structs. When you assign a value type to another variable, a copy of the value is created.

Reference types store a reference (memory address) to the actual data, which is allocated on the heap. They include classes, interfaces, delegates, strings, and arrays. When you assign a reference type to another variable, both variables point to the same object in memory.

### 4. What is the difference between `==` and `.Equals()` in C#?

The `==` operator compares references for reference types (unless overloaded) and values for value types. The `.Equals()` method is a virtual method that can be overridden to provide custom equality logic. For strings, both compare the content due to operator overloading. For custom classes, `==` compares references by default while `.Equals()` can be overridden for value-based comparison.

### 5. What are access modifiers in C#?

Access modifiers control the visibility and accessibility of types and members. C# provides five access modifiers: `public` (accessible from anywhere), `private` (accessible only within the containing type), `protected` (accessible within the containing type and derived types), `internal` (accessible within the same assembly), and `protected internal` (accessible within the same assembly or from derived types in other assemblies). C# 7.2 introduced `private protected` which allows access within the containing class or derived classes in the same assembly.

### 6. What is the difference between `const` and `readonly`?

`const` fields must be initialized at declaration time with a compile-time constant value. They are implicitly static and their values are embedded directly into the compiled code.

`readonly` fields can be initialized either at declaration or in the constructor. They can hold runtime values and can be different for each instance (if not static). Once assigned, their value cannot be changed.

### 7. What is boxing and unboxing?

Boxing is the process of converting a value type to a reference type by wrapping it in an object. This occurs when a value type is assigned to an object variable or passed to a method expecting an object parameter.

Unboxing is the reverse process of extracting the value type from the boxed object. It requires an explicit cast and throws an InvalidCastException if the types don't match.

Boxing and unboxing have performance implications as they involve memory allocation and copying.

### 8. What is the difference between `String` and `StringBuilder`?

`String` is immutable, meaning once created, its value cannot be changed. Any modification creates a new string object in memory. This makes string concatenation in loops inefficient.

`StringBuilder` is mutable and provides methods to modify the string content without creating new objects. It's more efficient for scenarios involving multiple string modifications, such as building strings in loops.

### 9. What are nullable types in C#?

Nullable types allow value types to represent the normal range of values plus an additional null value. They are declared using the `?` syntax (e.g., `int?`) or `Nullable<T>`. Nullable types have two properties: `HasValue` (boolean indicating if a value exists) and `Value` (the actual value if HasValue is true).

### 10. What is the difference between `ref` and `out` parameters?

Both `ref` and `out` pass arguments by reference, allowing the method to modify the original variable. The key difference is that `ref` requires the variable to be initialized before being passed, while `out` does not require initialization but must be assigned a value within the method before returning.

### 11. What is an enum in C#?

An enum (enumeration) is a distinct value type that defines a set of named constants. By default, the underlying type is int and values start at 0. Enums improve code readability and type safety by providing meaningful names for numeric values.

### 12. What is the difference between `break` and `continue`?

`break` immediately terminates the loop and transfers control to the statement following the loop. `continue` skips the remaining statements in the current iteration and moves to the next iteration of the loop.

### 13. What is type casting in C#?

Type casting is the process of converting a value from one data type to another. Implicit casting occurs automatically when converting to a larger type (no data loss). Explicit casting requires the cast operator and may result in data loss or exceptions. C# also provides conversion methods like `Convert.ToInt32()` and `int.Parse()`.

### 14. What is the `var` keyword?

The `var` keyword enables implicit type inference where the compiler determines the variable's type based on the assigned value. The type is still strongly typed and determined at compile time. `var` can only be used for local variables that are initialized at declaration.

### 15. What is the difference between `Array` and `ArrayList`?

`Array` is a fixed-size, strongly-typed collection that stores elements of a specific type. It offers better performance and type safety.

`ArrayList` is a non-generic, dynamically-sized collection that can store objects of any type. It involves boxing/unboxing for value types and lacks compile-time type checking. `List<T>` is the preferred generic alternative to `ArrayList`.

### 16. What are properties in C#?

Properties are members that provide a flexible mechanism to read, write, or compute values of private fields. They use `get` and `set` accessors. Auto-implemented properties allow you to define properties without explicitly declaring backing fields. Properties enable encapsulation while providing a simple syntax similar to field access.

### 17. What is a constructor?

A constructor is a special method that initializes an object when it's created. It has the same name as the class and no return type. C# supports default constructors, parameterized constructors, static constructors (for initializing static members), and copy constructors. If no constructor is defined, the compiler provides a default parameterless constructor.

### 18. What is method overloading?

Method overloading allows multiple methods with the same name but different parameter lists (different number, type, or order of parameters) within the same class. The return type alone cannot differentiate overloaded methods. The compiler determines which method to call based on the arguments provided.

### 19. What is the `this` keyword?

The `this` keyword refers to the current instance of the class. It's used to distinguish between instance members and local variables with the same name, to pass the current object as a parameter, and to call other constructors in the same class using constructor chaining.

### 20. What is the `static` keyword?

The `static` keyword declares members that belong to the type itself rather than to any specific instance. Static members are shared across all instances and can be accessed without creating an object. Static classes can only contain static members and cannot be instantiated.

### 21. What is the difference between `throw` and `throw ex`?

`throw` (without an exception object) rethrows the current exception while preserving the original stack trace. `throw ex` throws the specified exception and resets the stack trace to the current location, making it harder to trace the original source of the error. Using `throw` is preferred for rethrowing exceptions.

### 22. What is a namespace?

A namespace is a container that organizes code elements and prevents naming conflicts. It provides a hierarchical way to group related classes, interfaces, and other types. The `using` directive imports namespaces for convenient access to their types.

### 23. What is the difference between `Parse()` and `TryParse()`?

`Parse()` converts a string to a specific type and throws an exception if the conversion fails. `TryParse()` attempts the conversion and returns a boolean indicating success or failure, with the result stored in an out parameter. `TryParse()` is safer and more performant when dealing with potentially invalid input.

### 24. What is the `default` keyword?

The `default` keyword returns the default value of a type: null for reference types, zero for numeric types, false for bool, and default values for all fields in structs. In C# 7.1+, `default` can be used without specifying the type when the type can be inferred.

### 25. What are comments in C#?

C# supports three types of comments: single-line comments using `//`, multi-line comments using `/* */`, and XML documentation comments using `///`. Documentation comments can be processed to generate API documentation.

---

## Intermediate Level Questions

### 26. What is Object-Oriented Programming (OOP)?

OOP is a programming paradigm based on the concept of objects that contain data (fields/properties) and behavior (methods). The four main pillars of OOP are encapsulation (hiding internal details), inheritance (deriving new classes from existing ones), polymorphism (objects taking multiple forms), and abstraction (exposing only essential features).

### 27. What is inheritance in C#?

Inheritance allows a class (derived/child) to inherit members from another class (base/parent). C# supports single inheritance for classes but allows implementing multiple interfaces. The derived class can access non-private members of the base class and can override virtual methods. The `base` keyword references the base class.

### 28. What is polymorphism?

Polymorphism allows objects to be treated as instances of their parent class. Compile-time polymorphism is achieved through method overloading and operator overloading. Runtime polymorphism is achieved through method overriding using virtual methods and the override keyword. It enables writing flexible, extensible code.

### 29. What is the difference between abstract class and interface?

Abstract classes can contain implemented methods, fields, and constructors. A class can inherit only one abstract class. Abstract classes can have access modifiers on members and can define state.

Interfaces (before C# 8) could only contain method signatures without implementation. A class can implement multiple interfaces. All interface members were implicitly public. C# 8+ allows default implementations in interfaces.

### 30. What is encapsulation?

Encapsulation is the bundling of data and methods that operate on that data within a single unit (class), while restricting direct access to some components. It's implemented using access modifiers and properties. Encapsulation protects data integrity and hides implementation details.

### 31. What is abstraction?

Abstraction is the process of hiding complex implementation details and showing only the essential features. It's achieved through abstract classes and interfaces. Abstraction focuses on what an object does rather than how it does it, reducing complexity and isolating the impact of changes.

### 32. What are delegates?

Delegates are type-safe function pointers that hold references to methods with specific signatures. They enable passing methods as parameters, defining callback methods, and implementing event handling. Delegates can be chained together (multicast delegates) to invoke multiple methods.

### 33. What are events in C#?

Events are a way for a class to notify other classes when something of interest occurs. They are based on delegates and follow the publisher-subscriber pattern. The class raising the event is the publisher, and classes handling the event are subscribers. Events use the `event` keyword and provide encapsulation over delegates.

### 34. What is LINQ?

LINQ (Language Integrated Query) is a set of features that enables querying data from various sources using a consistent syntax. It supports querying collections, databases (LINQ to SQL/Entity Framework), XML, and more. LINQ uses extension methods, lambda expressions, and anonymous types to provide a SQL-like query syntax directly in C#.

### 35. What are lambda expressions?

Lambda expressions are anonymous functions used to create delegates or expression trees. They use the `=>` operator to separate parameters from the body. Lambda expressions can be single-expression (expression lambdas) or multi-statement (statement lambdas). They're commonly used with LINQ and functional programming patterns.

### 36. What is the difference between `IEnumerable` and `IQueryable`?

`IEnumerable<T>` executes queries in memory (client-side) and is suitable for in-memory collections. It uses LINQ to Objects.

`IQueryable<T>` builds expression trees that can be translated to other query languages (like SQL). It enables server-side filtering for database queries, improving performance by reducing data transfer. It's used with LINQ to SQL/Entity Framework.

### 37. What are extension methods?

Extension methods allow adding new methods to existing types without modifying their source code or creating derived types. They are static methods in static classes with the `this` keyword before the first parameter. Extension methods appear as instance methods on the extended type.

### 38. What is the difference between `IEnumerable` and `ICollection`?

`IEnumerable<T>` provides forward-only iteration over a collection using `GetEnumerator()`. It's the most basic collection interface.

`ICollection<T>` extends `IEnumerable<T>` and adds the `Count` property and methods for adding, removing, clearing items, and checking containment. It represents a modifiable collection with known size.

### 39. What are generics in C#?

Generics allow creating type-safe, reusable code that works with any data type. They use type parameters (like `T`) that are specified when the generic type is used. Generics provide compile-time type checking, eliminate boxing/unboxing for value types, and reduce code duplication. Constraints can limit the types that can be used as type arguments.

### 40. What is the `yield` keyword?

The `yield` keyword is used in iterator methods to return elements one at a time. `yield return` returns a value and pauses execution until the next element is requested. `yield break` ends the iteration. Iterators enable lazy evaluation and efficient processing of large sequences.

### 41. What is the difference between `Dispose` and `Finalize`?

`Dispose()` is explicitly called to release unmanaged resources immediately. It's part of the `IDisposable` interface and can be used with the `using` statement for automatic cleanup.

`Finalize()` (destructor) is called by the garbage collector before an object is destroyed. It's non-deterministic and adds GC overhead. The dispose pattern often uses both for proper resource management.

### 42. What is exception handling?

Exception handling is a mechanism to handle runtime errors gracefully. It uses `try` (code that might throw), `catch` (handles specific exceptions), `finally` (cleanup code that always runs), and `throw` (raises exceptions). C# 6+ introduced exception filters using `when` clause.

### 43. What is the difference between `List<T>` and `Dictionary<TKey, TValue>`?

`List<T>` is an ordered collection of elements accessed by index. It supports duplicate values and provides O(n) lookup by value.

`Dictionary<TKey, TValue>` is a collection of key-value pairs with unique keys. It provides O(1) average-case lookup by key using hash codes. Choose based on whether you need index-based or key-based access.

### 44. What is the `sealed` keyword?

The `sealed` keyword prevents inheritance when applied to a class. When applied to a method or property in a derived class, it prevents further overriding in subsequent derived classes. Sealed classes can provide minor performance benefits and enforce design constraints.

### 45. What is the difference between `virtual` and `abstract` methods?

`virtual` methods have a default implementation in the base class that derived classes may optionally override using the `override` keyword.

`abstract` methods have no implementation and must be overridden in derived classes. Abstract methods can only exist in abstract classes. Both support runtime polymorphism.

### 46. What is method hiding (using `new` keyword)?

Method hiding occurs when a derived class defines a method with the same name as a base class method without using `override`. The `new` keyword explicitly hides the base method. Unlike overriding, method hiding doesn't participate in polymorphism; the called method depends on the variable's declared type, not the actual object type.

### 47. What is a partial class?

Partial classes allow splitting a class definition across multiple files using the `partial` keyword. All parts are combined at compile time. This is useful for separating generated code from user code, organizing large classes, and enabling multiple developers to work on the same class.

### 48. What are indexers?

Indexers allow objects to be indexed like arrays using square bracket notation. They use the `this` keyword with parameters and can have get/set accessors. Indexers enable intuitive access patterns for collections and data structures.

### 49. What is operator overloading?

Operator overloading allows defining custom behavior for operators when used with user-defined types. Operators are overloaded using static methods with the `operator` keyword. Not all operators can be overloaded, and some must be overloaded in pairs (like == and !=).

### 50. What is the `checked` and `unchecked` keyword?

`checked` enables overflow checking for arithmetic operations, throwing an `OverflowException` when overflow occurs. `unchecked` disables overflow checking, allowing silent wraparound. By default, constant expressions are checked while runtime expressions are unchecked.

### 51. What are attributes in C#?

Attributes are metadata that can be attached to code elements (assemblies, classes, methods, parameters, etc.). They're enclosed in square brackets and can contain positional or named parameters. Reflection is used to read attribute information at runtime. Common attributes include `[Obsolete]`, `[Serializable]`, and `[Test]`.

### 52. What is reflection?

Reflection allows inspecting and manipulating type information at runtime. It enables discovering type members, creating instances dynamically, invoking methods, and accessing fields/properties. Reflection is powerful but has performance overhead. It's used in serialization, dependency injection, and testing frameworks.

### 53. What is serialization?

Serialization is converting an object into a format that can be stored or transmitted. Deserialization is the reverse process. C# supports various serialization formats including binary, XML, and JSON. The `System.Text.Json` namespace provides modern JSON serialization, while `Newtonsoft.Json` is a popular third-party library.

### 54. What is the `using` statement?

The `using` statement ensures that `IDisposable` objects are properly disposed after use, even if exceptions occur. It's syntactic sugar for a try-finally block that calls `Dispose()`. C# 8 introduced using declarations that dispose when the variable goes out of scope.

### 55. What is the difference between `struct` and `class`?

Structs are value types stored on the stack (typically), while classes are reference types stored on the heap. Structs cannot inherit from other structs/classes and cannot be inherited. Structs have default parameterless constructors and are more suitable for small, lightweight data structures with value semantics.

---

## Advanced Level Questions

### 56. What is async/await?

`async` and `await` enable asynchronous programming without blocking threads. `async` marks a method as asynchronous and allows using `await`. `await` pauses execution until the awaited task completes, freeing the thread for other work. This pattern improves scalability in I/O-bound operations and maintains responsive UIs.

### 57. What is the Task Parallel Library (TPL)?

TPL is a set of APIs in `System.Threading.Tasks` for parallel and asynchronous programming. It provides `Task` and `Task<T>` for representing asynchronous operations, `Parallel.For/ForEach` for data parallelism, and `PLINQ` for parallel LINQ queries. TPL abstracts thread management and uses the thread pool efficiently.

### 58. What is the difference between `Task` and `Thread`?

`Thread` represents an OS thread with direct control over execution. Creating threads is expensive and doesn't scale well.

`Task` represents an asynchronous operation that may or may not run on a separate thread. Tasks use the thread pool, support continuation, cancellation, and exception handling. Tasks are preferred for most asynchronous scenarios.

### 59. What is `ConfigureAwait(false)`?

By default, after `await`, execution resumes on the original synchronization context (like the UI thread). `ConfigureAwait(false)` indicates that the continuation doesn't need to run on the original context. This can improve performance in library code by avoiding unnecessary context switching but shouldn't be used in UI event handlers.

### 60. What are covariance and contravariance?

Covariance allows assigning a more derived generic type to a less derived one (using `out` keyword). For example, `IEnumerable<string>` can be assigned to `IEnumerable<object>`.

Contravariance allows the opposite (using `in` keyword). For example, `Action<object>` can be assigned to `Action<string>`.

These concepts enable more flexible generic type assignments while maintaining type safety.

### 61. What is dependency injection?

Dependency injection is a design pattern where dependencies are provided to a class rather than created inside it. This promotes loose coupling, testability, and flexibility. C# supports DI through constructor injection, property injection, and method injection. .NET Core has built-in DI container support.

### 62. What is the Repository Pattern?

The repository pattern abstracts data access logic behind an interface, providing a collection-like API for accessing domain objects. It decouples business logic from data access implementation, enables unit testing with mock repositories, and centralizes data access logic.

### 63. What is the Unit of Work Pattern?

The Unit of Work pattern maintains a list of objects affected by a business transaction and coordinates writing changes to the database. It ensures multiple operations are treated as a single atomic transaction. Entity Framework's `DbContext` implements this pattern through its change tracking and `SaveChanges()` method.

### 64. What are expression trees?

Expression trees represent code as a data structure that can be examined, modified, or compiled at runtime. They're created using the `Expression<T>` type and are the foundation of LINQ providers like Entity Framework. Expression trees enable translating C# code to other formats like SQL.

### 65. What is garbage collection in C#?

Garbage collection (GC) automatically manages memory by reclaiming objects that are no longer referenced. The .NET GC is generational (Gen 0, 1, 2) based on object lifetime. It uses mark-and-sweep algorithm and runs non-deterministically. Large objects (>85KB) go to the Large Object Heap. GC can be influenced using `GC.Collect()`, though this is rarely recommended.

### 66. What are the generations in garbage collection?

Generation 0 contains short-lived objects and is collected most frequently. Objects surviving Gen 0 collection are promoted to Generation 1. Generation 1 serves as a buffer between short and long-lived objects. Generation 2 contains long-lived objects and is collected least frequently. This generational approach optimizes GC performance based on the observation that most objects die young.

### 67. What is the `Span<T>` type?

`Span<T>` is a stack-only type that provides a type-safe, memory-safe view over contiguous memory regions (arrays, stack-allocated memory, native memory). It enables high-performance, allocation-free operations on memory. `ReadOnlySpan<T>` provides read-only access. `Memory<T>` is the heap-based counterpart that can be stored in fields.

### 68. What are records in C#?

Records (C# 9+) are reference types designed for immutable data with value-based equality. They provide built-in implementations of `Equals()`, `GetHashCode()`, and `ToString()`. Records support positional syntax, `with` expressions for non-destructive mutation, and inheritance. C# 10 introduced record structs for value-type records.

### 69. What is pattern matching?

Pattern matching allows testing values against patterns and extracting information. C# supports various patterns including type patterns, constant patterns, property patterns, positional patterns, relational patterns (C# 9), and logical patterns (and, or, not). Pattern matching can be used in `is` expressions, `switch` statements/expressions, and `catch` clauses.

### 70. What are tuples in C#?

Tuples are lightweight data structures for grouping multiple values. C# 7 introduced value tuples with named elements: `(string Name, int Age) person = ("John", 30)`. Tuples support deconstruction, equality comparison, and are useful for returning multiple values from methods without creating custom types.

### 71. What is `dynamic` type?

The `dynamic` type bypasses compile-time type checking, deferring resolution to runtime. Operations on dynamic variables are resolved using the Dynamic Language Runtime (DLR). It's useful for COM interop, working with dynamic languages, and reflection scenarios. Misuse leads to runtime errors and performance overhead.

### 72. What is the difference between `Task.Run` and `Task.Factory.StartNew`?

`Task.Run` is a shortcut that creates and starts a task with default options suitable for CPU-bound work. It uses the thread pool and has sensible defaults.

`Task.Factory.StartNew` provides more configuration options (scheduler, creation options, etc.) but requires careful use to avoid common pitfalls. `Task.Run` is preferred for most scenarios.

### 73. What is `SynchronizationContext`?

`SynchronizationContext` represents a target execution environment for posting work. It's used by `await` to resume on the appropriate context. UI frameworks have synchronization contexts that marshal work to the UI thread. Server environments typically have no synchronization context. Understanding this is crucial for avoiding deadlocks.

### 74. What is the volatile keyword?

The `volatile` keyword indicates that a field might be modified by multiple threads. It prevents the compiler and CPU from reordering reads/writes to the field and ensures visibility of changes across threads. However, `volatile` doesn't make operations atomic; for that, use `Interlocked` methods or locks.

### 75. What is `Interlocked` class?

The `Interlocked` class provides atomic operations for variables shared between threads. Methods include `Increment`, `Decrement`, `Add`, `Exchange`, and `CompareExchange`. These operations are faster than locks for simple atomic updates and guarantee thread safety without explicit synchronization.

### 76. What are concurrent collections?

Concurrent collections in `System.Collections.Concurrent` are thread-safe collections designed for multi-threaded scenarios. They include `ConcurrentDictionary`, `ConcurrentQueue`, `ConcurrentStack`, `ConcurrentBag`, and `BlockingCollection`. These collections handle synchronization internally, often using lock-free algorithms for better performance.

### 77. What is `lock` statement?

The `lock` statement ensures that only one thread can execute a code block at a time. It uses a mutex internally. Best practices include locking on private readonly reference objects, avoiding locking on `this`, strings, or types, and keeping locked sections short to minimize contention.

### 78. What is deadlock and how to prevent it?

A deadlock occurs when two or more threads are blocked forever, each waiting for the other to release a resource. Prevention strategies include acquiring locks in a consistent order, using timeout with locks (`Monitor.TryEnter`), avoiding nested locks when possible, and using `lock` hierarchies. Async deadlocks can occur when blocking on async code.

### 79. What is a `WeakReference`?

`WeakReference` holds a reference to an object without preventing garbage collection. It's useful for caches where objects should be collected under memory pressure. The `Target` property returns the object if it hasn't been collected, otherwise null. `WeakReference<T>` provides a strongly-typed version.

### 80. What is the `IComparable` vs `IComparer` interface?

`IComparable<T>` defines the default comparison behavior within a type through `CompareTo()`. It's implemented by the type being compared.

`IComparer<T>` defines comparison externally through `Compare()`. It allows defining multiple comparison strategies without modifying the original type. Both are used by sorting methods.

### 81. What is the difference between `Func` and `Action`?

`Func<T>` is a delegate type that returns a value. The last type parameter is the return type.

`Action<T>` is a delegate type that returns void.

Both can take up to 16 input parameters. They're commonly used with LINQ methods and as method parameters for callbacks.

### 82. What is `Lazy<T>`?

`Lazy<T>` provides lazy initialization, deferring object creation until first access. It's thread-safe by default and guarantees the initialization function runs only once. The `Value` property triggers initialization and returns the instance. It's useful for expensive objects that may not be needed.

### 83. What are source generators?

Source generators (C# 9+) are compile-time code generators that inspect existing code and generate additional source files. They run during compilation and can analyze syntax trees and semantic models. Use cases include reducing boilerplate, compile-time validation, and generating serialization code.

### 84. What is the null-conditional operator?

The null-conditional operator (`?.` and `?[]`) safely accesses members when the object might be null. It returns null if the left operand is null instead of throwing `NullReferenceException`. It can be chained and combined with the null-coalescing operator (`??`) for default values.

### 85. What is the null-coalescing assignment operator?

The null-coalescing assignment operator (`??=`) introduced in C# 8 assigns the right-hand value to the left-hand variable only if the left-hand is null. It simplifies patterns like `if (x == null) x = defaultValue;` to `x ??= defaultValue;`.

### 86. What are init-only properties?

Init-only properties (C# 9) use the `init` accessor instead of `set`, allowing property setting only during object initialization. This enables immutable types with object initializer syntax. Init-only properties can only be set in constructors, object initializers, or with `with` expressions for records.

### 87. What is `required` modifier?

The `required` modifier (C# 11) marks a property or field as required during object initialization. The compiler ensures required members are set in object initializers. This enables enforcing initialization without constructor parameters while maintaining immutability with init-only setters.

### 88. What are file-scoped namespaces?

File-scoped namespaces (C# 10) apply a namespace to the entire file without nesting. Using `namespace MyNamespace;` instead of braces reduces indentation and clutter. Only one file-scoped namespace is allowed per file, and it cannot be combined with traditional namespace declarations.

### 89. What is the `global using` directive?

Global using directives (C# 10) apply using statements across all files in a project. They're typically placed in a dedicated file or enabled through project settings. This reduces repetitive using statements for commonly used namespaces like `System` and `System.Collections.Generic`.

### 90. What are raw string literals?

Raw string literals (C# 11) are delimited by at least three quotes (`"""`) and can span multiple lines without escape sequences. The number of quotes in delimiters must exceed any sequence in the content. They support interpolation with matching number of `$` signs and preserve formatting.

### 91. What is list patterns?

List patterns (C# 11) enable matching against lists and arrays using pattern syntax. Patterns include length patterns (`[_, _, _]`), slice patterns (`[.., last]`), and value patterns. They work with `switch` expressions and provide concise array deconstruction and matching.

### 92. What is the difference between `FirstOrDefault` and `SingleOrDefault`?

`FirstOrDefault` returns the first element matching a condition or default if none found. It doesn't throw if multiple elements match.

`SingleOrDefault` returns the only element matching a condition. It throws if more than one element matches. Use `Single`/`SingleOrDefault` when exactly one match is expected.

### 93. What is middleware in ASP.NET Core?

Middleware are components that form a request processing pipeline. Each middleware can handle requests, pass them to the next component, and process responses. They're configured using `Use`, `Map`, and `Run` methods. Common middleware handles authentication, routing, CORS, exception handling, and static files.

### 94. What is the difference between `AddSingleton`, `AddScoped`, and `AddTransient`?

These are service lifetimes in .NET dependency injection. `AddSingleton` creates one instance for the application lifetime. `AddScoped` creates one instance per request/scope. `AddTransient` creates a new instance every time it's requested. Choose based on whether the service has state and how it should be shared.

### 95. What is Entity Framework Core?

Entity Framework Core is an ORM (Object-Relational Mapper) for .NET. It enables working with databases using C# objects without writing SQL. Features include LINQ queries, change tracking, migrations, lazy/eager loading, and support for multiple database providers. Code-First and Database-First approaches are supported.

---

## Coding & Machine Test Questions

### 96. Reverse a String

```csharp
// Method 1: Using Array.Reverse
public static string ReverseString(string input)
{
    if (string.IsNullOrEmpty(input)) return input;
    
    char[] charArray = input.ToCharArray();
    Array.Reverse(charArray);
    return new string(charArray);
}

// Method 2: Using LINQ
public static string ReverseStringLinq(string input)
{
    if (string.IsNullOrEmpty(input)) return input;
    return new string(input.Reverse().ToArray());
}

// Method 3: Using StringBuilder (manual)
public static string ReverseStringManual(string input)
{
    if (string.IsNullOrEmpty(input)) return input;
    
    var sb = new StringBuilder(input.Length);
    for (int i = input.Length - 1; i >= 0; i--)
    {
        sb.Append(input[i]);
    }
    return sb.ToString();
}

// Method 4: Using recursion
public static string ReverseStringRecursive(string input)
{
    if (string.IsNullOrEmpty(input) || input.Length == 1)
        return input;
    
    return ReverseStringRecursive(input.Substring(1)) + input[0];
}
```

### 97. Check if a String is Palindrome

```csharp
// Method 1: Simple comparison
public static bool IsPalindrome(string input)
{
    if (string.IsNullOrEmpty(input)) return true;
    
    input = input.ToLower().Replace(" ", "");
    int left = 0, right = input.Length - 1;
    
    while (left < right)
    {
        if (input[left] != input[right])
            return false;
        left++;
        right--;
    }
    return true;
}

// Method 2: Using LINQ
public static bool IsPalindromeLinq(string input)
{
    if (string.IsNullOrEmpty(input)) return true;
    
    var cleaned = new string(input.ToLower().Where(char.IsLetterOrDigit).ToArray());
    return cleaned.SequenceEqual(cleaned.Reverse());
}

// Method 3: Using recursion
public static bool IsPalindromeRecursive(string input, int start, int end)
{
    if (start >= end) return true;
    if (input[start] != input[end]) return false;
    return IsPalindromeRecursive(input, start + 1, end - 1);
}
```

### 98. Find Fibonacci Series

```csharp
// Method 1: Iterative approach
public static List<long> FibonacciIterative(int count)
{
    var result = new List<long>();
    if (count <= 0) return result;
    
    long a = 0, b = 1;
    for (int i = 0; i < count; i++)
    {
        result.Add(a);
        long temp = a;
        a = b;
        b = temp + b;
    }
    return result;
}

// Method 2: Recursive with memoization
private static Dictionary<int, long> memo = new Dictionary<int, long>();

public static long FibonacciMemoized(int n)
{
    if (n <= 1) return n;
    
    if (memo.ContainsKey(n))
        return memo[n];
    
    memo[n] = FibonacciMemoized(n - 1) + FibonacciMemoized(n - 2);
    return memo[n];
}

// Method 3: Using yield (lazy evaluation)
public static IEnumerable<long> FibonacciSequence()
{
    long a = 0, b = 1;
    while (true)
    {
        yield return a;
        (a, b) = (b, a + b);
    }
}

// Usage: FibonacciSequence().Take(10).ToList()
```

### 99. Check if a Number is Prime

```csharp
// Method 1: Basic approach
public static bool IsPrime(int number)
{
    if (number <= 1) return false;
    if (number <= 3) return true;
    if (number % 2 == 0 || number % 3 == 0) return false;
    
    for (int i = 5; i * i <= number; i += 6)
    {
        if (number % i == 0 || number % (i + 2) == 0)
            return false;
    }
    return true;
}

// Method 2: Find all primes up to n (Sieve of Eratosthenes)
public static List<int> SieveOfEratosthenes(int n)
{
    var isPrime = new bool[n + 1];
    Array.Fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;
    
    for (int i = 2; i * i <= n; i++)
    {
        if (isPrime[i])
        {
            for (int j = i * i; j <= n; j += i)
                isPrime[j] = false;
        }
    }
    
    return Enumerable.Range(2, n - 1).Where(i => isPrime[i]).ToList();
}
```

### 100. Find Factorial

```csharp
// Method 1: Iterative
public static long FactorialIterative(int n)
{
    if (n < 0) throw new ArgumentException("Negative numbers not allowed");
    
    long result = 1;
    for (int i = 2; i <= n; i++)
        result *= i;
    
    return result;
}

// Method 2: Recursive
public static long FactorialRecursive(int n)
{
    if (n < 0) throw new ArgumentException("Negative numbers not allowed");
    if (n <= 1) return 1;
    return n * FactorialRecursive(n - 1);
}

// Method 3: Using LINQ
public static long FactorialLinq(int n)
{
    if (n < 0) throw new ArgumentException("Negative numbers not allowed");
    if (n <= 1) return 1;
    return Enumerable.Range(1, n).Aggregate(1L, (acc, x) => acc * x);
}
```

### 101. Find Second Largest Number in Array

```csharp
// Method 1: Sorting approach
public static int SecondLargestSort(int[] arr)
{
    if (arr == null || arr.Length < 2)
        throw new ArgumentException("Array must have at least 2 elements");
    
    return arr.Distinct().OrderByDescending(x => x).Skip(1).First();
}

// Method 2: Single pass (optimal)
public static int SecondLargestOptimal(int[] arr)
{
    if (arr == null || arr.Length < 2)
        throw new ArgumentException("Array must have at least 2 elements");
    
    int first = int.MinValue, second = int.MinValue;
    
    foreach (int num in arr)
    {
        if (num > first)
        {
            second = first;
            first = num;
        }
        else if (num > second && num != first)
        {
            second = num;
        }
    }
    
    if (second == int.MinValue)
        throw new InvalidOperationException("No second largest element found");
    
    return second;
}
```

### 102. Find Duplicate Elements in Array

```csharp
// Method 1: Using HashSet
public static List<int> FindDuplicatesHashSet(int[] arr)
{
    var seen = new HashSet<int>();
    var duplicates = new HashSet<int>();
    
    foreach (int num in arr)
    {
        if (!seen.Add(num))
            duplicates.Add(num);
    }
    
    return duplicates.ToList();
}

// Method 2: Using LINQ
public static List<int> FindDuplicatesLinq(int[] arr)
{
    return arr.GroupBy(x => x)
              .Where(g => g.Count() > 1)
              .Select(g => g.Key)
              .ToList();
}

// Method 3: Using Dictionary (with count)
public static Dictionary<int, int> FindDuplicatesWithCount(int[] arr)
{
    return arr.GroupBy(x => x)
              .Where(g => g.Count() > 1)
              .ToDictionary(g => g.Key, g => g.Count());
}
```

### 103. Remove Duplicates from Array

```csharp
// Method 1: Using LINQ
public static int[] RemoveDuplicatesLinq(int[] arr)
{
    return arr.Distinct().ToArray();
}

// Method 2: Using HashSet
public static int[] RemoveDuplicatesHashSet(int[] arr)
{
    return new HashSet<int>(arr).ToArray();
}

// Method 3: Preserve order with LinkedHashSet equivalent
public static List<int> RemoveDuplicatesPreserveOrder(int[] arr)
{
    var result = new List<int>();
    var seen = new HashSet<int>();
    
    foreach (int num in arr)
    {
        if (seen.Add(num))
            result.Add(num);
    }
    
    return result;
}
```

### 104. Sort Array without Built-in Functions

```csharp
// Method 1: Bubble Sort
public static void BubbleSort(int[] arr)
{
    int n = arr.Length;
    for (int i = 0; i < n - 1; i++)
    {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++)
        {
            if (arr[j] > arr[j + 1])
            {
                (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

// Method 2: Quick Sort
public static void QuickSort(int[] arr, int low, int high)
{
    if (low < high)
    {
        int pi = Partition(arr, low, high);
        QuickSort(arr, low, pi - 1);
        QuickSort(arr, pi + 1, high);
    }
}

private static int Partition(int[] arr, int low, int high)
{
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++)
    {
        if (arr[j] < pivot)
        {
            i++;
            (arr[i], arr[j]) = (arr[j], arr[i]);
        }
    }
    (arr[i + 1], arr[high]) = (arr[high], arr[i + 1]);
    return i + 1;
}

// Method 3: Merge Sort
public static void MergeSort(int[] arr, int left, int right)
{
    if (left < right)
    {
        int mid = left + (right - left) / 2;
        MergeSort(arr, left, mid);
        MergeSort(arr, mid + 1, right);
        Merge(arr, left, mid, right);
    }
}

private static void Merge(int[] arr, int left, int mid, int right)
{
    var leftArr = arr[left..(mid + 1)];
    var rightArr = arr[(mid + 1)..(right + 1)];
    
    int i = 0, j = 0, k = left;
    
    while (i < leftArr.Length && j < rightArr.Length)
    {
        arr[k++] = leftArr[i] <= rightArr[j] ? leftArr[i++] : rightArr[j++];
    }
    
    while (i < leftArr.Length) arr[k++] = leftArr[i++];
    while (j < rightArr.Length) arr[k++] = rightArr[j++];
}
```

### 105. Find Missing Number in Array (1 to n)

```csharp
// Method 1: Using formula (sum approach)
public static int FindMissingNumber(int[] arr, int n)
{
    long expectedSum = (long)n * (n + 1) / 2;
    long actualSum = arr.Sum();
    return (int)(expectedSum - actualSum);
}

// Method 2: Using XOR
public static int FindMissingNumberXor(int[] arr, int n)
{
    int xor1 = 0, xor2 = 0;
    
    foreach (int num in arr)
        xor1 ^= num;
    
    for (int i = 1; i <= n; i++)
        xor2 ^= i;
    
    return xor1 ^ xor2;
}

// Method 3: Using HashSet
public static int FindMissingNumberHashSet(int[] arr, int n)
{
    var set = new HashSet<int>(arr);
    
    for (int i = 1; i <= n; i++)
    {
        if (!set.Contains(i))
            return i;
    }
    
    return -1;
}
```

### 106. Implement Binary Search

```csharp
// Method 1: Iterative
public static int BinarySearchIterative(int[] arr, int target)
{
    int left = 0, right = arr.Length - 1;
    
    while (left <= right)
    {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target)
            return mid;
        
        if (arr[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }
    
    return -1;
}

// Method 2: Recursive
public static int BinarySearchRecursive(int[] arr, int target, int left, int right)
{
    if (left > right)
        return -1;
    
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == target)
        return mid;
    
    if (arr[mid] < target)
        return BinarySearchRecursive(arr, target, mid + 1, right);
    
    return BinarySearchRecursive(arr, target, left, mid - 1);
}

// Method 3: Using Array.BinarySearch
public static int BinarySearchBuiltIn(int[] arr, int target)
{
    int index = Array.BinarySearch(arr, target);
    return index >= 0 ? index : -1;
}
```

### 107. Find First Non-Repeated Character in String

```csharp
// Method 1: Using Dictionary
public static char? FirstNonRepeatedChar(string str)
{
    var charCount = new Dictionary<char, int>();
    
    foreach (char c in str)
    {
        charCount[c] = charCount.GetValueOrDefault(c, 0) + 1;
    }
    
    foreach (char c in str)
    {
        if (charCount[c] == 1)
            return c;
    }
    
    return null;
}

// Method 2: Using LINQ
public static char? FirstNonRepeatedCharLinq(string str)
{
    return str.GroupBy(c => c)
              .FirstOrDefault(g => g.Count() == 1)?.Key;
}

// Method 3: Using IndexOf and LastIndexOf
public static char? FirstNonRepeatedCharIndex(string str)
{
    foreach (char c in str)
    {
        if (str.IndexOf(c) == str.LastIndexOf(c))
            return c;
    }
    return null;
}
```

### 108. Check if Two Strings are Anagrams

```csharp
// Method 1: Sorting approach
public static bool AreAnagramsSort(string str1, string str2)
{
    if (str1.Length != str2.Length) return false;
    
    var sorted1 = string.Concat(str1.ToLower().OrderBy(c => c));
    var sorted2 = string.Concat(str2.ToLower().OrderBy(c => c));
    
    return sorted1 == sorted2;
}

// Method 2: Character count approach
public static bool AreAnagramsCount(string str1, string str2)
{
    if (str1.Length != str2.Length) return false;
    
    var charCount = new int[256];
    
    foreach (char c in str1.ToLower())
        charCount[c]++;
    
    foreach (char c in str2.ToLower())
    {
        charCount[c]--;
        if (charCount[c] < 0)
            return false;
    }
    
    return true;
}

// Method 3: Using LINQ GroupBy
public static bool AreAnagramsLinq(string str1, string str2)
{
    if (str1.Length != str2.Length) return false;
    
    var count1 = str1.ToLower().GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());
    var count2 = str2.ToLower().GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());
    
    return count1.Count == count2.Count && 
           count1.All(kv => count2.TryGetValue(kv.Key, out int val) && val == kv.Value);
}
```

### 109. Implement Stack using Array

```csharp
public class ArrayStack<T>
{
    private T[] _items;
    private int _top;
    private int _capacity;
    
    public ArrayStack(int capacity = 10)
    {
        _capacity = capacity;
        _items = new T[_capacity];
        _top = -1;
    }
    
    public int Count => _top + 1;
    public bool IsEmpty => _top == -1;
    public bool IsFull => _top == _capacity - 1;
    
    public void Push(T item)
    {
        if (IsFull)
        {
            _capacity *= 2;
            var newItems = new T[_capacity];
            Array.Copy(_items, newItems, _items.Length);
            _items = newItems;
        }
        _items[++_top] = item;
    }
    
    public T Pop()
    {
        if (IsEmpty)
            throw new InvalidOperationException("Stack is empty");
        
        T item = _items[_top];
        _items[_top--] = default!;
        return item;
    }
    
    public T Peek()
    {
        if (IsEmpty)
            throw new InvalidOperationException("Stack is empty");
        
        return _items[_top];
    }
}
```

### 110. Implement Queue using Array

```csharp
public class CircularQueue<T>
{
    private T[] _items;
    private int _front;
    private int _rear;
    private int _count;
    private int _capacity;
    
    public CircularQueue(int capacity = 10)
    {
        _capacity = capacity;
        _items = new T[_capacity];
        _front = 0;
        _rear = -1;
        _count = 0;
    }
    
    public int Count => _count;
    public bool IsEmpty => _count == 0;
    public bool IsFull => _count == _capacity;
    
    public void Enqueue(T item)
    {
        if (IsFull)
        {
            var newItems = new T[_capacity * 2];
            for (int i = 0; i < _count; i++)
            {
                newItems[i] = _items[(_front + i) % _capacity];
            }
            _items = newItems;
            _front = 0;
            _rear = _count - 1;
            _capacity *= 2;
        }
        
        _rear = (_rear + 1) % _capacity;
        _items[_rear] = item;
        _count++;
    }
    
    public T Dequeue()
    {
        if (IsEmpty)
            throw new InvalidOperationException("Queue is empty");
        
        T item = _items[_front];
        _items[_front] = default!;
        _front = (_front + 1) % _capacity;
        _count--;
        return item;
    }
    
    public T Peek()
    {
        if (IsEmpty)
            throw new InvalidOperationException("Queue is empty");
        
        return _items[_front];
    }
}
```

### 111. Implement Linked List

```csharp
public class LinkedList<T>
{
    private class Node
    {
        public T Data { get; set; }
        public Node? Next { get; set; }
        
        public Node(T data)
        {
            Data = data;
            Next = null;
        }
    }
    
    private Node? _head;
    private int _count;
    
    public int Count => _count;
    public bool IsEmpty => _head == null;
    
    public void AddFirst(T data)
    {
        var newNode = new Node(data);
        newNode.Next = _head;
        _head = newNode;
        _count++;
    }
    
    public void AddLast(T data)
    {
        var newNode = new Node(data);
        
        if (_head == null)
        {
            _head = newNode;
        }
        else
        {
            var current = _head;
            while (current.Next != null)
                current = current.Next;
            current.Next = newNode;
        }
        _count++;
    }
    
    public bool Remove(T data)
    {
        if (_head == null) return false;
        
        if (EqualityComparer<T>.Default.Equals(_head.Data, data))
        {
            _head = _head.Next;
            _count--;
            return true;
        }
        
        var current = _head;
        while (current.Next != null)
        {
            if (EqualityComparer<T>.Default.Equals(current.Next.Data, data))
            {
                current.Next = current.Next.Next;
                _count--;
                return true;
            }
            current = current.Next;
        }
        
        return false;
    }
    
    public void Reverse()
    {
        Node? prev = null;
        var current = _head;
        
        while (current != null)
        {
            var next = current.Next;
            current.Next = prev;
            prev = current;
            current = next;
        }
        
        _head = prev;
    }
    
    public IEnumerable<T> ToEnumerable()
    {
        var current = _head;
        while (current != null)
        {
            yield return current.Data;
            current = current.Next;
        }
    }
}
```

### 112. Find Longest Substring Without Repeating Characters

```csharp
// Method 1: Sliding window with HashSet
public static string LongestSubstringWithoutRepeating(string s)
{
    if (string.IsNullOrEmpty(s)) return s;
    
    var charSet = new HashSet<char>();
    int maxLength = 0, maxStart = 0;
    int left = 0;
    
    for (int right = 0; right < s.Length; right++)
    {
        while (charSet.Contains(s[right]))
        {
            charSet.Remove(s[left]);
            left++;
        }
        
        charSet.Add(s[right]);
        
        if (right - left + 1 > maxLength)
        {
            maxLength = right - left + 1;
            maxStart = left;
        }
    }
    
    return s.Substring(maxStart, maxLength);
}

// Method 2: Using Dictionary for character positions
public static int LengthOfLongestSubstring(string s)
{
    var charIndex = new Dictionary<char, int>();
    int maxLength = 0, start = 0;
    
    for (int i = 0; i < s.Length; i++)
    {
        if (charIndex.TryGetValue(s[i], out int lastIndex) && lastIndex >= start)
        {
            start = lastIndex + 1;
        }
        
        charIndex[s[i]] = i;
        maxLength = Math.Max(maxLength, i - start + 1);
    }
    
    return maxLength;
}
```

### 113. Two Sum Problem

```csharp
// Method 1: Using Dictionary (O(n) time)
public static int[] TwoSum(int[] nums, int target)
{
    var numToIndex = new Dictionary<int, int>();
    
    for (int i = 0; i < nums.Length; i++)
    {
        int complement = target - nums[i];
        
        if (numToIndex.TryGetValue(complement, out int index))
            return new[] { index, i };
        
        numToIndex[nums[i]] = i;
    }
    
    throw new ArgumentException("No two sum solution");
}

// Method 2: Two-pointer approach (for sorted array)
public static int[] TwoSumSorted(int[] nums, int target)
{
    int left = 0, right = nums.Length - 1;
    
    while (left < right)
    {
        int sum = nums[left] + nums[right];
        
        if (sum == target)
            return new[] { left, right };
        
        if (sum < target)
            left++;
        else
            right--;
    }
    
    throw new ArgumentException("No two sum solution");
}
```

### 114. Implement LRU Cache

```csharp
public class LRUCache<TKey, TValue> where TKey : notnull
{
    private readonly int _capacity;
    private readonly Dictionary<TKey, LinkedListNode<(TKey Key, TValue Value)>> _cache;
    private readonly LinkedList<(TKey Key, TValue Value)> _lruList;
    
    public LRUCache(int capacity)
    {
        _capacity = capacity;
        _cache = new Dictionary<TKey, LinkedListNode<(TKey, TValue)>>(capacity);
        _lruList = new LinkedList<(TKey, TValue)>();
    }
    
    public TValue? Get(TKey key)
    {
        if (_cache.TryGetValue(key, out var node))
        {
            _lruList.Remove(node);
            _lruList.AddFirst(node);
            return node.Value.Value;
        }
        return default;
    }
    
    public void Put(TKey key, TValue value)
    {
        if (_cache.TryGetValue(key, out var existingNode))
        {
            _lruList.Remove(existingNode);
            existingNode.Value = (key, value);
            _lruList.AddFirst(existingNode);
        }
        else
        {
            if (_cache.Count >= _capacity)
            {
                var lru = _lruList.Last!;
                _cache.Remove(lru.Value.Key);
                _lruList.RemoveLast();
            }
            
            var newNode = new LinkedListNode<(TKey, TValue)>((key, value));
            _lruList.AddFirst(newNode);
            _cache[key] = newNode;
        }
    }
}
```

### 115. Merge Two Sorted Arrays

```csharp
// Method 1: Using additional array
public static int[] MergeSortedArrays(int[] arr1, int[] arr2)
{
    int n1 = arr1.Length, n2 = arr2.Length;
    var result = new int[n1 + n2];
    int i = 0, j = 0, k = 0;
    
    while (i < n1 && j < n2)
    {
        result[k++] = arr1[i] <= arr2[j] ? arr1[i++] : arr2[j++];
    }
    
    while (i < n1) result[k++] = arr1[i++];
    while (j < n2) result[k++] = arr2[j++];
    
    return result;
}

// Method 2: In-place merge (arr1 has extra space)
public static void MergeInPlace(int[] arr1, int m, int[] arr2, int n)
{
    int i = m - 1, j = n - 1, k = m + n - 1;
    
    while (i >= 0 && j >= 0)
    {
        arr1[k--] = arr1[i] > arr2[j] ? arr1[i--] : arr2[j--];
    }
    
    while (j >= 0)
        arr1[k--] = arr2[j--];
}
```

### 116. Find All Pairs with Given Sum

```csharp
// Method 1: Using HashSet
public static List<(int, int)> FindPairsWithSum(int[] arr, int target)
{
    var result = new List<(int, int)>();
    var seen = new HashSet<int>();
    var used = new HashSet<int>();
    
    foreach (int num in arr)
    {
        int complement = target - num;
        
        if (seen.Contains(complement) && !used.Contains(num) && !used.Contains(complement))
        {
            result.Add((Math.Min(num, complement), Math.Max(num, complement)));
            used.Add(num);
            used.Add(complement);
        }
        
        seen.Add(num);
    }
    
    return result;
}
```

### 117. Implement String Compression

```csharp
// "aabcccccaaa" -> "a2b1c5a3"
public static string CompressString(string str)
{
    if (string.IsNullOrEmpty(str)) return str;
    
    var sb = new StringBuilder();
    int count = 1;
    
    for (int i = 1; i <= str.Length; i++)
    {
        if (i < str.Length && str[i] == str[i - 1])
        {
            count++;
        }
        else
        {
            sb.Append(str[i - 1]);
            sb.Append(count);
            count = 1;
        }
    }
    
    string compressed = sb.ToString();
    return compressed.Length < str.Length ? compressed : str;
}
```

### 118. Check Balanced Parentheses

```csharp
public static bool AreParenthesesBalanced(string str)
{
    var stack = new Stack<char>();
    var pairs = new Dictionary<char, char>
    {
        { ')', '(' },
        { '}', '{' },
        { ']', '[' }
    };
    
    foreach (char c in str)
    {
        if (c == '(' || c == '{' || c == '[')
        {
            stack.Push(c);
        }
        else if (pairs.ContainsKey(c))
        {
            if (stack.Count == 0 || stack.Pop() != pairs[c])
                return false;
        }
    }
    
    return stack.Count == 0;
}
```

### 119. Rotate Array by K Positions

```csharp
// Method 1: Using reversal algorithm
public static void RotateArrayRight(int[] arr, int k)
{
    int n = arr.Length;
    k = k % n;
    
    Reverse(arr, 0, n - 1);
    Reverse(arr, 0, k - 1);
    Reverse(arr, k, n - 1);
}

private static void Reverse(int[] arr, int start, int end)
{
    while (start < end)
    {
        (arr[start], arr[end]) = (arr[end], arr[start]);
        start++;
        end--;
    }
}

// Method 2: Using LINQ
public static int[] RotateArrayLinq(int[] arr, int k)
{
    k = k % arr.Length;
    return arr.TakeLast(k).Concat(arr.Take(arr.Length - k)).ToArray();
}
```

### 120. Find Maximum Subarray Sum (Kadane's Algorithm)

```csharp
// Method 1: Standard Kadane's Algorithm
public static int MaxSubArraySum(int[] arr)
{
    if (arr.Length == 0) return 0;
    
    int maxSoFar = arr[0];
    int maxEndingHere = arr[0];
    
    for (int i = 1; i < arr.Length; i++)
    {
        maxEndingHere = Math.Max(arr[i], maxEndingHere + arr[i]);
        maxSoFar = Math.Max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

// Method 2: Return subarray indices too
public static (int Sum, int Start, int End) MaxSubArrayWithIndices(int[] arr)
{
    if (arr.Length == 0) return (0, -1, -1);
    
    int maxSoFar = arr[0];
    int maxEndingHere = arr[0];
    int start = 0, end = 0, tempStart = 0;
    
    for (int i = 1; i < arr.Length; i++)
    {
        if (arr[i] > maxEndingHere + arr[i])
        {
            maxEndingHere = arr[i];
            tempStart = i;
        }
        else
        {
            maxEndingHere = maxEndingHere + arr[i];
        }
        
        if (maxEndingHere > maxSoFar)
        {
            maxSoFar = maxEndingHere;
            start = tempStart;
            end = i;
        }
    }
    
    return (maxSoFar, start, end);
}
```

### 121. Find Intersection of Two Arrays

```csharp
// Method 1: Using HashSet
public static int[] Intersection(int[] nums1, int[] nums2)
{
    var set1 = new HashSet<int>(nums1);
    var result = new HashSet<int>();
    
    foreach (int num in nums2)
    {
        if (set1.Contains(num))
            result.Add(num);
    }
    
    return result.ToArray();
}

// Method 2: Using LINQ
public static int[] IntersectionLinq(int[] nums1, int[] nums2)
{
    return nums1.Intersect(nums2).ToArray();
}
```

### 122. Implement Producer-Consumer Pattern

```csharp
public class ProducerConsumer<T>
{
    private readonly BlockingCollection<T> _queue;
    private readonly CancellationTokenSource _cts;
    
    public ProducerConsumer(int boundedCapacity = 100)
    {
        _queue = new BlockingCollection<T>(boundedCapacity);
        _cts = new CancellationTokenSource();
    }
    
    public void Produce(T item) => _queue.Add(item, _cts.Token);
    public T Consume() => _queue.Take(_cts.Token);
    
    public void Stop()
    {
        _queue.CompleteAdding();
        _cts.Cancel();
    }
}
```

### 123. Implement Singleton Pattern

```csharp
// Method 1: Thread-safe with Lazy<T>
public sealed class SingletonLazy
{
    private static readonly Lazy<SingletonLazy> _instance = 
        new Lazy<SingletonLazy>(() => new SingletonLazy());
    
    public static SingletonLazy Instance => _instance.Value;
    private SingletonLazy() { }
}

// Method 2: Double-check locking
public sealed class SingletonDoubleCheck
{
    private static SingletonDoubleCheck? _instance;
    private static readonly object _lock = new object();
    
    public static SingletonDoubleCheck Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    _instance ??= new SingletonDoubleCheck();
                }
            }
            return _instance;
        }
    }
    
    private SingletonDoubleCheck() { }
}
```

### 124. Implement Factory Pattern

```csharp
public interface IVehicle
{
    string GetInfo();
}

public class Car : IVehicle
{
    public string GetInfo() => "Car: 4 wheels";
}

public class Motorcycle : IVehicle
{
    public string GetInfo() => "Motorcycle: 2 wheels";
}

public static class VehicleFactory
{
    public static IVehicle CreateVehicle(string type)
    {
        return type.ToLower() switch
        {
            "car" => new Car(),
            "motorcycle" => new Motorcycle(),
            _ => throw new ArgumentException($"Unknown vehicle type: {type}")
        };
    }
}
```

### 125. Implement Observer Pattern

```csharp
public interface IObserver<T>
{
    void Update(T data);
}

public class StockTicker
{
    private readonly List<IObserver<decimal>> _observers = new();
    private decimal _price;
    
    public decimal Price
    {
        get => _price;
        set
        {
            _price = value;
            foreach (var observer in _observers)
                observer.Update(_price);
        }
    }
    
    public void Attach(IObserver<decimal> observer) => _observers.Add(observer);
    public void Detach(IObserver<decimal> observer) => _observers.Remove(observer);
}
```

### 126. Write Custom LINQ Extension Methods

```csharp
public static class CustomLinqExtensions
{
    public static IEnumerable<T> DistinctBy<T, TKey>(
        this IEnumerable<T> source, 
        Func<T, TKey> keySelector)
    {
        var seenKeys = new HashSet<TKey>();
        foreach (var item in source)
        {
            if (seenKeys.Add(keySelector(item)))
                yield return item;
        }
    }
    
    public static IEnumerable<IEnumerable<T>> Batch<T>(
        this IEnumerable<T> source, 
        int batchSize)
    {
        var batch = new List<T>(batchSize);
        
        foreach (var item in source)
        {
            batch.Add(item);
            if (batch.Count == batchSize)
            {
                yield return batch;
                batch = new List<T>(batchSize);
            }
        }
        
        if (batch.Count > 0)
            yield return batch;
    }
    
    public static void ForEach<T>(this IEnumerable<T> source, Action<T> action)
    {
        foreach (var item in source)
            action(item);
    }
}
```

### 127. Implement Async File Operations

```csharp
public static class AsyncFileOperations
{
    public static async Task<string> ReadFileAsync(string path)
    {
        using var reader = new StreamReader(path);
        return await reader.ReadToEndAsync();
    }
    
    public static async Task WriteFileAsync(string path, string content)
    {
        using var writer = new StreamWriter(path);
        await writer.WriteAsync(content);
    }
    
    public static async IAsyncEnumerable<string> ReadLinesAsync(string path)
    {
        using var reader = new StreamReader(path);
        
        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();
            if (line != null)
                yield return line;
        }
    }
}
```

### 128. Implement Generic Repository Pattern

```csharp
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly DbContext _context;
    protected readonly DbSet<T> _dbSet;
    
    public Repository(DbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }
    
    public virtual async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);
    public virtual async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();
    
    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }
    
    public virtual async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }
    
    public virtual async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
```

### 129. Implement Rate Limiter

```csharp
public class SlidingWindowRateLimiter
{
    private readonly Queue<DateTime> _requestTimes;
    private readonly int _maxRequests;
    private readonly TimeSpan _windowSize;
    private readonly object _lock = new();
    
    public SlidingWindowRateLimiter(int maxRequests, TimeSpan windowSize)
    {
        _maxRequests = maxRequests;
        _windowSize = windowSize;
        _requestTimes = new Queue<DateTime>();
    }
    
    public bool TryAcquire()
    {
        lock (_lock)
        {
            var now = DateTime.UtcNow;
            var windowStart = now - _windowSize;
            
            while (_requestTimes.Count > 0 && _requestTimes.Peek() < windowStart)
                _requestTimes.Dequeue();
            
            if (_requestTimes.Count < _maxRequests)
            {
                _requestTimes.Enqueue(now);
                return true;
            }
            
            return false;
        }
    }
}
```

### 130. Implement Thread-Safe Cache with Expiration

```csharp
public class ExpiringCache<TKey, TValue> where TKey : notnull
{
    private class CacheItem
    {
        public TValue Value { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsExpired => DateTime.UtcNow > ExpiresAt;
        
        public CacheItem(TValue value, DateTime expiresAt)
        {
            Value = value;
            ExpiresAt = expiresAt;
        }
    }
    
    private readonly ConcurrentDictionary<TKey, CacheItem> _cache = new();
    private readonly TimeSpan _defaultExpiration;
    
    public ExpiringCache(TimeSpan defaultExpiration)
    {
        _defaultExpiration = defaultExpiration;
    }
    
    public void Set(TKey key, TValue value, TimeSpan? expiration = null)
    {
        var expiresAt = DateTime.UtcNow + (expiration ?? _defaultExpiration);
        _cache[key] = new CacheItem(value, expiresAt);
    }
    
    public bool TryGet(TKey key, out TValue? value)
    {
        if (_cache.TryGetValue(key, out var item) && !item.IsExpired)
        {
            value = item.Value;
            return true;
        }
        
        _cache.TryRemove(key, out _);
        value = default;
        return false;
    }
    
    public TValue GetOrAdd(TKey key, Func<TKey, TValue> factory, TimeSpan? expiration = null)
    {
        if (TryGet(key, out var value) && value != null)
            return value;
        
        var newValue = factory(key);
        Set(key, newValue, expiration);
        return newValue;
    }
}
```

---

## Quick Reference Tables

### Common Time Complexities

| Algorithm/Operation | Average Case | Worst Case |
|---------------------|--------------|------------|
| Array Access | O(1) | O(1) |
| Array Search | O(n) | O(n) |
| Binary Search | O(log n) | O(log n) |
| Hash Table Lookup | O(1) | O(n) |
| Bubble Sort | O(n²) | O(n²) |
| Quick Sort | O(n log n) | O(n²) |
| Merge Sort | O(n log n) | O(n log n) |
| Heap Operations | O(log n) | O(log n) |

### Collection Comparison

| Collection | Add | Remove | Lookup | Order |
|------------|-----|--------|--------|-------|
| List\<T\> | O(1)* | O(n) | O(n) | Preserved |
| Dictionary\<K,V\> | O(1) | O(1) | O(1) | Not Preserved |
| HashSet\<T\> | O(1) | O(1) | O(1) | Not Preserved |
| SortedList\<K,V\> | O(n) | O(n) | O(log n) | Sorted |
| LinkedList\<T\> | O(1) | O(1) | O(n) | Preserved |
| Queue\<T\> | O(1) | O(1) | O(n) | FIFO |
| Stack\<T\> | O(1) | O(1) | O(n) | LIFO |

### Access Modifier Summary

| Modifier | Same Class | Derived (Same Assembly) | Same Assembly | Derived (Other Assembly) | Other Assembly |
|----------|------------|-------------------------|---------------|--------------------------|----------------|
| public | ✓ | ✓ | ✓ | ✓ | ✓ |
| private | ✓ | ✗ | ✗ | ✗ | ✗ |
| protected | ✓ | ✓ | ✗ | ✓ | ✗ |
| internal | ✓ | ✓ | ✓ | ✗ | ✗ |
| protected internal | ✓ | ✓ | ✓ | ✓ | ✗ |
| private protected | ✓ | ✓ | ✗ | ✗ | ✗ |

### Async/Await Best Practices

| Do | Don't |
|----|-------|
| Use `async Task` for methods without return | Use `async void` except for event handlers |
| Use `ConfigureAwait(false)` in libraries | Block async code with `.Result` or `.Wait()` |
| Return `Task` directly when possible | Create unnecessary `async` wrappers |
| Use `Task.WhenAll` for parallel operations | Await tasks sequentially when independent |
| Handle exceptions in async methods | Ignore `TaskCanceledException` |

### Common Design Patterns

| Pattern | Purpose | Key Components |
|---------|---------|----------------|
| Singleton | Single instance | Private constructor, static instance |
| Factory | Object creation | Creator interface, concrete creators |
| Observer | Event notification | Subject, observers, notify mechanism |
| Strategy | Interchangeable algorithms | Context, strategy interface, concrete strategies |
| Repository | Data access abstraction | Interface, implementation, entities |
| Decorator | Dynamic behavior extension | Component interface, decorators |
| Adapter | Interface compatibility | Target interface, adapter, adaptee |

### SOLID Principles

| Principle | Description |
|-----------|-------------|
| **S**ingle Responsibility | A class should have only one reason to change |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Subtypes must be substitutable for base types |
| **I**nterface Segregation | Many specific interfaces over one general interface |
| **D**ependency Inversion | Depend on abstractions, not concretions |

### Common Exception Types

| Exception | When Thrown |
|-----------|-------------|
| ArgumentNullException | Null argument passed |
| ArgumentException | Invalid argument value |
| InvalidOperationException | Invalid operation for current state |
| NullReferenceException | Accessing member on null object |
| IndexOutOfRangeException | Array index out of bounds |
| KeyNotFoundException | Key not found in dictionary |
| FormatException | Invalid string format for parsing |
| OverflowException | Arithmetic overflow |
| NotImplementedException | Method not implemented |
| NotSupportedException | Operation not supported |

---

## Interview Tips

1. **Understand the fundamentals**: Make sure you have a solid grasp of OOP concepts, data structures, and algorithms.

2. **Practice coding**: Write code by hand and on a whiteboard to simulate interview conditions.

3. **Think out loud**: Explain your thought process as you solve problems.

4. **Ask clarifying questions**: Don't assume; clarify requirements before coding.

5. **Consider edge cases**: Always think about null values, empty collections, and boundary conditions.

6. **Know your complexity**: Be prepared to analyze time and space complexity.

7. **Review design patterns**: Understand common patterns and when to apply them.

8. **Stay updated**: Keep up with the latest C# features and .NET updates.

9. **Practice LINQ**: Many C# interviews include LINQ-related questions.

10. **Understand async/await**: Asynchronous programming is crucial for modern applications.

---

## Common Mistakes to Avoid

1. **Not using `using` statement** for IDisposable objects
2. **Catching generic Exception** instead of specific exceptions
3. **Not handling null values** properly
4. **Using `async void`** outside of event handlers
5. **Blocking on async code** with `.Result` or `.Wait()`
6. **Mutable static fields** in multi-threaded applications
7. **String concatenation in loops** instead of StringBuilder
8. **Not implementing `IEquatable<T>`** for value equality
9. **Forgetting to override `GetHashCode`** when overriding `Equals`
10. **Using magic numbers** instead of named constants

---

*Document generated for interview preparation purposes. Always verify current best practices with official Microsoft documentation.*

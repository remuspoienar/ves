# ves

ves is an errors-as-values(EAV) implementation with **type safety** as the primary focus <br>
In a nuthsel it's a function wrapper and returns a special type union result( which is either a nullable value or an error) that prevents from  being used as is until a check is performed<br>
The check is equivalent to error handling and will restrict the initially loose type, so it can be safely used and give certain guarantees afterwards
### Motivation

We had error as values in nodejs before promises and async/await, inside callback args of async functions(i.e. `readFile`), however it was painful because of the nesting in those callbacks<br>
Promises came later and offered `.then` and `.catch` replacing nesting with chaining. Pretty nice but the error and the value were in different scopes and you weren't forced to perform error handling.Then we got async/await also not mandating error handling ( surrounding an async call with a try/catch block)

Altough async APIs and mechanics got better, the error scenario was still invisible: no type information of the error and the value wasn't typed as an optional one. While the former isn't supported by the language (method signatures don't include throwable errors), the latter can be tackled with little to no effort

Benefits of an EAV approach include having both a value or an error in the same scope, which could be handled as desired(check for error and/or value)<br>
Though this is mostly just peference, being forced to do error handling with a simple if statement could result in a better DX than a try/catch block.<br>
Either way, when using ves, intellisense will prevent you from rushing on the happy path

Hover over code in [index.ts](index.ts) and try adding extra args to `readFile` or removing `isValue` call checks and ts errors will appear<br>
This is informing you of either not calling the wrapped methods correctly or not handling the result of that<br>
The difference is in the overall type information (as seen in your IDE) and less so in the code since the basic examples here don't look like a huge win ar first

### Examples & Usage

Classical error handling:

- The try/catch is optional but even without it `buffer` is still a `BufferLike<...>` instead of an optional type
- No hint that the `readFile` method could go wrong: you use try/catch because you know implementation details (i.e. file could be missing)

```typescript
import { readFile } from "node:fs/promises";

try {
  const buffer = await readFile("./package.json");
  console.log(buffer.toString());
} catch (e) {
  console.warn(e);
}
```

But if you wrap this method with `ves` it enforces you to perform error handling which will restrict the value variable to a non nullable type otherwise you get a ts error when using it afterwards

```typescript
import { isErr, isLooseValue, isOk, isValue } from "./src/checks";
import { useVes, ves } from "./src/ves";

const [buff, err] = await ves(readFile)("./package.json");

if (isLooseValue(buff)) {
  console.log(buff.toString());
}
```

Alternatively, if you like React you can do this:

```typescript
import { useVes } from "./src/ves";

const [buff, err] = await useVes(async () => readFile("./package.json"));

if (isValue(buff, err)) {
  console.log(buff.toString());
} else {
  console.warn(err);
}
```
Here you just pass an async func with no args that calls a function instead of wrapping it<br>

#### Error / value checking
With error checking you get a more restricted type with some helpers(i.e `isValue`), depending on the result of an operation<br>
You can check for an error, a value, or both ( or none :warning: )<br>
 
- `isLooseValue` - checks a value -> restricts to a concrete value type
- `isErr` - checks an error -> restricts to a concrete error type
- `isValue` - uses both `isLooseValue` and `isErr`
- `isOk` - like `isValue` but for an instance of `Result<T>`

Basically these will guarantee that something is either an error or a value (T) prior to using it down the line

```typescript
import { isErr, isLooseValue, isOk, isValue, useVes, ves } from "./src/ves";

// buff: string | Buffer<ArrayBufferLike> | null
const [buff, err] = await ves(readFile)("./package.json");

// check either variable
if (isErr(err)) {
  // err is no longer nullable
  console.warn(err);
  return;
}

// OR
if (isLooseValue(buff)) {
  // buff: string | Buffer<ArrayBufferLike>
  console.log(buff.toString());
}

// OR  more restrictive - same as `isLooseValue` but it also checks that err is null 
if (isValue(buff, err)) {
  // buff: string | Buffer<ArrayBufferLike>
  console.log(buff.toString());
} else {
  console.warn(err);
}
```
`isValue` treats an error and a value as mutually exlcusive, only one can be null at a time


Also you don't have to use destructuring, but then you need to use the more high level `isOk` method  to perform error checking on the whole result

```typescript
const result = await ves(fetch)("https://jsonplaceholder.typicode.com/todos/1");

if (isOk(result)) {
  const [resp, _] = result; // result: Ok<Response>
  const json = await resp.json();
  console.log(json);
} else {
  console.warn(result); // result: Failure
}
```

### Checklist

- initial POC and example :white_check_mark:
- more usages & options :white_check_mark:
- tests :x:
- dedicated docs section :x:
- separate async and non-async work to remove overhead :x:
- GIFs / videos in README to showcase intellisense support :x:

### Disclaimer

At this point this is mostly a POC<br>
The code is small, hence there is no intention to create yet another npm package out of this

### Other

To run:

```bash
bun index.ts
```

This project was created using `bun init` in bun v1.2.9. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

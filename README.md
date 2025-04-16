# ves

`ves` is an errors-as-values(EAV) implementation with **type safety** as the primary focus <br>
In a nuthsel it's a function wrapper and returns a special type union( which is either a value or an error) that prevents from being used until a check is performed<br>
The check will restrict the loose type, so it can be safely used and give guarantees in a certain scope, i.e inside an if statement
### Motivation

We had error as values in nodejs before promises and async/await, inside callback args of async functions(i.e. `readFile`), but it was painful to deal with because of the nesting of those callbacks

Promises offered `.then` and `.catch` to isValue values/errors from promises but in separated scope

Benefits of an EAV approach include having both a value or an error in the same scope, and also could be handled as desired(check for error and/or value)<br>
Though this is mostly just peference, checking for an error in an if statement with an early return could read easier than a try/catch block

Hover over code in [index.ts](index.ts) and try adding extra args or removing `isValue` call checks and ts errors will appear
This is informing you of either not calling the wrapped methods correctly(i.e. `readFile`) or not handling the result of that<br>
The difference is in the overall type information (as seen in your IDE) and less so in the code since the basic example here doesn't look like a huge win on a first glance

### Examples & Usage

Classical error handling:

- The try/catch is optional but even without it `buffer` is still a `BufferLike<...>`
- No hint that the `readFile` method could go wrong

```typescript
import { readFile } from "node:fs/promises";

try {
  const buffer = await readFile("./package.json");
  console.log(buffer.toString());
} catch (e) {
  console.warn(e);
}
```

But if you wrap this method with ves it enforces you to check the error which will restrict the value variable to a non nullable type otherwise you get a ts error when using the variable later (since it's `T | null` without the error checking)

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
- `isErr` - checks an error  -> restricts to a concrete error type
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


Also you don't have to use destructuring, but then you need to use the more high level `isOk` method  to perform error checking

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

### Disclaimer

At this point this is mostly a POC<br>
The code is small, hence there is no intention to create yet another npm package out of this

### Other

To run:

```bash
bun index.ts
```

This project was created using `bun init` in bun v1.2.9. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

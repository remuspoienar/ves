import { readFile } from "node:fs/promises";
import { isErr, isLooseValue, isOk, isValue } from "./src/checks";
import { useVes, ves } from "./src/ves";

(async function main() {
  // 1. classic error handling
  try {
    const buffer = await readFile("./package.json");
    console.log(buffer.toString());
  } catch (e) {
    console.warn(e);
  }

  // 2. ves with checking (either `isOk` for val or `isErr` for err)
  const [buffer, err] = await ves(readFile)("./package.json");
  if (isErr(err)) {
    console.warn(err);
    return;
  }

  if (isLooseValue(buffer)) {
    console.log(buffer.toString());
  }

  // 3. ves with stric checking (both val and err with `unwrap`)
  const [buff, err1] = await ves(readFile)("./package.json");

  if (isValue(buff, err1)) {
    console.log(buff.toString());
  } else {
    console.warn(err1);
  }

  // 4. ves without destructuring of val/err (using `check`)
  const result = await ves(fetch)(
    "https://jsonplaceholder.typicode.com/todos/1"
  );

  if (isOk(result)) {
    const [resp, _] = result;
    const j = await resp.json();
    console.log(j);
  } else {
    console.warn(result);
  }

  // 5. ves with React-like syntax
  const [buf, err2] = await useVes(() => readFile("./package.json"));

  if (isValue(buf, err2)) {
    console.log(buf.toString());
  } else {
    console.warn(err2);
  }
})();

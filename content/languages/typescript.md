---
name: 'TypeScript'
---

## Hello World

```typescript
console.log('Hello, World!');
```

## Conditional

```typescript
const number: number = 10;
if (number > 5) {
  console.log('Greater than 5');
} else {
  console.log('Less than or equal to 5');
}
```

## Calculation

- result: 4
  ```typescript
  const result: number = (1 + 1) * 2;
  console.log(result);
  ```

## Loop

- result: 1 2 3 4 5
  ```typescript
  let result: string = '';
  for (let i: number = 1; i <= 5; i++) {
    result += i + ' ';
  }
  console.log(result.trim());
  ```

## Function

- result: 5
  ```typescript
  function add(a: number, b: number): number {
    return a + b;
  }

  console.log(add(2, 3));
  ```

## String Concatenation

- result: Hello, Mary
  ```typescript
  const name: string = 'Mary';
  console.log('Hello, ' + name);
  ```

## List

- result: 6
  ```typescript
  const numbers: number[] = [1, 2, 3];
  let total: number = 0;
  for (const n of numbers) {
    total += n;
  }
  console.log(total);
  ```

## Boolean Comparison

- result: true
  ```typescript
  const age: number = 18;
  console.log(age >= 18);
  ```

## Variables

- integer:
  ```typescript
  const age: number = 25;
  ```
- string:
  ```typescript
  const name: string = 'Mary';
  ```
- float:
  ```typescript
  const price: number = 9.99;
  ```

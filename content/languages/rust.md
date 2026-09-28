---
name: 'Rust'
---

## Hello World

```rust
fn main() {
    println!("Hello, World!");
}
```

## Conditional

```rust
fn main() {
    let number = 10;
    if number > 5 {
        println!("Greater than 5");
    } else {
        println!("Less than or equal to 5");
    }
}
```

## Calculation

- result: 4
  ```rust
  fn main() {
      let result = (1 + 1) * 2;
      println!("{}", result);
  }
  ```

## Loop

- result: 1 2 3 4 5
  ```rust
  fn main() {
      for i in 1..=5 {
          print!("{} ", i);
      }
  }
  ```

## Function

- result: 5
  ```rust
  fn add(a: i32, b: i32) -> i32 {
      a + b
  }

  fn main() {
      println!("{}", add(2, 3));
  }
  ```

## String Concatenation

- result: Hello, Mary
  ```rust
  fn main() {
      let name = "Mary";
      println!("Hello, {}", name);
  }
  ```

## List

- result: 6
  ```rust
  fn main() {
      let numbers = [1, 2, 3];
      let mut total = 0;
      for n in numbers {
          total += n;
      }
      println!("{}", total);
  }
  ```

## Boolean Comparison

- result: true
  ```rust
  fn main() {
      let age = 18;
      println!("{}", age >= 18);
  }
  ```

## Variables

- integer:
  ```rust
  let age: i32 = 25;
  ```
- string:
  ```rust
  let name: &str = "Mary";
  ```
- float:
  ```rust
  let price: f64 = 9.99;
  ```

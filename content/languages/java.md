---
name: 'Java'
---

## Hello World

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

## Conditional

```java
int number = 10;
if (number > 5) {
    System.out.println("Greater than 5");
} else {
    System.out.println("Less than or equal to 5");
}
```

## Calculation

- result: 4
  ```java
  int result = (1 + 1) * 2;
  System.out.println(result);
  ```

## Loop

- result: 1 2 3 4 5
  ```java
  for (int i = 1; i <= 5; i++) {
      System.out.print(i + " ");
  }
  ```

## Function

- result: 5
  ```java
  int add(int a, int b) {
      return a + b;
  }
  System.out.println(add(2, 3));
  ```

## String Concatenation

- result: Hello, Mary
  ```java
  String name = "Mary";
  System.out.println("Hello, " + name);
  ```

## List

- result: 6
  ```java
  int[] numbers = {1, 2, 3};
  int total = 0;
  for (int n : numbers) {
      total += n;
  }
  System.out.println(total);
  ```

## Boolean Comparison

- result: true
  ```java
  int age = 18;
  System.out.println(age >= 18);
  ```

## Variables

- integer:
  ```java
  int age = 25;
  ```
- string:
  ```java
  String name = "Mary";
  ```
- float:
  ```java
  float price = 9.99f;
  ```

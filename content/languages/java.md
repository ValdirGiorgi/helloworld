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
    System.out.println("Maior que 5");
} else {
    System.out.println("Menor ou igual a 5");
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
  int somar(int a, int b) {
      return a + b;
  }
  System.out.println(somar(2, 3));
  ```

## String Concatenation

- result: Olá, Mary
  ```java
  String name = "Mary";
  System.out.println("Olá, " + name);
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
  int idade = 18;
  System.out.println(idade >= 18);
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

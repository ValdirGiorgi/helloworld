---
name: 'Dart'
---

## Hello World

```dart
void main() {
  print('Hello, World!');
}
```

## Conditional

```dart
void main() {
  int number = 10;
  if (number > 5) {
    print('Maior que 5');
  } else {
    print('Menor ou igual a 5');
  }
}
```

## Calculation

- result: 4
  ```dart
  void main() {
    int result = (1 + 1) * 2;
    print(result);
  }
  ```

## Loop

- result: 1 2 3 4 5
  ```dart
  void main() {
    var result = '';
    for (var i = 1; i <= 5; i++) {
      result += '$i ';
    }
    print(result.trim());
  }
  ```

## Function

- result: 5
  ```dart
  int somar(int a, int b) {
    return a + b;
  }

  void main() {
    print(somar(2, 3));
  }
  ```

## String Concatenation

- result: Olá, Mary
  ```dart
  void main() {
    var name = 'Mary';
    print('Olá, ' + name);
  }
  ```

## List

- result: 6
  ```dart
  void main() {
    var numbers = [1, 2, 3];
    var total = 0;
    for (var n in numbers) {
      total += n;
    }
    print(total);
  }
  ```

## Boolean Comparison

- result: true
  ```dart
  void main() {
    var idade = 18;
    print(idade >= 18);
  }
  ```

## Variables

- integer:
  ```dart
  int age = 25;
  ```
- string:
  ```dart
  String name = 'Mary';
  ```
- float:
  ```dart
  double price = 9.99;
  ```

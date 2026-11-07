---
name: 'C'
---

## Hello World

```c
#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    return 0;
}
```

## Conditional

```c
#include <stdio.h>

int main(void) {
    int number = 10;
    if (number > 5) {
        printf("Greater than 5\n");
    } else {
        printf("Less than or equal to 5\n");
    }
    return 0;
}
```

## Calculation

- result: 4
  ```c
  #include <stdio.h>

  int main(void) {
      int result = (1 + 1) * 2;
      printf("%d\n", result);
      return 0;
  }
  ```

## Loop

- result: 1 2 3 4 5
  ```c
  #include <stdio.h>

  int main(void) {
      for (int i = 1; i <= 5; i++) {
          printf("%d ", i);
      }
      return 0;
  }
  ```

## Function

- result: 5
  ```c
  #include <stdio.h>

  int add(int a, int b) {
      return a + b;
  }

  int main(void) {
      printf("%d\n", add(2, 3));
      return 0;
  }
  ```

## String Concatenation

- result: Hello, Mary
  ```c
  #include <stdio.h>

  int main(void) {
      char greeting[] = "Hello, ";
      char name[] = "Mary";
      char result[32];
      int i = 0;
      for (int j = 0; greeting[j] != '\0'; j++) {
          result[i++] = greeting[j];
      }
      for (int j = 0; name[j] != '\0'; j++) {
          result[i++] = name[j];
      }
      result[i] = '\0';
      printf("%s\n", result);
      return 0;
  }
  ```

## List

- result: 6
  ```c
  #include <stdio.h>

  int main(void) {
      int numbers[] = {1, 2, 3};
      int total = 0;
      for (int i = 0; i < 3; i++) {
          total += numbers[i];
      }
      printf("%d\n", total);
      return 0;
  }
  ```

## Boolean Comparison

- result: true
  ```c
  #include <stdio.h>

  int main(void) {
      int age = 18;
      printf("%d\n", age >= 18);
      return 0;
  }
  ```

## Variables

- integer:
  ```c
  int age = 25;
  ```
- string:
  ```c
  char name[] = "Mary";
  ```
- float:
  ```c
  double price = 9.99;
  ```

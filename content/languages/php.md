---
name: 'PHP'
---

## Hello World

```php
<?php
echo "Hello, World!";
```

## Conditional

```php
<?php
$number = 10;
if ($number > 5) {
    echo "Greater than 5";
} else {
    echo "Less than or equal to 5";
}
```

## Calculation

- result: 4
  ```php
  <?php
  $result = (1 + 1) * 2;
  echo $result;
  ```

## Loop

- result: 1 2 3 4 5
  ```php
  <?php
  for ($i = 1; $i <= 5; $i++) {
      echo $i . " ";
  }
  ```

## Function

- result: 5
  ```php
  <?php
  function add($a, $b) {
      return $a + $b;
  }
  echo add(2, 3);
  ```

## String Concatenation

- result: Hello, Mary
  ```php
  <?php
  $name = "Mary";
  echo "Hello, " . $name;
  ```

## List

- result: 6
  ```php
  <?php
  $numbers = [1, 2, 3];
  $total = 0;
  foreach ($numbers as $n) {
      $total += $n;
  }
  echo $total;
  ```

## Boolean Comparison

- result: true
  ```php
  <?php
  $age = 18;
  echo $age >= 18 ? 'true' : 'false';
  ```

## Variables

- integer:
  ```php
  $age = 25;
  ```
- string:
  ```php
  $name = "Mary";
  ```
- float:
  ```php
  $price = 9.99;
  ```

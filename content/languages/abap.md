---
name: 'ABAP'
---

## Hello World

```abap
WRITE: 'Hello, World!'.
```

## Conditional

```abap
DATA number TYPE i VALUE 10.
IF number > 5.
  WRITE: 'Greater than 5'.
ELSE.
  WRITE: 'Less than or equal to 5'.
ENDIF.
```

## Calculation

- result: 4
  ```abap
  DATA result TYPE i.
  result = ( 1 + 1 ) * 2.
  WRITE: result.
  ```

## Loop

- result: 1 2 3 4 5
  ```abap
  DATA i TYPE i.
  DO 5 TIMES.
    i = sy-index.
    WRITE: i.
  ENDDO.
  ```

## Function

- result: 5
  ```abap
  FORM add USING a TYPE i b TYPE i CHANGING result TYPE i.
    result = a + b.
  ENDFORM.

  DATA result TYPE i.
  PERFORM add USING 2 3 CHANGING result.
  WRITE: result.
  ```

## String Concatenation

- result: Hello, Mary
  ```abap
  DATA name TYPE string VALUE 'Mary'.
  DATA greeting TYPE string.
  CONCATENATE 'Hello, ' name INTO greeting.
  WRITE: greeting.
  ```

## List

- result: 6
  ```abap
  DATA numbers TYPE TABLE OF i.
  APPEND 1 TO numbers.
  APPEND 2 TO numbers.
  APPEND 3 TO numbers.
  DATA total TYPE i.
  LOOP AT numbers INTO DATA(n).
    total = total + n.
  ENDLOOP.
  WRITE: total.
  ```

## Boolean Comparison

- result: true
  ```abap
  DATA age TYPE i VALUE 18.
  IF age >= 18.
    WRITE: 'true'.
  ELSE.
    WRITE: 'false'.
  ENDIF.
  ```

## Variables

- integer:
  ```abap
  DATA age TYPE i VALUE 25.
  ```
- string:
  ```abap
  DATA name TYPE string VALUE 'Mary'.
  ```
- float:
  ```abap
  DATA price TYPE f VALUE '9.99'.
  ```

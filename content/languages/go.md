---
name: 'Go'
---

## Hello World

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}
```

## Conditional

```go
package main

import "fmt"

func main() {
	number := 10
	if number > 5 {
		fmt.Println("Greater than 5")
	} else {
		fmt.Println("Less than or equal to 5")
	}
}
```

## Calculation

- result: 4
  ```go
  package main

  import "fmt"

  func main() {
  	result := (1 + 1) * 2
  	fmt.Println(result)
  }
  ```

## Loop

- result: 1 2 3 4 5
  ```go
  package main

  import "fmt"

  func main() {
  	for i := 1; i <= 5; i++ {
  		fmt.Print(i, " ")
  	}
  }
  ```

## Function

- result: 5
  ```go
  package main

  import "fmt"

  func add(a int, b int) int {
  	return a + b
  }

  func main() {
  	fmt.Println(add(2, 3))
  }
  ```

## String Concatenation

- result: Hello, Mary
  ```go
  package main

  import "fmt"

  func main() {
  	name := "Mary"
  	fmt.Println("Hello, " + name)
  }
  ```

## List

- result: 6
  ```go
  package main

  import "fmt"

  func main() {
  	numbers := []int{1, 2, 3}
  	total := 0
  	for _, n := range numbers {
  		total += n
  	}
  	fmt.Println(total)
  }
  ```

## Boolean Comparison

- result: true
  ```go
  package main

  import "fmt"

  func main() {
  	age := 18
  	fmt.Println(age >= 18)
  }
  ```

## Variables

- integer:
  ```go
  var age int = 25
  ```
- string:
  ```go
  var name string = "Mary"
  ```
- float:
  ```go
  var price float64 = 9.99
  ```

---
name: 'Assembly'
---

## Hello World

```asm
; x86-64 Linux, NASM syntax
section .data
    msg db "Hello, World!", 10
    len equ $ - msg

section .text
    global _start
_start:
    mov rax, 1              ; sys_write
    mov rdi, 1              ; stdout
    mov rsi, msg
    mov rdx, len
    syscall
    mov rax, 60             ; sys_exit
    xor rdi, rdi
    syscall
```

## Conditional

```asm
section .data
    number dq 10
    greater db "Greater than 5", 10
    greater_len equ $ - greater
    less db "Less than or equal to 5", 10
    less_len equ $ - less

section .text
    global _start
_start:
    cmp qword [number], 5
    jle .less
    mov rsi, greater
    mov rdx, greater_len
    jmp .print
.less:
    mov rsi, less
    mov rdx, less_len
.print:
    mov rax, 1              ; sys_write
    mov rdi, 1              ; stdout
    syscall
    mov rax, 60             ; sys_exit
    xor rdi, rdi
    syscall
```

## Calculation

- result: 4
  ```asm
  section .bss
      digit resb 1

  section .text
      global _start
  _start:
      mov rax, 1
      add rax, 1              ; 1 + 1
      imul rax, 2             ; (1 + 1) * 2
      add al, '0'             ; number -> ASCII digit
      mov [digit], al
      mov rax, 1              ; sys_write
      mov rdi, 1              ; stdout
      mov rsi, digit
      mov rdx, 1
      syscall
      mov rax, 60             ; sys_exit
      xor rdi, rdi
      syscall
  ```

## Loop

- result: 1 2 3 4 5
  ```asm
  section .bss
      buf resb 2

  section .text
      global _start
  _start:
      mov rbx, 1              ; i = 1
  .loop:
      cmp rbx, 5
      jg .done
      mov al, bl
      add al, '0'             ; number -> ASCII digit
      mov [buf], al
      mov byte [buf + 1], ' '
      mov rax, 1              ; sys_write
      mov rdi, 1              ; stdout
      mov rsi, buf
      mov rdx, 2
      syscall
      inc rbx                 ; i++
      jmp .loop
  .done:
      mov rax, 60             ; sys_exit
      xor rdi, rdi
      syscall
  ```

## Function

- result: 5
  ```asm
  section .bss
      digit resb 1

  section .text
      global _start

  ; "add" is also an instruction, so NASM requires the $ prefix
  $add:                       ; a = rdi, b = rsi, return in rax
      mov rax, rdi
      add rax, rsi
      ret

  _start:
      mov rdi, 2
      mov rsi, 3
      call $add
      add al, '0'             ; number -> ASCII digit
      mov [digit], al
      mov rax, 1              ; sys_write
      mov rdi, 1              ; stdout
      mov rsi, digit
      mov rdx, 1
      syscall
      mov rax, 60             ; sys_exit
      xor rdi, rdi
      syscall
  ```

## String Concatenation

- result: Hello, Mary
  ```asm
  section .data
      greeting db "Hello, "
      greeting_len equ $ - greeting
      name db "Mary"
      name_len equ $ - name

  section .bss
      result resb greeting_len + name_len

  section .text
      global _start
  _start:
      mov rdi, result
      mov rsi, greeting
      mov rcx, greeting_len
      rep movsb               ; copy "Hello, "
      mov rsi, name
      mov rcx, name_len
      rep movsb               ; append "Mary"
      mov rax, 1              ; sys_write
      mov rdi, 1              ; stdout
      mov rsi, result
      mov rdx, greeting_len + name_len
      syscall
      mov rax, 60             ; sys_exit
      xor rdi, rdi
      syscall
  ```

## List

- result: 6
  ```asm
  section .data
      numbers dq 1, 2, 3
      count equ 3

  section .bss
      digit resb 1

  section .text
      global _start
  _start:
      xor rax, rax            ; total = 0
      xor rcx, rcx            ; i = 0
  .loop:
      cmp rcx, count
      jge .done
      add rax, [numbers + rcx * 8]
      inc rcx
      jmp .loop
  .done:
      add al, '0'             ; number -> ASCII digit
      mov [digit], al
      mov rax, 1              ; sys_write
      mov rdi, 1              ; stdout
      mov rsi, digit
      mov rdx, 1
      syscall
      mov rax, 60             ; sys_exit
      xor rdi, rdi
      syscall
  ```

## Boolean Comparison

- result: true
  ```asm
  section .data
      age dq 18

  section .bss
      digit resb 1

  section .text
      global _start
  _start:
      cmp qword [age], 18
      setge al                ; al = 1 (true) if age >= 18
      add al, '0'             ; number -> ASCII digit
      mov [digit], al
      mov rax, 1              ; sys_write
      mov rdi, 1              ; stdout
      mov rsi, digit
      mov rdx, 1
      syscall
      mov rax, 60             ; sys_exit
      xor rdi, rdi
      syscall
  ```

## Variables

- integer:
  ```asm
  age dq 25
  ```
- string:
  ```asm
  name db "Mary", 0
  ```
- float:
  ```asm
  price dq 9.99
  ```

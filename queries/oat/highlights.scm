;; -------------------------------------------------------------------
;; Basic keywords
;; -------------------------------------------------------------------

[
  "if"
  "else"
  "for"
  "while"
  "return"
  "var"
  "global"
  "new"
  "null"
  "true"
  "false"
  "struct"
  "length"
] @keyword

[
  "void"
] @type

(type) @type
(primitive_type) @type
(ref_type) @type
(struct_name) @type

[
  "+"
  "-"
  "*"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "<<"
  ">>"
  ">>>"
  "&"
  "|"
  "[&]"
  "[|]"
  "!"
  "~"
  "="
  "?"
] @operator

;; -------------------------------------------------------------------
;; Identifiers & function declarations
;; -------------------------------------------------------------------

(identifier) @variable

(fdecl
  name: (identifier) @function)

(call_exp
  name: (exp (identifier)) @function.call)

(call_exp
  name: (exp (struct_index (exp) (identifier) @function.call)))

(params
  (arg
    (identifier) @variable.parameter))

;; -------------------------------------------------------------------
;; Literals
;; -------------------------------------------------------------------

(int_literal) @number
(string_literal) @string

;; -------------------------------------------------------------------
;; Comments
;; -------------------------------------------------------------------

(comment) @comment

;; -------------------------------------------------------------------
;; Declarations
;; -------------------------------------------------------------------

(gdecl
  name: (identifier) @variable.global)

(vdecl
  (identifier) @variable)

(assign_stmt
  name: (exp) @variable)

(struct_index
  (exp)
  (identifier) @property)

(field
  (type)
  name: (identifier) @property)

;; -------------------------------------------------------------------
;; Misc
;; -------------------------------------------------------------------

(array_index) @variable
(block) @scope

;; -------------------------------------------------------------------
;; Brackets & punctuation
;; -------------------------------------------------------------------

[
  ","
  ";"
] @punctuation.delimiter

[
  "("
  ")"
  ") ->"
  "{"
  "}"
  "["
  "]"
  "[]"
] @punctuation.bracket

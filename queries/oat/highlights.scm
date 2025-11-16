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
] @operator

;; -------------------------------------------------------------------
;; Identifiers & function declarations
;; -------------------------------------------------------------------

(identifier) @variable

(fdecl
  name: (identifier) @function)

(call_exp
  (exp) @function.call)

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

(gdecl name: (identifier) @variable.global)
(vdecl
  (identifier) @variable)

(assign_stmt name: (lhs) @variable)

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
  "{"
  "}"
  "["
  "]"
  "[]"
] @punctuation.bracket

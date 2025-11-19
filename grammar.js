/**
 * @file Oat language used for practicing parser and lexer basics
 * @author WhySoBad <git@wysbd.dev>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "oat",
  extras: ($) => [$.comment, /\s+/],
  word: ($) => $.keyword,
  rules: {
    // prog
    prog: ($) => repeat($.decl),

    // global declarations
    decl: ($) => choice($.tdecl, $.gdecl, $.fdecl),

    // global variable declarations
    gdecl: ($) =>
      seq(
        "global",
        field("name", $.identifier),
        "=",
        field("initializer", $.gexp),
        ";",
      ),

    // arg
    arg: ($) => seq(field("type", $.type), field("name", $.identifier)),
    params: ($) =>
      seq(
        "(",
        field("param", optional(seq($.arg, repeat(seq(",", $.arg))))),
        ")",
      ),

    // function declaration
    fdecl: ($) =>
      seq(
        field("rettype", $.retty),
        field("name", $.identifier),
        $.params,
        field("body", $.block),
      ),

    // struct field declaration
    field: ($) => seq(field("type", $.type), field("name", $.identifier)),
    fields: ($) =>
      seq(
        "{",
        choice(optional($.field), seq($.field, repeat(seq(";", $.field)))),
        "}",
      ),
    // struct declaration
    tdecl: ($) => seq("struct", field("name", $.struct_name), $.fields),

    // blocks
    block: ($) => seq("{", repeat($.stmt), "}"),

    // types
    type: ($) =>
      choice($.primitive_type, prec(100, $.ref_type), seq($.ref_type, "?")),
    primitive_type: ($) => choice("int", "bool"),
    ref_type: ($) =>
      choice(
        "string",
        $.struct_name,
        prec(90, seq($.type, "[]")),
        $.ftype,
        seq("(", $.ref_type, ")"),
      ),

    // function types
    ftype: ($) =>
      seq(
        "(",
        optional(seq($.type, repeat(seq(",", $.type)))),
        ") ->",
        $.retty,
      ),
    // return types
    retty: ($) => choice("void", $.type),

    // binary expressions
    bexp: ($) =>
      choice(
        // level 100: *
        prec.left(100, seq($.exp, "*", $.exp)),
        // level 90: + -
        prec.left(90, seq($.exp, choice("+", "-"), $.exp)),
        // level 80: shifts
        prec.left(80, seq($.exp, choice("<<", ">>", ">>>"), $.exp)),
        // level 70: comparisons
        prec.left(70, seq($.exp, choice("<", "<=", ">", ">="), $.exp)),
        // level 60: equality
        prec.left(60, seq($.exp, choice("==", "!="), $.exp)),
        // level 50: logical and (bool)
        prec.left(50, seq($.exp, "&", $.exp)),
        // level 40: logical or (bool)
        prec.left(40, seq($.exp, "|", $.exp)),
        // level 30: bitwise [&]
        prec.left(30, seq($.exp, "[&]", $.exp)),
        // level 20: bitwise [|]
        prec.left(20, seq($.exp, "[|]", $.exp)),
      ),

    // unary expressions
    uexp: ($) =>
      prec.right(choice(seq("-", $.exp), seq("!", $.exp), seq("~", $.exp))),

    // global initializers
    gexp: ($) =>
      choice(
        $.int_literal,
        $.string_literal,
        seq($.ref_type, "null"),
        "true",
        "false",
        $.global_array_def,
        $.global_struct_def,
        $.identifier,
      ),

    // expressions
    exp: ($) =>
      choice(
        $.call_exp,
        $.identifier,
        $.int_literal,
        $.string_literal,
        seq($.ref_type, "null"),
        "true",
        "false",
        $.array_index,
        $.array_def,
        $.array_def_init,
        $.array_def_init_fn,
        $.struct_def,
        $.struct_index,
        $.bexp,
        $.uexp,
        seq("length", "(", $.exp, ")"),
        seq("(", $.exp, ")"),
      ),

    // local declarations
    vdecl: ($) => seq("var", field("name", $.identifier), "=", $.exp),

    // stmt
    stmt: ($) =>
      choice(
        $.assign_stmt,
        $.vdecl_stmt,
        $.return_stmt,
        $.call_stmt,
        $.if_stmt,
        $.if_cast_stmt,
        $.for_stmt,
        $.while_stmt,
      ),

    // assignment statement
    assign_stmt: ($) =>
      seq(field("name", $.exp), "=", field("expr", $.exp), ";"),

    // variable declaration statement
    vdecl_stmt: ($) =>
      seq("var", field("name", $.identifier), "=", field("expr", $.exp), ";"),

    // return statement
    return_stmt: ($) => seq("return", optional($.exp), ";"),

    // function call statement
    call_stmt: ($) => seq($.call_exp, ";"),

    // if statement
    if_stmt: ($) =>
      seq(
        "if",
        "(",
        $.exp,
        ")",
        field("consequence", $.block),
        optional($.else_stmt),
      ),
    // null-checked downcast
    if_cast_stmt: ($) =>
      seq(
        "if",
        "?",
        "(",
        $.ref_type,
        $.identifier,
        "=",
        $.exp,
        ")",
        $.block,
        optional($.else_stmt),
      ),
    // else statement
    else_stmt: ($) => choice(seq("else", $.block), seq("else", $.if_stmt)),

    // for loop statement
    for_stmt: ($) =>
      seq(
        "for",
        "(",
        optional(
          seq(
            field("param", $.vdecl),
            repeat(seq(",", field("param", $.vdecl))),
          ),
        ),
        ";",
        optional($.exp),
        ";",
        optional($.stmt),
        ")",
        $.block,
      ),

    // while loop statement
    while_stmt: ($) => seq("while", "(", $.exp, ")", $.block),

    // index into an array
    array_index: ($) => seq($.exp, "[", $.exp, "]"),

    // index into a struct
    struct_index: ($) => seq($.exp, ".", $.identifier),

    // function call expression
    call_exp: ($) =>
      prec(
        100,
        seq(
          field("name", $.exp),
          "(",
          optional(seq($.exp, repeat(seq(",", $.exp)))),
          ")",
        ),
      ),

    // array definition
    array_def: ($) =>
      seq(
        optional("new"),
        $.type,
        "[]",
        "{",
        optional(seq($.exp, repeat(seq(",", $.exp)))),
        "}",
      ),

    // global array definition
    global_array_def: ($) =>
      seq(
        optional("new"),
        $.type,
        "[]",
        "{",
        optional(seq($.gexp, repeat(seq(",", $.gexp)))),
        "}",
      ),

    // array definition with default initializer
    array_def_init: ($) => seq("new", $.type, "[", $.exp, "]"),
    // array definition with default initializer function
    array_def_init_fn: ($) =>
      seq(
        "new",
        $.type,
        "[",
        $.exp,
        "]",
        "{",
        field("variable", $.identifier),
        "->",
        field("initializer", $.exp),
        "}",
      ),

    // struct field initializer
    struct_field_init: ($) =>
      seq(field("name", $.identifier), "=", field("value", $.exp)),
    // struct definition
    struct_def: ($) =>
      seq(
        optional("new"),
        field("name", $.struct_name),
        "{",
        choice(
          optional($.struct_field_init),
          seq($.struct_field_init, repeat(seq(";", $.struct_field_init))),
        ),
        "}",
      ),

    // global struct field initializer
    global_field_init: ($) =>
      seq(field("name", $.identifier), "=", field("value", $.gexp)),
    // global struct definition
    global_struct_def: ($) =>
      seq(
        optional("new"),
        field("name", $.struct_name),
        "{",
        choice(
          optional($.global_field_init),
          seq($.global_field_init, repeat(seq(";", $.global_field_init))),
        ),
        "}",
      ),

    // integer literal token
    int_literal: ($) =>
      token(seq(optional("-"), choice(/[0-9]+/, /0x[0-9A-Fa-f]+/))),

    // string literal token
    string_literal: ($) =>
      token(seq('"', repeat(choice(/[^"\\\n]/, /\\./)), '"')),

    // keywords are lowercase words
    keyword: ($) => /[a-z]*/,

    // identifiers start with lowercase letter
    identifier: ($) => /[a-z_][A-Za-z0-9_]*/,

    // struct names are capitalized
    struct_name: ($) => /[A-Z_][A-Za-z0-9_]*/,

    // comments: C style single-line and multi-line
    comment: ($) =>
      token(
        choice(seq("//", /[^\n]*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),
  },
});

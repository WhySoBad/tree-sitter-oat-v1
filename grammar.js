/**
 * @file Oat.v1 language used for compiler design
 * @author WySBd <git@wysbd.dev>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "oat_v1",
  extras: ($) => [$.comment, /\s+/],
  word: ($) => $.identifier,
  rules: {
    // prog
    prog: ($) => repeat($.decl),

    // global declarations
    decl: ($) => choice($.gdecl, $.fdecl),

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
    arg: ($) => seq($.type, $.identifier),
    params: ($) =>
      seq(
        "(",
        field("params", optional(seq($.arg, repeat(seq(",", $.arg))))),
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

    // blocks
    block: ($) => seq("{", repeat($.stmt), "}"),

    // types
    type: ($) => choice($.primitive_type, $.ref_type),
    primitive_type: ($) => choice("int", "bool"),
    ref_type: ($) => choice("string", seq($.type, "[]")),

    // function types
    ftype: ($) =>
      seq(
        "(",
        optional(seq($.type, repeat(seq(",", $.type)))),
        ")",
        "->",
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
        "null",
        "true",
        "false",
        $.global_array_def,
      ),

    // lhs expressions
    lhs: ($) => choice($.identifier, $.array_index),

    // expressions
    exp: ($) =>
      choice(
        $.call_exp,
        $.identifier,
        $.int_literal,
        $.string_literal,
        "null",
        "true",
        "false",
        $.array_index,
        $.array_def,
        $.array_def_init,
        $.bexp,
        $.uexp,
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
        $.for_stmt,
        $.while_stmt,
      ),

    // assignment statement
    assign_stmt: ($) =>
      seq(field("lhs", $.lhs), "=", field("expr", $.exp), ";"),

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
    // else statement
    else_stmt: ($) => choice(seq("else", $.block), seq("else", $.if_stmt)),

    // for loop statement
    for_stmt: ($) =>
      seq(
        "for",
        "(",
        repeat($.vdecl),
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

    // function call expression
    call_exp: ($) =>
      seq(
        $.identifier,
        "(",
        optional(seq($.exp, repeat(seq(",", $.exp)))),
        ")",
      ),

    // array definition
    array_def: ($) =>
      seq(
        "new",
        $.type,
        "[]{",
        optional(seq($.exp, repeat(seq(",", $.exp)))),
        "}",
      ),

    // global array definition
    global_array_def: ($) =>
      seq(
        "new",
        $.type,
        "[]{",
        optional(seq($.gexp, repeat(seq(",", $.gexp)))),
        "}",
      ),

    // array definition with default initializer
    array_def_init: ($) => seq("new", $.primitive_type, "[", $.exp, "]"),

    // integer literal token
    int_literal: ($) => token(choice(seq(optional("-"), /[0-9]+/))),

    // string literal token
    string_literal: ($) =>
      token(seq('"', repeat(choice(/[^"\\\n]/, /\\./)), '"')),

    // identifier
    identifier: ($) => /[A-Za-z_][A-Za-z0-9_]*/,

    // comments: C style single-line and multi-line
    comment: ($) =>
      token(
        choice(seq("//", /[^\n]*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),
  },
});

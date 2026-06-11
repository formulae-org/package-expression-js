# package-expression-js

Expression package for [Fōrmulæ](https://formulae.org) — the visual environment for **computing**, **composing**, and **conversing** with tree-structured expressions.

This repository contains the source code for the **expression package**. It is intended to contain operations applicable to most (or all) other expressions, or expression related to [reflection](https://en.wikipedia.org/wiki/Reflective_programming).

> Part of the [formulae-org](https://github.com/formulae-org) organization: the [web application](https://github.com/formulae-org/formulae-js) plus one repository per package.

▶ **[Showcase](https://formulae.org/?script=showcases/Expression)** — worked examples of this package.

### Capabilities ###

* Expressions applicable universally

  * **Subexpression** expression. It retrieves the i-th subexpression of a given expression. It is shown as $x_i$
  * **Tag** expression. It retrieves the tag of a given expression
  * **Cardinality** expression. It retrieves to number of subexpressions of a given expression. It is shown as $|x|$
  * **Appends/prepends** a subexpression after/before the last/first subexpression of a given expression
  * **Insertion** of a subexpression at a given position
  * **Deletion** of a subexpression at a given position

* Expressions related to reduction

  * **Protect expression**. It prevents a given expression to be reduced
  * **Reduce expression**. Forces reduction of an expression.

* Expressions related to programatic creation of expressions

  * **Serializeation** expression. It converts a given expression to XML text.
  * **Deserialization** expression. It creates an expression from XML text
  * **Create expression** expression. Creation of an expression from its tag
  * **Create expression tree** expression. Creation of an expression from its subexpressions

* Others

  * **Group** expression. Create groups of expressions


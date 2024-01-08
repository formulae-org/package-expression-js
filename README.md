# package-expression-js

Expression package for the [Fōrmulæ](https://formulae.org) programming language.

Fōrmulæ is also a software framework for visualization, edition and manipulation of complex expressions, from many fields. The code for an specific field —i.e. arithmetics— is encapsulated in a single unit called a Fōrmulæ **package**.

This repository contains the source code for the **expression package**. It is intended to contain operations applicable to most (or all) other expressions, or expression related to [reflection](https://en.wikipedia.org/wiki/Reflective_programming).

The GitHub organization [formulae-org](https://github.com/formulae-org) encompasses the source code for the rest of packages, as well as the [web application](https://github.com/formulae-org/formulae-js).

<!--
Take a look at this [tutorial](https://formulae.org/?script=tutorials/Complex) to know the capabilities of the Fōrmulæ arithmetic package.
-->

### Capabilities ###

#### Expressions applicable universally ####

* **Subexpression** expression. It retrieves the i-th subexpression of a given expression. It is shown as $x_i$
* **Tag** expression. It retrieves the tag of a given expression
* **Cardinality** expression. It retrieves to number of subexpressions of a given expression. It is shown as $|x|$
* **Appends/prepends** a subexpression after/before the last/first subexpression of a given expression
* **Insertion** of a subexpression at a given position
* **Deletion** of a subexpression at a given position

#### Expressions related to reduction ####

* **Protect expression**. It prevents a given expression to be reduced
* **Reduce expression**. Forces reduction of an expression.

#### Expressions related to programatic creation of expressions ####

* **Serializeation** expression. It converts a given expression to XML text.
* **Deserialization** expression. It created an expression from XML text
* **Create expression** expression. Creation of an expression from its tag
* **Create expression tree** expression. Creation of an expression from its subexpressions

#### Others ####

* **Group** expression. Create groups of expressions

/*
Fōrmulæ expression package. Module for edition.
Copyright (C) 2015-2026 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

"use strict";

export class ExpressionPackage extends Formulae.Package {}

ExpressionPackage.setEditions = function() {
	// Child extraction — binary, selection as the expression: xᵢ
	Formulae.addBinaryEdition(this.messages, "Expression", "Child", "Expression.Child");

	// Tag / cardinality — wrappers
	Formulae.addWrapperEditions(this.messages, "Expression", "Expression", [ "Tag", "Cardinality" ]);

	// List mutations — binary, selection as the expression
	[ "Append", "Prepend", "Insert", "Delete" ].forEach(
		leaf => Formulae.addBinaryEdition(this.messages, "Expression", leaf, "Expression." + leaf)
	);

	// Protection / grouping / (de)serialization — wrappers
	Formulae.addWrapperEditions(this.messages, "Expression", "Expression", [ "Protect", "Group", "Serialize", "Deserialize" ]);

	// Expression construction and reduction
	Formulae.addWrapperEditions(this.messages, "Expression", "Expression", [ "CreateExpression" ]);
	Formulae.addBinaryEdition (this.messages, "Expression", "CreateExpressionTree", "Expression.CreateExpressionTree", false);
	Formulae.addWrapperEditions(this.messages, "Expression", "Expression", [ "Reduce" ]);

	// Last result — replacing; renders as its own label
	Formulae.addEdition(
		this.messages.pathExpression,
		'<expression tag="Expression.LastResult"/>',
		this.messages.leafLastResult,
		() => Expression.replacingEdition("Expression.LastResult")
	);
};

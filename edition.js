/*
Fōrmulæ expression package. Module for edition.
Copyright (C) 2015-2023 Laurence R. Ugalde

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

'use strict';

export class ExpressionPackage extends Formulae.Package {}

ExpressionPackage.setEditions = function() {
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafChild, () => Expression.binaryEdition("Expression.Child", false));
	
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafTag,         () => Expression.wrapperEdition("Expression.Tag"));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafCardinality, () => Expression.wrapperEdition("Expression.Cardinality"));
	
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafAppend,  () => Expression.binaryEdition("Expression.Append",  false));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafPrepend, () => Expression.binaryEdition("Expression.Prepend", false));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafInsert,  () => Expression.binaryEdition("Expression.Insert",  false));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafDelete,  () => Expression.binaryEdition("Expression.Delete",  false));
	
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafProtect,     () => Expression.wrapperEdition("Expression.Protect"));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafGroup,       () => Expression.wrapperEdition("Expression.Group"));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafSerialize,   () => Expression.wrapperEdition("Expression.Serialize"));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafDeserialize, () => Expression.wrapperEdition("Expression.Deserialize"));
	
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafCreateExpression,     () => Expression.wrapperEdition("Expression.CreateExpression"));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafCreateExpressionTree, () => Expression.binaryEdition ("Expression.CreateExpressionTree", true));
	Formulae.addEdition(this.messages.pathExpression, null, this.messages.leafReduce,               () => Expression.wrapperEdition("Expression.Reduce"));
};

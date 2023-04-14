/*
Fōrmulæ expression package. Module for expression definition & visualization.
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

ExpressionPackage.Child = class extends  Expression.BinaryExpression {
	getTag() { return "Expression.Child"; }
	getName() { return ExpressionPackage.messages.nameChild; }
	getChildName(index) { return ExpressionPackage.messages.childrenChild[index]; }

	prepareDisplay(context) {
		let left = this.children[0], right = this.children[1];
		
		left.prepareDisplay(context);
		
		{
			let bkp = context.fontInfo.size;
			context.fontInfo.setSizeRelative(context, -4);

			right.prepareDisplay(context);

			context.fontInfo.setSizeAbsolute(context, bkp);
		}
		
		left.x = left.y = 0;
		
		if (left.height >= right.horzBaseline) {
			right.y = left.height - right.horzBaseline;
		}
		else {
			right.y =left.horzBaseline;
		}
		
		this.width = (right.x  = left.width + 2) + right.width;
		this.height = right.y + right.height;
		
		this.horzBaseline = left.horzBaseline;
		this.vertBaseline = left.vertBaseline;
	}
	
	display(context, x, y) {
		let left = this.children[0], right = this.children[1];
		
		left.display(context, x + left.x, y + left.y);
		
		{
			let bkp = context.fontInfo.size;
			context.fontInfo.setSizeRelative(context, -4);

			right.display(context, x + right.x, y + right.y);

			context.fontInfo.setSizeAbsolute(context, bkp);
		}
	}
}

ExpressionPackage.Cardinality = class extends Expression.UnaryExpression {
	getTag() { return "Expression.Cardinality"; }
	getName() { return ExpressionPackage.messages.nameCardinality; }
	getChildName(index) { return ExpressionPackage.messages.childCardinality; }

	prepareDisplay(context) {
		let child = this.children[0];
		child.prepareDisplay(context);
		
		child.x = 3;
		child.y = 3;
		
		this.width = 3 + child.width + 3;
		this.height = 3 + child.height + 3;

		this.horzBaseline = child.horzBaseline + 3;
		this.vertBaseline = child.vertBaseline + 3;
	}
	
	display(context, x, y) {
		let child = this.children[0];
		
		context.beginPath();
		context.moveTo (x,              y); context.lineTo(x,              y + this.height); // preventing obfuscation
		context.moveTo (x + this.width, y); context.lineTo(x + this.width, y + this.height); // preventing obfuscation
		context.stroke();
		
		child.display(context, x + child.x, y + child.y);
	}
}

ExpressionPackage.CreateExpressionTree = class extends Expression.Function {
	constructor() {
		super();
		this.min = 2;
		this.max = 3;
	}

	getTag() { return "Expression.CreateExpressionTree"; }
	getMnemonic() { return ExpressionPackage.messages.mnemonicCreateExpressionTree; }
	getName() { return ExpressionPackage.messages.nameCreateExpressionTree; }
	getChildName(index) {
		switch (index) {
			case 0: return ExpressionPackage.messages.childCreateExpressionTreeTag;
			case 1: return this.children.length == 2 ? ExpressionPackage.messages.childCreateExpressionTreeSubexpressions : ExpressionPackage.messages.childCreateExpressionTreeAttributes;
			case 2: return ExpressionPackage.messages.childCreateExpressionTreeSubexpressions;
		}
	}
};

ExpressionPackage.setExpressions = function(module) {
	Formulae.setExpression(module, "Expression.Child",                ExpressionPackage.Child);
	Formulae.setExpression(module, "Expression.Cardinality",          ExpressionPackage.Cardinality);
	Formulae.setExpression(module, "Expression.CreateExpressionTree", ExpressionPackage.CreateExpressionTree);
	
	// functions
	[
		[ "Append",           2, 2 ],
		[ "Prepend",          2, 2 ],
		[ "Insert",           2, 3 ],
		[ "Delete",           2, 2 ],
		[ "CreateExpression", 1, 2 ]
	].forEach(row => Formulae.setExpression(module, "Expression." + row[0], {
		clazz:        Expression.Function,
		getTag:       () => "Expression." + row[0],
		getMnemonic:  () => ExpressionPackage.messages["mnemonic" + row[0]],
		getName:      () => ExpressionPackage.messages["name" + row[0]],
		getChildName: index => ExpressionPackage.messages["children" + row[0]][index],
		min:          row[1],
		max:          row[2]
	}));
	
	// 1-parameter functions
	[ "Tag", "Protect", "Group", "Serialize", "Deserialize", "Reduce" ].forEach(tag => Formulae.setExpression(module, "Expression." + tag, {
		clazz:        Expression.Function,
		getTag:       () => "Expression." + tag,
		getMnemonic:  () => ExpressionPackage.messages["mnemonic" + tag],
		getName:      () => ExpressionPackage.messages["name" + tag],
		getChildName: index => ExpressionPackage.messages["child" + tag]
	}));
};

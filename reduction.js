/*
Fōrmulæ expression package. Module for reduction.
Copyright (C) 2015-2025 Laurence R. Ugalde

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

// expression
//           spec

ExpressionPackage.childReducer = async (child, session) => {
	let left = child.children[0];
	let spec = await session.reduceAndGet(child.children[1], 1);
	
	let result = CanonicalIndexing.getChildBySpec(left, spec);
	
	child.replaceBy(result.clone());
	
	return true;
};

// |expression| (cardinality)

ExpressionPackage.cardinalityReducer = async (cardinalityExpression, session) => {
	cardinalityExpression.replaceBy(
		Arithmetic.createInternalNumber(
			Arithmetic.createInteger(cardinalityExpression.children[0].children.length, session),
			session
		)
	);
	return true;
};

// Tag(expression)

ExpressionPackage.tagReducer = async (tag, session) => {
	let result = Formulae.createExpression("String.String");
	result.set("Value", tag.children[0].getTag());
	tag.replaceBy(result);
	return true;
};

// ReplaceTag(expression, tag_string)

ExpressionPackage.replaceTagReducer = async (replaceTag, session) => {
	let left = replaceTag.children[0];
	let right = replaceTag.children[1];
	
	let tag;
	if (right.getTag() === "String.String") {
		tag = right.get("Value");
	}
	else {
		tag = right.getTag();
	}
	
	let result = Formulae.createExpression(tag);
	
	if (result.canHaveChildren(left.children.length)) {
		for (let i = 0, n = left.children.length; i < n; ++i) {
			result.addChild(left.children[i]);
		}
		
		replaceTag.replaceBy(result);
		//session.log("Tag replaced");
		
		await session.reduce(result);
		
		return true;
	}
	
	ReductionManager.setInError(right, "Target expression cannot have such that number of subexpressions");
	throw new ReductionError();
};

// Protect(expression) -> expression
// even if expression is reducible

ExpressionPackage.protectReducer = async (expr, session) => {
	expr.children[0].setReduced();
	expr.replaceBy(expr.children[0]);
	return true;
};

// Reduce(expression)
// Forces reduction

ExpressionPackage.reduceReducer = async (reduce, session) => {
	let result = reduce.children[0];
	reduce.replaceBy(result);
	await session.reduce(result);
	return true;
};

// ( x ) ->  x

ExpressionPackage.parenthesesReducer = async (expr, session) => {
	expr.replaceBy(expr.children[0]);
	//session.log("Parentheses eliminated");
	return true;
};

// Append(e1, e2)
// See: Symbolic.Append(symbol, expr)[special, high]

ExpressionPackage.appendReducer = async (append, session) => {
	let expr = append.children[0];
	
	if (!expr.canInsertChildAt(expr.children.length)) {
		ReductionManager.setInError(expr, "Expression cannot be appended");
		throw new ReductionError();
	}
	
	expr.addChild(append.children[1]);
	append.replaceBy(expr);
	return true;
};

// Prepend(e1, e2)
// See: Symbolic.Prepend(symbol, expr)[special, high]

ExpressionPackage.prependReducer = async (prepend, session) => {
	let expr = prepend.children[0];
	
	if (!expr.canInsertChildAt(0)) {
		ReductionManager.setInError(expr, "Expression cannot be prepended");
		throw new ReductionError();
	}
	
	expr.addChildAt(0, prepend.children[1]);
	prepend.replaceBy(expr);
	return true;
};

// Insert(e1, e2, pos)
// See: Symbolic.Insert(symbol, expr, pos)[special, high]

ExpressionPackage.insertReducer = async (insert, session) => {
	let expr = insert.children[0];
	
	let pos;
	if (insert.children.length >= 3) {
		let _N = insert.children[2];
		
		pos = Arithmetic.getNativeInteger(_N);
		if (pos === undefined) {
			ReductionManager.setInError(_N, "Expression must be an integer number");
			throw new ReductionError();
		}
		
		let n = expr.children.length;
		
		if (pos < 0) {
			pos = n + pos + 2;
		}
		
		if (pos < 1 || pos > n + 1) {
			ReductionManager.setInError(_N, "index out of range");
			throw new ReductionError();
		}
	}
	else {
		pos = expr.children.length + 1;
	}
	
	if (!expr.canInsertChildAt(pos - 1)) {
		ReductionManager.setInError(_N, "Expression cannot be inserted");
		throw new ReductionError();
	}
	
	expr.addChildAt(pos - 1, insert.children[1].clone());
	insert.replaceBy(expr);
	
	//session.log("Child inserted");
	return true;
};

// Delete(expr, pos)
// See: Symbolic.Delete(symbol, pos)[special, high]

ExpressionPackage.deleteReducer = async (deleteExpr, session) => {
	let expr = deleteExpr.children[0];
	let _N = deleteExpr.children[1];
	
	let pos = Arithmetic.getNativeInteger(_N);
	if (pos === undefined) {
		ReductionManager.setInError(_N, "Expression is not an integer number");
		throw new ReductionError();
	}
	
	let n = expr.children.length;
	
	if (pos < 0) {
		pos = n + pos + 1;
	}
	
	if (pos < 1 || pos > n) {
		ReductionManager.setInError(_N, "index out of range");
		throw new ReductionError();
	}
	
	if (!expr.canRemoveChildAt(pos - 1)) {
		ReductionManager.setInError(_N, "Expression cannot be deleted");
		throw new ReductionError();
	}
	
	expr.removeChildAt(pos - 1);
	deleteExpr.replaceBy(expr);
	
	//session.log("Child deleted");
	return true;
};

ExpressionPackage.group = async (group, session) => {
	let expression = group.children[0];
	
	let expressions = [];
	let occ = [];
	let i, j, n = expression.children.length, J;
	let compare;
	let handler = new ExpressionHandler();
	
	outer: for (i = 0; i < n; ++i) {
		if (i == 0) {
			expressions.push(expression.children[0].clone());
			occ.push(1);
		}
		else {
			for (j = 0, J = expressions.length; j < J; ++j) {
				compare = Formulae.createExpression("Relation.Compare");
				compare.addChild(expression.children[i].clone());
				compare.addChild(expressions[j].clone());
				
				handler.setExpression(compare);
				await session.reduce(compare);
				
				if (handler.expression.getTag() === "Relation.Comparison.Equals") {
					++occ[j];
					continue outer;
				}
			}
			
			expressions.push(expression.children[i].clone());
			occ.push(1);
		}
	}
	
	let result = Formulae.createExpression("List.List");
	let pair;
	
	for (i = 0, n = expressions.length; i < n; ++i) {
		pair = Formulae.createExpression("List.List");
		pair.addChild(expressions[i]);
		pair.addChild(
			Arithmetic.createInternalNumber(
				Arithmetic.createInteger(occ[i], session),
				session
			)
		);
		result.addChild(pair);
	}
	
	group.replaceBy(result);
	return true;
};

ExpressionPackage.serialize = async (serialize, session) => {
	let expression = serialize.children[0];
	try {
		// externalize expression
		let handler = new ExpressionHandler(expression.clone());
		ReductionManager.externalizeNumbersHandler(handler, session);
		
		let xml = await handler.expression.toXML();
		let blob = new Blob([new XMLSerializer().serializeToString(xml)], { type: 'text/xml' });
		let result = Formulae.createExpression("String.String");
		result.set("Value", await blob.text());
		serialize.replaceBy(result);
		return true;
	} catch (error) {
		ReductionManager.setInError(expression, error);
		throw new ReductionError();
	}
};

ExpressionPackage.deserialize = async (deserialize, session) => {
	let stringExpression = deserialize.children[0];
	
	if (stringExpression.getTag() !== "String.String") {
		ReductionManager.setInError(stringExpression, "Expression must be a string");
		throw new ReductionError();
	}
	
	try {
		let promises = [];
		let expression = Formulae.xmlToExpression(stringExpression.get("Value"), promises, false);
		await Promise.all(promises);
		
		// internalize numbers
		let handler = new ExpressionHandler(expression);
		ReductionManager.internalizeNumbersHandler(handler, session);
		
		deserialize.replaceBy(handler.expression);
		return true;
	} catch (error) {
		ReductionManager.setInError(stringExpression, error);
		//console.log(error);
		throw new ReductionError();
	}
};

ExpressionPackage.createExpression = async (createExpression, session) => {
	/////////
	// tag //
	/////////
	
	let tagExpression = createExpression.children[0];
	if (tagExpression.getTag() !== "String.String") {
		ReductionManager.setInError(tagExpression, "Expression must be a string");
		throw new ReductionError();
	}
	
	let result = Formulae.createExpression(tagExpression.get("Value"));
	if (result == null) {
		ReductionManager.setInError(tagExpression, "Unknown tag");
		throw new ReductionError();
	}
	
	//////////////////////////////////////////////
	// attributes and subexpressions retrieving //
	//////////////////////////////////////////////
	
	let attributesExpression = null;
	let subExpressionsExpression = null;
	
	if (createExpression.getTag().endsWith("Expression.CreateExpression")) {
		if (createExpression.children.length >= 2) {
			attributesExpression = createExpression.children[1];
		}
	}
	else { // CreateExpressionTree
		if (createExpression.children.length >= 3) { // with attributes and subexpressions
			attributesExpression = createExpression.children[1];
			subExpressionsExpression = createExpression.children[2];
		}
		else { // only subexpressions
			subExpressionsExpression = createExpression.children[1];
		}
	}
	
	if (attributesExpression !== null && attributesExpression.getTag() === "Null") attributesExpression = null;
	if (subExpressionsExpression !== null && subExpressionsExpression.getTag() === "Null") subExpressionsExpression = null;
	
	///////////////////////////////
	// subexpressions validation //
	///////////////////////////////
	
	if ( // sub expressions is present but it is not a list
		subExpressionsExpression != null &&
		subExpressionsExpression.getTag() !== "List.List"
	) {
		ReductionManager.setInError(subExpressionsExpression, "Expression must be a list");
		throw new ReductionError();
	}
	
	if (
		(subExpressionsExpression == null && !result.canHaveChildren(0)) ||
		(subExpressionsExpression != null && !result.canHaveChildren(subExpressionsExpression.children.length))
	) {
		ReductionManager.setInError(createExpression, "Invalid number of subexpressions");
		throw new ReductionError();
	}
	
	///////////////////////////////////////
	// attributes validation and and set //
	///////////////////////////////////////
	
	let mapAttributes = null;
	if (attributesExpression !== null) {
		mapAttributes = new Map();
		
		if (attributesExpression.getTag() !== "List.List") {
			ReductionManager.setInError(attributesExpression, "Expression must be a list");
			throw new ReductionError();
		}
		
		if (attributesExpression.children[0].getTag() === "String.String") {
			if (attributesExpression.children.length != 2) {
				ReductionManager.setInError(attributesExpression, "Invalid number of subexpressions");
				throw new ReductionError();
			}
			
			if (attributesExpression.children[1].getTag() !== "String.String") {
				ReductionManager.setInError(attributesExpression.children[1], "Expression must be a string");
				throw new ReductionError();
			}
			
			mapAttributes.set(
				attributesExpression.children[0].get("Value"),
				attributesExpression.children[1].get("Value")
			);
		}
		else if (attributesExpression.children[0].getTag() === "List.List") {
			let pairExpression;
			let e1, e2;
			let s1, s2;
			
			for (let i = 0, n = attributesExpression.children.length; i < n; ++i) {
				pairExpression = attributesExpression.children[i];
				
				if (pairExpression.getTag() !== "List.List") {
					ReductionManager.setInError(pairExpression, "Expression must be a list");
					throw new ReductionError();
				}
				
				if (pairExpression.children.length != 2) {
					ReductionManager.setInError(pairExpression, "Invalid number of subexpressions");
					throw new ReductionError();
				}
				
				e1 = pairExpression.children[0];
				e2 = pairExpression.children[1];
				
				if (e1.getTag() !== "String.String") {
					ReductionManager.setInError(e1, "Expression must be a string");
					throw new ReductionError();
				}
				
				if (e2.getTag() !== "String.String") {
					ReductionManager.setInError(e2, "Expression must be a string");
					throw new ReductionError();
				}
				
				s1 = e1.get("Value");
				s2 = e2.get("Value");
				
				if (mapAttributes.has(s1)) {
					ReductionManager.setInError(e1, "Duplicated attribute");
					throw new ReductionError();
				}
				
				mapAttributes.set(s1,  s2);
			}
		}
		else { // error
			ReductionManager.setInError(attributesExpression, "Invalid expression");
			throw new ReductionError();
		}
	}
	
	let requiredAttributes = result.getSerializationNames();
	
	if (
		(requiredAttributes == null && mapAttributes != null) ||
		(requiredAttributes != null && mapAttributes == null)
	) {
		ReductionManager.setInError(createExpression, "Number of attributes does not match");
		throw new ReductionError();
	}
	
	if (requiredAttributes != null) {
		let values = new Array(requiredAttributes.length);
		let name, value;
		
		for (let i = 0, n = requiredAttributes.length; i < n; ++i) {
			name = requiredAttributes[i];
			value = mapAttributes.get(name);
			
			if (value == null) {
				ReductionManager.setInError(createExpression, "Attribute [" + name + "] is required");
				throw new ReductionError();
			}
			
			values[i] = value;
		}
		
		try {
			result.setSerializationStrings(values, []);
		}
		catch (error) {
			ReductionManager.setInError(createExpression, "Invalid values for arguments");
			throw new ReductionError();
		}
	}
	
	///////////////////////////////////
	// insert subexpressions, if any //
	///////////////////////////////////
	
	if (subExpressionsExpression != null) {
		for (let i = 0, n = subExpressionsExpression.children.length; i < n; ++i) {
			result.addChild(subExpressionsExpression.children[i]);
		}
	}
	
	//////////////////////////
	
	createExpression.replaceBy(result);
	//session.log("Expression created");
	return true;
};

ExpressionPackage.reduce = async (reduce, session) => {
	let result = await session.reduceAndGet(reduce.children[0], 0);
	reduce.replaceBy(result);
	return true;
};

ExpressionPackage.lastResult = async (lastResult, session) => {
	if (Formulae.lastResult === null) return false;
	
	let handler = new ExpressionHandler(Formulae.lastResult.clone());
	ReductionManager.internalizeNumbersHandler(handler, session); // Internalization
	
	lastResult.replaceBy(handler.expression);
	return true;
};

ExpressionPackage.setReducers = () => {
	ReductionManager.addReducer("Expression.Child",                ExpressionPackage.childReducer,       "ExpressionPackage.childReducer");
	ReductionManager.addReducer("Expression.Cardinality",          ExpressionPackage.cardinalityReducer, "ExpressionPackage.cardinalityReducer");
	ReductionManager.addReducer("Expression.Tag",                  ExpressionPackage.tagReducer,         "ExpressionPackage.tagReducer");
	ReductionManager.addReducer("Expression.ReplaceTag",           ExpressionPackage.replaceTagReducer,  "ExpressionPackage.replaceTagReducer");
	ReductionManager.addReducer("Expression.Protect",              ExpressionPackage.protectReducer,     "ExpressionPackage.protectReducer", { special: true });
	ReductionManager.addReducer("Expression.Reduce",               ExpressionPackage.reduceReducer,      "ExpressionPackage.reduceReducer");
	ReductionManager.addReducer("Expression.Parentheses",          ExpressionPackage.parenthesesReducer, "ExpressionPackage.parenthesesReducer");
	ReductionManager.addReducer("Expression.Append",               ExpressionPackage.appendReducer,      "ExpressionPackage.appendReducer");
	ReductionManager.addReducer("Expression.Prepend",              ExpressionPackage.prependReducer,     "ExpressionPackage.prependReducer");
	ReductionManager.addReducer("Expression.Insert",               ExpressionPackage.insertReducer,      "ExpressionPackage.insertReducer");
	ReductionManager.addReducer("Expression.Delete",               ExpressionPackage.deleteReducer,      "ExpressionPackage.deleteReducer");
	ReductionManager.addReducer("Expression.Group",                ExpressionPackage.group,              "ExpressionPackage.group");
	ReductionManager.addReducer("Expression.Serialize",            ExpressionPackage.serialize,          "ExpressionPackage.serialize");
	ReductionManager.addReducer("Expression.Deserialize",          ExpressionPackage.deserialize,        "ExpressionPackage.deserialize");
	ReductionManager.addReducer("Expression.CreateExpression",     ExpressionPackage.createExpression,   "ExpressionPackage.createExpression");
	ReductionManager.addReducer("Expression.CreateExpressionTree", ExpressionPackage.createExpression,   "ExpressionPackage.createExpression");
	ReductionManager.addReducer("Expression.Reduce",               ExpressionPackage.reduce,             "ExpressionPackage.reduce");
	ReductionManager.addReducer("Expression.LastResult",           ExpressionPackage.lastResult,         "ExpressionPackage.lastResult");
};

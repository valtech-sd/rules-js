"use strict";

const ProvidedClosure = require("../../lib/closure/ProvidedClosure"),
	chaiPromised = require("chai-as-promised"),
	chai = require("chai");

chai.should();
chai.use(chaiPromised);

describe("ProvidedClosure", () => {

	let closure;

	it("should have name", () => {
		closure = new ProvidedClosure("some-closure", () => true);
		closure.should.have.property("name").equal("some-closure");
	});

	it("should pass execution context to function", function* () {
		const context = context();
		context.suffix = "bar";

		closure = new ProvidedClosure("some-closure", (fact, context) => fact + context.suffix);
		const result = yield closure.process("foo", context);
		result.fact.should.equal("foobar")
	});

	describe("with no parameters", () => {
		beforeEach(() => {
			closure = new ProvidedClosure("some-closure", (fact, context) => fact + "bar");
		});

		it("should execute the associated function when invoked", function* () {
			const result = yield closure.process("foo", context());
			result.fact.should.equal("foobar");
		});
	});

	describe("with required parameters", () => {
		beforeEach(() => {
			closure = new ProvidedClosure("some-closure", (fact, context) => fact + context.parameters.suffix, { required: ["suffix"] });
		});

		it.skip("should fail when executed unbounded", () => {
			(() => closure.process("foo", context())).should.eventually.throw();
		});

		it("should fail when binding but parameter not provided", () => {
			(() => closure.bind(null, {})).should.throw();
		});

		it("should use parameter to resolve result", function* () {
			closure = closure.bind(null, { suffix: "foo" });
			const result = yield closure.process("foo", context());
			result.fact.should.equal("foofoo");
		});

	});

	describe("with optional parameters", () => {
		beforeEach(() => {
			closure = new ProvidedClosure("some-closure", (fact, context) => fact + context.parameters.suffix);
		});

		it("should work when executed unbounded", function* () {
			const result = yield closure.process("foo", context());
			result.fact.should.equal("fooundefined");
		});

		it("should work when binding but parameter not provided", function* () {
			closure = closure.bind(null, { });
			const result = yield closure.process("foo", context());
			result.fact.should.equal("fooundefined");
		});

		it("should use parameter to resolve result", function* () {
			closure = closure.bind(null, { suffix: "foo" });
			const result = yield closure.process("foo", context());
			result.fact.should.equal("foofoo");
		});

	});

});

function context() {
	return {
		parameters: {}
	};
}

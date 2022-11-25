import {subdivision} from "../src/model/SubdivisionNumber";
import {expect, expectFailure} from "./utls/Expect";

describe("SubdivisionNumber", () => {
	it("should return error when given NaN", () => {
		expectFailure(subdivision(NaN));
	});
	it("should return error when given Infinity", () => {
		expectFailure(subdivision(Infinity));
	});
	it("should return error when given -Infinity", () => {
		expectFailure(subdivision(-Infinity));
	});
	it("should return error when given 0", () => {
		expectFailure(subdivision(0));
	});
	it("should succeed when given 1", () => {
		expect(subdivision(1).ok).toBeEqual(true);
	});
	it("should be equal to 2 when given 2", () => {
		const result = subdivision(2);
		if (!result.ok) throw new Error("Unexpected failure");
		expect(result.value).toBeEqual(2);
	});
	it("should return error when given 1.1", () => {
		expectFailure(subdivision(1.1));
	});
	it("should 1 when given 1.0", () => {
		const result = subdivision(1.0);
		if (!result.ok) throw new Error("Unexpected failure");
		expect(result.value).toBeEqual(1);
	});
});
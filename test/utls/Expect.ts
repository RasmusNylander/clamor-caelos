import {Result} from "../../src/utils/Resulta";
import assert = require("assert");

export function expect<T extends any>(value: T) {
	return {
		toBeEqual: (expected: T) => {
			if (value !== expected) {
				throw new Error(`${value} is not equal to ${expected}`);
			}
		},
	};
}

export function expectFailure(value: Result<any>) {
	return assert(value.ok === false);
}

export function expectSuccess(value: Result<any>) {
	return assert(value.ok === true);
}
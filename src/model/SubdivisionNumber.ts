import {error, ok, Result} from "../utils/Resulta";

export class SubdivisionNumber extends Number {
	private constructor(number: number) {
		super(number);
	}
	static fromNumber(number: number): Result<SubdivisionNumber> {
		if (isNaN(number)) return error(`Subdivision must be an integer\nGot: ${number}`);
		if (!isFinite(number)) return error(`Subdivision must be an integer\nGot: ${number}`);
		if (number % 1 !== 0) return error(`Subdivision must be an integer\nGot: ${number}`);
		if (number < 1) return error(`Subdivision must be greater than 0\nGot: ${number}`);
		return ok(new SubdivisionNumber(number));
	}

}

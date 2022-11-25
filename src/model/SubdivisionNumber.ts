import {error, ok, Result} from "../utils/Resulta";

export interface SubdivisionNumber extends Number {}
export function subdivision(int: number): Result<SubdivisionNumber> {
	if (isNaN(int)) return error(`Subdivision must be an integer\nGot: ${int}`);
	if (!isFinite(int)) return error(`Subdivision must be an integer\nGot: ${int}`);
	if (int % 1 !== 0) return error(`Subdivision must be an integer\nGot: ${int}`);
	if (int < 1) return error(`Subdivision must be greater than 0\nGot: ${int}`);
	return ok(int as SubdivisionNumber);
}
export type Success<T> = { readonly ok: true, value: T };
export type Failure<E extends Error = Error> = { readonly ok: false, error: E };

export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;


export function ok(): Success<void>;
export function ok<T>(value: T): Success<T>;
export function ok<T>(value?: T): Success<T> {
	return {ok: true, value: value as T};
}

export function error<E extends Error = Error>(error: E): Failure<E>;
export function error<E extends Error = Error>(error_message: string): Failure<E>;
export function error<E extends Error = Error, C extends Error = Error>(error_message: string, cause: C): Failure<E>;
export function error<E extends Error = Error, C extends Error = Error>(e: E | string, cause?: C): Failure<E> {
	if (typeof e === "string") {
		const error = cause === undefined ? new Error(e) : new Error(e, {cause: cause});
		return {ok: false, error: error as E};
	}

	return {ok: false, error: e};
}



class AssertionError extends Error {
	constructor(message: string, options?: {cause: Error}) {
		super(message, options?.cause);
		this.name = 'AssertionError';
	}
}

export default function assert(condition: boolean, message: string) {
	if (!condition) {
		throw new AssertionError(message);
	}
}
// MVUpgraded
// This

import {error, ok, Result} from "./Resulta";


//----------------------------------------------------------------------------


function radians(degrees: number): number {
	return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------
//
//  Types
//

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
type Vec = Vec2 | Vec3 | Vec4;

export type Mat2 = [Vec2, Vec2];
export type Mat3 = [Vec3, Vec3, Vec3];
export type Mat4 = [Vec4, Vec4, Vec4, Vec4];
type Mat = Mat2 | Mat3 | Mat4;

type lowerDimensionMat<T extends Mat> = T extends Mat2 ? never : T extends Mat3 ? Mat2 : T extends Mat4 ? Mat3 : never;
type lowerDimensionVec<T extends Vec> = T extends Vec2 ? never : T extends Vec3 ? Vec2 : T extends Vec4 ? Vec3 : never;
type previousDim<T extends Mat | Vec> = T extends Vec ? lowerDimensionVec<T> : T extends Mat ? lowerDimensionMat<T> : never;
type higherDimensionMat<T extends Mat> = T extends Mat2 ? Mat3 : T extends Mat3 ? Mat4 : never;
type higherDimensionVec<T extends Vec> = T extends Vec2 ? Vec3 : T extends Vec3 ? Vec4 : never;
type nextDim<T extends Mat | Vec> = T extends Mat ? higherDimensionMat<T> : T extends Vec ? higherDimensionVec<T> : never;
type matIndex<T extends Mat> = T extends Mat2 ? (0 | 1) : T extends Mat3 ? (0 | 1 | 2) : T extends Mat4 ? (0 | 2 | 1 | 3) : never;
type matchingVec<T extends Mat> = T extends Mat2 ? Vec2 : T extends Mat3 ? Vec3 : T extends Mat4 ? Vec4 : never;
type matchingMat<T extends Vec> = T extends Vec2 ? Mat2 : T extends Vec3 ? Mat3 : T extends Vec4 ? Mat4 : never;
type matching<T extends Mat | Vec> = T extends Mat ? matchingVec<T> : T extends Vec ? matchingMat<T> : never;
type sameVec<T extends Vec> = T & Vec2 extends never ? (T & Vec3 extends never ? (T & Vec4 extends never ? never : Vec4) : Vec3) : Vec2;
type sameMat<T extends Mat> = T & Mat2 extends never ? (T & Mat3 extends never ? (T & Mat4 extends never ? never : Mat4) : Mat3) : Mat2;
type matOfDim<T extends number> = T extends 2 ? Mat2 : T extends 3 ? Mat3 : T extends 4 ? Mat4 : never;


//----------------------------------------------------------------------------
//
//  Vector Constructors
//

export function vec2(v: number): Vec2;
export function vec2(x: number, y: number): Vec2;
export function vec2(x: number, y?: number): Vec2 {
	if (y === undefined)
		return [x, x];
	return [x, y];
}

export function vec3(v: number): Vec3;
export function vec3(x: number, y: number, z: number): Vec3;
export function vec3(xy: Vec2, z: number): Vec3;
export function vec3(xyz: Vec4): Vec3;
export function vec3(a: Vec2 | Vec4 | number, b?: number, c?: number): Vec3 {
	if (b === undefined)
		return (a instanceof Array ? [a[0], a[1], a[2]] : [a, a, a]) as Vec3;

	if (c === undefined)
		return [(<Vec2>a)[0], (<Vec2>a)[1], b];

	return [<number>a, b, c];
}


export function vec4(v: number): Vec4;
export function vec4(x: number, y: number, z: number, w: number): Vec4;
export function vec4(xy: Vec2, z: number, w: number): Vec4;
export function vec4(xyz: Vec3, w: number): Vec4;
export function vec4(a: Vec3 | Vec2 | number, b?: number, c?: number, d?: number): Vec4 {
	if (b === undefined)
		return <Vec4>[a, a, a, a];

	if (c === undefined)
		return [(<Vec3>a)[0], (<Vec3>a)[1], (<Vec3>a)[2], b];

	if (d === undefined)
		return [(<Vec2>a)[0], (<Vec2>a)[1], b, c];

	return [<number>a, b, c, d];
}


//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

export function mat2(v: number): Mat2;
export function mat2(a: Vec2, b: Vec2): Mat2;
export function mat2(a: Vec2 | number, b?: Vec2): Mat2 {
	if (b === undefined)
		return [vec2(<number>a), vec2(<number>a)];

	return <Mat2>[a, b];
}

export function mat3(v: number): Mat3;
export function mat3(a: Vec3, b: Vec3, c: Vec3): Mat3;
export function mat3(a: Vec3 | number, b?: Vec3, c?: Vec3): Mat3 {
	if (b === undefined)
		return [vec3(<number>a), vec3(<number>a), vec3(<number>a)];
	return <Mat3>[a, b, c];
}

export function mat4(v: number): Mat4;
export function mat4(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4;
export function mat4(a: Vec4 | number, b?: Vec4, c?: Vec4, d?: Vec4): Mat4 {
	if (b === undefined)
		return [vec4(<number>a), vec4(<number>a), vec4(<number>a), vec4(<number>a)];
	return <Mat4>[a, b, c, d];
}

export function diagonal<T extends Vec>(vec: T): matching<typeof vec> {
	if (vec.length == 2)
		return <matching<typeof vec>>mat2(vec2(vec[0], 0), vec2(0, vec[1]));

	if (vec.length == 3)
		return <matching<typeof vec>>mat3(vec3(vec[0], 0, 0), vec3(0, vec[1], 0), vec3(0, 0, vec[2]));

	return <matching<typeof vec>>mat4(vec4(vec[0], 0, 0, 0), vec4(0, vec[1], 0, 0), vec4(0, 0, vec[2], 0), vec4(0, 0, 0, vec[3]));
}

export function identity<T extends 2 | 3 | 4>(dimension: T): matOfDim<typeof dimension> {
	switch (dimension) {
		case 2:
			return <matOfDim<typeof dimension>>mat2(vec2(1, 0), vec2(0, 1));
		case 3:
			return <matOfDim<typeof dimension>>mat3(vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
		case 4:
			return <matOfDim<typeof dimension>>mat4(vec4(1, 0, 0, 0), vec4(0, 1, 0, 0), vec4(0, 0, 1, 0), vec4(0, 0, 0, 1));
	}
	throw new Error("Unreachable code");
}

//----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

export function translation<T extends (Vec2 | Vec3)>(v: T): nextDim<matchingMat<typeof v>> {
	if (v.length == 2)
		return <nextDim<matchingMat<typeof v>>>mat3(vec3(1, 0, v[0]), vec3(0, 1, v[1]), vec3(0, 0, 1));

	return <nextDim<matchingMat<typeof v>>>mat4(vec4(1, 0, 0, v[0]), vec4(0, 1, 0, v[1]), vec4(0, 0, 1, v[2]), vec4(0, 0, 0, 1));
}

export function rotation(angle: number, axis: Vec3): Mat4 {
	axis = normalize(axis);
	let s = Math.sin(angle);
	let c = Math.cos(angle);
	let omc = 1.0 - c;
	return mat4(
		vec4(axis[0] * axis[0] * omc + c, axis[0] * axis[1] * omc - axis[2] * s, axis[0] * axis[2] * omc + axis[1] * s, 0),
		vec4(axis[1] * axis[0] * omc + axis[2] * s, axis[1] * axis[1] * omc + c, axis[1] * axis[2] * omc - axis[0] * s, 0),
		vec4(axis[2] * axis[0] * omc - axis[1] * s, axis[2] * axis[1] * omc + axis[0] * s, axis[2] * axis[2] * omc + c, 0),
		vec4(0, 0, 0, 1)
	);
}

export function rotateAxisTo(axis: Vec3, target: Vec3): Mat4 {
	let axisNorm = normalize(axis);
	let targetNorm = normalize(target);

	if (equal(axisNorm, targetNorm))
		return identity(4);

	let angle = Math.acos(dot(axisNorm, targetNorm));
	let crossed = cross(targetNorm, axisNorm);
	return rotation(angle, crossed);
}

export function scalingMatrix<T extends Vec2 | Vec3>(v: T): nextDim<matching<typeof v>> {
	if (v.length == 2)
		return <nextDim<matching<typeof v>>>mat3(vec3(v[0], 0, 0), vec3(0, v[1], 0), vec3(0, 0, 1));

	return <nextDim<matching<typeof v>>>mat4(vec4(v[0], 0, 0, 0), vec4(0, v[1], 0, 0), vec4(0, 0, v[2], 0), vec4(0, 0, 0, 1));
}

export function rotationMatrixX(θ: number): Mat4 {
	let c = Math.cos(radians(θ));
	let s = Math.sin(radians(θ));
	return mat4(
		vec4(1.0, 0.0, 0.0, 0.0),
		vec4(0.0, c, s, 0.0),
		vec4(0.0, -s, c, 0.0),
		vec4(0.0, 0.0, 0.0, 1.0)
	);
}

export function rotationMatrixY(θ: number): Mat4 {
	let c = Math.cos(radians(θ));
	let s = Math.sin(radians(θ));
	return mat4(
		vec4(c, 0.0, -s, 0.0),
		vec4(0.0, 1.0, 0.0, 0.0),
		vec4(s, 0.0, c, 0.0),
		vec4(0.0, 0.0, 0.0, 1.0)
	);
}

export function rotationMatrixZ(θ: number): Mat4 {
	let c = Math.cos(radians(θ));
	let s = Math.sin(radians(θ));
	return mat4(
		vec4(c, s, 0.0, 0.0),
		vec4(-s, c, 0.0, 0.0),
		vec4(0.0, 0.0, 1.0, 0.0),
		vec4(0.0, 0.0, 0.0, 1.0)
	);
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

export function orthographic<
	A extends number, B extends number,
	C extends number, D extends number,
	E extends number, F extends number
>(left: A, right: Exclude<B, A>, bottom: C, top: Exclude<D, C>, near: E, far: Exclude<F, E>): Mat4 {
	let w = right - left;
	let h = top - bottom;
	let d = far - near;

	return mat4(
		vec4(2 / w, 0, 0, -(left + right) / w),
		vec4(0, 2 / h, 0, -(top + bottom) / h),
		vec4(0, 0, 2 / d, -(near + far) / d),
		vec4(vec3(0), 1)
	);
}

export function perspective<Num extends number>(fov_y: number, aspect: number, near: Num, far: Num): Mat4 {
	let f = 1.0 / Math.tan(radians(fov_y) / 2);
	let d = far - near;

	return mat4(
		vec4(f / aspect, 0, 0, 0),
		vec4(0, f, 0, 0),
		vec4(0, 0, -(near + far) / d, -2 * near * far / d),
		vec4(0, 0, -1, 0)
	);
}

//----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

export function lookAt(eye: Vec3, at: Vec3, up: Vec3): Mat4 {
	if (equal(eye, at))
		return identity(4);

	let view = normalize(subtract(at, eye));
	let n = normalize(cross(up, view));
	let new_up = cross(view, n);

	view = multiply(view, -1);

	return mat4(
		vec4(n, -dot(n, eye)),
		vec4(new_up, -dot(new_up, eye)),
		vec4(view, -dot(view, eye)),
		vec4(vec3(0), 1)
	);

}


//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

export function equal<T extends Vec>(a: T, b: sameVec<typeof a>): boolean;
export function equal<T extends Mat>(a: T, b: sameMat<typeof a>): boolean;
export function equal(a: Vec | Mat, b: Vec | Mat): boolean {
	function equalVec(a: Vec, b: Vec): boolean {
		for (let i = 0; i < a.length; i++)
			if (a[i] !== b[i]) return false;
		return true;
	}

	if (typeof a[0] === "number") return equalVec(<Vec>a, <Vec>b);

	for (let i = 0; i < a.length; i++) {
		if (!equalVec(<Vec>a[i], <Vec>b[i])) return false;
	}
	return true;
}

export function almostEqual<T extends Vec>(a: T, b: sameVec<typeof a>, epsilon: number): boolean;
export function almostEqual<T extends Mat>(a: T, b: sameMat<typeof a>, epsilon: number): boolean;
export function almostEqual(a: Vec | Mat, b: Vec | Mat, epsilon = 0.00001): boolean {
	function almostEqualVec(a: Vec, b: Vec): boolean {
		for (let i = 0; i < a.length; i++)
			if (Math.abs(a[i] - b[i]) > epsilon) return false;
		return true;
	}

	if (typeof a[0] === "number") return almostEqualVec(<Vec>a, <Vec>b);

	for (let i = 0; i < a.length; i++) {
		if (!almostEqualVec(<Vec>a[i], <Vec>b[i])) return false;
	}
	return true;

}

export function add<T extends Vec>(a: T, b: number): T;
export function add<T extends Vec>(a: T, b: sameVec<typeof a>): T;
export function add<T extends Mat>(a: T, b: number): T;
export function add<T extends Mat>(a: T, b: sameMat<typeof a>): T;
export function add(a: Vec | Mat, b: number | Vec | Mat): Vec | Mat {
	if (typeof a[0] !== "number") { // Matrix
		if (typeof b === "number")
			return <Mat>a.map((v) => add(<Vec>v, b));
		return <Mat>a.map((v, i) => add(<Vec>v, <number>b[i]));
	}

	if (typeof b === "number")
		return <Vec>a.map((v) => <number>v + b);
	return <Vec>a.map((v, i) => <number>v + <number>b[i]);
}

export function subtract<T extends Vec>(a: T, b: number): T;
export function subtract<T extends Vec>(a: T, b: sameVec<typeof a>): T;
export function subtract<T extends Mat>(a: T, b: number): T;
export function subtract<T extends Mat>(a: T, b: sameMat<typeof a>): T;
export function subtract(a: Vec | Mat, b: number | Vec | Mat): Vec | Mat {
	if (typeof a[0] !== "number") { // Matrix
		if (typeof b === "number")
			return <Mat>a.map((v, _) => subtract(<Vec>v, b));
		return <Mat>a.map((v, i) => subtract(<Vec>v, <number>b[i]));
	}
	if (typeof b === "number")
		return <Vec>a.map((v) => <number>v - b);

	return <Vec>a.map((v, i) => <number>v - <number>b[i]);
}


export function multiply<T extends Vec>(a: T, b: number): sameVec<typeof a>;
export function multiply<T extends Mat>(a: T, b: number): sameMat<typeof a>;
export function multiply<T extends Vec>(a: matching<typeof b>, b: T): sameVec<typeof b>;
export function multiply<T extends Mat>(a: T, b: sameMat<typeof a>): sameMat<typeof a>;
export function multiply(a: Vec | Mat, b: number | Vec | Mat): Vec | Mat {
	if (typeof b === "number")
		return scale(a, b);

	if (typeof b[0] === "number") {
		b = <Vec>b;
		return transform(<matching<typeof b>>a, b);
	}

	a = <Mat>a;
	return multiplyMat(a, <sameMat<typeof a>>b);

}

export function multiplyMat<T extends Mat>(a: T, b: sameMat<typeof a>): T {
	return <T>a.map(
		(row, i) =>
			row.map((_, j) =>
				row.reduce((sum, _, k) => sum + a[i][k] * b[k][j], 0)
			)
	);
}

export function transform<T extends Vec>(transformation: matchingMat<typeof vector>, vector: T): sameVec<typeof vector> {
	return <sameVec<typeof vector>>vector.map((_, i) => dot(vector, <sameVec<typeof vector>>transformation[i]));
}

export function lerp<T extends Vec>(a: T, b: sameVec<typeof a>, t: number): sameVec<typeof a>;
export function lerp<T extends Mat>(a: T, b: sameMat<typeof a>, t: number): sameMat<typeof a>;
export function lerp(a: Vec | Mat, b: Vec | Mat, t: number): Vec | Mat {
	if (typeof a[0] !== "number") // Matrix
	{ // @ts-ignore
		return <Mat>a.map((v, i) => lerp(v, <Vec>b[i], t));
	}

	return <Vec>a.map((v, i) => <number>v + (<number>b[i] - <number>v) * t);
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//
export function transpose<T extends Mat>(m: T): T {
	return <T>m[0].map((_, c) => m.map((row: Vec, r) => m[r][c]))
}

export function submatrix<T extends Mat4 | Mat3>(m: T, without_row: matIndex<typeof m>, without_column: matIndex<typeof m>): lowerDimensionMat<typeof m> {
	return (<Array<Array<number>>>m)
		.filter((_, i) => i !== without_row)
		.map((row) => row.filter((_, i) => i !== without_column)) as lowerDimensionMat<typeof m>;
}

export function determinant<T extends Mat>(m: T): number {
	if (m.length === 2)
		return m[0][0] * m[1][1] - m[0][1] * m[1][0];
	if (m.length === 3)
		return m[0][0] * m[1][1] * m[2][2]
			+ m[0][1] * m[1][2] * m[2][0]
			+ m[0][2] * m[1][0] * m[2][1]
			- m[0][2] * m[1][1] * m[2][0]
			- m[0][1] * m[1][0] * m[2][2]
			- m[0][0] * m[1][2] * m[2][1];

	return m[0][0] * determinant(submatrix(m, 0, 0))
		- m[0][1] * determinant(submatrix(m, 0, 1))
		+ m[0][2] * determinant(submatrix(m, 0, 2))
		- m[0][3] * determinant(submatrix(m, 0, 3));
}


//----------------------------------------------------------------------------
//
//  Vector Functions
//

export function dot<T extends Vec>(a: T, b: sameVec<typeof a>): number {
	return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

//----------------------------------------------------------------------------
// Cross product only defined for 3D and 7D vectors
export function cross(a: Vec3, b: Vec3): Vec3 {
	return vec3(
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	);
}

//----------------------------------------------------------------------------

export function length(v: Vec): number {
	// @ts-ignore
	return Math.sqrt(dot(v, v));
}

//----------------------------------------------------------------------------

export function normalize<T extends Vec>(v: T): T {
	return scale(v, 1 / length(v));
}

//----------------------------------------------------------------------------

export function mix<T extends Vec>(a: T, b: sameVec<typeof a>, s: number): T {
	return add(scale(a, 1 - s), scale(b, s));
}

//----------------------------------------------------------------------------
//
// Vector and Matrix functions
//

// export function scale<T extends Vec>(a: T, s: number): T;
// export function scale<T extends Mat>(a: T, s: number): T;
// export function scale(a: Vec | Mat, s: number): Vec | Mat {
export function scale<T extends Mat | Vec>(a: T, s: number): T {
	function scaleVec(vec: Vec, s: number): Vec {
		return <Vec>vec.map((v) => v * s);
	}

	if (typeof a[0] !== "number") {
		return <T>(<Mat>a).map((v) => scaleVec(v, s));
	}

	return <T>scaleVec(<Vec>a, s);
}

export function multiplyElementWise<T extends Vec>(a: T, b: sameVec<typeof a>): T;
export function multiplyElementWise<T extends Mat>(a: T, b: sameMat<typeof a>): T;
export function multiplyElementWise(a: Vec | Mat, b: Vec | Mat): Vec | Mat {
	if (typeof a[0] !== "number") // Matrix
	{ // @ts-ignore
		return <Mat>a.map((v, i) => multiplyElementWise(v, <Vec>b[i]));
	}

	// @ts-ignore
	return <Vec>a.map((v, i) => v * <number>b[i]);
}

export function divideElementWise<T extends Vec>(a: T, b: sameVec<typeof a>): T;
export function divideElementWise<T extends Mat>(a: T, b: sameMat<typeof a>): T;
export function divideElementWise(a: Vec | Mat, b: Vec | Mat): Vec | Mat {
	if (typeof a[0] !== "number") { // @ts-ignore
		return <Mat>a.map((v, i) => divideElementWise(v, <Vec>b[i]));
	}

	// @ts-ignore
	return <Vec>a.map((v, i) => v / <number>b[i]);
}

export function flatten(...x: Vec2[]): Float32Array;
export function flatten(...x: Vec3[]): Float32Array;
export function flatten(...x: Vec4[]): Float32Array;
export function flatten(...x: Vec[]): Float32Array {
	return new Float32Array(x.flat(1));
}

export function flattenMat(m: Mat): Float32Array {
	return new Float32Array(transpose(m).flat(1));
}

export let sizeof = {
	'vec2': 8,
	'vec3': 12,
	'vec4': 16,
	'mat2': 16,
	'mat3': 36,
	'mat4': 64
};

//----------------------------------------------------------------------------
//
//  Inverses
//

function map2D<T extends Mat>(m: T, f: (v: number, i: matIndex<T>, j: matIndex<T>) => number): T {
	return <T>m.map(
		(row, i) => row.map(
			(v, j) => f(v, <matIndex<T>>i, <matIndex<T>>j)
		)
	);
}

export function inverse<T extends Mat>(m: T): Result<T> {
	let d = determinant(m);
	if (d == 0)
		return error("Non-invertible matrix; determinant is 0.");

	if (m.length == 2) {
		let inverse = mat2(
			vec2(m[1][1] / d, -m[0][1] / d),
			vec2(-m[1][0] / d, m[0][0] / d)
		);
		return <Result<T>>ok(inverse)
	}

	let inverse = map2D(m, (v, i, j) => {
			return determinant(submatrix(m, i, j)) / d;
		}
	);
	return ok(inverse);
}


//----------------------------------------------------------------------------

export function normalMatrix(m: Mat4, flag: true): Result<Mat4>
export function normalMatrix(m: Mat4, flag?: false): Result<Mat3>
export function normalMatrix(m: Mat4, flag: boolean = false): Result<Mat3 | Mat4> {
	let result = inverse(transpose(m));
	if (flag || !result.ok)
		return result;
	let mat = result.value;

	return ok(
		submatrix(m, 3, 3)
	);
}


namespace MVUtest {

	export function multiply_matrices_should_return_matrix(): Result<void> {
		let I = identity(4);
		if (equal(I, multiply(I, I))) return ok();
		return error("Multiplying matrices should return matrix\nExpected: " + I + "\nActual: " + multiply(I, I));
	}

	export function equal_should_return_true_given_same_object(): Result<void> {
		let a = vec3(0);
		if (equal(a, a)) return ok();
		return error("equal should return true given same object");
	}

	export function equal_should_return_false_given_different_objects(): Result<void> {
		let a = mat4(-1);
		let b = mat4(1);
		if (!equal(a, b)) return ok();
		return error("equal should return false given different objects");
	}

	export function equal_should_return_true_given_same_vector(): Result<void> {
		let a = vec2(1, 2);
		let b = vec2(1, 2);
		if (equal(a, b)) return ok();
		return error("equal should return true given same vectors\nExpected: " + a + "=" + b + "\nActual: " + a + "≠" + b);
	}

	export function equal_should_return_true_given_same_matrices(): Result<void> {
		let a = mat2(0);
		let b = mat2(0);
		if (equal(a, b)) return ok();
		return error("equal should return true given same matrices\nExpected: " + a + "=" + b + "\nActual: " + a + "≠" + b);
	}

	export function scale_should_return_identical_vector_given_scale_1(): Result<void> {
		let v = vec3(1, 2, 3);
		let sv = scale(v, 1);
		if (equal(v, sv)) return ok();
		return error("scale should return identical vector when scaling by 1\nExpected: " + v + "\nActual: " + sv);
	}

	export function scale_should_return_scaled_vector(): Result<void> {
		let v = vec2(1, 1);
		let sv = scale(v, 2);
		if (equal(sv, vec2(2, 2))) return ok();
		return error("scale should return scaled vector\nExpected: " + vec2(2, 2) + "\nActual: " + sv);
	}

	export function scale_should_return_identical_matrix_given_scale_1(): Result<void> {
		let m = mat3(
			vec3(1, 2, 3),
			vec3(4, 5, 6),
			vec3(7, 8, 9)
		)
		let sm = scale(m, 1);
		if (equal(m, sm)) return ok();
		return error("scale should return identical matrix when scaling by 1\nExpected: " + m + "\nActual: " + sm);
	}

	export function scale_should_return_scaled_matrix(): Result<void> {
		let m = mat2(
			vec2(1, 2),
			vec2(3, 4)
		);
		let sm = scale(m, -2);
		let expected = mat2(
			vec2(-2, -4),
			vec2(-6, -8)
		);
		if (equal(sm, expected)) return ok();
		return error("scale should return scaled matrix\nExpected: " + expected + "\nActual: " + sm);
	}

	export function transpose_should_return_matrix_identical_matrix(): Result<void> {
		let m = mat3(0);
		let tm = transpose(m);
		if (equal(m, tm)) return ok();
		return error("transpose should return identical matrix\nExpected: " + m + "\nActual: " + tm);
	}

	export function transpose_should_return_transposed_matrix(): Result<void> {
		let m = mat4(
			vec4(1, 2, 3, 4),
			vec4(5, 6, 7, 8),
			vec4(9, 10, 11, 12),
			vec4(13, 14, 15, 16)
		);
		let tm = transpose(m);
		let expected = mat4(
			vec4(1, 5, 9, 13),
			vec4(2, 6, 10, 14),
			vec4(3, 7, 11, 15),
			vec4(4, 8, 12, 16)
		);
		if (equal(tm, expected)) return ok();
		return error("transpose should return transposed matrix\nExpected: " + expected + "\nActual: " + tm);
	}

	export function inverse_should_return_identity_given_identity_matrix(): Result<void> {
		let m = diagonal(vec2(1))

		let result = inverse(m)
		if (!result.ok) return error("Inverse returned error unexpectedly: " + result["error"]);
		let m_inv: Mat2 = result.value

		if (equal(m, <Mat2>m_inv)) return ok()
		return error("inverse should return identity given identity matrix\nExpected: " + m + "\nActual: " + m_inv)
	}

	export function inverse_should_return_error_given_non_invertible_matrix(): Result<void> {
		let result = inverse(mat4(0));
		if (result.ok) return error("Inverse should have returned error but matrix instead\nMatrix: " + result.value);
		return ok();
	}

	export function identity_should_return_identity_matrix(): Result<void> {
		let m = identity(4);
		let expected = mat4(
			vec4(1, 0, 0, 0),
			vec4(0, 1, 0, 0),
			vec4(0, 0, 1, 0),
			vec4(0, 0, 0, 1)
		);
		if (equal(m, expected)) return ok();
		return error("identity should return identity matrix\nExpected: " + expected + "\nActual: " + m);
	}

	export function rotate_axis_to_axis_should_return_identity_given_same_axis(): Result<void> {
		let axis = vec3(1, 0, 0);
		let rotation = rotateAxisTo(axis, axis);
		let expected = identity(4);
		if (equal(rotation, expected)) return ok();
		return error("rotateAxisTo should return identity given same axis\nExpected: " + expected + "\nActual: " + rotation);
	}

	export function rotate_axis_to_axis_should_return_rotation_given_orthogonal_axes(): Result<void> {
		let axis = vec3(1, 0, 0);
		let target = vec3(0, 1, 0);
		let rotation = rotateAxisTo(axis, target);
		// Rotation from (1, 0, 0) to (0, 1, 0) is a 90-degree rotation around the z axis
		let expected = rotationMatrixZ(90);
		if (equal(rotation, expected)) return ok();
		return error("rotateAxisTo should return rotation given orthogonal axes\nExpected: " + expected + "\nActual: " + rotation);
	}

	export function rotate_axis_to_axis_should_return_rotation_given_non_orthogonal_axes(): Result<void> {
		let axis = vec3(1, 0, 0);
		let target = vec3(1, 1, 0);
		let angle = Math.acos(dot(axis, target));
		let rotation = rotateAxisTo(axis, target);
		// Rotation from (1, 0, 0) to (1, 1, 0) is a 45-degree rotation around the z axis
		let expected = rotationMatrixZ(45);
		if (equal(rotation, expected)) return ok();
		// Allow for some error due to floating point precision
		if (almostEqual(rotation, expected, 0.0000001)) return ok();

		return error("rotateAxisTo should return rotation given non-orthogonal axes\nExpected: " + expected + "\nActual:   " + rotation);
	}

	export function multiply_mat_should_return_identity_given_identity_matrices(): Result<void> {
		let m1 = identity(4);
		let m2 = identity(4);
		let result = multiply(m1, m2);
		if (equal(result, m1)) return ok();
		return error("multiply should return identity given identity matrices\nExpected: " + m1 + "\nActual: " + result);
	}

	export function multiply_mat_should_return_matrix_given_matrix_and_identity(): Result<void> {
		let m1 = mat4(
			vec4(1, 2, 3, 4),
			vec4(5, 6, 7, 8),
			vec4(9, 10, 11, 12),
			vec4(13, 14, 15, 16)
		);
		let m2 = identity(4);
		let result = multiply(m1, m2);
		if (equal(result, m1)) return ok();
		return error("multiply should return matrix given matrix and identity\nExpected: " + m1 + "\nActual: " + result);
	}

	export function multiply_mat_should_not_be_commutative(): Result<void> {
		let m1 = mat2(
			vec2(1, 2),
			vec2(3, 4)
		);
		let m2 = mat2(
			vec2(5, 6),
			vec2(7, 8)
		);
		let result1 = multiply(m1, m2);
		let result2 = multiply(m2, m1);
		if (equal(result1, result2)) return error("multiply should not be commutative");
		return ok();
	}

	export function multiply_mat_should_return_product_of_matrices(): Result<void> {
		let m1 = mat2(
			vec2(1, 2),
			vec2(3, 4)
		);
		let m2 = mat2(
			vec2(5, 6),
			vec2(7, 8)
		);
		let expected = mat2(
			vec2(19, 22),
			vec2(43, 50)
		);
		let result = multiply(m1, m2);
		if (equal(result, expected)) return ok();
		return error("multiply should return product of matrices\nExpected: " + expected + "\nActual: " + result);
	}


	export function transform_should_return_identity_given_identity_matrix(): Result<void> {
		let m = identity(4);
		let v = vec4(1, 2, 3, 4);
		let result = transform(m, v);
		if (equal(result, v)) return ok();
		return error("tep")
	}

	export function transform_should_return_product_of_matrix_and_vector(): Result<void> {
		let m = mat4(
			vec4(1, 2, 3, 4),
			vec4(5, 6, 7, 8),
			vec4(9, 10, 11, 12),
			vec4(13, 14, 15, 16)
		);
		let v = vec4(1, 2, 3, 4);
		let expected = vec4(30, 70, 110, 150);
		let result = transform(m, v);
		if (equal(result, expected)) return ok();
		return error("transform should return product of matrix and vector\nExpected: " + expected + "\nActual: " + result);
	}

	export function rotation_should_return_identity_given_zero_angle(): Result<void> {
		let angle = 0;
		let axis = vec3(1, 0, 0);
		let result = rotation(angle, axis);
		let expected = identity(4);
		if (equal(result, expected)) return ok();
		return error("rotation should return identity given zero angle\nExpected: " + expected + "\nActual: " + result);
	}

	export function lerp_should_return_first_value_given_zero_t(): Result<void> {
		let a = vec2(1, 2);
		let b = vec2(3, 4);
		let t = 0;
		let result = lerp(a, b, t);
		if (equal(result, a)) return ok();
		return error("lerp should return first value given zero t\nExpected: " + a + "\nActual: " + result);
	}

	export function lerp_should_return_second_value_given_one_t(): Result<void> {
		let a = mat4(0);
		let b = identity(4);
		let t = 1;
		let result = lerp(a, b, t);
		if (equal(result, b)) return ok();
		return error("lerp should return second value given one t\nExpected: " + b + "\nActual: " + result);
	}

	export function lerp_should_return_interpolated_value_given_t_between_zero_and_one(): Result<void> {
		let a = vec2(1, 2);
		let b = vec2(3, 4);
		let t = 0.5;
		let result = lerp(a, b, t);
		let expected = vec2(2, 3);
		if (equal(result, expected)) return ok();
		return error("lerp should return interpolated value given t between zero and one\nExpected: " + expected + "\nActual: " + result);
	}

	export function lerp_should_return_value_given_the_same_value(): Result<void> {
		let a = vec4(1, 2, 3, 4);
		let t = 0.7;
		let result = lerp(a, a, t);
		if (equal(result, a)) return ok();
		return error("lerp should return value given the same value\nExpected: " + a + "\nActual: " + result);
	}

	export function lerp_mat_should_return_first_value_given_zero_t(): Result<void> {
		let a = mat4(0);
		let b = identity(4);
		let t = 0;
		let result = lerp(a, b, t);
		if (equal(result, a)) return ok();
		return error("lerp should return first value given zero t\nExpected: " + a + "\nActual: " + result);
	}

	export function lerp_mat_should_return_second_value_given_one_t(): Result<void> {
		let a = mat4(0);
		let b = identity(4);
		let t = 1;
		let result = lerp(a, b, t);
		if (equal(result, b)) return ok();
		return error("lerp should return second value given one t\nExpected: " + b + "\nActual: " + result);
	}

	export function lerp_should_return_interpolated_value_given_t_between_zero_and_one_for_matrices(): Result<void> {
		let a = mat2(
			vec2(1, 2),
			vec2(3, 4)
		);
		let b = mat2(
			vec2(5, 17),
			vec2(7, 261)
		);
		let t = 0.25;
		let result = lerp(a, b, t);
		let expected = mat2(
			vec2(2, 5.75),
			vec2(4, 68.25)
		);
		if (equal(result, expected)) return ok();
		return error("lerp should return interpolated value given t between zero and one for matrices\nExpected: " + expected + "\nActual: " + result);
	}
}

let passed = 0;
for (let testKey in MVUtest) {
	// @ts-ignore
	let test = MVUtest[testKey];
	let result = test();
	if (result.ok) {
		passed++;
		continue;
	}
	console.error("Test Failed!\nTest: " + testKey + "\n" + result.error);
}
console.log("Passed " + passed + " of " + Object.keys(MVUtest).length + " tests.");


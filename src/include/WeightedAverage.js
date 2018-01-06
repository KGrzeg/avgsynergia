class WeightedAverage {
	constructor() {
		this._rawValues = 0
		this._weights = 0
	}
	add(v, w) {
		this._rawValues += v * w
		this._weights += w
	}
	appendAverage(wavg) {
		this.add(wavg.rawValue, wavg.weights)
	}
	reset() {
		this._rawValues = 0
		this._weights = 0
	}

	get value() {
		if (this._weights !== 0)
			return this._rawValues / this._weights
		return 0 //in JS "x / 0 == Infinity" for x ∈ R, so prevent this
	}
	get rawValue() {
		return this._rawValues
	}
	get weights() {
		return this._weights
	}
}
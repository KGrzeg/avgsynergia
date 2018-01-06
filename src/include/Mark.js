class Mark {
	constructor(boxElement, grade, weight) {
		if (boxElement) {
			this._$boxElement = $(boxElement)
			this._$aElement = this._$boxElement.children().first()

			var value = this._$aElement.text()
			this._value = this.parseValue(value)
			if (typeof this._value === "number") {
				this._countable = true
				this._countToAverage = this.parseCountToAverage(this._$aElement.attr("title"))
				this._weight = this.parseWeight(this._$aElement.attr("title"))

				if (this._weight === null)
					this._weight = Mark.defualt_weight
			} else {
				this._countable = false
				this._countToAverage = false
				this._weight = 0
			}
		} else {
			this._value = grade
			this._weight = Math.min(1, weight)	//weight can't be smaller than 1
			this._countToAverage = true
			this._countable = true
			this._$boxElement = this._generateBox()
			this._$aElement = this._$boxElement.children().first()
		}

	}
	parseValue(v) {
		var re = /^\d(\-|\+)?$/
		var val = 0
		if (re.test(v)) {
			val = parseInt(v)
			if (v[v.length - 1] === '-')
				return val - 0.25
			if (v[v.length - 1] === '+')
				return val + 0.5
			return val

		} else {
			val = v
		}
		return val
	}
	reverseParseValue(v) {
		if (v == v.toFixed())
			return v
		let frac = v - v.toFixed()
		if (frac == -0.25)
			return v.toFixed() + "-"
		if (frac == -0.5)
			return parseInt(v) + "+"
		return v
	}
	parseWeight(text) {
		let index = text.indexOf("Waga: ")

		if (index === -1)
			return null

		//get 2 characters, for 1-digit weight it can be "1<",
		//but parseInt will ommit unnecessary sign
		//for 2-digits work well
		return parseInt(text.substring(index + 6, index + 8))
	}
	parseCountToAverage(text) {
		if (text.indexOf("Licz do średniej: tak") !== -1)
			return true
		if (text.indexOf("Licz do średniej: nie") !== -1)
			return false
		return null
	}

	_generateBox() {
		let bgcolor = "black"
		let color = "white"
		let box = $("<span>")
			.addClass("grade-box")
			.css("background-color", bgcolor)
			.css("border-color", color)

		$("<a>")
			.attr("href", "javascript:void(0)")
			.addClass("ocena")
			.css("color", color)
			.text(this.reverseParseValue(this._value))
			.attr("title", this._generateTitle())
			.tooltip()
			.appendTo(box)

		return box
	}
	_generateTitle() {
		let d = new Date()
		let teacher = this._teacher

		return "Kategoria: ocena niestandardowa<br>" +
			"Data: " + d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + "<br>" +
			"Nauczyciel: " + teacher + "<br>" +
			"Licz do średniej: tak<br>" +
			"Waga: " + this._weight + "<br>" +
			"Dodał: " + teacher
	}

	get value() {
		return this._value
	}
	get weight() {
		return this._weight
	}
	get countable() {
		return this._countable
	}
	get countToAverage() {
		return this._countToAverage
	}
	get multipliedValue() {
		return this._value * this._weight
	}
	get $boxElement() {
		return this._$boxElement
	}
	get _teacher() {
		if (Mark.prototype.teacher) {
			return Mark.prototype.teacher
		} else {
			let t = $("#user-section b").text()

			let match = t.indexOf("(uczeń")
			if (match !== -1) {
				t = t.substring(0, match)
				Mark.prototype.teacher = t.trim()
				return Mark.prototype.teacher
			}

			match = t.indexOf("(rodzic")
			if (match !== -1) {
				t = t.substring(0, match)
				Mark.prototype.teacher = t.trim()
				return Mark.prototype.teacher
			}

			Mark.prototype.teacher = t.trim()
			return Mark.prototype.teacher
		}
	}
}
Mark.defualt_weight = 1
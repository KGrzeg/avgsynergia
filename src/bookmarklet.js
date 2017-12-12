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
				if (this._countToAverage !== null && this._weight !== null)
					this._countable = true
				else
					this._countable = false
			} else {
				this._countable = false
				this._countToAverage = false
				this._weight = 0
			}
		} else {
			this._value = grade
			this._weight = weight
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

class Subject {
	constructor(row) {
		let cells = $(row).children()

		this._name = $.trim($(cells[1]).text()) || "brak nazwy"

		this._marks_I = []
		this._marks_II = []

		this._marks_extra_I = []
		this._marks_extra_II = []

		this._marks_cell_I = cells[2]
		this._marks_cell_II = cells[5]

		this._average_cell_I = cells[3]
		this._average_cell_II = cells[6]
		this._average_cell_III = cells[8]

		this._readMarks()
		this.updateAverages()
	}

	updateAverages() {
		let avg_I = new WeightedAverage(),
			avg_II = new WeightedAverage()

		let marks_I = $.merge($.merge([], this._marks_I), this._marks_extra_I)
		let marks_II = $.merge($.merge([], this._marks_II), this._marks_extra_II)

		$.each(marks_I, (i, m) => {
			if (m.countable) avg_I.add(m.value, m.weight)
		})
		$.each(marks_II, (i, m) => {
			if (m.countable) avg_II.add(m.value, m.weight)
		})


		if (avg_I.value !== 0)
			$(this._average_cell_I).text(avg_I.value.toFixed(2))
		if (avg_II.value !== 0){
			$(this._average_cell_II).text(avg_II.value.toFixed(2))
			
			avg_I.appendAverage(avg_II)
			$(this._average_cell_III).text(avg_I.value.toFixed(2))
		}
	}
	addMark(mark, semester) {
		if (semester == 0) {
			this._marks_extra_I.push(mark)

			if ($(this._marks_cell_I).text() == "Brak ocen")
				$(this._marks_cell_I).html("")

			mark.$boxElement.appendTo(this._marks_cell_I)
		} else {
			this._marks_extra_II.push(mark)

			if ($(this._marks_cell_II).text() == "Brak ocen")
				$(this._marks_cell_II).html("")

			mark.$boxElement.appendTo(this._marks_cell_II)
		}
		this.updateAverages()
	}
	resetMarks() {
		$.merge(this._marks_extra_I, this._marks_extra_II)
			.forEach((m) => {
				m.$boxElement.remove()
			})

		this._marks_extra_I = []
		this._marks_extra_II = []
		this.updateAverages()
	}

	_readMarks() {
		let self = this
		$(this._marks_cell_I).children().each((i, m) => {
			self._marks_I.push(new Mark(m))
		})
		$(this._marks_cell_II).children().each((i, m) => {
			self._marks_II.push(new Mark(m))
		})
	}

	get name() {
		return this._name
	}
	get marks_I() {
		return this._marks_I
	}
	get marks_II() {
		return this._marks_II
	}
}

class Controller {
	constructor() {
		this._subjects = []

		this._readSubjects()
		this._fillForm()
		this._attachButtons()
		this._attachDisplay()

		//hide controller ui
		$("#AverageFloating thead").click()
	}

	addMark() {
		let sub = parseInt($("#avSubject").val())
		let semester = parseInt($("#avSemester").val())
		let grade = parseFloat($("#avRating").val())
		let weight = parseInt($("#avWeight").val())

		let mark = new Mark(false, grade, weight)
		this._subjects[sub].addMark(mark, semester)
	}
	clearMarks() {
		this._subjects.forEach((s) => {
			s.resetMarks()
		})
	}
	normalize() {
		$('.decorated.stretch:visible>tbody')
			.toggleClass("markNormalize")
	}

	_readSubjects() {
		var mark_rows = $('.decorated.stretch:visible>tbody')
			.children()
			.filter(function (i, e) {
				return $(e).attr('id') === undefined
			})

		let self = this

		mark_rows.each(function (i, r) {
			if (mark_rows.length - 1 == i)
				return //ommit last row ("behavior")

			self._subjects.push(new Subject(r))
		})
	}
	_fillForm() {
		var subs = $("#avSubject")
		this._subjects.forEach((e, i) => {
			$("<option>")
				.attr("value", i)
				.text(e.name)
				.appendTo(subs)
		})
	}
	_attachButtons() {
		$("#avSubmit").click(this.addMark.bind(this))
		$("#avReset").click(this.clearMarks.bind(this))
		$("#avNormalize").click(this.normalize.bind(this))
	}
	_attachDisplay() {
		this._pane_hidded = false
		$("#avHide").click((e) => {
			if (this._pane_hidded) {
				//show
				$("#AverageFloating")
					.animate({
						bottom: 0
					})
				this._pane_hidded = !this._pane_hidded
			} else {
				//hide
				let height =
					$("#AverageFloating").height() -
					($("#avHide").height() + parseInt($("#AverageFloating table").css("margin-top")))
				console.log(height)
				$("#AverageFloating")
					.animate({
						bottom: -height
					})
				this._pane_hidded = !this._pane_hidded
			}
		})
	}
}

$(function () {
	var ext = {
		style: "#AverageFloating{position:fixed;bottom:0;right:0;z-index:50;min-height:200px;min-width:300px}.markNormalize .grade-box{background-color:#deb887!important;color:#000!important}input[type=number]{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;border-radius:5px;border:1px solid #dfdfe0;background:#FFF;padding:0 5px;height:25px;line-height:25px;width:170px;margin:0 5px;color:#717171;font-size:12px!important;outline:0;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box}#avHide{cursor:pointer}",
		floating: '<div id="AverageFloating"><table class="decorated form center"><thead><tr><td id="avHide" colspan="2" title="Ukryj panel wprowadzania ocen">Dodaj ocenę</td></tr></thead><tbody><tr class="line1"><th>Przedmiot</th><td><select id="avSubject" tabindex="0" class="left"></select></td></tr><tr class="line0"><th>Semestr</th><td><select id="avSemester" tabindex="1" class="small left"><option value="0" selected="1">1</option><option value="1">2</option></select></td></tr><tr class="line1"><th>Ocena</th><td><select name="" id="avRating" class="small left" tabindex="2"><option value="0" selected="0">0</option><option value="0.75" selected="0">1-</option><option value="1" selected="0">1</option><option value="1.5" selected="0">1+</option><option value="1.75" selected="0">2-</option><option value="2" selected="0">2</option><option value="2.5" selected="0">2+</option><option value="2.75" selected="0">3-</option><option value="3" selected="0">3</option><option value="3.5" selected="0">3+</option><option value="3.75" selected="0">4-</option><option value="4" selected="0">4</option><option value="4.5" selected="0">4+</option><option value="4.75" selected="0">5-</option><option value="5" selected="1">5</option><option value="5.5" selected="0">5+</option><option value="5.75" selected="0">6-</option><option value="6" selected="0">6</option><option value="6.5" selected="0">6+</option></select></td></tr><tr class="line0"><th>Waga</th><td><input id="avWeight" type="number" tabindex="3" value="1" class="left"></td></tr></tbody><tfoot><tr><td colspan="2"><button id="avSubmit" tabindex="30" class="small ui-button ui-widget ui-state-default ui-corner-all">Dodaj</button><button id="avReset" tabindex="31" class="small ui-button ui-widget ui-state-default ui-corner-all">Wyczyść</button><button id="avNormalize" tabindex="32" class="small ui-button ui-widget ui-state-default ui-corner-all">Ujednolicenie</button></td></tr></tfoot></table></div>'
	}

	$(document.head).append($.parseHTML('<style type="text/css">'+ext.style+"</style>"))
	$(document.body).append($.parseHTML(ext.floating))

	var ctrl = new Controller()

	console.log("Automatyczne liczenie średniej możliwe dzięki %cGrzesiowi Kupczyk %c;)", "color:yellowgreen", "color:inherit");
})
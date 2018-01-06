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
		$(".grade-box", this._marks_cell_I).each((i, m) => {
			self._marks_I.push(new Mark(m))
		})
		$(".grade-box", this._marks_cell_II).each((i, m) => {
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
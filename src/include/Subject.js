class Subject {
	constructor(row) {
		let cells = $(row).children()

		this._name = $.trim($(cells[1]).text()) || "brak nazwy"

		this._marks_I = []
		this._marks_II = []

		this._marks_extra_I = []
		this._marks_extra_II = []

		this._marks_cell_I = cells[Subject.MarksICell]
		this._marks_cell_II = cells[Subject.MarksIICell]

		this._average_cell_I = cells[Subject.AvgICell]
		this._average_cell_II = cells[Subject.AvgIICell]
		this._average_cell_III = cells[Subject.AvgIIICell]

		this._ignore_count_to_average_flag = false

		this._readMarks()
		this.updateAverages()
	}

	updateAverages() {
		let avg_I = new WeightedAverage(),
			avg_II = new WeightedAverage()

		let marks_I = $.merge($.merge([], this._marks_I), this._marks_extra_I)
		let marks_II = $.merge($.merge([], this._marks_II), this._marks_extra_II)

		$.each(marks_I, (i, m) => {
			if (m.countable && (m.countToAverage || this._ignore_count_to_average_flag)) avg_I.add(m.value, m.weight)
		})
		$.each(marks_II, (i, m) => {
			if (m.countable && (m.countToAverage || this._ignore_count_to_average_flag)) avg_II.add(m.value, m.weight)
		})


		if (avg_I.value !== 0)
			$(this._average_cell_I).text(avg_I.value.toFixed(2))
		else
			$(this._average_cell_I).text("")
		if (avg_II.value !== 0) {
			$(this._average_cell_II).text(avg_II.value.toFixed(2))

			avg_I.appendAverage(avg_II)
			$(this._average_cell_III).text(avg_I.value.toFixed(2))
		} else {
			$(this._average_cell_II).text("")
			$(this._average_cell_III).text("")
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

	set ignore_count_to_average_flag(v) {
		let t = this._ignore_count_to_average_flag
		this._ignore_count_to_average_flag = v

		if (t !== v)
			this.updateAverages()
	}

	/* read table's header, and calculate the offsets of cells
		argument thead:jquery object (last row of thead)	*/
	static calculate_cells(thead) {
		if (Subject.TheadProcessed)
			return

		thead.children().each((i, e) => {
			i += 2 //the header have 2 rows with spaned cells; second is offset by 2
			switch ($(e).text()) {
				case "Oceny bieżące":
					{
						if (i <= Subject.MarksICell)
							break
						else
							Subject.MarksIICell = i
						break
					}

				case "Śr.I":
					{
						Subject.AvgICell = i
						break
					}

				case "Śr.II":
					{
						Subject.AvgIICell = i
						break
					}

				case "Śr.R":
					{
						Subject.AvgIIICell = i
						break
					}
			}
		})

		Subject.TheadProcessed = true
	}
}
Subject.MarksICell = 2
Subject.MarksIICell = 5
Subject.AvgICell = 3
Subject.AvgIICell = 6
Subject.AvgIIICell = 8
Subject.TheadProcessed = false
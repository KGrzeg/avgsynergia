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
					($("#avHide").height() + parseInt($("#AverageFloating table").css("margin-top")) - 5)
				
				$("#AverageFloating")
					.animate({
						bottom: -height
					})
				this._pane_hidded = !this._pane_hidded
			}
		})
	}
}
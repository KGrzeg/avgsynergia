// ==UserScript==
// @name         Librus Srednia
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatyczne liczenie średniej ocen na portalu synergia.librus.pl z uwzględnieniem wag dla uczniów szkół, które wyłączyły tę funkcjonalność
// @author       Grzegorz Kupczyk
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        https://synergia.librus.pl/przegladaj_oceny/uczen
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
	/* jshint ignore:end */
	/* jshint esnext: false */
	/* jshint esversion: 6 */
	/* jshint asi: true */


	class WeightedAverage{
		constructor(){
			this._rawValues = 0
			this._weights = 0
		}
		add(v, w) {
			this._rawValues += v * w
			this._weights += w
		}
		appendAverage(wavg){
			this.add( wavg.rawValue, wavg.weights )
		}
		reset(){
			this._rawValues = 0
			this._weights = 0
		}

		get value() {
			if (this._weights !== 0)
				return this._rawValues / this._weights
			return 1	//in JS "x / 0 == Infinity" for x ∈ R, so prevent this
		}
		get rawValue() {return this._rawValues}
		get weights() {return this._weights}
	}

	class Mark{
		constructor(boxElement, grade, weight){
			if (boxElement){
				this._$boxElement = $(boxElement)
				this._$aElement = this._$boxElement.children().first()

				var value = this._$aElement.text()
				this._value = this.parseValue(value)
				if (typeof this._value === "number"){
					this._countable = true
					this._countToAverage = this.parseCountToAverage( this._$aElement.attr("title") )
					this._weight = this.parseWeight( this._$aElement.attr("title") )
					if (this._countToAverage !== null && this._weight !== null)
						this._countable = true
					else
						this._countable = false
				}else{
					this._countable = false
					this._countToAverage = false
					this._weight = 0
				}
			}else{
				this._value = grade
				this._weight = weight
				this._countToAverage = true
				this._countable = true
				this._$boxElement = this._generateBox()
			this._$aElement = this._$boxElement.children().first()
			}

		}
		parseValue(v){
			var re = /^\d(\-|\+)?$/
			var val = 0
			if (re.test(v)){
				val = parseInt(v)
				if (v[v.length-1] === '-')
					return val - 0.25
				if (v[v.length-1] === '+')
					return val + 0.5
				return val

			} else {
				val = v
			}
			return val
		}
		reverseParseValue(v){
			if (v == v.toFixed())
				return v
			let frac = v - v.toFixed()
			if (frac == -0.25)
				return v.toFixed() + "-"
			if (frac == -0.5)
				return parseInt(v) + "+"
			return v
		}
		parseWeight(text){
			let index = text.indexOf("Waga: ")

			if (index === -1)
				return null

			//get 2 characters, for 1-digit weight it can be "1<",
			//but parseInt will ommit unnecessary sign
			//for 2-digits work well
			return parseInt( text.substring(index+6, index+8) )
		}
		parseCountToAverage(text){
			if (text.indexOf("Licz do średniej: tak") !== -1)
				return true
			if (text.indexOf("Licz do średniej: nie") !== -1)
				return false
			return null
		}

		_generateBox(){
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
				.text( this.reverseParseValue(this._value) )
				.attr("title", this._generateTitle())
				.tooltip()
				.appendTo(box)

			return box
		}
		_generateTitle(){
			let d = new Date()
			let teacher = this._teacher

			return "Kategoria: ocena niestandardowa<br>"+
				   "Data: "+d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+"<br>"+
				   "Nauczyciel: "+teacher+"<br>"+
				   "Licz do średniej: tak<br>"+
				   "Waga: "+this._weight+"<br>"+
				   "Dodał: "+teacher
		}

		get value() {return this._value}
		get weight() {return this._weight}
		get countable() {return this._countable}
		get countToAverage() {return this._countToAverage}
		get multipliedValue() {return this._value * this._weight}
		get $boxElement() {return this._$boxElement}
		get _teacher() {
			if( Mark.prototype.teacher ){
				return Mark.prototype.teacher
			}else{
				let t = $("#user-section b").text()

				let match = t.indexOf("(uczeń")
				if (match !== -1){
					t = t.substring(0,match)
					Mark.prototype.teacher = t.trim()
					return Mark.prototype.teacher
				}

				match = t.indexOf("(rodzic")
				if (match !== -1){
					t = t.substring(0,match)
					Mark.prototype.teacher = t.trim()
					return Mark.prototype.teacher
				}

				Mark.prototype.teacher = t.trim()
				return Mark.prototype.teacher
			}
		}
	}

	class Subject{
		constructor(row){
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

		updateAverages(){
			let avg_I = new WeightedAverage(),
				avg_II = new WeightedAverage()

			let marks_I = $.merge($.merge([], this._marks_I), this._marks_extra_I)
			let marks_II = $.merge($.merge([], this._marks_II), this._marks_extra_II)

			$.each( marks_I,  (i,m)=>{ if (m.countable) avg_I.add(  m.value, m.weight ) })
			$.each( marks_II, (i,m)=>{ if (m.countable) avg_II.add( m.value, m.weight ) })


			if (marks_I.length !== 0)
				$(this._average_cell_I).text( avg_I.value.toFixed(2) )
			if (marks_II.length !== 0)
				$(this._average_cell_II).text( avg_II.value.toFixed(2) )

			if (marks_II.length !== 0){
				avg_I.appendAverage(avg_II)
				$(this._average_cell_III).text( avg_I.value.toFixed(2) )
			}
		}
		addMark(mark, semester){
			if (semester == 0){
				this._marks_extra_I.push(mark)

				if ($(this._marks_cell_I).text() == "Brak ocen")
					$(this._marks_cell_I).html("")

				mark.$boxElement.appendTo( this._marks_cell_I )
			} else {
				this._marks_extra_II.push(mark)

				if ($(this._marks_cell_II).text() == "Brak ocen")
					$(this._marks_cell_II).html("")

				mark.$boxElement.appendTo( this._marks_cell_II )
			}
			this.updateAverages()
		}
		resetMarks(){
			$.merge(this._marks_extra_I,this._marks_extra_II)
				.forEach( (m) => {
					m.$boxElement.remove()
				})

			this._marks_extra_I = []
			this._marks_extra_II = []
			this.updateAverages()
		}

		_readMarks(){
			let self = this
			$(this._marks_cell_I).children().each(  (i,m)=>{ self._marks_I.push(  new Mark(m) ) })
			$(this._marks_cell_II).children().each( (i,m)=>{ self._marks_II.push( new Mark(m) ) })
		}

		get name() {return this._name}
		get marks_I() {return this._marks_I}
		get marks_II() {return this._marks_II}
	}

	class Controller{
		constructor(){
			this._subjects = []

			this._readSubjects()
			this._fillForm()
			this._attachButtons()
			this._attachDisplay()

			//hide controller ui
			$("#AverageFloating thead").click()
		}

		addMark(){
			let sub = parseInt($("#avSubject").val())
			let semester = parseInt($("#avSemester").val())
			let grade = parseFloat($("#avRating").val())
			let weight = parseInt($("#avWeight").val())

			let mark = new Mark(false, grade, weight)
			this._subjects[sub].addMark(mark, semester)
		}
		clearMarks(){
			this._subjects.forEach( (s) => {
				s.resetMarks()
			})
		}
		normalize(){
			$('.decorated.stretch:visible>tbody')
				.toggleClass("markNormalize")
		}

		_readSubjects(){
			var mark_rows = $('.decorated.stretch:visible>tbody')
				.children()
				.filter( function(i,e){
					return $(e).attr('id') === undefined
				})

			let self = this

			mark_rows.each( function(i,r){
				if (mark_rows.length - 1 == i)
					return	//ommit last row ("behavior")

				self._subjects.push( new Subject(r) )
			})
		}
		_fillForm(){
			var subs = $("#avSubject")
			this._subjects.forEach( (e, i)=>{
				$("<option>")
					.attr("value", i)
					.text(e.name)
					.appendTo(subs)
			})
		}
		_attachButtons(){
			$("#avSubmit").click( this.addMark.bind(this) )
			$("#avReset").click( this.clearMarks.bind(this) )
			$("#avNormalize").click( this.normalize.bind(this) )
		}
		_attachDisplay(){
			this._pane_hidded = false
			$("#avHide").click( (e)=>{
				if (this._pane_hidded){
					//show
					$("#AverageFloating")
						.animate({bottom: 0})
					this._pane_hidded = !this._pane_hidded
				}else{
					//hide
					let height =
						$("#AverageFloating").height() -
						( $("#avHide").height() + parseInt($("#AverageFloating table").css("margin-top")) )
					console.log(height)
					$("#AverageFloating")
						.animate({bottom: -height})
					this._pane_hidded = !this._pane_hidded
				}
			})
		}
	}

	$(function(){

		var css = "PHN0eWxlPiNBdmVyYWdlRmxvYXRpbmd7DQogIHBvc2l0aW9uOiBmaXhlZDsNCiAgYm90dG9tOiAwOw0KICByaWdodDogMDsNCiAgei1pbmRleDogNTA7DQoJbWluLWhlaWdodDogMjAwcHgNCgltaW4td2lkdGg6IDMwMHB4Ow0KfQ0KLm1hcmtOb3JtYWxpemUgLmdyYWRlLWJveHsNCiAgYmFja2dyb3VuZC1jb2xvcjogYnVybHl3b29kICFpbXBvcnRhbnQ7DQogIGNvbG9yOiBibGFjayAhaW1wb3J0YW50Ow0KfQ0KDQppbnB1dFt0eXBlPW51bWJlcl0gew0KICAgIGZvbnQtZmFtaWx5OidIZWx2ZXRpY2EgTmV1ZScsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7DQogICAgYm9yZGVyLXJhZGl1czogNXB4Ow0KICAgIGJvcmRlcjogMXB4ICNkZmRmZTAgc29saWQ7DQogICAgYmFja2dyb3VuZDogI0ZGRkZGRjsNCiAgICBwYWRkaW5nOiAwIDVweDsNCiAgICBoZWlnaHQ6IDI1cHg7DQogICAgbGluZS1oZWlnaHQ6IDI1cHg7DQogICAgd2lkdGg6IDE3MHB4Ow0KICAgIG1hcmdpbjogMCA1cHg7DQogICAgY29sb3I6ICM3MTcxNzE7DQogICAgZm9udC1zaXplOiAxMnB4ICFpbXBvcnRhbnQ7DQogICAgb3V0bGluZTogbm9uZTsNCiAgICBib3gtc2l6aW5nOmJvcmRlci1ib3g7DQogICAgLW1vei1ib3gtc2l6aW5nOmJvcmRlci1ib3g7IC8qIEZpcmVmb3ggKi8NCiAgICAtd2Via2l0LWJveC1zaXppbmc6Ym9yZGVyLWJveDsgLyogU2FmYXJpICovDQp9PC9zdHlsZT4="
		var floating = "PGRpdiBpZD0iQXZlcmFnZUZsb2F0aW5nIj4NCgk8dGFibGUgY2xhc3M9ImRlY29yYXRlZCBmb3JtIGNlbnRlciI+DQoJCTx0aGVhZD4NCgkJCTx0cj4NCgkJCQk8dGQgaWQ9ImF2SGlkZSIgY29sc3Bhbj0iMiIgdGl0bGU9IlVrcnlqIHBhbmVsIHdwcm93YWR6YW5pYSBvY2VuIj5Eb2RhaiBvY2VuPC90ZD4NCgkJCTwvdHI+DQoJCTwvdGhlYWQ+DQoJCTx0Ym9keT4NCgkJCTx0ciBjbGFzcz0ibGluZTEiPg0KCQkJCTx0aD5QcnplZG1pb3Q8L3RoPg0KCQkJCTx0ZD48c2VsZWN0IGlkPSJhdlN1YmplY3QiIHRhYmluZGV4PSIwIiBjbGFzcz0ibGVmdCI+PC9zZWxlY3Q+PC90ZD4NCgkJCTwvdHI+DQoJCQk8dHIgY2xhc3M9ImxpbmUwIj4NCgkJCQk8dGg+U2VtZXN0cjwvdGg+DQoJCQkJPHRkPg0KCQkJCQk8c2VsZWN0IGlkPSJhdlNlbWVzdGVyIiB0YWJpbmRleD0iMSIgY2xhc3M9InNtYWxsIGxlZnQiPg0KCQkJCQkJPG9wdGlvbiB2YWx1ZT0iMCIgc2VsZWN0ZWQ9IjEiPjE8L29wdGlvbj4NCgkJCQkJCTxvcHRpb24gdmFsdWU9IjEiPjI8L29wdGlvbj4NCgkJCQkJPC9zZWxlY3Q+DQoJCQkJPC90ZD4NCgkJCTwvdHI+DQoJCQk8dHIgY2xhc3M9ImxpbmUxIj4NCgkJCQk8dGg+T2NlbmE8L3RoPg0KCQkJCTx0ZD4NCgkJCQkJPHNlbGVjdCBuYW1lPSIiIGlkPSJhdlJhdGluZyIgY2xhc3M9InNtYWxsIGxlZnQiIHRhYmluZGV4PSIyIj4NCgkJCQkJCTxvcHRpb24gdmFsdWU9IjAiIHNlbGVjdGVkPSIwIj4wPC9vcHRpb24+DQoJCQkJCQk8b3B0aW9uIHZhbHVlPSIwLjc1IiBzZWxlY3RlZD0iMCI+MS08L29wdGlvbj4NCgkJCQkJCTxvcHRpb24gdmFsdWU9IjEiIHNlbGVjdGVkPSIwIj4xPC9vcHRpb24+DQoJCQkJCQk8b3B0aW9uIHZhbHVlPSIxLjUiIHNlbGVjdGVkPSIwIj4xKzwvb3B0aW9uPg0KCQkJCQkJPG9wdGlvbiB2YWx1ZT0iMS43NSIgc2VsZWN0ZWQ9IjAiPjItPC9vcHRpb24+DQoJCQkJCQk8b3B0aW9uIHZhbHVlPSIyIiBzZWxlY3RlZD0iMCI+Mjwvb3B0aW9uPg0KCQkJCQkJPG9wdGlvbiB2YWx1ZT0iMi41IiBzZWxlY3RlZD0iMCI+Mis8L29wdGlvbj4NCgkJCQkJCTxvcHRpb24gdmFsdWU9IjIuNzUiIHNlbGVjdGVkPSIwIj4zLTwvb3B0aW9uPg0KCQkJCQkJPG9wdGlvbiB2YWx1ZT0iMyIgc2VsZWN0ZWQ9IjAiPjM8L29wdGlvbj4NCgkJCQkJCTxvcHRpb24gdmFsdWU9IjMuNSIgc2VsZWN0ZWQ9IjAiPjMrPC9vcHRpb24+DQoJCQkJCQk8b3B0aW9uIHZhbHVlPSIzLjc1IiBzZWxlY3RlZD0iMCI+NC08L29wdGlvbj4NCgkJCQkJCTxvcHRpb24gdmFsdWU9IjQiIHNlbGVjdGVkPSIwIj40PC9vcHRpb24+DQoJCQkJCQk8b3B0aW9uIHZhbHVlPSI0LjUiIHNlbGVjdGVkPSIwIj40Kzwvb3B0aW9uPg0KCQkJCQkJPG9wdGlvbiB2YWx1ZT0iNC43NSIgc2VsZWN0ZWQ9IjAiPjUtPC9vcHRpb24+DQoJCQkJCQk8b3B0aW9uIHZhbHVlPSI1IiBzZWxlY3RlZD0iMSI+NTwvb3B0aW9uPg0KCQkJCQkJPG9wdGlvbiB2YWx1ZT0iNS41IiBzZWxlY3RlZD0iMCI+NSs8L29wdGlvbj4NCgkJCQkJCTxvcHRpb24gdmFsdWU9IjUuNzUiIHNlbGVjdGVkPSIwIj42LTwvb3B0aW9uPg0KCQkJCQkJPG9wdGlvbiB2YWx1ZT0iNiIgc2VsZWN0ZWQ9IjAiPjY8L29wdGlvbj4NCgkJCQkJCTxvcHRpb24gdmFsdWU9IjYuNSIgc2VsZWN0ZWQ9IjAiPjYrPC9vcHRpb24+DQoJCQkJCTwvc2VsZWN0Pg0KCQkJCTwvdGQ+DQoJCQk8L3RyPg0KCQkJPHRyIGNsYXNzPSJsaW5lMCI+DQoJCQkJPHRoPldhZ2E8L3RoPg0KCQkJCTx0ZD48aW5wdXQgaWQ9ImF2V2VpZ2h0IiB0eXBlPSJudW1iZXIiIHRhYmluZGV4PSIzIiB2YWx1ZT0iMSIgY2xhc3M9ImxlZnQiPjwvdGQ+DQoJCQk8L3RyPg0KCQk8L3Rib2R5Pg0KCQk8dGZvb3Q+DQoJCQk8dHI+DQoJCQkJPHRkIGNvbHNwYW49IjIiPg0KCQkJCQk8YnV0dG9uIGlkPSJhdlN1Ym1pdCIgdGFiaW5kZXg9IjMwIiBjbGFzcz0ic21hbGwgdWktYnV0dG9uIHVpLXdpZGdldCB1aS1zdGF0ZS1kZWZhdWx0IHVpLWNvcm5lci1hbGwiPkRvZGFqPC9idXR0b24+DQoJCQkJCTxidXR0b24gaWQ9ImF2UmVzZXQiIHRhYmluZGV4PSIzMSIgY2xhc3M9InNtYWxsIHVpLWJ1dHRvbiB1aS13aWRnZXQgdWktc3RhdGUtZGVmYXVsdCB1aS1jb3JuZXItYWxsIj5XeWN6eTwvYnV0dG9uPg0KCQkJCQk8YnV0dG9uIGlkPSJhdk5vcm1hbGl6ZSIgdGFiaW5kZXg9IjMyIiBjbGFzcz0ic21hbGwgdWktYnV0dG9uIHVpLXdpZGdldCB1aS1zdGF0ZS1kZWZhdWx0IHVpLWNvcm5lci1hbGwiPk5vcm1hbGl6dWo8L2J1dHRvbj4NCgkJCQk8L3RkPg0KCQkJPC90cj4NCgkJPC90Zm9vdD4NCgk8L3RhYmxlPg0KPC9kaXY+"
		$(document.head).append( $.parseHTML(atob(css)) )
		$(document.body).append( $.parseHTML(atob(floating)) )


		var ctrl = new Controller()


		console.log("Automatyczne liczenie średniej możliwe dzięki %cGrzesiowi Kupczyk %c;)", "color:yellowgreen", "color:inherit");
	})

	/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */
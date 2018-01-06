  /* ::WeightedAverage:: */
  /* ::Mark:: */
  /* ::Subject:: */
  /* ::Controller:: */

$(function () {	
	/* jshint ignore:start */
	var ext = {
		style: /* ::style.css:: */,
		floating: /* ::floating.html:: */,
	}
	/* jshint ignore:end */

	$(document.head).append($.parseHTML('<style type="text/css">'+ext.style+"</style>"))
	$(document.body).append($.parseHTML(ext.floating))

	var ctrl = new Controller()

	console.log("Automatyczne liczenie średniej możliwe dzięki %cGrzesiowi Kupczyk %c;)", "color:yellowgreen", "color:inherit");
})

function formatMoney(number, places, symbol, thousand, decimal) {
	number = number || 0;
	places = !isNaN(places = Math.abs(places)) ? places : 2;
	symbol = symbol !== undefined ? symbol : "$";
	thousand = thousand || ",";
	decimal = decimal || ".";
	var negative = number < 0 ? "-" : "",
	    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
	    j = (j = i.length) > 3 ? j % 3 : 0;
	return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}


function calc(opts){
	var inv = opts.investment || 1000
	var fr = opts.frequency || 'Monthly'
	
	var master = {
		Monthly: {
			PARF: 0.049833333,
			Times: 12
		},
		Quarterly: {
			PARF: 0.0575,
			Times:4 
		},
		HalfYearly: {
			PARF: 0.069,
			Times: 2
		},
		Yearly: {
			PARF: 0.092,
			Times: 1
		},
	}
	var intRate = 0.092
	var parf = master[fr].PARF
	var times = master[fr].Times

	//var arr = [["Year", "Opening Balance", "Investment", "Interest", "Closing balnce"]]
	var arr = []
	for (var i=0; i < 21; i++) {
		var ob = 0
		if (i != 0) {
			ob = arr[i-1][4]
		}

		var invest = inv * times
		if (i > 13) {
			invest = 0
		}

		var a = []
		var yr = i+1
		var interest = ob * intRate + invest * parf
		var cb = ob + invest + interest
		
		a.push(yr)
		a.push(ob)
		a.push(invest)
		a.push(interest)
		a.push(cb)

		arr.push(a)
	}
	var totals = myTotals(arr)
	var invpa = formatMoney(arr[0][2], 0, "₹", ",", ".");
	arr.forEach(function(item){
		item[1] = formatMoney(item[1], 0, "₹", ",", ".");
		item[2] = formatMoney(item[2], 0, "₹", ",", ".");
		item[3] = formatMoney(item[3], 0, "₹", ",", ".");
		item[4] = formatMoney(item[4], 0, "₹", ",", ".");
	})
	
	return {items: arr, totals: totals, invpa: invpa}
}

var ssas = {}

ssas.controller = function(){
	this.invest = m.prop(1000)
	this.freq = m.prop('Monthly')
	this.data = calc({investment: this.invest(), frequency: this.freq()})
	
	this.investment = function(value){
		this.invest(value)
		this.data = calc({investment: value, frequency: this.freq()})
	}.bind(this)

	this.frequency = function(value){
		this.freq(value)
		this.data = calc({investment: this.invest(), frequency: value})
	}.bind(this)
}

function myTotals(arr){
	var investTotal = 0
	var intTotal = 0
	var maturity = 0
	arr.forEach(function(item, i){
		investTotal += item[2]
		intTotal += item[3]
		if (i == 20){
			maturity = item[4]
		}
	})
	investTotal = formatMoney(investTotal, 0, "₹", ",", ".");
	intTotal = formatMoney(intTotal, 0, "₹", ",", ".");
	maturity = formatMoney(maturity, 0, "₹", ",", ".");
	return {investTotal: investTotal, intTotal: intTotal, maturity: maturity}
}

ssas.view = function(ctrl){
	return [
		m("br"),
		m("div", {class: "row"},[
			m("div", {class: "col-md-6"}, [
				m("form", [
					m("div", {class: "form-group"}, [
						m("label", {for: "investment"}, "Investment Amount"),
						m("input", {class: "form-control", id: "investment", 
							oninput: m.withAttr("value", ctrl.investment),
							value: ctrl.invest()
						})
					]),	
					m("div", {class: "form-group"}, [
						m("label", {for: "frequency"}, "Investment Frequency"),
						m("select", {class: "form-control", id: "frequency", onchange: m.withAttr("value", ctrl.frequency), value: ctrl.freq(),}, [
							m("option", "Monthly"),
							m("option", "Quarterly"),
							m("option", "HalfYearly"),
							m("option", "Yearly"),
						])
					]),
					m("div", {class: "form-group"}, [
						m("label", {for: "interest"}, "Floating Rate of Interest"),
						m("input", {class: "form-control", id: "interest", value: "9.2% p.a Compounding Yearly", disabled: true})
					]),	
				]),
			]),
			m("div", {class: "col-md-6"}, [
				m("table", {class: "table table-striped"}, [
					m("thead", [
						m("tr", [
							m("th", "Particulars"),
							m("th", "Amount"),
						])
					]),
					m("tbody", [
						m("tr", [
							m("td", "Investment p.a"),
							m("td", ctrl.data.invpa)
						]),
						m("tr", [
							m("td", "No.of.Years"),
							m("td", "14 Years")
						]),
						m("tr", [
							m("td", "A. Total Investment"),
							m("td", ctrl.data.totals.investTotal)
						]),
						m("tr", [
							m("td", "Maturity Period"),
							m("td", "21 Years")
						]),
						m("tr", [
							m("td", "B. Total Interest"),
							m("td", ctrl.data.totals.intTotal)
						]),
						m("tr", [
							m("td", "C. Maturity Value (A+B)"),
							m("td", ctrl.data.totals.maturity)
						])
					])
				])
			])
		]),

		m("table", {class: "table table-striped"}, [
			m("thead", [
				m("tr", [
					m("th", "Year"),
					m("th", "Opening Balance"),
					m("th", "Investment"),
					m("th", "Interest Amt"),
					m("th", "Closing Balance"),
				])
			]),
			m("tbody", [
				ctrl.data.items.map(function(item){
					return m("tr", [
						m("td", item[0]),
						m("td", item[1]),
						m("td", item[2]),
						m("td", item[3]),
						m("td", item[4]),
					])
				})
			]),
			m("tfoot", [
				m("tr", [
					m("th", {colspan: 2}, "Total"),
					m("th", ctrl.data.totals.investTotal),
					m("th", ctrl.data.totals.intTotal),
					m("th", ctrl.data.totals.maturity),
				])
			])
		])
	]
}

//m.module(document.getElementById("ssas"), ssas)

var home = {}
home.controller = function(){
	var k = m.route().slice(1)
	this.divId = k == "" ? "home": k
}
home.view = function(ctrl){
	return m.trust(document.getElementById(ctrl.divId).innerHTML)
}

m.route.mode = "hash"
m.route(document.getElementById("ssas"), "/", {
	"/": home,
	"/calc": ssas,
	"/faq": home,
	"/form": home,
})

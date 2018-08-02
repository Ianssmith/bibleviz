//v4 way
//d3.queue()
	//.defer(d3.tsv, "../data/bookwordcount.tsv")
	//.defer(d3.tsv, "data/twebdata.tsv")
	//.await(analyze);

//v5 way

//js native promises
/*
//d3.tsv("data/twebdata.tsv").then(function(data){
d3.tsv("data/bookwordcount.tsv").then(function(data){
	console.log(data);
});
*/
var height = 1000;
var width = 1800;
var totalverses = 31102;
var wordsearch = "Lord";


//ECMAScript 2017 syntax
async function analyze(wordsearch){
	try{
		const data = await d3.tsv("data/twebdata.tsv", function(d){
			return {
				//words: JSON.parse(d.verses_nopunct.replace("\'","\"")),
				id: +d.id,
				versetext: d.text,
				words: JSON.parse(d.versearr.replace(/\'/g,"\"")),
				wordcount: +d.wordcount,
				book: d['bookname'],
				booknum: +d['booknum'],
				chapter: +d['chnum'],
				verse: +d['versenum'],
				testament: d['testament'],
				genre: d['genre']
			}
			
		});
		const booksdata = await d3.tsv("data/bookwordcount.tsv", function(d){
			return {
				books: d['bookname'],
				bookwordcounts: +d.wordcount,
				chaptercount: +d.chaptercount,
				versecounts: JSON.parse(d.versecounts.replace(/\'/g,"\"")),
				verseidmatrix: JSON.parse(d.verseidmatrix.replace(/\'/g,"\""))

			}
		});
		const wordlocs = await d3.tsv("data/wordlocs.tsv", function(d){
			return {
				//books: d['field.1_y'],
				word: d['uwords'],
				//locations: d['wlocations'],
				//bookwordcounts: +d.wordcount,
				//chaptercount: +d.chaptercount,
				locations: JSON.parse(d.wlocations.replace(/\'/g,"\""))
			}
		});
		//console.log(wordlocs);

		mbooksdata = []
		for(var i=0;i<booksdata.length;i++){
			mbooksdata.push(booksdata[i].bookwordcounts);
			//console.log(booksdata[i].bookwordcounts);
		}

		cbooksdata = []
		for(var i=0;i<booksdata.length;i++){
			cbooksdata.push(booksdata[i].chaptercount);
			//console.log(booksdata[i].chaptercount);
		}

		vbooksdata = []
		for(var i=0;i<booksdata.length;i++){
			vbooksdata.push(booksdata[i].versecounts);
			//console.log(booksdata[i].chaptercount);
		}

		//console.log(data);
		//console.log(booksdata);
		function combine(data, booksdata){
			for(var i=0;i<booksdata.length;i++){
				var aggdata = [];
				for(var j=0;j<data.length;j++){
					if(booksdata[i]['books'] == data[j]['book']){
						aggdata.push(data[j]);
					}
				}
				booksdata[i]['versedata'] = aggdata;
			}
			return booksdata;
		}
		
		//var D = combine(data, booksdata);

		var xchapter_scale = d3.scaleLinear().domain([0],[data.length]).range([50],[width-50]);
		var yscale = d3.scaleLinear().domain([],[]).range([],[]);
		var xbarscale = d3.scaleLinear().domain([],[]).range([],[]);
		var ych_scale = d3.scaleLinear().domain([],[]).range([],[]);
		var yverse_scale = d3.scaleLinear().domain([],[]).range([],[]);


		//wordsearch = document.getElementById('wordsearch').value;
		d3.select("input#wordsearch").on("change", function(){
			wordsearch = d3.event.target.value.replace(/[^\w\s]/gi,'');
			d3.selectAll("circle").transition()
				.attr('fill','darkslategray')
				.attr('r',2);
			//analyze(wordsearch);
			render(wordsearch);
		})

		//console.log(D);
function render(wordsearch){

		d3.select("p#currentsearch").text("Highlighting verses containing the word: "+wordsearch);

		var svg = d3.select('div#container')
			.classed("svg-container",true)
			.append('svg')
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 "+width+" "+height)
			//.attr("viewBox", "0 0 300 300")
			.classed("svg-content", true)
			.style('background','darkslategray')
			//.attr('width',width)
			//.attr('height',height);

		G = svg.append('g')
			.attr("id", "verses");

		var div = d3.select("div#container").append("div")
			.style("position","absolute")
			.attr("class", "tooltip")
			.style("opacity", "0");
		
		books = G.selectAll('rect')
			.data(booksdata)
			.enter()
			.append('rect')
			//.attr('x', function(d,i){return (i*22)+(4*i);})
			.attr('x', function(d,i){return (i*42)+20;})
			//.attr('y', function(d){return height-d.bookwordcounts/45;})
			.attr('y', function(d){return (height/2)-((d.bookwordcounts/45)/2);})
			.attr('width',18)
			//.attr('height', function(d){return d.bookwordcounts/45;})
			//.attr('height', height)
			.attr('height', function(d,i){return ((d.bookwordcounts/45));})
			.attr("fill", "lightslategray");
			//.attr("fill", "slategray");

		//var booktitles = G.selectAll('text')

		//d3.selectAll('text.booktitles')
			//.attr('transform', 'rotate(45)');


//console.log(booktitles);

			//booktitles.attr('transform',"rotate(45)");
			//.attr('y',function(d,i){
				/*
				var prevw = this.previousSibling.getBoundingClientRect();
				console.log(prevw.bottom);
				if(prevw.right - prevw.left >= 20){
					if(prevw.bottom < 25 && prevw.bottom > 5){
						return 20;
					}else if(prevw.bottom > 27){
						return 10;
					}else{
						return 30;
					}
				}else{
					return 20;
				}
			})
				*/
			//.attr("transform",my_transform);
			//.attr('class', 'titles')


		//G.selectAll
			//.text(function(d,i){return d.books;})
			//.attr('x',function(d,i){return (i*22)+(5*i);})
			//.attr('y',20);

		bookgroups = G.selectAll('g')
			//.data(D)
				//function(data,booksdata){
				//}
			//)
			.enter()
			.append('g')
			.attr('id','books');

		var booktitles = G.selectAll('text')
			.data(booksdata)
			.enter()
			.append('text')
			//.append('p')
			.text(function(d,i){return d.books;})
			//.attr('transform',"rotate(45)")
			.attr('x',function(d){
				var bbox = this.getBBox().width;
				return -1*(((height/2)-((d.bookwordcounts/45)/2))+(bbox/2));
				})
			.attr('y', function(d,i){return (i*42)+17;})
			//.attr('x',function(d,i){return (i*27);})
			//.attr('y', function(d){return (height/2)-((d.bookwordcounts/45)/2)-10;})
			.attr('font-size',14)
			//.attr('fill','darkslategray')
			.attr('fill','white')
			.attr('class','booktitles')
			.attr('transform',"rotate(-90)");

		//var versetracker = 0;
		var verslocs;
		var versetracker = G.selectAll('g #books')
			.data(data)
			//.data(booksdata)
			.enter()
			.append('circle')
			//.attr('opacity',0.75)
			.attr('class',function(d,i){
				for(var j=0;j<wordlocs.length;j++){
					if(wordlocs[j].word == wordsearch){
						verslocs = wordlocs[j].locations;
						break;
					}
				}
				if(verslocs.includes(d.id)){
					return "selected";
				}else{
					return 'unselected'
				}
			})

			.attr('cx',function(d,i){
				//return (((d.booknum-1)*22)+(4*(d.booknum-1))+1)+d.verse;
				return (((d.booknum-1)*42))+(d.verse/2)+20;
			})
			.attr('cy',function(d,i){ 
				return (
					(
						(mbooksdata[d.booknum-1]/45)
						-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter)
					)
					+(height/2)-((mbooksdata[d.booknum-1]/45)/2)
				)
			})
			.attr('r',function(d,i){
				//console.log(this.getAttribute('class'));
				if(this.getAttribute('class') == 'selected'){
					return 4;
				}else{
					return 2;
				}
				
			})
			//.append('rect')
			//.attr('x',function(d,i){return ((d.booknum-1)*20)+(5*(d.booknum-1))+1})
			//.attr('y',function(d,i){ return height-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter)})
			//.attr('width',18)
			//.attr('height',function(d,i){return (height-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter))+1})
			.attr('fill',function(d,i){
				if(this.getAttribute('class') == 'selected'){
					return "gold";
				}else{
					return 'darkslategray'
				}
			})
			.attr('fill-opacity','0.9')
			//.attr('fill','gold');
			//.attr('fill','darkslategray')
			.attr('stroke','white')
			.attr('stroke-width','0.1');

			/*
			for(var v=0;v<data.length;v++){
				if(verslocs.includes(data[v].id)){
					console.log(data[v].book + " " + data[v].chapter + ":" + data[v].verse + " " + data[v].versetext);
				}
			}
			*/
function verseupdate(wordsearch){
		var verslocs;
		//var versetracker = G.selectAll('g #books')
		G.selectAll('circle').transition()
			//.data(data)
			//.enter()
			//.append('circle')
			.attr('class',function(d,i){
				for(var j=0;j<wordlocs.length;j++){
					if(wordlocs[j].word == wordsearch){
						verslocs = wordlocs[j].locations;
						break;
					}
				}
				if(verslocs.includes(d.id)){
					return "selected";
				}else{
					return 'unselected'
				}
			})
			.attr('cx',function(d,i){
				return (((d.booknum-1)*42))+(d.verse/2)+20;
			})
			.attr('cy',function(d,i){ 
				return (
					(
						(mbooksdata[d.booknum-1]/45)
						-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter)
					)
					+(height/2)-((mbooksdata[d.booknum-1]/45)/2)
				)
			})
			.attr('r',function(d,i){
				if(this.getAttribute('class') == 'selected'){
					return 4;
				}else{
					return 2;
				}
				
			})
			.attr('fill',function(d,i){
				if(this.getAttribute('class') == 'selected'){
					return "gold";
				}else{
					return 'darkslategray'
				}
			})
			.attr('fill-opacity','0.9')
			.attr('stroke','white')
			.attr('stroke-width','0.1');
}

			G.selectAll("circle.unselected").on("mouseover", function(d){
				d3.select(this).transition()
					.attr("r",3)
			})

			G.selectAll("circle.unselected").on("click", function(d){
				div.transition()
					.style("background","#eeeeee")
					.style("border-radius","3px")
					.style("padding","2px")
					.style("color", "black")
					.style("opacity", 0.9);
				div.html(d.book + " " + d.chapter + ":" + d.verse + "<br>" + d.versetext)
					.style("z-index", "10")
					.style("left", (d3.event.pageX) +5+ "px")
					.style("top", (d3.event.pageY) +5+ "px");
			})

			G.selectAll("circle.unselected").on("mouseout", function(d){
				d3.select(this).transition()
					.attr("r",2)
				div.transition()
					.style("z-index", "-1")
					.style("opacity",0)
			})


			G.selectAll("circle.selected").on("mouseover", function(d){
				d3.select(this).transition()
					.attr("r",7)
				div.transition()
					.style("background","#eeeeee")
					.style("border-radius","3px")
					.style("padding","2px")
					.style("color", "black")
					.style("opacity", 0.9);
				div.html(d.book + " " + d.chapter + ":" + d.verse + "<br>" + d.versetext)
					.style("z-index", "10")
					.style("left", (d3.event.pageX) +5+ "px")
					.style("top", (d3.event.pageY) +5+ "px");

			})
			
			G.selectAll("circle.selected").on("mouseout", function(d){
				d3.select(this).transition()
					.attr("r",4)
				div.transition()
					.style("z-index", "-1")
					.style("opacity",0)

			})


		//var connections = G.selectAll('line')
			//.data(data)
			//.enter()
			//.append('line')
			

		var transform = d3.zoomIdentity;
		var zoom = d3.zoom();
		
		svg.call(d3.zoom()
			.on("zoom", zoomed)
			.scaleExtent([1 / 2, 10]));
		
		function zoomed() {
			G.attr("transform", d3.event.transform);
			//booktitles.attr("transform", d3.event.transform);
			//books.attr("transform", d3.event.transform);
			//versetracker.attr("transform", d3.event.transform);
		}
	}
	render(wordsearch);

	}catch(error){
		console.log("fail!");
		console.log(error);
	}
}

analyze(wordsearch);


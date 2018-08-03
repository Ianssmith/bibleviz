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


//ECMAScript 2017 syntax
//async function analyze(wordsearch){
async function analyze(){
	try{
		const data = await d3.tsv("data/twebdata.tsv", function(d){
			return {
				////words: JSON.parse(d.verses_nopunct.replace("\'","\"")),
				id: +d.id,
				versetext: d.text,
				//words: JSON.parse(d.versearr.replace(/\'/g,"\"")),
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
		console.log(data);
		console.log(booksdata);
		console.log(wordlocs);

		/*
		mbooksdata = []
		cbooksdata = []
		vbooksdata = []
		for(var i=0;i<booksdata.length;i++){
			mbooksdata.push(booksdata[i].bookwordcounts);
			cbooksdata.push(booksdata[i].chaptercount);
			//vbooksdata.push(booksdata[i].versecounts);
			//console.log(booksdata[i].bookwordcounts);
		}
*/


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

		var wordsearch = "Love";


		d3.select("p#currentsearch")
			.text("Highlighting verses containing the word: ")
			.append('span')
			.attr('id','currentword')
			.text(wordsearch)
			.style('color','gold');

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
			.style("opacity", "0")
			.style("width", "300px");

		/*
		var chsum = 0;
		var chspacing = [chsum];
		for(var j=0;j<booksdata.length;j++){
			var maxch = Math.max.apply(null,booksdata[j].versecounts);
			if(maxch>100){
				chsum+=maxch/2
			}
			chspacing.push(maxch);
			//chspacing.push(chsum);
			//console.log(chspacing[j]);
		}
			*/
		
		var books = G.selectAll('rect')
			.data(booksdata)
			.enter()
			.append('rect')

			//.attr('x', function(d,i){return (i*22)+(4*i);})
			//.attr('x', function(d,i){return (i*42)+20;})
			.attr('x', function(d,i){return (i*100);})
			//books.attr('x', function(d,i){ return (i*100)+chspacing[i]; })
			.attr('y', height)
			.transition()
			.duration(1500)
			.attr('y', function(d){return (height/2)-((d.bookwordcounts/45)/2);})
			//.attr('width',18)
			.attr('width',70)
			//.attr('width',100)
			//.attr('height', function(d){return d.bookwordcounts/45;})
			//.attr('height', height)
			.attr('height', function(d,i){return ((d.bookwordcounts/45));})
			.attr("fill", "lightslategray");
			//.attr("fill", "slategray");

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
			/* for verticle words vvv
			.attr('x',function(d){
				var bbox = this.getBBox().width;
				return -1*(((height/2)-((d.bookwordcounts/45)/2))+(bbox*3));
				})
			*/
			.attr('y', height)
			.transition()
			.duration(1500)
			//.attr('y', function(d,i){return (i*100)+40;}) //vertical words
			//.attr('y', function(d,i){ return (i*100)-5+(chspacing[i]); })
			.attr('x',function(d,i){return (i*100);})//horizontal words
			.attr('y', function(d){return (height/2)-((d.bookwordcounts/45)/2)-3;})//horizontal words
			.attr('font-size',"14px")
			//.attr('fill','darkslategray')
			.attr('fill','white')
			.attr('class','booktitles')
			//.attr('transform',"rotate(-90)"); //vertical words

		//var versetracker = 0;
		var verslocs;
		var versetracker = G.selectAll('g #books')
		//d3.selectAll('g #books')
			.data(data)
			//.data(booksdata)
			.enter()
			.append('circle')
			//.attr('opacity',0.75)
			.attr('class',function(d,i){
				for(var j=0;j<wordlocs.length;j++){
					if(wordlocs[j].word == wordsearch.toLowerCase()){
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
				//if(this.getAttribute('class') == 'selected'){
					//return (((d.booknum-1)*100))+(d.verse)+2;
				//}else{
					//return (((d.booknum-1)*100))+(d.verse);
				//}
					return (((d.booknum-1)*100))+(d.verse*2);
					//return (((d.booknum-1)*100))+(d.verse*3)+(chspacing[d.booknum-1]);
			})
			.attr('cy',function(d,i){ 
				return (
					(
						//(mbooksdata[d.booknum-1]/45)
						//-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter)
						(booksdata[d.booknum-1].bookwordcounts/45)
						-(((booksdata[d.booknum-1].bookwordcounts/45)/booksdata[d.booknum-1].chaptercount)*d.chapter)
					)
					//+(height/2)-((mbooksdata[d.booknum-1]/45)/2)
					+(height/2)-((booksdata[d.booknum-1].bookwordcounts/45)/2)
				)+5;
			})
			.attr('r',function(d,i){
				//console.log(this.getAttribute('class'));
				if(this.getAttribute('class') == 'selected'){
					return 5;
					//return 3;
					//return 2;
				}else{
					return 4;
					//return 1; 
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
					return 'silver'
					//return 'dimgray'
					//return 'darkslategray'
				}
			})
			//.attr('fill-opacity','0.7')
			.attr('fill-opacity',function(d,i){
				if(this.getAttribute('class') == 'selected'){
					return '0.9';
				}else{
					return '0.4';
				}
			})
			//.attr('fill','gold');
			//.attr('fill','darkslategray')
			//.attr('stroke','ghostwhite')
			.attr('stroke',function(d,i){
				if(this.getAttribute('class') == 'selected'){
					return 'white';
				}else{
					return 'whitesmoke';
					//return 'dimgray';
				}
			})
			/*
			*/
			//.attr('fill','gold');
			.attr('stroke-opacity',function(d,i){
				if(this.getAttribute('class') == 'selected'){
					return '1.0';
				}else{
					return '0.7';
				}
			})
			.attr('stroke-width',function(d,i){
				//if(this.getAttribute('class') == 'selected'){
					//return '0.3';
				//}else{
					return '0.1';
				//}
			})
			//.attr('stroke-width','0.1');

			/*
			for(var v=0;v<data.length;v++){
				if(verslocs.includes(data[v].id)){
					console.log(data[v].book + " " + data[v].chapter + ":" + data[v].verse + " " + data[v].versetext);
				}
			}
			*/
			function mice(){

			G.selectAll("circle.unselected").on("mouseover", function(d){
				d3.select(this).transition()
					.attr("r",5)
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
					//.style("left", (d3.event.pageX) +5+ "px")
					.style("left", (d3.event.pageX) +-(this.getBoundingClientRect().width/2)+ "px")
					.style("top", (d3.event.pageY) +5+ "px");
			})

			G.selectAll("circle.unselected").on("mouseout", function(d){
				d3.select(this).transition()
					.attr("r",4)
				div.transition()
					.style("z-index", "-1")
					.style("opacity",0)
			})


			G.selectAll("circle.selected").on("mouseover", function(d){
				d3.select(this).transition()
					.attr("r",7)
					//.attr("r",5)
				div.transition()
					.style("background","#eeeeee")
					.style("border-radius","3px")
					.style("padding","2px")
					.style("color", "black")
					.style("opacity", 0.9);
				div.html(d.book + " " + d.chapter + ":" + d.verse + "<br>" + d.versetext)
					.style("z-index", "10")
					//.style("left", (d3.event.pageX) +-(this.offsetWidth/4)+ "px")
					.style("left", (d3.event.pageX) +-(this.getBoundingClientRect().width/2)+ "px")
					.style("top", (d3.event.pageY) +5+ "px");

			})
			
			G.selectAll("circle.selected").on("mouseout", function(d){
				d3.select(this).transition()
					.attr("r",5)
					//.attr("r",3)
				div.transition()
					.style("z-index", "-1")
					.style("opacity",0)

			})
			}


		//var connections = G.selectAll('line')
			//.data(data)
			//.enter()
			//.append('line')
		var found = false;
		d3.select("input#wordsearch").on("change", function(){
			wordsearch = d3.event.target.value.replace(/[^\w\s]/gi,'');
			G.selectAll("circle")
			.attr('class',function(d,i){
				for(var j=0;j<wordlocs.length;j++){
					if(wordlocs[j].word == wordsearch.toLowerCase()){
						verslocs = wordlocs[j].locations;
						found = true;
						break;
					}
				}
				if(found){
					if(verslocs.includes(d.id)){
						return "selected";
					}else{
						return 'unselected'
					}
				}
			})
			//G.selectAll("circle.selected").transition()
				//.attr('cx',function(d,i){ return (((d.booknum-1)*100))+(d.verse)+2; });

		if(found){
			G.selectAll("circle.selected").transition().duration(2000)
				//.attr('r',4)
				//.attr('r',3)
				.attr('r',5)
				.attr('fill',"gold")
				.attr('fill-opacity',"0.9")
				.attr('stroke',"white")
				.attr('stroke-opacity',"1.0")
				//.attr('stroke-width',"0.3");
				.attr('stroke-width',"0.1");

			//G.selectAll("circle.unselected").transition()
				//.attr('cx',function(d,i){ return (((d.booknum-1)*100))+(d.verse); });

			G.selectAll("circle.unselected").transition().duration(2000)
				//.attr('r',2)
				.attr('r',4)
				//.attr('fill',"darkslategray");
				.attr('fill',"silver")
				.attr('fill-opacity',"0.4")
				.attr('stroke',"whitesmoke")
				.attr('stroke-opacity',"0.7")
				.attr('stroke-width',"0.1");

			//d3.select("p#currentsearch").text("Highlighting verses containing the word: "+wordsearch);
			d3.select("p#currentsearch").text("Highlighting verses containing the word: ")
				.append('span')
				.attr('id','currentword')
				.text(wordsearch)
				.style('color','gold');
			//mice();
			found = false;
			setTimeout(mice,2002);
		}else{
			d3.select("p#currentsearch").html("This word was not found!<br>")
				//.html('<br>')
				.append('span')
				.attr('id','notfound')
				.text("(Word searches are case insensitive and exclude \"common words\" like \"the\" and \"and\".)");
		}

		})
		mice();
			

		var transform = d3.zoomIdentity.translate(15,height/3).scale(26/96);
		var zoom = d3.zoom().on("zoom",zoomed);;
		
		svg.call(zoom.transform, transform);

		svg.call(d3.zoom()
			.on("zoom", zoomed)
			.scaleExtent([1 / 4, 10]));
		
		function zoomed() {
			G.attr("transform", d3.event.transform);
			//booktitles.attr("transform", d3.event.transform);
			//books.attr("transform", d3.event.transform);
			//versetracker.attr("transform", d3.event.transform);
		}
	//}
	//render(wordsearch);

	}catch(error){
		console.log("fail!");
		console.log(error);
	}
}

//analyze(wordsearch);
analyze();


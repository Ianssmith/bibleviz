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
//var versions = ["King James","World English Bible","Young's Literal Translation","Webster's Bible","Darby English Bible","Bible in Basic English","American Standard-ASV1901"]
//var versionfilename = ["kjv","web","Young's Literal Translation","Webster's Bible","Darby English Bible","Bible in Basic English","American Standard-ASV1901"]
var versionfilename = ["web","kjv","ylt"];
var versions = ["World English Bible","King James","Young's Literal Translation"];
var currentversion = 0;


function loaddots(){
d3.select('#loading')
	.append('text')
	.text(' .')

}

function loopload(){
	d3.select('#loading')
		.text('Loading')
}


//ECMAScript 2017 syntax
//async function analyze(wordsearch){
async function analyze(vindex){
	setInterval(loaddots,760);
	setInterval(loopload,760*5.5);
	try{
		const data = await d3.tsv("data/"+versionfilename[vindex]+"data.tsv", function(d){
		//const data = await d3.tsv("data/twebdata.tsv", function(d){
		//const data = await d3.tsv("data/kjvdata.tsv", function(d){
			return {
				////words: JSON.parse(d.verses_nopunct.replace("\'","\"")),
				id: d.id,
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
		const booksdata = await d3.tsv("data/bookwordcount_"+versionfilename[vindex]+".tsv", function(d){
		//const booksdata = await d3.tsv("data/bookwordcount.tsv", function(d){
		//const booksdata = await d3.tsv("data/bookwordcount_kjv.tsv", function(d){
			return {
				books: d['bookname'],
				bookwordcounts: +d.wordcount,
				chaptercount: +d.chaptercount,
				versecounts: JSON.parse(d.versecounts.replace(/\'/g,"\"")),
				verseidmatrix: JSON.parse(d.verseidmatrix.replace(/\'/g,"\""))

			}
		});
		const wordlocs = await d3.json("data/upwordlocs_"+versionfilename[vindex]+".json", function(d){
		//const wordlocs = await d3.json("data/upwordlocs.json", function(d){
		//const wordlocs = await d3.json("data/upwordlocs_kjv.json", function(d){
		//const wordlocs = await d3.tsv("data/wordlocs.tsv", function(d){
		//const wordlocs = await d3.tsv("data/wordlocs_kjv.tsv", function(d){
			return {
				word: d['uwords'],
				locations: JSON.parse(d.wlocations.replace(/\'/g,"\"")),
				bookcounts:JSON.parse(d.bookcounts.replace(/\'/g,"\""))
			}
		});

		const crossrefs = await d3.json("data/cr_ids.json", function(d){
			return {
				d
				//f_id: d['f_ids'],
				//v_id: d['v_ids']
			}
		});
		//console.log(crossrefs)

		//console.log(data);
		//console.log(booksdata);
		//console.log(wordlocs);
		//console.log(crossrefs)


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

		var wordsearch = ["Love","","","","","",""];
		var searchcolors = ['gold','deepskyblue','lawngreen','darkmagenta','magenta','orangered','crimson']
		var searchnum = 0;
		//console.log("selected"+0);

var dropd_Major = d3.select("#dropdown-major select")
	//.append("select")
	.attr("name","Bible Version")
	.selectAll("option")
	.data(versions)
	.enter()
	//.filter(function(d,i){return parseInt(d.OCC_CODE.substring(3)) == 0 && i > 0})
	.append("option")
	.text(function(d){return d})
	.attr("value", function (d,i) { 
		return i})


	d3.select("#dropdown-major select").on("change",function(){
		analyze(d3.event.target.value);
	})

		d3.select("p#currentsearch")
			.text("Highlighting verses containing the word: ")
			.append('span')
			.attr('id','currentword'+searchnum)
			.attr('class','wordlist')
			.text(wordsearch[searchnum])
			.style('color',function(d,i){
				return searchcolors[searchnum];
			});

	d3.select('div#loading').remove();
	clearInterval(loaddots);
	clearInterval(loopload);

		var svg = d3.select('div#container')
			.classed("svg-container",true)
			.append('svg')
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 "+width+" "+height)
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

			.attr('x', function(d,i){return (i*100);})
			.attr('y', height)
			//.transition()
			//.duration(1000)
			.attr('y', function(d){return (height/2)-((d.bookwordcounts/45)/2);})
			.attr('width',70)
			.attr('height', function(d,i){return ((d.bookwordcounts/45));})
			.attr("fill", "lightslategray");
		

		bookgroups = G.selectAll('g')
			//.data(D)
				//function(data,booksdata){
				//}
			//)
			.enter()
			.append('g')
			.attr('id','books');

			//.attr('transform',"rotate(-90)"); //vertical words

		var verslocs = [0,0,0,0,0,0,0];
		var wcounts = [0,0,0,0,0,0,0];
		//var bcounts = [0,0,0,0,0,0,0];
		var bc = booksdata.length;
		var bcounts = [0]
		for(var b=1;b<wcounts.length;b++){
			bcounts.push(Array(bc).join(".").split("."));
		}
		//console.log(bcounts)
		//console.log(booksdata[0]['versecounts'])
		//console.log(booksdata)

		for(var k=0;k<booksdata.length;k++){
		//var chtext = G.selectAll('text')
		G.selectAll('text.chdisplay'+k)
			.data(booksdata[k].versecounts)
			.enter()
			//.append('text.chdisplay'+k)
			.append('text')
			.text(function(d,i){return (i+1)+' -'})
			.attr('text-anchor','end')
			.attr('alignment-baseline','middle')
			.attr('class','chdisplay'+k)
			.attr('x',function(d,i){return (k*100)-3;})//horizontal words
			.attr('y', function(d,i){
				/*
				(wordcount-((wordcount/chaptercount)*currentchapter))+midpoint-(wordcount/2)-wordcount
				*/
				return (
					((
						(booksdata[k].bookwordcounts/45)
						+(((booksdata[k].bookwordcounts/45)/booksdata[k].chaptercount)*(i+1))
					)
					+(height/2)-((booksdata[k].bookwordcounts/45)/2))-booksdata[k].bookwordcounts/45
				)-5
		})
			.attr('font-size',"5")
			.attr('fill','white')
		}

		var versetracker = G.selectAll('g #books')
			.data(data)
			.enter()
			.append('circle')
			.attr('class',function(d,i){
					if(wordsearch[searchnum] != ""){
					//for(var j=0;j<wordlocs.length;j++){
						var firstletter = wordsearch[searchnum].charAt(0).toLowerCase();
						//console.log(firstletter)
						for(var j=0;j<wordlocs[firstletter].uwords.length;j++){
						if(wordlocs[firstletter].uwords[j] == wordsearch[searchnum].toLowerCase()){
							verslocs[searchnum] = wordlocs[firstletter].wlocations[j];
							wcounts[searchnum] = wordlocs[firstletter].wlocations[j].length;
							bcounts[searchnum] = wordlocs[firstletter].bookcounts[j];
						//if(wordlocs[j].word == wordsearch[searchnum].toLowerCase()){
							//verslocs[searchnum] = wordlocs[j].locations;
							//wcounts[searchnum] = wordlocs[j].locations.length;
							//bcounts[searchnum] = wordlocs[j].bookcounts;
							break;
						}
					}
				}
				if(verslocs[searchnum].includes(d.id)){
					return "selected"+searchnum;
				}else{
					return 'unselected'
				}
			})

			.attr('cx',function(d,i){
					return (((d.booknum-1)*100))+(d.verse*2);
			})
			.attr('cy',function(d,i){ 
				/*
				(wordcount-((wordcount/chaptercount)*currentchapter))+midpoint-(wordcount/2)-wordcount
				*/
				return (
					((
						(booksdata[d.booknum-1].bookwordcounts/45)
						+(((booksdata[d.booknum-1].bookwordcounts/45)/booksdata[d.booknum-1].chaptercount)*d.chapter)
					)
					+(height/2)-((booksdata[d.booknum-1].bookwordcounts/45)/2))-booksdata[d.booknum-1].bookwordcounts/45
				)-5;
			})
			.attr('r',function(d,i){
				//console.log(this.getAttribute('class'));
				if(this.getAttribute('class') == 'selected'+searchnum){
					return 5;
				}else{
					return 4;
				}
				
			})
			//.append('rect')
			//.attr('x',function(d,i){return ((d.booknum-1)*20)+(5*(d.booknum-1))+1})
			//.attr('y',function(d,i){ return height-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter)})
			//.attr('width',18)
			//.attr('height',function(d,i){return (height-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter))+1})
			.attr('fill',function(d,i){
				if(this.getAttribute('class') == 'selected'+searchnum){
					return searchcolors[searchnum];
				}else{
					return 'silver';
				}
			})
			.attr('fill-opacity',function(d,i){
				if(this.getAttribute('class') == 'selected'+searchnum){
					return '0.9';
				}else{
					return '0.4';
				}
			})
			.attr('stroke',function(d,i){
				if(this.getAttribute('class') == 'selected'+searchnum){
					return 'white';
				}else{
					return 'whitesmoke';
				}
			})
			/*
			*/
			.attr('stroke-opacity',function(d,i){
				if(this.getAttribute('class') == 'selected'+searchnum){
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



		//var crossreflines = G.selectAll('path')	
		//console.log(crossrefs['01001001'])
		function hiderefs(selected){
			G.selectAll('path.enter'+selected)
				.attr('class','exit')
			
		}

		function showrefs(selected){
			//console.log(selected)
			var fbn = parseInt(selected.slice(0,2))
			var fch = parseInt(selected.slice(2,5))
			var fvn = parseInt(selected.slice(5,8))
			//console.log(fbn)
			//console.log(fvn)
			//console.log(fch)
			if(crossrefs[selected]){
				for (var i=0;i<crossrefs[selected].length;i++){
					//console.log(crossrefs[selected][i])
					var bn = parseInt(crossrefs[selected][i].slice(0,2))//maps to d.booknum
					var ch = parseInt(crossrefs[selected][i].slice(2,5))//maps to d.verse
					var vn = parseInt(crossrefs[selected][i].slice(5,8))//maps to d.chapter
					//console.log(bn)
					//console.log(vn)
					//console.log(ch)

					G.append('path')
					.attr("class","enter"+selected)
					.attr("stroke","white")
					.attr("stroke-width",1)
						.attr("d", "M"+(
							((((fbn-1)*100))+(fvn*2))+","+((
								((
									(booksdata[fbn-1].bookwordcounts/45)
									+(((booksdata[fbn-1].bookwordcounts/45)/booksdata[fbn-1].chaptercount)*fch)
								)
								+(height/2)-((booksdata[fbn-1].bookwordcounts/45)/2))-booksdata[fbn-1].bookwordcounts/45
							)-5)
							+" L"+((((bn-1)*100))+(vn*2))+","+((
								((
									(booksdata[bn-1].bookwordcounts/45)
									+(((booksdata[bn-1].bookwordcounts/45)/booksdata[bn-1].chaptercount)*ch)
								)
								+(height/2)-((booksdata[bn-1].bookwordcounts/45)/2))-booksdata[bn-1].bookwordcounts/45
							)-5)
							)
						)
							//+" "+((((originX-92)+priorCurves[i].x))/2)+","+((postcontrol+priorCurves[i].y)/2)
							//+" T"+(priorCurves[i].x)+","+(priorCurves[i].y-5))

					/*
					how to locate circle positions
					.attr('cx',function(d,i){
							return (((bn-1)*100))+(vn*2);
					})
					.attr('cy',function(d,i){ 
						return (
							((
								(booksdata[bn-1].bookwordcounts/45)
								+(((booksdata[bn-1].bookwordcounts/45)/booksdata[bn-1].chaptercount)*ch)
							)
							+(height/2)-((booksdata[bn-1].bookwordcounts/45)/2))-booksdata[bn-1].bookwordcounts/45
						)-5;
					})
					how to draw hack d3 lines
					.attr("d", "M"+(originX-72)+","+(postcontrol)
						+" Q"+(originX-300)+","+(postcontrol)//+(height/8)-i*10)
						+" "+((((originX-92)+priorCurves[i].x))/2)+","+((postcontrol+priorCurves[i].y)/2)
						+" T"+(priorCurves[i].x)+","+(priorCurves[i].y-5))
					*/
				}
			}else{
				console.log("no references")
			}
		}

		var booktitles = G.selectAll('text.booktitles')
			.data(booksdata)
			.enter()
			//.append('text.booktitles')
			.append('text')
			.text(function(d,i){return d.books;})
			/* for verticle words vvv
			.attr('x',function(d){
				var bbox = this.getBBox().width;
				return -1*(((height/2)-((d.bookwordcounts/45)/2))+(bbox*3));
				})
			*/
			//.attr('y', height)
			//.transition()
			//.duration(1000)
			//.attr('y', function(d,i){return (i*100)+40;}) //vertical words
			.attr('x',function(d,i){return (i*100);})//horizontal words
			.attr('y', function(d){return (height/2)-((d.bookwordcounts/45)/2)-3;})//horizontal words
			.attr('font-size',"11px")
			.attr('fill','white')
			.attr('id','title-'+books)
			.attr('class','booktitles')

	 /*
	 var bwordcounts = G.selectAll('text.bookcounts')
			.data(bcounts[searchnum])
			.enter()
			.append('text')
			//.insert('text')
			.text(function(d,i){
				//console.log(searchcolors[searchnum])
				console.log(d)
				//return bcounts[i];})
				return d})
			.attr('x',function(d,i){return (i*100);})//horizontal words
			//.attr('y', function(d){return (height/2)-((d.bookwordcounts/45)/2)-3;})//horizontal words
			.attr('y', function(d,i){return (height/2)-((booksdata[i].bookwordcounts/45)/2)-30;})//horizontal words
			.style('font-size',"42")
			.style('fill',searchcolors[searchnum])
			//.attr('class','bookcounts');
			*/
	//var bwordcounts = [0,0,0,0,0,0,0]
	var bwordcounts = []
	for(var k=0;k<bcounts.length;k++){
		var cc = G.selectAll('text.bookcounts'+k)
		//var cc = G.selectAll('text.bookcounts'+searchnum)
			.data(bcounts[k])
			.enter()
			.append('text')
			.text(function(d,i){
				return d})
			.attr('x',function(d,i){return (i*100);})//horizontal words
			.attr('y', function(d,i){return (height/2)-((booksdata[i].bookwordcounts/45)/2)-30;})//horizontal words
			.style('font-size',"42")
			.style('fill',searchcolors[k])
			.attr('class','bookcounts'+k);

		bwordcounts.push(cc);
	}

	
			//G.selectAll('text')
				//.append('text')
				//.text(function(d,i){return bcounts[i]})
				//.attr('x',function(d,i){return (i*100);})//horizontal words
				//.attr('y', function(d){return (height/2)-((d.bookwordcounts/45)/2)-3;})//horizontal words
				//.attr('font-size',"14px")
				//.attr('fill',function(d,i){return searchcolors[i];})
				//.attr('class','bwordcounts')


			/*
			for(var v=0;v<data.length;v++){
				if(verslocs.includes(data[v].id)){
					console.log(data[v].book + " " + data[v].chapter + ":" + data[v].verse + " " + data[v].versetext);
				}
			}
			*/
		/*
		var removeindex = searchnum;
		//d3.select('p#currentsearch').selectAll('span.wordlist').on("click",function(d,i){
		d3.selectAll('span.wordlist').on("click",function(d,i){
			console.log("triggered")
			removeindex = i
			d3.select(this).remove()
				//.attr('id',function(d,i){
					//return "remove";
				//})
			wordsearch.splice(removeindex,1)
			verslocs.splice(removeindex,1)
			wordsearch.push("")
			verslocs.push(0)
		})
		*/
/*
for(var j=0;j<bcounts.length;j++){
var bwordcounts = G.selectAll("text")
	.data(bcounts[0])
	.enter()
	.append("text")
	.text("")
	.attr("class",function(d,i){return "bookcounts"+i});
}
*/

var clip = "";
// Overwrite what is being copied to the clipboard.
document.addEventListener('copy', function(e) {
  // e.clipboardData is initially empty, but we can set it to the
  // data that we want copied onto the clipboard.
  e.clipboardData.setData('text/plain', clip);
  //e.clipboardData.setData('text/html', '<b>Hello, world!</b>');

  // This is necessary to prevent the current document selection from
  // being written to the clipboard.
  e.preventDefault();
});


	function mice(snum){
		document.addEventListener('keydown',function(event){
			clip = ""
			if(event.key == 'c'){
				if(event.ctrlKey){
					for(var k=0;k<wordsearch.length;k++){
						if(wordsearch[k] != ""){
							clip+="_"+wordsearch[k]+"\n";
							d3.selectAll('circle.selected'+k).data().forEach(function(el){
								clip+= el.book+" "+el.chapter+":"+el.verse+" "+el.versetext;
								clip+='\n'
							})
						}
						clip+='\n'
					}
						
				}else{
					clip = div._groups[0][0].innerText;
					document.execCommand('copy');
				}
			}
			//console.log(event)
		})

			//G.selectAll("circle.unselected").on("mouseover", function(d){
			G.selectAll("circle.unselected").on("mouseover", function(d){
				d3.select(this).transition()
					.attr("r",5)
				div.transition()
					.style("background","#eeeeee")
					.style("border-radius","3px")
					.style("padding","2px")
					.style("color", "black")
					.style("opacity", 0.9);
				div.html(d.book + " " + d.chapter + ":" + d.verse + "<br>" + d.versetext)
					.style("z-index", "10")
					.style("left", (d3.event.pageX) +-(this.getBoundingClientRect().width/2)+ "px")
					//.style("top", (d3.event.pageY)+ "px");
					.style("top", (d3.event.pageY-42)+ "px");

				//showrefs(d.id)
			})

			G.selectAll("circle").on("click", function(d){
				//console.log(d)
				//console.log(this)
				showrefs(d.id)
				//d3.select(this)
					//.attr("class","showrefs")
			/*
				div.transition()
					.style("background","#eeeeee")
					.style("border-radius","3px")
					.style("padding","2px")
					.style("color", "black")
					.style("opacity", 0.9);
				div.html(d.book + " " + d.chapter + ":" + d.verse + "<br>" + d.versetext)
					.style("z-index", "10")
					.style("left", (d3.event.pageX) +-(this.getBoundingClientRect().width/2)+ "px")
					//.style("top", (d3.event.pageY)+ "px");
					.style("top", (d3.event.pageY-42)+ "px");

					//document.querySelector('div.container div.tooltip').focus();
					//document.querySelector('div.container div.tooltip').select();
					//d3.select('div.container div.tooltip').focus();
					//d3.select('div.container div.tooltip').select();
			*/
			})


			G.selectAll("circle.unselected").on("mouseout", function(d){
				d3.select(this).transition()
					.attr("r",4)
				div.transition()
					.style("z-index", "-1")
					.style("opacity",0)
			})


			G.selectAll("circle.selected"+snum).on("mouseover", function(d){
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
					.style("left", (d3.event.pageX) +-(this.getBoundingClientRect().width/2)+ "px")
					//.style("top", (d3.event.pageY)+ "px");
					.style("top", (d3.event.pageY-42)+ "px");

					//document.querySelector('div.container div.tooltip').focus();
					//document.querySelector('div.container div.tooltip').select();

			})
			
			G.selectAll("circle.selected"+snum).on("mouseout", function(d){
				d3.select(this).transition()
					.attr("r",5)
				div.transition()
					.style("z-index", "-1")
					.style("opacity",0)

			})
			}
		mice(searchnum);
			//searchnum++;


		//var connections = G.selectAll('line')
			//.data(data)
			//.enter()
			//.append('line')

var nfound = 0;

function render(elindex,wasfound, removing){


//console.log("render called with: "+elindex+", "+wasfound+", "+removing)
			//console.log(searchnum);
			//console.log(searchcolors.length)
			//wordsearch = d3.event.target.value.replace(/[^\w\s]/gi,'');
			////console.log(elindex+" is elindex")
			//console.log(searchnum+" is searchnum")

			//var found = false;
			//console.log(wordsearch[elindex])
			if(wordsearch[elindex] == "" || wordsearch[elindex] == undefined)
				return 0;

		if(wasfound && !removing){
			G.selectAll("circle")
				.attr('class',function(d,i){
				//if(elindex == searchnum){
					var dclass = this.getAttribute('class');
					if(verslocs[elindex].includes(d.id)){
						return "selected"+elindex;
					}else if(dclass == 'unselected'){
						return 'unselected';
					}else if(dclass == ("selected"+elindex)){
						return 'unselected';
					}else{
						return dclass;
					}
				//}
			})
				//console.log(verslocs);
		}else{
			d3.select("p#currentsearch").html("This word was not found!<br>")
				//.html('<br>')
				.append('span')
				.attr('id','notfound')
				.text("(Word searches are case insensitive and exclude \"common words\" like \"the\" and \"and\".)");
				searchnum--;
				return -1;
		}


		if(wasfound){
			 //G.selectAll('text.bookcounts')
			 //bwordcounts = G.selectAll('text.bookcounts'+elindex)
			 //bwordcounts.selectAll('text.bookcounts'+elindex)
			 //console.log(bcounts)
			 //console.log(elindex)

			 //bwordcounts[elindex].selectAll('text.bookcounts'+elindex)
			 G.selectAll('text.bookcounts'+elindex)
				.text(function(d,i){return bcounts[elindex][i]})
				.attr('y', function(d,i){return (height/2)-((booksdata[i].bookwordcounts/45)/2)-40*(elindex+1)});
				//.remove();

				//console.log(bwordcounts[elindex])


			G.selectAll("circle.selected"+elindex)//.transition().duration(1000)
				.transition().duration(1000)
				.attr('r',5)
				.attr('fill',function(d,i){
				return searchcolors[elindex];
			})
				.attr('fill-opacity',"0.9")
				.attr('stroke',"white")
				.attr('stroke-opacity',"1.0")
				.attr('stroke-width',"0.1");


			G.selectAll("circle.unselected")//.transition().duration(1000)
				.transition().duration(1000)
				.attr('r',4)
				.attr('fill',"silver")
				.attr('fill-opacity',"0.4")
				.attr('stroke',"whitesmoke")
				.attr('stroke-opacity',"0.7")
				.attr('stroke-width',"0.1");

			d3.select("p#currentsearch").text("Highlighting verses containing the word: ")
				.selectAll('span')
				.data(wordsearch)
				.enter()
				.append('span')
				.attr('id',function(d,i){
					return 'currentword'+i;
				})
				.attr('class','wordlist')
				.text(function(d,i){ 
					if(d!=""){
						return d+' ('+wcounts[i]+'),';
					}else{
						return "";
					}
				})
				.style('display','inline')
				.style('color',function(d,i){
					return searchcolors[i];
				})
				.on("click",function(d,i){
					//console.log("triggered at:"+i)
					removeindex = i
					d3.select(this).remove();
					d3.selectAll('text.bookcounts'+removeindex)
						.text("");

					d3.selectAll('circle.selected'+i)
						.attr('r',4)
						.attr('fill',"silver")
						.attr('fill-opacity',"0.4")
						.attr('stroke',"whitesmoke")
						.attr('stroke-opacity',"0.7")
						.attr('stroke-width',"0.1")
						.attr('class','unselected');
						
					mice(removeindex)
					wordsearch.splice(removeindex,1,"");
					verslocs.splice(removeindex,1,0);
					//wordsearch.push("");
					//verslocs.push(0);
					if(searchnum>=0){
						if(searchnum>=removeindex){
							searchnum--;
						}
					}
					//console.log(searchnum);
					if(searchnum<0){
						render(-1,false,true);
					}else{
						render(removeindex,true,true);
					}
				})

			if(elindex == searchcolors.length-1){
			d3.select("p#currentsearch")
				.append('div')
				.style('color','white')
				.style('font-size','14px')
				.html(function(d,i){
					if(elindex == searchcolors.length-1){
						return "(This version can only search for "+searchcolors.length+" words at a time. The next search will replace the first word)";
					}
				})
			}
			//found = false;
			setTimeout(function(){
				mice(elindex);
			},1002);
			//setTimeout(mice.bind(null,w),2002);
		//}else{
		//}

			}
			////console.log(elindex+"is elindex before ifloop")
			//console.log(searchnum+"is elindex before ifloop")
	if(elindex<searchnum)render(elindex+1,true,true);
}

	d3.select("input#wordsearch").on("change", function(){
		//console.log("was word found? "+nfound);
			if(searchnum>searchcolors.length-2){
				searchnum = 0;
			}else{
			//}else if(nfound != -1){
				//console.log("notfound hit")
				searchnum++;
			}
			//console.log(searchnum+" is searchnum @ field enter")
			wordsearch[searchnum] = d3.event.target.value.replace(/[^\w\s]/gi,'').trim();
					var found = false;
					//for(var j=0;j<wordlocs.length;j++){
						var firstletter = wordsearch[searchnum].charAt(0).toLowerCase();
						for(var j=0;j<wordlocs[firstletter].uwords.length;j++){
						if(wordlocs[firstletter].uwords[j] == wordsearch[searchnum].toLowerCase()){
							verslocs[searchnum] = wordlocs[firstletter].wlocations[j];
							wcounts[searchnum] = wordlocs[firstletter].wlocations[j].length;
							bcounts[searchnum] = wordlocs[firstletter].bookcounts[j];
						//if(wordlocs[j].word == wordsearch[searchnum].toLowerCase()){
							//verslocs[searchnum] = wordlocs[j].locations;
							//wcounts[searchnum] = wordlocs[j].locations.length;
							//bcounts[searchnum] = wordlocs[j].bookcounts;
							found = true;
							break;
						}
					}
		nfound = render(searchnum,found,false);
	})

nfound = render(searchnum,true,false)
			

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
analyze(currentversion);


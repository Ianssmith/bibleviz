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
async function analyze(){
	try{
		const data = await d3.tsv("data/twebdata.tsv", function(d){
			return {
				//words: JSON.parse(d.verses_nopunct.replace("\'","\"")),
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
				books: d['field.1_y'],
				bookwordcounts: +d.wordcount,
				chaptercount: +d.chaptercount,
				versecounts: JSON.parse(d.versecounts.replace(/\'/g,"\""))
			}
		});

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

		console.log(data);
		console.log(booksdata);
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

		//console.log(D);

		var svg = d3.select('div#container')
			.append('svg')
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 "+width+" "+height)
			//.attr("viewBox", "0 0 300 300")
			.classed("svg-content", true);
			//.attr('width',width)
			//.attr('height',height);

		G = svg.append('g')
			.attr("id", "verses");
		
		books = G.selectAll('rect')
			.data(booksdata)
			.enter()
			.append('rect')
			.attr('x', function(d,i){return (i*20)+(5*i);})
			.attr('y', function(d){return height-d.bookwordcounts/45;})
			.attr('width',20)
			//.attr('height', function(d){return d.bookwordcounts/45;})
			.attr('height', height)
			.attr("fill", "red");

		bookgroups = G.selectAll('g')
			//.data(D)
				//function(data,booksdata){
				//}
			//)
			.enter()
			.append('g')
			.attr('id','books');

		var versetracker = 0;
		G.selectAll('g #books')
			.data(data)
			.enter()
			.append('circle')
			.attr('cx',function(d,i){
				return (((d.booknum-1)*20)+(5*(d.booknum-1))+1);
				//for(var t=0;t<cbooksdata[d.booknum-1];t++){
				//for(var j=0;j<vbooksdata[d.booknum-1][t];j++){
				//	for(var k=0;k<j;k++){
				//		return (((((d.booknum-1)*20)+(5*(d.booknum-1))+1))+((20/vbooksdata[d.booknum-1][t])*k));
				//	}
				//}
				//}
			})
			.attr('cy',function(d,i){ return height-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter)})
			.attr('r',1)

			//.append('rect')
			//.attr('x',function(d,i){return ((d.booknum-1)*20)+(5*(d.booknum-1))+1})
			//.attr('y',function(d,i){ return height-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter)})
			//.attr('width',18)
			//.attr('height',function(d,i){return (height-(((mbooksdata[d.booknum-1]/45)/cbooksdata[d.booknum-1])*d.chapter))+1})
			.attr('fill','lightblue');


	}catch(error){
		console.log("fail!");
		console.log(error);
	}
}

analyze();


var fetch = require('node-fetch');
var cheerio = require('cheerio');
var convert = require('xml-js');
var striptags = require('striptags');
var express = require('express');
var fs = require('fs');

//expressjs setup
var app = express();

//port setup
var port = process.env.PORT || 3000;

//app get request
app.get('/ai', function (req, res) {
    fetch('https://www.brighttv.co.th/tag/%e0%b9%80%e0%b8%a5%e0%b8%82%e0%b8%94%e0%b8%b1%e0%b8%87/feed')
        .then(function (response) {
            return response.text();
        })
        .then(function (body) {
            //console.log(body);
            //get pubDate from xml
            let test = []
            var $ = cheerio.load(body);
            var pubDate = $('pubDate').text();
            console.log(pubDate);
            //get content:encoded from xml
            /*var content = $('content:encoded').text();
            console.log(content);*/
            //console all tag from xml
            /*var all = $('*').text();
            console.log(all);*/
            var result1 = convert.xml2js(body);
            //console.log(convert.xml2json(body, {compact: true, spaces: 4}));
            //console.log(result1.elements[0].elements[0].elements[11].elements[15].elements[0].cdata);
            //console.log(stripHtml(result1.elements[0].elements[0].elements[11].elements[15].elements[0].cdata))
            //console.log(result1.elements[0].elements[0].elements[11].elements[15].elements[0].cdata.match(/\d+/g))
            //console.log(JSON.stringify(result1.elements[0].elements[0].elements[11].elements[15].elements[0].cdata.match(/\d+/g)))
            let arraywow = []
            for (let index = 11; index < result1.elements[0].elements[0].elements.length; index++) {
                //console.log(result1.elements[0].elements[0].elements[index].elements[15].elements[0].cdata)
                //console.log(result1.elements[0].elements[0].elements[index].elements[15].name)
                for (let wowindex = 0; wowindex < result1.elements[0].elements[0].elements[index].elements.length; wowindex++) {
                    //const element = array[index];
                    if (result1.elements[0].elements[0].elements[index].elements[wowindex].name == 'content:encoded') {
                        let cdata = result1.elements[0].elements[0].elements[index].elements[wowindex].elements[0].cdata;
                        //remove text look like 17/01/65
                        cdata = cdata.replace(/\d+\/\d+\/\d+/g, '');
                        //array month thai
                        let month = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
                        //detect thai month in cdata and console with 2 before and after month
                        for (let index = 0; index < month.length; index++) {
                            if (cdata.includes(month[index])) {
                                console.log(cdata.substring(cdata.indexOf(month[index]) - 2, cdata.indexOf(month[index]) + 2));
                                test.push(cdata.substring(cdata.indexOf(month[index]) - 2, cdata.indexOf(month[index]) + 2));
                            }
                        }
                        //remove text from cdata by test array
                        for (let index = 0; index < test.length; index++) {
                            cdata = cdata.replace(test[index], '');
                        }
                        striptags(cdata).match(/[^\u0E00-\u0E7F^\d^a-z^A-z^.^(^#^/^-]\d+/g).forEach(element => {
                            element = element.replace(/\s/g, "")
                            if (element.length >= 2 && element.length <= 6 && element != new Date().getFullYear() && element != (new Date().getFullYear() + 543) && element.length != 4 && element != new Date().getDate() && element != new Date().getMonth() + 1 && element != (new Date().getFullYear() + 543).toString().substr(2, 2) && element != (new Date().getFullYear() + 543).toString().substr(0, 2)) {
                                arraywow.push(element.replace(/\s/g, ""))
                                console.log(striptags(cdata))
                            }
                        });
                    }
                }
            }
            //console.log(arraywow)
            const counts = {};
            arraywow.forEach((x) => {
                counts[x] = (counts[x] || 0) + 1;
            });
            /*const realcounts = {};
            //counts forEach key value index
            Object.keys(counts).forEach((key) => {
                //realcounts[key] = counts[key];
                console.log(counts[key])
            });*/
            // order counts and keep value
            const realcounts = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map((key) => ({ key, value: counts[key] }));
            /*const sorted = Object.keys(counts).sort((a, b) => counts[a] - counts[b]);
            console.log(sorted)*/
            console.log(realcounts)
            console.log(JSON.stringify(counts));
            console.log(counts)
            console.log(test)
            if(req.query.want != undefined){
                //get realcounts only top 10
                let realcounts2 = realcounts.slice(0, 10);
                res.send(JSON.stringify(realcounts2));
            }else{
                res.send(JSON.stringify(realcounts));
            }
        });
        //get number from string and put it in array
        /*var str = "foo35bar5jhkj88";
        matches = str.match(/\d+/g);

        console.log(matches);*/

        //get xml from url
})

//app get html
app.get('/', function (req, res) {
    if(req.query.want != undefined){
        //copy index.html and change name to indextop10.html
        fs.copyFile('./index.html', './indextop10.html', (err) => {
            if (err) throw err;
            console.log('source was copied to destination');
        });
        //edit indextop10.html change https://lottsanook-chitai-production.up.railway.app/ai to https://lottsanook-chitai-production.up.railway.app/ai?want=true
        fs.readFile('./indextop10.html', 'utf8', function (err, data) {
            if (err) throw err;
            var result = data.replace(/https:\/\/lottsanook-chitai-production.up.railway.app\/ai/g, 'https://lottsanook-chitai-production.up.railway.app/ai?want=true');
            fs.writeFile('./indextop10.html', result, 'utf8', function (err) {
                if (err) throw err;
                console.log('It\'s saved!');
            });
        });
        //send indextop10.html
        res.sendFile(__dirname + '/indextop10.html');
    }else{
        res.sendFile(__dirname + '/index.html');
    }
})

//app listen
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
})
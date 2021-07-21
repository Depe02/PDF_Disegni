const fs = require('fs');
const pdf = require('pdf-parse');
var path = require('path');
const PDFParser = require("pdf2json");
const PDFMerger = require('pdf-merger-js');
var A2 = new PDFMerger();
var A3 = new PDFMerger();
var A4 = new PDFMerger();

function fromDir(startPath, filter) {

    var res = new Array();

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            res.push(fromDir(filename, filter)); //recurse
        } else if (filename.indexOf(filter) >= 0) {
            res.push(files[i]);
        }
        ;
    }
    ;
    return res;
}
;

var res = fromDir('Disegni', '.pdf');

async function f1() {
    for (var i = 0; i < res.length; i++) {
        await waitPDF(res[i]);
    }
    await A2.save('A2.pdf'); //save under given name and reset the internal document
    await A3.save('A3.pdf'); //save under given name and reset the internal document
    await A4.save('A4.pdf'); //save under given name and reset the internal document
    console.log("DONE");
}

function waitPDF(filename) {
    return new Promise(resolve => {
        console.log("File: " + filename);
        let dataBuffer = fs.readFileSync("Disegni/" + filename);
        pdf(dataBuffer).then(function (data) {
            const text = data.text.split('\n');
            for (var i = 0; i < text.length; i++) {
                if (text[i] == "PROPRIETA' RISERVATA A TERMINI DI LEGGE") {
                    console.log("Codice: " + text[i + 1]);
                    console.log("Revisione: " + text[i + 2]);
                    break;
                }
                //console.log(i + ":   " + text[i]);
            }
            let pdfParser = new PDFParser();

            pdfParser.loadPDF("Disegni/" + filename);

            pdfParser.on("pdfParser_dataReady", pdfData => {
                width = parseFloat(pdfData.formImage.Width / 4.5 * 25.4).toPrecision(3); // pdf width
                height = parseFloat(pdfData.formImage.Pages[0].Height / 4.5 * 25.4).toPrecision(3); // page height

                if ((height == "594" && width == "420") || (height == "420" && width == "594")) {
                    A2.add("Disegni/" + filename)
                    console.log("A2");
                } else if ((height == "420" && width == "297") || (height == "297" && width == "420")) {
                    A3.add("Disegni/" + filename)
                    console.log("A3");
                } else if ((height == "297" && width == "210") || (height == "210" && width == "297")) {
                    A4.add("Disegni/" + filename)
                    console.log("A4");
                } else {
                    console.log("INVALID");
                }

                //console.log(`Height : ${height} in mm`)
                //console.log(`Width : ${width} in mm`)

                resolve(0);
            });
        });

    });
}

f1();
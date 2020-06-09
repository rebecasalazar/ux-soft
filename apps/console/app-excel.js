const xlsx      = require('xlsx');
const fs        = require('fs');
const path      = require("path");
const sqlite3   = require('sqlite3').verbose();
const db        = new sqlite3.Database(':memory:');

let filePath = path.resolve(__dirname, 'eje cafetero.xlsx');
let bufffer = fs.readFileSync(filePath);
let workbook = xlsx.read(bufffer, {type:'buffer'});
let sheetName = workbook.SheetNames[0];
let worksheet = workbook.Sheets[sheetName];

let columnsException = [];

let A_Code = 65;
let Z_Code = 90;
let chars = Z_Code - A_Code + 1;

let l = "A".charCodeAt(0);

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

for (let i = 0; i < chars; i++) {
    letters += String.fromCharCode(i + 65) + ',';
}

const getNextLetter = (letter) => {

};

for (let z in worksheet) {

    /* all keys that do not begin with "!" correspond to cell addresses */
    if (z[0] === '!') continue;

    let cel = z.split('');
}


let end = 'end';

// db.serialize(function() {
//     db.run("CREATE TABLE lorem (info TEXT)");
   
//     var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (var i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();
   
//     db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//         console.log(row.id + ": " + row.info);
//     });
//   });
   
//   db.close();

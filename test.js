const { getLatLng } = require('./community-geocoder/src/api.js');

getLatLng("東京都中央区八重洲２-２-７",result=>{console.log(result)});
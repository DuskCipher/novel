const http = require('http');
fetch("https://www.sankavollerei.com/anime/ongoing-anime?page=1")
  .then(r => r.json())
  .then(d => {
    let slug = d.data.animeList[0].slug;
    return fetch("https://www.sankavollerei.com/anime/episode/" + slug);
  })
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d.data.downloadUrl, null, 2)));

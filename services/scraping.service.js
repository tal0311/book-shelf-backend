import fetch from 'node-fetch';
export const scrapMetaData = async (req, res) => {
 const instagramUrl = req.query.url;

 try {
  const response = await fetch(instagramUrl);
  const html = await response.text();
  const bookMetaData = {
   title: getTitleData(html),
   description: getDescriptionData(html),
   image: getImageData(html),
   favicon: getFaviconData(html),
  }
  res.send(bookMetaData);
 } catch (error) {
  console.error('Error:', error);
  res.status(500).send('Error fetching Instagram content.');
 }
}



function getTitleData(html) {
 // regex to mach title data
 const titleRegex = /<title.*?>(.*?)<\/title>/i;
 const titleMatch = html.match(titleRegex);
 return titleMatch ? titleMatch[1] : 'Title not found';
}

function getDescriptionData(html) {
 const descriptionRegex = /<meta.*?name="description".*?content="(.*?)".*?>/i;
 const descriptionMatch = html.match(descriptionRegex);

 return descriptionMatch
  ? descriptionMatch[1].replace(/&quot;/g, '"')
  : 'Description not found';
}


function getImageData(html) {
 // regex to mach image data
 const imageRegex = /<meta.*?property="og:image".*?content="(.*?)".*?>/i;
 const imageMatch = html.match(imageRegex);
 return imageMatch ? decodeHtmlEncodedUrl(imageMatch[1]) : 'Image not found';
}

function decodeHtmlEncodedUrl(htmlEncodedUrl) {
 const textarea = document.createElement('textarea');
 textarea.innerHTML = htmlEncodedUrl;
 return textarea.value;
}

function getFaviconData(html) {
 const faviconLinkRegex = /<link.*?rel=["'](?:icon|shortcut icon)["'].*?href="(.*?)".*?>/i;
 const match = html.match(faviconLinkRegex);
 return match ? match[1] : 'Favicon not found';
}
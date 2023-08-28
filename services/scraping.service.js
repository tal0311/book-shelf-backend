import fetch from 'node-fetch';
import he from 'he';

export const scrapMetaData = async (req, res) => {
  const urlToCrape = req.query.url;

  try {
    const response = await fetch(urlToCrape);
    const html = await response.text();

    const bookMetaData = {
      title: getTitleData(html),
      desc: getDescriptionData(html),
      imgUrl: getImageData(html),
      favicon: getFaviconData(html),
      link: urlToCrape
    };

    res.send(bookMetaData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching Instagram content.');
  }
};

function getTitleData(html) {
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
  const imageRegex = /<meta.*?property="og:image".*?content="(.*?)".*?>/i;
  const imageMatch = html.match(imageRegex);
  return imageMatch ? he.decode(imageMatch[1]) : 'Image not found';
}

function getFaviconData(html) {
  const faviconLinkRegex = /<link.*?rel=["'](?:icon|shortcut icon)["'].*?href="(.*?)".*?>/i;
  const match = html.match(faviconLinkRegex);
  return match ? match[1] : 'Favicon not found';
}

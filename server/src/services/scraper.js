const request = require('superagent');
const { parse } = require('node-html-parser');

export const getMcsoRecords = () => {

  return request.post('http://www.mcso.us/PAID/Home/SearchResults')
  .type('form')
  .send(
    { FirstName: '',
      LastName: '',
      SearchType: 3 })
  .then(res => res.text)
  .then(parse)
  .then(findLinks)
  .then(returnPaths)
  .then(paths => {
    return Promise.all(paths.map(path => requestArrest(path)));
  })
  .then(response => {
    return response;
  });

}

const findLinks = html => {
  return html.querySelectorAll('.search-results td a');
};

const returnPaths = paths => {
  return paths.map(path => path.rawAttrs.replace('href="', '').replace('"', ''));
};

const arrestPageValueAt = (html, row) => {
  return html.querySelectorAll('#booking-detail table tr')[row].childNodes[3].text;
};

const parseArrestPage = html => ({
  swisId: arrestPageValueAt(html, 0),
  mcsoName: arrestPageValueAt(html, 1),
  mcsoAge: arrestPageValueAt(html, 2),
  mcsoGender: arrestPageValueAt(html, 3),
  mcsoRace: arrestPageValueAt(html, 4),
  mcsoHeight: arrestPageValueAt(html, 5),
  mcsoWeight: arrestPageValueAt(html, 6),
  mcsoHair: arrestPageValueAt(html, 7),
  mcsoEyes: arrestPageValueAt(html, 8),
  mcsoArrestingAgency: arrestPageValueAt(html, 9),
  mcsoBookingDate: arrestPageValueAt(html, 10),
  mcsoAssignedFacility: arrestPageValueAt(html, 11),
  mcsoProjectedReleaseDate: arrestPageValueAt(html, 12)
});

const requestArrest = path => {
  return request.get(`http://www.mcso.us${path}`)
    .then(res => res.text)
    .then(parse)
    .then(parseArrestPage);
};
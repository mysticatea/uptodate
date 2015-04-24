/*eslint-env browser*/
/*global fetch,markdownit*/

function parseParams(query) {
  if (query == null || query === "" || query === "?") {
    return [];
  }
  if (query[0] === "?") {
    query = query.slice(1);
  }
  return atob(query).split(",").map(item => {
    const decoded = decodeURIComponent(item);
    const colon = decoded.indexOf(":");
    if (colon < 0) {
      return {name: decoded, repoName: null};
    }
    return {name: decoded.slice(0, colon), repoName: decoded.slice(colon + 1)};
  });
}

window.onload = function() {
  const md = markdownit();
  const fetchPromises = parseParams(location.search)
    .map(item => {
      if (item.repoName == null) {
        // Repositry not found...
        return Promise.resolve({
          name: item.name,
          error: "404 Not Found"
        });
      }
      return fetch(`https://api.github.com/repos/${item.repoName}/releases/latest`)
        .then(res => {
          if (res.status !== 200) {
            throw new Error(`${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => ({
          name: item.name,
          url: `https://github.com/${item.repoName}/releases`,
          tagName: data.tag_name,
          subject: data.name,
          detail: md.render(data.body || "(no details)")
        }))
        .catch(err => ({
          name: item.name,
          error: err.message
        }));
    });

  Promise.all(fetchPromises)
    .then(list => {
      document.body.innerHTML =
        list.map(item => {
          if (item.error != null) {
            return `<section><h1>${item.name}</h1>${item.error}</section>`;
          }
          return `<section>` +
            `<h1>${item.name} <small>(${item.tagName})</small></h1>` +
            `${item.subject}<br>` +
            `${item.detail}<br>` +
            `<a class='readmore' target="_blank" href="${item.url}">Read more...</a>` +
          `</section>`;
        }).join("");
    });
};

function formatEpisodeCode(season, number) {
  const s = String(season).padStart(2, "0");
  const n = String(number).padStart(2, "0");
  return `S${s}E${n}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // Optional: episode count
  const count = document.createElement("p");
  count.textContent = `Displaying ${episodeList.length} episodes`;
  rootElem.appendChild(count);

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";

    card.innerHTML = `
      <h3>${episode.name} (${formatEpisodeCode(episode.season, episode.number)})</h3>
      <img src="${episode.image?.medium || ""}" alt="${episode.name}">
      <p>${episode.summary || "No summary available"}</p>
    `;

    rootElem.appendChild(card);
  });
}

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

window.onload = setup;

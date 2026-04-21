function formatEpisodeCode(season, number) {
  const s = String(season).padStart(2, "0");
  const n = String(number).padStart(2, "0");
  return `S${s}E${n}`;
}

let allEpisodes = [];
let showsCache = {};
let episodesCache = {};

// ----------------- UI Helpers -----------------

function showLoading() {
  document.getElementById("root").innerHTML =
    "<p>Loading episodes... please wait.</p>";
}

function showError(message) {
  document.getElementById("root").innerHTML = `<p>Error: ${message}</p>`;
}

// ----------------- Render Episodes -----------------

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";

  const count = document.createElement("p");
  count.className = "count";
  count.textContent = `Displaying ${episodeList.length} episode(s)`;

  rootElem.appendChild(count);

  if (episodeList.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "No episodes found 💔";

    rootElem.appendChild(msg);

    return;
  }

  episodeList.forEach((episode) => {
    const card = document.createElement("div");

    card.className = "episode-card";

    card.innerHTML = `
      <h3>
      ${episode.name}
      (${formatEpisodeCode(episode.season, episode.number)})
      </h3>

      ${
        episode.image?.medium
          ? `<img src="${episode.image.medium}" alt="${episode.name}">`
          : "<p>No image available</p>"
      }

      <div>
        ${episode.summary || "No summary available"}
      </div>
    `;

    rootElem.appendChild(card);
  });
}

// ----------------- Show Selector -----------------

function populateShowSelector(shows) {
  const selector = document.getElementById("showSelect");

  selector.innerHTML = `<option value="">
      Select a show
    </option>`;

  shows.forEach((show) => {
    const option = document.createElement("option");

    option.value = show.id;

    option.textContent = show.name;

    selector.appendChild(option);
  });
}

async function loadShows() {
  try {
    if (showsCache.shows) {
      populateShowSelector(showsCache.shows);

      return;
    }

    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error("Failed to load shows");
    }

    const shows = await response.json();

    shows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    showsCache.shows = shows;

    populateShowSelector(shows);
  } catch (error) {
    showError(error.message);
  }
}

// ----------------- Episodes -----------------

function populateEpisodeSelector() {
  const selector = document.getElementById("episodeSelect");

  selector.innerHTML = `
   <option value="">
      All Episodes
   </option>
 `;

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;

    option.textContent = `${formatEpisodeCode(
      episode.season,
      episode.number,
    )} - ${episode.name}`;

    selector.appendChild(option);
  });
}

async function loadEpisodes(showId) {
  try {
    showLoading();

    if (episodesCache[showId]) {
      allEpisodes = episodesCache[showId];

      populateEpisodeSelector();

      makePageForEpisodes(allEpisodes);

      return;
    }

    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );

    if (!response.ok) {
      throw new Error("Failed to load episodes");
    }

    const episodes = await response.json();

    episodesCache[showId] = episodes;

    allEpisodes = episodes;

    populateEpisodeSelector();

    makePageForEpisodes(allEpisodes);
  } catch (error) {
    showError(error.message);
  }
}

// ----------------- Events -----------------

document.getElementById("showSelect").addEventListener("change", function (e) {
  if (!e.target.value) return;

  loadEpisodes(e.target.value);
});

document
  .getElementById("episodeSelect")
  .addEventListener("change", function (e) {
    if (!e.target.value) {
      makePageForEpisodes(allEpisodes);

      return;
    }

    const selectedEpisode = allEpisodes.filter((ep) => ep.id == e.target.value);

    makePageForEpisodes(selectedEpisode);
  });

function handleSearchInput(e) {
  const query = e.target.value.toLowerCase();

  const filteredEpisodes = allEpisodes.filter((episode) => {
    return (
      episode.name.toLowerCase().includes(query) ||
      (episode.summary && episode.summary.toLowerCase().includes(query))
    );
  });

  makePageForEpisodes(filteredEpisodes);
}

document
  .getElementById("searchInput")
  .addEventListener("input", handleSearchInput);

// ----------------- Start App -----------------

window.onload = loadShows;

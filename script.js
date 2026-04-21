function formatEpisodeTitle(name, season, number) {
  const s = String(season).padStart(2, "0");
  const n = String(number).padStart(2, "0");
  return `${name} - S${s}E${n}`;
}

function createEpisodeCard(episode) {
  let cardDiv = document.createElement("div");
  cardDiv.className = "episode-card";

  let title = document.createElement("h3");
  title.innerText = formatEpisodeTitle(
    episode.name,
    episode.season,
    episode.number,
  );

  let image = document.createElement("img");
  if (episode.image && episode.image.medium) {
    image.src = episode.image.medium;
  } else {
    image.src = "https://via.placeholder.com/250x140?text=No+Image";
  }

  let summary = document.createElement("div");
  summary.innerHTML = episode.summary || "<p>No summary available.</p>";

  cardDiv.append(title, image, summary);
  return cardDiv;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const count = document.createElement("p");
  count.className = "count";
  count.textContent = `Displaying ${episodeList.length} episode(s)`;
  rootElem.appendChild(count);

  if (episodeList.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No episodes found 💔";
    message.style.textAlign = "center";
    rootElem.appendChild(message);
    return;
  }

  const episodeCard = episodeList.map(createEpisodeCard);
  episodeCard.forEach((card) => rootElem.appendChild(card));
}

function setupEpisodeSelect(allEpisodes) {
  const episodeSelect = document.getElementById("episodeSelect");

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.innerText = "Show All Episodes";
  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;

    option.innerText = formatEpisodeTitle(
      episode.name,
      episode.season,
      episode.number,
    );

    episodeSelect.appendChild(option);
  });

  episodeSelect.addEventListener("change", (event) => {
    const selectedId = event.target.value;

    if (selectedId === "all") {
      makePageForEpisodes(allEpisodes);
    } else {
      const singleEpisode = allEpisodes.filter((episode) => {
        return String(episode.id) === selectedId;
      });
      makePageForEpisodes(singleEpisode);
    }

    document.getElementById("searchInput").value = "";
  });
}

async function fetchEpisodes() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const episodes = await response.json();
    return episodes;
  } catch (error) {
    console.error("Failed to fetch episodes:", error);
    return [];
  }
}

async function setup() {
  const allEpisodes = await fetchEpisodes();

  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", (e) => {
    const searchText = e.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const name = episode.name ? episode.name.toLowerCase() : "";
      const summary = episode.summary ? episode.summary.toLowerCase() : "";

      return name.includes(searchText) || summary.includes(searchText);
    });

    makePageForEpisodes(filteredEpisodes);

    const episodeSelect = document.getElementById("episodeSelect");
    if (episodeSelect) {
      episodeSelect.value = "all";
    }
  });

  setupEpisodeSelect(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

window.onload = setup;

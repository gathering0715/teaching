const scriptPage = document.getElementById("scriptPage");
const pageCounter = document.getElementById("pageCounter");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const deckLink = document.getElementById("deckLink");

const slideSyncKey = "teaching-current-slide";
const sectionPattern = /^(\d{2})\.\s+(.+)$/;

let pages = [];
let currentIndex = 0;
let wheelLocked = false;
let deckWindow = null;

function parseScript(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(sectionPattern);

    if (match) {
      current = {
        number: Number.parseInt(match[1], 10),
        title: match[2],
        lines: [],
      };
      sections.push(current);
      return;
    }

    if (current && trimmed) {
      current.lines.push(trimmed);
    }
  });

  return sections;
}

function syncHash() {
  history.replaceState(null, "", `#slide-${currentIndex + 1}`);
}

function syncDeck() {
  const slideNumber = currentIndex + 1;
  localStorage.setItem(slideSyncKey, String(slideNumber));
  deckLink.href = `../index.html#slide-${slideNumber}`;

  if (deckWindow && !deckWindow.closed) {
    try {
      deckWindow.location.href = new URL(deckLink.href, location.href).href;
    } catch {
      // The storage event still syncs same-origin deck tabs.
    }
  }
}

function renderPage() {
  const page = pages[currentIndex];
  if (!page) {
    scriptPage.innerHTML = '<p class="error">표시할 대본 페이지가 없습니다.</p>';
    pageCounter.textContent = "- / -";
    return;
  }

  document.title = `${String(page.number).padStart(2, "0")}. ${page.title} | 발표 대본`;
  scriptPage.innerHTML = `
    <div class="page-meta">
      <span class="page-num">${String(page.number).padStart(2, "0")}</span>
      <span>${currentIndex + 1} / ${pages.length}</span>
    </div>
    <h2 class="page-title">${page.title}</h2>
    <ul class="script-lines">
      ${page.lines.map((line) => `<li>${line}</li>`).join("")}
    </ul>
  `;

  pageCounter.textContent = `${currentIndex + 1} / ${pages.length}`;
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === pages.length - 1;
  syncHash();
  syncDeck();
}

function goTo(index) {
  currentIndex = Math.max(0, Math.min(index, pages.length - 1));
  renderPage();
}

function goNext() {
  goTo(currentIndex + 1);
}

function goPrev() {
  goTo(currentIndex - 1);
}

async function loadScript() {
  try {
    const response = await fetch("../대본.TXT", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    pages = parseScript(await response.text());
    const hashNumber = Number.parseInt(location.hash.replace("#slide-", ""), 10);
    if (!Number.isNaN(hashNumber)) {
      currentIndex = Math.max(0, Math.min(hashNumber - 1, pages.length - 1));
    }
    renderPage();
  } catch (error) {
    scriptPage.innerHTML = '<p class="error">대본 파일을 불러오지 못했습니다. 로컬 서버로 열었는지 확인해 주세요.</p>';
  }
}

prevButton.addEventListener("click", goPrev);
nextButton.addEventListener("click", goNext);
deckLink.addEventListener("click", (event) => {
  event.preventDefault();
  deckWindow = window.open(deckLink.href, "teaching-deck");
  if (deckWindow) {
    deckWindow.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    goNext();
    return;
  }

  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goPrev();
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    goTo(0);
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    goTo(pages.length - 1);
  }
});

document.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    if (wheelLocked) {
      return;
    }

    wheelLocked = true;
    if (event.deltaY > 0) {
      goNext();
    } else if (event.deltaY < 0) {
      goPrev();
    }

    window.setTimeout(() => {
      wheelLocked = false;
    }, 420);
  },
  { passive: false }
);

window.addEventListener("storage", (event) => {
  if (event.key !== slideSyncKey || !event.newValue) {
    return;
  }

  const slideNumber = Number.parseInt(event.newValue, 10);
  if (!Number.isNaN(slideNumber) && slideNumber !== currentIndex + 1) {
    goTo(slideNumber - 1);
  }
});

window.addEventListener("hashchange", () => {
  const slideNumber = Number.parseInt(location.hash.replace("#slide-", ""), 10);
  if (!Number.isNaN(slideNumber)) {
    goTo(slideNumber - 1);
  }
});

loadScript();

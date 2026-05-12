const slides = Array.from(document.querySelectorAll(".slide"));
const counter = document.getElementById("slideCounter");
const progressBar = document.getElementById("progressBar");
const fullscreenToggle = document.getElementById("fullscreenToggle");
const slideJumpTargets = Array.from(document.querySelectorAll("[data-go-slide]"));
const explainerSlides = Array.from(document.querySelectorAll(".explainer-slide"));
const miniMapSlides = Array.from(document.querySelectorAll('[data-show-map="true"]'));

let currentIndex = 0;
let wheelLocked = false;
const mapCopy = {
  frontend: "지금은 프런트, 즉 사용자가 직접 보는 화면 쪽을 풀어 설명하는 중입니다.",
  backend: "지금은 규칙과 처리 로직이 모여 있는 백엔드 쪽 설명입니다.",
  db: "지금은 데이터가 쌓이고 복구돼야 하는 DB 관점 설명입니다.",
  server: "지금은 실제 서비스가 돌아가는 설비와 운영 공간인 서버 설명입니다.",
  api: "지금은 프런트와 백엔드가 주고받는 약속, 즉 API 설명입니다.",
  flow: "지금은 버튼 하나가 화면, API, 백엔드, DB, 다시 화면으로 이어지는 전체 동작 흐름입니다.",
  git: "지금은 코드 원본을 회사 저장소에 보관하는 Git 설명입니다.",
  deploy: "지금은 외부 운영 환경으로 반영되는 배포와 운영 연결 설명입니다."
};
const mapMeta = {
  frontend: {
    title: "프런트",
    subtitle: "사용자가 직접 보는 화면",
    ask: "버튼, 문구, 로딩, 성공 후 이동은 어떻게 보이나?",
    note: "화면 상태와 이동 흐름이 정해졌는지 본다.",
  },
  backend: {
    title: "백엔드",
    subtitle: "규칙과 처리 로직",
    ask: "권한, 검증, 실패 처리, 예외 분기는 어디서 처리하나?",
    note: "예외와 실패 기준이 빠져 있지 않은지 본다.",
  },
  db: {
    title: "DB",
    subtitle: "기록과 복구의 중심",
    ask: "무엇을 저장하고, 중복과 복구는 어떻게 막나?",
    note: "저장 항목과 복구 기준이 정해졌는지 본다.",
  },
  server: {
    title: "서버",
    subtitle: "실제 운영 환경",
    ask: "어디에 배포하고, 장애가 나면 누가 복구하나?",
    note: "운영 주체와 복구 책임이 분명한지 본다.",
  },
  api: {
    title: "API",
    subtitle: "프런트와 백엔드 사이 약속",
    ask: "화면에서 어떤 정보를 보내고, 성공/실패 때 무엇을 보여주나?",
    note: "보내는 정보와 화면에 보여줄 결과가 함께 정해졌는지 본다.",
  },
  flow: {
    title: "전체 흐름",
    subtitle: "버튼에서 기록과 화면 반영까지",
    ask: "이 버튼은 화면만 바꾸나, 권한·저장·알림까지 바꾸나?",
    note: "클릭부터 성공/실패 화면까지 이어서 본다.",
  },
  git: {
    title: "Git",
    subtitle: "회사 코드 저장소",
    ask: "저장소 소유자는 누구이고, 변경 이력은 남는가?",
    note: "저장소 소유권과 접근 권한을 확인한다.",
  },
  deploy: {
    title: "배포",
    subtitle: "외부 서비스 반영",
    ask: "언제 반영하고, 배포 후 문제는 어떻게 확인하나?",
    note: "반영 시점과 점검 기준이 정해졌는지 본다.",
  }
};

const partOneContext = {
  "프런트엔드 선택": [
    ["핵심", "프런트엔드는 고객이 실제로 보고 누르는 화면 영역이다."],
    ["확인", "공통 컴포넌트, 화면 규칙, 오류 문구가 문서로 남아 있는지 본다."],
    ["리스크", "초기에는 빨라 보여도 규칙 없이 커지면 화면마다 다르게 고쳐진다."]
  ],
  "백엔드 선택": [
    ["핵심", "백엔드는 화면 뒤에서 권한, 결제, 정산 같은 규칙을 처리하는 영역이다."],
    ["확인", "우리 팀이 유지할 사람을 뽑을 수 있는지, 운영 문서가 남는지 본다."],
    ["리스크", "초기 속도만 보고 고르면 기능이 늘 때 예외 처리와 복구 비용이 커진다."]
  ],
  "API": [
    ["핵심", "API는 화면과 처리부가 주고받는 약속이다."],
    ["확인", "성공했을 때뿐 아니라 실패, 권한 없음, 중복 신청 때 보여줄 결과까지 적혀 있는지 본다."],
    ["리스크", "API 문서가 없으면 화면 오류인지 처리 오류인지 추적하는 시간이 길어진다."]
  ],
  "DB": [
    ["핵심", "DB는 기술 부품이 아니라 고객, 주문, 결제, 로그가 남는 회사 장부다."],
    ["확인", "무엇을 저장하고, 무엇을 지우며, 누가 보고, 장애 때 어디까지 복구할지 정한다."],
    ["리스크", "삭제와 보관 기준이 없으면 고객 민원, 정산 오류, 복구 실패가 같이 온다."]
  ],
  "서버": [
    ["핵심", "서버 선택은 비용 문제가 아니라 장애 책임과 접근 권한을 정하는 일이다."],
    ["확인", "회사 명의 계정, 월 비용 상한, 백업, 알림 수신자를 계약 전에 확인한다."],
    ["리스크", "계정이 외주사나 개인에게 있으면 장애와 이전 때 통제권이 흔들린다."]
  ],
  "Git": [
    ["핵심", "Git은 코드 원본을 회사 계정에 보관하는 자산이다."],
    ["확인", "저장소 소유자, 접근 권한, 브랜치·커밋 기록, 인수인계 가능 여부를 본다."],
    ["리스크", "개인 계정에 코드가 있으면 납품 후 유지보수와 이전이 막힌다."]
  ],
  "배포": [
    ["핵심", "배포는 고객에게 공개되는 절차라서 승인과 확인 기준이 필요하다."],
    ["확인", "테스트 서버, 베타 테스트, 운영 서버, 오픈 후 점검 순서를 본다."],
    ["리스크", "되돌리기 기준이 없으면 작은 오류도 운영 장애로 커진다."]
  ],
  "버튼 하나의 흐름": [
    ["핵심", "이 장은 고객 행동 하나가 서비스 뒤쪽까지 어떻게 이어지는지 보는 장이다."],
    ["확인", "그 행동이 바꾸는 화면, 데이터, 알림, 관리자 기록을 한 번에 묻는다."],
    ["리스크", "범위를 작게 보면 견적과 일정이 계속 밀리고 검수 기준도 흔들린다."]
  ]
};

const partTwoThreeContext = {
  "면접 질문 프레임": [
    ["핵심", "우리 서비스에 필요한 기능을 정한 뒤, 그 기능을 확인할 질문으로 바꾼다."],
    ["대표 질문", "그 기능에서 화면, 처리, 저장 중 후보자가 직접 바꾼 곳은 어디인가?"],
    ["판단", "질문이 구체적일수록 실제 역할과 깊이가 드러난다."]
  ],
  "좋은 답 나쁜 답": [
    ["핵심", "좋은 답변은 본인 역할, 실패 상황, 수정 이유, 확인 방법이 보인다."],
    ["대표 질문", "본인이 직접 바꾼 화면, 파일, 문서 이름을 말할 수 있나?"],
    ["판단", "역할, 예외, 수정 이유, 운영 확인이 한 문장 안에 들어오는지 본다."]
  ],
  "신입 주니어 판단": [
    ["핵심", "좋은 답변을 끌어내려면 면접에서 작은 상황 질문을 던진다."],
    ["대표 질문", "이 기능이 필요했다면 어떤 화면, 데이터, 예외를 먼저 확인하나?"],
    ["판단", "순서, 예외, 확인 방법을 말하면 실제 사고 과정이 보인다."]
  ],
  "기능 경험 매칭": [
    ["핵심", "면접 질문보다 먼저 우리 서비스에 필요한 기능 경험을 정리한다."],
    ["대표 질문", "우리 핵심 기능과 같은 실패 케이스를 후보가 겪어봤나?"],
    ["판단", "결제, 권한, 검색, 알림 중 필요한 기능의 증거가 있는지 본다."]
  ],
  "포트폴리오 질문 검증": [
    ["핵심", "포트폴리오는 결과물보다 본인 역할, 예외, 수정 이유를 질문으로 확인한다."],
    ["대표 질문", "이 화면에서 본인이 직접 정한 기준과 나중에 고친 이유는 무엇인가?"],
    ["판단", "결과물은 있는데 본인 판단을 설명하지 못하면 보류한다."]
  ],
  "역할 분리": [
    ["핵심", "외주는 제작사이고, 대표는 목표와 기준을 정하는 제품 책임자다."],
    ["대표 질문", "이 결정의 최종 승인자는 누구이고 변경은 어떻게 남기나?"],
    ["판단", "구두 합의가 아니라 문서, 견적, 일정 영향으로 남는지 본다."]
  ],
  "MVP 범위": [
    ["핵심", "외주는 MVP 제작에 맞고, 운영과 고도화는 내부화할수록 유리하다."],
    ["대표 질문", "이번 버전에서 고객이 반드시 끝내야 하는 한 가지 흐름은 무엇인가?"],
    ["판단", "넣을 것, 뺄 것, 나중으로 미룰 것이 분리되어야 견적이 흔들리지 않는다."]
  ],
  "요구사항 문서": [
    ["핵심", "기능명만 적지 말고 성공, 실패, 권한, 처리 중 상태를 적는다."],
    ["대표 질문", "완료 후 어디로 이동하고, 실패하면 무엇을 보여주나?"],
    ["판단", "문서 문장과 실제 화면이 검수 때 그대로 대조되는지 본다."]
  ],
  "검수 기준": [
    ["핵심", "납품 후 말싸움을 줄이려면 계약 전에 클릭 순서를 정해야 한다."],
    ["대표 질문", "성공뿐 아니라 실패, 취소, 권한 차단까지 실행했나?"],
    ["판단", "캡처, 권한표, 관리자 화면, 납품 문서가 남아야 완료다."]
  ],
  "계약 범위": [
    ["핵심", "포함과 제외를 같이 적어야 추가 비용과 일정 분쟁이 줄어든다."],
    ["대표 질문", "화면 수, 수정 횟수, 배포 횟수, 제외 비용이 모두 쓰였나?"],
    ["판단", "요구사항 변경은 요청서, 추가 견적, 일정 영향 확인으로 처리한다."]
  ],
  "소유권과 계정": [
    ["핵심", "소스코드, 서버, 도메인, 배포 문서는 회사 자산으로 남아야 한다."],
    ["대표 질문", "저장소와 계정의 소유자가 회사이고 대표가 관리자 권한을 갖나?"],
    ["판단", "중도금, 잔금, 오픈 전 확인 시점이 계약에 들어가야 한다."]
  ],
  "유지보수": [
    ["핵심", "오픈 후 비용과 대응 시간을 먼저 정해야 운영 분쟁이 줄어든다."],
    ["대표 질문", "버그, 장애, 보안 업데이트와 신규 기능을 어떻게 구분하나?"],
    ["판단", "월 비용, 포함 범위, 응답 시간이 계약 문장으로 남아야 한다."]
  ],
  "장애 대응": [
    ["핵심", "장애는 누가, 언제, 무엇을 보고하는지로 정리한다."],
    ["대표 질문", "장애 감지 후 대표에게 몇 분 안에 공유하나?"],
    ["판단", "접수, 1차 조치, 복구 확인, 원인 보고 시간이 분리되어야 한다."]
  ]
};

const slideContext = partOneContext;

function syncPreviewScale() {
  const width = window.innerWidth;
  const shouldScale = width >= 761;

  if (!shouldScale) {
    document.documentElement.style.removeProperty("--deck-scale");
    return;
  }

  const isFullscreen = Boolean(document.fullscreenElement);
  const horizontalPadding = isFullscreen ? 16 : 44;
  const verticalSpace = isFullscreen ? 20 : 128;
  const maxScale = isFullscreen ? 1.24 : 1;
  const scale = Math.min(
    (window.innerWidth - horizontalPadding) / 1600,
    (window.innerHeight - verticalSpace) / 900,
    maxScale
  );

  document.documentElement.style.setProperty("--deck-scale", String(Math.max(scale, 0.42)));
}

function syncPartProgressColor(activeSlide) {
  const partClass = ["deck-part-1", "deck-part-2", "deck-part-3", "deck-part-4"]
    .find((className) => activeSlide.classList.contains(className));

  if (!partClass) {
    document.body.removeAttribute("data-current-part");
    return;
  }

  document.body.dataset.currentPart = partClass.replace("deck-part-", "part-");
}

slides.forEach((slide) => {
  const purpose = slide.dataset.purpose;
  const head = slide.querySelector(".slide-head");
  if (!purpose || !head || head.querySelector(".purpose-note")) {
    return;
  }

  const note = document.createElement("p");
  note.className = "purpose-note";
  note.textContent = purpose;
  head.append(note);
});

slides.forEach((slide) => {
  const title = slide.dataset.title;
  const items = slideContext[title];
  const head = slide.querySelector(".slide-head");
  if (!items || !head || head.querySelector(".section-context")) {
    return;
  }

  const context = document.createElement("div");
  context.className = "section-context";
  context.innerHTML = items.map(([label, text]) => `
    <article>
      <strong>${label}</strong>
      <span>${text}</span>
    </article>
  `).join("");
  head.after(context);
});

function isInteractiveTarget(target) {
  return Boolean(
    target.closest(".fullscreen-btn, [data-go-slide], .part-nav, .hover-reveal, .topbar, .focus-chip")
  );
}

function activateSlideJump(target) {
  const targetIndex = Number.parseInt(target.dataset.goSlide ?? "", 10);
  if (!Number.isNaN(targetIndex)) {
    updateSlide(targetIndex);
  }
}

function updateSlide(index) {
  currentIndex = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentIndex);
    slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
  });

  syncPartProgressColor(slides[currentIndex]);

  const total = slides.length;
  counter.textContent = `${currentIndex + 1} / ${total}`;
  progressBar.style.width = `${((currentIndex + 1) / total) * 100}%`;

  const activeTitle = slides[currentIndex].dataset.title;
  document.title = activeTitle
    ? `${activeTitle} | 비전공자 대표를 위한 개발 소통 · 채용 · 외주 실패 방지`
    : "비전공자 대표를 위한 개발 소통 · 채용 · 외주 실패 방지";

  history.replaceState(null, "", `#slide-${currentIndex + 1}`);
}

function goNext() {
  updateSlide(currentIndex + 1);
}

function goPrev() {
  updateSlide(currentIndex - 1);
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    return;
  }

  await document.exitFullscreen();
}

function syncFullscreenState() {
  const isFullscreen = Boolean(document.fullscreenElement);
  document.body.classList.toggle("is-fullscreen", isFullscreen);
  fullscreenToggle.textContent = isFullscreen ? "전체화면 종료" : "전체화면";
  syncPreviewScale();
}

function createInlineMap(focus) {
  const meta = mapMeta[focus] || mapMeta.frontend;
  const wrapper = document.createElement("aside");
  wrapper.className = "inline-mini-map";
  wrapper.innerHTML = `
    <div class="persistent-map-card explainer-slide" data-focus="${focus}">
      <p class="persistent-map-label">현재 설명 위치</p>
      <div class="persistent-map-head">
        <strong>${meta.title}</strong>
        <span>${meta.subtitle}</span>
      </div>
      <svg class="persistent-map-figure" viewBox="30 30 850 350" aria-hidden="true">
        <defs>
          <marker id="inline-arrow-soft-${focus}" viewBox="0 0 16 16" refX="12" refY="8" markerWidth="9" markerHeight="9" orient="auto">
            <path d="M4,4 L12,8 L4,12 Z"></path>
          </marker>
        </defs>
        <g class="diagram-server">
          <rect x="54" y="42" width="642" height="316" rx="38"></rect>
          <text x="94" y="88">서버</text>
        </g>
        <g class="diagram-node node-frontend">
          <rect x="98" y="138" width="188" height="86" rx="24"></rect>
          <text x="192" y="187">프런트</text>
        </g>
        <g class="diagram-node node-backend">
          <rect x="410" y="138" width="188" height="86" rx="24"></rect>
          <text x="504" y="187">백엔드</text>
        </g>
        <g class="diagram-node node-db">
          <rect x="252" y="258" width="188" height="74" rx="22"></rect>
          <text x="346" y="302">DB</text>
        </g>
        <g class="diagram-link link-api">
          <path class="flow-line" d="M292 174 H382"></path>
          <path class="flow-tip" d="M382 166 L404 174 L382 182"></path>
          <path class="flow-line" d="M404 188 H314"></path>
          <path class="flow-tip" d="M314 180 L292 188 L314 196"></path>
          <text x="348" y="142">API</text>
        </g>
        <g class="diagram-link link-db">
          <line x1="502" y1="224" x2="438" y2="258" marker-end="url(#inline-arrow-soft-${focus})"></line>
        </g>
        <g class="diagram-node node-git">
          <rect x="560" y="258" width="106" height="74" rx="22"></rect>
          <text x="613" y="296">Git</text>
        </g>
        <g class="diagram-external node-outside">
          <rect x="748" y="142" width="118" height="108" rx="28"></rect>
          <text x="807" y="186">외부</text>
        </g>
        <g class="diagram-link link-deploy">
          <line x1="696" y1="182" x2="748" y2="182" marker-end="url(#inline-arrow-soft-${focus})"></line>
          <text x="719" y="142">배포</text>
        </g>
      </svg>
      <p class="persistent-map-caption">${mapCopy[focus] || mapCopy.frontend}</p>
      <div class="persistent-map-points">
        <article>
          <strong>지금 보는 것</strong>
          <span>${meta.subtitle}</span>
        </article>
        <article>
          <strong>대표 질문</strong>
          <span>${meta.ask}</span>
        </article>
        <article>
          <strong>체크 기준</strong>
          <span>${meta.note}</span>
        </article>
      </div>
    </div>
  `;
  return wrapper;
}

miniMapSlides.forEach((slide) => {
  const focus = slide.dataset.mapFocus || "frontend";
  const map = createInlineMap(focus);
  const head = slide.querySelector(".slide-head");
  const splitLayout = document.createElement("div");
  splitLayout.className = "map-split-layout";

  const main = document.createElement("div");
  main.className = "map-split-main";

  splitLayout.append(map, main);

  if (head?.nextSibling) {
    slide.insertBefore(splitLayout, head.nextSibling);
  } else if (head) {
    slide.append(splitLayout);
  } else {
    slide.prepend(splitLayout);
  }

  while (splitLayout.nextSibling) {
    main.append(splitLayout.nextSibling);
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(key)) {
    event.preventDefault();
    goNext();
    return;
  }

  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(key)) {
    event.preventDefault();
    goPrev();
    return;
  }

  if (key === "Home") {
    event.preventDefault();
    updateSlide(0);
    return;
  }

  if (key === "End") {
    event.preventDefault();
    updateSlide(slides.length - 1);
    return;
  }

  if (key.toLowerCase() === "f") {
    event.preventDefault();
    toggleFullscreen();
    return;
  }

  if (key === "Escape" && document.fullscreenElement) {
    event.preventDefault();
    document.exitFullscreen();
  }
});

fullscreenToggle.addEventListener("click", () => {
  toggleFullscreen();
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (isInteractiveTarget(target)) {
    return;
  }

  if (target.closest(".slide")) {
    goNext();
  }
});

slideJumpTargets.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    activateSlideJump(button);
  });

  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateSlideJump(button);
    }
  });
});

explainerSlides.forEach((slide) => {
  const chips = Array.from(slide.querySelectorAll(".focus-chip"));

  chips.forEach((chip) => {
    const focusTarget = chip.dataset.focusTarget;
    if (!focusTarget) {
      return;
    }

    const activate = () => {
      slide.dataset.focus = focusTarget;
      chips.forEach((candidate) => {
        candidate.classList.toggle("is-active", candidate === chip);
      });
    };

    chip.addEventListener("mouseenter", activate);
    chip.addEventListener("focus", activate);
    chip.addEventListener("click", (event) => {
      event.preventDefault();
      activate();
    });
  });
});

document.addEventListener("fullscreenchange", syncFullscreenState);
window.addEventListener("resize", syncPreviewScale);

document.addEventListener(
  "wheel",
  (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (isInteractiveTarget(target)) {
      return;
    }

    if (!target.closest(".slide")) {
      return;
    }

    event.preventDefault();

    if (wheelLocked) {
      return;
    }

    wheelLocked = true;
    if (event.deltaY < 0) {
      goPrev();
    } else if (event.deltaY > 0) {
      goNext();
    }

    window.setTimeout(() => {
      wheelLocked = false;
    }, 420);
  },
  { passive: false }
);

window.addEventListener("hashchange", () => {
  if (location.hash.startsWith("#slide-")) {
    const parsed = Number.parseInt(location.hash.replace("#slide-", ""), 10);
    if (!Number.isNaN(parsed)) {
      updateSlide(parsed - 1);
    }
  }
});

if (location.hash.startsWith("#slide-")) {
  const parsed = Number.parseInt(location.hash.replace("#slide-", ""), 10);
  if (!Number.isNaN(parsed)) {
    currentIndex = Math.max(0, Math.min(parsed - 1, slides.length - 1));
  }
}

updateSlide(currentIndex);
syncFullscreenState();
syncPreviewScale();

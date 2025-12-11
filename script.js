document.addEventListener("DOMContentLoaded", () => {
  // all carousels
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const prevBtn = carousel.querySelector(".arrow.prev");
    const nextBtn = carousel.querySelector(".arrow.next");

    const slots = Array.from(track.children);
    let activeIndex = slots.findIndex((s) => s.classList.contains("active"));
    if (activeIndex === -1) activeIndex = Math.floor(slots.length / 2);

    // update the slot states
    function updateSlots() {
      slots.forEach((s, i) => {
        s.classList.remove("active", "left", "right");
        if (i === activeIndex) s.classList.add("active");
        else if (i < activeIndex) s.classList.add("left");
        else s.classList.add("right");
      });
    }

    updateSlots();

    // click arrows
    prevBtn &&
      prevBtn.addEventListener("click", () => {
        activeIndex = Math.max(0, activeIndex - 1);
        updateSlots();
      });

    nextBtn &&
      nextBtn.addEventListener("click", () => {
        activeIndex = Math.min(slots.length - 1, activeIndex + 1);
        updateSlots();
      });

    // keyboard arrows
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        activeIndex = Math.max(0, activeIndex - 1);
        updateSlots();
      } else if (e.key === "ArrowRight") {
        activeIndex = Math.min(slots.length - 1, activeIndex + 1);
        updateSlots();
      }
    });

    // swipe on mobile
    let touchStartX = null;
    track.addEventListener(
      "touchstart",
      (ev) => {
        touchStartX = ev.touches[0].clientX;
      },
      { passive: true }
    );

    track.addEventListener("touchend", (ev) => {
      if (touchStartX === null) return;
      const dx = ev.changedTouches[0].clientX - touchStartX;

      if (Math.abs(dx) > 40) {
        if (dx < 0) activeIndex = Math.min(slots.length - 1, activeIndex + 1);
        else activeIndex = Math.max(0, activeIndex - 1);

        updateSlots();
      }

      touchStartX = null;
    });
  });

  /* -----------------------------
     hero title typewriter
  ----------------------------- */

  const el = document.querySelector(".hero-subtitle-text");

  if (el) {
    const phrases = [
      "Is it online culture?",
      "Is it resale markets?",
      "Or is Gen Z redefining fashion?",
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeSpeed = 90;
    const deleteSpeed = 60;

    function typeLoop() {
      const current = phrases[phraseIndex];

      if (!deleting) {
        // typing
        charIndex++;
        el.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1400);
          return;
        }

        setTimeout(typeLoop, typeSpeed);
      } else {
        // deleting
        charIndex--;
        el.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, 500);
          return;
        }

        setTimeout(typeLoop, deleteSpeed);
      }
    }

    setTimeout(typeLoop, 600);
  }

  /* -----------------------------
     vega chart (scroll + draw)
  ----------------------------- */

  const chartTarget = document.querySelector("#comparisonTrendChart");

  if (chartTarget && window.vegaEmbed) {
    vegaEmbed("#comparisonTrendChart", {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",

      data: { url: "./assets/google_trends_thrifting_clean.csv" },

      background: "transparent",

      transform: [
        {
          fold: ["Thrift", "vintage clothing", "Poshmark"],
          as: ["Trend", "Interest"],
        },
      ],

      mark: { type: "line", point: true, strokeWidth: 2 },

      encoding: {
        x: {
          field: "Month",
          type: "temporal",
          // we show "Year" in HTML instead
          title: "How Fashion Searches Changed - Thrift Takes the Lead",
          axis: {
            format: "%Y",
            tickCount: "year",
          },
        },
        y: {
          field: "Interest",
          type: "quantitative",
          // we show "Search interest (0 to 100)" in HTML instead
          title: null,
        },
        color: {
          field: "Trend",
          type: "nominal",
          // custom legend lives in HTML so hide built-in legend/title
          title: null,
          legend: null,
          // lock colors to match static legend
          scale: {
            domain: ["Poshmark", "Thrift", "vintage clothing"],
            range: ["#8AAA6F", "#f4a84f", "#f0727d"],
          },
        },
        tooltip: [
          { field: "Month", type: "temporal", title: "Month" },
          { field: "Trend", type: "nominal", title: "Search term" },
          { field: "Interest", type: "quantitative", title: "Search interest" },
        ],
      },

      width: 1800,
      height: 360,

      config: {
        view: { stroke: "transparent" },

        axis: {
          labelColor: "#fcefe9",
          titleColor: "#fcefe9",
          gridColor: "rgba(252,239,233,0.2)",
          domainColor: "rgba(252,239,233,0.4)",
          tickColor: "rgba(252,239,233,0.4)",
          labelFont: "Bricolage Grotesque",
          titleFont: "Bricolage Grotesque",
        },

        legend: {
          labelColor: "#fcefe9",
          titleColor: "#fcefe9",
        },

        title: {
          color: "#fcefe9",
          font: "Bricolage Grotesque",
          fontSize: 16,
          fontWeight: 600,
        },
      },
    }).then(() => {
      // reveal chart lines when in view
      function reveal() {
        const rect = chartTarget.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          chartTarget.classList.add("draw-lines");
          window.removeEventListener("scroll", reveal);
        }
      }

      window.addEventListener("scroll", reveal);
      reveal();
    });
  }
});
/* ============================
   Smooth Scroll to First Section
   ============================ */

   function scrollToSection() {
    const nextSection = document.querySelector(".history-root");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  
  /* ============================
   Cross-Dissolve Word Swap
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
  const wordEl = document.querySelector(".rotating-word");

  if (!wordEl) return;

  const words = ["Thrifted.", "Sustained.", "Slayed."];
  let index = 0;

  function swapWord() {
    // fade out
    wordEl.classList.add("fade-out");

    setTimeout(() => {
      // change word
      index = (index + 1) % words.length;
      wordEl.textContent = words[index];

      // fade in
      wordEl.classList.remove("fade-out");
      wordEl.classList.add("fade-in");

      // remove fade-in class after animation so it can repeat
      setTimeout(() => wordEl.classList.remove("fade-in"), 800);
    }, 800); // matches CSS transition
  }

  setInterval(swapWord, 2300);
});


// Fashion history section
d3.csv("./assets/fashion_history.csv").then((fashion) => {
  const n = fashion.length;
  let current = 0; // active index

  const root = document.getElementsByClassName("history-root")[0];

  const cardsEl = root.querySelector(".history-cards");
  const yearEl = root.querySelector(".history-year");
  const subEl = root.querySelector(".history-sub");
  const prevBtn = root.querySelector(".history-prev");
  const nextBtn = root.querySelector(".history-next");

  const offsets = [-2, -1, 0, 1, 2]; // 5 visible cards

  function render() {
    cardsEl.innerHTML = "";

    offsets.forEach((off) => {
      const idx = (current + off + n) % n;
      const data = fashion[idx];

      const card = document.createElement("div");
      card.className = "history-card";
      card.style.setProperty("--offset", off);

      if (off === 0) {
        // ACTIVE (green) card → image inside
        card.dataset.active = "true";
        if (data.image && String(data.image).trim() !== "") {
          const img = document.createElement("img");
          img.src = data.image;
          img.alt = data.title || data.year || "Fashion era";
          card.appendChild(img);
        }
      } else {
        // side cards → just year text
        card.textContent = data.year ?? "";
      }

      cardsEl.appendChild(card);
    });

    const active = fashion[current];
    // year + title shown UNDER the cards
    yearEl.textContent = active.year ?? "";
    subEl.textContent = active.title ?? "";
  }

  prevBtn.onclick = () => {
    current = (current - 1 + n) % n;
    render();
  };

  nextBtn.onclick = () => {
    current = (current + 1) % n;
    render();
  };

  render();
});

// media coverage visualization
d3.csv("./assets/media_fashion@2.csv").then((mediaRaw) => {
  mediaClean = mediaRaw
    .filter((d) => d["Year "] && d.tite)
    .map((d) => ({
      year: +d["Year "],
      title: d.tite,
      description: d["describption "],
      link: (d["link "] || "").trim(),
    }))
    .sort((a, b) => a.year - b.year);

  const root = document.querySelector(".media-timeline-container");

  const hoverCard = document.querySelector(".media-hover-card");
  root.append(hoverCard);

  // Sort by year
  const data = mediaClean.slice().sort((a, b) => a.year - b.year);

  // Timeline container
  const timeline = document.createElement("div");
  timeline.className = "media-horizontal-timeline";
  root.append(timeline);

  const spacing = 80;
  const baseOffset = 40;

  const totalWidth = baseOffset + data.length * spacing;
  timeline.style.width = `${totalWidth}px`;

  data.forEach((d, i) => {
    const xPos = baseOffset + i * spacing;

    // Circle
    const point = document.createElement("div");
    point.className = "media-circle-point";
    point.style.left = xPos + "px";

    // Year label
    const label = document.createElement("div");
    label.className = "media-year-label";
    label.textContent = d.year;
    label.style.left = xPos - 10 + "px";

    // Hover: show media card
    point.onmouseenter = (event) => {
      hoverCard.innerHTML = `
        <div class="media-card-title">${d.title}</div>
        <div class="media-card-description">${d.description}</div>
      `;

      // Media preview
      if (d.link) {
        const link = d.link.trim();

        if (link.includes("youtube.com") || link.includes("youtu.be")) {
          let embed = link
            .replace("watch?v=", "embed/")
            .replace("youtu.be/", "www.youtube.com/embed/");
          hoverCard.innerHTML += `
            <iframe src="${embed}" allowfullscreen
            style="width:100%;height:180px;border:none;border-radius:10px;margin-top:6px;"></iframe>
          `;
        } else {
          hoverCard.innerHTML += `
            <img src="${link}"
            style="width:100%;max-height:180px;object-fit:cover;border-radius:10px;margin-top:6px;">
          `;
        }
      }

      hoverCard.style.display = "block";
      hoverCard.style.left = event.clientX + 20 + "px";
      hoverCard.style.top = event.clientY - 20 + "px";
    };

    point.onmousemove = (event) => {
      hoverCard.style.left = event.clientX + 20 + "px";
      hoverCard.style.top = event.clientY - 20 + "px";
    };

    point.onmouseleave = () => {
      hoverCard.style.display = "none";
    };

    timeline.append(point);
    timeline.append(label);
  });
});

// hashtag chart
const hashtagChartTarget = document.querySelector("#hashtagChart");
if (hashtagChartTarget && window.vegaEmbed) {
  const hashtagSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { url: "./assets/TikTokHashtagCounts.csv" },
    background: "transparent",
    // layered chart to match Observable design
    layer: [
      // main bars - single accent color to match site
      {
        mark: {
          type: "bar",
          cornerRadiusTopLeft: 4,
          cornerRadiusTopRight: 4,
    
        },
        encoding: {
          x: {
            field: "Hashtags",
            type: "nominal",
            title: "Sustainable Fashion Hashtags",
            axis: { labelAngle: -45 },
            // sort by number of posts (descending)
            sort: "-y",
          },
          y: {
            field: "Number of Posts on Tiktok",
            type: "quantitative",
            title: "Number of TikTok posts",

            axis: { format: ".2s" },
          },
          // all bars accent green
          color: { value: "#9bbf7c" },
          tooltip: [
            { field: "Hashtags", type: "nominal", title: "Hashtag" },
            {
              field: "Number of Posts on Tiktok",
              type: "quantitative",
              title: "Posts",
              format: ",",
            },
          ],
        },
      },

      // number labels above bars
      {
        mark: {
          type: "text",
          align: "center",
          baseline: "bottom",
          dy: -4,
          fill: "#fcba03",
          fontWeight: 600,
        },
        encoding: {
          x: {
            field: "Hashtags",
            type: "nominal",
            sort: "-y",
          },
          y: {
            field: "Number of Posts on Tiktok",
            type: "quantitative",
          },
          text: {
            field: "Number of Posts on Tiktok",
            type: "quantitative",
            format: ".2s",
          },
        },
      },

      // hashtag labels inside bars
      {
        mark: {
          type: "text",
          align: "center",
          baseline: "top",
          dy: 12,
          fill: "#171a18",
          fontSize: 11,
          fontWeight: 600,
        },
        encoding: {
          x: {
            field: "Hashtags",
            type: "nominal",
            sort: "-y",
          },
          y: {
            field: "Number of Posts on Tiktok",
            type: "quantitative",
          },
          text: {
            field: "Hashtags",
            type: "nominal",
          },
        },
      },
    ],
    width: "container",
    height: 400,
    config: {
      view: { stroke: "transparent" },
      axis: {
        labelColor: "#fcefe9",
        titleColor: "#fcefe9",
        gridColor: "rgba(252,239,233,0.2)",
        domainColor: "rgba(252,239,233,0.4)",
        tickColor: "rgba(252,239,233,0.4)",
        labelFont: "Bricolage Grotesque",
        titleFont: "Bricolage Grotesque",
      },
    },
  };
  vegaEmbed("#hashtagChart", hashtagSpec);
}

// sustainable trends chart
const sustainableTrendsChartTarget = document.querySelector(
  "#sustainableTrendsChart"
);
if (sustainableTrendsChartTarget && window.vegaEmbed) {
  const sustainableTrendsSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { url: "./assets/sustainable_fashion_trends_2024.csv" },
    background: "transparent",
    mark: {
      type: "line",
      color: "#9bbf7c",        // line color
      point: {
        size: 80,              // BIGGER DOTS
        filled: true,
        color: "#9bbf7c",      // dot fill color
        stroke: "#d6b673",    
        strokeWidth: 1.5
      }
    },
    
    transform: [
      { filter: 'datum.Eco_Friendly_Manufacturing === "Yes"' },
      { aggregate: [{ op: "count", as: "EcoCount" }], groupby: ["Year"] },
    ],
    encoding: {
      x: { field: "Year", type: "ordinal", title: "Year" },
      y: {
        field: "EcoCount",
        type: "quantitative",
        title: "Number of Eco-Friendly Brands",
      },
      tooltip: [
        { field: "Year", type: "ordinal", title: "Year" },
        {
          field: "EcoCount",
          type: "quantitative",
          title: "Eco-Friendly Count",
        },
      ],
    },
    width: "container",
    height: 400,
    config: {
      view: { stroke: "transparent" },
      axis: {
        labelColor: "#fcefe9",
        titleColor: "#fcefe9",
        gridColor: "rgba(252,239,233,0.2)",
        domainColor: "rgba(252,239,233,0.4)",
        tickColor: "rgba(252,239,233,0.4)",
        labelFont: "Bricolage Grotesque",
        titleFont: "Bricolage Grotesque",
      },
    },
  };
  vegaEmbed("#sustainableTrendsChart", sustainableTrendsSpec);
}

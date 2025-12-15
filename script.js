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
  const mediaClean = mediaRaw
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
      color: "#9bbf7c", // line color
      point: {
        size: 80, // BIGGER DOTS
        filled: true,
        color: "#9bbf7c", // dot fill color
        stroke: "#d6b673",
        strokeWidth: 1.5,
      },
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
          title: "Eco-Friendly Brands Count",
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

/* ============================
   Material images (for tooltip)
   ============================ */

const materialImages = {
  "Bamboo Fabric": "./assets/materials/bamboo.jpeg",
  "Organic Cotton": "./assets/materials/cotton.jpg",
  Hemp: "./assets/materials/hemp.jpg",
  "Vegan Leather": "./assets/materials/leather.jpg",
  "Recycled Polyester": "./assets/materials/polyester.jpg",
  Tencel: "./assets/materials/tencel.jpg",
};

/* ============================
   Sustainable Materials vs Carbon Impact
   ============================ */

(() => {
  const container = document.getElementById("materialsChart");
  if (!container || !window.d3) return;

  // clear container (safe if reloaded)
  container.innerHTML = "";

  d3.csv("./assets/material.csv").then((raw) => {
    // expected headers: Brand_Name, Material_Type, Carbon_Footprint_MT
    const cleaned = raw
      .map((d) => ({
        Brand_Name: (d.Brand_Name || "").trim(),
        Material_Type: (d.Material_Type || "").trim(),
        Carbon_Footprint_MT: +d.Carbon_Footprint_MT,
      }))
      .filter(
        (d) =>
          d.Material_Type &&
          d.Brand_Name &&
          Number.isFinite(d.Carbon_Footprint_MT)
      );

    // aggregate per material
    const materialStats = d3
      .rollups(
        cleaned,
        (v) => ({
          // count UNIQUE brands per material
          brands: new Set(v.map((d) => d.Brand_Name)).size,
          avgCarbon: d3.mean(v, (d) => d.Carbon_Footprint_MT),
        }),
        (d) => d.Material_Type
      )
      .map(([Material_Type, values]) => ({
        Material_Type,
        brands: values.brands,
        avgCarbon: values.avgCarbon,
      }))
      // most-used first
      .sort((a, b) => d3.descending(a.brands, b.brands));

    const width = 900;
    const height = 460;
    const margin = { top: 30, right: 30, bottom: 90, left: 80 };

    const defaultColor = "#6f8a5c";
    const hoverColor = "#9bbf7c";

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);

    const x = d3
      .scaleBand()
      .domain(materialStats.map((d) => d.Material_Type))
      .range([margin.left, width - margin.right])
      .padding(0.22);

    const yMax = d3.max(materialStats, (d) => d.avgCarbon) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // axes
    const xAxis = (g) =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call((g) =>
          g.select(".domain").attr("stroke", "rgba(252,239,233,0.4)")
        )
        .call((g) =>
          g
            .selectAll("text")
            .style("font-size", "11px")
            .style("fill", "#fcefe9")
            .attr("transform", "rotate(-20)")
            .style("text-anchor", "end")
        )
        .call((g) =>
          g.selectAll("line").attr("stroke", "rgba(252,239,233,0.4)")
        );

    const yAxis = (g) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call((g) =>
          g.select(".domain").attr("stroke", "rgba(252,239,233,0.4)")
        )
        .call((g) =>
          g.selectAll("line").attr("stroke", "rgba(252,239,233,0.4)")
        )
        .call((g) =>
          g
            .selectAll("text")
            .style("font-size", "11px")
            .style("fill", "#fcefe9")
        );

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    // axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 28)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "#fcefe9")
      .text("Material type");

    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", 26)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "#fcefe9")
      .text("Average CO₂ footprint (per MT)");

    // tooltip panel (below chart)
    const tooltip = document.createElement("div");
    tooltip.style.display = "flex";
    tooltip.style.flexDirection = "column";
    tooltip.style.alignItems = "center";
    tooltip.style.justifyContent = "center";
    tooltip.style.textAlign = "center";
    tooltip.style.margin = "14px auto 0";
    tooltip.style.marginTop = "14px";
    tooltip.style.padding = "10px 12px";
    tooltip.style.borderRadius = "12px";
    tooltip.style.border = "1px solid rgba(252,239,233,0.25)";
    tooltip.style.background = "rgba(34,39,34,0.85)";
    tooltip.style.color = "#fcefe9";
    tooltip.style.fontSize = "15px";
    tooltip.style.maxWidth = "900px";
    tooltip.textContent = "Hover over a bar to see material details.";
    container.appendChild(tooltip);
    tooltip.style.display = "flex";
    tooltip.style.justifyContent = "center";
    tooltip.style.textAlign = "center";

    // bars
    const bars = svg
      .append("g")
      .selectAll("rect")
      .data(materialStats)
      .join("rect")
      .attr("x", (d) => x(d.Material_Type))
      .attr("y", (d) => y(d.avgCarbon))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.avgCarbon))
      .attr("rx", 4)
      .attr("fill", defaultColor)
      .on("mouseenter", (event, d) => {
        bars.attr("fill", defaultColor);
        d3.select(event.currentTarget).attr("fill", hoverColor);

        tooltip.innerHTML = `
  <div style="display:flex;gap:14px;align-items:center;">
    <img 
      src="${materialImages[d.Material_Type] || ""}" 
      alt="${d.Material_Type}"
      style="
        width:80px;
        height:80px;
        object-fit:cover;
        border-radius:10px;
        flex-shrink:0;
      "
    />
    <div>
      <strong>${d.Material_Type}</strong><br>
      Brands using this material: <b>${d.brands}</b><br>
      Avg CO₂ footprint: <b>${d.avgCarbon.toFixed(1)}</b>
    </div>
  </div>
`;
      })
      .on("mouseleave", () => {
        bars.attr("fill", defaultColor);
        tooltip.textContent = "Hover over a bar to see material details.";
      });

    // labels above bars: number of brands
    svg
      .append("g")
      .selectAll("text.label")
      .data(materialStats)
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.Material_Type) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.avgCarbon) - 8)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#d6b673")
      .text((d) => `${d.brands} brands`);
  });
})();

/* =========================================================
   Go Sustainable IRL: Thrift Near You (Canada Map) — NEW
   NO DEFAULT LOCATION (user must click or search)
   FIXED: circles shrink on zoom without breaking render
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("thriftMap");
  const nearestMount = document.getElementById("thriftNearest");
  const btnUseLoc = document.getElementById("thriftUseLocation");
  const input = document.getElementById("thriftAddress");
  const btnSearch = document.getElementById("thriftSearch");

  // If thrift section isn't present on the page, do nothing
  if (!mount || !nearestMount) return;

  // Safety checks
  if (!window.d3) {
    console.warn("D3 not found. Make sure d3.v7 is included before script.js");
    return;
  }
  if (!window.L) {
    console.warn(
      "Leaflet not found. Add: <script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'></script>"
    );
    return;
  }

  const WIDTH = 900;
  const HEIGHT = 560;

  // NO DEFAULT LOCATION
  let myLocation = null;

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  const haversineKm = (a, b) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(x));
  };

  const getNearest = (points, me, n = 10) =>
    points
      .map((p) => ({ ...p, km: haversineKm(me, p) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, n);

  const renderEmptyState = () => {
    nearestMount.innerHTML = `
      <h3 class="thrift-list-title">Nearest thrift shops</h3>
      <p class="thrift-muted">Click “Use my current location” or search a city to see results.</p>
    `;
    mount.innerHTML = `
      <div class="thrift-empty">
        Choose a location to load the map.
      </div>
    `;
  };

  const renderNearestList = (nearest) => {
    nearestMount.innerHTML = `
      <h3 class="thrift-list-title">Nearest thrift shops</h3>
      <ol class="thrift-ol">
        ${nearest
          .map(
            (d) => `
          <li>
            <strong>${escapeHtml(d.name)}</strong><br>
            <span class="thrift-muted">${escapeHtml(
              [d.street, d.city].filter(Boolean).join(", ") ||
                "Exact address not available"
            )}</span><br>
            <span class="thrift-dist">${d.km.toFixed(2)} km</span>
          </li>`
          )
          .join("")}
      </ol>
    `;
  };

  async function loadData() {
    const thriftGeo = await d3.json("./assets/canada_thrift.geojson");
    const feats = thriftGeo.features ?? [];

    const thriftPoints = feats
      .map((f) => {
        const coords = f?.geometry?.coordinates;
        if (!coords || coords.length < 2) return null;

        const [lon, lat] = coords;
        const p = f.properties ?? {};

        return {
          lat,
          lon,
          name:
            p.name ||
            p.operator ||
            p.brand ||
            p.shop ||
            p["@id"] ||
            "Thrift shop",
          city: p.city || p["addr:city"] || "",
          street: p.street || p["addr:street"] || "",
        };
      })
      .filter((d) => d && Number.isFinite(d.lat) && Number.isFinite(d.lon));

    return { thriftPoints };
  }

  function renderMap({ thriftPoints }) {
    if (!myLocation) {
      renderEmptyState();
      return;
    }

    // rebuild the container each time to avoid "Map container is already initialized"
    mount.innerHTML = `
      <div class="thrift-map-wrap">
        <div id="thriftLeafletMap" class="thrift-leaflet-map"></div>
      </div>
    `;

    const mapDiv = document.getElementById("thriftLeafletMap");
    if (!mapDiv || !window.L) return;

    const nearest = getNearest(thriftPoints, myLocation, 10);
    renderNearestList(nearest);

    const nearestKey = new Set(
      nearest.map((d) => `${d.lat},${d.lon},${d.name}`)
    );
    const isNearest = (d) => nearestKey.has(`${d.lat},${d.lon},${d.name}`);

    const map = L.map(mapDiv, {
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // You marker
    const youMarker = L.circleMarker([myLocation.lat, myLocation.lon], {
      radius: 7,
      color: "#ffffff",
      weight: 2,
      fillColor: "#2a3029",
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup("You");

    // Thrift markers
    thriftPoints.forEach((d) => {
      const near = isNearest(d);

      const marker = L.circleMarker([d.lat, d.lon], {
        radius: near ? 7 : 4,
        color: "#2a3029",
        weight: near ? 1.2 : 0.6,
        fillColor: "#9bc07e",
        fillOpacity: near ? 0.95 : 0.55,
      }).addTo(map);

      const km = haversineKm(myLocation, d);
      const address =
        [d.street, d.city].filter(Boolean).join(", ") ||
        "Exact address not available";

      marker.bindPopup(
        `<strong>${escapeHtml(d.name)}</strong><br>${escapeHtml(
          address
        )}<br><strong>${km.toFixed(2)} km</strong>`
      );
    });

    // Fit bounds to "You" + nearest 10
    const boundsPts = [
      [myLocation.lat, myLocation.lon],
      ...nearest.map((d) => [d.lat, d.lon]),
    ];

    const bounds = L.latLngBounds(boundsPts);
    map.fitBounds(bounds, { padding: [30, 30] });

    // optional: open "You" popup
    // youMarker.openPopup();
  }

  async function useBrowserLocation() {
    return await new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  async function geocodeAddress(q) {
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
      encodeURIComponent(q);

    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (!data || !data.length) return null;

    return { lat: +data[0].lat, lon: +data[0].lon };
  }

  let cached = null;

  renderEmptyState();

  (async () => {
    try {
      cached = await loadData();
      // wait for user action (no default location)
    } catch (err) {
      mount.innerHTML = `<div class="thrift-error">Map failed to load: ${escapeHtml(
        err?.message || err
      )}</div>`;
      console.error(err);
    }
  })();

  btnUseLoc &&
    btnUseLoc.addEventListener("click", async () => {
      const loc = await useBrowserLocation();
      if (!loc) return;
      myLocation = loc;
      if (cached) renderMap(cached);
    });

  btnSearch &&
    btnSearch.addEventListener("click", async () => {
      const q = input?.value?.trim();
      if (!q) return;

      const loc = await geocodeAddress(q);
      if (!loc) return;

      myLocation = loc;
      if (cached) renderMap(cached);
    });

  input &&
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      btnSearch?.click();
    });
});

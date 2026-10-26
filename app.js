/* Char Map — curated characters (data.js) plus generated Greek and accented Latin. Escapes are computed, not looked up. */
(function () {
  "use strict";
  var $ = S3.$, $$ = S3.$$;
  var CATS = [["recent", "Recent"], ["all", "All"], ["arrows", "Arrows"], ["math", "Math"], ["currency", "Currency"], ["punctuation", "Punctuation & spaces"],
    ["box", "Box drawing"], ["symbols", "Symbols"], ["greek", "Greek"], ["latin", "Accented Latin"], ["arabic", "Arabic marks"]];
  var INVISIBLE = { 0xA0: "NBSP", 0x2009: "THIN", 0x200A: "HAIR", 0x2002: "ENSP", 0x2003: "EMSP", 0x202F: "NNBSP", 0x200B: "ZWSP", 0x200C: "ZWNJ", 0x200D: "ZWJ", 0x200E: "LRM", 0x200F: "RLM", 0xAD: "SHY", 0x20: "SP" };

  // ---------- named entities ----------
  var ENT = {};
  String(window.CM_ENTITIES || "").split(/\s+/).forEach(function (p) {
    var kv = p.split(":"); if (kv.length === 2 && !ENT[parseInt(kv[1], 16)]) ENT[parseInt(kv[1], 16)] = kv[0];
  });

  // ---------- generated sets ----------
  var GREEK = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"];
  function greek() {
    var out = [];
    GREEK.forEach(function (n, i) {
      if (!n) return;
      out.push({ c: String.fromCodePoint(0x391 + i), name: "greek capital letter " + n, kw: n });
      out.push({ c: String.fromCodePoint(0x3B1 + i), name: "greek small letter " + n, kw: n });
    });
    out.push({ c: "ς", name: "greek small letter final sigma", kw: "sigma" });
    out.push({ c: "ϑ", name: "greek theta symbol", kw: "theta" }, { c: "ϕ", name: "greek phi symbol", kw: "phi" }, { c: "ϖ", name: "greek pi symbol", kw: "pi" });
    return out;
  }
  var MARKS = { "̀": "grave", "́": "acute", "̂": "circumflex", "̃": "tilde", "̄": "macron", "̆": "breve", "̇": "dot above",
    "̈": "diaeresis", "̊": "ring above", "̋": "double acute", "̌": "caron", "̧": "cedilla", "̨": "ogonek" };
  var ENT_MARK = { grave: "grave", acute: "acute", circumflex: "circ", tilde: "tilde", diaeresis: "uml", "ring above": "ring", cedilla: "cedil" };
  var LATIN = "ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿĀāĂăĄąĆćĈĉĊċČčĎďĒēĖėĘęĚěĜĝĞğĠġĢģĪīĮįİĶķĹĺĻļĽľŃńŅņŇňŌōŐőŔŕŘřŚśŜŝŞşŠšŢţŤťŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž";
  var LATIN_EXTRA = [["Æ", "latin capital letter ae"], ["æ", "latin small letter ae"], ["Œ", "latin capital ligature oe"], ["œ", "latin small ligature oe"],
    ["ß", "latin small letter sharp s"], ["Ø", "latin capital letter o with stroke"], ["ø", "latin small letter o with stroke"], ["Ð", "latin capital letter eth"],
    ["ð", "latin small letter eth"], ["Þ", "latin capital letter thorn"], ["þ", "latin small letter thorn"], ["ı", "latin small letter dotless i"],
    ["Đ", "latin capital letter d with stroke"], ["đ", "latin small letter d with stroke"], ["Ł", "latin capital letter l with stroke"], ["ł", "latin small letter l with stroke"]];
  function latin() {
    var out = Array.from(LATIN).map(function (c) {
      var d = c.normalize("NFD"), base = d.charAt(0), mark = MARKS[d.slice(1)] || "accent";
      var upper = base !== base.toLowerCase();
      var ent = c.codePointAt(0) <= 0xFF && ENT_MARK[mark] ? base + ENT_MARK[mark] : null;
      return { c: c, name: "latin " + (upper ? "capital" : "small") + " letter " + base.toLowerCase() + " with " + mark, kw: base.toLowerCase() + " " + mark + " accent", ent: ent };
    });
    return out.concat(LATIN_EXTRA.map(function (x) { return { c: x[0], name: x[1], kw: "accent" }; }));
  }

  // ---------- build the table ----------
  var ALL = [], BY = new Map();
  function add(cat, x) {
    if (BY.has(x.c)) return;
    x.cat = cat; x.cp = x.c.codePointAt(0); x.i = ALL.length;
    if (x.ent) ENT[x.cp] = ENT[x.cp] || x.ent;
    x.nameW = x.name.toLowerCase().split(/[\s-]+/);
    x.kwW = normalize(x.kw || "").split(/\s+/).filter(Boolean);
    ALL.push(x); BY.set(x.c, x);
  }
  Object.keys(window.CM_DATA || {}).forEach(function (cat) {
    window.CM_DATA[cat].split("\n").forEach(function (line) {
      var p = line.split("|"); if (p.length < 2 || !p[0]) return;
      add(cat, { c: p[0], name: p[1], kw: p[2] || "" });
    });
  });
  greek().forEach(function (x) { add("greek", x); });
  latin().forEach(function (x) { add("latin", x); });

  // ---------- encodings ----------
  function hex(n, w) { return n.toString(16).toUpperCase().padStart(w || 4, "0"); }
  function info(c) {
    var cp = c.codePointAt(0), bytes = Array.from(new TextEncoder().encode(c));
    return {
      cp: "U+" + hex(cp),
      dec: String(cp),
      html: ENT[cp] ? "&" + ENT[cp] + ";" : "&#x" + hex(cp, 1) + ";",
      num: "&#" + cp + ";",
      css: "\\" + hex(cp, 1),
      js: cp > 0xFFFF ? "\\u{" + hex(cp, 1) + "}" : "\\u" + hex(cp),
      url: bytes.map(function (b) { return "%" + hex(b, 2); }).join(""),
      utf8: bytes.map(function (b) { return hex(b, 2); }).join(" ")
    };
  }
  function isMark(c) { return /^\p{M}$/u.test(c); }
  function glyph(c) { var cp = c.codePointAt(0); return INVISIBLE[cp] ? null : isMark(c) ? "◌" + c : c; }

  // ---------- search ----------
  function normalize(s) {
    return String(s).toLowerCase().replace(/[ً-ٰٟـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
  }
  function codepointQuery(q) {
    var m = /^(?:u\+|0x|\\u\{?|&#x)?([0-9a-f]{2,6})\}?;?$/i.exec(q.trim());
    // bare "2192" is a code point, bare "face" is a word
    if (!m || (!/^(u\+|0x|\\u|&#x)/i.test(q.trim()) && (m[1].length < 4 || !/\d/.test(m[1])))) return null;
    var cp = parseInt(m[1], 16);
    if (cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) return null;
    return String.fromCodePoint(cp);
  }
  function search(q, cat) {
    var pool = cat && cat !== "all" ? ALL.filter(function (x) { return x.cat === cat; }) : ALL;
    var raw = q.trim(); if (!raw) return pool;
    var out = [], direct = codepointQuery(raw);
    if (direct) out.push({ x: BY.get(direct) || { c: direct, name: "code point U+" + hex(direct.codePointAt(0)), kw: "", cat: "lookup", cp: direct.codePointAt(0) }, s: 1000 });
    var ent = /^&?([a-z][a-z0-9]*);?$/i.exec(raw);
    var qn = normalize(raw), tokens = qn.split(/\s+/).filter(Boolean);
    pool.forEach(function (x) {
      if (direct && x.c === direct) return;
      var score = 0;
      if (x.c === raw) score = 500;
      else if (ent && ENT[x.cp] === ent[1]) score = 400;
      else {
        for (var t = 0; t < tokens.length; t++) {
          var tok = tokens[t], s = 0;
          if (x.nameW.indexOf(tok) >= 0) s = 10;
          else if (x.nameW.some(function (w) { return w.indexOf(tok) === 0; })) s = 6;
          else if (x.kwW.some(function (w) { return w.indexOf(tok) === 0; })) s = 5;
          else if (ent && ENT[x.cp] && ENT[x.cp].toLowerCase().indexOf(tok) === 0) s = 4;
          if (!s) return;
          score += s;
        }
      }
      if (score) out.push({ x: x, s: score });
    });
    out.sort(function (a, b) { return b.s - a.s || a.x.name.length - b.x.name.length || a.x.i - b.x.i; });
    return out.map(function (o) { return o.x; });
  }

  // ---------- UI ----------
  var state = { cat: S3.store("charmap.cat") || "all", q: "", list: [], cur: null };
  if (!CATS.some(function (c) { return c[0] === state.cat; })) state.cat = "all";
  function recent() { return (S3.store("charmap.recent") || []).filter(function (c) { return typeof c === "string"; }); }
  var catsEl = $("#cats"), grid = $("#grid");
  CATS.forEach(function (c) {
    catsEl.appendChild(S3.h("button", { "aria-pressed": String(c[0] === state.cat), "data-c": c[0], onclick: function () { setCat(c[0]); } }, [c[1]]));
  });
  function setCat(c) {
    state.cat = c; S3.store("charmap.cat", c);
    $$("button", catsEl).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.c === c)); });
    render();
  }
  function tile(x, i) {
    var g = glyph(x.c), label = INVISIBLE[x.cp];
    return S3.h("button", { "class": "cm-c" + (label ? " cm-inv" : ""), role: "listitem", title: x.name + " (U+" + hex(x.cp) + ")", "aria-label": x.name, "data-i": i, dir: "ltr" }, [g || label]);
  }
  function render() {
    var list;
    if (state.cat === "recent") list = recent().map(function (c) { return BY.get(c) || { c: c, name: "code point U+" + hex(c.codePointAt(0)), kw: "", cp: c.codePointAt(0) }; });
    else list = search(state.q, state.cat);
    state.list = list;
    var catName = (CATS.filter(function (c) { return c[0] === state.cat; })[0] || CATS[1])[1];
    $("#title").textContent = state.q && state.cat !== "recent" ? "Results for “" + state.q + "”" : state.cat === "all" ? "All characters" : catName;
    $("#count").textContent = list.length.toLocaleString() + " characters";
    grid.innerHTML = "";
    var frag = document.createDocumentFragment();
    list.forEach(function (x, i) { frag.appendChild(tile(x, i)); });
    grid.appendChild(frag);
    $("#empty").hidden = list.length > 0;
    if (list.length) show(list[0]);
  }
  function show(x) {
    state.cur = x;
    var g = glyph(x.c), big = $("#big");
    big.textContent = g || INVISIBLE[x.cp]; big.classList.toggle("cm-inv", !g);
    $("#dname").textContent = x.name;
    var inf = info(x.c), rows = [["Character", x.c], ["Code point", inf.cp], ["HTML", inf.html], ["HTML (decimal)", inf.num], ["CSS", inf.css], ["JavaScript", inf.js], ["URL", inf.url], ["UTF-8 bytes", inf.utf8]];
    var tb = $("#codes"); tb.innerHTML = "";
    rows.forEach(function (r) {
      var shownVal = r[0] === "Character" ? (g || INVISIBLE[x.cp]) : r[1];
      tb.appendChild(S3.h("tr", null, [
        S3.h("th", { scope: "row" }, [r[0]]),
        S3.h("td", { "class": "mono", dir: "ltr" }, [shownVal]),
        S3.h("td", { "class": "cm-cp" }, [S3.h("button", { "class": "btn ghost icon small", "aria-label": "Copy " + r[0], title: "Copy", html: S3.icon("copy"), onclick: function () { S3.copy(r[1], r[0] + " copied"); } })])
      ]));
    });
  }
  function pick(x) {
    S3.copy(x.c, "Copied " + (glyph(x.c) || INVISIBLE[x.cp]));
    var col = $("#collect"); col.value += x.c;
    var r = recent().filter(function (c) { return c !== x.c; }); r.unshift(x.c); S3.store("charmap.recent", r.slice(0, 48));
    show(x); S3.done();
  }
  grid.addEventListener("click", function (e) { var b = e.target.closest(".cm-c"); if (b) pick(state.list[+b.dataset.i]); });
  grid.addEventListener("mouseover", function (e) { var b = e.target.closest(".cm-c"); if (b) show(state.list[+b.dataset.i]); });
  grid.addEventListener("focusin", function (e) { var b = e.target.closest(".cm-c"); if (b) show(state.list[+b.dataset.i]); });
  grid.addEventListener("keydown", function (e) {
    var b = e.target.closest(".cm-c"); if (!b) return;
    var i = +b.dataset.i, cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length || 1;
    var to = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols, Home: 0, End: state.list.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    var t = grid.children[Math.max(0, Math.min(state.list.length - 1, to))]; if (t) t.focus();
  });
  var q = $("#q");
  q.addEventListener("input", S3.debounce(function () { state.q = q.value; if (state.q && state.cat !== "all") setCat("all"); else render(); }, 100));
  q.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && state.list.length) { e.preventDefault(); pick(state.list[0]); }
    else if (e.key === "Escape") { q.value = ""; state.q = ""; render(); }
    else if (e.key === "ArrowDown" && grid.firstChild) { e.preventDefault(); grid.firstChild.focus(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); q.select(); }
  });
  $("#ccopy").addEventListener("click", function () { var v = $("#collect").value; if (v) S3.copy(v, "Collected text copied"); else S3.toast("Click some characters first", "error"); });
  $("#cclear").addEventListener("click", function () { $("#collect").value = ""; });
  render();

  window.S3_DEMO = function () { setCat("arrows"); show(BY.get("→")); $("#collect").value = "→ ★ € ∞ ✓"; };

  window.S3_SELFTEST = function () {
    var fails = [];
    function check(c, w) { if (!c) fails.push(w); }
    var a = info("→");
    check(a.cp === "U+2192" && a.dec === "8594" && a.html === "&rarr;" && a.css === "\\2192" && a.js === "\\u2192" && a.utf8 === "E2 86 92" && a.url === "%E2%86%92", "arrow encodings");
    var b = info("\u{1D538}");
    check(b.cp === "U+1D538" && b.js === "\\u{1D538}" && b.css === "\\1D538" && b.html === "&#x1D538;" && b.utf8 === "F0 9D 94 B8", "astral encodings");
    check(info("é").html === "&eacute;" && BY.get("é").name === "latin small letter e with acute", "latin generation");
    check(info("Ž").html === "&Zcaron;" && info("ő").html === "&#x151;", "latin entities");
    check(BY.get("λ").name === "greek small letter lambda" && info("λ").html === "&lambda;" && !BY.has("΢"), "greek generation");
    check(info(" ").html === "&nbsp;" && glyph(" ") === null, "nbsp");
    check(glyph("َ") === "◌َ", "combining mark shown on a dotted circle");
    check(search("rightwards arrow")[0].c === "→", "search by name");
    check(search("U+00A9")[0].c === "©" && search("0x2192")[0].c === "→", "search by code point");
    check(search("&rarr;")[0].c === "→" && search("hellip")[0].c === "…", "search by entity");
    check(search("€")[0].c === "€", "search by character");
    check(search("فتحة")[0].c === "َ", "Arabic keyword search");
    check(search("U+1F600")[0].c === "😀", "lookup outside the list");
    check(ALL.length > 500, "dataset size " + ALL.length);
    check(new Set(ALL.map(function (x) { return x.c; })).size === ALL.length, "unique characters");
    ALL.forEach(function (x) { if (Array.from(x.c).length !== 1) fails.push("not one code point: " + x.name); });
    if (fails.length) console.error("selftest: " + fails.join("; "));
    return fails.length === 0;
  };
})();

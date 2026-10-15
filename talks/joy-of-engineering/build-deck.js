// Builds "I Am Your Father" — a visual talk deck on AI, identity, and the joy of engineering.
// Usage: DECK_DEPS=<dir whose node_modules has pptxgenjs, sharp, react, react-dom, react-icons> node build-deck.js
const path = require("path");
// Resolve deps outside the repo so the site's own node_modules (Astro's sharp) doesn't shadow them.
const dep = require("module").createRequire(path.join(process.env.DECK_DEPS || __dirname, "noop.js"));
const pptxgen = dep("pptxgenjs");
const sharp = dep("sharp");
const React = dep("react");
const ReactDOMServer = dep("react-dom/server");
const { FaRunning, FaSearch, FaHandPaper, FaShoePrints, FaArrowRight } = dep("react-icons/fa");

const IMG = (f) => path.join(__dirname, "images", f);
const OUT = path.join(__dirname, "i-am-your-father.pptx");
const APPLY_THEME = process.env.APPLY_THEME_JS;

const THEME = {
  name: "Twin Suns",
  headFontFace: "Century Gothic",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0B0F1C", lt1: "FFFFFF", dk2: "151B30", lt2: "E9E4D8",
    accent1: "F2A541", accent2: "5BC0EB", accent3: "E4572E",
    accent4: "8FB8DE", accent5: "9BC53D", accent6: "C3A6FF",
    hlink: "5BC0EB", folHlink: "C3A6FF",
  },
};
const HEX = THEME.colors;

// Dark-to-clear scrims keep white text legible over full-bleed art.
async function scrim(name, dir) {
  const [x2, y2] = dir === "left" ? ["100%", "0%"] : ["0%", "0%"];
  const [x1, y1] = dir === "left" ? ["0%", "0%"] : ["0%", "100%"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
    <defs><linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="#0B0F1C" stop-opacity="0.92"/>
      <stop offset="0.45" stop-color="#0B0F1C" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#0B0F1C" stop-opacity="0"/>
    </linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/></svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function icon(Comp, color) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "I Am Your Father: AI, Identity, and the Joy of Engineering";
  pres.author = "Sunny Kolattukudy";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.333, H = 7.5;

  const SCRIM_LEFT = await scrim("left", "left");
  const SCRIM_BOTTOM = await scrim("bottom", "bottom");

  // ---------- Layouts ----------
  pres.defineSlideMaster({
    title: "Cinematic",
    background: { color: HEX.dk1 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: 0.7, y: 2.1, w: 6.4, h: 0.45, fontSize: 14, bold: true, color: C.accent1, charSpacing: 4, margin: 0, valign: "bottom" }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 2.6, w: 7.2, h: 2.3, fontSize: 44, bold: true, color: C.background1, align: "left", margin: 0, valign: "top", fontFace: THEME.headFontFace }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 5.0, w: 6.0, h: 1.2, fontSize: 20, color: C.background2, margin: 0, valign: "top" }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "Statement",
    background: { path: IMG("starfield.jpg") },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 1.2, y: 1.5, w: 10.9, h: 3.4, fontSize: 48, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, fontFace: THEME.headFontFace }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 1.7, y: 5.3, w: 9.9, h: 0.9, fontSize: 22, color: C.accent1, align: "center", valign: "top", margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "Title Only",
    background: { path: IMG("starfield.jpg") },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: 0.7, y: 0.45, w: 11.9, h: 0.4, fontSize: 13, bold: true, color: C.accent1, charSpacing: 4, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.85, w: 11.9, h: 0.9, fontSize: 36, bold: true, color: C.background1, align: "left", margin: 0, valign: "top", fontFace: THEME.headFontFace }, text: "" } },
    ],
    slideNumber: { x: 12.4, y: 6.95, w: 0.5, h: 0.3, fontSize: 10, color: "6B7290" },
  });

  const fullBleed = (s, img, dir = "left") => {
    s.addImage({ path: IMG(img), x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H }, objectName: "Background art" });
    s.addImage({ data: dir === "left" ? SCRIM_LEFT : SCRIM_BOTTOM, x: 0, y: 0, w: W, h: H, objectName: "Legibility scrim" });
  };
  const sec = (title) => pres.addSection({ title });
  // Subtitle for one-line titles, which would otherwise float far above the layout's body slot.
  const subUnder = (s, text, opts = {}) => s.addText(text, { x: 0.7, y: 3.75, w: 6.0, h: 0.9, fontSize: 20, color: C.background2, margin: 0, valign: "top", isTextBox: true, objectName: "Subtitle", ...opts });

  // ---------- 1. Title ----------
  sec("Opening");
  let s = pres.addSlide({ masterName: "Cinematic", sectionTitle: "Opening" });
  fullBleed(s, "revelation-catwalk.jpg");
  s.addText("AI · IDENTITY · CRAFT", { placeholder: "kicker" });
  s.addText("I Am Your Father", { placeholder: "title", fontSize: 60 });
  subUnder(s, "The joy of engineering in the age of AI", { y: 3.9 });
  s.addText("Sunny Kolattukudy", { x: 0.7, y: 6.6, w: 6, h: 0.4, fontSize: 14, color: C.accent4, margin: 0, isTextBox: true, objectName: "Speaker" });
  s.addNotes(
    "Open with the scene everyone knows: Luke on the gantry, Vader's revelation.\n" +
    "Core thesis: We confuse what we do with who we are. AI is changing HOW we engineer software, but not necessarily WHY we became engineers.\n" +
    "Arc for tonight: identity disruption → reflection → historical perspective → expanded possibility → agency and adaptation."
  );

  // ---------- 2. Thesis ----------
  s = pres.addSlide({ masterName: "Statement", sectionTitle: "Opening" });
  s.addText([
    { text: "We confuse what we " },
    { text: "do", options: { color: C.accent1 } },
    { text: " with who we " },
    { text: "are", options: { color: C.accent2 } },
    { text: "." },
  ], { placeholder: "title" });
  s.addText("AI changes how we engineer. Not necessarily why.", { placeholder: "body" });
  s.addNotes(
    "This is the whole talk in one sentence. Our job titles, our tools, our languages — they become part of how we see ourselves.\n" +
    "When the tools shift underneath us, it can feel like WE are being shifted. Tonight is about separating the two."
  );

  // ---------- 3. Part I: The Revelation ----------
  sec("I · The Revelation");
  s = pres.addSlide({ masterName: "Cinematic", sectionTitle: "I · The Revelation" });
  fullBleed(s, "code-writes-itself.jpg");
  s.addText("PART I", { placeholder: "kicker" });
  s.addText("The Revelation", { placeholder: "title" });
  subUnder(s, "“No. That’s not true. That’s impossible!”", { italic: true });
  s.addNotes(
    "Luke discovers something that fundamentally challenges his identity: the villain is his father.\n" +
    "His first response is disbelief, rejection, fear — he'd rather fall than accept it.\n" +
    "AI presents engineers with a similar challenge to professional identity. If a model can write the code, what does that make me?\n" +
    "Pause here. Let people recognize their own first reaction."
  );

  // ---------- 4. Reactions (Who Moved My Cheese) ----------
  s = pres.addSlide({ masterName: "Title Only", sectionTitle: "I · The Revelation" });
  s.addText("PART I · THE REVELATION", { placeholder: "kicker" });
  s.addText("Every reaction is understandable", { placeholder: "title" });
  s.addImage({ path: IMG("cheese-maze.jpg"), x: 0.7, y: 2.0, w: 7.0, h: 4.7, sizing: { type: "cover", w: 7.0, h: 4.7 }, objectName: "Maze art" });
  s.addImage({ path: IMG("web-cheese-cover.jpg"), x: 8.3, y: 2.0, w: 1.25, h: 1.93, objectName: "Who Moved My Cheese cover" });
  s.addText("Who Moved My Cheese?", { x: 9.8, y: 2.35, w: 2.9, h: 0.5, fontSize: 18, bold: true, color: C.background1, margin: 0, isTextBox: true });
  s.addText("Spencer Johnson", { x: 9.8, y: 2.85, w: 2.9, h: 0.4, fontSize: 14, color: C.accent4, margin: 0, isTextBox: true });
  const cheese = [
    [FaSearch, "Sniff", "sees it coming", HEX.accent2],
    [FaRunning, "Scurry", "acts fast", HEX.accent5],
    [FaHandPaper, "Hem", "resists", HEX.accent3],
    [FaShoePrints, "Haw", "adapts", HEX.accent1],
  ];
  for (let i = 0; i < cheese.length; i++) {
    const [Ic, name, verb, col] = cheese[i];
    const cx = 8.3 + (i % 2) * 2.25, cy = 4.35 + Math.floor(i / 2) * 1.2;
    s.addShape(pres.shapes.OVAL, { x: cx, y: cy, w: 0.7, h: 0.7, fill: { color: C.text2 }, line: { color: col, width: 1.5 }, objectName: `${name} badge` });
    s.addImage({ data: await icon(Ic, col), x: cx + 0.17, y: cy + 0.17, w: 0.36, h: 0.36, objectName: `${name} icon` });
    s.addText([
      { text: name, options: { bold: true, color: C.background1, breakLine: true } },
      { text: verb, options: { color: C.background2, fontSize: 13 } },
    ], { x: cx + 0.85, y: cy - 0.02, w: 1.35, h: 0.74, fontSize: 16, margin: 0, valign: "middle", isTextBox: true });
  }
  s.addNotes(
    "Who Moved My Cheese: two mice (Sniff and Scurry) and two little people (Hem and Haw) respond to the cheese disappearing.\n" +
    "Sniff sniffs out change early. Scurry hustles into action. Hem denies and digs in. Haw is scared, then eventually adapts.\n" +
    "Different people react to fundamental change differently — and every one of those reactions is understandable. Most of us have been Hem at some point this year.\n" +
    "Don't shame anyone in the room for where they are on this."
  );

  // ---------- 5. Part II ----------
  sec("II · Why");
  s = pres.addSlide({ masterName: "Cinematic", sectionTitle: "II · Why" });
  fullBleed(s, "first-spark.jpg");
  s.addText("PART II", { placeholder: "kicker" });
  s.addText("Why did you become an engineer?", { placeholder: "title" });
  s.addText("Remember the first time it worked.", { placeholder: "body" });
  s.addNotes(
    "Ask the audience: close your eyes for five seconds. What first excited you about this? The first program that ran? The first thing someone else used?\n" +
    "Maybe ask two or three people to shout out answers. You'll hear building, figuring things out, and helping people — which sets up the next slide."
  );

  // ---------- 6. Identity: liberation or loss ----------
  s = pres.addSlide({ masterName: "Title Only", sectionTitle: "II · Why" });
  s.addText("PART II · IDENTITY", { placeholder: "kicker" });
  s.addText("Liberation or loss?", { placeholder: "title" });
  [["hyperspace.jpg", "Liberation", C.accent2], ["revelation-catwalk.jpg", "Loss", C.accent3]].forEach(([img, word, col], i) => {
    const x = 0.7 + i * 6.05, y = 2.0, w = 5.85, h = 3.6;
    s.addImage({ path: IMG(img), x, y, w, h, sizing: { type: "cover", w, h }, objectName: `${word} art` });
    s.addImage({ data: SCRIM_BOTTOM, x, y, w, h, sizing: { type: "cover", w, h }, objectName: `${word} scrim` });
    s.addText(word, { x: x + 0.35, y: y + h - 0.95, w: w - 0.7, h: 0.7, fontSize: 32, bold: true, color: col, fontFace: THEME.headFontFace, margin: 0, isTextBox: true });
  });
  s.addText([
    { text: "It depends which joy of engineering you lean on most.", options: { color: C.background1 } },
  ], { x: 0.7, y: 5.85, w: 11.9, h: 0.5, fontSize: 22, align: "center", margin: 0, isTextBox: true, objectName: "Takeaway" });
  s.addText("Addy Osmani · Member of Technical Staff, Anthropic", { x: 0.7, y: 6.45, w: 11.9, h: 0.35, fontSize: 12, color: C.accent4, align: "center", margin: 0, isTextBox: true, objectName: "Credit" });
  s.addNotes(
    "This is where identity comes in. Addy Osmani, who works on Claude Code at Anthropic, posted this on Oct 9, 2026: whether agents feel like liberation or loss depends on which joy of engineering you lean on most.\n" +
    "Some engineers say they've never had more fun: they feel like they're in an all-star lineup. Others mourn the death of their craft and feel hollow. Both are telling the truth.\n" +
    "His point: the 'love coding vs. love shipping' split is too simple. We're mourning different losses and arguing from different places.\n" +
    "And the sadness isn't a failure to adapt. In his words, grief means you're attached to something. That attachment is your identity talking — so let's look at what it's attached to."
  );

  // ---------- 7. Three Joys ----------
  s = pres.addSlide({ masterName: "Title Only", sectionTitle: "II · Why" });
  s.addText("PART II · IDENTITY", { placeholder: "kicker" });
  s.addText("The three joys of engineering", { placeholder: "title" });
  const joys = [
    ["joy-making.jpg", "Making", "flow — the moment it clicks into place", C.accent1],
    ["joy-knowing.jpg", "Knowing", "a mental model so sharp you sense the bug", C.accent2],
    ["joy-mattering.jpg", "Mattering", "being the expert it all relies on", C.accent6],
  ];
  joys.forEach(([img, word, cap, col], i) => {
    const x = 0.7 + i * 4.05, y = 2.0, w = 3.75, h = 4.4;
    s.addImage({ path: IMG(img), x, y, w, h, sizing: { type: "cover", w, h }, objectName: `${word} art` });
    s.addImage({ data: SCRIM_BOTTOM, x, y, w, h, sizing: { type: "cover", w, h }, objectName: `${word} scrim` });
    s.addText(word, { x: x + 0.3, y: y + h - 1.65, w: w - 0.6, h: 0.65, fontSize: 30, bold: true, color: col, fontFace: THEME.headFontFace, margin: 0, isTextBox: true });
    s.addText(cap, { x: x + 0.3, y: y + h - 0.95, w: w - 0.6, h: 0.75, fontSize: 16, color: C.background1, margin: 0, valign: "top", isTextBox: true });
  });
  s.addText("Addy Osmani (Anthropic), “making, knowing, or mattering” · X, Oct 9 2026", { x: 0.7, y: 6.6, w: 9, h: 0.35, fontSize: 11, color: "8A90A8", margin: 0, isTextBox: true, objectName: "Credit" });
  s.addNotes(
    "Addy Osmani's three sources of joy, which most of us interweave:\n" +
    "• Making (flow): molding something in your hands and feeling it click into place.\n" +
    "• Knowing: a mental model of your system so strong you can sense where the bug is just by glancing at the files.\n" +
    "• Mattering: knowing you're the expert it all relied on.\n" +
    "Ask: which one is yours? Hands up for making… knowing… mattering. Most of us lean on one — and that predicts how AI feels to you.\n" +
    "Agents touch each joy differently. We'll come back to each one in Parts IV and V.\n" +
    "Source: x.com/addyosmani/status/2108444852820066711"
  );

  // ---------- 7. Part III: Abstraction timeline ----------
  sec("III · We've Been Here Before");
  s = pres.addSlide({ masterName: "Title Only", sectionTitle: "III · We've Been Here Before" });
  s.addText("PART III", { placeholder: "kicker" });
  s.addText("We’ve been here before", { placeholder: "title" });
  const steps = [
    ["web-eniac.jpg", "Machine code"],
    ["web-hamilton.jpg", "Assembly"],
    ["web-hopper.jpg", "High-level languages"],
    ["web-lego.jpg", "Frameworks"],
    ["web-datacenter.jpg", "Cloud"],
    ["ai-agents.jpg", "AI agents"],
  ];
  const d = 1.6, gap = (W - 1.4 - d * 6) / 5;
  const arrow = await icon(FaArrowRight, "6B7290");
  for (let i = 0; i < steps.length; i++) {
    const [img, label] = steps[i];
    const x = 0.7 + i * (d + gap), y = 2.55;
    const last = i === steps.length - 1;
    s.addShape(pres.shapes.OVAL, { x: x - 0.06, y: y - 0.06, w: d + 0.12, h: d + 0.12, fill: { color: last ? C.accent1 : C.text2 }, line: { type: "none" }, objectName: `${label} ring` });
    s.addImage({ path: IMG(img), x, y, w: d, h: d, sizing: { type: "cover", w: d, h: d }, rounding: true, objectName: `${label} photo` });
    s.addText(label, { x: x - 0.25, y: y + d + 0.25, w: d + 0.5, h: 0.75, fontSize: 16, bold: true, color: last ? C.accent1 : C.background1, align: "center", valign: "top", margin: 0, isTextBox: true });
    if (!last) s.addImage({ data: arrow, x: x + d + gap / 2 - 0.13, y: y + d / 2 - 0.13, w: 0.26, h: 0.26, objectName: "Arrow" });
  }
  s.addText([
    { text: "Less to execute by hand.  ", options: { color: C.background2 } },
    { text: "More we could build.", options: { color: C.accent1, bold: true } },
  ], { x: 0.7, y: 5.95, w: 11.9, h: 0.5, fontSize: 20, align: "center", margin: 0, isTextBox: true, objectName: "Takeaway" });
  s.addNotes(
    "Machine code → assembly → high-level languages → frameworks → cloud → AI agents.\n" +
    "ENIAC's programmers wired programs by hand. Margaret Hamilton's team wrote Apollo's guidance software in assembly. Grace Hopper was told computers could only do arithmetic — then built the compiler.\n" +
    "Each abstraction changed what engineers needed to understand and personally execute. Each one expanded what an engineer could accomplish.\n" +
    "And at every step, someone felt their mastery had just been made obsolete."
  );

  // ---------- 8. Mastery statement ----------
  s = pres.addSlide({ masterName: "Cinematic", sectionTitle: "III · We've Been Here Before" });
  s.addImage({ path: IMG("web-hamilton.jpg"), x: 7.4, y: 0, w: W - 7.4, h: H, sizing: { type: "cover", w: W - 7.4, h: H }, objectName: "Margaret Hamilton photo" });
  s.addText("PART III", { placeholder: "kicker" });
  s.addText([{ text: "Every abstraction", options: { breakLine: true } }, { text: "changes what", options: { breakLine: true } }, { text: "mastery means" }], { placeholder: "title", fontSize: 40 });
  s.addText("Not whether mastery matters.", { placeholder: "body", color: C.accent1 });
  s.addText("Margaret Hamilton with the Apollo guidance code · NASA, public domain", { x: 7.6, y: 7.05, w: 5.5, h: 0.3, fontSize: 10, color: "FFFFFF", margin: 0, isTextBox: true, objectName: "Photo credit" });
  s.addNotes(
    "Margaret Hamilton standing next to the printed Apollo guidance code. That stack WAS mastery in 1969.\n" +
    "Nobody today hand-writes that much assembly — but we didn't stop being masters. Mastery moved: to architecture, systems thinking, reliability, judgment.\n" +
    "Every abstraction changes what mastery means. Not whether it matters."
  );

  // ---------- 9. What's different ----------
  s = pres.addSlide({ masterName: "Title Only", sectionTitle: "III · We've Been Here Before" });
  s.addText("PART III · BUT THIS TIME", { placeholder: "kicker" });
  s.addText("What’s actually different", { placeholder: "title" });
  s.addImage({ path: IMG("ai-agents.jpg"), x: 0.7, y: 2.0, w: 6.6, h: 4.6, sizing: { type: "cover", w: 6.6, h: 4.6 }, objectName: "Agents art" });
  s.addText("BEFORE", { x: 7.9, y: 2.3, w: 4.7, h: 0.4, fontSize: 14, bold: true, charSpacing: 4, color: "8A90A8", margin: 0, isTextBox: true });
  s.addText("We delegated instructions", { x: 7.9, y: 2.7, w: 4.7, h: 0.9, fontSize: 28, color: C.background2, fontFace: THEME.headFontFace, margin: 0, valign: "top", isTextBox: true });
  s.addText("NOW", { x: 7.9, y: 4.2, w: 4.7, h: 0.4, fontSize: 14, bold: true, charSpacing: 4, color: C.accent1, margin: 0, isTextBox: true });
  s.addText("We delegate decisions", { x: 7.9, y: 4.6, w: 4.7, h: 0.9, fontSize: 28, bold: true, color: C.background1, fontFace: THEME.headFontFace, margin: 0, valign: "top", isTextBox: true });
  s.addText("…and some of the reasoning.", { x: 7.9, y: 5.55, w: 4.7, h: 0.5, fontSize: 18, italic: true, color: C.accent4, margin: 0, isTextBox: true });
  s.addNotes(
    "Be honest that this one IS different. A compiler does exactly what you told it, deterministically.\n" +
    "With AI agents we're increasingly delegating implementation decisions — and some reasoning — not merely instructions.\n" +
    "That's why it feels more personal. It's not just the typing being automated; it's part of the thinking. Which is exactly why our judgment matters more, not less."
  );

  // ---------- 10. Part IV ----------
  sec("IV · The Possibility");
  s = pres.addSlide({ masterName: "Cinematic", sectionTitle: "IV · The Possibility" });
  fullBleed(s, "swamp-lift.jpg");
  s.addText("PART IV", { placeholder: "kicker" });
  s.addText("You must unlearn what you have learned", { placeholder: "title", fontSize: 40 });
  s.addNotes(
    "Dagobah. Luke's X-wing is sunk in the swamp. He thinks lifting a starship is fundamentally different from lifting a stone.\n" +
    "Yoda lifts it anyway. Luke: 'I don't believe it.' Yoda: 'That is why you fail.'\n" +
    "Luke's assumptions limited what he believed was possible."
  );

  // ---------- 11. Size matters not ----------
  s = pres.addSlide({ masterName: "Title Only", sectionTitle: "IV · The Possibility" });
  s.addText("PART IV · THE POSSIBILITY", { placeholder: "kicker" });
  s.addText("How much can one engineer build?", { placeholder: "title" });
  const poss = [
    ["joy-making.jpg", "Making", "moves up an abstraction level", C.accent1],
    ["joy-knowing.jpg", "Knowing", "don’t just pick — keep conjuring", C.accent2],
  ];
  poss.forEach(([img, word, cap, col], i) => {
    const x = 0.7 + i * 6.05, y = 2.0, w = 5.85, h = 4.5;
    s.addImage({ path: IMG(img), x, y, w, h, sizing: { type: "cover", w, h }, objectName: `${word} art` });
    s.addImage({ data: SCRIM_BOTTOM, x, y, w, h, sizing: { type: "cover", w, h }, objectName: `${word} scrim` });
    s.addText(word, { x: x + 0.35, y: y + h - 1.45, w: w - 0.7, h: 0.7, fontSize: 32, bold: true, color: col, fontFace: THEME.headFontFace, margin: 0, isTextBox: true });
    s.addText(cap, { x: x + 0.35, y: y + h - 0.75, w: w - 0.7, h: 0.5, fontSize: 20, color: C.background1, margin: 0, isTextBox: true });
  });
  s.addNotes(
    "AI challenges our assumptions about how much software one engineer can create. The X-wing isn't heavier than the stone — only in our minds.\n" +
    "Making (Addy Osmani): the easiest joy to keep — it moves up a level. You're shaping the system or the factory, not every line, in a loop fast enough that flow still happens. And when you miss the old flow, nothing stops you writing the code yourself.\n" +
    "Knowing: the joy most at risk of erosion. Picking from an agent's options is a different skill than conjuring an idea yourself. His warning: 'If you always pick and never conjure, the ability to conjure will erode.'\n" +
    "You can't direct what you don't understand. If you don't understand your own codebase, the agent is directing you. Knowing has to evolve deliberately — not disappear."
  );

  // ---------- 12. Part V ----------
  sec("V · The Choice");
  s = pres.addSlide({ masterName: "Cinematic", sectionTitle: "V · The Choice" });
  fullBleed(s, "choice-path.jpg");
  s.addText("PART V", { placeholder: "kicker" });
  s.addText("The Choice", { placeholder: "title" });
  subUnder(s, "A revelation about your past doesn’t dictate your future.");
  s.addNotes(
    "Luke ultimately refuses to let Vader define who he must become. 'I'll never turn to the dark side.'\n" +
    "Learning where you came from doesn't decide where you go.\n" +
    "Engineers can keep their underlying motivations while reinventing how they practice the craft."
  );

  // ---------- 13. Mattering ----------
  s = pres.addSlide({ masterName: "Cinematic", sectionTitle: "V · The Choice" });
  fullBleed(s, "joy-mattering.jpg");
  s.addText("PART V · THE CHOICE", { placeholder: "kicker" });
  s.addText([{ text: "Mattering", options: { breakLine: true } }, { text: "comes from us" }], { placeholder: "title" });
  s.addText([
    { text: "Choices · Judgment · Impact", options: { color: C.accent1, bold: true, breakLine: true } },
    { text: "Not our tools." },
  ], { placeholder: "body", fontSize: 24 });
  s.addNotes(
    "The joy of mattering never came from the editor, the language, or the framework.\n" +
    "It comes from what we choose to build, the judgment we bring, and the impact on the people who use it.\n" +
    "Addy Osmani again: obsolescence touches us, but our judgment — and the need for it — has never mattered more. We decide which problems to solve, bring our taste, and own whatever ships.\n" +
    "An AI model can't be accountable. You can."
  );

  // ---------- 14. Closing ----------
  sec("VI · Closing");
  s = pres.addSlide({ masterName: "Cinematic", sectionTitle: "VI · Closing" });
  fullBleed(s, "new-craft.jpg");
  s.addText("PART VI", { placeholder: "kicker" });
  s.addText([{ text: "The tools changed.", options: { breakLine: true } }, { text: "The joys don’t have to." }], { placeholder: "title", fontSize: 40 });
  s.addText("Adaptation isn’t abandoning the craft. It’s a new expression of it.", { placeholder: "body" });
  s.addNotes(
    "Bring it home. Recap the arc: the revelation, why we started, we've been here before, unlearning, choosing.\n" +
    "Adaptation isn't abandoning the craft; it's discovering a new expression of it."
  );

  // ---------- 15. Final line ----------
  s = pres.addSlide({ masterName: "Statement", sectionTitle: "VI · Closing" });
  s.addImage({ path: IMG("twin-sunset.jpg"), x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H }, objectName: "Background art" });
  s.addImage({ data: SCRIM_BOTTOM, x: 0, y: 0, w: W, h: H, objectName: "Legibility scrim" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: C.text1, transparency: 55 }, line: { type: "none" }, objectName: "Dim overlay" });
  s.addText([
    { text: "We didn’t become engineers to write syntax.", options: { breakLine: true } },
    { text: "We became engineers to " },
    { text: "make", options: { color: C.accent1 } },
    { text: ", to " },
    { text: "know", options: { color: C.accent2 } },
    { text: ", and to " },
    { text: "matter", options: { color: C.accent6 } },
    { text: "." },
  ], { placeholder: "title", fontSize: 40 });
  s.addText("Thank you", { placeholder: "body", color: C.background2 });
  s.addNotes("Let the line land. Pause. Thank you.");

  // ---------- 16. Credits ----------
  s = pres.addSlide({ masterName: "Title Only", sectionTitle: "VI · Closing" });
  s.addText("CREDITS", { placeholder: "kicker" });
  s.addText("Image credits", { placeholder: "title" });
  s.addText([
    { text: "Two women operating ENIAC — U.S. Army, public domain (Wikimedia Commons)", options: { breakLine: true } },
    { text: "Margaret Hamilton with Apollo guidance code — NASA, public domain (Wikimedia Commons)", options: { breakLine: true } },
    { text: "Grace Hopper and UNIVAC — CC BY 2.0 (Wikimedia Commons)", options: { breakLine: true } },
    { text: "Lego Color Bricks — CC BY-SA 2.0 (Wikimedia Commons)", options: { breakLine: true } },
    { text: "CERN Computer Center — CC BY-SA 4.0 (Wikimedia Commons)", options: { breakLine: true } },
    { text: "Who Moved My Cheese? cover — Spencer Johnson / Putnam (via Open Library)", options: { breakLine: true } },
    { text: "Three joys of engineering (making, knowing, mattering) — Addy Osmani, Anthropic, on X, Oct 9 2026", options: { breakLine: true } },
    { text: "All other illustrations generated with OpenAI gpt-image-2" },
  ], { x: 0.7, y: 2.0, w: 11.9, h: 4.6, fontSize: 16, color: C.background2, paraSpaceAfter: 8, valign: "top", margin: 0, isTextBox: true, objectName: "Credits list" });

  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) {
    const { applyTheme } = require(APPLY_THEME);
    await applyTheme(OUT, THEME);
  }
  console.log("Wrote " + OUT);
})();

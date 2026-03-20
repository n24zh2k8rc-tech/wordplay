/** One Fill-the-Story passage per rotation day (90 unique days). */
function S(text, answers, extraPipe) {
  const blanks = answers.map((answer, i) => ({ id: `BLANK${i + 1}`, answer }));
  return { story: text, blanks, wordBank: [...answers, ...extraPipe.split("|")] };
}

export const ALL_FILL_STORIES = [
  {
    story: "The old lighthouse stood at the [BLANK1] of the rocky cliff, watching over the sea. Every evening, the lighthouse keeper would [BLANK2] the great lamp to guide ships safely home. One [BLANK3] night, a fierce storm rolled in from the north. The winds were [BLANK4] and the rain lashed the windows. Despite the danger, the keeper remained [BLANK5], knowing sailors depended on that steady beam of light.",
    blanks: [{ id: "BLANK1", answer: "edge" }, { id: "BLANK2", answer: "light" }, { id: "BLANK3", answer: "stormy" }, { id: "BLANK4", answer: "fierce" }, { id: "BLANK5", answer: "calm" }],
    wordBank: ["edge", "light", "stormy", "fierce", "calm", "soft", "center", "dark", "extinguish", "gentle"],
  },
  {
    story: "Maria woke up early on the [BLANK1] morning of her first day at university. Her heart was [BLANK2] with excitement as she packed her bag. The campus was [BLANK3] with students from all over the world. She found a seat in the lecture hall and [BLANK4] her notebook, ready to learn. By the end of the day, she had already made two [BLANK5] friends.",
    blanks: [{ id: "BLANK1", answer: "bright" }, { id: "BLANK2", answer: "filled" }, { id: "BLANK3", answer: "crowded" }, { id: "BLANK4", answer: "opened" }, { id: "BLANK5", answer: "wonderful" }],
    wordBank: ["bright", "filled", "crowded", "opened", "wonderful", "dark", "empty", "closed", "bored", "terrible"],
  },
  {
    story: "Every winter, the small village held a [BLANK1] festival that lasted an entire week. The streets were decorated with [BLANK2] lanterns that glowed in the cold night air. Families gathered around fire pits to share [BLANK3] soup and stories from the past year. The children's favourite part was the puppet show performed by a [BLANK4] old man who had done it for decades. At midnight, everyone would [BLANK5] and watch the fireworks light up the sky.",
    blanks: [{ id: "BLANK1", answer: "traditional" }, { id: "BLANK2", answer: "colourful" }, { id: "BLANK3", answer: "hot" }, { id: "BLANK4", answer: "talented" }, { id: "BLANK5", answer: "gather" }],
    wordBank: ["traditional", "colourful", "hot", "talented", "gather", "modern", "plain", "cold", "clumsy", "scatter"],
  },
  {
    story: "The small bakery on the corner had a [BLANK1] smell that drifted down the whole street. Every morning, the baker would [BLANK2] fresh loaves of bread and arrange them in the window. Customers would form a [BLANK3] line outside the door before it even opened. The most [BLANK4] item was a golden croissant dusted with sugar. People said it tasted like a [BLANK5] dream.",
    blanks: [{ id: "BLANK1", answer: "delicious" }, { id: "BLANK2", answer: "bake" }, { id: "BLANK3", answer: "long" }, { id: "BLANK4", answer: "popular" }, { id: "BLANK5", answer: "sweet" }],
    wordBank: ["delicious", "bake", "long", "popular", "sweet", "horrible", "burn", "short", "forgotten", "bitter"],
  },
  {
    story: "The explorer had been [BLANK1] through the jungle for three days when she finally spotted the ancient ruins. The stone walls were [BLANK2] with vines and moss. She [BLANK3] her hand over the carved symbols, wondering what they meant. Inside the main chamber, a shaft of [BLANK4] light fell through a hole in the ceiling. She felt a deep [BLANK5] that she had discovered something extraordinary.",
    blanks: [{ id: "BLANK1", answer: "travelling" }, { id: "BLANK2", answer: "covered" }, { id: "BLANK3", answer: "ran" }, { id: "BLANK4", answer: "golden" }, { id: "BLANK5", answer: "certainty" }],
    wordBank: ["travelling", "covered", "ran", "golden", "certainty", "resting", "bare", "threw", "pale", "doubt"],
  },
  {
    story: "The library was [BLANK1] except for the soft ticking of the clock on the wall. Leo had spent every afternoon there since moving to the new town, finding [BLANK2] among the shelves. He [BLANK3] a book about astronomy and settled into his favourite armchair. As the afternoon light grew [BLANK4], he lost track of time completely. When the librarian finally tapped his shoulder, he [BLANK5] with surprise.",
    blanks: [{ id: "BLANK1", answer: "silent" }, { id: "BLANK2", answer: "comfort" }, { id: "BLANK3", answer: "chose" }, { id: "BLANK4", answer: "dim" }, { id: "BLANK5", answer: "jumped" }],
    wordBank: ["silent", "comfort", "chose", "dim", "jumped", "noisy", "loneliness", "refused", "bright", "slept"],
  },
  {
    story: "The rescue dog arrived at the shelter looking [BLANK1] and frightened. The volunteers worked [BLANK2] to earn her trust, offering food and gentle words. Within a week, her tail began to [BLANK3] when anyone entered the room. A family came to [BLANK4] a dog and immediately fell in love with her soft brown eyes. On the day she left, every volunteer felt both [BLANK5] and overjoyed.",
    blanks: [{ id: "BLANK1", answer: "thin" }, { id: "BLANK2", answer: "patiently" }, { id: "BLANK3", answer: "wag" }, { id: "BLANK4", answer: "adopt" }, { id: "BLANK5", answer: "sad" }],
    wordBank: ["thin", "patiently", "wag", "adopt", "sad", "healthy", "rudely", "droop", "abandon", "angry"],
  },
  S(
    "The train arrived at the [BLANK1] station exactly on time. Passengers hurried onto the [BLANK2] platform with their bags. A musician played a [BLANK3] tune near the ticket office. The air smelled of coffee and [BLANK4] rain from the street outside. I found my seat and felt [BLANK5] to be on my way.",
    ["busy", "crowded", "lively", "fresh", "relieved"],
    "empty|quiet|sad|stale|worried",
  ),
  S(
    "Our teacher explained the lesson in a very [BLANK1] way. Even difficult grammar seemed [BLANK2] after her examples. We took notes and asked [BLANK3] questions when we were unsure. At the end of class, everyone felt more [BLANK4] about the exam. Learning English can be [BLANK5] when you have good support.",
    ["clear", "simple", "careful", "confident", "enjoyable"],
    "confusing|hard|rude|nervous|boring",
  ),
  S(
    "The artist mixed [BLANK1] paints on her palette before touching the canvas. Each brushstroke added [BLANK2] detail to the portrait. Visitors watched in [BLANK3] silence as the face appeared. When she signed the corner, the crowd broke into [BLANK4] applause. It was a truly [BLANK5] afternoon at the gallery.",
    ["bright", "subtle", "respectful", "warm", "memorable"],
    "dull|rough|loud|cold|ordinary",
  ),
  S(
    "James forgot his umbrella on a [BLANK1] afternoon in April. By the time he reached the office, his coat was [BLANK2] through. His colleagues laughed in a [BLANK3] way and offered him a towel. He hung his jacket near the [BLANK4] heater and drank hot tea. Later he laughed about his [BLANK5] mistake.",
    ["rainy", "soaked", "friendly", "warm", "silly"],
    "sunny|dry|mean|cold|clever",
  ),
  S(
    "The documentary showed how bees live in a highly [BLANK1] society. Each insect has a [BLANK2] role inside the hive. Farmers depend on them to [BLANK3] many crops. Without pollinators, harvests would be far less [BLANK4]. Protecting bees is [BLANK5] for our food supply.",
    ["organized", "specific", "pollinate", "abundant", "essential"],
    "chaotic|random|ignore|scarce|optional",
  ),
  S(
    "At dawn the fishermen pushed their [BLANK1] boats into the grey waves. Nets were checked with [BLANK2] hands used to cold rope. By midday the harbour smelled of [BLANK3] fish and salt. Children ran along the pier with [BLANK4] excitement. It was another [BLANK5] day by the sea.",
    ["small", "rough", "fresh", "noisy", "ordinary"],
    "huge|soft|rotten|quiet|strange",
  ),
  S(
    "The orchestra tuned their instruments with [BLANK1] concentration. When the conductor raised his baton, the hall fell [BLANK2]. The first notes of the symphony sounded [BLANK3] and clear. No one coughed or whispered during the [BLANK4] performance. Walking home, I still felt [BLANK5] by the music.",
    ["quiet", "silent", "rich", "moving", "lifted"],
    "loud|noisy|flat|boring|tired",
  ),
  S(
    "The software update fixed several [BLANK1] bugs that users had reported. Engineers worked through the night in [BLANK2] shifts. The new version loads pages much more [BLANK3] than before. Support tickets dropped to a [BLANK4] level within a week. Customers left [BLANK5] reviews online.",
    ["serious", "rotating", "quickly", "manageable", "positive"],
    "minor|fixed|slowly|huge|angry",
  ),
  S(
    "Grandmother told a story about a [BLANK1] castle on a hill. Knights once defended it with [BLANK2] courage, she said. Today only [BLANK3] stones remain for tourists to photograph. Wind whistles through the [BLANK4] archways at night. Listening, I felt both [BLANK5] and a little afraid.",
    ["ancient", "fierce", "broken", "empty", "curious"],
    "modern|weak|perfect|full|bored",
  ),
  S(
    "The marathon runner crossed the finish line looking utterly [BLANK1]. Medics wrapped her in a [BLANK2] blanket and gave water. Years of [BLANK3] training had led to this moment. Her smile was [BLANK4] despite the pain in her legs. The crowd's cheer was [BLANK5] enough to echo down the street.",
    ["exhausted", "silver", "daily", "bright", "loud"],
    "fresh|heavy|lazy|dark|soft",
  ),
  S(
    "A stray cat appeared on our [BLANK1] porch one winter evening. We offered milk and a [BLANK2] box lined with blankets. Within days she became [BLANK3] and purred on the sofa. The vet said she was surprisingly [BLANK4] for a street animal. Adopting her was the best [BLANK5] we ever made.",
    ["front", "cardboard", "affectionate", "healthy", "decision"],
    "back|metal|angry|sick|mistake",
  ),
  S(
    "The startup's office was a [BLANK1] loft above a coffee shop. Developers debated code over [BLANK2] espresso. Whiteboards filled with [BLANK3] diagrams covered every wall. Deadlines felt [BLANK4] but the team stayed motivated. Launch day arrived with [BLANK5] energy in the room.",
    ["bright", "strong", "colourful", "tight", "nervous"],
    "dark|weak|blank|easy|calm",
  ),
  S(
    "Snow fell [BLANK1] on the quiet suburban street. Parents helped children build a [BLANK2] snowman with a carrot nose. Smoke rose from [BLANK3] chimneys in straight lines. The world looked [BLANK4] under the streetlights. We drank cocoa and felt [BLANK5] at home.",
    ["softly", "tall", "brick", "peaceful", "cozy"],
    "heavily|tiny|metal|wild|lost",
  ),
  S(
    "The journalist asked a [BLANK1] question that silenced the room. The politician gave an [BLANK2] answer that avoided the point. Cameras flashed with [BLANK3] rhythm. Reporters scribbled notes in [BLANK4] handwriting. Truth, it seemed, was less [BLANK5] than a good headline.",
    ["sharp", "evasive", "steady", "hurried", "important"],
    "dull|honest|random|neat|simple",
  ),
  S(
    "We camped beside a [BLANK1] lake that mirrored the stars. Frogs sang in a [BLANK2] chorus after sunset. Someone strummed a [BLANK3] guitar by the fire. Mosquitoes were [BLANK4] but worth ignoring. In the morning mist, the forest looked almost [BLANK5].",
    ["still", "loud", "quiet", "annoying", "magical"],
    "rough|silent|broken|welcome|ugly",
  ),
  S(
    "The antique clock had a [BLANK1] pendulum that swung for a century. Its brass face showed [BLANK2] Roman numerals. Every hour it chimed with a [BLANK3] tone through the house. The owner wound it with [BLANK4] care each Sunday. Time felt slower and more [BLANK5] near that clock.",
    ["heavy", "faded", "deep", "gentle", "meaningful"],
    "light|bright|sharp|rude|empty",
  ),
  S(
    "The chef chopped vegetables with [BLANK1] speed and precision. Steam rose from a [BLANK2] pan of sizzling garlic. Spices filled the kitchen with a [BLANK3] aroma. Plating each dish required [BLANK4] attention. Guests called the meal [BLANK5] and unforgettable.",
    ["remarkable", "wide", "rich", "artistic", "outstanding"],
    "slow|tiny|plain|lazy|average",
  ),
  S(
    "The hiking trail climbed through [BLANK1] pine forest. Roots crossed the path in [BLANK2] patterns. A deer watched us with [BLANK3] eyes before darting away. At the summit the view was [BLANK4] and windblown. We ate sandwiches feeling [BLANK5] and small beneath the sky.",
    ["dense", "twisted", "calm", "vast", "humble"],
    "open|straight|wild|narrow|proud",
  ),
  S(
    "The robot vacuum rolled [BLANK1] under the sofa. It mapped the room with [BLANK2] sensors. Pet hair disappeared into its [BLANK3] compartment. The cat followed it with [BLANK4] suspicion. Housework had never felt so [BLANK5].",
    ["quietly", "tiny", "dusty", "deep", "strange"],
    "loudly|huge|clean|mild|normal",
  ),
  S(
    "Waves carved [BLANK1] shapes into the sandstone cliffs. Tourists walked the [BLANK2] path along the edge. Seabirds circled with [BLANK3] cries above. The ocean below looked [BLANK4] and powerful. Nature's art is both [BLANK5] and fragile.",
    ["smooth", "narrow", "sharp", "endless", "beautiful"],
    "jagged|wide|soft|tiny|ugly",
  ),
  S(
    "The debate team argued about climate policy with [BLANK1] passion. Facts were cited from [BLANK2] studies published that year. The judge praised their [BLANK3] structure and timing. Winning felt [BLANK4] after weeks of practice. They shook hands in [BLANK5] respect.",
    ["fierce", "peer-reviewed", "logical", "sweet", "mutual"],
    "mild|fake|messy|bitter|fake",
  ),
  S(
    "Fog rolled over the [BLANK1] runway at dawn. Ground crew checked lights with [BLANK2] flashlights. The plane's engines roared [BLANK3] as it accelerated. Passengers gripped armrests during the [BLANK4] takeoff. Above the clouds, everything turned [BLANK5] and calm.",
    ["wet", "yellow", "loudly", "bumpy", "bright"],
    "dry|blue|softly|smooth|dark",
  ),
  S(
    "The museum's new exhibit featured [BLANK1] masks from three continents. Labels explained each piece in [BLANK2] English and Spanish. School groups moved through in [BLANK3] lines. A guard watched with [BLANK4] patience. Art can make history feel [BLANK5] alive.",
    ["wooden", "simple", "orderly", "endless", "almost"],
    "plastic|fancy|chaotic|little|fully",
  ),
  S(
    "Thunder cracked over the [BLANK1] stadium during the final match. Fans waved flags with [BLANK2] enthusiasm. Rain soaked the pitch but play grew more [BLANK3]. The winning goal came in the [BLANK4] minute. Nobody minded getting [BLANK5] that night.",
    ["open", "wild", "intense", "last", "wet"],
    "closed|calm|boring|first|dry",
  ),
  S(
    "The novelist stared at a [BLANK1] page for an hour. Doubt felt like a [BLANK2] weight on her shoulders. Finally a sentence arrived—short and [BLANK3]. Paragraphs grew into a [BLANK4] chapter by midnight. Creativity often begins with something [BLANK5].",
    ["blank", "heavy", "honest", "strange", "small"],
    "full|light|false|boring|huge",
  ),
  S(
    "Volunteers planted trees along the [BLANK1] riverbank. Mud stuck to their [BLANK2] boots in clumps. Each sapling needed a [BLANK3] stake and plenty of water. Years from now this place will look [BLANK4]. Giving back to nature felt [BLANK5] rewarding.",
    ["muddy", "rubber", "wooden", "green", "deeply"],
    "dry|leather|metal|bare|lightly",
  ),
  S(
    "The spaceship's hatch opened with a [BLANK1] hiss. Astronauts floated into the [BLANK2] module in slow motion. Earth appeared as a [BLANK3] blue marble through the window. Every checklist had been checked with [BLANK4] care. Human curiosity remains [BLANK5] boundless.",
    ["soft", "bright", "fragile", "extreme", "almost"],
    "loud|dark|huge|lazy|fully",
  ),
  S(
    "The tailor measured fabric with a [BLANK1] tape around my shoulders. Pins held the jacket in [BLANK2] place while I stood still. Needle and thread moved in [BLANK3] stitches along the seam. The final fit was [BLANK4] perfect. Craftsmanship like that is increasingly [BLANK5].",
    ["yellow", "temporary", "tiny", "nearly", "rare"],
    "black|permanent|huge|totally|common",
  ),
  S(
    "Ice skaters carved [BLANK1] circles on the frozen pond. Breath rose in [BLANK2] clouds in the cold air. A child fell and laughed with [BLANK3] surprise. Music played from a [BLANK4] speaker near the bench. Winter sports bring [BLANK5] joy to this town.",
    ["graceful", "white", "delighted", "portable", "simple"],
    "clumsy|grey|angry|fixed|complex",
  ),
  S(
    "The password must be [BLANK1] enough to resist guessing. Mix letters, numbers, and [BLANK2] symbols for strength. Never share it through [BLANK3] messages. Change it if a site reports a [BLANK4] breach. Staying safe online requires [BLANK5] habits.",
    ["long", "special", "unsecured", "data", "careful"],
    "short|normal|secure|party|lazy",
  ),
  S(
    "The wind farm's blades turned with a [BLANK1] whoosh above the fields. Engineers monitor output on [BLANK2] screens in a nearby shed. Clean energy feels [BLANK3] hopeful on cloudy days. Birds learn to avoid the [BLANK4] towers over time. Tomorrow's grid may rely on something [BLANK5] like this.",
    ["steady", "digital", "quietly", "spinning", "similar"],
    "random|paper|loudly|still|different",
  ),
  S(
    "The puppy chewed a [BLANK1] slipper while we weren't looking. We sighed but stayed [BLANK2] while cleaning the mess. Training takes [BLANK3] repetition and treats. Soon she learned to sit with [BLANK4] obedience. A disciplined dog is a [BLANK5] companion.",
    ["leather", "patient", "daily", "quick", "loyal"],
    "plastic|angry|rare|slow|lazy",
  ),
  S(
    "The judge spoke in a [BLANK1] voice before announcing the verdict. The courtroom held its [BLANK2] breath. Lawyers shuffled [BLANK3] papers at their desks. Justice, though [BLANK4], had finally arrived. Outside, reporters waited with [BLANK5] microphones.",
    ["firm", "collective", "thick", "slow", "live"],
    "shaky|single|thin|fast|broken",
  ),
  S(
    "Meteorologists tracked a [BLANK1] storm forming offshore. Evacuation orders were [BLANK2] but clear. Families packed [BLANK3] bags in a hurry. Emergency workers stayed [BLANK4] through the night. Afterwards, neighbours helped each other rebuild with [BLANK5] determination.",
    ["massive", "urgent", "essential", "alert", "shared"],
    "tiny|calm|empty|asleep|selfish",
  ),
  S(
    "The spelling bee moved to a [BLANK1] word that stumped half the room. The finalist spelled it [BLANK2] without hesitation. Parents clapped with [BLANK3] pride. Trophies gleamed under [BLANK4] lights on the stage. Hard study had made victory [BLANK5] possible.",
    ["difficult", "correctly", "bursting", "bright", "truly"],
    "easy|wrongly|hidden|dim|barely",
  ),
  S(
    "The ferry rocked [BLANK1] as we crossed the channel. Seagulls followed with [BLANK2] cries overhead. My stomach felt [BLANK3] but I stayed on deck. The horizon line looked [BLANK4] and endless. Reaching port was a [BLANK5] relief.",
    ["gently", "harsh", "uneasy", "thin", "huge"],
    "violently|soft|steady|wide|tiny",
  ),
  S(
    "Archaeologists brushed [BLANK1] sand from a pottery shard. The pattern suggested a [BLANK2] trade route centuries ago. Each find was labeled with [BLANK3] care in the tent. The desert sun was [BLANK4] by afternoon. History felt [BLANK5] close in that trench.",
    ["fine", "lost", "scientific", "merciless", "dangerously"],
    "coarse|modern|careless|kind|safely",
  ),
  S(
    "The drone delivered a [BLANK1] package to the rooftop pad. Sensors avoided birds with [BLANK2] reflexes. City noise faded into a [BLANK3] hum below. Regulations still feel [BLANK4] in many countries. Technology moves faster than [BLANK5] law sometimes.",
    ["small", "quick", "distant", "unclear", "written"],
    "huge|slow|loud|clear|spoken",
  ),
  S(
    "The choir practiced a [BLANK1] hymn for Sunday service. Harmonies blended in [BLANK2] layers of sound. The director tapped a [BLANK3] beat on her stand. Wrong notes were rare but [BLANK4] forgiven. Music made the old hall feel [BLANK5] new.",
    ["traditional", "gentle", "steady", "easily", "almost"],
    "modern|harsh|random|never|totally",
  ),
  S(
    "The cyclist wore a [BLANK1] helmet and reflective vest. Traffic felt [BLANK2] close on the narrow bridge. Pedaling uphill required [BLANK3] effort and focus. At the crest, the downhill wind was [BLANK4] cool. Commuting by bike stays [BLANK5] popular here.",
    ["bright", "dangerously", "steady", "refreshingly", "surprisingly"],
    "dull|safely|lazy|stale|rarely",
  ),
  S(
    "The translator worked late on a [BLANK1] document for the embassy. Idioms rarely map in a [BLANK2] way between languages. She chose words with [BLANK3] precision. Deadlines loomed like a [BLANK4] shadow. Accuracy matters more than [BLANK5] speed.",
    ["confidential", "direct", "painstaking", "long", "mere"],
    "public|random|careless|short|pure",
  ),
  S(
    "The beekeeper lifted a [BLANK1] frame covered in bees. Honey dripped with a [BLANK2] golden shine. Protective gear felt [BLANK3] in the summer heat. The hive's buzz was [BLANK4] constant. Rural life has a [BLANK5] rhythm cities lack.",
    ["wooden", "slow", "stifling", "strangely", "deeper"],
    "metal|fast|cool|quietly|shallower",
  ),
  S(
    "The submarine's lights revealed [BLANK1] fish near the vents. Pressure outside was [BLANK2] enormous. The crew spoke in [BLANK3] whispers anyway. Instruments blinked with [BLANK4] data streams. Exploring the deep remains [BLANK5] humbling.",
    ["glowing", "almost", "hushed", "steady", "deeply"],
    "dark|slightly|loud|broken|lightly",
  ),
  S(
    "The florist arranged roses in a [BLANK1] spiral. Ribbon curled in [BLANK2] loops around the vase. The scent was [BLANK3] strong near the door. Customers left [BLANK4] tips on busy days. Small shops keep the street [BLANK5] alive.",
    ["tight", "elegant", "pleasantly", "generous", "feeling"],
    "loose|messy|overwhelmingly|small|looking",
  ),
  S(
    "The pilot announced [BLANK1] turbulence ahead. Seatbelt signs glowed [BLANK2] orange. The cabin crew moved with [BLANK3] efficiency. Children gripped armrests with [BLANK4] fingers. Minutes later the air turned [BLANK5] smooth again.",
    ["mild", "soft", "trained", "tight", "perfectly"],
    "severe|bright|nervous|loose|roughly",
  ),
  S(
    "The locksmith filed a [BLANK1] key with patient strokes. The mechanism inside was [BLANK2] rusted. After three tries the lock turned with a [BLANK3] click. The homeowner sighed in [BLANK4] relief. Some problems need a [BLANK5] expert.",
    ["rough", "badly", "satisfying", "visible", "skilled"],
    "smooth|lightly|annoying|hidden|lucky",
  ),
  S(
    "The surfer paddled toward a [BLANK1] wave building offshore. Salt stung his eyes with [BLANK2] sharpness. Timing the stand-up moment felt [BLANK3] instinctive. The ride lasted only [BLANK4] seconds but burned in memory. Ocean sports teach [BLANK5] humility.",
    ["rising", "fresh", "almost", "fifteen", "quiet"],
    "falling|mild|totally|endless|loud",
  ),
  S(
    "The blacksmith hammered metal on a [BLANK1] anvil. Sparks flew in [BLANK2] arcs across the floor. Heat from the forge felt [BLANK3] intense on the skin. Each ring of iron grew [BLANK4] thinner. Craft like this grows [BLANK5] rare each decade.",
    ["heavy", "bright", "almost", "gradually", "more"],
    "light|dim|slightly|suddenly|less",
  ),
  S(
    "The nurse checked vitals with a [BLANK1] thermometer. The patient smiled [BLANK2] despite the pain. Charts updated on a [BLANK3] tablet by the bed. Footsteps echoed in the [BLANK4] corridor. Kind care can feel [BLANK5] medicinal.",
    ["digital", "weakly", "portable", "long", "almost"],
    "glass|brightly|fixed|short|never",
  ),
  S(
    "The astronomer pointed the telescope at a [BLANK1] nebula. Gas clouds glowed in [BLANK2] pink and violet. Numbers on the screen scrolled [BLANK3] fast to read. The universe seemed [BLANK4] larger than yesterday. Wonder needs no [BLANK5] translation.",
    ["distant", "faint", "too", "even", "extra"],
    "nearby|bright|slowly|smaller|fancy",
  ),
  S(
    "The carpenter sanded the table until it felt [BLANK1] smooth. Varnish went on in [BLANK2] even coats. Dust motes hung in [BLANK3] sunlight through the window. The grain pattern looked [BLANK4] beautiful up close. Handmade furniture carries [BLANK5] character.",
    ["perfectly", "thin", "slanted", "especially", "extra"],
    "roughly|thick|bright|barely|less",
  ),
  S(
    "The diver surfaced with a [BLANK1] shell in her glove. Bubbles rose in a [BLANK2] silver trail behind. The boat rocked [BLANK3] in the swell. Salt dried in [BLANK4] lines on her wetsuit. The reef below stayed [BLANK5] mysterious.",
    ["spiral", "shimmering", "gently", "white", "beautifully"],
    "broken|dull|wildly|dark|plainly",
  ),
  S(
    "The editor cut a [BLANK1] paragraph that slowed the story. Red marks looked [BLANK2] harsh on the page. The author nodded with [BLANK3] understanding. Good writing often needs [BLANK4] courage to delete. The final draft felt [BLANK5] tighter.",
    ["long", "almost", "grudging", "brutal", "noticeably"],
    "short|truly|eager|gentle|barely",
  ),
  S(
    "The miner descended in a [BLANK1] cage down the shaft. Headlamps cut [BLANK2] beams through black dust. Air grew [BLANK3] thin with every level. Ore carts rattled on [BLANK4] rails below. Underground work demands [BLANK5] respect.",
    ["creaking", "thin", "dangerously", "rusted", "serious"],
    "smooth|wide|safely|new|casual",
  ),
  S(
    "The sommelier swirled wine in a [BLANK1] glass. Aroma rose with [BLANK2] hints of berry. The vineyard's soil tasted [BLANK3] almost in each sip. Guests listened with [BLANK4] attention. Fine dining blends science and [BLANK5] art.",
    ["crystal", "subtle", "somehow", "polite", "pure"],
    "plastic|strong|never|rude|rough",
  ),
  S(
    "The paramedic secured the stretcher with [BLANK1] straps. Sirens wailed [BLANK2] through the intersection. Traffic parted with [BLANK3] urgency. The hospital doors slid open [BLANK4] wide. Saving minutes can mean saving [BLANK5] lives.",
    ["nylon", "loudly", "frantic", "automatically", "multiple"],
    "loose|softly|calm|manually|single",
  ),
  S(
    "The weaver threaded the loom with [BLANK1] cotton. Patterns emerged row by [BLANK2] patient row. Colours shifted from [BLANK3] pale to bold. The shuttle moved with [BLANK4] rhythm. Textiles tell stories as [BLANK5] old as civilization.",
    ["organic", "slow", "softly", "musical", "ancient"],
    "synthetic|quick|suddenly|broken|young",
  ),
  S(
    "The referee showed a [BLANK1] card after the foul. Players argued with [BLANK2] gestures on the field. The crowd booed in [BLANK3] waves. Fair play rules exist for a [BLANK4] reason. Passion without control turns [BLANK5] ugly fast.",
    ["yellow", "angry", "rolling", "solid", "pretty"],
    "red|calm|silent|weak|truly",
  ),
  S(
    "The geologist tapped a [BLANK1] rock with her hammer. Layers revealed a [BLANK2] timeline in stone. Fossils waited [BLANK3] patiently inside the cliff. Field notes filled a [BLANK4] notebook by dusk. Earth keeps [BLANK5] secrets longer than we do.",
    ["gray", "hidden", "almost", "waterproof", "older"],
    "smooth|obvious|never|paper|newer",
  ),
  S(
    "The midwife spoke in a [BLANK1] voice during delivery. Breathing stayed [BLANK2] steady with each wave. The room smelled of [BLANK3] antiseptic and hope. A first cry sounded [BLANK4] loud and healthy. New life arrives with [BLANK5] wonder.",
    ["calm", "remarkably", "sharp", "beautifully", "pure"],
    "loud|barely|sweet|weakly|fake",
  ),
  S(
    "The ranger tracked paw prints in [BLANK1] mud. Branches snapped [BLANK2] somewhere ahead. Binoculars revealed a [BLANK3] bear with two cubs. Distance kept everyone [BLANK4] safe. Wilderness rewards [BLANK5] patience.",
    ["fresh", "loudly", "brown", "reasonably", "quiet"],
    "dry|softly|black|perfectly|impatient",
  ),
  S(
    "The banker reviewed a [BLANK1] loan application at closing time. Numbers had to match with [BLANK2] exactness. Signatures waited in [BLANK3] neat stacks. Interest rates shifted [BLANK4] weekly that year. Trust builds on [BLANK5] transparency.",
    ["complex", "painstaking", "perfectly", "almost", "financial"],
    "simple|rough|messy|never|emotional",
  ),
  S(
    "The goalie blocked a [BLANK1] shot at the net. Ice sprayed in [BLANK2] crystals across his mask. Teammates cheered with [BLANK3] relief. Overtime loomed like a [BLANK4] shadow. One save can change an [BLANK5] entire season.",
    ["blazing", "tiny", "huge", "long", "entire"],
    "slow|huge|mild|short|half",
  ),
  S(
    "The violinist tuned each string to [BLANK1] perfection. Rosin dust floated in [BLANK2] light from the window. The concert hall waited in [BLANK3] silence. First notes hung [BLANK4] fragile in the air. Practice turns talent into something [BLANK5] lasting.",
    ["near", "pale", "expectant", "almost", "truly"],
    "far|bright|noisy|boldly|barely",
  ),
  S(
    "The cartographer drew coastlines with [BLANK1] ink. Islands appeared as [BLANK2] dots on vellum. Compass roses added [BLANK3] decoration and direction. Errors at sea could prove [BLANK4] deadly. Maps lie [BLANK5] sometimes by omission.",
    ["indigo", "tiny", "elegant", "fatally", "honestly"],
    "red|huge|plain|safely|never",
  ),
  S(
    "The falconer released the bird on a [BLANK1] signal. Wings spread with [BLANK2] sudden power. Prey moved [BLANK3] unseen in the grass below. Training bonds human and animal in [BLANK4] trust. Wild instincts stay [BLANK5] close beneath the hood.",
    ["silent", "explosive", "invisible", "fragile", "always"],
    "loud|gentle|obvious|deep|never",
  ),
  S(
    "The chemist measured powder on a [BLANK1] scale. Goggles fogged [BLANK2] slightly from the heat. The reaction bubbled with [BLANK3] green foam. Lab notes recorded every [BLANK4] variable. Discovery often starts with a [BLANK5] careful mistake.",
    ["precise", "annoyingly", "bright", "tiny", "small"],
    "rough|clearly|dull|huge|giant",
  ),
  S(
    "The zoologist tagged a [BLANK1] turtle on the beach. Moonlight guided hatchlings toward the [BLANK2] waves. Predators waited [BLANK3] hungry beyond the dunes. Conservation work feels [BLANK4] endless but vital. Each nest saved is a [BLANK5] quiet victory.",
    ["mother", "rolling", "patiently", "almost", "small"],
    "baby|still|angrily|totally|loud",
  ),
  S(
    "The pilot (small plane) checked fuel with a [BLANK1] dipstick. Wind sock pointed [BLANK2] stiff toward the east. Takeoff roll felt [BLANK3] shorter than memory. Clouds stacked in [BLANK4] towers ahead. Freedom above farmland stays [BLANK5] addictive.",
    ["wooden", "oddly", "surprisingly", "white", "dangerously"],
    "metal|normally|exactly|grey|safely",
  ),
  S(
    "The poet read lines in a [BLANK1] café corner. Espresso cups clinked with [BLANK2] rhythm behind him. Metaphors landed [BLANK3] softly or not at all. Open mic night draws [BLANK4] brave souls weekly. Words can wound or heal with [BLANK5] equal ease.",
    ["crowded", "steady", "only", "remarkably", "almost"],
    "empty|random|harshly|rarely|never",
  ),
  S(
    "The mechanic slid under the car on a [BLANK1] creeper. Oil dripped in [BLANK2] slow beads. The engine knock sounded [BLANK3] worse than yesterday. Tools clattered in [BLANK4] metal trays overhead. Honest repair builds [BLANK5] loyalty.",
    ["rolling", "dark", "definitely", "organized", "customer"],
    "fixed|bright|maybe|messy|driver",
  ),
  S(
    "The diplomat chose [BLANK1] words at the tense summit. Interpreters whispered in [BLANK2] urgent tones. A treaty hung on one [BLANK3] comma. Silence stretched [BLANK4] painfully long. Peace talks reward [BLANK5] infinite patience.",
    ["careful", "rapidly", "single", "almost", "endless"],
    "careless|slowly|whole|briefly|little",
  ),
  S(
    "The sculptor chipped marble until a face [BLANK1] emerged. Dust coated the floor in [BLANK2] white powder. Each strike removed what was [BLANK3] unnecessary. Art hides inside stone [BLANK4] waiting. Creation demands [BLANK5] subtraction.",
    ["slowly", "fine", "truly", "patiently", "ruthless"],
    "quickly|coarse|barely|angrily|gentle",
  ),
  S(
    "The watchmaker adjusted a [BLANK1] spring under glass. Gears meshed with [BLANK2] whisper precision. Time itself seemed [BLANK3] smaller on the bench. A dropped screw could mean [BLANK4] disaster. Patience measures success in [BLANK5] ticks.",
    ["tiny", "barely", "manageable", "total", "minute"],
    "huge|loudly|huge|minor|giant",
  ),
  S(
    "The firefighter climbed a [BLANK1] ladder through smoke. Heat pressed [BLANK2] against visors. Voices crackled on [BLANK3] radios below. A child waved from a [BLANK4] window ledge. Courage is trained until it feels [BLANK5] automatic.",
    ["shaking", "hard", "tinny", "high", "almost"],
    "steady|softly|clear|low|never",
  ),
  S(
    "The botanist pressed a [BLANK1] leaf between paper sheets. Latin names filled the [BLANK2] margins in ink. The specimen dried [BLANK3] flat over weeks. Herbarium drawers slid with a [BLANK4] wooden hush. Cataloguing life teaches [BLANK5] humility.",
    ["crisp", "narrow", "perfectly", "soft", "quiet"],
    "wilted|wide|badly|loud|loud",
  ),
  S(
    "The jeweler set a [BLANK1] stone in silver prongs. Loupe revealed [BLANK2] flaws invisible to shoppers. Polishing cloths turned [BLANK3] gray with use. Light caught facets in [BLANK4] rainbow flashes. Beauty sells faster with [BLANK5] story.",
    ["tiny", "microscopic", "dull", "brief", "any"],
    "huge|obvious|bright|endless|no",
  ),
  S(
    "The baker scored dough with a [BLANK1] razor before baking. Steam escaped in [BLANK2] sharp hisses. Crust turned [BLANK3] golden by instinct. Customers lined up with [BLANK4] hungry patience. Simple bread still feels [BLANK5] miraculous warm.",
    ["sharp", "quick", "perfectly", "visible", "almost"],
    "dull|slow|badly|hidden|totally",
  ),
  S(
    "The sailor tied a [BLANK1] knot that would not slip. Rope burned [BLANK2] palms in the gale. Lightning forked [BLANK3] violet across clouds. The horizon lurched [BLANK4] wild each wave. Survival skills stay [BLANK5] muscle memory.",
    ["double", "raw", "angrily", "dangerously", "pure"],
    "loose|smooth|softly|calmly|forgotten",
  ),
  S(
    "The detective studied fingerprints under [BLANK1] ultraviolet light. Evidence bags waited in [BLANK2] neat rows. A timeline clicked [BLANK3] suddenly into place. Justice moves [BLANK4] slower than TV suggests. Truth costs [BLANK5] someone almost always.",
    ["harsh", "perfectly", "all", "far", "someone"],
    "soft|messily|never|faster|nothing",
  ),
  S(
    "The barista poured latte art with [BLANK1] steady hands. Milk steamed to [BLANK2] silky microfoam. The café smelled of [BLANK3] roasted beans and rain. Regulars nodded in [BLANK4] quiet recognition. Morning rituals anchor [BLANK5] whole cities.",
    ["remarkably", "perfect", "freshly", "familiar", "whole"],
    "shakily|broken|stale|strange|tiny",
  ),
  S(
    "The skier carved [BLANK1] turns through powder. Trees blurred [BLANK2] past in green streaks. Altitude made breath feel [BLANK3] thin. Sun glare off snow was [BLANK4] brutal. Mountains teach respect in [BLANK5] vertical lessons.",
    ["tight", "rapidly", "dangerously", "almost", "steep"],
    "wide|slowly|safely|barely|flat",
  ),
  S(
    "The farmer irrigated rows with [BLANK1] drip lines. Soil drank [BLANK2] slowly in the heat. Drought maps turned [BLANK3] red that summer. Every drop counted [BLANK4] double. Agriculture faces [BLANK5] harder seasons ahead.",
    ["plastic", "water", "angrily", "almost", "much"],
    "metal|fast|green|barely|fewer",
  ),
];

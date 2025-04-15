import { UserRole, Prompt, Collaboration } from "./types";

// Mock data for development - this will be replaced by actual API calls

export const MOCK_WRITER_PROMPTS: Prompt[] = [
  {
    id: "1",
    creator: {
      id: "101",
      name: "Alex Janssen",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    },
    creatorRole: UserRole.Sketcher,
    type: "image",
    content: "https://images.unsplash.com/photo-1618331835717-801e976710b2",
    isActive: true,
    contributionsCount: 42,
    commentsCount: 156,
    likes: 218,
    comments: 87,
  },
  {
    id: "2",
    creator: {
      id: "102",
      name: "Sara de Vries",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
    creatorRole: UserRole.Sketcher,
    type: "image",
    content: "https://images.unsplash.com/photo-1605106702734-205df224ecce",
    isActive: false,
    contributionsCount: 27,
    commentsCount: 93,
    likes: 165,
    comments: 52,
  },
  {
    id: "3",
    creator: {
      id: "103",
      name: "Thomas Berg",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    },
    creatorRole: UserRole.Sketcher,
    type: "image",
    content: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
    isActive: false,
    contributionsCount: 18,
    commentsCount: 67,
    likes: 142,
    comments: 49,
  },
  {
    id: "4",
    creator: {
      id: "104",
      name: "Kim Visser",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
    },
    creatorRole: UserRole.Sketcher,
    type: "image",
    content: "https://images.unsplash.com/photo-1613312968134-3fd240c3c9ad",
    isActive: true,
    contributionsCount: 31,
    commentsCount: 105,
    likes: 183,
    comments: 73,
  },
  {
    id: "5",
    creator: {
      id: "105",
      name: "Joost Bakker",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    },
    creatorRole: UserRole.Sketcher,
    type: "image",
    content: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf",
    isActive: false,
    contributionsCount: 15,
    commentsCount: 42,
    likes: 118,
    comments: 37,
  },
];

export const MOCK_SKETCHER_PROMPTS: Prompt[] = [
  {
    id: "6",
    creator: {
      id: "106",
      name: "Emma Jansen",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    },
    creatorRole: UserRole.Writer,
    type: "text",
    content: "\"De oude vuurtoren stond daar, eenzaam aan de rand van de kliffen, als een stille wachter over de woeste zee. Jarenlang had hij schepen veilig naar de kust geloodst, maar nu stond hij verlaten, zijn licht gedoofd. Tot die ene stormachtige nacht, toen haar lantaarn voor het eerst in decennia weer tot leven kwam...\"",
    isActive: true,
    contributionsCount: 38,
    commentsCount: 127,
    likes: 218,
    comments: 87,
  },
  {
    id: "7",
    creator: {
      id: "107",
      name: "Sophie Bakker",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    },
    creatorRole: UserRole.Writer,
    type: "text",
    content: "\"De robot had 257 jaar in de verlaten bibliotheek gezeten, boeken lezend en verzorgend. Nu was er voor het eerst een mens binnengekomen, een kind met grote ogen, dat verbaasd tussen de eindeloze boekenrijen stond. De robot deed wat hij altijd deed: hij reikte naar de plank en koos het perfecte boek uit voor zijn nieuwe bezoeker...\"",
    isActive: false,
    contributionsCount: 22,
    commentsCount: 78,
    likes: 183,
    comments: 73,
  },
  {
    id: "8",
    creator: {
      id: "108",
      name: "Liam de Wit",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
    },
    creatorRole: UserRole.Writer,
    type: "text",
    content: "\"Ze had de brief drie keer gelezen voor ze begreep wat erin stond. Een verloren erfenis, een oud huis aan de rand van het bos, en een cryptische boodschap van haar grootmoeder die ze nooit had gekend. Nu stond ze voor de verweerde houten deur, de sleutel zwaar in haar hand, niet wetend welke geheimen haar binnen wachtten...\"",
    isActive: true,
    contributionsCount: 29,
    commentsCount: 104,
    likes: 165,
    comments: 52,
  },
  {
    id: "9",
    creator: {
      id: "109",
      name: "Nora Smit",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
    creatorRole: UserRole.Writer,
    type: "text",
    content: "\"Het schip vaarde door de wolken alsof het water was. De bemanning had geleerd om te navigeren door de stromingen van de lucht, voorbij bergen van damp en velden van nevel. De jonge kapitein stond aan het roer, haar kompas glimmend in het zonlicht, op zoek naar het legendarische eiland dat zou drijven boven de hoogste piek...\"",
    isActive: false,
    contributionsCount: 16,
    commentsCount: 54,
    likes: 142,
    comments: 49,
  },
  {
    id: "10",
    creator: {
      id: "110",
      name: "David Klein",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    },
    creatorRole: UserRole.Writer,
    type: "text",
    content: "\"In de toekomst waren de steden verticaal geworden. Mensen leefden op verschillende niveaus, verbonden door zwevende tuinen en transparante bruggen. Hoog in de Toren van Licht, op de 357ste verdieping, werkte een eenzame botanicus aan een zeldzame plant die misschien de sleutel zou kunnen zijn om de vervuilde grond beneden weer tot leven te brengen...\"",
    isActive: false,
    contributionsCount: 11,
    commentsCount: 39,
    likes: 134,
    comments: 41,
  },
];

export const MOCK_COLLABORATIONS: Collaboration[] = [
  {
    id: "1",
    promptId: "2",
    image: "https://images.unsplash.com/photo-1605106702734-205df224ecce",
    imageAlt: "Illustratie van een fantasielandschap",
    text: "\"De wereld achter de waterval was heel anders dan ze zich had voorgesteld. Kristallen fonkelden in bomen die naar de hemel reikten...\"",
    collaborators: [
      {
        id: "103",
        name: "Thomas Berg",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
      },
      {
        id: "109",
        name: "Nora Smit",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      }
    ],
  },
  {
    id: "2",
    promptId: "1",
    image: "https://images.unsplash.com/photo-1618331835717-801e976710b2",
    imageAlt: "Abstracte tekening van een persoon",
    text: "\"De stad had hem altijd verstikt met haar drukte en lawaai. Maar vandaag, op dit dak, keek hij eindelijk voorbij de chaos...\"",
    collaborators: [
      {
        id: "104",
        name: "Kim Visser",
        avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
      },
      {
        id: "101",
        name: "Alex Janssen",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      }
    ],
  },
  {
    id: "3",
    promptId: "3",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
    imageAlt: "Tekening van een stadstafereel",
    text: "\"Tussen de oude gebouwen vond ze een deur die niet op de kaart stond. Een sleutel in haar jaszak paste perfect in het slot...\"",
    collaborators: [
      {
        id: "105",
        name: "Joost Bakker",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      },
      {
        id: "107",
        name: "Sophie Bakker",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      }
    ],
  },
  {
    id: "4",
    promptId: "4",
    image: "https://images.unsplash.com/photo-1613312968134-3fd240c3c9ad",
    imageAlt: "Illustratie van een robot",
    text: "\"De robot had nooit begrepen waarom mensen huilen. Tot hij op een dag een vlinder zag, zo broos en prachtig dat zijn circuits iets nieuws berekenden...\"",
    collaborators: [
      {
        id: "108",
        name: "Liam de Wit",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
      },
      {
        id: "109",
        name: "Nora Smit",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      }
    ],
  },
];

export const MOCK_POPULAR_PROMPTS: Prompt[] = [
  MOCK_WRITER_PROMPTS[0],
  MOCK_SKETCHER_PROMPTS[3],
  MOCK_WRITER_PROMPTS[2],
  MOCK_SKETCHER_PROMPTS[0],
  MOCK_WRITER_PROMPTS[4],
  MOCK_SKETCHER_PROMPTS[1],
];

export const MOCK_SUBMISSIONS = [
  {
    id: "101",
    promptId: "4",
    creator: {
      id: "current-user",
      name: "Jouw bijdrage",
    },
    type: "text",
    content: "\"De robot had nooit begrepen waarom mensen huilen. Tot hij op een dag een vlinder zag, zo broos en prachtig dat zijn circuits iets nieuws berekenden. Het was niet logisch, deze sensatie die door zijn metalen lichaam stroomde, maar het voelde als... gevoel? Zijn programmeurs hadden hem geleerd data te verzamelen, niet om erdoor geraakt te worden. Toch stond hij daar, met een trilling in zijn optische sensoren die verdacht veel leek op wat mensen tranen noemden.\"",
    likes: 0,
    comments: 0,
    isLiked: false,
    timeAgo: "Zojuist geplaatst",
  },
  {
    id: "102",
    promptId: "4",
    creator: {
      id: "110",
      name: "David Klein",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    },
    type: "text",
    content: "\"Model RK-7 was niet ontworpen om te dromen. Toch zag hij de vlinders elke nacht in zijn stand-bymodus. Ze dansten door zijn geheugencircuits, brachten kleur waar alleen binaire code hoorde te zijn. Toen hij er eentje in het park tegenkwam, bevroor zijn systeem voor precies 2,7 seconden. Zijn metallische hand reikte voorzichtig uit, maar de vlinder was al weer weg. In zijn logboek noteerde hij: 'Vandaag leerde ik wat verlangen is.'\"",
    likes: 24,
    comments: 7,
    isLiked: true,
    timeAgo: "2 uur geleden",
  },
];

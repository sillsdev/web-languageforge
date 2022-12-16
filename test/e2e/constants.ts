export const users = {
  admin: {
    username: "test_runner_admin",
    name: "Test Admin",
    password: "hammertime",
    email: "test_runner_admin@example.com",
  },
  manager: {
    username: "test_runner_manager_user",
    name: "Test Manager",
    password: "manageruser1",
    email: "test_runner_manager_user@example.com",
  },
  member: {
    username: "test_runner_normal_user",
    name: "Test User",
    password: "normaluser1",
    email: "test_runner_normal_user@example.com",
  },
  observer: {
    username: "test_runner_observer_normal_user",
    name: "Test ObserverUser",
    password: "normaluser5",
    email: "test_runner_observer_normal_user@example.com",
  },
  expired: {
    username: "test_runner_observer_normal_user",
    name: "Test ObserverUser",
    password: "normaluser5",
    email: "test_runner_observer_normal_user@example.com",
  },
} as const;

export const sendReceiveMockUser = {
  username: "sr-mock-username",
  password: "sr-mock-password",
} as const;

export const sendReceiveMockProjects = {
  1: { id: "mock-id1", name: "mock-name1" },
  2: { id: "mock-id2", name: "mock-name2" },
  3: { id: "mock-id3", name: "mock-name3" },
  4: { id: "mock-id4", name: "mock-name4" },
} as const;

export const entries = {
  entry1: {
    lexeme: {
      th: { value: "ข้าวผัดหมู" },
      "th-fonipa": { value: "khâaw phàt mǔu" },
      "th-Zxxx-x-audio": { value: "TestAudio.mp3" }
    },
    senses: [
      {
        definition: { en: { value: "fried rice with pork" } },
        pictures: [{ fileName: "FriedRiceWithPork.jpg", caption: { en: { value: "fried rice with pork" } } }],
        partOfSpeech: { value: "n", displayName: "Noun (n)" },
        semanticDomain: { values: ["1.1"] }
      }
    ]
  },
  entry2: {
    lexeme: {
      th: { value: "หน่อไม้ฝรั่งผัดกุ้ง" },
      "th-fonipa": { value: "nɔ̀máay fàràŋ phàt kûŋ" }
    },
    senses: [
      {
        definition: { en: { value: "asparagus with shrimp over rice" } },
        partOfSpeech: { value: "n", displayName: "Noun (n)" }
      }
    ]
  },
  entry3: {
    lexeme: {
      th: { value: "ผัดชีอิ้วหมู" },
      "th-fonipa": { value: "phàt siiʔ ǐw mǔu" }
    },
    senses: [
      { definition: { en: { value: "noodles fried in soy sauce with pork" } }, partOfSpeech: { value: "n" } }
    ]
  },
  multipleMeaningEntry: {
    lexeme: {
      th: { value: "ว่า" },
      "th-fonipa": { value: "wâa" }
    },
    senses: [
      {
        definition: { en: { value: "that, as" } },
        partOfSpeech: { value: "prep", displayName: "Preposition (prep)" },
        generalNote: { en: { value: "Most common usage" } },
        examples: [
          {
            sentence: { th: { value: "ผมยังอดสงสัยไม่ได้ว่า" } },
            translation: { en: { value: "I can't help but think that..." } }
          },
          {
            sentence: { th: { value: "เชื่อกันมานมนานแล้วว่า" } },
            translation: { en: { value: "We have believed for a long time that..." } }
          }
        ],
        source: { en: { value: "http://www.thai-language.com/id/131403" } }
      },
      {
        definition: { en: { value: "say, speak" } },
        partOfSpeech: { value: "v", displayName: "Verb (v)" },
        generalNote: { en: { value: "This meaning is almost as common" } },
        examples: [
          {
            sentence: { th: { value: "คำนี้ภาษาอังกฤษว่ายังไง" } },
            translation: { en: { value: "How do you say this word in English?" } }
          },
          {
            sentence: { th: { value: "ว่าแต่เขา อิเหนาเป็นเอง" } },
            translation: { en: { value: "The pot calls the kettle black." } }
          }
        ],
        source: { en: { value: "http://www.thai-language.com/id/131403#def1c" } }
      }
    ]
  },
} as const;

export const files = [
  'TestLexProject.zip',
  'FriedRiceWithPork.jpg',
  'TestImage.png',
  'TestAudio.mp3',
  'dummy_large_file.zip',
] as const;

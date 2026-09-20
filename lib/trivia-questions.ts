export type TriviaCategory = "History" | "Pop Culture" | "General Knowledge";
export type TriviaDifficulty = "easy" | "medium" | "hard";

export interface TriviaQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  answer: number; // 0-indexed
  category: TriviaCategory;
  difficulty: TriviaDifficulty;
  explanation?: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // ─── HISTORY ──────────────────────────────────────────────────────────────
  {
    id: "h001", question: "In what year did Nigeria gain independence from Britain?",
    options: ["1957", "1960", "1963", "1965"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Nigeria gained independence on October 1, 1960, from British colonial rule."
  },
  {
    id: "h002", question: "Who was Nigeria's first Prime Minister at independence?",
    options: ["Nnamdi Azikiwe", "Obafemi Awolowo", "Abubakar Tafawa Balewa", "Ahmadu Bello"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "Sir Abubakar Tafawa Balewa served as Nigeria's first Prime Minister from 1960 until his assassination in the January 1966 coup."
  },
  {
    id: "h003", question: "Who was Nigeria's first President?",
    options: ["Obafemi Awolowo", "Nnamdi Azikiwe", "Yakubu Gowon", "Tafawa Balewa"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Dr. Nnamdi Azikiwe (Zik) became Nigeria's first President on October 1, 1963, when Nigeria became a republic."
  },
  {
    id: "h004", question: "The Biafran War lasted from 1967 to which year?",
    options: ["1968", "1969", "1970", "1971"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "The Nigerian Civil War (Biafran War) began in July 1967 and ended in January 1970 with the defeat of the Republic of Biafra."
  },
  {
    id: "h005", question: "Which military general led Nigeria during the Biafran War?",
    options: ["Sani Abacha", "Ibrahim Babangida", "Yakubu Gowon", "Murtala Muhammed"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "General Yakubu Gowon led the federal government during the Nigerian Civil War."
  },
  {
    id: "h006", question: "What was the name of the ancient empire that controlled a large part of northern Nigeria?",
    options: ["Oyo Empire", "Kanem-Bornu Empire", "Benin Kingdom", "Nri Kingdom"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Kanem-Bornu Empire was one of the longest-lasting empires in Africa, existing around Lake Chad for nearly a millennium."
  },
  {
    id: "h007", question: "The Sokoto Caliphate was founded in 1804 by which leader?",
    options: ["Dan Fodio's son Bello", "Usman dan Fodio", "Muhammadu Attahiru I", "Umar Tal"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Usman dan Fodio launched the Fulani jihad in 1804, leading to the establishment of the Sokoto Caliphate."
  },
  {
    id: "h008", question: "In which year did Nigeria become a Republic?",
    options: ["1960", "1961", "1963", "1966"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "Nigeria became a Republic on October 1, 1963, replacing the Queen as head of state with a President."
  },
  {
    id: "h009", question: "Which Nigerian leader was awarded the Nobel Peace Prize in 1986?",
    options: ["Chinua Achebe", "Wole Soyinka", "Ken Saro-Wiwa", "Fela Kuti"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Wole Soyinka became the first African to receive the Nobel Prize in Literature in 1986."
  },
  {
    id: "h010", question: "The January 1966 coup that killed Tafawa Balewa was led primarily by officers from which ethnic group?",
    options: ["Hausa-Fulani", "Yoruba", "Igbo", "Ijaw"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "The January 1966 coup was primarily carried out by Igbo officers, including Major Chukwuma Kaduna Nzeogwu."
  },
  {
    id: "h011", question: "What was the Amalgamation of 1914?",
    options: ["The merger of Lagos Colony with Gold Coast", "The joining of Northern and Southern Nigeria by the British", "The formation of the West African Federation", "The merger of Nigeria and Cameroon"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Lord Frederick Lugard merged the Northern and Southern Protectorates of Nigeria in 1914, creating modern Nigeria."
  },
  {
    id: "h012", question: "Which Nigerian activist was executed by the Abacha regime in 1995?",
    options: ["Wole Soyinka", "Ken Saro-Wiwa", "Gani Fawehinmi", "Beko Ransome-Kuti"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Ken Saro-Wiwa, a Ogoni activist and writer, was executed by the Abacha military government along with eight other Ogoni activists."
  },
  {
    id: "h013", question: "The Aba Women's Riots of 1929 were a protest against what?",
    options: ["Forced marriage laws", "British taxation and colonial rule", "Slave trade", "Land seizure by missionaries"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Aba Women's Riots (or Igbo Women's War) were a mass uprising by Igbo and other women protesting British taxation policies."
  },
  {
    id: "h014", question: "Which pre-colonial empire was famous for its bronze artworks, now known as the Benin Bronzes?",
    options: ["Oyo Empire", "Nok Culture", "Kingdom of Benin", "Kanem-Bornu"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "The Kingdom of Benin (in present-day Edo State) produced thousands of intricate bronze plaques and sculptures, many of which were looted by the British in 1897."
  },
  {
    id: "h015", question: "Who was Nigeria's leader when it transitioned to civilian rule in 1999?",
    options: ["Sani Abacha", "Abdulsalami Abubakar", "Ernest Shonekan", "Ibrahim Babangida"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "General Abdulsalami Abubakar oversaw the transition to democracy in 1999, handing over power to elected President Olusegun Obasanjo."
  },
  {
    id: "h016", question: "What does MKO Abiola's 'MKO' stand for?",
    options: ["Musiliu Kayode Oladapo", "Moshood Kashimawo Olawale", "Mohammed Kasim Olumide", "Mathew Kolawole Okafor"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "MKO Abiola's full name was Moshood Kashimawo Olawale Abiola."
  },
  {
    id: "h017", question: "In which year was the June 12 election, widely believed to have been won by Abiola, annulled?",
    options: ["1992", "1993", "1994", "1995"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The June 12, 1993 presidential election, widely accepted as the freest and fairest in Nigerian history, was annulled by General Babangida."
  },
  {
    id: "h018", question: "The Nok culture is believed to be one of the earliest known cultures in sub-Saharan Africa to produce what?",
    options: ["Gold jewelry", "Iron tools", "Terracotta figurines", "Bronze sculptures"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "The Nok culture (c. 1500 BC–200 AD) in central Nigeria is famous for its sophisticated terracotta figurines."
  },
  {
    id: "h019", question: "Which general overthrew the government of Shehu Shagari in 1983?",
    options: ["Sani Abacha", "Muhammadu Buhari", "Ibrahim Babangida", "Yakubu Gowon"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Major General Muhammadu Buhari led the coup that ousted civilian President Shehu Shagari on December 31, 1983."
  },
  {
    id: "h020", question: "What was the name of the nationalist newspaper founded by Nnamdi Azikiwe?",
    options: ["Daily Times", "West African Pilot", "Nigerian Tribune", "The Vanguard"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Zik founded the West African Pilot in 1937, which became a powerful voice for Nigerian nationalism."
  },
  {
    id: "h021", question: "What is the name of the traditional leadership institution in the Hausa-Fulani north?",
    options: ["Obas", "Chiefs", "Emirs", "Igwes"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "Emirs are the traditional rulers in the predominantly Muslim Hausa-Fulani north of Nigeria."
  },
  {
    id: "h022", question: "Who led the July 1966 counter-coup that brought Yakubu Gowon to power?",
    options: ["Murtala Muhammed", "Theophilus Danjuma", "Emeka Ojukwu", "Hassan Katsina"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Colonel Murtala Muhammed was a key figure in the northern counter-coup of July 1966, which led to Gowon becoming head of state."
  },
  {
    id: "h023", question: "Nigeria's civil war ended with a famous proclamation. What was the phrase used?",
    options: ["'No Victor, No Vanquished'", "'One Nigeria, One Destiny'", "'Unity in Diversity'", "'Peace and Progress'"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Gowon's post-war declaration 'No Victor, No Vanquished' was a call for national reconciliation."
  },
  {
    id: "h024", question: "The Oyo Empire rose to prominence on the back of which animal?",
    options: ["Elephant", "Camel", "Horse", "Cattle"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The Oyo Empire built one of West Africa's most powerful armies around cavalry, with thousands of horses."
  },
  {
    id: "h025", question: "Which colonial official is credited with governing Nigeria under the policy of 'Indirect Rule'?",
    options: ["George Goldie", "Frederick Lugard", "Herbert Macaulay", "John Glover"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Lord Frederick Lugard pioneered the system of Indirect Rule in Northern Nigeria, governing through existing traditional rulers."
  },
  {
    id: "h026", question: "Herbert Macaulay is often called the father of what?",
    options: ["Nigerian journalism", "Nigerian nationalism", "Nigerian independence", "Nigerian democracy"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Herbert Macaulay (1864–1946) is widely regarded as the father of Nigerian nationalism."
  },
  {
    id: "h027", question: "Which of the following was NOT a colonial region of pre-independence Nigeria?",
    options: ["Northern Protectorate", "Eastern Protectorate", "Western Region", "Colony of Lagos"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "There was no 'Eastern Protectorate' as such; the British administered the 'Southern Protectorate' before the 1914 amalgamation."
  },
  {
    id: "h028", question: "The Arewa Consultative Forum primarily represents the interests of which region?",
    options: ["South-South", "South-East", "North", "South-West"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The Arewa Consultative Forum is a political and social organization that represents northern Nigerian interests."
  },
  {
    id: "h029", question: "In what year was oil first commercially exported from Nigeria?",
    options: ["1956", "1958", "1960", "1963"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Crude oil was first exported from Nigeria in 1958, two years after its discovery in Oloibiri by Shell."
  },
  {
    id: "h030", question: "The Kano Riot of 1953 was triggered by a political disagreement over what?",
    options: ["Oil revenue", "Self-government motion", "Land reform", "Regional taxation"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The 1953 Kano Riot erupted when northern Nigerians clashed with Action Group supporters over the self-government motion in Lagos."
  },
  {
    id: "h031", question: "Which region did Obafemi Awolowo lead as Premier?",
    options: ["Northern Region", "Eastern Region", "Western Region", "Mid-Western Region"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "Awolowo was Premier of the Western Region from 1954 to 1959."
  },
  {
    id: "h032", question: "The first military coup in Nigeria took place in which month and year?",
    options: ["July 1965", "January 1966", "July 1966", "February 1967"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Nigeria's first military coup occurred on January 15, 1966, led by Major Nzeogwu and other young military officers."
  },
  {
    id: "h033", question: "Which famous Yoruba king is credited with founding the city of Ibadan?",
    options: ["Adekunle Ajasin", "Oluyole", "Adeyemi Alao", "Oranmiyan"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Oluyole, a powerful Egba war chief, is credited with establishing Ibadan as a permanent settlement in the 1820s-1830s."
  },
  {
    id: "h034", question: "What is the significance of October 1 in Nigerian history?",
    options: ["Constitution Day", "Republic Day", "Independence Day", "Democracy Day"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "October 1 is Nigerian Independence Day, commemorating independence from British rule in 1960."
  },
  {
    id: "h035", question: "General Sani Abacha ruled Nigeria from 1993 until what event ended his rule?",
    options: ["He was overthrown in a coup", "He was arrested", "He died in office", "He resigned after protests"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "Sani Abacha died suddenly on June 8, 1998, while still in power, reportedly from a heart attack."
  },
  {
    id: "h036", question: "Who was the Sardauna of Sokoto and Premier of the Northern Region?",
    options: ["Tafawa Balewa", "Ahmadu Bello", "Muhammadu Ribadu", "Ibrahim Waziri"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Ahmadu Bello, the Sardauna of Sokoto, was the Premier of Northern Nigeria and arguably the most powerful political figure in post-independence Nigeria before his assassination in 1966."
  },
  {
    id: "h037", question: "Operation Feed the Nation was a program introduced by which Nigerian leader?",
    options: ["Yakubu Gowon", "Olusegun Obasanjo", "Shehu Shagari", "Murtala Muhammed"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "General Olusegun Obasanjo launched Operation Feed the Nation (OFN) in 1976 to boost domestic food production."
  },
  {
    id: "h038", question: "The 'Zungeru Incident' of 1906 involved a British punitive expedition against which group?",
    options: ["The Itsekiri", "The Sokoto resistance", "The Satiru Mahdists", "The Benin fighters"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "The Satiru revolt in 1906 was a Mahdist uprising near Sokoto that was violently suppressed by the British."
  },
  {
    id: "h039", question: "The policy of 'Structural Adjustment Program' (SAP) was introduced in Nigeria under which leader?",
    options: ["Shehu Shagari", "Muhammadu Buhari", "Ibrahim Babangida", "Ernest Shonekan"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "General Ibrahim Babangida introduced the Structural Adjustment Program (SAP) in 1986, following World Bank and IMF guidance."
  },
  {
    id: "h040", question: "The famous Igbo-Ukwu bronzes discovered in 1939 date back to approximately which century?",
    options: ["5th century AD", "9th century AD", "13th century AD", "16th century AD"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The Igbo-Ukwu bronzes are believed to date from the 9th century AD, making them among the earliest known bronze artifacts from sub-Saharan Africa."
  },
  {
    id: "h041", question: "Which country was Nigeria's largest trading partner for most of the 20th century?",
    options: ["United States", "France", "United Kingdom", "Germany"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Britain was Nigeria's primary colonial ruler and remained the dominant trading partner for decades after independence."
  },
  {
    id: "h042", question: "The Egba women's tax revolt of 1947 happened in which city?",
    options: ["Lagos", "Ibadan", "Abeokuta", "Ife"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Funmilayo Ransome-Kuti led the women of Abeokuta in a mass protest against taxation and the Alake of Egbaland."
  },
  {
    id: "h043", question: "In 1977, Nigeria hosted which major global cultural event?",
    options: ["Commonwealth Games", "FESTAC '77 — World Black and African Festival", "Pan-African Congress", "Organization of African Unity Summit"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "FESTAC '77 (Second World Black and African Festival of Arts and Culture) was hosted in Lagos in 1977, showcasing Black and African culture globally."
  },
  {
    id: "h044", question: "Who wrote the Willink Commission report in 1958 that addressed fears of minority groups?",
    options: ["Lord Lugard", "Henry Willink", "Ronald Wraith", "James Robertson"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The Willink Commission, chaired by Henry Willink, was set up in 1957 to address minority concerns before Nigerian independence."
  },
  {
    id: "h045", question: "The Yoruba civil wars of the 19th century culminated in the famous 1886 treaty known as what?",
    options: ["The Ilorin Treaty", "The Kiriji Peace Agreement", "The Ekitiparapo Accord", "The Lagos Peace Treaty"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The Kiriji War (1878–1893) between Ibadan and the Ekitiparapo alliance was one of the most significant Yoruba civil conflicts of the era."
  },
  {
    id: "h046", question: "Which major Nigerian port city was known as 'the gateway to Africa' during the colonial era?",
    options: ["Warri", "Port Harcourt", "Apapa", "Lagos"],
    answer: 3, category: "History", difficulty: "easy",
    explanation: "Lagos was the primary port and administrative capital of colonial Nigeria, serving as a gateway for trade and commerce."
  },
  {
    id: "h047", question: "What does NCNC (the party of Azikiwe) stand for?",
    options: ["National Congress of Nigerian Citizens", "National Council of Nigerian Citizens", "Northern Committee for Nigerian Culture", "Nigerian Central National Congress"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The National Council of Nigerian Citizens (originally National Council of Nigeria and the Cameroons) was Zik's political party."
  },
  {
    id: "h048", question: "Which oil spill incident in 2010/2011 caused massive environmental damage in the Niger Delta?",
    options: ["Bodo oil spill", "Bonga oil spill", "Oloibiri spill", "Agip pipeline spill"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The Bodo oil spills in Ogoniland, Rivers State, caused one of the worst environmental disasters in the Niger Delta."
  },
  {
    id: "h049", question: "General Murtala Muhammed was assassinated in which year?",
    options: ["1974", "1975", "1976", "1977"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "General Murtala Muhammed was killed in a failed coup attempt on February 13, 1976, after less than seven months in power."
  },
  {
    id: "h050", question: "Obasanjo's first stint as head of state was as a military ruler. He handed over to civilians in which year?",
    options: ["1976", "1978", "1979", "1980"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Military ruler Olusegun Obasanjo handed over power to elected civilian President Shehu Shagari on October 1, 1979."
  },
  {
    id: "h051", question: "What was the name of Fela Kuti's commune and cultural hub in Lagos?",
    options: ["Kalakuta Nation", "Kalakuta Republic", "Fela's Shrine", "Africa 70 Camp"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Fela Kuti founded the Kalakuta Republic, a communal compound in Lagos that he declared independent from Nigeria."
  },
  {
    id: "h052", question: "Which Nigerian state was the 36th and last state to be created?",
    options: ["Zamfara", "Ebonyi", "Gombe", "Ekiti"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Zamfara State was the last of the 36 states to be created, carved out of Sokoto State in 1996 by the Abacha regime."
  },
  {
    id: "h053", question: "The famous 'Tiv riots' of the 1960s occurred in which region?",
    options: ["Eastern Region", "Western Region", "Northern Region", "Mid-Western Region"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "The Tiv riots occurred in the Middle Belt area of the Northern Region, reflecting long-standing tensions over land and governance."
  },
  {
    id: "h054", question: "What year did Nigeria join the Economic Community of West African States (ECOWAS)?",
    options: ["1973", "1975", "1978", "1980"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "ECOWAS was founded in Lagos on May 28, 1975, with Nigeria as a founding and leading member."
  },
  {
    id: "h055", question: "The Lugard Hall in Kaduna is named after which colonial figure?",
    options: ["Frederick Lugard", "Ralph Moor", "Walter Egerton", "William MacGregor"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Lord Frederick Lugard, who amalgamated Nigeria in 1914, is commemorated in the Lugard Hall."
  },
  {
    id: "h056", question: "Which Nigerian president introduced the National Economic Empowerment and Development Strategy (NEEDS)?",
    options: ["Shehu Shagari", "Ernest Shonekan", "Olusegun Obasanjo", "Goodluck Jonathan"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "President Obasanjo launched NEEDS in 2004 as Nigeria's medium-term economic development strategy."
  },
  {
    id: "h057", question: "Which famous Nigerian nationalist declared 'I am not an African who was made in England'?",
    options: ["Obafemi Awolowo", "Nnamdi Azikiwe", "Funmilayo Ransome-Kuti", "Herbert Macaulay"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Nnamdi Azikiwe was known for championing African identity and Pan-Africanism."
  },
  {
    id: "h058", question: "The Nigerian flag consists of which two colors?",
    options: ["Red and white", "Green and white", "Blue and green", "Green and gold"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The Nigerian flag has two vertical green stripes and a white stripe in the middle."
  },
  {
    id: "h059", question: "Who designed the Nigerian flag?",
    options: ["Taiwo Akinkunmi", "Chukwuemeka Odumegwu Ojukwu", "Adekunle Ajasin", "Herbert Ogunde"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Michael Taiwo Akinkunmi designed the Nigerian flag in 1959 as a student in London, winning a national competition."
  },
  {
    id: "h060", question: "The Trans-Saharan trade route connected ancient Nigerian kingdoms to which continent?",
    options: ["Asia", "Europe", "North Africa", "East Africa"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The Trans-Saharan trade route connected kingdoms like Kanem-Bornu and Hausa states to North African cities like Tripoli and Cairo."
  },
  {
    id: "h061", question: "Which Nigerian state capital is nicknamed 'The Centre of Excellence'?",
    options: ["Abuja", "Enugu", "Lagos", "Kano"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "Lagos is nicknamed 'Centre of Excellence' and also 'Eko' — it's the economic capital of Nigeria."
  },
  {
    id: "h062", question: "Nigeria's federal capital was moved from Lagos to Abuja in which year?",
    options: ["1987", "1989", "1991", "1993"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The Nigerian capital was officially moved from Lagos to Abuja on December 12, 1991."
  },
  {
    id: "h063", question: "The Enugu coal mine was developed during which colonial era, fuelling the Nigerian railway?",
    options: ["1880s", "1900s", "1910s–1930s", "1940s–1950s"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Enugu's coal mines were developed in the 1910s and became critical for the colonial economy, particularly the Nigerian Railway."
  },
  {
    id: "h064", question: "What is the name of the democratic transition programme that brought Nigeria back to civilian rule in 1999?",
    options: ["Operation Hope", "The Third Republic Programme", "Transition to Civil Rule Programme", "The Abubakar Roadmap"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "General Abdulsalami Abubakar's Transition to Civil Rule Programme successfully transitioned Nigeria to democracy in 1999."
  },
  {
    id: "h065", question: "Emeka Ojukwu was the military governor of which region before declaring Biafra?",
    options: ["Northern Region", "Western Region", "Eastern Region", "Mid-Western Region"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Odumegwu Ojukwu was military governor of the Eastern Region and declared the Republic of Biafra on May 30, 1967."
  },
  {
    id: "h066", question: "The Abeokuta Grammar School, one of Nigeria's oldest, was founded in which year?",
    options: ["1858", "1878", "1908", "1928"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Abeokuta Grammar School was founded in 1878 by the CMS, making it one of the oldest secondary schools in West Africa."
  },
  {
    id: "h067", question: "Operation Wetie was a campaign of political violence in which part of Nigeria in the 1960s?",
    options: ["Eastern Nigeria", "Northern Nigeria", "Western Nigeria", "Delta region"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Operation Wetie ('let us burn them') was a wave of political violence in Western Nigeria during the 1965 election crisis."
  },
  {
    id: "h068", question: "Nigeria's first university, University of Ibadan, was founded in what year?",
    options: ["1943", "1948", "1955", "1960"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "University of Ibadan was established in 1948 as a college of the University of London."
  },
  {
    id: "h069", question: "Who was Nigeria's president from 2010 to 2015?",
    options: ["Olusegun Obasanjo", "Umaru Musa Yar'Adua", "Goodluck Jonathan", "Muhammadu Buhari"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "Goodluck Jonathan became president in 2010 after the death of Umaru Musa Yar'Adua and was elected in his own right in 2011."
  },
  {
    id: "h070", question: "Which organization kidnapped 276 schoolgirls from Chibok, Borno State in 2014?",
    options: ["MEND", "MASSOB", "Boko Haram", "Niger Delta Avengers"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "Boko Haram kidnapped 276 Chibok schoolgirls in April 2014, triggering the global #BringBackOurGirls campaign."
  },

  // ─── POP CULTURE ────────────────────────────────────────────────────────────
  {
    id: "p001", question: "Which Nigerian musician is known as the 'African Giant'?",
    options: ["Wizkid", "Davido", "Burna Boy", "Tiwa Savage"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "Burna Boy (Damini Ebunoluwa Ogulu) is famously known as the 'African Giant.'"
  },
  {
    id: "p002", question: "What is the name of the music genre pioneered in Nigeria that blends African rhythms with Western pop?",
    options: ["Highlife", "Juju", "Afrobeats", "Fuji"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "Afrobeats is the globally popular genre originating from Nigeria that fuses African rhythms, highlife, hip-hop, and pop."
  },
  {
    id: "p003", question: "Fela Anikulapo-Kuti created which genre of music?",
    options: ["Afrobeats", "Afrobeat", "Highlife", "Juju"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Fela Kuti created Afrobeat (note: different from modern 'Afrobeats') — a fusion of jazz, funk, and traditional African music with political lyrics."
  },
  {
    id: "p004", question: "What is the name of Wizkid's smash hit featuring Drake?",
    options: ["Ojuelegba", "Come Closer", "One Dance", "Essence"],
    answer: 2, category: "Pop Culture", difficulty: "medium",
    explanation: "Wizkid was featured on Drake's 'One Dance,' which became a global number-one hit in 2016."
  },
  {
    id: "p005", question: "Davido's full name is?",
    options: ["David Adeleke Adekunle", "David Adedeji Adeleke", "David Idris Adamu", "David Olayinka Adeleke"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Davido's full name is David Adedeji Adeleke."
  },
  {
    id: "p006", question: "Which Nollywood film won the Oscar-nominated film for Nigeria's Academy Award submission in 2019?",
    options: ["Lionheart", "Oloture", "King of Boys", "October 1"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Lionheart (2018), directed by Genevieve Nnaji, was Nigeria's first submission for the Academy Award for Best International Feature Film, though it was disqualified."
  },
  {
    id: "p007", question: "Tiwa Savage is originally from which city?",
    options: ["Lagos", "Ibadan", "Kano", "Port Harcourt"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Tiwa Savage (Tiwatope Savage) was born in Isale Eko, Lagos."
  },
  {
    id: "p008", question: "What does 'Omo' mean in Yoruba slang?",
    options: ["Child / person / wow (expression)", "Goodbye", "Thank you", "Elder"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Omo' literally means 'child' in Yoruba but is widely used as a slang exclamation or to refer to someone."
  },
  {
    id: "p009", question: "Nigeria's Super Eagles won the Africa Cup of Nations in 2013. Who did they beat in the final?",
    options: ["Ivory Coast", "Ghana", "Mali", "Burkina Faso"],
    answer: 3, category: "Pop Culture", difficulty: "medium",
    explanation: "Nigeria defeated Burkina Faso 1-0 in the final of AFCON 2013, held in South Africa."
  },
  {
    id: "p010", question: "How many times has Nigeria won the Africa Cup of Nations (AFCON)?",
    options: ["1", "2", "3", "4"],
    answer: 2, category: "Pop Culture", difficulty: "medium",
    explanation: "Nigeria has won AFCON three times: 1980, 1994, and 2013."
  },
  {
    id: "p011", question: "The Nollywood film industry is the world's _____ largest film industry by output.",
    options: ["Largest", "Second largest", "Third largest", "Fourth largest"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Nollywood is the world's second largest film industry by volume of films produced, after Bollywood."
  },
  {
    id: "p012", question: "Which Nigerian author wrote 'Things Fall Apart'?",
    options: ["Wole Soyinka", "Ben Okri", "Chimamanda Ngozi Adichie", "Chinua Achebe"],
    answer: 3, category: "Pop Culture", difficulty: "easy",
    explanation: "Chinua Achebe's 'Things Fall Apart' (1958) is one of the most widely read African novels in history."
  },
  {
    id: "p013", question: "Chimamanda Ngozi Adichie's TED Talk was sampled in which Beyoncé song?",
    options: ["Lemonade", "***Flawless", "Formation", "Hold Up"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Chimamanda's TED Talk 'We Should All Be Feminists' was sampled in Beyoncé's ***Flawless."
  },
  {
    id: "p014", question: "What is the name of the yearly Lagos carnival celebrating arts and culture?",
    options: ["Lagos Festival", "Eyo Festival", "Lagos Carnival", "Eko Festival"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "The Eyo Festival is a unique Lagos masquerade festival with white-robed Eyo masquerades."
  },
  {
    id: "p015", question: "Which Nigerian musician created the album 'African Giant'?",
    options: ["Fela Kuti", "Davido", "Burna Boy", "Onyeka Onwenu"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "Burna Boy released the album 'African Giant' in 2019."
  },
  {
    id: "p016", question: "What is 'Owambe' in Nigerian pop culture?",
    options: ["A traditional dance", "A lavish party or celebration", "A type of street food", "A Yoruba blessing ceremony"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Owambe' refers to extravagant Nigerian parties and celebrations, known for their music, food, and colourful aso-ebi outfits."
  },
  {
    id: "p017", question: "The Nigerian dish 'suya' is primarily which type of food?",
    options: ["Grilled spiced meat skewers", "Fermented locust beans", "Fried plantain", "Pepper soup"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Suya is a popular Nigerian street food of spiced, skewered grilled beef (or other meats), popular across the country."
  },
  {
    id: "p018", question: "Tekno, the Afrobeats artist, is from which Nigerian state?",
    options: ["Lagos", "Rivers", "Borno", "Taraba"],
    answer: 3, category: "Pop Culture", difficulty: "hard",
    explanation: "Tekno Miles (Augustine Kelechi Miles) is from Taraba State in northeastern Nigeria."
  },
  {
    id: "p019", question: "Genevieve Nnaji is one of Nollywood's biggest stars. She is from which state?",
    options: ["Anambra", "Imo", "Imo", "Lagos"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "Genevieve Nnaji was born in Mbaise, Imo State."
  },
  {
    id: "p020", question: "The Nigerian internet slang 'Sapa' refers to what?",
    options: ["Extreme happiness", "Severe poverty or being broke", "Dance style", "A type of food"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Sapa' is Nigerian slang for a state of intense financial hardship or being completely broke."
  },
  {
    id: "p021", question: "The King of Juju music is who?",
    options: ["Ebenezer Obey", "King Sunny Ade", "Victor Uwaifo", "Orlando Owoh"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "King Sunny Ade (KSA) is universally known as the King of Juju music and is globally celebrated."
  },
  {
    id: "p022", question: "Nigeria's Jay-Jay Okafor was famous in European football. He primarily played for which club?",
    options: ["Arsenal", "AC Milan", "Barcelona", "Bayern Munich"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Jay-Jay Okafor famously played for AC Milan in Serie A, as well as Paris Saint-Germain and other clubs."
  },
  {
    id: "p023", question: "Which Nigerian song became the first African song to reach 100 million streams on Spotify?",
    options: ["One Dance", "Ojuelegba", "Fall by Davido", "Come Closer"],
    answer: 2, category: "Pop Culture", difficulty: "hard",
    explanation: "Davido's 'Fall' (2017) was the first Nigerian/African pop song to reach 100 million streams on Spotify."
  },
  {
    id: "p024", question: "What is 'aso-ebi' in Nigerian culture?",
    options: ["A traditional Igbo dance", "Matching fabric worn by groups at celebrations", "A Yoruba chief's crown", "A type of traditional soup"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Aso-ebi (Yoruba for 'family cloth') refers to matching fabric outfits worn by guests at Nigerian celebrations, especially weddings."
  },
  {
    id: "p025", question: "The Nigerian TV show 'Tinsel' has aired on which channel?",
    options: ["NTA", "Channels TV", "MNET / Africa Magic", "AIT"],
    answer: 2, category: "Pop Culture", difficulty: "medium",
    explanation: "Tinsel is a popular Nigerian soap opera that has aired on M-Net's Africa Magic since 2008."
  },
  {
    id: "p026", question: "Which Nigerian state is famous for the Argungu Fishing Festival?",
    options: ["Niger State", "Kebbi State", "Katsina State", "Sokoto State"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "The Argungu Fishing Festival is held annually along the Matan Fada River in Argungu, Kebbi State."
  },
  {
    id: "p027", question: "Mr Eazi describes his sound as a blend of Nigerian and Ghanaian sounds. What does he call it?",
    options: ["Afro-Highlife", "Banku Music", "Afrobeats Fusion", "Palmwine music"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "Mr Eazi coined the term 'Banku Music' to describe his genre, a blend of Nigerian and Ghanaian sounds."
  },
  {
    id: "p028", question: "Niniola is known as the Nigerian Queen of which music genre?",
    options: ["Afro-house", "R&B", "Fuji", "Neo-soul"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Niniola Apata is widely celebrated as the Queen of Afro-house music."
  },
  {
    id: "p029", question: "The phrase 'O dabo' in Yoruba means?",
    options: ["Good morning", "Thank you", "Goodbye", "How are you"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "'O dabo' is the Yoruba way of saying goodbye."
  },
  {
    id: "p030", question: "The legendary Nigerian highlife musician Victor Uwaifo wrote a famous song inspired by seeing what in the sea?",
    options: ["A whale", "A mermaid (Mammy Water)", "A shark", "A dolphin"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "Victor Uwaifo's famous 1965 song 'Joromi' was inspired by an encounter with a mermaid ('Mammy Water')."
  },
  {
    id: "p031", question: "Wizkid's stage name is short for what?",
    options: ["Wizard Kid", "Wicked Kid", "Wonderful Kid", "Wild Kid"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Wizkid (Ayodeji Ibrahim Balogun) shortened his nickname 'Lil Prinz' and adopted Wizkid, meaning Wizard Kid."
  },
  {
    id: "p032", question: "In 2021, which Nigerian became the first Afrobeats artist to headline the O2 Arena in London?",
    options: ["Wizkid", "Davido", "Burna Boy", "Tiwa Savage"],
    answer: 2, category: "Pop Culture", difficulty: "medium",
    explanation: "Burna Boy headlined the O2 Arena in London in 2022 (announced 2021), setting a landmark for African music."
  },
  {
    id: "p033", question: "Who is known as 'Mama Africa' in Nigerian music?",
    options: ["Onyeka Onwenu", "Sasha P", "Tiwa Savage", "Yemi Alade"],
    answer: 3, category: "Pop Culture", difficulty: "medium",
    explanation: "Yemi Alade is nicknamed 'Mama Africa' — she is one of the most popular female African artists internationally."
  },
  {
    id: "p034", question: "Naira Marley is the creator of which cultural movement?",
    options: ["Zanku movement", "Shaku Shaku", "Marlian movement", "Zanku Legwork"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "Naira Marley created the 'Marlian' movement and its associated sound, a sub-genre of street-hop/Afrobeats."
  },
  {
    id: "p035", question: "The Nigerian street slang 'E go be' means what in English?",
    options: ["It will happen / things will work out", "It is fine as is", "Nothing to worry about", "Leave it alone"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'E go be' is a Pidgin phrase meaning 'it will happen' or 'things will be fine' — an expression of optimism."
  },
  {
    id: "p036", question: "Fireboy DML's hit 'Peru' was remixed by which international artist?",
    options: ["Drake", "Ed Sheeran", "The Weeknd", "Justin Bieber"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Ed Sheeran was featured on the remix of Fireboy DML's 'Peru,' which became a global hit."
  },
  {
    id: "p037", question: "Nigeria's most famous traditional wrestling style is practiced mainly in which region?",
    options: ["Yorubaland", "Igboland", "Hausa North", "Ijaw Delta"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Traditional Igbo wrestling (Mgba) is a deeply cultural sport, especially in eastern Nigeria."
  },
  {
    id: "p038", question: "The iconic Nigerian pidgin phrase 'How far?' is an equivalent of what in English?",
    options: ["How old are you?", "How are you? / What's up?", "How much does it cost?", "Where are you going?"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'How far?' is a common Nigerian Pidgin English greeting meaning 'How are you?' or 'What's up?'"
  },
  {
    id: "p039", question: "Which city is considered the birthplace of Nigerian highlife music?",
    options: ["Enugu", "Onitsha", "Lagos", "Port Harcourt"],
    answer: 2, category: "Pop Culture", difficulty: "medium",
    explanation: "Lagos was the birthplace of Nigerian highlife, with the genre flourishing in clubs and hotels along the coast."
  },
  {
    id: "p040", question: "CKay's song 'Love Nwantiti' broke records by charting in how many countries?",
    options: ["Over 30", "Over 50", "Over 70", "Over 90"],
    answer: 2, category: "Pop Culture", difficulty: "hard",
    explanation: "CKay's 'Love Nwantiti' became a global viral hit, charting in over 70 countries after its viral TikTok moment in 2021."
  },
  {
    id: "p041", question: "The Nigerian comedy skit creator Sabinus is nicknamed what?",
    options: ["Mr Funny", "Mr Skit", "The Comedian", "Naija Clown"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Emmanuel Chukwuemeka Ejekwu, known as Sabinus, goes by the nickname 'Mr Funny.'"
  },
  {
    id: "p042", question: "What is 'egusi soup' made from?",
    options: ["Smoked fish and palm oil", "Ground melon seeds and vegetables", "Fermented beans and spices", "Dried shrimp and tomatoes"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Egusi soup is made from ground melon seeds cooked with vegetables, meat, fish, and palm oil — a Nigerian staple."
  },
  {
    id: "p043", question: "The Osun-Osogbo Festival takes place at which sacred grove?",
    options: ["Osun Sacred Grove", "Ogun Sacred Forest", "Ife Sacred River", "Sango River Grove"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The Osun-Osogbo Sacred Grove in Osogbo, Osun State, is a UNESCO World Heritage Site and site of the annual festival."
  },
  {
    id: "p044", question: "What does 'Mama put' refer to in Nigerian street culture?",
    options: ["A traditional dance", "A roadside eatery run by a woman", "A market for fabric", "A type of baby carrier"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Mama put' is slang for a small, informal roadside restaurant, typically run by a woman serving affordable local food."
  },
  {
    id: "p045", question: "Which Nigerian actor is known internationally for his role in 'Coming 2 America'?",
    options: ["Richard Mofe-Damijo", "Jim Iyke", "John Boyega", "Kunle Afolayan"],
    answer: 2, category: "Pop Culture", difficulty: "medium",
    explanation: "John Boyega (of Star Wars fame) starred in Coming 2 America and has British-Nigerian heritage."
  },
  {
    id: "p046", question: "The Durbar Festival, a colourful equestrian display, is held in which Nigerian city?",
    options: ["Kano or Zaria", "Lagos", "Benin City", "Calabar"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The Durbar Festival is held in Kano (and other northern cities) during Muslim festivals, featuring horsemen and colourful displays."
  },
  {
    id: "p047", question: "What is the name of the sauce/stew that is often referred to as the base of many Nigerian soups?",
    options: ["Tomato base", "Pepper soup", "Stew base (tomato, pepper, onion blend)", "Ogiri paste"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "A blended tomato, pepper, and onion stew base is the foundation of many Nigerian soups and stews."
  },
  {
    id: "p048", question: "Which Nigerian artist had a record-breaking performance at Madison Square Garden in 2022?",
    options: ["Davido", "Wizkid", "Burna Boy", "Asake"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Wizkid sold out Madison Square Garden in New York in 2022, a milestone for African music."
  },
  {
    id: "p049", question: "What genre did Lagbaja, the masked Nigerian musician, popularize?",
    options: ["Afrojuju", "Nija funk", "Makosa", "Contemporary jùjú-funk"],
    answer: 3, category: "Pop Culture", difficulty: "hard",
    explanation: "Lagbaja is known for his contemporary fusion of jùjú, funk, and traditional percussion."
  },
  {
    id: "p050", question: "Asake is signed to which record label?",
    options: ["YBNL", "Mavin Records", "Spaceship Collective", "Empire/YBNL"],
    answer: 3, category: "Pop Culture", difficulty: "hard",
    explanation: "Asake (Ahmed Ololade) is signed to Olamide's YBNL Nation label, distributed through Empire."
  },
  {
    id: "p051", question: "Rema's global hit 'Calm Down' featured a remix with which international artist?",
    options: ["Beyoncé", "Selena Gomez", "Cardi B", "Ariana Grande"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Rema and Selena Gomez's 'Calm Down' remix became a global smash hit in 2022."
  },
  {
    id: "p052", question: "The Calabar Carnival is held in which state?",
    options: ["Akwa Ibom", "Rivers", "Cross River", "Bayelsa"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "The Calabar Carnival is held annually in Calabar, Cross River State, and is dubbed 'Africa's biggest street party.'"
  },
  {
    id: "p053", question: "Who is nicknamed 'Baddest' in Nigerian music?",
    options: ["Wizkid", "Davido", "Burna Boy", "Olamide"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Davido is widely known by the nickname 'Baddest' among his fanbase, the '30BG.'"
  },
  {
    id: "p054", question: "The Nigerian Twitter/social media community is widely known as?",
    options: ["Naija Twitter", "Nigeria Online", "Nigerian Twitter (Naija Twt)", "Naija Tok"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "The Nigerian online community, especially on Twitter/X, is colloquially known as 'Nigerian Twitter' or 'Naija Twitter.'"
  },
  {
    id: "p055", question: "Which Nigerian movie streaming platform is native and specifically focused on Nollywood content?",
    options: ["Netflix", "iROKOtv", "Showmax", "Amazon Prime"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "iROKOtv, founded by Jason Njoku, is a dedicated Nollywood streaming platform often called the 'Netflix of Africa.'"
  },
  {
    id: "p056", question: "Patoranking is known for which genre?",
    options: ["Afrobeats", "Dancehall/Reggae-Afrobeats", "Fuji", "Highlife"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Patoranking blends dancehall reggae with Afrobeats, creating a uniquely Nigerian dancehall sound."
  },
  {
    id: "p057", question: "What does 'Nollywood' refer to?",
    options: ["Northern Oldies", "Nigerian Hollywood — the Nigerian film industry", "A cinema chain in Lagos", "An online streaming platform"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Nollywood is the informal name for the Nigerian film industry, a portmanteau of Nigeria and Hollywood."
  },
  {
    id: "p058", question: "Obi Cubana is a popular Nigerian socialite from which state?",
    options: ["Lagos State", "Anambra State", "Rivers State", "Delta State"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Obinna Iyiegbu (Obi Cubana) is from Oba, Anambra State, and became famous for his extravagant lifestyle and philanthrophy."
  },
  {
    id: "p059", question: "The phrase 'Na who see road, e pass' in Nigerian Pidgin means what?",
    options: ["The one who knows the way leads", "Everyone must follow the rules", "Take the shortcut", "Do what you can to survive"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "'Na who see road, e pass' means the person who knows the right way takes the lead."
  },
  {
    id: "p060", question: "Which Nigerian food is considered the 'king of street food'?",
    options: ["Akara", "Suya", "Puff-puff", "Boli"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Suya is widely considered the ultimate Nigerian street food, enjoyed across all regions and social classes."
  },
  {
    id: "p061", question: "D'banj's 2012 global hit featured which famous American rapper?",
    options: ["Kanye West", "Jay-Z", "Lil Wayne", "Kendrick Lamar"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "D'banj's 'Oliver Twist' remix featured Kanye West and was part of his Koko Foundation label deal with G.O.O.D. Music."
  },
  {
    id: "p062", question: "What do Nigerians call the act of 'spraying money' at celebrations?",
    options: ["Money rain", "National Anthem", "Dashing", "Spraying"],
    answer: 3, category: "Pop Culture", difficulty: "easy",
    explanation: "'Spraying' is the Nigerian cultural practice of showering money on someone as a show of celebration and affection at parties."
  },
  {
    id: "p063", question: "Phyno primarily raps in which language?",
    options: ["Yoruba", "Pidgin English", "Igbo", "Hausa"],
    answer: 2, category: "Pop Culture", difficulty: "medium",
    explanation: "Phyno (Chibuzor Nelson Azubuike) is famous for rapping primarily in Igbo, making him a pioneering figure in Igbo rap."
  },
  {
    id: "p064", question: "Which Nigerian state hosts the internationally recognised Osun Osogbo Festival?",
    options: ["Lagos State", "Ogun State", "Osun State", "Oyo State"],
    answer: 2, category: "Pop Culture", difficulty: "easy",
    explanation: "The Osun Osogbo Festival is held at the Sacred Grove in Osogbo, Osun State."
  },
  {
    id: "p065", question: "The #EndSARS protest movement of 2020 was against which institution?",
    options: ["The Nigerian Army", "Special Anti-Robbery Squad (SARS) police unit", "The judiciary", "The EFCC"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "#EndSARS was a massive youth-led protest movement demanding the dissolution of the Special Anti-Robbery Squad (SARS) of the Nigerian Police."
  },
  {
    id: "p066", question: "Simi is married to which Nigerian music star?",
    options: ["Falz", "Adekunle Gold", "Reekado Banks", "Wande Coal"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Simi (Simisola Kosoko) is married to singer Adekunle Gold."
  },
  {
    id: "p067", question: "Kizz Daniel's fanbase is known as what?",
    options: ["Buga Gang", "Flyboys", "FANBASE", "Vado Nation"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "Kizz Daniel's fans are known as 'Flyboys Inc.', named after his original label."
  },
  {
    id: "p068", question: "Which Nollywood actor has won the Africa Movie Academy Award multiple times and is nicknamed RMD?",
    options: ["Ramsey Noah", "Richard Mofe-Damijo", "Omotola Jalade", "Genevieve Nnaji"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Richard Mofe-Damijo (RMD) is one of Nollywood's biggest male stars and has won multiple AMVCAs."
  },
  {
    id: "p069", question: "The Nigerian party anthem 'Yahooze' was performed by which artist?",
    options: ["9ice", "Olu Maintain", "Sound Sultan", "Ruggedman"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "'Yahooze' (2007) by Olu Maintain was a massive party anthem though controversially associated with internet fraud culture."
  },
  {
    id: "p070", question: "The Nigerian tech unicorn Flutterwave is primarily a company in which sector?",
    options: ["E-commerce", "Fintech / digital payments", "Ride-hailing", "Social media"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Flutterwave is a Nigerian fintech company providing payment infrastructure across Africa, valued at over $3 billion."
  },

  // ─── GENERAL KNOWLEDGE ─────────────────────────────────────────────────────
  {
    id: "g001", question: "What is the largest city in Nigeria by population?",
    options: ["Abuja", "Kano", "Lagos", "Ibadan"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Lagos is the largest city in Nigeria and one of the most populous cities in Africa."
  },
  {
    id: "g002", question: "What is the official language of Nigeria?",
    options: ["Hausa", "Yoruba", "Igbo", "English"],
    answer: 3, category: "General Knowledge", difficulty: "easy",
    explanation: "English is the official language of Nigeria, a legacy of British colonial rule."
  },
  {
    id: "g003", question: "Approximately how many languages are spoken in Nigeria?",
    options: ["50", "100", "250", "500"],
    answer: 3, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria is one of the most linguistically diverse countries in the world, with over 500 distinct languages."
  },
  {
    id: "g004", question: "What is the River Niger's length, making it one of Africa's longest rivers?",
    options: ["2,500 km", "4,180 km", "3,100 km", "5,000 km"],
    answer: 1, category: "General Knowledge", difficulty: "hard",
    explanation: "The Niger River is approximately 4,180 km (2,597 miles) long — the third-longest river in Africa."
  },
  {
    id: "g005", question: "Nigeria's economy is largely dependent on which natural resource?",
    options: ["Gold", "Crude oil", "Diamonds", "Natural gas"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Nigeria's economy is heavily dependent on crude oil, which accounts for the majority of government revenue and export earnings."
  },
  {
    id: "g006", question: "What is the name of Nigeria's national currency?",
    options: ["Cedis", "Naira", "Shillings", "Dalasi"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "The Nigerian Naira (₦) has been the national currency since January 1, 1973, replacing the Nigerian pound."
  },
  {
    id: "g007", question: "Which Nigerian state has the highest population?",
    options: ["Lagos", "Kano", "Rivers", "Oyo"],
    answer: 1, category: "General Knowledge", difficulty: "medium",
    explanation: "Kano State has long been considered Nigeria's most populous state by some counts, though Lagos leads in urban population."
  },
  {
    id: "g008", question: "How many states does Nigeria currently have?",
    options: ["30", "34", "36", "38"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Nigeria has 36 states plus the Federal Capital Territory (Abuja)."
  },
  {
    id: "g009", question: "Nigeria shares a border with how many countries?",
    options: ["3", "4", "5", "6"],
    answer: 1, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria shares borders with 4 countries: Benin (west), Niger (north), Chad (northeast), and Cameroon (east/southeast)."
  },
  {
    id: "g010", question: "What is the name of the body of water on Nigeria's southern coast?",
    options: ["Indian Ocean", "South Atlantic Ocean / Gulf of Guinea", "Mediterranean Sea", "Red Sea"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Nigeria's southern coast borders the Gulf of Guinea, part of the Atlantic Ocean."
  },
  {
    id: "g011", question: "What is the name of Nigeria's highest mountain?",
    options: ["Obudu Mountain", "Mount Dimlang", "Chappal Waddi", "Shere Hills"],
    answer: 2, category: "General Knowledge", difficulty: "hard",
    explanation: "Chappal Waddi (1,698m) in Taraba State is Nigeria's highest peak."
  },
  {
    id: "g012", question: "Which Nigerian state is the smallest in land area?",
    options: ["Lagos", "Anambra", "Imo", "Abia"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Lagos State is the smallest Nigerian state by land area, covering approximately 3,577 km²."
  },
  {
    id: "g013", question: "The National Assembly of Nigeria consists of which two chambers?",
    options: ["Parliament and Congress", "House of Representatives and Council", "Senate and House of Representatives", "Senate and House of Commons"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "The Nigerian National Assembly consists of the Senate (upper house) and the House of Representatives (lower house)."
  },
  {
    id: "g014", question: "Abuja became Nigeria's capital city in 1991. In which geopolitical zone is Abuja located?",
    options: ["North-Central", "North-West", "North-East", "South-West"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Abuja (FCT) is in the North-Central geopolitical zone of Nigeria."
  },
  {
    id: "g015", question: "What does NNPC stand for?",
    options: ["Nigerian National Petroleum Company", "National Nigerian Petroleum Corporation", "Nigeria National Petrol Company", "Northern Nigerian Petroleum Corporation"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "NNPC stands for Nigerian National Petroleum Company (formerly Corporation), the state-owned oil company."
  },
  {
    id: "g016", question: "The University of Lagos is located in which area of Lagos?",
    options: ["Victoria Island", "Surulere", "Yaba", "Ikeja"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "University of Lagos (UNILAG) is located in Yaba, Lagos."
  },
  {
    id: "g017", question: "Nigeria has how many geopolitical zones?",
    options: ["4", "5", "6", "7"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Nigeria is divided into 6 geopolitical zones: North-East, North-West, North-Central, South-East, South-South, and South-West."
  },
  {
    id: "g018", question: "What is the name of Nigeria's main stock exchange?",
    options: ["Nigerian Stock Exchange (NSE)", "Lagos Stock Exchange", "Exchange Central Nigeria", "Naira Trading Floor"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The Nigerian Exchange Group (NGX), formerly the Nigerian Stock Exchange (NSE), is the primary stock exchange."
  },
  {
    id: "g019", question: "The Niger Delta region is in which part of Nigeria?",
    options: ["North", "West", "South-South", "East"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "The Niger Delta is in the South-South geopolitical zone of Nigeria."
  },
  {
    id: "g020", question: "Nigeria's central bank is called what?",
    options: ["Nigerian Federal Bank", "Central Bank of Nigeria (CBN)", "Bank of Nigeria", "National Reserve Bank"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "The Central Bank of Nigeria (CBN) is the apex monetary institution of Nigeria."
  },
  {
    id: "g021", question: "Which of these is NOT a Nigerian airline?",
    options: ["Air Peace", "Arik Air", "Iberia", "Dana Air"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Iberia is the national airline of Spain. Air Peace, Arik Air, and Dana Air are/were Nigerian airlines."
  },
  {
    id: "g022", question: "The Zuma Rock, a famous landmark, is located near which city?",
    options: ["Lagos", "Ibadan", "Abuja", "Kaduna"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "Zuma Rock is a large monolith located about 100 km from Abuja in Niger State and is a landmark often called the 'Gateway to Abuja.'"
  },
  {
    id: "g023", question: "Nigeria is the most populous country in Africa. Approximately how many people live in Nigeria (as of recent estimates)?",
    options: ["100 million", "150 million", "220 million+", "300 million"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Nigeria's population is estimated at over 220 million, making it the most populous country in Africa."
  },
  {
    id: "g024", question: "What animal is on Nigeria's coat of arms?",
    options: ["Eagle and Lion", "Two Eagles", "Eagle on a black shield", "Two Horses supporting a black shield with an eagle"],
    answer: 3, category: "General Knowledge", difficulty: "hard",
    explanation: "Nigeria's coat of arms features a black shield with a white Y shape (the Niger-Benue confluence), supported by two horses, with an eagle on top."
  },
  {
    id: "g025", question: "Which river forms the confluence at Lokoja, the first city in Nigeria?",
    options: ["Niger and Benue", "Niger and Osun", "Benue and Kaduna", "Sokoto and Niger"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The Niger and Benue rivers meet at the confluence in Lokoja, Kogi State — the first modern city built in Nigeria."
  },
  {
    id: "g026", question: "Nigeria is the world's largest exporter of which agricultural product?",
    options: ["Cocoa", "Cassava", "Yam", "Palm oil"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria is the world's largest producer and exporter of yam."
  },
  {
    id: "g027", question: "What does EFCC stand for?",
    options: ["Economic and Financial Crimes Commission", "Essential Financial Control Council", "Emergency Federal Crimes Court", "Economic Force and Crimes Coordination"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "EFCC stands for Economic and Financial Crimes Commission, Nigeria's main anti-corruption agency."
  },
  {
    id: "g028", question: "JAMB stands for what?",
    options: ["Joint Administrative Matriculation Board", "Junior Academic Matriculation Board", "Joint Admissions and Matriculation Board", "Joint Academic Management Bureau"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "JAMB (Joint Admissions and Matriculation Board) conducts the Unified Tertiary Matriculation Examination (UTME) for Nigerian university admission."
  },
  {
    id: "g029", question: "What does 'buhari' mean in Hausa?",
    options: ["Brave lion", "The great one", "Victory", "Freedom"],
    answer: 2, category: "General Knowledge", difficulty: "hard",
    explanation: "'Buhari' in Hausa means 'victory.'"
  },
  {
    id: "g030", question: "The Transcorp Hilton, one of Nigeria's most famous hotels, is located in which city?",
    options: ["Lagos", "Kano", "Abuja", "Port Harcourt"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "The Transcorp Hilton Hotel is located in Maitama, Abuja, and is one of the most prestigious hotels in Nigeria."
  },
  {
    id: "g031", question: "Nigeria's national anthem begins with which words?",
    options: ["'Arise, O compatriots'", "'O Nigeria, our homeland'", "'Land of the rising sun'", "'Nation of pride and glory'"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Nigeria's national anthem begins with 'Arise, O compatriots, Nigeria's call obey...' adopted in 1978."
  },
  {
    id: "g032", question: "The Kainji Dam on the Niger River primarily serves what purpose?",
    options: ["Flood control", "Irrigation", "Hydroelectric power generation", "Fishing"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "The Kainji Dam in Niger State is Nigeria's largest dam and a major source of hydroelectric power."
  },
  {
    id: "g033", question: "Nigeria holds what percentage of Africa's proven oil reserves?",
    options: ["Approximately 3%", "Approximately 10%", "Approximately 37%", "Approximately 55%"],
    answer: 1, category: "General Knowledge", difficulty: "hard",
    explanation: "Nigeria holds approximately 10% of Africa's proven oil reserves and is consistently one of the continent's top oil producers."
  },
  {
    id: "g034", question: "Lagos Island is connected to the mainland by which famous bridge?",
    options: ["Carter Bridge", "Third Mainland Bridge", "Eko Bridge", "All of the above (several bridges)"],
    answer: 3, category: "General Knowledge", difficulty: "medium",
    explanation: "Lagos Island is connected to the mainland by the Carter Bridge, Eko Bridge, and the Third Mainland Bridge (the longest)."
  },
  {
    id: "g035", question: "What is the name of the Nigerian telecommunications giant known for its yellow branding?",
    options: ["Airtel", "Glo", "MTN Nigeria", "9mobile"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "MTN Nigeria is known for its distinctive yellow branding and is one of the largest telecom operators in Nigeria."
  },
  {
    id: "g036", question: "What is the meaning of the Yoruba greeting 'E kaaro'?",
    options: ["Good afternoon", "Good morning", "Good evening", "Welcome"],
    answer: 1, category: "General Knowledge", difficulty: "medium",
    explanation: "'E kaaro' (or 'E kaaro o') is the Yoruba greeting for 'Good morning.'"
  },
  {
    id: "g037", question: "Which Nigerian institution is known as 'the pride of the north'?",
    options: ["Bayero University Kano", "Ahmadu Bello University", "University of Maiduguri", "Usman Danfodiyo University"],
    answer: 1, category: "General Knowledge", difficulty: "medium",
    explanation: "Ahmadu Bello University (ABU) in Zaria is one of Nigeria's oldest and largest universities, nicknamed 'the pride of the North.'"
  },
  {
    id: "g038", question: "Dangote Cement is produced by which Nigerian billionaire's conglomerate?",
    options: ["Femi Otedola", "Jim Ovia", "Aliko Dangote", "Tony Elumelu"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Aliko Dangote, consistently Africa's richest man, built his empire on Dangote Cement among other businesses."
  },
  {
    id: "g039", question: "What does 'Jand' mean in Nigerian slang?",
    options: ["London / abroad (UK)", "Party", "Food", "Money"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "'Jand' is Nigerian slang for London or the United Kingdom, sometimes used for 'abroad' generally."
  },
  {
    id: "g040", question: "In which year did Nigeria host the Football World Cup?",
    options: ["1994", "2010", "Nigeria has never hosted the World Cup", "2006"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria has never hosted the FIFA World Cup. The 2010 World Cup was hosted by South Africa."
  },
  {
    id: "g041", question: "The Lekki-Ikoyi Link Bridge connects which two areas of Lagos?",
    options: ["Lekki and Victoria Island", "Lekki and Ikoyi", "Ajah and Lekki", "Ikoyi and Lagos Island"],
    answer: 1, category: "General Knowledge", difficulty: "medium",
    explanation: "The Lekki-Ikoyi Link Bridge (also called the Freedom Bridge) connects Lekki Phase 1 and Ikoyi."
  },
  {
    id: "g042", question: "Which Nigerian city is known as the 'City of Walls' due to its ancient earthworks?",
    options: ["Kano", "Benin City", "Zaria", "Sokoto"],
    answer: 1, category: "General Knowledge", difficulty: "hard",
    explanation: "Benin City's ancient city walls (Iya), once the largest man-made structure on earth by some estimates, earned it the nickname 'City of Walls.'"
  },
  {
    id: "g043", question: "The Boko Haram insurgency began primarily in which Nigerian state?",
    options: ["Kano", "Borno", "Yobe", "Adamawa"],
    answer: 1, category: "General Knowledge", difficulty: "medium",
    explanation: "Boko Haram originated in Maiduguri, the capital of Borno State, and remains most active in the northeastern region."
  },
  {
    id: "g044", question: "What is the meaning of 'Naira' as a name?",
    options: ["It is derived from 'Nigeria'", "It means 'gold' in Hausa", "It is named after the River Niger", "It was coined by Obafemi Awolowo"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The name 'Naira' is a contraction of 'Nigeria,' coined to represent the new currency when it was introduced in 1973."
  },
  {
    id: "g045", question: "Aliko Dangote's net worth has at times made him the wealthiest person in which grouping?",
    options: ["In West Africa", "In all of Africa", "In Africa and the Middle East", "Among all Black billionaires globally"],
    answer: 3, category: "General Knowledge", difficulty: "medium",
    explanation: "Aliko Dangote has repeatedly been named the richest Black person in the world and the wealthiest person in Africa."
  },
  {
    id: "g046", question: "What does 'Lagos' mean or likely derive from?",
    options: ["Derived from the Portuguese word for 'lagoons' or lakes", "From the Yoruba word for 'market'", "Named after a Lagos River", "From the Benin word for 'trading post'"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Lagos is believed to derive from the Portuguese 'lago' (lake/lagoon) due to the city's geography of lagoons and islands."
  },
  {
    id: "g047", question: "The Eko Atlantic City project is an ambitious real estate development built on reclaimed land from which body of water?",
    options: ["Lagos Lagoon", "The Atlantic Ocean (Bar Beach)", "The Bight of Benin", "A former swamp"],
    answer: 1, category: "General Knowledge", difficulty: "hard",
    explanation: "Eko Atlantic City is built on land reclaimed from the Atlantic Ocean, where Bar Beach used to be in Victoria Island."
  },
  {
    id: "g048", question: "Which Nigerian mobile payment system, launched in 2007, revolutionised financial inclusion?",
    options: ["PiggyVest", "Paga", "M-Pesa Nigeria", "GTBank mobile"],
    answer: 1, category: "General Knowledge", difficulty: "hard",
    explanation: "Paga, founded in 2009 by Jay Alabraba, is one of Nigeria's leading mobile payment platforms focused on financial inclusion."
  },
  {
    id: "g049", question: "What is the Nigerian term for a commercial motorcycle taxi?",
    options: ["Bolekaja", "Keke", "Okada", "Danfo"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "'Okada' is the popular name for commercial motorcycles (boda boda) in Nigeria, named after the defunct Okada Air."
  },
  {
    id: "g050", question: "What colour is the Nigerian passport?",
    options: ["Blue", "Red", "Green", "Black"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "The Nigerian international passport is green in colour."
  },
  {
    id: "g051", question: "Which Nigerian state has the most local government areas (LGAs)?",
    options: ["Lagos", "Kano", "Ogun", "Rivers"],
    answer: 1, category: "General Knowledge", difficulty: "hard",
    explanation: "Kano State has the most local government areas in Nigeria, with 44 LGAs."
  },
  {
    id: "g052", question: "Lagos has a unique market for mobile phones and electronics called what?",
    options: ["Alaba International Market", "Idumota Market", "Computer Village", "Balogun Market"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "Computer Village in Ikeja, Lagos, is one of the largest ICT markets in Africa."
  },
  {
    id: "g053", question: "The Savannah vegetation belt of Nigeria is found primarily in which region?",
    options: ["Coastal areas", "South-West", "North", "Niger Delta"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "The Sudan and Sahel Savannah vegetation zones are found in northern Nigeria."
  },
  {
    id: "g054", question: "What does WAEC stand for in the Nigerian education system?",
    options: ["West African Examinations Council", "West African Education Committee", "West African Examinations Corporation", "Western African Exams Commission"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "WAEC (West African Examinations Council) conducts the WASSCE/WAEC exams for secondary school students across West Africa."
  },
  {
    id: "g055", question: "Which Nigerian bank was the first to introduce internet banking in the country?",
    options: ["GTBank", "Zenith Bank", "First Bank Nigeria", "UBA"],
    answer: 2, category: "General Knowledge", difficulty: "hard",
    explanation: "First Bank of Nigeria, founded in 1894, was the first bank to introduce internet banking services in Nigeria."
  },
  {
    id: "g056", question: "What is the standard dialing code for Nigeria?",
    options: ["+23", "+33", "+234", "+324"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria's international dialing code is +234."
  },
  {
    id: "g057", question: "The Yankari National Park, famous for wildlife, is located in which state?",
    options: ["Taraba", "Borno", "Bauchi", "Plateau"],
    answer: 2, category: "General Knowledge", difficulty: "medium",
    explanation: "Yankari National Park is located in Bauchi State and is Nigeria's most popular game reserve."
  },
  {
    id: "g058", question: "What is the name of the local government area in Lagos often called 'the big city within a city'?",
    options: ["Alimosho", "Ikeja", "Eti-Osa", "Kosofe"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Alimosho LGA is the largest LGA in Lagos State and is densely populated."
  },
  {
    id: "g059", question: "The Abuja National Stadium was built for which international sports event?",
    options: ["1999 AFCON", "2003 All Africa Games", "2009 FIFA U-17 World Cup", "2000 ECOWAS Games"],
    answer: 1, category: "General Knowledge", difficulty: "hard",
    explanation: "The Abuja National Stadium was constructed primarily for the 8th All Africa Games (Censa 2003)."
  },
  {
    id: "g060", question: "Which of the following is a Nigerian-origin word now used in English?",
    options: ["Safari", "Banana", "Chimpanzee", "Bungalow"],
    answer: 2, category: "General Knowledge", difficulty: "hard",
    explanation: "'Chimpanzee' is derived from a Bantu-language word from West/Central Africa — its earliest documented use in English came through West African sources."
  },
];

export const QUESTION_COUNTS: Record<number, number> = {
  5:  15, // Quick
  10: 25, // Standard
  15: 40, // Marathon
};

export function getShuffledQuestions(count: number): TriviaQuestion[] {
  const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

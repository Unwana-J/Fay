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
{
    id: "h071", question: "The Clifford Constitution of 1922 in Nigeria was notable for introducing what?",
    options: ["Universal adult suffrage", "The elective principle in Lagos and Calabar", "Federalism", "Bicameral legislature"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Clifford Constitution introduced the elective principle for the first time, allocating four elected seats (three for Lagos, one for Calabar)."
  },
  {
    id: "h072", question: "The Richards Constitution of 1946 divided Nigeria into how many administrative regions?",
    options: ["Two (North and South)", "Three (North, West, and East)", "Four (North, West, East, and Mid-West)", "Twelve states"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Richards Constitution formalized regionalism by dividing Nigeria into the Northern, Western, and Eastern regions."
  },
  {
    id: "h073", question: "The Macpherson Constitution was promulgated in which year?",
    options: ["1948", "1951", "1954", "1957"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The 1951 Macpherson Constitution introduced a central House of Representatives and regional Houses of Assembly."
  },
  {
    id: "h074", question: "Which constitution formally established Nigeria as a federation in 1954?",
    options: ["Clifford Constitution", "Richards Constitution", "Lyttelton Constitution", "Independence Constitution"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The Lyttelton Constitution of 1954 established the federal structure of Nigeria with residual powers given to the regions."
  },
  {
    id: "h075", question: "The Mid-Western Region was created out of the Western Region in which year?",
    options: ["1960", "1962", "1963", "1967"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The Mid-Western Region was created in August 1963 following a referendum, with Benin City as its capital."
  },
  {
    id: "h076", question: "Who was the first Premier of the Mid-Western Region?",
    options: ["Dennis Osadebay", "Jereton Mariere", "Samuel Akintola", "Michael Okpara"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Chief Dennis Osadebay served as the pioneer Premier of the Mid-Western Region from 1964 to 1966."
  },
  {
    id: "h077", question: "Who succeeded Obafemi Awolowo as Premier of the Western Region in 1959?",
    options: ["Ladoke Akintola", "Adekunle Ajasin", "Bisi Onabanjo", "Bola Ige"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Chief Samuel Ladoke Akintola became Premier of the Western Region when Awolowo moved to federal politics in 1959."
  },
  {
    id: "h078", question: "Who was the Premier of the Eastern Region from 1959 to 1966?",
    options: ["Nnamdi Azikiwe", "Michael Okpara", "Akanu Ibiam", "K.O. Mbadiwe"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Dr. Michael Iheonukara Okpara served as Premier of Eastern Nigeria from 1959 until the January 1966 coup."
  },
  {
    id: "h079", question: "The Action Group (AG) political party was founded primarily by which leader?",
    options: ["Nnamdi Azikiwe", "Obafemi Awolowo", "Ahmadu Bello", "Aminu Kano"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Chief Obafemi Awolowo founded the Action Group in 1951 from the Egbe Omo Oduduwa cultural organization."
  },
  {
    id: "h080", question: "The Northern Elements Progressive Union (NEPU) was led by which radical northern politician?",
    options: ["Ahmadu Bello", "Abubakar Tafawa Balewa", "Aminu Kano", "Shehu Shagari"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Mallam Aminu Kano founded and led NEPU in 1950 to champion the rights of the common people (talakawa)."
  },
  {
    id: "h081", question: "In what year did General Yakubu Gowon create the first 12 states in Nigeria?",
    options: ["1966", "1967", "1970", "1975"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "On May 27, 1967, General Yakubu Gowon dissolved the four regions and created 12 states to counter Biafran secession."
  },
  {
    id: "h082", question: "General Murtala Muhammed increased the number of states from 12 to 19 in which year?",
    options: ["1975", "1976", "1979", "1983"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "In February 1976, General Murtala Muhammed created 7 new states, bringing the total to 19."
  },
  {
    id: "h083", question: "General Ibrahim Babangida created two new states (Katsina and Akwa Ibom) in which year?",
    options: ["1985", "1987", "1991", "1993"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "On September 23, 1987, General Babangida created Katsina and Akwa Ibom states, raising the count to 21."
  },
  {
    id: "h084", question: "In 1991, General Babangida created how many additional states, bringing the total to 30?",
    options: ["6", "9", "10", "12"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "On August 27, 1991, Babangida created 9 states (including Delta, Osun, Abia, and Taraba), reaching 30 states."
  },
  {
    id: "h085", question: "General Sani Abacha created the final 6 states on October 1 of which year, establishing today's 36 states?",
    options: ["1994", "1995", "1996", "1997"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "On October 1, 1996, General Abacha created Ebonyi, Bayelsa, Nasarawa, Gombe, Ekiti, and Zamfara states."
  },
  {
    id: "h086", question: "Who was Nigeria's Head of State during the Dimka coup attempt in 1976?",
    options: ["Yakubu Gowon", "Murtala Muhammed", "Olusegun Obasanjo", "Shehu Shagari"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "General Murtala Muhammed was assassinated on February 13, 1976, in an abortive coup led by Lt. Col. Buka Suka Dimka."
  },
  {
    id: "h087", question: "Which Nigerian leader was awarded the title 'GCFR' (Grand Commander of the Federal Republic)?",
    options: ["Only military generals", "All Nigerian Presidents upon taking office", "Traditional monarchs only", "Nobel laureates only"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The GCFR is Nigeria's highest national honour, traditionally conferred on Heads of State upon inauguration."
  },
  {
    id: "h088", question: "The famous Asaba Massacre during the Nigerian Civil War occurred in which month and year?",
    options: ["May 1967", "October 1967", "January 1968", "July 1969"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "In October 1967, federal troops massacred hundreds of civilians in Asaba, an event widely remembered in civil war history."
  },
  {
    id: "h089", question: "Which country was the first to recognize the Republic of Biafra diplomatically?",
    options: ["France", "Tanzania", "Zambia", "Portugal"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Tanzania, led by President Julius Nyerere, was the first sovereign nation to recognize Biafra in April 1968."
  },
  {
    id: "h090", question: "General Johnson Aguiyi-Ironsi introduced which controversial decree unifying Nigeria's civil service?",
    options: ["Decree 34 (Unification Decree)", "Decree 4", "Decree 2", "Decree 8"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Decree No. 34 of May 1966 abolished the federal system in favour of a unitary administration, sparking northern riots."
  },
  {
    id: "h091", question: "General Aguiyi-Ironsi was assassinated in July 1966 during a counter-coup in which city?",
    options: ["Kaduna", "Lagos", "Ibadan", "Enugu"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Ironsi was kidnapped and killed in Ibadan while staying as a guest of Western Region Governor Francis Adekunle Fajuyi."
  },
  {
    id: "h092", question: "Lieutenant Colonel Francis Adekunle Fajuyi is remembered for what historic act in July 1966?",
    options: ["Leading the peace delegation", "Refusing to abandon his guest Ironsi, choosing to die with him", "Signing the cease-fire", "Forming the Mid-West guard"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Fajuyi bravely insisted on sharing the fate of his guest, Supreme Commander Aguiyi-Ironsi, when mutineers arrived."
  },
  {
    id: "h093", question: "The Aburi Accord of January 1967 between Gowon and Ojukwu took place in which country?",
    options: ["Togo", "Benin Republic", "Ghana", "Sierra Leone"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "The summit took place in Aburi, Ghana, hosted by Ghanaian leader Joseph Ankrah in an attempt to avert civil war."
  },
  {
    id: "h094", question: "Who was Biafra's Chief of General Staff and second-in-command to Ojukwu?",
    options: ["Philip Effiong", "Victor Banjo", "Joe Achuzia", "Chukwuma Nzeogwu"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Major General Philip Effiong served as Vice President of Biafra and formally surrendered to federal forces in 1970."
  },
  {
    id: "h095", question: "Major Chukwuma Kaduna Nzeogwu was killed during the Civil War in 1967 near which town?",
    options: ["Owerri", "Nsukka", "Onitsha", "Umuahia"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Nzeogwu died in action in July 1967 near Nsukka while fighting on the Biafran side."
  },
  {
    id: "h096", question: "The Benin Kingdom was famously invaded and looted by British forces in which year?",
    options: ["1884", "1897", "1901", "1914"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The British Punitive Expedition of 1897 invaded Benin City, burned the palace, and looted thousands of Benin Bronzes."
  },
  {
    id: "h097", question: "Which Oba of Benin was exiled to Calabar by the British following the 1897 invasion?",
    options: ["Oba Eweka I", "Oba Ovonramwen Nogbaisi", "Oba Akenzua II", "Oba Erediauwa"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Oba Ovonramwen Nogbaisi was deposed and exiled to Calabar, where he lived until his death in 1914."
  },
  {
    id: "h098", question: "Queen Amina of Zazzau is celebrated for ruling in which century?",
    options: ["10th century", "14th century", "16th century", "19th century"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Queen Amina ruled the Hausa kingdom of Zazzau (modern Zaria) in the late 16th century, building military fortifications."
  },
  {
    id: "h099", question: "What defensive architecture is Queen Amina famous for pioneering across Hausaland?",
    options: ["Deep moats with drawbridges", "Earthen defensive city walls (Ganuwa)", "Stone watchtowers", "River palisades"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Queen Amina had earthen walls built around her camps and conquered cities, known as Ganuwar Amina."
  },
  {
    id: "h100", question: "The ancient Nri Kingdom in southeastern Nigeria is recognized as a center of which tradition?",
    options: ["Igbo religious and moral authority", "Yoruba metallurgy", "Fulani pastoralism", "Tiv council meetings"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "The Kingdom of Nri is considered the spiritual and cultural heart of traditional Igbo civilization, ruled by the Eze Nri."
  },
  {
    id: "h101", question: "The Arochukwu Confederacy dominated trade and judicial arbitration in southeastern Nigeria through which oracle?",
    options: ["Ibini Ukpabi (Long Juju)", "Osun Oracle", "Agbala Oracle", "Amadioha Shrine"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The Aro expanded their influence through the famed Ibini Ukpabi oracle, which the British destroyed in the 1901\u20131902 expedition."
  },
  {
    id: "h102", question: "King Jaja of Opobo founded the Opobo city-state in 1869 after breaking away from which kingdom?",
    options: ["Nembe", "Bonny", "Kalabari", "Brass"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Jaja led his Anna Pepple faction away from Grand Bonny and established Opobo, dominating palm oil trade."
  },
  {
    id: "h103", question: "Which European power exiled King Jaja of Opobo to Saint Vincent in the Caribbean in 1887?",
    options: ["Portugal", "Germany", "Britain", "France"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "The British Vice-Consul Harry Johnston deceitfully lured Jaja onto a warship and exiled him for blocking British monopolies."
  },
  {
    id: "h104", question: "Madam Efunroye Tinubu was a legendary 19th-century businesswoman and nationalist in which cities?",
    options: ["Kano and Kaduna", "Badagry, Lagos, and Abeokuta", "Calabar and Opobo", "Benin and Warri"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Madam Tinubu was a wealthy merchant and powerbroker in Badagry and Lagos before becoming the Iyalode of Egbaland in Abeokuta."
  },
  {
    id: "h105", question: "The Royal Niger Company was granted a British royal charter in 1886 under the leadership of whom?",
    options: ["Sir George Goldie", "Lord Lugard", "John Holt", "Cecil Rhodes"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Sir George Dashwood Taubman Goldie consolidated British commercial interests into the Royal Niger Company."
  },
  {
    id: "h106", question: "The British government revoked the Royal Niger Company charter and took direct control of Nigeria in which year?",
    options: ["1890", "1900", "1906", "1914"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "On January 1, 1900, the British Crown took over the company's territories, creating the Northern and Southern Protectorates."
  },
  {
    id: "h107", question: "Who was the first indigenous Chief Justice of Nigeria, appointed in 1958?",
    options: ["Taslim Elias", "Adetokunbo Ademola", "Dapo Tejuoso", "Kayode Eso"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Sir Adetokunbo Ademola served as the first indigenous Chief Justice of Nigeria from 1958 to 1972."
  },
  {
    id: "h108", question: "Dr. Taslim Olawale Elias later became President of which global judicial body?",
    options: ["International Criminal Court", "International Court of Justice (The Hague)", "Commonwealth Court of Justice", "African Court on Human Rights"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Taslim Elias served as President of the International Court of Justice from 1982 to 1985."
  },
  {
    id: "h109", question: "The famous 1956 discovery of commercial oil in Nigeria was made in which community?",
    options: ["Warri, Delta State", "Oloibiri, Bayelsa State", "Bonny, Rivers State", "Eket, Akwa Ibom State"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Shell D'Arcy struck crude oil in commercial quantities at Oloibiri in present-day Bayelsa State in 1956."
  },
  {
    id: "h110", question: "The National Youth Service Corps (NYSC) was established in 1973 under which Head of State?",
    options: ["Murtala Muhammed", "Yakubu Gowon", "Olusegun Obasanjo", "Shehu Shagari"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "General Yakubu Gowon established the NYSC on May 22, 1973, by Decree No. 24 to promote national unity after the Civil War."
  },
  {
    id: "h111", question: "Which Nigerian currency denomination was first introduced with the portrait of Murtala Muhammed?",
    options: ["5 Naira", "10 Naira", "20 Naira", "50 Naira"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The 20 Naira banknote, introduced in 1977, featured the portrait of General Murtala Muhammed."
  },
  {
    id: "h112", question: "Which Nigerian woman's portrait is featured on the 20 Naira polymer banknote?",
    options: ["Funmilayo Ransome-Kuti", "Queen Amina", "Ladi Kwali", "Margaret Ekpo"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Famed potter Dr. Hadiza Ladi Kwali is honoured on the reverse side of the Nigerian 20 Naira note."
  },
  {
    id: "h113", question: "Who is the legendary female anti-colonial activist pictured on the proposed 5000 Naira note alongside Margaret Ekpo?",
    options: ["Funmilayo Ransome-Kuti", "Madam Tinubu", "Flora Nwapa", "Gambo Sawaba"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Chief Funmilayo Ransome-Kuti was a renowned feminist, educator, and nationalist who led the Abeokuta Women's Union."
  },
  {
    id: "h114", question: "Mallama Gambo Sawaba was a prominent female political activist based primarily in which part of Nigeria?",
    options: ["Enugu", "Zaria / Northern Nigeria", "Ibadan", "Calabar"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Gambo Sawaba was a fearless activist of the Northern Elements Progressive Union (NEPU) who advocated for women's emancipation in the North."
  },
  {
    id: "h115", question: "Margaret Ekpo was a pioneering female politician and women's rights activist in which Nigerian city and region?",
    options: ["Abeokuta, West", "Aba and Calabar, East", "Jos, Plateau", "Kano, North"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Margaret Ekpo was a leading figure in the NCNC who mobilized women across Aba, Calabar, and Eastern Nigeria."
  },
  {
    id: "h116", question: "The Second Republic of Nigeria lasted between which years?",
    options: ["1975\u20131979", "1979\u20131983", "1983\u20131985", "1993\u20131999"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The Second Republic was inaugurated on October 1, 1979, with President Shehu Shagari and ended with Buhari's coup on December 31, 1983."
  },
  {
    id: "h117", question: "Who served as Vice President to Shehu Shagari during the Second Republic?",
    options: ["Alex Ekwueme", "Nnamdi Azikiwe", "Joseph Tarka", "Adamu Ciroma"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Dr. Alex Ifeanyichukwu Ekwueme served as Vice President of Nigeria from 1979 to 1983."
  },
  {
    id: "h118", question: "The Unity Party of Nigeria (UPN) in the Second Republic was led by whom?",
    options: ["Nnamdi Azikiwe", "Obafemi Awolowo", "Waziri Ibrahim", "Aminu Kano"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Chief Obafemi Awolowo led the UPN, which championed free education and healthcare in western states."
  },
  {
    id: "h119", question: "The Great Nigeria People's Party (GNPP) was founded by which politician known for 'politics without bitterness'?",
    options: ["Waziri Ibrahim", "K.O. Mbadiwe", "Tunji Braithwaite", "Melford Okilo"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Alhaji Waziri Ibrahim coined the famous slogan 'politics without bitterness' while leading the GNPP."
  },
  {
    id: "h120", question: "Who was the presidential candidate of the National Party of Nigeria (NPN) in 1979 and 1983?",
    options: ["MKO Abiola", "Shehu Shagari", "Umaru Dikko", "Adamu Ciroma"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Alhaji Shehu Usman Aliyu Shagari won the presidency on the platform of the NPN in both elections."
  },
  {
    id: "h121", question: "The 12-2/3 constitutional controversy in 1979 centered on the formula for calculating what?",
    options: ["Two-thirds of 19 states", "Revenue derivation percentage", "Cabinet ministers quota", "Senate quorum"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Chief Richard Akinjide argued that two-thirds of 19 states was twelve and two-thirds states, validating Shagari's victory."
  },
  {
    id: "h122", question: "Who was Chief of Staff, Supreme Headquarters under General Muhammadu Buhari from 1983 to 1985?",
    options: ["Ibrahim Babangida", "Tunde Idiagbon", "Sani Abacha", "Domkat Bali"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Major General Tunde Idiagbon was the powerful second-in-command during Buhari's military regime."
  },
  {
    id: "h123", question: "The War Against Indiscipline (WAI) campaign was launched in 1984 by which regime?",
    options: ["Gowon regime", "Buhari-Idiagbon regime", "Babangida regime", "Abacha regime"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "WAI was launched in March 1984 to enforce queueing, environmental sanitation, and civic order."
  },
  {
    id: "h124", question: "General Ibrahim Babangida took power on August 27, 1985, through a palace coup that adopted what title for the ruler?",
    options: ["Head of State", "Military President", "Commander-in-Chief only", "Supreme Commander"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Babangida was the first Nigerian military ruler to designate himself as 'President' rather than Head of State."
  },
  {
    id: "h125", question: "The execution of Major General Mamman Vatsa in 1986 was connected to what?",
    options: ["A narcotics ring", "An alleged coup plot against Babangida", "The OIC membership scandal", "A civil revolt in Minna"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Mamman Vatsa, a childhood friend of Babangida and acclaimed poet-soldier, was executed for plotting a coup."
  },
  {
    id: "h126", question: "Dele Giwa, editor of Newswatch magazine, was killed by which weapon on October 19, 1986?",
    options: ["A sniper rifle", "A parcel bomb", "Poison", "Drive-by shooting"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Investigative journalist Dele Giwa was assassinated in his Lagos home by a parcel bomb, an event that shocked the nation."
  },
  {
    id: "h127", question: "The Major Gideon Orkar coup attempt against Babangida occurred in April of which year?",
    options: ["1988", "1989", "1990", "1991"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The April 22, 1990 Orkar coup almost toppled Babangida at Dodan Barracks in Lagos."
  },
  {
    id: "h128", question: "Which political party was MKO Abiola's vehicle in the historic June 12, 1993 presidential election?",
    options: ["National Republican Convention (NRC)", "Social Democratic Party (SDP)", "People's Democratic Party (PDP)", "Alliance for Democracy (AD)"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "MKO Abiola ran on the ticket of the Social Democratic Party (SDP) alongside Babagana Kingibe."
  },
  {
    id: "h129", question: "Who was the presidential candidate of the National Republican Convention (NRC) in the June 12, 1993 election?",
    options: ["Bashir Tofa", "Adamu Ciroma", "Umaru Shinkafi", "Bamanga Tukur"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Alhaji Bashir Tofa was the NRC candidate who faced MKO Abiola of the SDP."
  },
  {
    id: "h130", question: "Who was appointed Head of the Interim National Government (ING) after Babangida stepped aside in August 1993?",
    options: ["Ernest Shonekan", "Sani Abacha", "Oladipo Diya", "Theophilus Danjuma"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Chief Ernest Shonekan headed the short-lived ING from August 26 until Sani Abacha seized power on November 17, 1993."
  },
  {
    id: "h131", question: "General Oladipo Diya served in what position under the Abacha military regime?",
    options: ["Chief of Army Staff", "Chief of General Staff (de facto Vice President)", "Minister of Defence", "Inspector General of Police"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Lieutenant General Oladipo Diya was Chief of General Staff and Abacha's deputy until he was arrested for treason in 1997."
  },
  {
    id: "h132", question: "In which year did Nigeria sign the Green Tree Agreement with Cameroon, formally ceding the Bakassi Peninsula?",
    options: ["2000", "2002", "2006", "2010"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "President Olusegun Obasanjo and President Paul Biya signed the Green Tree Agreement on June 12, 2006, in New York."
  },
  {
    id: "h133", question: "The International Court of Justice (ICJ) ruled on the disputed Bakassi Peninsula in favor of Cameroon in which year?",
    options: ["1998", "2002", "2004", "2008"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The ICJ delivered its landmark judgment awarding sovereignty of Bakassi to Cameroon on October 10, 2002."
  },
  {
    id: "h134", question: "The Gani Fawehinmi Freedom Park in Ojota, Lagos, honours which prominent human rights lawyer?",
    options: ["Rotimi Williams", "Gani Fawehinmi", "Femi Falana", "Olisa Agbakoba"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Chief Gani Fawehinmi SAN was a legendary human rights crusader and founder of the National Conscience Party (NCP)."
  },
  {
    id: "h135", question: "Chief Rotimi Williams SAN was famously known by which professional moniker in Nigerian law?",
    options: ["The Silk King", "Tim the Lawyer", "The Black Oracle", "The Senior Advocate of Africa"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Chief F.R.A. Williams was affectionately known as 'Tim the Lawyer' and was one of the first two SANs appointed in 1975."
  },
  {
    id: "h136", question: "Which Nigerian general served as President of the United Nations General Assembly in 1989\u20131990?",
    options: ["Joseph Garba", "Ibrahim Gambari", "Emeka Anyaoku", "Yakubu Gowon"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Major General Joseph Nanven Garba presided over the 44th session of the UN General Assembly."
  },
  {
    id: "h137", question: "Chief Emeka Anyaoku served as Commonwealth Secretary-General during which decade?",
    options: ["1970s", "1980s", "1990\u20132000", "2000\u20132010"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Chief Emeka Anyaoku was the 3rd Commonwealth Secretary-General from 1990 to 2000."
  },
  {
    id: "h138", question: "The Ogoni Bill of Rights was submitted to the federal government in which year by MOSOP?",
    options: ["1985", "1990", "1995", "1998"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The Movement for the Survival of the Ogoni People (MOSOP) presented the Ogoni Bill of Rights in November 1990."
  },
  {
    id: "h139", question: "The Kaiama Declaration of 1998 was issued by youth from which ethnic nationality in the Niger Delta?",
    options: ["Urhobo", "Itsekiri", "Ijaw", "Isoko"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "The Ijaw Youth Council issued the Kaiama Declaration in December 1998, demanding resource control and self-determination."
  },
  {
    id: "h140", question: "President Umaru Musa Yar'Adua introduced an amnesty programme for Niger Delta militants in which year?",
    options: ["2007", "2008", "2009", "2010"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Yar'Adua proclaimed an unconditional presidential pardon and amnesty on June 25, 2009, stabilizing oil production."
  },
  {
    id: "h141", question: "President Umaru Musa Yar'Adua passed away in office on May 5 of which year?",
    options: ["2009", "2010", "2011", "2012"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Yar'Adua died on May 5, 2010, leading to Vice President Goodluck Jonathan being sworn in as substantive President."
  },
  {
    id: "h142", question: "The 'Doctrine of Necessity' invoked by the Nigerian Senate in February 2010 had what primary purpose?",
    options: ["Impeaching Yar'Adua", "Making Goodluck Jonathan Acting President in Yar'Adua's absence", "Postponing elections", "Revising the oil derivation formula"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Senate invoked the Doctrine of Necessity on February 9, 2010, to empower Goodluck Jonathan as Acting President."
  },
  {
    id: "h143", question: "The 2015 general election was historic in Nigeria primarily because it marked what?",
    options: ["First electronic voting test", "First time an incumbent president lost to an opposition candidate peacefully", "First female governor elected", "First four-way presidential race"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Muhammadu Buhari's defeat of Goodluck Jonathan in 2015 was Nigeria's first peaceful democratic transition of power from an incumbent party."
  },
  {
    id: "h144", question: "Which political party was formed in 2013 through the merger of ACN, CPC, ANPP, and part of APGA?",
    options: ["PDP", "APC (All Progressives Congress)", "LP (Labour Party)", "NNPP"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The All Progressives Congress (APC) was registered on July 31, 2013, following a historic coalition of opposition parties."
  },
  {
    id: "h145", question: "Attahiru Jega served in what critical national role between 2010 and 2015?",
    options: ["Governor of Central Bank", "Chairman of INEC", "Chief Justice of Nigeria", "Minister of Education"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Professor Attahiru Jega was the widely respected Chairman of the Independent National Electoral Commission (INEC)."
  },
  {
    id: "h146", question: "The ancient city of Calabar served as the capital of which British territory before 1906?",
    options: ["Lagos Colony", "Oil Rivers Protectorate / Niger Coast Protectorate", "Northern Nigeria", "Bight of Biafra Settlement"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Calabar was the capital of the Oil Rivers Protectorate and the Southern Nigeria Protectorate before Lagos took over."
  },
  {
    id: "h147", question: "Mary Slessor, the Scottish missionary in Calabar, is famously celebrated in Nigerian history for helping stop what?",
    options: ["The transatlantic slave trade", "The killing of newborn twins", "The palm oil tax", "Smallpox through inoculation"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Mary Slessor worked tirelessly among the Efik people in the late 19th century to eradicate the superstitious killing of twins."
  },
  {
    id: "h148", question: "The Treaty of Cession of Lagos was signed in August 1861 by which Oba of Lagos?",
    options: ["Oba Kosoko", "Oba Dosunmu (Docemo)", "Oba Akitoye", "Oba Adele"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Oba Dosunmu signed the treaty on August 6, 1861, under British threat, ceding Lagos to the British Crown."
  },
  {
    id: "h149", question: "The British naval bombardment of Lagos in December 1851 was aimed at deposing which Oba who favoured the slave trade?",
    options: ["Oba Dosunmu", "Oba Kosoko", "Oba Akitoye", "Oba Eshugbayi Eleko"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The British Navy bombarded Lagos in 1851 (the Reduction of Lagos) to oust Oba Kosoko and install Oba Akitoye, who pledged to end slave trading."
  },
  {
    id: "h150", question: "The Eleko Affair (1920\u20131931) was a protracted legal and political struggle involving which Oba of Lagos and Herbert Macaulay?",
    options: ["Oba Eshugbayi Eleko", "Oba Falolu", "Oba Sanusi Olusi", "Oba Oyekan"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Oba Eshugbayi Eleko was deposed and exiled by the colonial administration; Herbert Macaulay championed his appeal to the Privy Council."
  },
  {
    id: "h151", question: "Bishop Samuel Ajayi Crowther, consecrated in 1864, holds what historical distinction?",
    options: ["First African Anglican bishop", "First African Governor of Lagos", "Author of the first Nigerian constitution", "Founder of CMS Grammar School"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Ajayi Crowther, a rescued Yoruba captive who translated the Bible into Yoruba, became the first African Anglican bishop."
  },
  {
    id: "h152", question: "CMS Grammar School in Bariga, Lagos, founded in 1859, is historic because it is what?",
    options: ["The largest secondary school in Africa", "The oldest secondary school in Nigeria", "The first girls-only boarding school", "The first teacher training institute"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Founded on June 6, 1859, by the Church Missionary Society, CMS Grammar School is Nigeria's oldest secondary school."
  },
  {
    id: "h153", question: "King's College, Lagos, was founded by the colonial government in which year?",
    options: ["1899", "1909", "1919", "1929"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "King's College was established in 1909 by the British administration as a secondary school for boys."
  },
  {
    id: "h154", question: "Queen's College, Lagos, was established in which year as a sister institution to King's College?",
    options: ["1917", "1927", "1937", "1947"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Queen's College, Yaba, was established in October 1927 to educate female students."
  },
  {
    id: "h155", question: "The University of Nigeria, Nsukka (UNN) was founded in 1955 and formally opened in which year?",
    options: ["1957", "1958", "1960", "1963"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Championed by Dr. Nnamdi Azikiwe, UNN opened on October 7, 1960, as Nigeria's first fully indigenous university."
  },
  {
    id: "h156", question: "Ahmadu Bello University (ABU) Zaria was established in which year?",
    options: ["1960", "1962", "1965", "1970"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "ABU Zaria was established on October 4, 1962, named after the Premier of the Northern Region, Sir Ahmadu Bello."
  },
  {
    id: "h157", question: "Obafemi Awolowo University (OAU), formerly University of Ife, was founded in which year?",
    options: ["1960", "1962", "1967", "1972"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The University of Ife was established in 1962 and renamed Obafemi Awolowo University in 1987."
  },
  {
    id: "h158", question: "The first television broadcast station in Africa, WNTV (Western Nigeria Television), began broadcasting in which year?",
    options: ["1953", "1957", "1959", "1962"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "WNTV was launched in Ibadan on October 31, 1959, by Chief Obafemi Awolowo, beating many European countries to television broadcasting."
  },
  {
    id: "h159", question: "Liberty Stadium in Ibadan, opened in 1960, was the first stadium in Africa to host what type of world championship fight?",
    options: ["Heavyweight title fight", "Middleweight boxing world title fight", "Lightweight wrestling", "Karate grand prix"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "In August 1963, Dick Tiger defended his World Middleweight Boxing title against Gene Fullmer at Liberty Stadium."
  },
  {
    id: "h160", question: "Dick Tiger (Richard Ihetu) and Hogan 'Kid' Bassey were historic Nigerian pioneers in which sport?",
    options: ["Wrestling", "Professional Boxing", "Athletics", "Weightlifting"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Hogan Bassey became Nigeria's first world boxing champion in 1957, followed by Dick Tiger who won two world titles."
  },
  {
    id: "h161", question: "The National Stadium in Surulere, Lagos, was constructed to host which major continental games in 1973?",
    options: ["All-Africa Games (2nd edition)", "African Nations Cup", "ECOWAS Games", "Commonwealth Games"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "The Surulere National Stadium opened in 1972 to host the 2nd All-Africa Games in January 1973."
  },
  {
    id: "h162", question: "The 1973 All-Africa Games in Lagos introduced which mascot?",
    options: ["An eagle", "A bull", "A baby elephant (Koko)", "A leopard"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Koko the elephant calf was the beloved official mascot of the 2nd All-Africa Games in Lagos."
  },
  {
    id: "h163", question: "The National Theatre in Iganmu, Lagos, was constructed in the architectural shape of what traditional object?",
    options: ["A Yoruba talking drum", "A military officer's peaked cap", "A ceremonial coral crown", "A Benin bronze horn"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Completed in 1976 for FESTAC '77, the building's exterior was modeled after a military officer's cap."
  },
  {
    id: "h164", question: "Nigeria's famous Land Use Act was promulgated under which military leader in 1978?",
    options: ["Murtala Muhammed", "Olusegun Obasanjo", "Yakubu Gowon", "Shehu Shagari"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "General Olusegun Obasanjo enacted the Land Use Decree on March 29, 1978, vesting all urban land in state governors."
  },
  {
    id: "h165", question: "The Ethical Revolution was a national social campaign launched in 1982 by which Nigerian leader?",
    options: ["Shehu Shagari", "Muhammadu Buhari", "Ibrahim Babangida", "Yakubu Gowon"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "President Shehu Shagari launched the Ethical Revolution in 1982 to combat corruption and civic decay."
  },
  {
    id: "h166", question: "The MAMSER program (Mass Mobilization for Self Reliance, Social Justice, and Economic Recovery) was established by which government?",
    options: ["Buhari regime", "Babangida regime", "Shagari regime", "Abacha regime"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "General Babangida established MAMSER in 1987, headed by Professor Jerry Gana, to mobilize civic consciousness."
  },
  {
    id: "h167", question: "Who was the pioneer Chairman of the Independent National Electoral Commission (INEC) in 1998?",
    options: ["Ephraim Akpata", "Abel Guobadia", "Maurice Iwu", "Attahiru Jega"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Justice Ephraim Akpata was appointed by General Abdulsalami Abubakar in 1998 to organize the 1999 elections."
  },
  {
    id: "h168", question: "The first Executive President of Nigeria's Fourth Republic, inaugurated on May 29, 1999, was whom?",
    options: ["Shehu Shagari", "Olusegun Obasanjo", "Umaru Yar'Adua", "Goodluck Jonathan"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Chief Olusegun Obasanjo was inaugurated on May 29, 1999, which was celebrated as Democracy Day until 2018."
  },
  {
    id: "h169", question: "President Muhammadu Buhari changed the official Democracy Day from May 29 to June 12 in which year?",
    options: ["2016", "2017", "2018", "2020"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "In June 2018, Buhari declared June 12 as the new national Democracy Day to honour MKO Abiola's sacrifice."
  },
  {
    id: "h170", question: "MKO Abiola was posthumously awarded Nigeria's highest national honour, GCFR, in which year?",
    options: ["2003", "2010", "2018", "2021"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "President Buhari conferred the GCFR title on MKO Abiola posthumously in June 2018."
  },
  {
    id: "p071", question: "Which legendary highlife trumpeter and composer is famous for the hit song 'Eddie Quansah'?",
    options: ["Osita Osadebe", "Peacocks Guitar Band", "Celestine Ukwu", "Victor Olaiya"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "The Peacocks International Guitar Band recorded 'Eddie Quansah', which later became the theme of 'The Masquerade' TV show."
  },
  {
    id: "p072", question: "The iconic Nigerian television comedy series 'The New Masquerade' starred James Iroha as which character?",
    options: ["Chief Zebrudaya", "Gringori Akabogu", "Ovularia", "Clarus"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "James Iroha created the show and played the bumbling houseboy Gringori Akabogu."
  },
  {
    id: "p073", question: "In 'The New Masquerade', who played the bombastic lead character Chief Zebrudaya Okoroigwe Nwogbo alias 4:30?",
    options: ["Chika Okpala", "Claude Eke", "Davis Offor", "Romanus Amuta"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Chika Okpala MFR played Chief Zebrudaya, famous for his hilarious mangled English grammar."
  },
  {
    id: "p074", question: "The village comedy TV series 'Village Headmaster', created by Segun Olusola, was set in which fictional village?",
    options: ["Oja", "Oja Village (Oja)", "Aiyetoro", "Bodija"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The Village Headmaster, Nigeria's longest-running TV drama of its era, was set in the fictional Yoruba town of Oja."
  },
  {
    id: "p075", question: "The 1992 direct-to-video movie widely credited with sparking the modern Nollywood revolution is what?",
    options: ["Living in Bondage", "Nneka the Pretty Serpent", "Glamour Girls", "Scores to Settle"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Kenneth Nnebue's Igbo-language drama 'Living in Bondage' (1992) sold hundreds of thousands of VHS tapes and launched the Nollywood boom."
  },
  {
    id: "p076", question: "Who played the tragic lead character Andy Okeke in the 1992 Nollywood classic 'Living in Bondage'?",
    options: ["Kanayo O. Kanayo", "Kenneth Okonkwo", "Bob-Manuel Udokwu", "Francis Duru"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Kenneth Okonkwo played Andy Okeke, who sacrificed his wife Merit for quick wealth."
  },
  {
    id: "p077", question: "Which veteran actor earned the popular internet nickname 'Father of Sacrifices' for his frequent ritualist roles in Nollywood?",
    options: ["Pete Edochie", "Kanayo O. Kanayo", "Clem Ohameze", "Alex Usifo"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Anayo Modestus Onyekwere (Kanayo O. Kanayo) famously portrayed ritualists in films like 'Living in Bondage' and 'Blood Billionaires'."
  },
  {
    id: "p078", question: "Pete Edochie rose to continent-wide fame in 1987 portraying Okonkwo in NTA's adaptation of which literary classic?",
    options: ["The River Between", "Things Fall Apart", "Arrow of God", "No Longer at Ease"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Pete Edochie's portrayal of Chinua Achebe's Okonkwo in the 1987 TV series made him an African screen legend."
  },
  {
    id: "p079", question: "The 1994 supernatural thriller 'Nneka The Pretty Serpent' was directed by which filmmaker?",
    options: ["Teco Benson", "Zeb Ejiro", "Amaka Igwe", "Chico Ejiro"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "Zeb Ejiro directed 'Nneka The Pretty Serpent', which popularized mermaid/mami-wata themes in early Nollywood."
  },
  {
    id: "p080", question: "The pioneering 1994 English-language Nollywood film 'Glamour Girls' was produced by whom?",
    options: ["Kenneth Nnebue", "Chico Ejiro", "Tade Ogidan", "Emem Isong"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Kenneth Nnebue produced 'Glamour Girls' in 1994, which was the first big-budget English-language Nollywood blockbuster."
  },
  {
    id: "p081", question: "The beloved TV sitcom 'Checkmate' (1991\u20131994), starring Richard Mofe-Damijo, was created by which legendary writer-producer?",
    options: ["Amaka Igwe", "Lola Fani-Kayode", "Peter Igho", "Ken Saro-Wiwa"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Amaka Igwe created 'Checkmate', one of the finest television dramas in Nigerian history, introducing characters like Segun Kadiri."
  },
  {
    id: "p082", question: "Which acclaimed Nigerian sitcom created by Ken Saro-Wiwa aired in the late 1980s with the catchphrase 'To be a millionaire, think like a millionaire'?",
    options: ["The Village Headmaster", "Basi and Company", "Ripples", "Behind the Clouds"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Ken Saro-Wiwa created 'Basi and Company', featuring the comical schemer Basi (played by Albert Egbe) in Lagos."
  },
  {
    id: "p083", question: "The prolific Nollywood director nicknamed 'Mr. Prolific' for directing over 80 movies was who?",
    options: ["Zeb Ejiro", "Chico Ejiro", "Teco Benson", "Lancelot Oduwa Imasuen"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Chico Ejiro earned the moniker 'Mr. Prolific' for his rapid production of popular Nollywood direct-to-video films."
  },
  {
    id: "p084", question: "Chief Stephen Osita Osadebe was the undisputed king of which Nigerian music style?",
    options: ["Yoruba Apala", "Igbo Highlife", "Ogene", "Bongo music"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Chief Osita Osadebe was the doyen of Igbo highlife, famous across Africa for his 1984 masterpiece 'Osondi Owendi'."
  },
  {
    id: "p085", question: "Oliver De Coque, famous for the song 'Identity', played which signature sub-genre of highlife?",
    options: ["Ogene Highlife", "Afro-juju", "Makossa", "Ekassa"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Oliver De Coque and his Expo '76 band popularized Ogene highlife, blending traditional Igbo drums with electric guitars."
  },
  {
    id: "p086", question: "Haruna Ishola and Ayinla Omowura were legendary icons of which traditional Yoruba musical genre?",
    options: ["Fuji", "Apala", "Sakara", "Waka"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Haruna Ishola and Ayinla Omowura were the towering masters of Apala music, characterized by the talking drum and agidigbo."
  },
  {
    id: "p087", question: "Who is widely acknowledged as the creator and naming pioneer of Fuji music in the late 1960s?",
    options: ["King Wasiu Ayinde Marshall", "Alhaji Sikiru Ayinde Barrister", "Ayinla Kollington", "General Pasuma"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Dr. Sikiru Ayinde Barrister created Fuji music from the traditional Islamic Ajiwere/were music performed during Ramadan."
  },
  {
    id: "p088", question: "Alhaji Ayinla Kollington engaged in a famous decades-long musical rivalry with which other Fuji king?",
    options: ["Wasiu Ayinde (K1)", "Sikiru Ayinde Barrister", "Adewale Ayuba", "Saheed Osupa"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "The friendly yet fierce rivalry between Barrister and Kollington shaped Fuji music from the 1970s through the 1990s."
  },
  {
    id: "p089", question: "King Wasiu Ayinde Marshall (K1 De Ultimate) modernized Fuji in the 1980s and 1990s with which genre-defining hit album in 1993?",
    options: ["Fuji Garbage", "Consolidation", "Talazo '84", "Legacy"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "K1's 'Consolidation' and 'Talazo '84' series revolutionized Fuji, taking it from street music to elite corporate halls."
  },
  {
    id: "p090", question: "Salawa Abeni was crowned the Queen of which Yoruba musical genre by the Alaafin of Oyo in 1992?",
    options: ["Apala", "Waka Music", "Fuji", "Juju"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Queen Salawa Abeni made history as the Queen of Waka music, an Islamic-rooted Yoruba musical style traditionally sung by women."
  },
  {
    id: "p091", question: "Sir Shina Peters took Nigeria by storm in 1989 with which multi-platinum Afro-Juju album?",
    options: ["Ace (Afro-Juju Series 1)", "Shinamania", "Experience", "Dancing Time"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "SSP's 'Ace', produced by Laolu Akins, redefined Juju music with fast-paced beats, winning artist of the year in 1990."
  },
  {
    id: "p092", question: "Chief Commander Ebenezer Obey played which distinct style of Juju music?",
    options: ["Afro-Juju", "Miliki System", "Synchro System", "Sakara"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Ebenezer Obey called his sound the 'Miliki System', known for philosophical Yoruba lyrics and interlocking guitars."
  },
  {
    id: "p093", question: "King Sunny Ade's 1982 critically acclaimed album on Island Records was titled what?",
    options: ["Juju Music", "Synchro System", "Aura", "Vintage"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "KSA's 'Juju Music' album introduced him to international audiences, followed by 'Synchro System' in 1983."
  },
  {
    id: "p094", question: "Which Nigerian musician was nominated for a Grammy Award for Best World Music Album in 1999 for 'Odu'?",
    options: ["Femi Kuti", "King Sunny Ade", "Babatunde Olatunji", "Majek Fashek"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "King Sunny Ade was nominated for a Grammy in 1999 for his album 'Odu', having previously been nominated for 'Synchro System' in 1984."
  },
  {
    id: "p095", question: "The reggae superstar Majek Fashek broke into national superstardom in 1988 with which iconic hit single?",
    options: ["Send Down the Rain", "So Long Too Long", "Holy Spirit", "Free Africa"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Majekodunmi Fasheke (The Rainmaker) had a massive hit with 'Send Down the Rain' from his debut album 'Prisoner of Conscience'."
  },
  {
    id: "p096", question: "The Mandators, led by Victor Essiet, were pioneers of which genre in Nigeria during the 1980s?",
    options: ["Roots Reggae", "Afrobeat", "Makossa", "Highlife"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The Mandators brought conscious roots reggae to mass Nigerian audiences with their 1987 hit album 'Crisis'."
  },
  {
    id: "p097", question: "Ras Kimono was celebrated for which hit reggae anthem in 1989 that lamented social hardship in Nigeria?",
    options: ["Under Pressure", "What's Gwan?", "Rhumba Stylee", "Natty Get Jail"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ras Kimono's 'Under Pressure' was a smash reggae anthem capturing the economic struggles of Nigerians under military rule."
  },
  {
    id: "p098", question: "Christy Essien-Igbokwe was affectionately known as Nigeria's what?",
    options: ["Queen of Soul", "Lady of Songs", "Mama Africa", "Songstress of the Niger"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Christy Essien-Igbokwe, singer of 'Seun Rere' and founder of PMAN, was affectionately called 'The Lady of Songs'."
  },
  {
    id: "p099", question: "Onyeka Onwenu was widely celebrated by the Nigerian public under which honorific nickname?",
    options: ["The Golden Voice", "The Elegant Stallion", "Lady of Peace", "The Songbird"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Broadcaster, singer, and activist Onyeka Onwenu was affectionately called 'The Elegant Stallion'."
  },
  {
    id: "p100", question: "The 1984 smash hit duet 'Wait for Me' on planned parenthood and family values was sung by which two icons?",
    options: ["Fela Kuti and Sandra Smith", "King Sunny Ade and Onyeka Onwenu", "Ebenezer Obey and Christy Essien", "Victor Uwaifo and Onyeka Onwenu"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Sunny Ade and Onyeka Onwenu collaborated on 'Wait for Me' (1984), a widely praised public health campaign song."
  },
  {
    id: "p101", question: "The Plantashun Boiz, formed in the late 1990s, comprised which trio of artists?",
    options: ["2Face Idibia, Faze, and Blackface", "Paul, Peter, and Jude Okoye", "D'banj, Don Jazzy, and Wande Coal", "Eedris, Eddy, and Tony"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Plantashun Boiz featured 2Face (Innocent Idibia), Faze (Chibuzor Oji), and Blackface (Ahmedu Augustine Obiabo)."
  },
  {
    id: "p102", question: "2Baba's timeless love ballad 'African Queen' was the lead single of which debut solo album in 2004?",
    options: ["Grass 2 Grace", "Face 2 Face", "The Unstoppable", "Away & Beyond"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'African Queen' was on 2Face Idibia's seminal 2004 debut album 'Face 2 Face', released by Kennis Music."
  },
  {
    id: "p103", question: "Kennis Music, which transformed modern Nigerian pop in the late 1990s and 2000s, was founded by which duo?",
    options: ["Don Jazzy and D'banj", "Kehinde 'Keke' Ogungbe and Dayo 'D1' Adeneye", "Steve Babaeko and Obi Asika", "Paul Okoye and Jude Okoye"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Keke and D1 founded Kennis Music and produced the landmark TV/radio show 'AIT Jamz' / 'PrimeTime Jamz'."
  },
  {
    id: "p104", question: "The Remedies broke onto the scene in 1998 with which breakout hip-hop song widely credited as the dawn of modern Afropop?",
    options: ["Shakomo", "Mr. Lecturer", "Belinda", "Omode Meta"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The Remedies (Eedris Abdulkareem, Tony Tetuila, and Eddy Remedy) scored a national hit with 'Shakomo' in 1998."
  },
  {
    id: "p105", question: "Eedris Abdulkareem sparked national controversy and was condemned by President Obasanjo in 2004 for which protest track?",
    options: ["Jaga Jaga", "Mr. Lecturer", "Oko Omoge", "Player Meji"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Nigeria Jaga Jaga' lamented poverty and crime, drawing a furious public response from President Olusegun Obasanjo."
  },
  {
    id: "p106", question: "Tony Tetuila had a massive satirical hit in 2001 mocking politicians with which song?",
    options: ["My Car", "Morning Time", "Fefe Ne Efe", "Omode Meta"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Tony Tetuila's 'My Car' featured the hilarious hook about someone bashing his car and warning 'You hit my car, oyinbo repete!'"
  },
  {
    id: "p107", question: "Mo' Hits Records was founded in 2004 by which iconic producer and artist duo in London/Lagos?",
    options: ["Olamide and Phyno", "Don Jazzy and D'banj", "Banky W and Wizkid", "MI Abaga and Jesse Jagz"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Producer Michael Collins Ajereh (Don Jazzy) and Dapo Daniel Oyebanjo (D'banj) founded Mo' Hits Records."
  },
  {
    id: "p108", question: "Which 2008 compilation album by Mo' Hits All Stars is considered a golden-era Afropop masterpiece?",
    options: ["Curriculum Vitae (CV)", "The Entertainer", "Mushin 2 Mo' Hits", "No Long Thing"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "'Curriculum Vitae' featured mega-hits like 'Pere', 'Booty Call', 'Wind Am Well', and 'Move Your Body'."
  },
  {
    id: "p109", question: "Wande Coal released which classic debut studio album on Mo' Hits Records in 2009?",
    options: ["Wanted", "Mushin 2 Mo' Hits", "Superstar", "R&BW"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Mushin 2 Mo' Hits' is celebrated as one of the greatest and most influential debut albums in Nigerian pop history."
  },
  {
    id: "p110", question: "Following the dissolution of Mo' Hits Records in 2012, Don Jazzy founded which powerhouse record label?",
    options: ["YBNL Nation", "Mavin Records", "Starboy Entertainment", "Chocolate City"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Don Jazzy launched Mavin Records on May 8, 2012, signing Tiwa Savage, Dr SID, D'Prince, and later Reekado Banks and Rema."
  },
  {
    id: "p111", question: "The twin brothers Peter and Paul Okoye achieved continent-wide dominance as which music duo?",
    options: ["Dynamic Twins", "P-Square", "2Play", "Bracket"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "P-Square dominated African pop in the 2000s and 2010s with smash albums like 'Get Squared', 'Game Over', and 'Danger'."
  },
  {
    id: "p112", question: "P-Square's 2007 monster hit that sparked dance crazes across Africa and Europe was which song?",
    options: ["Do Me", "No One Like You", "Bizzy Body", "Chop My Money"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Do Me' featuring Waje became one of the biggest African dance records of the 2000s."
  },
  {
    id: "p113", question: "Which famous American rapper was featured on the remix of P-Square's smash hit 'Beautiful Onyinye' in 2012?",
    options: ["Snoop Dogg", "Rick Ross", "Akon", "T.I."],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Rick Ross delivered a guest verse on the 2012 remix of 'Beautiful Onyinye'."
  },
  {
    id: "p114", question: "Akon signed which three Nigerian acts to his Konvict Muzik label partnership in 2011?",
    options: ["P-Square, Wizkid, and 2Face Idibia", "D'banj, Don Jazzy, and Wande Coal", "Burna Boy, Davido, and Tiwa Savage", "Flavour, Timaya, and Olamide"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "In December 2011, Akon announced partnership deals with P-Square, Wizkid, and 2Face Idibia in Lagos."
  },
  {
    id: "p115", question: "Wizkid's landmark 2011 debut studio album on Empire Mates Entertainment (EME) was titled what?",
    options: ["Ayo", "Superstar", "Made in Lagos", "Sounds from the Other Side"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Superstar' (2011) spawned timeless tracks like 'Holla at Your Boy', 'Pakurumo', and 'Don't Dull', making Wizkid a superstar."
  },
  {
    id: "p116", question: "Banky W founded which influential record label that originally discovered and launched Wizkid?",
    options: ["Storm Records", "Empire Mates Entertainment (EME)", "Capital Hill", "Alapomeji Records"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Banky W and Tunde Demuren founded EME in 2002 in New York and brought it to Lagos in 2008."
  },
  {
    id: "p117", question: "9ice scored an era-defining crossover hit in 2008 celebrating hard work, traditional proverbs, and global dreams with which song?",
    options: ["Photocopy", "Gongo Aso", "Street Credibility", "Party Rider"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Gongo Aso' won 9ice multiple MOBO, MTV Africa, and Hip Hop World awards in 2008."
  },
  {
    id: "p118", question: "Which legendary Yoruba indigenous rapper was tragically killed in a motor accident in Lagos in April 2010?",
    options: ["Oladapo Olaitan Olaonipekun (Dagrin)", "Olamide Adedeji", "Mohbad", "Lord of Ajasa"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Dagrin (Barack O'Grin) passed away on April 22, 2010, after paving the way for mainstream street rap in Yoruba."
  },
  {
    id: "p119", question: "Olamide launched his career in 2010 with which breakout street anthem produced by ID Cabasa?",
    options: ["Durosoke", "Eni Duro", "First of All", "Voice of the Street"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Eni Duro' introduced Olamide's electric lyricism to the nation, quickly followed by his debut album 'Rapsodi'."
  },
  {
    id: "p120", question: "Timaya, the Egberi Papa 1 of Bayelsa, chronicled the 1999 military destruction of his community in which 2005 breakthrough song?",
    options: ["Plantain Boy", "Dem Mama", "Ukwu", "I Can't Kill Myself"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "'Dem Mama' told the harrowing story of the 1999 Odi massacre in Bayelsa State."
  },
  {
    id: "p121", question: "Flavour N'abania modernized contemporary Igbo highlife with which 2010 pan-African wedding anthem?",
    options: ["Ada Ada", "Nwa Baby (Ashawo Remix)", "Adamma", "Golibe"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Nwa Baby (Ashawo Remix)' became a continent-wide dance anthem, followed by the classic wedding song 'Ada Ada'."
  },
  {
    id: "p122", question: "M.I Abaga's 2008 debut album that elevated Nigerian hip-hop to mainstream radio dominance was titled what?",
    options: ["MI 2: The Movie", "Talk About It", "The Chairman", "A Study on Self Worth"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "'Talk About It' introduced songs like 'Crowd Mentality', 'Safe', and 'Anoti', establishing Chocolate City as a hip-hop titan."
  },
  {
    id: "p123", question: "Ice Prince won the BET Award for Best International Act: Africa in 2013 on the heels of which 2011 breakout hit?",
    options: ["Aboki", "Oleku", "Superstar", "Whiskey"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Oleku' featuring Brymo is widely regarded as one of the most remixed and covered hip-hop tracks in African history."
  },
  {
    id: "p124", question: "Davido broke onto the national scene in 2011 with which energetic debut single produced by Shizzi?",
    options: ["Skelewu", "Dami Duro", "Aye", "Gobe"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Dami Duro' became a massive national smash and propelled Davido's debut album 'Omo Baba Olowo' (2012)."
  },
  {
    id: "p125", question: "Tiwa Savage was crowned Best African Act at the MTV Europe Music Awards (EMA) in which year, becoming the first woman to win the category?",
    options: ["2016", "2018", "2020", "2022"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Tiwa Savage made history in November 2018 in Bilbao, Spain, winning Best African Act at the MTV EMAs."
  },
  {
    id: "p126", question: "Yemi Alade's 2013 runaway hit song whose music video surpassed 100 million views on YouTube is what?",
    options: ["Single & Searching", "Johnny", "Shekere", "Na Gode"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "'Johnny', produced by Selebobo, became an international viral sensation and dance floor staple across Africa and the diaspora."
  },
  {
    id: "p127", question: "The Shaku Shaku street dance phenomenon that swept Nigerian music in 2017\u20132018 originated from which Lagos neighbourhood?",
    options: ["Surulere", "Agege", "Ajegunle", "Yaba"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Shaku Shaku originated on the streets of Agege in Lagos, popularized by street-hop artists like Slimcase and Mr Real."
  },
  {
    id: "p128", question: "Zlatan Ibile popularized which energetic street dance step in late 2018 alongside the phrase 'Kapaichumarimarichopaco'?",
    options: ["Shaku Shaku", "Zanku (Legwork)", "Galala", "Suo"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Zlatan introduced the 'Zanku' dance (Zlatan Abeg No Kill Us) with high-energy legwork and kicks."
  },
  {
    id: "p129", question: "Which Nigerian musician won the Grammy Award for Best Global Music Album in 2021 for 'Twice As Tall'?",
    options: ["Wizkid", "Burna Boy", "Femi Kuti", "Davido"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Burna Boy's 'Twice as Tall', executive produced by Sean 'Diddy' Combs and Bose Ogulu, won the Grammy in March 2021."
  },
  {
    id: "p130", question: "Wizkid's song 'Essence' featuring Tems was famously dubbed 'the song of the summer' in 2021 by which international pop star?",
    options: ["Rihanna", "Justin Bieber", "Dua Lipa", "Drake"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Justin Bieber called 'Essence' the song of the summer and jumped on an official remix, pushing it into the Billboard Top 10."
  },
  {
    id: "p131", question: "Tems earned an Oscar nomination in 2023 for co-writing which song for Marvel's 'Black Panther: Wakanda Forever'?",
    options: ["Lift Me Up (sung by Rihanna)", "All the Stars", "Lead the Way", "Born Again"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Tems co-wrote 'Lift Me Up' with Rihanna, Ryan Coogler, and Ludwig G\u00f6ransson, earning Academy Award and Golden Globe nominations."
  },
  {
    id: "p132", question: "In 2024, which Nigerian singer's global sensation 'Water' won the inaugural Grammy Award for Best African Music Performance?",
    options: ["Ayra Starr", "Tyla (South African, but competing with Nigerian nominees)", "Tems", "Asake"],
    answer: 1, category: "Pop Culture", difficulty: "hard",
    explanation: "South Africa's Tyla won with 'Water' against a heavily Nigerian field including Asake, Burna Boy, Davido, and Ayra Starr."
  },
  {
    id: "p133", question: "The Super Eagles won their first-ever Africa Cup of Nations on home soil in which year?",
    options: ["1976", "1980", "1984", "1994"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Nigeria defeated Algeria 3-0 in the final at the National Stadium in Surulere, Lagos, on March 22, 1980."
  },
  {
    id: "p134", question: "Who was the captain of the 1980 Green Eagles squad that won the AFCON trophy?",
    options: ["Segun Odegbami", "Christian Chukwu", "Muda Lawal", "Best Ogedegbe"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "'Chairman' Christian Chukwu captained the historic 1980 championship team."
  },
  {
    id: "p135", question: "Chief Segun Odegbami was famously known on the pitch by which nickname?",
    options: ["Mathematical Odegbami", "The Magician", "Master dribbler", "The Bulldozer"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Segun Odegbami was nicknamed 'Mathematical' for his precise, calculated runs down the right wing."
  },
  {
    id: "p136", question: "Which Nigerian footballer scored the country's first-ever FIFA World Cup goal against Bulgaria in USA '94?",
    options: ["Daniel Amokachi", "Rashidi Yekini", "Emmanuel Amunike", "Finidi George"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Rashidi Yekini scored in the 21st minute and famously shook the net in iconic celebration on June 21, 1994."
  },
  {
    id: "p137", question: "Rashidi Yekini holds the record as Nigeria's all-time top international goalscorer with how many goals?",
    options: ["27", "37", "47", "57"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Yekini scored 37 goals in 62 appearances for the Super Eagles, a record that still stands."
  },
  {
    id: "p138", question: "The Nigerian national football team at the 1994 World Cup and 1996 Olympics was managed by which Dutch coach?",
    options: ["Guus Hiddink", "Clemens Westerhof", "Jo Bonfrere", "Louis van Gaal"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Clemens Westerhof managed the Super Eagles to the 1994 AFCON title and USA '94 World Cup; his assistant Jo Bonfrere led the '96 Olympic team."
  },
  {
    id: "p139", question: "Nigeria became the first African nation to win Olympic Football Gold at Atlanta 1996 after defeating which team 3-2 in the final?",
    options: ["Brazil", "Argentina", "Italy", "Mexico"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "The 'Dream Team' beat Argentina 3-2 in the final on August 3, 1996, with Emmanuel Amunike scoring the dramatic late winner."
  },
  {
    id: "p140", question: "In the semi-final of the Atlanta 1996 Olympics, Nigeria came back from 3-1 down to defeat which star-studded nation 4-3 with a golden goal by Nwankwo Kanu?",
    options: ["Spain", "Brazil", "Germany", "France"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Kanu Nwankwo scored the stoppage-time equalizer and the 94th-minute golden goal to sink a legendary Brazilian team including Ronaldo, Bebeto, and Roberto Carlos."
  },
  {
    id: "p141", question: "Nwankwo Kanu won African Footballer of the Year twice, in which two years?",
    options: ["1994 and 1998", "1996 and 1999", "1997 and 2001", "2000 and 2004"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Kanu won in 1996 after Olympic gold and again in 1999 following his sensational hat-trick for Arsenal against Chelsea."
  },
  {
    id: "p142", question: "Victor Ikpeba was named African Footballer of the Year in 1997 while playing for which European club?",
    options: ["AS Monaco", "Borussia Dortmund", "Ajax", "Standard Liege"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "'The Prince of Monaco' Victor Ikpeba won the award in 1997 under manager Ars\u00e8ne Wenger at AS Monaco."
  },
  {
    id: "p143", question: "Which Nigerian forward won the Serie A Golden Boot and was named 2023 African Footballer of the Year?",
    options: ["Ademola Lookman", "Victor Osimhen", "Victor Boniface", "Samuel Chukwueze"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Victor Osimhen led Napoli to their first Serie A scudetto in 33 years and won the 2023 CAF Best Player award."
  },
  {
    id: "p144", question: "Ademola Lookman scored a historic hat-trick in the 2024 UEFA Europa League final playing for which club?",
    options: ["Bayer Leverkusen", "Atalanta BC", "Fulham", "RB Leipzig"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Lookman scored all three goals in Atalanta's 3-0 win over previously unbeaten Bayer Leverkusen on May 22, 2024."
  },
  {
    id: "p145", question: "Chioma Ajunwa holds the distinction of winning Nigeria's first-ever individual Olympic gold medal in 1996 in which event?",
    options: ["100m sprint", "Long jump", "High jump", "400m hurdles"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Police officer Chioma Ajunwa jumped 7.12m on her first attempt to win women's long jump gold in Atlanta 1996."
  },
  {
    id: "p146", question: "Tobi Amusan broke the World Record in the 100m hurdles with a blistering time of 12.12 seconds at which championship in 2022?",
    options: ["Tokyo Olympics", "World Athletics Championships in Eugene, Oregon", "Commonwealth Games in Birmingham", "Diamond League Monaco"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Amusan shocked the sports world in Eugene, Oregon on July 24, 2022, setting the world record of 12.12 seconds."
  },
  {
    id: "p147", question: "Asisat Oshoala has won the CAF African Women's Footballer of the Year award a record how many times as of 2023?",
    options: ["4 times", "5 times", "6 times", "7 times"],
    answer: 2, category: "Pop Culture", difficulty: "medium",
    explanation: "'Agba Baller' Asisat Oshoala won her record-extending sixth African Women's Player of the Year award in December 2023."
  },
  {
    id: "p148", question: "The Super Falcons of Nigeria have dominated African women's football by winning how many Women's Africa Cup of Nations (WAFCON) titles?",
    options: ["5", "7", "9", "11"],
    answer: 3, category: "Pop Culture", difficulty: "medium",
    explanation: "The Super Falcons have won WAFCON a record 11 times out of 14 editions."
  },
  {
    id: "p149", question: "The 2016 romantic comedy 'The Wedding Party', directed by Kemi Adetiba, set box office records starring which real-life couple?",
    options: ["Olu Jacobs and Joke Silva", "Banky W and Adesua Etomi", "Richard Mofe-Damijo and Ireti Doyle", "Kunle Remi and Bimbo Ademoye"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Banky W and Adesua Etomi starred as Dozie and Dunni; the movie grossed over \u20a6450 million at Nigerian cinemas."
  },
  {
    id: "p150", question: "The gritty political thriller 'King of Boys' (2018) was written and directed by which acclaimed filmmaker?",
    options: ["Mo Abudu", "Kemi Adetiba", "Genevieve Nnaji", "Jade Osiberu"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Kemi Adetiba created 'King of Boys', featuring Sola Sobowale in her tour-de-force performance as Eniola Salami."
  },
  {
    id: "g061", question: "What is the official motto on the Nigerian Coat of Arms?",
    options: ["Peace and Unity", "Unity and Faith, Peace and Progress", "One Nation, One People", "Forward with Honour"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "The motto inscribed on the gold banner at the base of the coat of arms is 'Unity and Faith, Peace and Progress.'"
  },
  {
    id: "g062", question: "What is the capital city of Abia State?",
    options: ["Aba", "Umuahia", "Ohafia", "Arochukwu"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Umuahia is the capital of Abia State, while Aba is its major commercial hub."
  },
  {
    id: "g063", question: "What is the capital city of Adamawa State?",
    options: ["Yola", "Mubi", "Jimeta", "Numan"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Yola is the administrative capital of Adamawa State."
  },
  {
    id: "g064", question: "What is the capital city of Akwa Ibom State?",
    options: ["Eket", "Ikot Ekpene", "Uyo", "Oron"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Uyo is the capital of Akwa Ibom State."
  },
  {
    id: "g065", question: "What is the capital city of Anambra State?",
    options: ["Onitsha", "Nnewi", "Awka", "Ekwulobia"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Awka is the capital of Anambra State, while Onitsha is the famed commercial center."
  },
  {
    id: "g066", question: "What is the capital city of Bauchi State?",
    options: ["Azare", "Bauchi", "Misau", "Katagum"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Bauchi is the capital of Bauchi State."
  },
  {
    id: "g067", question: "What is the capital city of Bayelsa State?",
    options: ["Otuoke", "Yenagoa", "Brass", "Sagbama"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Yenagoa is the capital of Bayelsa State, created in 1996."
  },
  {
    id: "g068", question: "What is the capital city of Benue State?",
    options: ["Otukpo", "Makurdi", "Gboko", "Katsina-Ala"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Makurdi, situated along the Benue River, is the capital of Benue State."
  },
  {
    id: "g069", question: "What is the capital city of Borno State?",
    options: ["Biu", "Maiduguri", "Bama", "Dikwa"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Maiduguri (Yerwa) is the capital and largest city of Borno State."
  },
  {
    id: "g070", question: "What is the capital city of Cross River State?",
    options: ["Ikom", "Ogoja", "Calabar", "Ugep"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Calabar, a historic coastal port city, is the capital of Cross River State."
  },
  {
    id: "g071", question: "What is the capital city of Delta State?",
    options: ["Warri", "Asaba", "Sapele", "Ughelli"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Asaba, on the western bank of the Niger River, is the capital of Delta State."
  },
  {
    id: "g072", question: "What is the capital city of Ebonyi State?",
    options: ["Afikpo", "Abakaliki", "Onueke", "Ishielu"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Abakaliki is the capital of Ebonyi State."
  },
  {
    id: "g073", question: "What is the capital city of Edo State?",
    options: ["Auchi", "Benin City", "Ekpoma", "Uromi"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Benin City, the historic seat of the Oba of Benin, is the capital of Edo State."
  },
  {
    id: "g074", question: "What is the capital city of Ekiti State?",
    options: ["Ikole", "Ado-Ekiti", "Ijero", "Oye"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Ado-Ekiti is the capital of Ekiti State."
  },
  {
    id: "g075", question: "What is the capital city of Enugu State?",
    options: ["Nsukka", "Enugu", "Oji River", "Udi"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Enugu (the Coal City) is the capital of Enugu State."
  },
  {
    id: "g076", question: "What is the capital city of Gombe State?",
    options: ["Kaltungo", "Gombe", "Dukku", "Billiri"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Gombe is the capital of Gombe State."
  },
  {
    id: "g077", question: "What is the capital city of Imo State?",
    options: ["Orlu", "Okigwe", "Owerri", "Mbaise"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Owerri is the capital of Imo State."
  },
  {
    id: "g078", question: "What is the capital city of Jigawa State?",
    options: ["Hadejia", "Dutse", "Gumel", "Kazaure"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Dutse is the rocky capital city of Jigawa State."
  },
  {
    id: "g079", question: "What is the capital city of Kaduna State?",
    options: ["Zaria", "Kaduna", "Kafanchan", "Kagoro"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Kaduna is the capital of Kaduna State and former capital of the Northern Region."
  },
  {
    id: "g080", question: "What is the capital city of Kano State?",
    options: ["Rano", "Kano", "Bichi", "Gaya"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Kano is the capital of Kano State and one of Africa's oldest commercial cities."
  },
  {
    id: "g081", question: "What is the capital city of Katsina State?",
    options: ["Daura", "Funtua", "Katsina", "Malumfashi"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Katsina is the capital of Katsina State."
  },
  {
    id: "g082", question: "What is the capital city of Kebbi State?",
    options: ["Argungu", "Birnin Kebbi", "Yauri", "Zuru"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Birnin Kebbi is the capital of Kebbi State."
  },
  {
    id: "g083", question: "What is the capital city of Kogi State?",
    options: ["Okene", "Lokoja", "Idah", "Kabba"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Lokoja, at the confluence of the Niger and Benue rivers, is the capital of Kogi State."
  },
  {
    id: "g084", question: "What is the capital city of Kwara State?",
    options: ["Offa", "Ilorin", "Omu-Aran", "Jebba"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Ilorin is the capital of Kwara State."
  },
  {
    id: "g085", question: "What is the capital city of Lagos State?",
    options: ["Lagos Island", "Ikeja", "Surulere", "Victoria Island"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Ikeja is the official capital of Lagos State, housing the State Government Secretariat."
  },
  {
    id: "g086", question: "What is the capital city of Nasarawa State?",
    options: ["Keffi", "Lafia", "Akwanga", "Doma"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Lafia is the capital of Nasarawa State."
  },
  {
    id: "g087", question: "What is the capital city of Niger State, Nigeria's largest state by landmass?",
    options: ["Bida", "Minna", "Suleja", "Kontagora"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Minna is the capital of Niger State."
  },
  {
    id: "g088", question: "What is the capital city of Ogun State?",
    options: ["Ijebu-Ode", "Sagamu", "Abeokuta", "Ota"],
    answer: 2, category: "General Knowledge", difficulty: "easy",
    explanation: "Abeokuta, beneath the famous Olumo Rock, is the capital of Ogun State."
  },
  {
    id: "g089", question: "What is the capital city of Ondo State?",
    options: ["Ondo Town", "Akure", "Owo", "Ikare"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Akure is the capital of Ondo State."
  },
  {
    id: "g090", question: "What is the capital city of Osun State?",
    options: ["Ile-Ife", "Osogbo", "Ilesa", "Ede"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Osogbo is the capital of Osun State."
  },
  {
    id: "g091", question: "What is the capital city of Oyo State?",
    options: ["Ogbomoso", "Ibadan", "Oyo Town", "Iseyin"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Ibadan, the ancient city of brown roofs, is the capital of Oyo State."
  },
  {
    id: "g092", question: "What is the capital city of Plateau State?",
    options: ["Bukuru", "Jos", "Pankshin", "Shendam"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Jos (the 'Home of Peace and Tourism') is the capital of Plateau State."
  },
  {
    id: "g093", question: "What is the capital city of Rivers State?",
    options: ["Bonny", "Port Harcourt", "Eleme", "Ahoada"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Port Harcourt (the Garden City) is the capital of Rivers State."
  },
  {
    id: "g094", question: "What is the capital city of Sokoto State?",
    options: ["Tambuwal", "Sokoto", "Wurno", "Goronyo"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Sokoto, the historic seat of the Caliphate, is the capital of Sokoto State."
  },
  {
    id: "g095", question: "What is the capital city of Taraba State?",
    options: ["Wukari", "Jalingo", "Gembu", "Bali"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Jalingo is the capital of Taraba State."
  },
  {
    id: "g096", question: "What is the capital city of Yobe State?",
    options: ["Potiskum", "Damaturu", "Gashua", "Nguru"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Damaturu is the capital of Yobe State."
  },
  {
    id: "g097", question: "What is the capital city of Zamfara State?",
    options: ["Kaura Namoda", "Gusau", "Talata Mafara", "Anka"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Gusau is the capital of Zamfara State."
  },
  {
    id: "g098", question: "Which Nigerian state is officially branded as the 'Sunshine State'?",
    options: ["Osun", "Ondo", "Ekiti", "Ogun"],
    answer: 1, category: "General Knowledge", difficulty: "medium",
    explanation: "Ondo State's official slogan is 'Sunshine State.'"
  },
  {
    id: "g099", question: "Which Nigerian state has the official slogan 'Pacesetter State'?",
    options: ["Lagos", "Oyo", "Edo", "Kano"],
    answer: 1, category: "General Knowledge", difficulty: "medium",
    explanation: "Oyo State is known as the 'Pacesetter State' for recording many firsts in Nigeria."
  },
  {
    id: "g100", question: "Which Nigerian state is known as the 'Food Basket of the Nation'?",
    options: ["Taraba", "Benue", "Plateau", "Kebbi"],
    answer: 1, category: "General Knowledge", difficulty: "easy",
    explanation: "Benue State is famously recognized as the 'Food Basket of the Nation' due to its vast agricultural produce."
  },
  {
    id: "h171", question: "Who was the military governor of the Western State during the Agbekoya peasant revolt (1968\u20131969)?",
    options: ["Adekunle Fajuyi", "Robert Adeyinka Adebayo", "Christopher Oluwole Rotimi", "David Jemibewon"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Major General Adeyinka Adebayo was military governor of the Western State and negotiated with the Agbekoya farmers."
  },
  {
    id: "h172", question: "The Agbekoya farmers' rebellion in Western Nigeria was primarily sparked by what grievance?",
    options: ["Conscription into the army", "Excessive local taxation and harassment", "Land confiscation by timber firms", "Crop price caps on cocoa"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Agbekoya ('farmers reject suffering') revolt was an armed uprising by cocoa farmers against oppressive taxes and extortion."
  },
  {
    id: "h173", question: "The historic ancient walls of Kano were constructed between which centuries?",
    options: ["8th and 10th centuries", "11th and 14th centuries", "15th and 17th centuries", "18th and 19th centuries"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The ancient Kano city walls were begun in 1095\u20131134 by Sarki Gijimasu and expanded in the 14th century."
  },
  {
    id: "h174", question: "Which famous Queen Mother of the Benin Kingdom was honoured in the British Museum and on the FESTAC '77 emblem?",
    options: ["Queen Amina", "Idia (Iyoba)", "Emotan", "Moremi Ajasoro"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The FESTAC '77 official emblem was the 16th-century ivory pendant mask of Queen Mother Idia (mother of Oba Esigie)."
  },
  {
    id: "h175", question: "The statue of Emotan, the revered market woman and heroine of the Benin Kingdom, stands in which city?",
    options: ["Warri", "Asaba", "Benin City", "Akure"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The Emotan statue stands opposite the Oba Market in Benin City, honouring her loyalty to Oba Ewuare the Great."
  },
  {
    id: "h176", question: "Moremi Ajasoro is celebrated in Yoruba history for heroically liberating Ile-Ife from which marauding group?",
    options: ["The Dahomey warriors", "The Igbo (Ugbo) forest raiders", "The Nupe invaders", "The Fulani cavalry"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Queen Moremi sacrificed her only son Oluorogbo to learn the secret of the masquerade raiders of the Ugbo/Igbo people."
  },
  {
    id: "h177", question: "The Edi Festival in Ile-Ife is celebrated annually in honour of which legendary heroine?",
    options: ["Oya", "Yemoja", "Moremi Ajasoro", "Osun"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "The 7-day Edi Festival commemorates Moremi's courage, selflessness, and the triumph of the Ife people."
  },
  {
    id: "h178", question: "The famous bronze Head of Ife discovered in 1938 dates to approximately which century?",
    options: ["9th\u201310th century", "12th\u201314th century", "16th\u201317th century", "18th century"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The naturalistic brass and terracotta sculptures of ancient Ife date to the 12th\u201314th centuries, astonishing Western art historians."
  },
  {
    id: "h179", question: "The Kingdom of Kanem-Bornu was ruled for centuries by which long-lasting dynasty?",
    options: ["The Dan Fodio dynasty", "The Saifawa (Sayfawa) dynasty", "The Borno-Kanuri dynasty", "The Al-Kanemi dynasty"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The Sayfawa dynasty of Kanem-Bornu is considered one of the longest-ruling dynasties in human history, spanning nearly a millennium."
  },
  {
    id: "h180", question: "Mai Idris Alooma, the greatest ruler of the Bornu Empire, reigned during which century?",
    options: ["14th century", "16th century (1571\u20131603)", "18th century", "19th century"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Mai Idris Alooma acquired Turkish firearms and Arab camel cavalry, modernizing Bornu at the height of its imperial power."
  },
  {
    id: "h181", question: "Sheikh Muhammad al-Amin al-Kanemi defended the Bornu Empire against which invasion in the early 19th century?",
    options: ["French colonial forces", "The Fulani Jihad of the Sokoto Caliphate", "The Tuareg confederacy", "The British Northern Frontier Force"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Al-Kanemi repelled Sokoto forces in Bornu, exchanging famous philosophical and theological letters with Muhammad Bello."
  },
  {
    id: "h182", question: "Muhammad Bello, the second Sultan of Sokoto and son of Usman dan Fodio, founded which city as the empire's administrative capital?",
    options: ["Gwandu", "Wurno", "Sokoto", "Katsina"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Muhammad Bello oversaw the rapid growth and architectural development of Sokoto, ruling as Sultan from 1817 to 1837."
  },
  {
    id: "h183", question: "Nana Asma'u (1793\u20131864), daughter of Usman dan Fodio, is widely celebrated as an early pioneer of what?",
    options: ["Islamic astronomy", "Women's education and literary scholarship in West Africa", "Military medicine", "Diplomatic translation with Europe"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Nana Asma'u created the Yan Taru network of women teachers and composed influential poetry in Arabic, Fula, and Hausa."
  },
  {
    id: "h184", question: "The Oyo Empire was governed by an imperial ruler known as what?",
    options: ["The Ooni", "The Alaafin", "The Awujale", "The Alake"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The Alaafin of Oyo was the supreme political monarch of the Oyo Empire, advised by the Council of Oyo Mesi."
  },
  {
    id: "h185", question: "In the Oyo Empire, which powerful council of seven hereditary chiefs held the constitutional power to check the Alaafin?",
    options: ["The Ogboni Society", "The Oyo Mesi", "The Esan Chiefs", "The Parakoyi"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Oyo Mesi, led by the Bashorun (Prime Minister), held the power to present the Alaafin with an empty calabash signifying suicide."
  },
  {
    id: "h186", question: "Bashorun Gaa was a notorious 18th-century Prime Minister of Oyo famous for what?",
    options: ["Building the cavalry corps", "Usurping absolute power and forcing multiple Alaafins to commit suicide", "Defeating the Dahomey army", "Signing treaties with French merchants"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Bashorun Gaa's tyrannical reign saw the forced deaths of four Alaafins before he was overthrown and executed by Alaafin Abiodun."
  },
  {
    id: "h187", question: "Alaafin Abiodun's reign (1774\u20131789) is celebrated as what in the historiography of the Oyo Empire?",
    options: ["The Fall of Oyo", "The Golden Age of peace and prosperity", "The Military Expansion", "The British Alliance"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Alaafin Abiodun defeated Gaa and ushered in a golden era of commercial wealth and artistic flourishing in Oyo."
  },
  {
    id: "h188", question: "The historic Nupe Kingdom (Tsoede dynasty) established its famed capital at which city in the 19th century?",
    options: ["Bida", "Pategi", "Lafia", "Keffi"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Bida became the capital of the Nupe Kingdom in the mid-19th century, renowned for glassmaking, brasswork, and metallurgy."
  },
  {
    id: "h189", question: "Tsoede (Edegi) is the legendary 16th-century culture hero and founder of which Nigerian kingdom?",
    options: ["Efik Kingdom", "Nupe Kingdom", "Jukun Kingdom (Kwararafa)", "Igala Kingdom"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Tsoede fled the court of Idah with bronze treasures and founded the Nupe Kingdom along the middle Niger."
  },
  {
    id: "h190", question: "The Igala Kingdom in central Nigeria has its traditional spiritual capital at which historic city?",
    options: ["Ankpa", "Dekina", "Idah", "Lokoja"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Idah, on the eastern bank of the Niger River, is the ancient seat of the Attah of Igala."
  },
  {
    id: "h191", question: "The legendary Attah of Igala Queen Inikpi is celebrated for which heroic sacrifice?",
    options: ["Diving into the river to secure rain", "Submitting to voluntary burial alive to save her father's kingdom from defeat", "Leading female archers against Nupe", "Assassinating the enemy general"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Princess Inikpi agreed to be buried alive on the banks of the Niger to ensure the supernatural victory of Igala over Benin."
  },
  {
    id: "h192", question: "The Kwararafa confederacy was a formidable military state established primarily by which ethnic group?",
    options: ["Tiv", "Jukun", "Berom", "Idoma"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The Jukun people led the powerful Kwararafa confederacy, which launched successful military campaigns across northern Nigeria."
  },
  {
    id: "h193", question: "The Tiv people of the Benue Valley traditionally organized their society through which political structure?",
    options: ["Centralized monarchical kingdom", "Decentralized, acephalous (stateless) segmentary lineage system", "Military oligarchy", "Emirate system"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Tiv were traditionally a non-centralized society organized around patriarchal lineage councils without a paramount king until colonial times."
  },
  {
    id: "h194", question: "The paramount traditional ruler of the Tiv people today holds which royal title, created in 1946?",
    options: ["Tor Tiv", "Och'Idoma", "Aku Uka", "Long Goemai"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "The title Tor Tiv was established under British indirect rule in 1946, with Makurdi-Gboko as the royal seat."
  },
  {
    id: "h195", question: "The paramount traditional monarch of the Idoma people of Benue State is known as what?",
    options: ["Tor Tiv", "Och'Idoma", "Etsu Nupe", "Attah Igala"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The Och'Idoma of Idomaland has his traditional royal palace in Otukpo, Benue State."
  },
  {
    id: "h196", question: "The traditional monarch of the Nupe Kingdom is known by which title?",
    options: ["Etsu Nupe", "Emir of Zazzau", "Lamido of Adamawa", "Ooni of Ife"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "The Etsu Nupe is the traditional ruler of Nupe land, seated at the royal Wadata Palace in Bida."
  },
  {
    id: "h197", question: "The traditional paramount ruler of the Adamawa Emirate holds which title?",
    options: ["Emir of Fombina", "Lamido of Adamawa", "Shehu of Borno", "Sarki of Yola"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Lamido of Adamawa is the paramount ruler of Fombina (the south), based in Yola."
  },
  {
    id: "h198", question: "The paramount traditional monarch of Borno is known by which historic title?",
    options: ["Emir of Kano", "Shehu of Borno", "Mai of Kanem", "Wali of Borno"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The Shehu of Borno is the revered traditional Islamic leader of Borno, descended from the Kanemi dynasty."
  },
  {
    id: "h199", question: "The Sultan of Sokoto holds which preeminent religious title in Nigerian Islam?",
    options: ["Grand Mufti of West Africa", "Amir al-Mu'minin (Leader of the Faithful)", "Chief Imam of Nigeria", "Supreme Caliph of the Sahel"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The Sultan of Sokoto is recognized as Amir al-Mu'minin and the spiritual head of Nigerian Muslims."
  },
  {
    id: "h200", question: "The Ooni of Ile-Ife is traditionally regarded as what in Yoruba spiritual heritage?",
    options: ["The commander of the armies", "The spiritual father and progenitor of the Yoruba race", "The prime minister of Ibadan", "The custodian of Sango only"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "The Ooni is venerated as the spiritual father of the Yoruba people, occupying the primordial throne of Oduduwa."
  },
  {
    id: "h201", question: "The Ekumeku Movement (1893\u20131914) was a 20-year guerrilla resistance against British colonial expansion led by which people?",
    options: ["Anioma (Western Igbo)", "Tiv", "Nupe", "Ijaw"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The Ekumeku secret society fought protracted guerrilla warfare against British penetration in the Asaba hinterland."
  },
  {
    id: "h202", question: "Who was the Oba of Lagos who was reinstated by the British in 1851 after promising to abolish the slave trade?",
    options: ["Oba Kosoko", "Oba Akitoye", "Oba Dosunmu", "Oba Adele"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Oba Akitoye was restored to the throne in 1851 with British naval backing, signing a treaty outlawing the slave trade."
  },
  {
    id: "h203", question: "The treaty of protectorate between Queen Victoria and the chiefs of Old Calabar was signed in which year?",
    options: ["1884", "1894", "1904", "1914"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "On September 10, 1884, the Efik kings and chiefs signed a treaty placing Calabar under British protection."
  },
  {
    id: "h204", question: "King Nana Olomu of Itsekiri (governor of the Benin River) was attacked and exiled by the British in which year?",
    options: ["1894", "1897", "1900", "1905"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Nana Olomu defended his trading monopoly against British forces in Ebrohimi in 1894 before being captured and exiled to Ghana."
  },
  {
    id: "h205", question: "Which city in southwestern Nigeria is historically famous for manufacturing the traditional beaded crown of Yoruba kings?",
    options: ["Ibadan", "Ile-Ife", "Oyo", "Owo"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Ile-Ife is traditionally revered as the spiritual home from which all legitimate Yoruba beaded crowns (Ade Are) derive."
  },
  {
    id: "h206", question: "The ancient Nok culture sites were discovered in which present-day Nigerian state?",
    options: ["Kaduna State", "Plateau State", "Benue State", "Niger State"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Nok artifacts were first unearthed during tin-mining operations around Nok village in southern Kaduna State in 1928."
  },
  {
    id: "h207", question: "The ancient Ife glass beads ('Segi' beads) produced in early medieval workshops were celebrated for what color?",
    options: ["Deep red", "Dichroic blue and green", "Bright yellow", "Opaque white"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Archaeologists in Ife uncovered sophisticated medieval crucible furnaces that produced famed blue-green dichroic glass beads."
  },
  {
    id: "h208", question: "The Kanem-Bornu Empire adopted Islam as its state religion during the reign of which Mai in the 11th century?",
    options: ["Mai Hume (Hummay)", "Mai Dunama I", "Mai Idris Alooma", "Mai Ali Gaji"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Mai Hummay (c. 1086\u20131097) founded the Muslim Sayfawa dynasty, establishing Islam as the imperial religion."
  },
  {
    id: "h209", question: "The ancient city of Birni Ngazargamu served as the grand imperial capital of which empire for over 300 years?",
    options: ["Oyo Empire", "Bornu Empire", "Benin Kingdom", "Sokoto Caliphate"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Founded by Mai Ali Gaji around 1472, Birni Ngazargamu was the fortified capital of the Bornu Empire until sacked by Fulani forces in 1808."
  },
  {
    id: "h210", question: "The Battle of Tabkin Kwatto in June 1804 was the first major military confrontation between Usman dan Fodio and which kingdom?",
    options: ["Gobir", "Kano", "Katsina", "Kebbi"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Dan Fodio's forces defeated the army of Sarkin Gobir Yunfa at Tabkin Kwatto, turning the reform movement into a state-building revolution."
  },
  {
    id: "h211", question: "Abdullahi dan Fodio, younger brother of Usman dan Fodio, was the first ruler and intellectual head of which division of the Caliphate?",
    options: ["Gwandu Emirate", "Adamawa Emirate", "Bauchi Emirate", "Kano Emirate"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Abdullahi dan Fodio administered the western division of the Sokoto Caliphate from Gwandu and was a prolific Islamic legal scholar."
  },
  {
    id: "h212", question: "Which famous 19th-century British explorer visited the Sokoto Caliphate twice and documented his conversations with Sultan Muhammad Bello?",
    options: ["Mungo Park", "Hugh Clapperton", "Richard Lander", "John Beecroft"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Captain Hugh Clapperton visited Sokoto in 1824 and 1826, recording detailed geographical and historical accounts."
  },
  {
    id: "h213", question: "Mungo Park, the Scottish explorer, died in 1806 while trying to navigate the Niger River rapids at which location?",
    options: ["Lokoja", "Bussa (Niger State)", "Jebba", "Kainji"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Mungo Park's expedition was ambushed and drowned at the Bussa rapids in present-day Niger State."
  },
  {
    id: "h214", question: "The brothers Richard and John Lander successfully traced the mouth of the River Niger to the Atlantic Ocean in which year?",
    options: ["1815", "1830", "1851", "1861"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "In 1830, the Lander brothers proved that the Oil Rivers in the Niger Delta were the outlet of the great Niger River."
  },
  {
    id: "h215", question: "The 1841 Niger Expedition dispatched by the British government aimed to promote commerce and treaties, but suffered heavy casualties from what?",
    options: ["Armed naval attacks", "Malaria and tropical fevers", "Shipwrecks at the coast", "Locust plagues"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Out of 145 European personnel on the 1841 expedition, 48 died of malaria within two months, leading to the use of quinine in later voyages."
  },
  {
    id: "h216", question: "Dr. William Balfour Baikie demonstrated the successful use of which medical treatment during his 1854 Niger expedition?",
    options: ["Aspirin", "Quinine prophylaxis against malaria", "Penicillin", "Smallpox vaccine"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Baikie's 1854 expedition completed its journey up the Niger and Benue without a single European casualty thanks to daily doses of quinine."
  },
  {
    id: "h217", question: "The ancient Kingdom of Bonny was historically governed by a council of chiefs organized into merchant houses called what?",
    options: ["Secret guilds", "Canoe Houses (Wari)", "Chieftaincy estates", "Compound syndicates"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Bonny's social and commercial life was organized around Canoe Houses, which fielded armed trade canoes on the delta creeks."
  },
  {
    id: "h218", question: "The Nembe-Brass uprising of 1895 led by King Koko was a revolt against the monopoly and tariffs of which company?",
    options: ["The Royal Niger Company", "The Dutch West India Company", "John Holt & Co", "The United Africa Company"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "King Koko led Nembe warriors to raid the Royal Niger Company headquarters at Akassa to break their trade monopoly."
  },
  {
    id: "h219", question: "Following the 1895 Akassa raid, which British naval officer led a punitive expedition that sacked and burned Nembe?",
    options: ["Admiral Sir Frederick Bedford", "Lord Lugard", "Sir Ralph Moor", "Captain Harry Johnston"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Rear-Admiral Bedford commanded the British naval force that bombarded and destroyed Nembe in February 1895."
  },
  {
    id: "h220", question: "The Satiru rebellion of 1906 near Sokoto was an anti-colonial religious uprising inspired by which movement?",
    options: ["Tijaniyyah", "Mahdism", "Qadiriyyah", "Sanusiyyah"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The Satiru villagers declared their leader the Mahdi and routed a British-commanded detachment before being brutally crushed by British artillery."
  },
  {
    id: "h221", question: "The National Congress of British West Africa (NCBWA) was founded in 1920 in Accra by African elites including which Nigerian nationalist?",
    options: ["Herbert Macaulay", "Nnamdi Azikiwe", "Ahmadu Bello", "Dennis Osadebay"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Herbert Macaulay, J.E. Casely Hayford, and regional leaders mobilized educated West Africans to petition the British Crown for self-government."
  },
  {
    id: "h222", question: "The Nigerian Youth Movement (NYM), formed in 1934, was initially founded as what?",
    options: ["Lagos Youth Movement", "National Democratic Party", "Young West Africans Club", "Anti-Colonial League"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Ernest Ikoli, Samuel Akinsanya, and Dr. J.C. Vaughan established the Lagos Youth Movement in 1934, renaming it NYM in 1936."
  },
  {
    id: "h223", question: "The split in the Nigerian Youth Movement (NYM) in 1941 occurred over the contest for a vacant Legislative Council seat between whom?",
    options: ["Ernest Ikoli and Samuel Akinsanya", "Herbert Macaulay and Nnamdi Azikiwe", "Awolowo and Azikiwe", "Tafawa Balewa and Ahmadu Bello"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The bitter contest between Ernest Ikoli (supported by Awolowo) and Samuel Akinsanya (supported by Azikiwe) fractured the first truly national party."
  },
  {
    id: "h224", question: "The General Strike of 1945 in Nigeria, which shut down railways and government departments for 45 days, was led by which union leader?",
    options: ["Michael Imoudu", "Wahab Goodluck", "Hassan Sunmonu", "Paschal Bafyau"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Michael Imoudu (Labour Leader No. 1) led over 40,000 workers on strike demanding a cost-of-living allowance after wartime inflation."
  },
  {
    id: "h225", question: "The shooting of 21 striking coal miners by colonial police at Iva Valley Coal Mine occurred in which city in November 1949?",
    options: ["Enugu", "Calabar", "Aba", "Jos"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "The tragic Iva Valley Massacre on November 18, 1949, galvanized Nigerian nationalists across all ethnic groups against British rule."
  },
  {
    id: "h226", question: "Chief Anthony Enahoro made history on March 31, 1953, by moving which landmark motion in the House of Representatives?",
    options: ["Motion for Republic status", "Motion for Self-Government in 1956", "Motion for oil nationalization", "Motion for universal free primary education"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Enahoro's self-government motion in 1953 triggered intense political drama between southern and northern delegates, speeding up independence."
  },
  {
    id: "h227", question: "The London Constitutional Conference of 1957 granted internal self-government to which two regions?",
    options: ["Western and Eastern regions", "Northern and Western regions", "Northern and Eastern regions", "Mid-Western and Western regions"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "The Western and Eastern regions gained internal self-government in 1957, while the Northern Region followed in 1959."
  },
  {
    id: "h228", question: "The Northern Region achieved internal self-government on March 15 of which year?",
    options: ["1957", "1958", "1959", "1960"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Northern Nigeria took self-government in March 1959, paving the way for full nationwide independence on October 1, 1960."
  },
  {
    id: "h229", question: "Who served as the sole Administrator of the Western Region during the state of emergency declared by Balewa in 1962?",
    options: ["Dr. Moses Majekodunmi", "Chief Obafemi Awolowo", "Chief Ladoke Akintola", "Chief Rotimi Williams"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Senator Dr. Moses Adekoyejo Majekodunmi was appointed Administrator on May 29, 1962, amidst political chaos in the Western parliament."
  },
  {
    id: "h230", question: "Chief Obafemi Awolowo was convicted of treasonable felony and sentenced to 10 years imprisonment in which year?",
    options: ["1960", "1962", "1963", "1965"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Justice George Sodeinde Sowemimo convicted Awolowo and his lieutenants in September 1963 after a sensational treason trial."
  },
  {
    id: "h231", question: "Who released Chief Obafemi Awolowo from Calabar prison in August 1966?",
    options: ["Aguiyi-Ironsi", "Yakubu Gowon", "Murtala Muhammed", "Emeka Ojukwu"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Lt. Col. Yakubu Gowon pardoned and released Awolowo, subsequently appointing him Federal Commissioner for Finance and Vice Chairman of the FEC."
  },
  {
    id: "h232", question: "The Western Nigeria general election crisis of October 1965, characterized by widespread arson and murder, was dubbed what?",
    options: ["Operation Clean Sweep", "Operation Wetie", "Operation Locust", "Operation Firestorm"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Protesters poured petrol on homes, vehicles, and opponents ('Wetie' meaning 'douse it') after rigged regional elections."
  },
  {
    id: "h233", question: "The Tiv progressive political movement of the late 1950s and 1960s was organized under which political party led by Joseph Tarka?",
    options: ["United Middle Belt Congress (UMBC)", "Northern Elements Progressive Union (NEPU)", "Action Group (AG)", "Middle Belt Front"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Senator Joseph Sarwuan Tarka led the UMBC in an alliance with Awolowo's Action Group to advocate for Middle Belt autonomy."
  },
  {
    id: "h234", question: "The Midwest referendum of July 13, 1963, saw what overwhelming percentage of voters support creating the new region?",
    options: ["55%", "68%", "89%", "98%"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Over 89% of eligible voters cast ballots in favour of creating the Mid-Western Region out of the Western Region."
  },
  {
    id: "h235", question: "Who was appointed the first civilian Governor of the Mid-Western Region in 1964?",
    options: ["Chief Jereton Mariere", "Chief Dennis Osadebay", "Chief Festus Okotie-Eboh", "Chief James Otobo"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Chief Samuel Jereton Mariere served as Governor while Chief Dennis Osadebay served as Premier."
  },
  {
    id: "h236", question: "Chief Festus Okotie-Eboh, the flamboyant Federal Minister of Finance assassinated in the 1966 coup, represented which area?",
    options: ["Warri (Itsekiri)", "Benin", "Calabar", "Sapele"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Chief Okotie-Eboh, famous for his grand Itsekiri robes with long trails carried by boys, managed Nigeria's finances from 1957 to 1966."
  },
  {
    id: "h237", question: "The Republic of Benin (a short-lived secessionist state in Nigeria during the civil war) was proclaimed in 1967 by which Biafran commander?",
    options: ["Major Albert Okonkwo", "Colonel Victor Banjo", "Major Joe Achuzia", "Colonel Mike Inveso"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Following the Biafran invasion of the Mid-West, Major Albert Okonkwo proclaimed the short-lived 'Republic of Benin' in September 1967."
  },
  {
    id: "h238", question: "Which Nigerian division, commanded by Colonel Murtala Muhammed, recaptured the Mid-West from Biafran forces in late 1967?",
    options: ["1st Division", "2nd Division", "3rd Marine Commando", "4th Brigade"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The 2nd Infantry Division was hastily formed and drove Biafran forces out of the Mid-West back across the Niger Bridge."
  },
  {
    id: "h239", question: "Colonel Benjamin Adekunle, one of the most famous federal commanders during the Civil War, was nicknamed what?",
    options: ["The Black Scorpion", "The Desert Fox", "The Iron General", "The Jungle Tiger"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Benjamin Adekunle commanded the 3rd Marine Commando Division with aggressive naval and amphibious landings across the southern coast."
  },
  {
    id: "h240", question: "Who took over command of the 3rd Marine Commando Division from Benjamin Adekunle in 1969, leading it to final victory in 1970?",
    options: ["Olusegun Obasanjo", "Theophilus Danjuma", "Ibrahim Babangida", "Sani Abacha"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Colonel Olusegun Obasanjo reorganized the 3rd Marine Commando, broke through Biafran defences, and accepted the formal surrender."
  },
  {
    id: "h241", question: "Biafra's improvised military armored vehicles and artillery cannons engineered by domestic scientists were called what?",
    options: ["Ogbunigwe", "Red Devils", "Biafra Tanks", "Scorpions"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The armored vehicles crafted by the Biafran Research and Production unit (RAP) on tractor and lorry chassis were known as 'Red Devils'."
  },
  {
    id: "h242", question: "The deadly flying explosive mine invented by Biafran scientists that devastated federal columns was called what?",
    options: ["Ogbunigwe", "Amadioha", "Umuahia Bomb", "Thunderstrike"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "The Ogbunigwe ('mass killer' or 'cluster mine') was a terrifying and highly effective surface weapon created by Biafran engineers."
  },
  {
    id: "h243", question: "The Uli Airstrip (code-named Annabelle) was critical to Biafra during the civil war for what purpose?",
    options: ["A clandestine night airlift of relief food and weapons", "Exporting refined petroleum", "Training fighter pilots", "Presidential escapes"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "The Uli night airlift, operated by church charities and mercenaries under federal anti-aircraft fire, was the largest civilian humanitarian airlift in history."
  },
  {
    id: "h244", question: "Carl Gustaf von Rosen, a Swedish humanitarian pilot, flew which small modified aircraft in low-altitude rocket raids for Biafra?",
    options: ["MiG-17", "Malm\u00f6 MFI-9 'Biafra Babies'", "Spitfire", "Mirage V"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Count von Rosen equipped tiny single-engine trainer planes with rocket pods, dubbing them the 'Babies of Biafra' and striking federal airfields."
  },
  {
    id: "h245", question: "The 1970 decree that gave \u00a320 to every depositor of Biafran currency regardless of bank balance was overseen by which Finance Commissioner?",
    options: ["Shehu Shagari", "Chief Obafemi Awolowo", "Alhaji Aminu Kano", "Anthony Enahoro"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The controversial banking policy supervised by Awolowo remains one of the most intensely debated economic decisions of post-war reconstruction."
  },
  {
    id: "h246", question: "General Yakubu Gowon was overthrown in a bloodless coup on July 29, 1975, while attending an OAU summit in which city?",
    options: ["Addis Ababa", "Kampala, Uganda", "Nairobi", "Cairo"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "Gowon was in Kampala attending the 12th Organisation of African Unity summit when Brigadier Murtala Muhammed assumed power in Lagos."
  },
  {
    id: "h247", question: "Which respected Nigerian diplomat announced the bloodless coup that ousted Yakubu Gowon over Radio Nigeria in July 1975?",
    options: ["Colonel Joseph Garba", "Colonel Theophilus Danjuma", "Lt. Col. Shehu Musa Yar'Adua", "Brigadier Iliya Bisalla"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Colonel Joe Garba, Commander of the Elite Brigade of Guards and a close confidant of Gowon, announced the change of government."
  },
  {
    id: "h248", question: "General Murtala Muhammed retired more than how many civil servants, judges, and military officers in his sweeping anti-corruption purge of 1975?",
    options: ["500", "2,000", "10,000+", "50,000"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Murtala retired over 10,000 public officials with immediate effect to eliminate deadwood, sluggishness, and corrupt practices."
  },
  {
    id: "h249", question: "The Justice Ayo Irikefe Panel of 1975 was tasked by the federal military government with recommending what?",
    options: ["The creation of new states", "The relocation of the federal capital", "The adoption of the Naira", "The civil service pension scheme"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The Irikefe Panel recommended the creation of seven new states, which Murtala Muhammed approved in February 1976."
  },
  {
    id: "h250", question: "The Justice Taslim Elias-chaired Constitution Drafting Committee (CDC) appointed in 1975 to prepare the 1979 Constitution was famously dubbed what?",
    options: ["The Council of State", "The 50 Wise Men (eventually 49 after Chief Awolowo declined)", "The Grand Jury", "The Federalist Commission"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Chief Obafemi Awolowo declined membership, leaving the '49 Wise Men' to produce the draft American-style presidential constitution."
  },
{
    id: "h251", question: "The 1979 Constitution of Nigeria replaced the British parliamentary system with which system of government?",
    options: ["American-style presidential system", "French semi-presidential model", "Swiss directorial system", "Monarchical council"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "The 1979 Constitution introduced an Executive President as both head of state and head of government."
  },
  {
    id: "h252", question: "Who was Nigeria's Minister of External Affairs who championed the anti-apartheid struggle in South Africa during the 1970s?",
    options: ["Joseph Garba", "Bolaji Akinyemi", "Okoi Arikpo", "Ibrahim Gambari"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Major General Joseph Garba led Nigeria's aggressive foreign policy, establishing Nigeria as a frontline state against apartheid."
  },
  {
    id: "h253", question: "Nigeria nationalized the assets of British Petroleum (BP) in 1979 in protest against British policy towards which country?",
    options: ["Zimbabwe (Rhodesia)", "South Africa", "Namibia", "Angola"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "General Obasanjo nationalized BP assets on the eve of the 1979 Commonwealth Summit to force Britain's hand on Zimbabwean independence."
  },
  {
    id: "h254", question: "Nigeria recognized the MPLA government in Angola in 1975 under which Head of State, shifting African diplomacy?",
    options: ["Murtala Muhammed", "Yakubu Gowon", "Olusegun Obasanjo", "Shehu Shagari"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Murtala Muhammed's historic 'Africa Has Come of Age' speech at the 1976 OAU summit rallied the continent behind the MPLA."
  },
  {
    id: "h255", question: "The Technical Aid Corps (TAC) scheme was established in 1987 under which Foreign Affairs Minister?",
    options: ["Bolaji Akinyemi", "Ike Nwachukwu", "Ibrahim Gambari", "Matthew Mbu"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Professor Bolaji Akinyemi initiated the TAC scheme to share Nigerian professional expertise with African, Caribbean, and Pacific nations."
  },
  {
    id: "h256", question: "The Concert of Medium Powers (the Lagos Forum) was an international diplomatic initiative launched in 1987 by which minister?",
    options: ["Bolaji Akinyemi", "Joe Garba", "Emeka Anyaoku", "Oladapo Fafowora"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Bolaji Akinyemi convened 16 regional powers from across the globe in Lagos to bridge the Cold War divide."
  },
  {
    id: "h257", question: "Who was Nigeria's first female minister of cabinet rank, appointed Federal Minister of Internal Affairs in 1979?",
    options: ["Chief (Mrs.) Janet Akinrinade", "Chief Ebun Oyagbola", "Mrs. Kofoworola Pratt", "Mrs. Francesca Emanuel"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Chief Adenike Ebun Oyagbola was appointed Minister of National Planning by President Shehu Shagari in 1979."
  },
  {
    id: "h258", question: "Chief Janet Akinrinade served as Minister of State in which ministry during the Second Republic?",
    options: ["Internal Affairs", "Education", "External Affairs", "Health"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Chief Janet Akinrinade of the NPP served as Minister of State for Internal Affairs under the NPN-NPP accord."
  },
  {
    id: "h259", question: "Who was the first female permanent secretary in the Nigerian federal civil service, appointed in 1975?",
    options: ["Francesca Yetunde Emanuel", "Amina Salihu", "Grace Alele-Williams", "Aida Mohammed"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Francesca Emanuel broke the glass ceiling in 1975, serving with distinction across several key federal ministries."
  },
  {
    id: "h260", question: "Professor Grace Alele-Williams made history in 1985 by becoming what?",
    options: ["First female vice-chancellor of an African university (University of Benin)", "First female federal judge", "First female cabinet minister", "First female pilot"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Grace Alele-Williams was appointed Vice-Chancellor of the University of Benin in 1985, a historic first for Nigerian women in academia."
  },
  {
    id: "h261", question: "The pioneer female pilot in Nigeria, who flew for Nigeria Airways in the 1980s, was whom?",
    options: ["Captain Chinyere Kalu", "Captain Hadiza Lantana Oboh", "Captain Blessing Liman", "Captain Adeola Ogunmola"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Captain Chinyere Kalu MFR became Nigeria's first female commercial pilot in 1978 and later Rector of NCAT, Zaria."
  },
  {
    id: "h262", question: "Captain Blessing Liman made history in 2011 as Nigeria's first female what?",
    options: ["Military combat jet pilot in the Nigerian Air Force", "Commercial airline captain", "Helicopter gunship commander", "Navy ship captain"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Blessing Liman was commissioned as the first female combat pilot in the Nigerian Air Force in December 2011."
  },
  {
    id: "h263", question: "The Maitatsine religious riots of December 1980 that claimed thousands of lives took place in which city?",
    options: ["Kano", "Maiduguri", "Kaduna", "Yola"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Mohammed Marwa (Maitatsine) led an extremist religious insurrection in Yan Awaki, Kano, which was crushed by the Nigerian Army."
  },
  {
    id: "h264", question: "President Shehu Shagari deployed the Nigerian Army to end the Maitatsine uprising under the command of which future Head of State?",
    options: ["General Muhammadu Buhari", "General Sani Abacha", "General Ibrahim Babangida", "General Abdulsalami Abubakar"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Major General Muhammadu Buhari, GOC 3rd Armoured Division, supervised the military operation that neutralised the Maitatsine enclave."
  },
  {
    id: "h265", question: "Nigeria expelled an estimated two million undocumented West African migrants in early 1983 under an executive order popularly dubbed what?",
    options: ["Ghana Must Go", "Aliens Repatriation Act", "Operation Clean Coast", "ECOWAS Exit"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "The order prompted millions of Ghanaians and other nationals to pack their belongings into popular checkered bags still called 'Ghana Must Go'."
  },
  {
    id: "h266", question: "Who was the Minister of Internal Affairs who issued the January 1983 alien expulsion order?",
    options: ["Alhaji Ali Baba", "Umaru Dikko", "Shehu Musa", "Ibrahim Tahir"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Alhaji Ali Baba announced on January 17, 1983, that all illegal aliens had two weeks to leave the country."
  },
  {
    id: "h267", question: "The sensational 1984 kidnapping attempt of Umaru Dikko in London involved crate boxes addressed to which entity?",
    options: ["The Nigerian High Commission, Lagos", "Federal Ministry of External Affairs, Lagos", "Dodan Barracks, Lagos", "Supreme Military Council"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Exiled transport minister Umaru Dikko was drugged and crated as diplomatic baggage addressed to the Ministry of External Affairs in Lagos before British customs intervened."
  },
  {
    id: "h268", question: "Which foreign intelligence agency was implicated alongside Nigerian operatives in the 1984 Umaru Dikko affair in London?",
    options: ["Israeli Mossad", "Soviet KGB", "American CIA", "French DGSE"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Four men, including an Israeli doctor (Lev-Arie Shapiro) and three Israeli intelligence contacts, were convicted in British courts for the kidnap attempt."
  },
  {
    id: "h269", question: "The Nigerian National Petroleum Corporation (NNPC) was established on April 1, 1977, through the merger of the Ministry of Petroleum and what entity?",
    options: ["Nigerian National Oil Corporation (NNOC)", "Shell-BP Nigeria", "African Petroleum", "Federal Oil Commission"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "NNPC was created by Decree 33 of 1977, merging the regulatory functions of the Ministry with the commercial assets of the NNOC."
  },
  {
    id: "h270", question: "Who served as the pioneer Federal Commissioner for Petroleum and Natural Resources upon NNPC's creation in 1977?",
    options: ["Colonel Muhammadu Buhari", "Chief Festus Okotie-Eboh", "Dr. Rilwanu Lukman", "Professor Tam David-West"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Colonel Muhammadu Buhari was appointed Federal Commissioner for Petroleum Resources and Chairman of the NNPC under Obasanjo's military regime."
  },
  {
    id: "h271", question: "Dr. Rilwanu Lukman served as President of the OPEC Conference for a record how many consecutive terms between 1986 and 1989?",
    options: ["4 terms", "6 terms", "8 terms", "10 terms"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Dr. Rilwanu Lukman served eight consecutive terms as OPEC Conference President and later became OPEC Secretary-General."
  },
  {
    id: "h272", question: "The Petroleum Equalisation Fund (PEF) was created in Nigeria in 1975 with what primary mandate?",
    options: ["Uniform pricing of petrol across all parts of Nigeria through transport freight bridging", "Funding refinery repairs", "Subsidizing kerosene for rural households", "Drilling frontier basins"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "PEF reimbursed oil marketers for trucking petroleum products long distances, ensuring the same pump price in Maiduguri as in Lagos."
  },
  {
    id: "h273", question: "The Land Use Act of 1978 vested ownership of all land within each state in whom?",
    options: ["The State Governor in trust for the people", "The Traditional Council of Chiefs", "The Federal Minister of Works", "The Local Government Chairman"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Section 1 of the Land Use Act vests all land comprised in the territory of each state in the Governor of that state."
  },
  {
    id: "h274", question: "The Federal Capital Development Authority (FCDA) was created by Decree No. 6 of 1976 under the supervision of which minister?",
    options: ["John Jatau Kadiya", "Mobolaji Johnson", "Mamman Vatsa", "Gado Nasko"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The FCDA was established in 1976 to oversee the master-planning and infrastructural construction of the new capital city, Abuja."
  },
  {
    id: "h275", question: "The master plan for Nigeria's Federal Capital City, Abuja, was designed by which American urban planning consortium in 1979?",
    options: ["International Planning Associates (IPA)", "Skidmore, Owings & Merrill", "Bechtel Corporation", "Foster and Partners"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "IPA (a consortium comprising PRC Corporation, Wallace McHarg Roberts & Todd, and Archisystems) created the central crescent master plan for Abuja."
  },
  {
    id: "h276", question: "The opening session of the National Assembly in Abuja took place in which year?",
    options: ["1991", "1992", "1993", "1999"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "The short-lived Third Republic National Assembly convened its inaugural session in Abuja in December 1992."
  },
  {
    id: "h277", question: "The 1989 Constitution of Nigeria was designed to usher in which planned republic?",
    options: ["Second Republic", "Third Republic", "Fourth Republic", "Fifth Republic"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The 1989 Constitution was designed for the aborted Third Republic, which featured civilian governors and a national assembly under a military president."
  },
  {
    id: "h278", question: "The Option A4 open-ballot voting system, where voters queued behind the portrait of their preferred candidate, was introduced by whom?",
    options: ["Professor Eme Awa", "Professor Humphrey Nwosu", "Chief Michael Ani", "Justice Ovie-Whiskey"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "National Electoral Commission (NEC) Chairman Professor Humphrey Nwosu designed Option A4 for the 1992\u20131993 democratic primaries and elections."
  },
  {
    id: "h279", question: "The National Electoral Commission (NEC) that conducted the historic June 12, 1993 election was chaired by whom?",
    options: ["Professor Humphrey Nwosu", "Justice Ephraim Akpata", "Dr. Abel Guobadia", "Professor Attahiru Jega"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Professor Humphrey Nwosu courageously announced results from 14 states before the Babangida military government halted further releases."
  },
  {
    id: "h280", question: "The Association for Better Nigeria (ABN), which filed the midnight injunction to stop the June 12, 1993 election, was founded by whom?",
    options: ["Chief Arthur Nzeribe", "Dr. Walter Ofonagoro", "Alhaji Bashir Tofa", "Chief Tony Anenih"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Maverick politician Arthur Nzeribe led the ABN campaign advocating that General Babangida remain in military power for four more years."
  },
  {
    id: "h281", question: "Justice Bassey Ikpeme delivered which historic midnight ruling on June 11, 1993, on the petition of ABN?",
    options: ["Ordering NEC not to conduct the June 12 presidential election", "Declaring MKO Abiola ineligible", "Banning both the SDP and NRC", "Dissolving the National Assembly"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Justice Ikpeme issued the injunction at 9:30 PM on the eve of the election, but Humphrey Nwosu proceeded with voting relying on Decree 13."
  },
  {
    id: "h282", question: "Chief MKO Abiola declared himself President of Nigeria on June 11, 1994, in his famous 'Epetedo Declaration' in which area of Lagos?",
    options: ["Lagos Island (Epetedo)", "Surulere", "Ikeja", "Yaba"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Standing before a crowd in Epetedo, Lagos Island, Abiola proclaimed his presidential mandate, leading to his arrest by General Abacha's regime."
  },
  {
    id: "h283", question: "Kudirat Abiola, heroic pro-democracy activist and wife of MKO Abiola, was assassinated in Lagos on June 4 of which year?",
    options: ["1994", "1995", "1996", "1998"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "Kudirat Abiola was assassinated near 7-Up tollgate in Ikeja, Lagos, while bravely leading the campaign for her husband's release."
  },
  {
    id: "h284", question: "The National Democratic Coalition (NADECO), formed in May 1994 to fight for the restoration of June 12, was led by which elder statesman?",
    options: ["Chief Michael Adekunle Ajasin", "Chief Anthony Enahoro", "Rear Admiral Ndubuisi Kanu", "Chief Abraham Adesanya"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Former Ondo State Governor Chief Adekunle Ajasin was the pioneer leader of NADECO alongside Anthony Enahoro and Abraham Adesanya."
  },
  {
    id: "h285", question: "Chief Abraham Adesanya narrowly survived an armed assassination ambush by Abacha's strike squad in Lagos in which year?",
    options: ["1995", "1996", "1997", "1998"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Adesanya's Mercedes car was riddled with dozens of bullets in January 1997, a miraculous escape that cemented his legendary status in Afenifere."
  },
  {
    id: "h286", question: "General Shehu Musa Yar'Adua (elder brother of President Umaru Yar'Adua) died under suspicious circumstances in Abakaliki prison in which year?",
    options: ["1995", "1996", "1997", "1998"],
    answer: 2, category: "History", difficulty: "hard",
    explanation: "Major General Shehu Yar'Adua died on December 8, 1997, after being sentenced to life imprisonment in the 1995 phantom coup trial."
  },
  {
    id: "h287", question: "General Olusegun Obasanjo was arrested, tried, and imprisoned for his alleged role in a coup plot against which military ruler in 1995?",
    options: ["Ibrahim Babangida", "Sani Abacha", "Abdulsalami Abubakar", "Murtala Muhammed"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "Obasanjo was sentenced to 25 years (later commuted to 15) and held in Yola prison until Abacha's death in June 1998."
  },
  {
    id: "h288", question: "Chief Beko Ransome-Kuti, brother of Fela Kuti, was a fearless leader of which medical and civil society organization?",
    options: ["Campaign for Democracy (CD) and NMA", "Civil Liberties Organisation", "Constitutional Rights Project", "Amnesty Nigeria"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Dr. Beko Ransome-Kuti led both the Nigerian Medical Association and the Campaign for Democracy, enduring multiple detentions."
  },
  {
    id: "h289", question: "Chief Gani Fawehinmi founded which weekly legal reference periodical in 1985 that transformed Nigerian legal practice?",
    options: ["Nigerian Weekly Law Reports (NWLR)", "Supreme Court Monthly", "Federal Law Chronicle", "All Nigeria Law Reports"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "The NWLR became the authoritative citation repository for lawyers and judges across Nigeria and the Commonwealth."
  },
  {
    id: "h290", question: "The Oputa Panel (Human Rights Violations Investigation Commission) appointed by President Obasanjo in 1999 was chaired by which legendary jurist?",
    options: ["Justice Chukwudifu Oputa", "Justice Kayode Eso", "Justice Mohammed Bello", "Justice Andrews Obaseki"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Supreme Court Justice Chukwudifu Oputa ('the Socrates of the Supreme Court') chaired the landmark public truth commission."
  },
  {
    id: "h291", question: "Justice Kayode Eso was famous in Nigerian jurisprudence for which landmark minority dissent in the 1979 Awolowo v. Shagari election case?",
    options: ["Insisting that two-thirds of 19 states must be 13 full states", "Declaring the military decree void", "Ordering a run-off in parliament", "Awarding costs to UPN"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Justice Eso held firmly that a state cannot be fractionalized into pieces and that 13 whole states were required to satisfy the constitution."
  },
  {
    id: "h292", question: "The 1999 Constitution of Nigeria was promulgated by which military Head of State through Decree No. 24 of May 1999?",
    options: ["General Sani Abacha", "General Abdulsalami Abubakar", "General Ibrahim Babangida", "General Muhammadu Buhari"],
    answer: 1, category: "History", difficulty: "easy",
    explanation: "General Abdulsalami Abubakar enacted the 1999 Constitution on May 5, 1999, which remains Nigeria's supreme law as amended."
  },
  {
    id: "h293", question: "Nigeria successfully negotiated the cancellation of $18 billion of its Paris Club external debt in 2005 under which Finance Minister?",
    options: ["Dr. Ngozi Okonjo-Iweala", "Kemi Adeosun", "Mansur Muhtar", "Shamsuddeen Usman"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Finance Minister Ngozi Okonjo-Iweala and President Obasanjo secured the historic $30 billion debt relief package, clearing Nigeria's Paris Club obligations."
  },
  {
    id: "h294", question: "The Excess Crude Account (ECA) was established in Nigeria in 2004 with what primary financial objective?",
    options: ["Saving government oil revenues generated above the annual benchmark crude price", "Paying fuel subsidies", "Funding external debt interest", "Stabilizing the stock market"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "The ECA was created as a fiscal buffer to protect state budgets against global oil price volatility."
  },
  {
    id: "h295", question: "The Sovereign Wealth Fund of Nigeria is officially managed by which agency established in 2011?",
    options: ["Nigeria Sovereign Investment Authority (NSIA)", "Central Bank of Nigeria", "Bank of Industry", "Ministry of Finance Incorporated (MOFI)"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "The NSIA manages the Future Generations Fund, the Nigeria Infrastructure Fund, and the Stabilization Fund."
  },
  {
    id: "h296", question: "The Pension Reform Act of 2004 established which regulatory body and introduced contributory pensions in Nigeria?",
    options: ["National Pension Commission (PenCom)", "PTAD", "Nigeria Social Insurance Trust Fund", "Federal Pension Bureau"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "PenCom reformed retirement funding, replacing the underfunded Defined Benefit Scheme with employee-employer Retirement Savings Accounts."
  },
  {
    id: "h297", question: "The Universal Basic Education (UBE) programme was formally launched in 1999 by President Obasanjo in which city?",
    options: ["Sokoto", "Ibadan", "Lagos", "Enugu"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "President Obasanjo launched the UBE scheme in Sokoto on September 30, 1999, guaranteeing nine years of free, compulsory basic education."
  },
  {
    id: "h298", question: "Which Nigerian president conceded defeat in a telephone call before the final results of the 2015 presidential election were officially announced?",
    options: ["Goodluck Ebele Jonathan", "Olusegun Obasanjo", "Shehu Shagari", "Umaru Musa Yar'Adua"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Goodluck Jonathan's gracious concession call to Muhammadu Buhari on March 31, 2015, averted nationwide post-election violence."
  },
  {
    id: "h299", question: "The Petroleum Industry Act (PIA) was signed into law after nearly two decades of legislative deadlock in which year?",
    options: ["2019", "2020", "2021", "2022"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "President Muhammadu Buhari signed the historic PIA into law in August 2021, overhauling the governance, fiscal terms, and host-community funds of Nigeria's oil sector."
  },
  {
    id: "h300", question: "The Lekki Deep Sea Port, Nigeria's deepest sea port with modern automated terminals, was commissioned in which year?",
    options: ["2021", "2022", "2023", "2024"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "President Muhammadu Buhari officially commissioned the $1.5 billion Lekki Deep Sea Port on January 23, 2023."
  },
  {
    id: "h301", question: "The Central Bank of Nigeria introduced the eNaira, Africa's first central bank digital currency (CBDC), in which year?",
    options: ["2020", "2021", "2022", "2023"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "President Buhari and CBN Governor Godwin Emefiele launched the eNaira on October 25, 2021."
  },
  {
    id: "h302", question: "Who was Nigeria's pioneer Minister of Communications and Aviation in the First Republic?",
    options: ["Chief Samuel Ladoke Akintola", "Chief Kolawole Balogun", "Chief Dennis Osadebay", "Chief Festus Okotie-Eboh"],
    answer: 1, category: "History", difficulty: "hard",
    explanation: "Chief Kola Balogun served as Federal Minister of Information and Communications in the mid-1950s."
  },
  {
    id: "h303", question: "The Federal Road Safety Corps (FRSC) was established in 1988 with which Nobel laureate serving as its pioneer Corps Marshal/Chairman?",
    options: ["Professor Wole Soyinka", "Chinua Achebe", "Buchi Emecheta", "John Pepper Clark"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Professor Wole Soyinka founded and led the FRSC in 1988, revolutionizing road safety and driver licensing in Nigeria."
  },
  {
    id: "h304", question: "The National Drug Law Enforcement Agency (NDLEA) was established by Decree No. 48 of which year?",
    options: ["1987", "1989", "1991", "1993"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "The NDLEA was established in December 1989 to tackle drug trafficking and abuse."
  },
  {
    id: "h305", question: "The Independent Corrupt Practices and Other Related Offences Commission (ICPC) was established in 2000 under which pioneer chairman?",
    options: ["Justice Mustapha Akanbi", "Mallam Nuhu Ribadu", "Justice Emmanuel Ayoola", "Mr. Ekpo Nta"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Former Court of Appeal President Justice Mustapha Akanbi served as the first Chairman of the ICPC from 2000 to 2005."
  },
  {
    id: "h306", question: "The Economic and Financial Crimes Commission (EFCC) was created in 2003 with which police officer as its pioneer Executive Chairman?",
    options: ["Nuhu Ribadu", "Farida Waziri", "Ibrahim Lamorde", "Abdulrasheed Bawa"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Mallam Nuhu Ribadu led the EFCC aggressively, recovering billions of dollars and securing high-profile convictions."
  },
  {
    id: "h307", question: "The Nigerian Communications Commission (NCC) conducted the historic GSM spectrum digital auction in which month and year?",
    options: ["January 2001", "October 2001", "March 2002", "May 2003"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "The landmark January 2001 GSM auction conducted by Dr. Ernest Ndukwe's NCC ushered in mobile telecom giants MTN and Econet Wireless (now Airtel)."
  },
  {
    id: "h308", question: "Which telecom operator rolled out the first commercial GSM mobile call in Nigeria in August 2001?",
    options: ["Econet Wireless Nigeria", "MTN Nigeria", "NITEL / M-Tel", "Glo Mobile"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Econet Wireless (now Airtel Nigeria) made the first commercial GSM call on August 5, 2001, just days ahead of MTN Nigeria."
  },
  {
    id: "h309", question: "Globacom (Glo), owned by billionaire Mike Adenuga, entered the Nigerian telecommunications market in 2003 with which revolutionary billing innovation?",
    options: ["Per-Second Billing", "Free night calls", "Data bundles", "Blackberry internet service"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Glo introduced Per-Second Billing when existing competitors claimed it was technically impossible, forcing prices down overnight."
  },
  {
    id: "h310", question: "The Bank Consolidation policy in Nigeria that required commercial banks to raise their minimum capital base to \u20a625 billion was introduced in 2004 by which CBN Governor?",
    options: ["Professor Chukwuma Soludo", "Sanusi Lamido Sanusi", "Joseph Sanusi", "Godwin Emefiele"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Professor Charles Chukwuma Soludo mandated the \u20a625 billion recapitalization on July 6, 2004, consolidating 89 banks into 25 solid banks."
  },
  {
    id: "h311", question: "Sanusi Lamido Sanusi, upon becoming CBN Governor in 2009, conducted a special audit of banks that led to the creation of which asset management corporation?",
    options: ["AMCON (Asset Management Corporation of Nigeria)", "NDIC", "NEXIM Bank", "Bank of Industry"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "AMCON was established in 2010 to absorb non-performing toxic loans and prevent the systemic collapse of the banking system."
  },
  {
    id: "h312", question: "The Treasury Single Account (TSA) policy, which centralized all federal government revenues into one CBN account, was enforced nationwide in which year?",
    options: ["2013", "2015", "2017", "2019"],
    answer: 1, category: "History", difficulty: "medium",
    explanation: "President Muhammadu Buhari ordered all ministries, departments, and agencies (MDAs) to comply with the TSA in August 2015."
  },
  {
    id: "h313", question: "Nigeria celebrated its Centenary of amalgamation (1914\u20132014) under which President in February 2014?",
    options: ["Goodluck Jonathan", "Muhammadu Buhari", "Olusegun Obasanjo", "Umaru Yar'Adua"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "President Goodluck Jonathan hosted international heads of state in Abuja to mark 100 years of modern Nigerian nationhood."
  },
  {
    id: "h314", question: "The National Conference (Confab) of 2014 was inaugurated by President Jonathan under the chairmanship of which retired Chief Justice of Nigeria?",
    options: ["Justice Idris Legbo Kutigi", "Justice Dahiru Musdapher", "Justice Aloysius Katsina-Alu", "Justice Walter Onnoghen"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Justice Idris Legbo Kutigi chaired the 492-member conference which produced over 600 consensual resolutions on restructuring Nigeria."
  },
  {
    id: "h315", question: "The second Niger Bridge linking Asaba in Delta State and Onitsha in Anambra State was officially inaugurated in which year?",
    options: ["2021", "2022", "2023", "2024"],
    answer: 2, category: "History", difficulty: "easy",
    explanation: "The 1.6-kilometer bridge and motorway were commissioned in May 2023, fulfilling a 40-year-old national infrastructure pledge."
  },
  {
    id: "h316", question: "The ancient Nok terracotta sculptures represent human figures typically characterized by which distinctive artistic feature?",
    options: ["Triangular or pierced eyes and pupils", "Square-shaped foreheads", "Gold leaf coverings", "Feathered crowns"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Nok artists uniquely sculpted pierced triangular or oval eyes, hollowed-out pupils, and intricate beaded hairstyles."
  },
  {
    id: "h317", question: "The ancient Igbo-Ukwu bronze bowl in the shape of a roped water pot was manufactured using which metallurgical casting technique?",
    options: ["Lost-wax (cire perdue) casting", "Sand casting", "Die casting", "Direct hammering"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Igbo-Ukwu bronzes of the 9th century demonstrated peerless mastery of lost-wax casting, leaded bronze alloys, and intricate micro-filigree."
  },
  {
    id: "h318", question: "The famous bronze archer and warrior figures discovered on Tada Island in the Niger River belong to which kingdom's cultural sphere?",
    options: ["Nupe / Ife classical tradition", "Kanem-Bornu", "Oyo cavalry", "Calabar cross-river"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The seated Tada bronze figure is considered one of the finest masterpieces of classical African art, closely linked to medieval Ife and Nupe."
  },
  {
    id: "h319", question: "The ancient Benin bronze casting guild, which served the Oba exclusively, was organized under which royal guild name?",
    options: ["Igun Eronmwon", "Iwebo", "Ibiwe", "Iseghe"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The Igun Eronmwon guild of brass-smiths operated along Igun Street in Benin City under the hereditary royal leadership of the Ineh n'Igun."
  },
  {
    id: "h320", question: "The ancient city-kingdom of Owo in Ondo State is famous in archaeological history for producing terracotta sculptures that bridge which two traditions?",
    options: ["Ife and Benin artistic styles", "Nok and Igbo-Ukwu", "Nupe and Oyo", "Dahomey and Efik"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Excavations at Igbo'Laja in Owo by Ekpo Eyo revealed sophisticated terracottas sharing motifs with both Ife courtly realism and Benin ceremonial art."
  },
  {
    id: "h321", question: "The Osun-Osogbo Sacred Grove was declared a UNESCO World Heritage Site in which year?",
    options: ["1999", "2003", "2005", "2008"],
    answer: 2, category: "History", difficulty: "medium",
    explanation: "UNESCO inscribed the sacred forest along the banks of the Osun River on the World Heritage List in July 2005."
  },
  {
    id: "h322", question: "The Sukur Cultural Landscape in Madagali, Adamawa State, holds what distinction in Nigerian heritage?",
    options: ["First UNESCO World Heritage Site in Nigeria (inscribed 1999)", "Oldest stone church in Africa", "Site of ancient iron mines", "Largest royal palace in West Africa"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Sukur was inscribed by UNESCO in 1999, recognizing its terraced hills, palace of the Hidi (chief), and ancient iron-smelting traditions."
  },
  {
    id: "h323", question: "The historic Kano Kurmi Market was founded in the 15th century by which famous Sarkin Kano?",
    options: ["Muhammad Rumfa", "Gijimasu", "Bagauda", "Abdullahi Burja"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Sarkin Kano Muhammad Rumfa (reigned 1463\u20131499) established the Kurmi market as a primary trans-Saharan trade hub."
  },
  {
    id: "h324", question: "Sarkin Kano Muhammad Rumfa was also famous for commissioning which renowned Muslim scholar to write a treatise on statecraft for Kano?",
    options: ["Muhammad al-Maghili", "Ibn Battuta", "Leo Africanus", "Ahmad Baba of Timbuktu"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Al-Maghili wrote 'The Obligations of Princes' (Taj al-Din) for Rumfa, which became a foundational manual of administrative governance in Hausaland."
  },
  {
    id: "h325", question: "The traditional palace of the Emir of Kano, built in the 15th century by Muhammad Rumfa, is known by what Hausa name?",
    options: ["Gidan Rumfa", "Fada Kano", "Gidan Dan Hausa", "Gidan Makama"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Gidan Rumfa has served as the royal residence of the Emirs of Kano since 1480, spanning over 33 acres within the city walls."
  },
  {
    id: "h326", question: "The Gidan Makama Museum in Kano, located opposite the Emir's palace, is notable for what architectural reason?",
    options: ["It is a preserved 15th-century traditional mud-brick aristocratic mansion", "It was built by Portuguese traders", "It is made of imported marble", "It was the first British courthouse"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Gidan Makama is an exquisite example of traditional Hausa architecture with arched mud doorways, pinnacles (Daurawa), and courtyards."
  },
  {
    id: "h327", question: "The ancient Kanta Museum in Argungu, Kebbi State, was the royal palace of which historic 16th-century warrior king?",
    options: ["Muhammadu Kanta (founder of the Kebbi Empire)", "Kanta of Zaria", "Usman dan Fodio", "Dan Marina"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "Muhammadu Kanta broke away from the Songhai Empire in 1515 and established Kebbi as a mighty independent kingdom."
  },
  {
    id: "h328", question: "The first Christian mission service in Nigeria was celebrated under an Agia tree in which historic town in 1842?",
    options: ["Badagry", "Abeokuta", "Lagos", "Calabar"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Methodist missionary Thomas Birch Freeman and CMS missionary Henry Townsend preached under the Agia tree in Badagry in September 1842."
  },
  {
    id: "h329", question: "The first multi-storey building in Nigeria, built by CMS missionaries in 1845, is preserved as a tourist landmark in which city?",
    options: ["Badagry", "Abeokuta", "Lagos", "Calabar"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "The historic 1845 primary mission house in Badagry is where Samuel Ajayi Crowther translated the English Bible into Yoruba."
  },
  {
    id: "h330", question: "The historic Slave History Museum and Point of No Return are located on which island near Badagry?",
    options: ["Gberefu Island", "Tarkwa Bay", "Snake Island", "Banana Island"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Enslaved captives were marched across Gberefu Island to the Atlantic shore, where European slave vessels awaited."
  },
  {
    id: "h331", question: "Arochukwu in Abia State was renowned throughout the Bight of Biafra for its Supreme Council of Elders called what?",
    options: ["Okpankpo", "Umunna", "Ndi Okenye", "Aladinma"],
    answer: 0, category: "History", difficulty: "hard",
    explanation: "The Okpankpo was the elite governing cabinet of Arochukwu, overseeing trade networks and enforcing decrees across eastern Nigeria."
  },
  {
    id: "h332", question: "The Ekpe (Leopard) secret society exercised supreme legislative and judicial authority among which historic group of people?",
    options: ["The Efik and Ibibio of the Cross River", "The Urhobo of the Delta", "The Yoruba of Oyo", "The Igala of the Niger"],
    answer: 0, category: "History", difficulty: "medium",
    explanation: "Ekpe (also known as Egbo) was an influential male leopard society whose sacred ideographic writing system was known as Nsibidi."
  },
  {
    id: "h333", question: "The indigenous African ideographic and hieroglyphic writing system developed in southeastern Nigeria is known as what?",
    options: ["Nsibidi", "Vai script", "Tifinagh", "Ge'ez"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "Nsibidi is a pre-colonial writing system composed of hundreds of symbols inscribed on cloth, calabashes, bronze, and skin."
  },
  {
    id: "h334", question: "The ancient city of Daura in Katsina State is venerated in Hausa oral tradition as what?",
    options: ["The mythological mother-city and birthplace of the Hausa states (Hausa Bakwai)", "The capital of the Kwararafa empire", "The first British outpost", "The origin of the Nok terracotta"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "According to the Bayajidda legend, Prince Bayajidda of Baghdad killed the sacred snake Sarki at the Kusugu well in Daura, marrying Queen Daurama."
  },
  {
    id: "h335", question: "The Kusugu Well in Daura is historically protected today as what?",
    options: ["A revered national monument where Bayajidda slew the sacred serpent", "A colonial water reservoir", "The site of Usman dan Fodio's camp", "An ancient iron-mining pit"],
    answer: 0, category: "History", difficulty: "easy",
    explanation: "The Kusugu Well and the ceremonial sword of Bayajidda are cherished cultural monuments in Daura, Katsina State."
  },
  {
    id: "p151", question: "Funke Akindele's record-breaking comedy movie 'A Tribe Called Judah' made box office history in 2023 by achieving what feat?",
    options: ["First Nollywood movie to gross \u20a61 billion in Nigerian cinemas", "First film streamed in 100 countries", "First movie shot entirely in Yoruba", "Winner of the Cannes Film Festival"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'A Tribe Called Judah' grossed over \u20a61.4 billion at the Nigerian box office, shattering all previous records."
  },
  {
    id: "p152", question: "Funke Akindele's iconic comedic character 'Jenifa' first debuted in which hit Yoruba movie in 2008?",
    options: ["Jenifa", "Omo Ghetto", "Return of Jenifa", "Taiwo Taiwo"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Jenifa' introduced the hilarious secondary-school dropout with broken English, spawning a long-running TV series."
  },
  {
    id: "p153", question: "Kunle Afolayan's 2009 supernatural mystery thriller that won Best Picture at the AMAAs was titled what?",
    options: ["The Figurine (Araromire)", "October 1", "Phone Swap", "Anikulapo"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'The Figurine' is widely celebrated for ushering in the 'New Nollywood' era of cinematic production values and theatrical releases."
  },
  {
    id: "p154", question: "Kunle Afolayan's acclaimed period crime thriller 'October 1' (2014) stars which veteran actor as Inspector Danladi Waziri?",
    options: ["Sadiq Daba", "Kanayo O. Kanayo", "Kayode Olaiya", "Bimbo Manuel"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The late veteran broadcaster and actor Sadiq Daba gave an unforgettable performance as the detective investigating serial killings on the eve of independence."
  },
  {
    id: "p155", question: "The 2022 Netflix epic fantasy film 'Anikulapo', directed by Kunle Afolayan, is centered around a traveler gifted with what mystical power?",
    options: ["Resurrecting the dead with a magical gourd (Akalamagbo)", "Turning stones into cowries", "Speaking all African tongues", "Commanding lightning"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Saro (played by Kunle Remi) gains the power to bring the dead back to life before his hubris leads to his downfall."
  },
  {
    id: "p156", question: "In the 2020 action-comedy 'Omo Ghetto: The Saga', who played the dual twin roles of Lefty and Ayomide?",
    options: ["Funke Akindele", "Eniola Badmus", "Bimbo Ademoye", "Chioma Akpotha"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Funke Akindele starred as both the ghetto gang leader Lefty and her refined adopted twin sister Ayomide."
  },
  {
    id: "p157", question: "The 2022 psychological crime thriller 'Blood Sisters', Netflix's first Nigerian original series, stars Ini Dima-Okojie and which actress as best friends on the run?",
    options: ["Nancy Isime", "Sharon Ooja", "Genoveva Umeh", "Beverly Naya"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Nancy Isime (Kemi) and Ini Dima-Okojie (Sarah) delivered gripping performances as accidental murderers pursued by a ruthless family."
  },
  {
    id: "p158", question: "Which critically acclaimed 2022 film by C.J. 'Fiery' Obasi, shot in black-and-white, premiered at the Sundance Film Festival?",
    options: ["Mami Wata", "Juju Stories", "Ojuju", "O-Town"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "'Mami Wata' won the World Cinema Dramatic Special Jury Award for Cinematography at Sundance 2023 for its striking visual style."
  },
  {
    id: "p159", question: "Jade Osiberu wrote and directed which 2022 Amazon Prime crime epic set in the underbelly of Isale Eko, Lagos?",
    options: ["Gangs of Lagos", "Brotherhood", "Sugar Rush", "Ayinla"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Gangs of Lagos' starred Tobi Bakre, Adesua Etomi, and Chike, exploring childhood friendships and street territorial wars."
  },
  {
    id: "p160", question: "Which musician and actor starred as the charismatic armed robber 'Kalashnikov' in Jade Osiberu's 2022 action thriller 'Brotherhood'?",
    options: ["Falz (Folarin Falana)", "Tobi Bakre", "Bovi", "Basketmouth"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Tobi Bakre played Akin Adetula (Kalashnikov) opposite Falz, who played his twin brother and SWAT detective officer."
  },
  {
    id: "p161", question: "Falz (Folarin Falana), son of human rights lawyer Femi Falana, graduated with a degree in what field before pursuing music?",
    options: ["Law", "Accounting", "Mass Communication", "Medicine"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Falz graduated with an honours degree in Law from the University of Reading and was called to the Nigerian Bar in 2012."
  },
  {
    id: "p162", question: "Falz won an AMVCA in 2016 for Best Supporting Actor in a Comedy for his hilarious performance as 'Sege' in which TV series?",
    options: ["Jenifa's Diary", "Tinsel", "My Flatmates", "The Johnsons"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Falz's comic alter-ego Sege, a mechanic who loved Jenifa, made him a household favorite."
  },
  {
    id: "p163", question: "The long-running family sitcom 'The Johnsons', airing on Africa Magic, starred veteran actor Chaz B as Mr. Deputy Johnson and which actress as his wife Emu?",
    options: ["Ada Ameh", "Patience Ozokwor", "Ngozi Ezeonu", "Eucharia Anunobi"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The late Ada Ameh won hearts nationwide with her lovable, comical portrayal of Emuakpor 'Emu' Johnson."
  },
  {
    id: "p164", question: "Which Nigerian comedian created the hit daily sitcom 'My Flatmates' alongside Basketmouth?",
    options: ["Kayode Peters and Basketmouth", "AY Makun", "Bovi", "Ali Baba"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Comedian Bright Okpocha (Basketmouth) and director Kayode Peters created 'My Flatmates', portraying four quirky bachelor flatmates in Lagos."
  },
  {
    id: "p165", question: "Atunyota Alleluya Akpobome is universally celebrated as the 'Father of Modern Nigerian Stand-up Comedy' under which stage name?",
    options: ["Ali Baba", "Basketmouth", "AY", "Okey Bakassi"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ali Baba pioneered professional stand-up comedy as a lucrative, respected career in Nigeria from the early 1990s."
  },
  {
    id: "p166", question: "Which comedian founded the popular annual 'AY Live' arena comedy and music concerts?",
    options: ["Ayo Makun (AY)", "Bovi Ugboma", "Seyilaw", "Akpororo"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ayo Makun built 'AY Live' into one of the largest and most commercial live entertainment franchises in Africa."
  },
  {
    id: "p167", question: "Which famous Nigerian comedian and actor is celebrated for his hilarious stand-up specials 'Man on Fire' and sitcom 'Back to School'?",
    options: ["Bovi (Abovi Ugboma)", "Julius Agwu", "I Go Dye", "Gordon"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Bovi is acclaimed for his razor-sharp observational humor, theatrical writing, and viral YouTube comedic sketches."
  },
  {
    id: "p168", question: "Which stand-up comedian was famous in the 2000s for his hit music-comedy show 'Crack Ya Ribs'?",
    options: ["Julius Agwu", "Basketmouth", "Gbenga Adeyinka", "Klint da Drunk"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Julius Agwu popularized comedy concerts across Lagos, London, and Abuja with 'Crack Ya Ribs' and 'Laff 4 Christ's Sake'."
  },
  {
    id: "p169", question: "The music video for Falz's 2018 socio-political critique 'This Is Nigeria' was an official adaptation of which American artist's viral visual?",
    options: ["Childish Gambino ('This Is America')", "Kendrick Lamar ('Humble')", "Beyonc\u00e9 ('Formation')", "J. Cole ('Middle Child')"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Falz adapted Childish Gambino's concept, using one continuous take to spotlight corruption, SARS brutality, and religious extremism in Nigeria."
  },
  {
    id: "p170", question: "Burna Boy's 2012 breakout hit that put him on the nationwide radar with an infectious reggae-dancehall groove was which song?",
    options: ["Like to Party", "Yawa Dey", "Tonight", "Run My Race"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Like to Party', produced by LeriQ from Burna's debut studio album 'L.I.F.E' (2013), introduced his fresh Afro-fusion sound."
  },
  {
    id: "p171", question: "Burna Boy's mother and business manager, who famously gave acceptance speeches on his behalf and manages his empire, is who?",
    options: ["Bose Ogulu (Mama Burna)", "Jane Ejeh", "Grace Adeleke", "Folake Balogun"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Bose Ogulu, a multilingual academic, businesswoman, and daughter of music critic Benson Idonije, manages Burna Boy's international career."
  },
  {
    id: "p172", question: "Burna Boy's maternal grandfather, Benson Idonije, holds what historic musical distinction?",
    options: ["Fela Kuti's first band manager", "Trumpeter for Louis Armstrong", "Pioneer producer at Decca Records", "Founder of the Shrine"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Benson Idonije managed Fela Ransome-Kuti's highlife-jazz outfit Koola Lobitos in the 1960s and is a legendary music broadcaster."
  },
  {
    id: "p173", question: "The New Afrika Shrine, built in honour of Fela Kuti, is located in which area of Lagos?",
    options: ["Agidingbi, Ikeja", "Yaba", "Oshodi", "Surulere"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Femi and Yeni Kuti established the New Afrika Shrine in Ikeja, Lagos, where Femi and Seun Kuti perform regular live concerts."
  },
  {
    id: "p174", question: "Which annual October music festival celebrates Fela Kuti's birthday with a week-long series of free concerts at the New Afrika Shrine?",
    options: ["Felabration", "Fela Fest", "Afrobeat Festival", "Kalakuta Week"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Felabration, founded by Fela's daughter Yeni Kuti in 1998, attracts top international and Nigerian musicians to celebrate Fela's life."
  },
  {
    id: "p175", question: "Femi Kuti plays which primary instrument alongside his energetic lead vocals with his band The Positive Force?",
    options: ["Saxophone and keyboards", "Lead guitar", "Trumpet only", "Talking drum"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Femi Kuti is a world-renowned virtuoso saxophonist who holds the record for the longest single sustained musical note using circular breathing."
  },
  {
    id: "p176", question: "Seun Kuti, youngest son of Fela, took over leadership of Fela's legendary original band at age 14. What is the band's name?",
    options: ["Egypt 80", "Africa 70", "The Koola Lobitos", "The Movement"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Seun Kuti has led Egypt 80 with thunderous live performances and Grammy-nominated recordings worldwide."
  },
  {
    id: "p177", question: "Made Kuti, son of Femi Kuti, released a joint Grammy-nominated album with his father in 2021 titled what?",
    options: ["Legacy+", "Father & Son", "Afrobeat Heritage", "Two Worlds"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "'Legacy+' was a double-album featuring Femi's 'Stop the Hate' and Made's debut project 'For(e)ward', highlighting multi-generational virtuosity."
  },
  {
    id: "p178", question: "Which Nigerian visual artist and painter created the album cover artwork for several of Fela Kuti's most iconic album covers, including 'Zombie' and 'Sorrow Tears and Blood'?",
    options: ["Lemi Ghariokwu", "Ben Enwonwu", "Bruce Onobrakpeya", "Nike Davies-Okundaye"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Illustrator Lemi Ghariokwu designed 26 album covers for Fela, creating legendary political graphics that captured the fiery Afrobeat ethos."
  },
  {
    id: "p179", question: "Chief Ben Enwonwu's celebrated 1974 masterpiece painting of a royal Ife princess, sold at auction in London for \u00a31.2 million, is known as what?",
    options: ["Tutu (The African Mona Lisa)", "The Dancer", "Agbogho Mmuo", "Negritude"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Tutu' depicts Princess Adetutu Ademiluyi and had been lost for decades before being discovered in a London flat in 2018."
  },
  {
    id: "p180", question: "Chief Nike Davies-Okundaye is internationally famous for running Nigeria's largest private art gallery, located in which part of Lagos?",
    options: ["Lekki Phase 1", "Victoria Island", "Ikoyi", "Ikeja"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The Nike Art Gallery in Lekki houses over 8,000 African contemporary paintings, sculptures, and traditional Adire indigo textiles."
  },
  {
    id: "p181", question: "Adire is a traditional indigo-dyed textile art heritage pioneered by women of which Nigerian ethnic group?",
    options: ["Yoruba (notably in Abeokuta and Osogbo)", "Hausa", "Efik", "Ijaw"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Adire (resist-dyed cloth using cassava paste or tied raffia) is a celebrated cultural treasure of Egba women in Abeokuta."
  },
  {
    id: "p182", question: "Akwete cloth is a renowned hand-woven textile tradition created by women in which town in Abia State?",
    options: ["Akwete, Ndoki", "Aba", "Ohafia", "Bende"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Akwete weaving uses a broad vertical loom to produce complex geometric patterns in silk, cotton, and metallic threads."
  },
  {
    id: "p183", question: "Aso Oke, the prestige hand-woven fabric worn at Yoruba celebrations, is traditionally woven in which three classic varieties?",
    options: ["Sanyan, Alaari, and Etu", "Ankara, Kente, and Adire", "George, Jacquard, and Damask", "Brocade, Lace, and Velvet"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Sanyan (woven from wild silk), Alaari (crimson silk), and Etu (deep indigo) are the royal triad of traditional Aso Oke."
  },
  {
    id: "p184", question: "The ceremonial bowler hat and flowing broadcloth attire worn by Niger Delta men is popularly called what?",
    options: ["South-South attire / Resource Control outfit", "Agbada", "Babanriga", "Dashiki"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The Woko shirt with gold chains and the Fedora/bowler hat was famously popularized by coastal chiefs and President Goodluck Jonathan."
  },
  {
    id: "p185", question: "The voluminous, three-piece embroidered robe worn by prestigious men in northern and western Nigeria is called what?",
    options: ["Agbada (Yoruba) / Babban Riga (Hausa)", "Jalabiya", "Kaftan only", "Isiagu"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The grand Agbada features massive pleated sleeves and intricate neck embroidery, symbolising aristocracy, wealth, and elegance."
  },
  {
    id: "p186", question: "Isiagu ('leopard's head') is a traditional pullover tunic with embroidered lion/leopard heads worn by men of which culture?",
    options: ["Igbo", "Yoruba", "Tiv", "Ibibio"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The Isiagu is worn with a red chieftaincy cap or Okpu Agu by Igbo men during traditional weddings and title-taking ceremonies."
  },
  {
    id: "p187", question: "The traditional red cap worn by titled men in Igboland is symbol of what?",
    options: ["Chieftaincy, integrity, and authority (Ozo title)", "Military bravery only", "Youth leadership", "Bereavement"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The red cap signifies initiation into the Ozo title or recognition as a traditional chief, embodying moral rectitude and eldership."
  },
  {
    id: "p188", question: "In Hausa culture, the ceremonial turbaning of an aristocrat, prince, or district head is known as what?",
    options: ["Rawani (Turbaning)", "Alhaji", "Babban Biki", "Sarauta"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The wrapping of the Rawani (turban) with royal ear extensions (Kunne Biyu) formalizes appointments in the Emir's council."
  },
  {
    id: "p189", question: "The Tiv traditional fabric characterized by distinctive black and white alternating horizontal stripes is called what?",
    options: ["A'nger (Tiv fabric)", "Aso Oke", "Akwete", "Ukara"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The A'nger cloth's black and white stripes represent the peaceful coexistence of light and darkness in Tiv cosmology."
  },
  {
    id: "p190", question: "Ukara cloth, dyed in deep indigo with secret Nsibidi symbols, is exclusively worn by members of which historic fraternity?",
    options: ["The Ekpe (Leopard) Society", "The Ogboni Society", "The Agbekoya Guild", "The Ozo Council"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Ukara is woven in Abakaliki and dyed with Nsibidi characters in Ezillo, reserved for initiated Ekpe society elders in the Cross River region."
  },
  {
    id: "p191", question: "The famous Nigerian delicacy 'Boli' (roasted plantain) is most popularly paired on the streets of Port Harcourt with what accompaniment?",
    options: ["Peppered roasted fish and spicy palm oil sauce", "Groundnuts only", "Fried eggs", "Baked beans"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Port Harcourt Boli and Fish with spicy Ugba and Utazi sauce is celebrated across Nigeria as the supreme street food combination."
  },
  {
    id: "p192", question: "The popular street snack 'Kilishi' originated in northern Nigeria and consists of what?",
    options: ["Thinly sliced dried beef crusted in kuli-kuli paste, ginger, pepper, and spices", "Deep-fried chicken skin", "Smoked catfish flakes", "Roasted goat intestines"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Kilishi is a sun-dried, spiced Nigerian beef jerky that can be preserved for months without refrigeration."
  },
  {
    id: "p193", question: "Kuli-Kuli, a crunchy northern snack made from the paste byproduct of extracting oil from which legume?",
    options: ["Groundnut (peanut)", "Soybeans", "Bambara nuts", "Cowpeas"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Kuli-kuli is made by seasoning and deep-frying peanut mash after oil extraction, often eaten with soaked garri."
  },
  {
    id: "p194", question: "The beloved fermented cassava staple food that is soaked in cold water with milk, sugar, and groundnuts is known as what?",
    options: ["Garri (Ijebu)", "Abacha", "Lafun", "Fufu"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Garri is a versatile staple across West Africa, whether eaten as a refreshing cold soak or made into hot Eba."
  },
  {
    id: "p195", question: "Abacha, often called 'African Salad', is a traditional Igbo delicacy made from dried, shredded strips of what crop?",
    options: ["Cassava", "Yam", "Cocoyam", "Plantain"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Cassava tubers are cooked, thinly sliced, soaked in water overnight, and sun-dried to create Abacha, mixed with palm oil and garden eggs."
  },
  {
    id: "p196", question: "The spicy Nigerian soup made from roasted white melon seeds, bitterleaf, and meat stock in Edo State is known as what?",
    options: ["Owo soup", "Black soup (Obe Efinrin/Omobe)", "Banga soup", "Miyan Kuka"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "Edo Black Soup is cooked with herbs like scent leaves, bitter leaf, and uziza, giving it a rich dark hue and medicinal aroma."
  },
  {
    id: "p197", question: "Miyan Kuka, a staple soup in northern Nigeria eaten with Tuwon Shinkafa, is made from powdered dried leaves of which tree?",
    options: ["Baobab tree (Kuka)", "Moringa tree", "Neem tree", "Locust bean tree"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Dried green baobab leaves are pulverized into fine powder to prepare viscous, savory Miyan Kuka."
  },
  {
    id: "p198", question: "Miyan Yakuwa, an aromatic, sour-leaf soup from northern Nigeria, is made using leaves from which plant?",
    options: ["Sorrel / Roselle (Hibiscus sabdariffa)", "Spinach", "Waterleaf", "Pumpkin leaf"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Yakuwa leaves give the soup a distinct, tangy tartness that complements rich beef or fish broth."
  },
  {
    id: "p199", question: "Tuwo Masara is a thick swallow pudding popular in northern Nigeria made from which grain flour?",
    options: ["Maize (Corn) flour", "Millet flour", "Sorghum flour", "Rice flour"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Tuwo Masara is made from ground white cornmeal, while Tuwo Shinkafa is made from soft broken rice."
  },
  {
    id: "p200", question: "Afang soup, an exquisite delicacy from Akwa Ibom and Cross River states, combines Afang (Okazi) leaves with which leafy vegetable?",
    options: ["Waterleaf", "Bitterleaf", "Spinach", "Scent leaf"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Afang soup pairs the tough, shred-cut Okazi leaves with soft waterleaf, palm oil, periwinkles, and smoked fish."
  },
  {
    id: "p201", question: "Edikang Ikong soup, the legendary royal vegetable soup of the Efik and Ibibio, features a combination of which two leaves?",
    options: ["Ugwu (fluted pumpkin) and Waterleaf", "Bitterleaf and Uziza", "Afang and Scent leaf", "Oha and Utazi"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Edikang Ikong is a nutrient-dense soup loaded with beef, stockfish, dried snails, and generous heaps of fresh ugwu and waterleaf."
  },
  {
    id: "p202", question: "Ofe Oha, a classic southeastern Nigerian soup, uses which vegetable as its natural thickener?",
    options: ["Cocoyam paste (Ede)", "Achi powder", "Ofor powder", "Ground melon seeds"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Boiled and pounded cocoyam (Ede Ofe) is stirred into boiling broth to give Ofe Oha its velvety texture."
  },
  {
    id: "p203", question: "Banga soup (Ofe Akwu), popular in the Niger Delta and southeastern Nigeria, is extracted from the fresh pericarp of what?",
    options: ["Palm nut fruits (oil palm)", "Coconut flesh", "Breadfruit pulp", "Castor oil seeds"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Fresh palm fruit is boiled and pounded in a mortar to extract the rich, aromatic oily extract cooked with banga spices and beletiete."
  },
  {
    id: "p204", question: "The local aromatic herb known as 'Efinrin' in Yoruba, 'Nchanwu' in Igbo, and 'Daidoya' in Hausa is commonly known in English as what?",
    options: ["African Blue Basil / Clove Basil (Scent Leaf)", "Mint", "Parsley", "Rosemary"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Scent leaf is prized across Nigerian cuisines for pepper soups, jollof, and medicinal teas."
  },
  {
    id: "p205", question: "Locust bean condiment, which lends a deep umami seasoning to traditional soups, is called 'Iru' in Yoruba and what in Hausa?",
    options: ["Dawadawa", "Ogiri", "Okpei", "Kanwa"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Fermented Parkia biglobosa seeds are called Iru by the Yoruba and Dawadawa across northern Nigeria and West Africa."
  },
  {
    id: "p206", question: "In southeastern Nigeria, the fermented castor oil seed or egusi paste paste seasoning is known by what name?",
    options: ["Ogiri", "Dawadawa", "Iru", "Aidan"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Ogiri has a pungent aroma that deepens the savory authenticity of native soups like Ofe Onugbu and Ofe Oha."
  },
  {
    id: "p207", question: "The spicy beverage 'Zobo', beloved across Nigeria and West Africa, is brewed from the dried calyces of which flower?",
    options: ["Hibiscus sabdariffa (Roselle)", "Chrysanthemum", "Marigold", "Sunflower"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Zobo drink is made by boiling dried roselle petals with ginger, cloves, and pineapple rind."
  },
  {
    id: "p208", question: "The creamy northern Nigerian drink 'Kunu' is traditionally made from fermented grains of which crop?",
    options: ["Millet or Sorghum (Kunu Zaki)", "Barley", "Oats", "Rye"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Kunu Zaki is a sweet, spicy fermented millet beverage flavored with sweet potato, ginger, and cloves."
  },
  {
    id: "p209", question: "The northern beverage 'Fura da Nono' is a refreshing blend of cooked millet dough balls (Fura) mashed into what dairy beverage?",
    options: ["Fermented cow's milk / yogurt (Nono)", "Condensed milk", "Coconut milk", "Soy milk"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Nono is skimmed, naturally fermented fresh cow milk prepared by nomadic Fulani women and served with peppered millet balls."
  },
  {
    id: "p210", question: "Palm wine ('Emu' in Yoruba, 'Mmanya Nkwu' in Igbo, 'Bammi' in Hausa) is tapped from the sap of which tree species?",
    options: ["Oil palm tree and Raffia palm tree", "Coconut palm only", "Date palm only", "Baobab tree"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Fresh palm wine is sweet and non-alcoholic when newly tapped in the morning, fermenting naturally within hours into a sparkling alcoholic wine."
  },
  {
    id: "p211", question: "The Ogidi-born literary giant Chinua Achebe's 1958 debut masterpiece 'Things Fall Apart' takes its title from a poem by which Irish writer?",
    options: ["W.B. Yeats ('The Second Coming')", "T.S. Eliot", "James Joyce", "Seamus Heaney"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "'Turning and turning in the widening gyre... things fall apart; the centre cannot hold' is from Yeats' 'The Second Coming'."
  },
  {
    id: "p212", question: "Which Nigerian writer won the 1991 Booker Prize for fiction with his mystical novel 'The Famished Road'?",
    options: ["Ben Okri", "Wole Soyinka", "Helon Habila", "Chigozie Obioma"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ben Okri told the spellbinding story of Azaro, an abiku (spirit child) navigating the streets of an African city on the eve of independence."
  },
  {
    id: "p213", question: "Buchi Emecheta (1944\u20132017) explored the struggles of motherhood and gender inequality in which celebrated 1979 feminist novel?",
    options: ["The Joys of Motherhood", "Second Class Citizen", "The Bride Price", "In the Ditch"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'The Joys of Motherhood' tells the tragic story of Nnu Ego in colonial Lagos, who sacrifices everything for children who abandon her in poverty."
  },
  {
    id: "p214", question: "Flora Nwapa made history in 1966 with her novel 'Efuru' by becoming what?",
    options: ["The first internationally published Black African female author in the English language", "First Nigerian woman in parliament", "First female newspaper editor", "First African poet at Oxford"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Flora Nwapa published 'Efuru' with Heinemann African Writers Series in London, breaking ground for generations of African women novelists."
  },
  {
    id: "p215", question: "Chimamanda Ngozi Adichie won the 2007 Orange Prize for Fiction for which epic historical novel set during the Nigerian Civil War?",
    options: ["Half of a Yellow Sun", "Purple Hibiscus", "Americanah", "The Thing Around Your Neck"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Half of a Yellow Sun' follows Olanna, Richard, and Ugwu through the horrors and triumphs of the Biafran struggle."
  },
  {
    id: "p216", question: "Chimamanda Ngozi Adichie's 2013 novel exploring the lives of Nigerians navigating race and identity in America and Britain was titled what?",
    options: ["Americanah", "Dear Ijeawele", "Purple Hibiscus", "Zikora"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Americanah' won the US National Book Critics Circle Award for Fiction and became an international bestseller."
  },
  {
    id: "p217", question: "The 1962 play 'The Lion and the Jewel' by Wole Soyinka depicts the comic contest between progressive teacher Lakunle and which traditional village chief?",
    options: ["Bale Baroka", "Elesin Oba", "Odafe", "Kurunmi"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Baroka, the cunning 62-year-old Bale of Ilujinle, outwits the westernized schoolteacher Lakunle to win the village belle Sidi."
  },
  {
    id: "p218", question: "Wole Soyinka's tragic drama 'Death and the King's Horseman' (1975) is based on a real event that occurred in which historic Nigerian city in 1946?",
    options: ["Oyo", "Ibadan", "Lagos", "Abeokuta"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The play dramatizes the colonial British district officer's intervention preventing Elesin Oba from performing ritual suicide after the Alaafin's death."
  },
  {
    id: "p219", question: "Cyprian Ekwensi's 1954 urban novel that captured the fast-paced, glamorous nightlife of Lagos was titled what?",
    options: ["People of the City", "Jagua Nana", "Burning Grass", "The Drummer Boy"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "'People of the City' was the first book by a Nigerian author to receive international acclaim for portraying modern urban African life."
  },
  {
    id: "p220", question: "Cyprian Ekwensi's iconic 1961 novel portraying an aging highlife courtesan in the nightclubs of Lagos was titled what?",
    options: ["Jagua Nana", "Efuru", "Madam Cash", "Lagos Girl"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Jagua Nana' painted an unforgettable portrait of Jagua, a vivacious woman driven by high fashion, street politics, and romance."
  },
  {
    id: "p221", question: "The Super Eagles qualified for their first-ever FIFA World Cup tournament in which year, held in the United States?",
    options: ["1990", "1994", "1998", "2002"],
    answer: 1, category: "Pop Culture", difficulty: "easy",
    explanation: "Nigeria made a stunning World Cup debut at USA '94, topping their group ahead of Argentina and Bulgaria and reaching the Round of 16."
  },
  {
    id: "p222", question: "In Nigeria's 1994 World Cup Round of 16 match against Italy, which Italian legend scored a heart-breaking 88th-minute equalizer and extra-time penalty?",
    options: ["Roberto Baggio", "Paolo Maldini", "Gianfranco Zola", "Franco Baresi"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Baggio broke Nigerian hearts in Foxborough after Emmanuel Amunike had given the Super Eagles a brilliant early lead."
  },
  {
    id: "p223", question: "Sunday Oliseh scored one of the greatest goals in World Cup history against which superpower in France 1998 with a 25-yard rocket strike?",
    options: ["Spain", "Bulgaria", "Paraguay", "Denmark"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Oliseh's thunderous 78th-minute strike beat goalkeeper Andoni Zubizarreta, securing a famous 3-2 victory over Spain in Nantes."
  },
  {
    id: "p224", question: "Taribo West, the fearless Super Eagles defender, was famous worldwide for which unique personal styling on the pitch?",
    options: ["Bright green braided pigtails", "A yellow headband", "Different colored boots", "Face paint stripes"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Taribo West's iconic neon-green braids became a global hallmark during his stellar career at Inter Milan and the Super Eagles."
  },
  {
    id: "p225", question: "Finidi George, the legendary Super Eagles right-winger, won the UEFA Champions League in 1995 playing for which European club?",
    options: ["AFC Ajax", "Real Betis", "Mallorca", "Ipswich Town"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Finidi George and Nwankwo Kanu won the European Cup with Louis van Gaal's legendary Ajax team, defeating AC Milan in Vienna."
  },
  {
    id: "p226", question: "John Obi Mikel won the UEFA Champions League, UEFA Europa League, and Premier League titles during an 11-year career at which club?",
    options: ["Chelsea FC", "Arsenal FC", "Manchester United", "Liverpool FC"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Mikel made 372 appearances for Chelsea, anchoring the midfield alongside Frank Lampard and winning every major club trophy."
  },
  {
    id: "p227", question: "Vincent Enyeama holds the record as one of the most capped Nigerian goalkeepers and famously played over 140 Ligue 1 matches for which French club?",
    options: ["Lille OSC", "Paris Saint-Germain", "Olympique de Marseille", "AS Monaco"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Enyeama went 1,062 consecutive minutes without conceding a goal in the 2013\u201314 Ligue 1 season for Lille, falling just shy of the all-time French record."
  },
  {
    id: "p228", question: "The Nigerian men's national basketball team is popularly nicknamed what?",
    options: ["D'Tigers", "Super Hoopers", "The Eagles", "Naija Giants"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "D'Tigers became the first African team to defeat the United States men's national basketball team in an exhibition game in 2021."
  },
  {
    id: "p229", question: "The Nigerian women's national basketball team, who won four consecutive AfroBasket titles (2017\u20132023), is known as what?",
    options: ["D'Tigress", "Queen Eagles", "Naija Stars", "The Amazons"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "D'Tigress made history at the Paris 2024 Olympics by becoming the first African basketball team (men or women) to reach the Olympic quarter-finals."
  },
  {
    id: "p230", question: "Who coached the Nigerian women's basketball team D'Tigress to their historic quarter-final run at the Paris 2024 Olympic Games?",
    options: ["Rena Wakama", "Sam Vincent", "Will Voigt", "Hughley Otis"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Rena Wakama was named Best Coach of the Women's Basketball Tournament at the Paris 2024 Olympics."
  },
  {
    id: "p231", question: "Efe Ajagba is a leading Nigerian athlete competing on the world stage in which sport?",
    options: ["Professional Heavyweight Boxing", "Track & Field", "Judo", "Wrestling"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Efe Ajagba is a hard-hitting heavyweight contender known for holding the record for the fastest victory in boxing history when his opponent walked out."
  },
  {
    id: "p232", question: "Israel Adesanya, the 'Last Stylebender', is a Nigerian-born superstar who ruled as two-time world champion in which combat organization?",
    options: ["UFC (Ultimate Fighting Championship)", "Bellator", "WWE", "ONE Championship"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Born in Lagos, Israel Adesanya became the undisputed UFC Middleweight Champion with dazzling kickboxing technique."
  },
  {
    id: "p233", question: "Kamaru Usman, the 'Nigerian Nightmare', made five successful title defences as the undisputed champion in which UFC weight class?",
    options: ["Welterweight", "Middleweight", "Lightweight", "Heavyweight"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Born in Auchi, Edo State, Kamaru Usman dominated the UFC welterweight division from 2019 to 2022."
  },
  {
    id: "p234", question: "Anthony Joshua OBE, the two-time unified world heavyweight champion, proudly traces his ancestral roots to which town in Ogun State?",
    options: ["Sagamu", "Abeokuta", "Ijebu-Ode", "Ilaro"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Anthony Joshua proudly celebrates his Nigerian roots from Sagamu, displaying a tattoo of Africa with Nigeria outlined on his shoulder."
  },
  {
    id: "p235", question: "Samuel Peter was a Nigerian professional boxer who won the WBC World Heavyweight Championship in 2008 under which nickname?",
    options: ["The Nigerian Nightmare", "The Iron Bull", "The African Giant", "Thunderstrike"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Born in Akwa Ibom, Samuel Peter earned the original moniker 'The Nigerian Nightmare' for his devastating knockout power."
  },
  {
    id: "p236", question: "The widely celebrated Argungu Fishing Festival features thousands of fishermen competing to catch what?",
    options: ["The largest freshwater Nile Perch / Catfish using only traditional hand nets", "The most electric fish", "The fastest tilapia", "A sacred river turtle"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Competitors plunge into the Matan Fada river with traditional gourds and hand nets; winning fish often weigh over 75 kilograms."
  },
  {
    id: "p237", question: "The Ojude Oba Festival in Ijebu-Ode, celebrated two days after Eid al-Adha, is famous for what extravagant display?",
    options: ["Horse-riding displays by royal age-grade families in haute-couture Aso Oke", "Boat regattas", "Wrestling tournaments", "Masquerade dances only"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The Regberegbe (age grades) and Balogun horse-riding families parade in breathtaking fashion before the Awujale of Ijebuland."
  },
  {
    id: "p238", question: "The Calabar Carnival, celebrated every December in Cross River State, was initiated in 2004 by which state governor?",
    options: ["Donald Duke", "Liyel Imoke", "Ben Ayade", "Clement Ebri"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Governor Donald Duke launched the festival to boost international tourism, turning Calabar into a premier African holiday destination."
  },
  {
    id: "p239", question: "The Carniriv festival is an annual cultural and music carnival hosted in which coastal city?",
    options: ["Port Harcourt, Rivers State", "Calabar", "Warri", "Uyo"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Carniriv celebrates the rich riverine heritage, masquerades, and music of the 23 local governments of Rivers State."
  },
  {
    id: "p240", question: "The New Yam Festival (Iwa Ji / Iri Ji) celebrated across Igboland in August and September marks what agricultural milestone?",
    options: ["The arrival of the new yam harvest and thanksgiving to the earth deity Ala", "The end of the dry season", "The planting of cassava", "The hunting season"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Yam is regarded as the king of crops; no member of the community eats the newly harvested yams until the formal Iri Ji festival ceremonies are concluded."
  },
  {
    id: "p241", question: "The Igue Festival celebrated by the Oba and people of the Benin Kingdom in December is dedicated to what?",
    options: ["Thanksgiving, spiritual renewal, and invoking blessings on the Oba and the land", "Honouring warriors fallen in war", "Harvesting palm oil", "The coronation anniversary"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Igue is an ancient spiritual festival where the Oba of Benin performs sacred rituals to bless the kingdom with peace and prosperity."
  },
  {
    id: "p242", question: "The Leboku International New Yam Festival is celebrated by which people in Cross River State?",
    options: ["Yakurr people of Ugep", "Efik people of Calabar", "Bekwarra people", "Ikom people"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "The 3-week Leboku festival in Ugep is one of the largest traditional harvest celebrations in southern Nigeria."
  },
  {
    id: "p243", question: "The Afan National Festival celebrated on New Year's Day in Kagoro, Kaduna State, is renowned for what?",
    options: ["Traditional dancing and hill-climbing on the dramatic Kagoro Hills", "Camel racing", "River regatta", "Horse jumping"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "The Oegworok people of Kagoro gather beneath the rocky escarpment in colorful regalia to celebrate culture and unity."
  },
  {
    id: "p244", question: "The Sharo (or Shadi) cultural festival practiced by young nomadic Fulani men is a traditional test of what?",
    options: ["Endurance, bravery, and self-control while being publicly flogged with canes", "Wrestling horses", "Archery accuracy", "Surviving in the forest"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Young men display composure without flinching while receiving lashes to prove their manhood and readiness for marriage."
  },
  {
    id: "p245", question: "The Mmanwu Festival in Enugu State is a spectacular grand gathering of what traditional cultural artform?",
    options: ["Masquerades from hundreds of communities", "Royal trumpeters", "Female hair-braiders", "Praise poets"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The festival showcases hundreds of masquerades ranging from towering Ijele to acrobatic and mystical spirits."
  },
  {
    id: "p246", question: "The Ijele masquerade, the largest and most magnificent masquerade in Sub-Saharan Africa, stands how tall?",
    options: ["Over 12 to 15 feet tall", "4 feet tall", "7 feet tall", "25 feet tall"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The Ijele is a colossal multi-tiered marvel of cloth, mirrors, and hundreds of carved figures representing life, requiring up to 100 men to prep and dress."
  },
  {
    id: "p247", question: "The Ekpo masquerade tradition of Akwa Ibom and Cross River states represents what spiritual concept?",
    options: ["Ancestral spirits returning to commune with the living", "Sea spirits (Mami Wata)", "Agricultural fertility gods", "War deities only"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Ekpo (meaning 'ghost' or 'ancestor') masquerades wear dark, carved wooden masks and enforce social order in communities."
  },
  {
    id: "p248", question: "The Eyo masquerades of Lagos, who carry the Opambata staff, are dressed exclusively in what attire?",
    options: ["Immaculate white flowing agbada, white brimmed hats, and veiled faces", "Multi-colored raffia", "Leopard skins", "Feathered robes"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Eyo Adamu Orisha masquerades step gracefully in white robes through the streets of Lagos Island to escort the soul of a departed monarch."
  },
  {
    id: "p249", question: "The Gelede masquerade festival of the Yoruba people, recognized by UNESCO, pays tribute to whom?",
    options: ["The spiritual and ancestral power of women ('Our Mothers')", "The god of iron Ogun", "The ocean goddess Olokun", "The founding hunters of Oyo"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Gelede masquerades wear carved headdresses depicting daily life and perform joyful dances to appease and honor maternal powers."
  },
  {
    id: "p250", question: "The famous Nigerian internet slang phrase 'No Gree For Anybody' became the viral national motto for which year?",
    options: ["2024", "2020", "2018", "2016"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'No Gree For Anybody' trended as the resilient battle cry of young Nigerians in 2024, urging people to never give up or be cheated."
  },
  {
    id: "p251", question: "The Nigerian street slang word 'Japa' means what?",
    options: ["To emigrate, run away, or escape abroad", "To celebrate a birthday", "To make huge money", "To dance hard"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Japa' (derived from Yoruba 'ja pa' meaning 'break free and run') became the ubiquitous Nigerian term for relocating abroad."
  },
  {
    id: "p252", question: "The popular Nigerian Pidgin phrase 'God when?' is used humorously on social media in what context?",
    options: ["Expressing longing or envy when seeing someone else's romance, luxury, or success", "Asking for the time of church service", "Expressing grief", "Questioning the weather"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Netizens comment 'God when?' under photos of romantic proposals, weddings, or brand-new luxury cars."
  },
  {
    id: "p253", question: "The viral phrase 'Cast and Bound' or 'Breakfast' in Nigerian relationship slang refers to what?",
    options: ["A romantic heartbreak or sudden breakup", "A lavish morning meal", "Getting engaged", "A reconciliation"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Dem serve am breakfast' became the standard humorous Nigerian metaphor for being dumped in a relationship."
  },
  {
    id: "p254", question: "What does the Nigerian slang phrase 'Carry body' or 'Collect woto woto' mean?",
    options: ["To face severe trouble, defeat, or a heavy beating", "To take a vacation", "To receive gifts", "To win a lottery"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Collect woto woto' implies receiving an overwhelming dose of trouble, beating, or unexpected defeat."
  },
  {
    id: "p255", question: "The popular social media slang 'Sorosoke' emerged during the 2020 #EndSARS protests, meaning what in Yoruba?",
    options: ["Speak up louder! / Speak with your chest!", "Run away!", "Stand firm!", "We are tired!"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Soro soke' was shouted by youth demanding that officials and celebrities speak boldly and clearly against police injustice."
  },
  {
    id: "p256", question: "The popular Nigerian comedic skit creator 'Taaooma' (Maryam Apaokagi) is famous for playing which signature comedic trope?",
    options: ["Mama Tao, who disciplines her daughter with thunderous slaps", "A bumbling security guard", "A flamboyant pastor", "A greedy landlord"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Taaooma plays multiple characters simultaneously, with Mama Tao's lightning-fast discipline slaps becoming a cultural meme."
  },
  {
    id: "p257", question: "Broda Shaggi (Samuel Animashaun Perry) created his sensational viral comedy character as a fast-talking tout in which state?",
    options: ["Lagos ('fine boy agbero')", "Ibadan", "Port Harcourt", "Benin"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Broda Shaggi won national acclaim as the street-smart 'Number 1 Fine Boy Agbero' interviewed on the streets of Lagos."
  },
  {
    id: "p258", question: "Sydney Talker (Emmanuel Ogonna Iwueke) is celebrated on social media as the 'Lord of' what comedic facial expression?",
    options: ["Laughter and funny facial contortions / 'The Towel Guy'", "Crying", "Angry shouting", "Silent pantomime"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Sydney Talker's hilarious facial expressions and dance skits helped launch many of today's top skit creators."
  },
  {
    id: "p259", question: "Which Nigerian tech content creator and gadget reviewer is widely regarded as Africa's leading tech YouTuber under the channel 'Fisayo Fosudo'?",
    options: ["Fisayo Fosudo", "Kalu Kalu", "Tobi Ayeni (MissTechy)", "Oscarmini"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Fisayo Fosudo produces world-class technology reviews and economic explainers in his signature blue backdrop aesthetic."
  },
  {
    id: "p260", question: "The hit reality television show 'Big Brother Naija' (BBNaija) is hosted by which charismatic media personality?",
    options: ["Ebuka Obi-Uchendu", "IK Osakioduwa", "Uti Nwachukwu", "Frank Edoho"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ebuka Obi-Uchendu, an alumnus of BBNaija Season 1, has hosted the mega-franchise since 2017, renowned for his jaw-dropping fashion."
  },
  {
    id: "p261", question: "Frank Edoho became a household television icon across Nigeria as the longtime host of which game show?",
    options: ["Who Wants to Be a Millionaire? (Nigeria)", "The Weakest Link", "Family Feud", "Project Fame"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Frank Edoho's suspenseful pauses and catchphrase 'Is that your final answer?' captivated millions of viewers from 2004 to 2017."
  },
  {
    id: "p262", question: "Which Nigerian female media mogul founded EbonyLife TV, EbonyLife Films, and produced blockbusters like 'The Wedding Party'?",
    options: ["Mo Abudu (Mosunmola Abudu)", "Peace Anyiam-Osigwe", "Bolanle Austen-Peters", "Biola Alabi"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Mo Abudu was dubbed 'Africa's Most Successful Woman' by Forbes for building EbonyLife Media and striking global partnerships with Netflix and Sony."
  },
  {
    id: "p263", question: "Bolanle Austen-Peters is the visionary theatre director and founder of which world-class cultural arts center in Victoria Island, Lagos?",
    options: ["Terra Kulture", "Muson Centre", "Freedom Park", "National Troupe"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Terra Kulture is Nigeria's premier cultural hub for fine art exhibitions, Nigerian literature, authentic food, and hit musical plays like 'Saro' and 'Wakaa'."
  },
  {
    id: "p264", question: "The MUSON Centre (Musical Society of Nigeria) in Onikan, Lagos, is renowned for training Nigerian talent in which musical discipline?",
    options: ["Classical orchestral and choral music", "Fuji music", "Afrobeats only", "Reggae production"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Founded in 1983 by Akintola Williams and arts patrons, MUSON trains virtuoso Nigerian violinists, pianists, opera singers, and orchestral musicians."
  },
  {
    id: "p265", question: "The Africa International Film Festival (AFRIFF), one of the largest film showcases in Africa, was founded by which filmmaker?",
    options: ["Chioma Ude", "Genevieve Nnaji", "Omotola Jalade", "Stephanie Linus"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Chioma Ude established AFRIFF in 2010 to provide training, masterclasses, and global distribution platforms for African filmmakers."
  },
  {
    id: "p266", question: "The African Movie Academy Awards (AMAA), dubbed the 'African Oscars', was founded in 2005 by which visionary filmmaker?",
    options: ["Peace Anyiam-Osigwe", "Amaka Igwe", "Zeb Ejiro", "Tade Ogidan"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Peace Anyiam-Osigwe created AMAA to celebrate cinematic excellence across Africa, hosting glamorous ceremonies in Bayelsa and Lagos."
  },
  {
    id: "p267", question: "Which Nigerian actress starred as the lead character 'Nneka' in the 2020 remake of 'Nneka The Pretty Serpent'?",
    options: ["Idia Aisien", "Bimbo Ademoye", "Erica Nlewedim", "Nengi Hampson"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Broadcast journalist Idia Aisien made her Nollywood feature debut as the vengeful water spirit Nneka."
  },
  {
    id: "p268", question: "The acclaimed 2021 period musical film 'Ayinla', directed by Tunde Kelani, tells the true life and tragic murder of which Apala legend?",
    options: ["Ayinla Omowura", "Haruna Ishola", "Ayinla Kollington", "Fatai Rolling Dollar"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Lateef Adedimeji delivered a career-defining performance as the fiery, immensely gifted Apala superstar Ayinla Omowura."
  },
  {
    id: "p269", question: "Legendary filmmaker Tunde Kelani founded which pioneering production company that produced classics like 'Saworoide' and 'Ti Oluwa Ni Ile'?",
    options: ["Mainframe Productions (Opomulero)", "Golden Effects", "Koga Studios", "Welling Cinema"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Tunde Kelani's Mainframe Productions championed indigenous Yoruba culture, folklore, and political satire for over three decades."
  },
  {
    id: "p270", question: "The 1999 political satire 'Saworoide', directed by Tunde Kelani, used which traditional instrument as a metaphor for civic accountability?",
    options: ["A brass-bell talking drum (Saworoide)", "A royal flute", "A beaded gourd", "An iron gong"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "The brass-belled drum had a mystical curse: if an illegitimate or tyrannical monarch was crowned without ritual oaths, the drum's rhythm caused agonizing headache and death."
  },
  {
    id: "p271", question: "Who composed the iconic soundtrack 'Ti Oluwa Ni Ile' for the 1993 classic movie written by Kareem Adepoju (Baba Wande)?",
    options: ["Jide Cordelia / Tunde Kelani", "King Sunny Ade", "Wasiu Ayinde", "Ebenezer Obey"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "'Ti Oluwa Ni Ile' was a landmark indigenous three-part VHS blockbuster about land grabbers cursed by forest deities."
  },
  {
    id: "p272", question: "Veteran Yoruba comic actor Babatunde Omidina was universally known across Nigeria by which stage name?",
    options: ["Baba Suwe", "Aluwe", "Papi Luwe", "Baba Sala"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Baba Suwe was the undisputed king of Yoruba home video comedy, famous for painted cheeks, eccentric mannerisms, and witty slapstick."
  },
  {
    id: "p273", question: "Moses Olaiya Adejumo was a towering pioneer of Nigerian stage comedy, travelling theatre, and film under which stage name?",
    options: ["Baba Sala", "Baba Suwe", "Jaguar", "Aro"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Baba Sala, with his oversized glasses, giant bowtie, and alarm clock, pioneered television comedy and cinema in the 1970s and 1980s."
  },
  {
    id: "p274", question: "Hubert Ogunde (1916\u20131990) is universally revered in Nigerian arts history as what?",
    options: ["The Father of Contemporary Nigerian Theatre and Cinema", "First Director of NTA", "The King of Fuji", "The Highlife Master"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Chief Hubert Ogunde founded the first professional theatre company in Nigeria in 1945, producing anti-colonial plays like 'Strike and Hunger' and later classic films like 'Aiye'."
  },
  {
    id: "p275", question: "The 1979 Yoruba folk horror cinema classic 'Aiye', starring Hubert Ogunde as Ologundudu battling terrifying witches, was directed by whom?",
    options: ["Ola Balogun", "Tunde Kelani", "Kola Ogunmola", "Duro Ladipo"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Dr. Ola Balogun directed Ogunde's celluloid masterpiece 'Aiye', which was a massive theatrical box-office phenomenon across Nigeria."
  },
  {
    id: "p276", question: "Duro Ladipo (1931\u20131978) won global acclaim at the Berlin Theatre Festival and Commonwealth Arts Festival for portraying which fiery Yoruba deity in 'Oba Koso'?",
    options: ["Sango (the God of Thunder)", "Ogun (the God of Iron)", "Esu", "Osun"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Duro Ladipo's operatic performance as King Sango, breathing smoke and fire on stage, remains one of the high points of African drama."
  },
  {
    id: "p277", question: "The pioneering filmmaker Dr. Ola Balogun directed which early landmark Nigerian movie in 1976 starring Ade Love (Adeyemi Afolayan)?",
    options: ["Ajani Ogun", "Ija Ominira", "Bisi, Daughter of the River", "Kadara"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "'Ajani Ogun' was one of Nigeria's first commercial celluloid blockbusters, proving that indigenous cinema could pack thousands into movie theatres."
  },
  {
    id: "p278", question: "The acclaimed Afrobeats artist Asake earned the nickname 'Mr. Money with the Vibe' from which 2022 debut studio album?",
    options: ["Mr. Money with the Vibe", "Work of Art", "Lungu Boy", "Ololade Asake"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Asake's debut album achieved the highest-charting Nigerian debut album in Billboard 200 history at the time of its release."
  },
  {
    id: "p279", question: "Which British-Nigerian visual artist and filmmaker directed the 2024 Netflix dystopian film 'The Kitchen'?",
    options: ["Daniel Kaluuya and Kibwe Tavares", "John Boyega", "Chiwetel Ejiofor", "Idris Elba"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Oscar-winner Daniel Kaluuya co-wrote and co-directed 'The Kitchen', exploring social inequality in near-future London."
  },
  {
    id: "p280", question: "Chiwetel Ejiofor, born in London to Nigerian Igbo parents, was nominated for an Academy Award for Best Actor for which 2013 film?",
    options: ["12 Years a Slave", "Dirty Pretty Things", "Doctor Strange", "Half of a Yellow Sun"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ejiofor gave a heartbreaking performance as Solomon Northup in Steve McQueen's '12 Years a Slave', which won Best Picture."
  },
  {
    id: "p281", question: "Which Nigerian actress starred as the fierce Dora Milaje leader 'Ayo' in Marvel's 'Black Panther' and 'Avengers' films?",
    options: ["Florence Kasumba", "Lupita Nyong'o", "Danai Gurira", "Sope Aluko"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Ugandan-German-Nigerian actress Florence Kasumba played the formidable warrior Ayo alongside Lupita Nyong'o."
  },
  {
    id: "p282", question: "The popular Netflix fantasy series 'The Sandman' stars which Nigerian-British actor as Death?",
    options: ["Kirby Howell-Baptiste", "Wunmi Mosaku", "Weruche Opia", "Deborah Ayorinde"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Kirby Howell-Baptiste received rave reviews for her warm, compassionate portrayal of Death in Neil Gaiman's adaptation."
  },
  {
    id: "p283", question: "Wunmi Mosaku, the Nigerian-born British actress, won a BAFTA TV Award for Best Supporting Actress for her role in which drama?",
    options: ["Damilola, Our Loved Boy", "Loki", "Lovecraft Country", "His House"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Wunmi Mosaku won the BAFTA in 2017 for playing Gloria Taylor, the grieving mother of murdered 10-year-old schoolboy Damilola Taylor."
  },
  {
    id: "p284", question: "The tragic story of Damilola Taylor, murdered in London in November 2000, deeply touched the Nigerian diaspora. How old was Damilola when he died?",
    options: ["10 years old", "7 years old", "14 years old", "16 years old"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ten-year-old Damilola had moved to London from Lagos just months before being tragically attacked in Peckham."
  },
  {
    id: "p285", question: "The Nigerian diaspora enclave in London famously nicknamed 'Little Lagos' due to its bustling Nigerian shops, churches, and food is what?",
    options: ["Peckham (Rye Lane)", "Brixton", "Camden", "Tottenham"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Peckham in South London is celebrated as the cultural and commercial epicenter of the British-Nigerian community."
  },
  {
    id: "p286", question: "In Houston, Texas, home to the largest Nigerian diaspora population in the United States, the vibrant Nigerian community has made which dish an urban favorite?",
    options: ["Jollof Rice and Suya", "Pounded yam only", "Efo Riro only", "Akara only"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Houston boasts dozens of bustling Nigerian restaurants, food trucks, and afro-grocers catering to over 150,000 Nigerian-Americans."
  },
  {
    id: "p287", question: "Which Nigerian-American novelist won the Hugo, Nebula, and World Fantasy awards for her African-based science fiction novel 'Who Fears Death'?",
    options: ["Nnedi Okorafor", "Tomi Adeyemi", "Akwaeke Emezi", "Leslye Penelope"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Dr. Nnedi Okorafor pioneered the 'Africanfuturism' literary genre, creating stories steeped in West African mythology and futuristic technology."
  },
  {
    id: "p288", question: "Tomi Adeyemi's 2018 smash debut fantasy novel, inspired by West African mythology and the Orishas, was titled what?",
    options: ["Children of Blood and Bone", "Children of Virtue and Vengeance", "The Gilded Ones", "Raybearer"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Children of Blood and Bone' debuted at No. 1 on the New York Times bestseller list and was quickly optioned for a Hollywood film franchise."
  },
  {
    id: "p289", question: "Akwaeke Emezi, the acclaimed non-binary Nigerian author, explored Igbo spiritual cosmology and the Ogbanje in which 2018 debut novel?",
    options: ["Freshwater", "The Death of Vivek Oji", "Pet", "Dear Senthuran"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "'Freshwater' received international critical acclaim for its exploration of mental health through the metaphysical lens of the Ogbanje spirit."
  },
  {
    id: "p290", question: "The Nigerian musical sensation Ayra Starr released which global smash hit in 2022 that surpassed 100 million views and topped UK Afrobeats charts?",
    options: ["Rush", "Bloody Samaritan", "Away", "Sabilenty"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Rush' ('E dey rush, e dey rush, well well') was nominated for a Grammy Award and became an inescapable viral anthem across TikTok and radio worldwide."
  },
  {
    id: "p291", question: "Which Nigerian female artist made history in 2023 when her hit single 'People' topped charts across Europe, featuring Libianca?",
    options: ["Libianca (Cameroonian-American, celebrated in Afrobeats)", "Ayra Starr", "Tems", "Simi"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Libianca's soulful Afrobeats ballad 'People' captured global audiences addressing mental health and depression."
  },
  {
    id: "p292", question: "Young Jonn, nicknamed 'The Wicked Producer', transitioned from hit record production to a chart-topping pop singer with which 2022 hit single?",
    options: ["Dada", "Xtra Cool", "Normally", "Aquafina"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Young Jonn produced classics for Olamide before bursting onto the charts as a superstar singer with 'Dada' and 'Xtra Cool'."
  },
  {
    id: "p293", question: "Which producer produced Wizkid's historic 2020 album 'Made in Lagos', including the hit single 'Essence'?",
    options: ["P2J (Richard Isong)", "Sarz", "Legendury Beatz", "Kel-P"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "London-based Nigerian producer P2J executive produced 'Made in Lagos', crafting its lush, saxophone-drenched sonic identity."
  },
  {
    id: "p294", question: "Sarz (Osabuohien Osaretin) is legendary in modern Nigerian music for producing hits for Wizkid, Niniola, and which acclaimed collaborative EP with WurlD?",
    options: ["I Love Girls with Trobul", "Trobul & Bass", "Sweet Love", "Memories"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Sarz and WurlD's 2019 EP 'I Love Girls with Trobul' was hailed as a masterpiece of alternative electronic Afrobeats."
  },
  {
    id: "p295", question: "The innovative music genre that fuses electronic dance music with Nigerian street-hop and Amapiano elements in Lagos is known as what?",
    options: ["Afro-EDM / Street Pop Fusion", "Highlife", "Afro-Jazz", "Palmwine Sound"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Nigerian producers created high-octane street soundscapes that dominate Lagos clubs and TikTok dance trends."
  },
  {
    id: "p296", question: "The Afrobeats festival 'Afro Nation', which hosts over 40,000 fans annually on the beaches of Portugal, Ghana, and Miami, was co-founded by which Nigerian promoter?",
    options: ["Adesegun Adeosun Jr. (SMade)", "Obi Asika", "Paul Okoye (Paul O)", "Cecil Hammond"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "SMade co-founded Afro Nation, turning it into the world's biggest festival dedicated strictly to Afrobeats, Amapiano, and dancehall."
  },
  {
    id: "p297", question: "Paul Okoye (Paul O / Upfront and Personal) is renowned for founding which major international African music festival series?",
    options: ["One Africa Music Fest", "Afro Nation", "Gidi Culture Fest", "Flytime Music Fest"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Paul O organized 'One Africa Music Fest' in New York's Barclays Center, London's Wembley Arena, and Dubai, taking African artists to world arenas."
  },
  {
    id: "p298", question: "The Gidi Culture Festival, founded in 2014 by Chinedu Okeke and Chin Okeke, was an annual beach festival hosted in which city?",
    options: ["Lagos", "Abuja", "Port Harcourt", "Calabar"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Gidi Fest celebrated live music, urban youth culture, and visual art on the sands of Victoria Island and Landmark Beach."
  },
  {
    id: "p299", question: "The classic Nollywood horror-comedy 'Madam Dearest' (2005) was written, directed, and produced by which veteran filmmaker?",
    options: ["Tade Ogidan", "Tunde Kelani", "Fred Amata", "Lancelot Imasuen"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Tade Ogidan's OGD Pictures created 'Madam Dearest', renowned for its emotional soundtrack and dramatic courtroom twists."
  },
  {
    id: "p300", question: "Veteran actress Sola Sobowale delivered an award-winning performance as the ruthless underworld monarch in which 2018 blockbuster?",
    options: ["King of Boys (Eniola Salami)", "Lionheart", "Chief Daddy", "The Wedding Party"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Sola Sobowale's portrayal of the political godmother Eniola Salami ('The Laburu') earned her the AMAA Best Actress award."
  },
  {
    id: "p301", question: "The comedy film 'Osuofia in London' (2003) featured Nkem Owoh performing which hilarious comic song that went viral?",
    options: ["I Go Chop Your Dollar", "Know Me Well", "Bottom Belle", "Kiss Me Quick"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Nkem Owoh's satirical track 'I Go Chop Your Dollar' mocked internet advance-fee fraud, becoming an international pop curiosity."
  },
  {
    id: "p302", question: "Patience Ozokwor is universally recognized by Nollywood fans under which affectionate honorary title?",
    options: ["Mama G", "Mama Africa", "Queen Mother", "Lady of the Screen"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Patience Ozokwor earned the moniker 'Mama G' (General) for her unforgettable, legendary roles as the wicked stepmother or mother-in-law."
  },
  {
    id: "p303", question: "Which Nollywood actor and politician served as President of the Actors Guild of Nigeria (AGN) and was appointed SSA to President Jonathan?",
    options: ["Ejike Asiegbu", "Emeka Ike", "Ejezie Rollas", "Zack Orji"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Ejike Asiegbu served as President of the AGN during the golden era of video-cassette distribution."
  },
  {
    id: "p304", question: "The Nollywood movie market in Lagos where millions of VHS and VCD discs were historically sold and distributed in bulk is what?",
    options: ["Idumota Market (Lagos Island)", "Alaba International", "Balogun Market", "Computer Village"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Idumota was the commercial ground zero for Nollywood video marketers who financed early movies and handled national distribution."
  },
  {
    id: "p305", question: "The Alaba International Market in Lagos was historic in Nigerian music and movie history as what?",
    options: ["The largest electronics and media disc distribution hub in West Africa", "A traditional textile center", "A food market only", "An auto spare-parts lot"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Alaba's recording studios and marketers controlled the distribution of home video VCDs and music cassette mixtapes across the continent."
  },
  {
    id: "p306", question: "The iconic catchphrase 'Lori Iro' ('Based on lies') went viral across Nigeria in 2021 thanks to which evangelist in Lagos?",
    options: ["Evangelist Ismail Badmus", "Pastor Adeboye", "Brother Shaggi", "Daddy Freeze"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Evangelist Badmus walked the streets with a megaphone shouting 'Lori Iro' at Valentine's Day sweet-talkers, sparking songs and memes."
  },
  {
    id: "p307", question: "The viral sound 'You want to bam ba? You wanna chill with the big boys?' originated from which 2021 club anthem by Goya Menor and Nektunez?",
    options: ["Ameno Amapiano Remix", "Big Boys Anthem", "Bounce", "Club Banger"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Goya Menor's anti-cultism message over Nektunez's Amapiano remix of ERA's 'Ameno' became a worldwide TikTok sensation in December 2021."
  },
  {
    id: "p308", question: "Which Nigerian Afrobeats star performed live at the 2023 NBA All-Star Game halftime show alongside Tems and Rema in Salt Lake City?",
    options: ["Burna Boy", "Davido", "Wizkid", "Asake"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Burna Boy, Rema, and Tems delivered an electric all-Nigerian halftime performance celebrating the global rise of Afrobeats on US national television."
  },
  {
    id: "p309", question: "Davido performed his hit song 'Hayya Hayya (Better Together)' at the closing ceremony of which global tournament in 2022?",
    options: ["FIFA World Cup in Qatar", "Olympic Games in Tokyo", "UEFA Champions League Final", "AFCON in Cameroon"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Davido took center stage at the Lusail Stadium ahead of the thrilling Argentina vs. France World Cup final on December 18, 2022."
  },
  {
    id: "p310", question: "Burna Boy made history in June 2023 as the first African artist to headline a sold-out stadium in the UK at which venue?",
    options: ["London Stadium (80,000 capacity)", "Wembley Stadium", "Old Trafford", "Emirates Stadium"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Burna Boy packed London Stadium with 80,000 roaring fans, setting an unprecedented global milestone for an African solo headline concert."
  },
  {
    id: "p311", question: "Wizkid made history in June 2023 by headlining a sold-out concert at which iconic London stadium?",
    options: ["Tottenham Hotspur Stadium", "Stamford Bridge", "Anfield", "Etihad Stadium"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Wizkid became the first African artist to headline and sell out the 60,000-seat Tottenham Hotspur Stadium in London."
  },
  {
    id: "p312", question: "Which Nigerian record producer produced Burna Boy's massive 2018 breakthrough anthem 'Ye'?",
    options: ["Phantom (Benjamin Obadje)", "Kel-P", "Chopstix", "Telz"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Phantom produced the rich Fela-sampling beat for 'Ye', which became an unofficial modern Nigerian national anthem."
  },
  {
    id: "p313", question: "Burna Boy's song 'Ye' received a surprise global streaming surge in 2018 when fans searching for which American rapper's album stumbled upon it?",
    options: ["Kanye West's album 'Ye'", "Drake's 'Scorpion'", "Travis Scott's 'Astroworld'", "J. Cole's 'KOD'"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "When Kanye West released his eighth album titled 'Ye', millions of international listeners searched Spotify and found Burna Boy's masterpiece instead."
  },
  {
    id: "p314", question: "The phrase '30 Billion Gang' (30BG) originated from which boastful lyric in Davido's 2017 monster hit 'IF'?",
    options: ["'30 billion for the account o'", "'30 million cars in my garage'", "'30 houses in Atlanta'", "'30 friends on my team'"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Davido sang '30 billion for the account o, Versace 1000', sparking the '30BG' moniker for his crew, label, and fans worldwide."
  },
  {
    id: "p315", question: "Tekno Miles produced which iconic 2017 Afropop smash hit single for Davido?",
    options: ["IF", "Fall", "FIA", "Aye"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Tekno wrote and produced 'IF', which swept airwaves across Africa and won Song of the Year at the 2018 Headies."
  },
  {
    id: "p316", question: "The Headies Award (originally Hip Hop World Awards) presents winners with a distinctive gold-plated statuette designed in what form?",
    options: ["A young man with a crown on his head carrying the world", "A microphone with wings", "An eagle on a turntable", "A golden talking drum"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The iconic Headies plaque, conceived by Ayo Animashaun, represents a passionate young African striving with determination to conquer the world."
  },
  {
    id: "p317", question: "Ayo Animashaun founded which media company that launched HipTV and the Headies Awards?",
    options: ["Smooth Productions", "Silverbird Group", "Soundcity", "Channel O"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Ayo Animashaun's vision created Hip Hop World Magazine in 1995, evolving into HipTV on DStv and the prestigious Headies awards show."
  },
  {
    id: "p318", question: "The Silverbird Group, which introduced modern multi-screen cinemas and pageants in Nigeria, was founded by which media pioneer?",
    options: ["Senator Ben Murray-Bruce", "Obi Asika", "Guy Murray-Bruce", "John Momoh"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ben Murray-Bruce launched the Silverbird Galleria in Victoria Island in 2004, reviving the cinema-going culture across Nigeria."
  },
  {
    id: "p319", question: "The Most Beautiful Girl in Nigeria (MBGN) pageant was founded by Silverbird in which year?",
    options: ["1986", "1990", "1995", "1999"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Silverbird established MBGN in 1986, with Lynda Chuba-Ikpeazu winning the inaugural crown in 1987."
  },
  {
    id: "p320", question: "Agbani Darego made global history in November 2001 in Sun City, South Africa, by achieving what historic triumph?",
    options: ["First native Black African woman to be crowned Miss World", "Winner of Miss Universe", "First African on the cover of Vogue", "Olympic gold in high jump"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "18-year-old Agbani Darego from Rivers State made history as the first indigenous Black African Miss World, celebrated by the entire nation."
  },
  {
    id: "p321", question: "Oluchi Onweagba won the inaugural 'Face of Africa' continental modeling competition in which year, launching her supermodel career in New York?",
    options: ["1998", "2000", "2002", "2005"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "17-year-old Oluchi from Lagos won M-Net's Face of Africa in Victoria Falls, going on to grace runways for Victoria's Secret and Chanel."
  },
  {
    id: "p322", question: "Which Nigerian fashion designer founded the iconic label 'Deola Sagoe' and is renowned for modernizing authentic Komomi lace and Aso Oke on Paris runways?",
    options: ["Deola Sagoe", "Lisa Folawiyo", "Mai Atafo", "Duro Olowu"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Deola Sagoe is a royalty of African haute couture, celebrated for dressing global celebrities in avant-garde Aso Oke."
  },
  {
    id: "p323", question: "Lisa Folawiyo is celebrated globally for which signature innovation in African fashion?",
    options: ["Transforming traditional Ankara wax fabrics with handcrafted glass bead and sequin embroidery", "Designing leather boots", "Silk tie-dye suits", "Knitted woolen hats"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Lisa Folawiyo's Jewel by Lisa brand turned everyday Ankara prints into high-fashion luxury garments showcased at New York Fashion Week."
  },
  {
    id: "p324", question: "Mai Atafo is acclaimed across Nigeria and Africa as the leading bespoke designer for which category of attire?",
    options: ["Tailored bespoke men's suits and luxury bridal gowns (ATAFO)", "Streetwear jeans", "Traditional beads only", "Shoes and sneakers only"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "Ohimai Atafo is the master of Nigerian red-carpet tailoring, styling Nollywood royalty, musicians, and lavish celebrity weddings."
  },
  {
    id: "p325", question: "Lagos Fashion Week, which attracts international buyers and Vogue editors to Lagos every October, was founded in 2011 by whom?",
    options: ["Omoyemi Akerele", "Deola Sagoe", "Reni Folawiyo", "Nkiru Anumudu"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Omoyemi Akerele created Style House Files and Lagos Fashion Week, turning Lagos into a global fashion capital."
  },
  {
    id: "p326", question: "Reni Folawiyo founded which world-renowned luxury concept concept store in Victoria Island, Lagos, designed by architect David Adjaye?",
    options: ["Al\u00e1ra", "The Palms", "Polo Luxury", "Temple Muse"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Al\u00e1ra is celebrated internationally as an architectural and retail masterpiece showcasing African fashion, design, art, and cuisine."
  },
  {
    id: "p327", question: "The 1996 movie 'Violated', which set a new standard for Nollywood romantic dramas, was written and produced by which star?",
    options: ["Ego Boyo", "Amaka Igwe", "Genevieve Nnaji", "Joke Silva"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Nwakaego Boyo starred as Peggy alongside Richard Mofe-Damijo (Tega), directed by the late Amaka Igwe."
  },
  {
    id: "p328", question: "Joke Silva and Olu Jacobs, widely regarded as the venerable royal couple of Nigerian cinema and theatre, met in which year at the National Theatre?",
    options: ["1981", "1988", "1992", "1996"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "They met in 1981 during rehearsals for Wole Soyinka's play 'Jero's Metamorphosis', building a 40-year legacy as mentors to the film industry."
  },
  {
    id: "p329", question: "Which veteran actor and producer was famous for his terrifying performance as the underworld overlord 'Don' in early Nollywood crime thrillers?",
    options: ["Alex Usifo", "Pete Edochie", "Clem Ohameze", "Enebeli Elebuwa"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "Dr. Alex Usifo with his shaved head, thick black eyebrows, and booming voice was Nollywood's ultimate villain in 'Silent Night' and 'Scores to Settle'."
  },
  {
    id: "p330", question: "Enebeli Elebuwa was a revered Nollywood veteran actor affectionately remembered by fans for playing which popular comic character in an 80s advert?",
    options: ["Andrew (who wanted to 'check out' of Nigeria)", "Gringori", "Baba Sala", "Osuofia"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "Enebeli played 'Andrew', the frustrated citizen who wanted to check out of Nigeria before being urged to stay and salvage the country."
  },
  {
    id: "p331", question: "The famous 1980s federal public service campaign warning citizens 'Don't be like Andrew who wants to check out' was dubbed what?",
    options: ["'I'm checking out' / Salvage Nigeria", "War Against Indiscipline", "Better Life for Rural Dwellers", "MAMSER"],
    answer: 0, category: "Pop Culture", difficulty: "medium",
    explanation: "The TV commercial featured Andrew complaining about no light, no water, before being reminded: 'Nigeria is our country, we must stay and salvage it together.'"
  },
  {
    id: "p332", question: "Which veteran actor played the legendary role of 'Derico Nwamama's pursuer' and police commissioner in Eastern action movies?",
    options: ["Prince James Uche", "Saint Obi", "Sam Dede", "Ernest Asuzu"],
    answer: 1, category: "Pop Culture", difficulty: "medium",
    explanation: "The late Saint Obi (Obinna Nwafor) was Nollywood's preeminent action hero in blockbusters like 'State of Emergency' and 'Sakobi'."
  },
  {
    id: "p333", question: "The 2001 crime action thriller 'Derico' dramatized the real-life reign of terror of which notorious Onitsha armed robber?",
    options: ["Derico Nwamama", "Anini", "Oyenusi", "Mighty Joe"],
    answer: 0, category: "Pop Culture", difficulty: "easy",
    explanation: "'Derico' captured the terror of real-life robber Derico Nwamama before his capture by the Bakassi Boys in Onitsha."
  },
  {
    id: "p334", question: "Ishola Oyenusi was a notorious 1970s armed robber in Lagos who famously declared what before his public execution at Bar Beach?",
    options: ["'The pen is mightier than the sword, but I chose the gun' / 'I am innocent'", "'I will rise again'", "'Money sweet'", "'No regret'"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "'Doctor' Ishola Oyenusi smiled at the firing squad at Bar Beach, Lagos, in September 1971 before an audience of 30,000 spectators."
  },
  {
    id: "p335", question: "Lawrence Anini ('The Law'), the notorious armed robber who terrorized Benin City in 1986, had which police officer as his inside accomplice?",
    options: ["Deputy Superintendent George Iyamu", "Inspector Sunday", "Sergeant Okonkwo", "Commissioner Alabi"],
    answer: 0, category: "Pop Culture", difficulty: "hard",
    explanation: "DSP George Iyamu supplied Anini's gang with police weapons and intelligence in exchange for stolen booty before both were convicted and executed."
  },
  {
    id: "g101", question: "Which Nigerian state is officially nicknamed the 'Confluence State'?",
    options: ["Kogi State", "Benue State", "Niger State", "Kwara State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Kogi State is known as the Confluence State because the Niger and Benue rivers meet at its capital, Lokoja."
  },
  {
    id: "g102", question: "Which Nigerian state holds the official slogan 'Coal City State'?",
    options: ["Enugu State", "Ebonyi State", "Abia State", "Imo State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Enugu State is famous as the Coal City State due to the discovery of coal in 1909 and its historic mining industry."
  },
  {
    id: "g103", question: "Which Nigerian state is officially branded as the 'Treasure Base of the Nation'?",
    options: ["Rivers State", "Delta State", "Bayelsa State", "Akwa Ibom State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Rivers State is known as the Treasure Base of the Nation because of its abundant crude oil, gas, and maritime resources."
  },
  {
    id: "g104", question: "Which Nigerian state is officially known as 'The Big Heart'?",
    options: ["Delta State", "Edo State", "Ondo State", "Rivers State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Delta State's official motto is 'The Big Heart', reflecting its welcoming people and vast natural and cultural wealth."
  },
  {
    id: "g105", question: "Which Nigerian state bears the official slogan 'Heartbeat of the Nation'?",
    options: ["Edo State", "Delta State", "Kogi State", "Osun State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Edo State is branded the 'Heartbeat of the Nation' due to its central geographical position and rich historical legacy."
  },
  {
    id: "g106", question: "Which Nigerian state is officially nicknamed the 'Land of Promise'?",
    options: ["Akwa Ibom State", "Cross River State", "Bayelsa State", "Abia State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Akwa Ibom State's official slogan is 'Land of Promise'."
  },
  {
    id: "g107", question: "Which Nigerian state is officially branded as the 'Glory of All Lands'?",
    options: ["Bayelsa State", "Delta State", "Rivers State", "Imo State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Bayelsa State, created in 1996 in the core of the Niger Delta, is known as the 'Glory of All Lands'."
  },
  {
    id: "g108", question: "Which Nigerian state is officially recognized as the 'Land of Beauty'?",
    options: ["Adamawa State", "Taraba State", "Plateau State", "Bauchi State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Adamawa State is known as the 'Land of Beauty' for its undulating mountains, hills, and scenic landscapes."
  },
  {
    id: "g109", question: "Which Nigerian state bears the official slogan 'Nature's Gift to the Nation'?",
    options: ["Taraba State", "Plateau State", "Benue State", "Nasarawa State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Taraba State is called 'Nature's Gift to the Nation' because of its lush Mambilla Plateau, mineral resources, and rivers."
  },
  {
    id: "g110", question: "Which Nigerian state is officially recognized as the 'Home of Peace and Tourism'?",
    options: ["Plateau State", "Cross River State", "Kaduna State", "Bauchi State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Plateau State, with its cool temperate climate on the high Jos plateau, is branded 'Home of Peace and Tourism'."
  },
  {
    id: "g111", question: "Which Nigerian state is known as the 'Pearl of Tourism'?",
    options: ["Bauchi State", "Plateau State", "Cross River State", "Niger State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Bauchi State is called the 'Pearl of Tourism' as home to the famous Yankari Game Reserve and Wikki Warm Springs."
  },
  {
    id: "g112", question: "Which Nigerian state holds the official slogan 'The Power State'?",
    options: ["Niger State", "Kogi State", "Kwara State", "Kaduna State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Niger State is called 'The Power State' because it hosts Nigeria's major hydroelectric dams: Kainji, Jebba, and Shiroro."
  },
  {
    id: "g113", question: "Which Nigerian state is officially nicknamed the 'State of Harmony'?",
    options: ["Kwara State", "Kogi State", "Oyo State", "Osun State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Kwara State is known as the 'State of Harmony' for the peaceful coexistence of Yoruba, Nupe, Bariba, and Fulani cultures."
  },
  {
    id: "g114", question: "Which Nigerian state bears the official slogan 'Home of Solid Minerals'?",
    options: ["Nasarawa State", "Plateau State", "Zamfara State", "Kogi State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Nasarawa State is celebrated as the 'Home of Solid Minerals' due to rich deposits of tantalite, barite, columbite, and marble."
  },
  {
    id: "g115", question: "Which Nigerian state holds the official slogan 'Centre of Commerce'?",
    options: ["Kano State", "Lagos State", "Onitsha", "Kaduna State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Kano State's official slogan is 'Centre of Commerce', honoring its status as West Africa's historic trading hub."
  },
  {
    id: "g116", question: "Which Nigerian state is officially branded as the 'Centre of Learning'?",
    options: ["Kaduna State", "Oyo State", "Ekiti State", "Enugu State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Kaduna State is known as the 'Centre of Learning' because it hosts elite institutions like NDA, ABU Zaria, and NCAT."
  },
  {
    id: "g117", question: "Which Nigerian state is officially nicknamed the 'State of Hospitality'?",
    options: ["Katsina State", "Kano State", "Sokoto State", "Kebbi State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Katsina State is branded the 'Home of Hospitality'."
  },
  {
    id: "g118", question: "Which Nigerian state holds the official slogan 'Seat of the Caliphate'?",
    options: ["Sokoto State", "Kebbi State", "Zamfara State", "Kano State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Sokoto State is revered as the 'Seat of the Caliphate', home to the Sultan of Sokoto."
  },
  {
    id: "g119", question: "Which Nigerian state is officially branded as the 'Land of Equity'?",
    options: ["Kebbi State", "Sokoto State", "Jigawa State", "Zamfara State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Kebbi State's official slogan is 'Land of Equity'."
  },
  {
    id: "g120", question: "Which Nigerian state is officially known as the 'New World'?",
    options: ["Jigawa State", "Gombe State", "Yobe State", "Ebonyi State"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Jigawa State, created out of Kano in 1991, adopted the official slogan 'A New World'."
  },
  {
    id: "g121", question: "Which Nigerian state is officially nicknamed the 'Jewel in the Savannah'?",
    options: ["Gombe State", "Bauchi State", "Taraba State", "Adamawa State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Gombe State is known as the 'Jewel in the Savannah' for its central commercial position in the northeast."
  },
  {
    id: "g122", question: "Which Nigerian state holds the official slogan 'Pride of the Sahel'?",
    options: ["Yobe State", "Borno State", "Jigawa State", "Sokoto State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Yobe State, bordering the Sahara Desert, is branded the 'Pride of the Sahel'."
  },
  {
    id: "g123", question: "Which Nigerian state is officially nicknamed the 'Home of Peace'?",
    options: ["Borno State", "Plateau State", "Taraba State", "Adamawa State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Borno State's official motto is 'Home of Peace'."
  },
  {
    id: "g124", question: "Which Nigerian state is officially branded as the 'Salt of the Nation'?",
    options: ["Ebonyi State", "Abia State", "Imo State", "Enugu State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Ebonyi State is called the 'Salt of the Nation' because of the massive natural salt lakes in Okposi and Uburu."
  },
  {
    id: "g125", question: "Which Nigerian state is officially branded as 'God's Own State'?",
    options: ["Abia State", "Imo State", "Anambra State", "Enugu State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Abia State's official slogan is 'God's Own State'."
  },
  {
    id: "g126", question: "Which Nigerian state holds the official slogan 'Eastern Heartland'?",
    options: ["Imo State", "Abia State", "Anambra State", "Enugu State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Imo State is known as the 'Eastern Heartland'."
  },
  {
    id: "g127", question: "Which Nigerian state is officially nicknamed the 'Light of the Nation'?",
    options: ["Anambra State", "Enugu State", "Imo State", "Abia State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Anambra State's official slogan is 'Light of the Nation' (formerly 'Home for All')."
  },
  {
    id: "g128", question: "Which Nigerian state is officially branded as the 'Gateway State'?",
    options: ["Ogun State", "Lagos State", "Oyo State", "Osun State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Ogun State is called the 'Gateway State' because it serves as the overland gateway into Lagos and international borders."
  },
  {
    id: "g129", question: "Which Nigerian state is officially nicknamed the 'State of the Living Spring' (or 'State of Virtue')?",
    options: ["Osun State", "Ondo State", "Ekiti State", "Oyo State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Osun State is celebrated as the 'Land of Virtue' (Ipinle Omoluabi) and 'State of the Living Spring'."
  },
  {
    id: "g130", question: "Which Nigerian state is officially recognized as the 'Land of Honour and Integrity' (Fountain of Knowledge)?",
    options: ["Ekiti State", "Ondo State", "Osun State", "Oyo State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Ekiti State is famed as the 'Fountain of Knowledge' and 'Land of Honour' for producing Nigeria's highest concentration of professors."
  },
  {
    id: "g131", question: "Which Nigerian state holds the official slogan 'Farming is Our Pride'?",
    options: ["Zamfara State", "Kebbi State", "Benue State", "Niger State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Zamfara State's official slogan is 'Farming is Our Pride'."
  },
  {
    id: "g132", question: "The Federal Capital Territory (Abuja) is officially branded with which slogan?",
    options: ["Centre of Unity", "Heart of the Nation", "Federal Seat", "Capital of Peace"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Abuja (FCT) is celebrated as the 'Centre of Unity' where all Nigerians are equal stakeholders."
  },
  {
    id: "g133", question: "Which is the largest state in Nigeria by total land area?",
    options: ["Niger State (76,363 km\u00b2)", "Borno State", "Taraba State", "Kaduna State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Niger State covers over 76,000 square kilometres, making it larger than many European countries."
  },
  {
    id: "g134", question: "Which state is the smallest in land area in Nigeria?",
    options: ["Lagos State (3,577 km\u00b2)", "Anambra State", "Imo State", "Abia State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Lagos is the smallest state by geographical size, yet it has the largest economy and urban population."
  },
  {
    id: "g135", question: "Which Nigerian state shares an international land border with three different regions of Niger Republic?",
    options: ["Sokoto State", "Katsina State", "Jigawa State", "Yobe State"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Sokoto State shares extensive northwestern borders with the Republic of Niger."
  },
  {
    id: "g136", question: "Which Nigerian state borders the Republic of Benin to the west?",
    options: ["Ogun, Oyo, Kwara, Niger, and Kebbi states", "Lagos and Ondo only", "Osun and Ekiti", "Edo and Delta"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria's western international border with Benin Republic spans from Lagos, Ogun, Oyo, Kwara, Niger, to Kebbi."
  },
  {
    id: "g137", question: "Which Nigerian state borders Cameroon along the Obudu mountain range?",
    options: ["Cross River State", "Benue State", "Taraba State", "Adamawa State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Cross River State borders western Cameroon, with the Obudu plateau sharing borders with Cameroon's highlands."
  },
  {
    id: "g138", question: "Lake Chad in northeastern Nigeria is shared by Nigeria and which three other African nations?",
    options: ["Cameroon, Chad, and Niger", "Benin, Togo, and Ghana", "Sudan, Mali, and Niger", "Cameroon, Gabon, and Congo"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The shrinking Lake Chad basin is shared by Nigeria, Niger, Chad, and Cameroon under the Lake Chad Basin Commission."
  },
  {
    id: "g139", question: "The Mambilla Plateau, the highest plateau in Nigeria with an average elevation of 1,600 metres, is located in which state?",
    options: ["Taraba State", "Plateau State", "Adamawa State", "Bauchi State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The Mambilla Plateau in Sardauna LGA of Taraba State has a cool temperate climate where tea, apples, and highland cattle thrive."
  },
  {
    id: "g140", question: "Kakara Tea Estate, the largest highland tea plantation in West Africa producing Highland Tea, is situated on which plateau?",
    options: ["Mambilla Plateau (Taraba State)", "Jos Plateau", "Obudu Plateau", "Biu Plateau"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The lush tea estate on the Mambilla Plateau produces Nigeria's famous Highland Tea brand."
  },
  {
    id: "g141", question: "The Obudu Mountain Resort (formerly Obudu Cattle Ranch), featuring Africa's longest cable car system, is situated in which state?",
    options: ["Cross River State", "Akwa Ibom State", "Taraba State", "Enugu State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Obudu Ranch in Cross River State sits atop the Sankwala Mountains at over 1,500 meters altitude with stunning clouds and waterfalls."
  },
  {
    id: "g142", question: "Gurara Waterfalls, a breathtaking 30-meter-high curtain waterfall, is located in which state?",
    options: ["Niger State", "Nasarawa State", "Plateau State", "Kogi State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Gurara Falls on the Gurara River near Suleja in Niger State is one of Nigeria's most popular natural tourist getaways."
  },
  {
    id: "g143", question: "Erin-Ijesha Waterfalls (Olumirin Waterfalls), featuring seven distinct cascading tiers, is located in which state?",
    options: ["Osun State", "Ekiti State", "Ondo State", "Oyo State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Olumirin Waterfalls in Erin-Ijesha, Osun State, attracts thousands of hikers climbing its seven majestic levels."
  },
  {
    id: "g144", question: "Arinta Waterfalls, situated amidst lush rainforests, is located in which town in Ekiti State?",
    options: ["Ipole-Iloro", "Ikogosi", "Ado-Ekiti", "Efon-Alaaye"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Arinta Falls in Ipole-Iloro is situated just a short drive from the famous Ikogosi Warm Springs."
  },
  {
    id: "g145", question: "Ikogosi Warm Springs in Ekiti State is internationally famous for which unique geological phenomenon?",
    options: ["A warm spring and a cold spring flowing side-by-side and meeting at a confluence while maintaining their temperatures", "Boiling mud geysers", "Sulphur steam caves", "Underground river rapids"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Ikogosi is one of the world's rare geological wonders where warm (70\u00b0C) and cold (37\u00b0C) springs converge into one stream without mixing temperatures."
  },
  {
    id: "g146", question: "Farin Ruwa Waterfalls, one of the highest waterfalls in Africa with a total drop of over 150 metres, is situated in which state?",
    options: ["Nasarawa State", "Plateau State", "Taraba State", "Kaduna State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Farin Ruwa ('White Water') cascades from the Jos Plateau volcanic escarpment in Wamba LGA of Nasarawa State."
  },
  {
    id: "g147", question: "Awhum Waterfalls and Cave, renowned for its 30-metre-high cascade and monastery pilgrimage site, is in which state?",
    options: ["Enugu State", "Anambra State", "Imo State", "Abia State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Awhum Falls near Udi in Enugu State flows into a subterranean cave venerated by Christian pilgrims for miraculous healing."
  },
  {
    id: "g148", question: "Ngwo Pine Forest and subterranean limestone cave with a waterfall are located in which city?",
    options: ["Enugu", "Nsukka", "Awka", "Onitsha"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Ngwo's serene pine forest canopy and hidden cavern pool are premier eco-tourism landmarks on the hills of Enugu."
  },
  {
    id: "g149", question: "The ancient Ogbunike Caves, inscribed on UNESCO's tentative heritage list, are located in which local government area of Anambra State?",
    options: ["Oyi Local Government Area", "Idemili", "Onitsha North", "Aguata"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Ogbunike Caves consist of a labyrinth of tunnels, underground streams, and bat colonies where locals sought refuge during wars."
  },
  {
    id: "g150", question: "Yankari National Park in Bauchi State is renowned for which crystal-clear geothermal warm spring that maintains a constant 31.1\u00b0C temperature?",
    options: ["Wikki Warm Spring", "Mawulgo Spring", "Dimil Spring", "Gwana Spring"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Wikki Warm Spring discharges over 21,000 litres of pure, warm water every minute, providing a natural swimming paradise inside the wildlife reserve."
  },
  {
    id: "g151", question: "Cross River National Park is internationally celebrated as a critical rainforest sanctuary for which critically endangered primate?",
    options: ["Cross River Gorilla (Gorilla gorilla diehli)", "Mountain Gorilla", "Chimpanzee only", "Baboon only"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The Cross River Gorilla is the most endangered gorilla subspecies in the world, with fewer than 300 individuals surviving in Nigeria and Cameroon."
  },
  {
    id: "g152", question: "Gashaka-Gumti National Park, Nigeria's largest national park covering over 6,700 km\u00b2, spans across which two states?",
    options: ["Taraba and Adamawa states", "Bauchi and Gombe", "Plateau and Nasarawa", "Kaduna and Niger"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Gashaka-Gumti stretches from the rugged mountains of northern Taraba to the savannah valleys of southern Adamawa."
  },
  {
    id: "g153", question: "Old Oyo National Park, rich in archaeological ruins of the ancient Oyo capital (Oyo-Ile), is located across which two states?",
    options: ["Oyo and Kwara states", "Oyo and Osun", "Osun and Ondo", "Oyo and Ogun"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Old Oyo National Park preserves the ancient capital walls, Kosomonu hill, and wildlife along the Ogun River."
  },
  {
    id: "g154", question: "Kainji Lake National Park was Nigeria's first national park, established in 1979 in which two states?",
    options: ["Niger and Kwara states", "Kebbi and Sokoto", "Kwara and Kogi", "Niger and Kaduna"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Kainji Lake National Park incorporates the Borgu and Zugurma game sectors around the scenic Kainji reservoir."
  },
  {
    id: "g155", question: "Chad Basin National Park in northeastern Nigeria is known for which seasonal wetland bird sanctuary recognized by the Ramsar Convention?",
    options: ["Baturiya Wetland / Hadejia-Nguru Wetlands", "Lake Alau", "Kalgwai reserve", "Nguru dunes"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "The Hadejia-Nguru wetlands host millions of migratory waterbirds flying across the Sahara from Europe and Asia."
  },
  {
    id: "g156", question: "Okomu National Park, located in Edo State, is home to which endangered primate endemic to southwestern Nigeria?",
    options: ["White-throated Guenon (Cercopithecus erythrogaster)", "Olive Baboon", "Red Colobus", "Mandrill"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Okomu National Park preserves the last remaining lowland tropical rainforest in Edo State, harbouring forest elephants and white-throated monkeys."
  },
  {
    id: "g157", question: "Kamuku National Park, characterized by Guinea savannah vegetation and granite inselbergs, is located in which state?",
    options: ["Kaduna State (Birnin Gwari)", "Niger State", "Katsina State", "Zamfara State"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Kamuku National Park protects wildlife such as roan antelopes and baboons in the Birnin Gwari woodland ecosystem."
  },
  {
    id: "g158", question: "The Afi Mountain Wildlife Sanctuary in Cross River State is famed for protecting which rare bird species?",
    options: ["Bare-necked Rockfowl (Picathartes oreas)", "Grey Parrot", "Crowned Crane", "Ostrich"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Afi Mountain is one of the world's most vital roosting sanctuaries for the prehistoric-looking Picathartes bird and drill monkeys."
  },
  {
    id: "g159", question: "Drill Ranch in Calabar and Afi Mountain, founded by Peter Jenkins and Liza Gadsby, is dedicated to rehabilitating which endangered primate?",
    options: ["The Drill (Mandrillus leucophaeus)", "Spider Monkey", "Golden Tamarin", "Vervet Monkey"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Drill Ranch has bred and protected hundreds of drills, one of Africa's most endangered and elusive forest monkeys."
  },
  {
    id: "g160", question: "The Lekki Conservation Centre in Lagos, managed by the Nigerian Conservation Foundation (NCF), features what famous adventure attraction?",
    options: ["Africa's longest canopy walkway (401 metres)", "A zip line across the lagoon", "A dolphin lagoon", "A cable car to Eko Atlantic"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The 401-meter suspension canopy walkway rises above the mangrove swamp, offering panoramic views of coastal wildlife and flora."
  },
  {
    id: "g161", question: "Nigeria holds the largest proven natural gas reserves in Africa, ranking approximately where in the world?",
    options: ["Top 10 (approx. 9th globally with over 200 TCF)", "1st in the world", "25th in the world", "50th in the world"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria possesses over 208 trillion cubic feet (TCF) of proven natural gas, often described as a gas province with a drop of oil."
  },
  {
    id: "g162", question: "The Bonny Island Liquefied Natural Gas (NLNG) plant in Rivers State operates how many operational production trains as of 2024?",
    options: ["6 operational trains (with Train 7 under construction)", "2 trains", "4 trains", "10 trains"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "NLNG is one of the world's premier LNG exporters, supplying cleaner energy to Europe, Asia, and the Americas."
  },
  {
    id: "g163", question: "Bitumen deposits in Nigeria, considered among the largest unexploited reserves in the world, are concentrated across which belt?",
    options: ["Ondo, Ogun, Lagos, and Edo states", "Kano and Katsina", "Benue and Plateau", "Borno and Yobe"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria's bitumen belt stretches over 120 km with an estimated 42 billion barrels of reserves, suitable for asphalt road construction."
  },
  {
    id: "g164", question: "Coal in Nigeria was first commercially exploited in 1916 at which mine in Enugu?",
    options: ["Udi / Iva Valley and Onyeama mines", "Nkalagu mine", "Okaba mine", "Gombe mine"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Enugu's sub-bituminous coal supplied the Nigerian Railway Corporation and Oji River thermal power station for decades."
  },
  {
    id: "g165", question: "The Ajaokuta Steel Complex, Nigeria's largest integrated steel manufacturing plant, is located in which state?",
    options: ["Kogi State", "Kwara State", "Benue State", "Niger State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Ajaokuta Steel Company sits on the banks of the Niger River in Kogi State, built on blast-furnace technology."
  },
  {
    id: "g166", question: "Iron ore utilized by the Ajaokuta Steel Plant is mined from which mountain deposit in Kogi State?",
    options: ["Itakpe Hill", "Zuma Rock", "Kazaure Hills", "Udi Hills"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The National Iron Ore Mining Company (NIOMCO) at Itakpe produces iron ore concentrates grading over 63% iron content."
  },
  {
    id: "g167", question: "Tantalite and Columbite, critical rare-metal minerals used in modern smartphone microchips, were historically mined on which plateau?",
    options: ["Jos Plateau (Plateau State)", "Obudu Plateau", "Mambilla Plateau", "Biu Plateau"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "In the mid-20th century, Nigeria was the world's leading exporter of columbite (niobium ore) mined alongside cassiterite (tin) on the Jos Plateau."
  },
  {
    id: "g168", question: "Gold in commercial veins is actively mined in Nigeria primarily across which states?",
    options: ["Zamfara, Osun, Niger, Kebbi, and Kogi", "Lagos and Ogun", "Enugu and Anambra", "Rivers and Bayelsa"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The Nigerian gold belt stretches from the southwest (Ilesa, Osun) to northwestern states like Zamfara and Kebbi."
  },
  {
    id: "g169", question: "The Segilola Gold Project, Nigeria's first commercial large-scale industrial gold mine, is located in which state?",
    options: ["Osun State (Iperindo)", "Zamfara State", "Niger State", "Kano State"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Thor Explorations operates the Segilola open-pit gold mine in Osun State, producing over 90,000 ounces of gold annually."
  },
  {
    id: "g170", question: "Limestone, the primary raw material for cement manufacturing, is extracted in massive quarries in which historic Ogun State industrial town?",
    options: ["Ewekoro and Sagamu", "Ijebu-Ode", "Abeokuta", "Ilaro"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Ewekoro hosts Nigeria's pioneer cement plant (built in 1959 by Lafarge/WAPCO), operating on rich Ewekoro limestone formations."
  },
  {
    id: "g171", question: "Nnamdi Azikiwe International Airport serves which Nigerian city?",
    options: ["Abuja", "Enugu", "Lagos", "Port Harcourt"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Nnamdi Azikiwe International Airport (ABV) is the international gateway to the Federal Capital Territory, Abuja."
  },
  {
    id: "g172", question: "Murtala Muhammed International Airport (LOS), Nigeria's busiest international air hub, is located in which area of Lagos?",
    options: ["Ikeja", "Victoria Island", "Lekki", "Surulere"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "MMIA in Ikeja handles millions of international and domestic passengers annually."
  },
  {
    id: "g173", question: "Mallam Aminu Kano International Airport (KAN), the oldest commercial airport in Nigeria, opened in which year?",
    options: ["1936", "1948", "1960", "1972"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "First landing in 1922, Kano airport became an official Royal Air Force and civilian hub in 1936, connecting trans-Saharan and European flights."
  },
  {
    id: "g174", question: "Port Harcourt International Airport is situated at Omagwa in which state?",
    options: ["Rivers State", "Delta State", "Bayelsa State", "Abia State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Port Harcourt Airport (PHC) at Omagwa serves the oil and gas industry of the Niger Delta."
  },
  {
    id: "g175", question: "Akanu Ibiam International Airport is the primary international airport serving which southeastern city?",
    options: ["Enugu", "Owerri", "Asaba", "Calabar"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Named after the first indigenous Governor of Eastern Nigeria, Akanu Ibiam Airport serves Enugu and surrounding states."
  },
  {
    id: "g176", question: "Sam Mbakwe International Cargo Airport is located in which Imo State city?",
    options: ["Owerri", "Orlu", "Okigwe", "Umuahia"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Built largely through community and state contributions under Governor Sam Mbakwe, the airport was commissioned in 1994."
  },
  {
    id: "g177", question: "Victor Attah International Airport serves which southern capital city?",
    options: ["Uyo, Akwa Ibom State", "Calabar", "Port Harcourt", "Yenagoa"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Named after former Governor Obong Victor Attah, Uyo's airport features a world-class maintenance, repair, and overhaul (MRO) facility."
  },
  {
    id: "g178", question: "Margaret Ekpo International Airport is situated in which historic coastal city?",
    options: ["Calabar, Cross River State", "Uyo", "Port Harcourt", "Warri"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Calabar's airport honours the legendary women's rights pioneer and nationalist politician Margaret Ekpo."
  },
  {
    id: "g179", question: "Sultan Abubakar III International Airport serves which historic city?",
    options: ["Sokoto", "Kano", "Katsina", "Birnin Kebbi"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Sokoto's airport is named after Sir Abubakar III, who reigned as Sultan of Sokoto for over 50 years (1938\u20131988)."
  },
  {
    id: "g180", question: "Umaru Musa Yar'Adua International Airport serves which northern state capital?",
    options: ["Katsina", "Kaduna", "Kano", "Zaria"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Katsina Airport was upgraded and named after former Nigerian President Umaru Musa Yar'Adua."
  },
  {
    id: "g181", question: "Yakubu Gowon Airport is located in Heipang, serving which highland capital?",
    options: ["Jos, Plateau State", "Bauchi", "Makurdi", "Yola"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Jos Airport in Heipang was named in honour of former military Head of State General Yakubu Gowon."
  },
  {
    id: "g182", question: "Sir Ahmadu Bello International Airport serves which northwestern state capital?",
    options: ["Birnin Kebbi, Kebbi State", "Sokoto", "Gusau", "Dutse"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Birnin Kebbi's modern international airport is named after the Sardauna of Sokoto, Sir Ahmadu Bello."
  },
  {
    id: "g183", question: "The Third Mainland Bridge in Lagos, measuring 11.8 km, was the longest bridge in Africa until 1996 when which bridge opened in Cairo?",
    options: ["6th October Bridge", "Suez Canal Bridge", "Aswan Bridge", "Nile Bridge"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Constructed by Julius Berger and commissioned by President Babangida in 1990, the bridge connects Lagos Mainland to the Island."
  },
  {
    id: "g184", question: "The Carter Bridge, constructed in 1901 by the colonial government, was the first bridge connecting Lagos Island to which mainland district?",
    options: ["Iddo / Ebute Metta", "Surulere", "Yaba", "Apapa"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The original Carter Bridge, named after Governor Sir Gilbert Carter, was made of steel and enabled the first vehicular crossing over Lagos Lagoon."
  },
  {
    id: "g185", question: "The Eko Bridge in Lagos, constructed between 1965 and 1975, was built with financial assistance from which foreign government?",
    options: ["West Germany", "United Kingdom", "United States", "France"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Eko Bridge was financed with bilateral development loans from the West German government and built by Julius Berger."
  },
  {
    id: "g186", question: "The Lekki-Ikoyi Link Bridge, commissioned in 2013, is celebrated in Nigerian infrastructure as what?",
    options: ["Nigeria's first cable-stayed suspension bridge", "The longest wooden bridge", "A railway-only bridge", "A double-decker bridge"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The 1.35 km cable-stayed bridge with its soaring pylon is a visual symbol of modern Lagos, popular with morning runners and film shoots."
  },
  {
    id: "g187", question: "The River Niger originates from which West African mountain range?",
    options: ["Fouta Djallon highlands in Guinea", "Atlas Mountains in Morocco", "Cameroon Mountains", "Jos Plateau"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The great Niger River flows 4,180 km in a crescent through Guinea, Mali, Niger, and Nigeria into the Gulf of Guinea."
  },
  {
    id: "g188", question: "The River Benue, the major tributary of the River Niger, originates in which country?",
    options: ["Adamawa Plateau in northern Cameroon", "Central African Republic", "Chad", "Gabon"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The Benue River flows approximately 1,400 km westward from northern Cameroon into Nigeria, meeting the Niger at Lokoja."
  },
  {
    id: "g189", question: "The confluence of the River Niger and River Benue at Lokoja forms which distinct visual boundary?",
    options: ["A clear contrast between the calm green/blue waters of the Niger and the muddy brownish silt waters of the Benue", "A deep boiling whirlpool", "A freshwater waterfall", "A saltwater lagoon"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Boats at Lokoja's confluence can observe the distinct colors of both rivers running side-by-side before completely mingling."
  },
  {
    id: "g190", question: "Mount Patti, a 1,500-foot landmark hill in Lokoja, is historic because which British woman coined the name 'Nigeria' from its heights?",
    options: ["Flora Shaw (later Lady Lugard)", "Mary Slessor", "Queen Victoria", "Gertrude Bell"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Flora Shaw, colonial journalist for The Times of London, viewed the Niger from Mount Patti and coined the name 'Nigeria' in an 1897 article."
  },
  {
    id: "g191", question: "Kainji Dam, Nigeria's first major hydroelectric dam commissioned in 1968, impounds which river?",
    options: ["River Niger", "River Benue", "River Kaduna", "River Ogun"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Kainji Dam generates hydroelectric power and created Kainji Lake, one of the largest artificial reservoirs in West Africa."
  },
  {
    id: "g192", question: "Shiroro Hydroelectric Power Station, commissioned in 1990 with a capacity of 600 MW, is built on which river in Niger State?",
    options: ["Kaduna River", "Gurara River", "Niger River", "Hadejia River"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Shiroro Dam utilizes the fast-flowing waters of the Kaduna River gorge in Shiroro LGA of Niger State."
  },
  {
    id: "g193", question: "Jebba Hydroelectric Power Station, commissioned in 1985 with a capacity of 578 MW, sits downstream of which dam?",
    options: ["Kainji Dam on the River Niger", "Shiroro Dam", "Zungeru Dam", "Dadinkowa Dam"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Jebba Dam captures the outflow from Kainji Dam just 100 kilometres downstream on the Niger River."
  },
  {
    id: "g194", question: "The 700 MW Zungeru Hydroelectric Power Plant in Niger State was synchronized to the national grid in which year?",
    options: ["2023", "2019", "2015", "2011"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The $1.3 billion Zungeru dam was completed and began commercial electricity generation in 2023, boosting the national power grid."
  },
  {
    id: "g195", question: "The Dadin Kowa Multipurpose Dam is located on the Gongola River in which state?",
    options: ["Gombe State", "Bauchi State", "Yobe State", "Taraba State"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Dadin Kowa Dam provides irrigation for thousands of hectares of sugarcane and rice and generates 40 MW of hydropower."
  },
  {
    id: "g196", question: "The Tiga Dam, completed in 1974 to provide water for the Kano River Irrigation Project, impounds which river in Kano State?",
    options: ["Kano River", "Chalawa River", "Hadejia River", "Rima River"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Tiga Dam transformed agriculture in Kano, enabling year-round commercial cultivation of tomatoes, wheat, and vegetables."
  },
  {
    id: "g197", question: "The Goronyo Dam, which impounds the Rima River, is a major irrigation and water supply reservoir located in which state?",
    options: ["Sokoto State", "Kebbi State", "Zamfara State", "Katsina State"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Goronyo Dam in Sokoto State is critical for food security and rice farming along the semi-arid Rima basin."
  },
  {
    id: "g198", question: "Zuma Rock, the colossal natural monolith rising 725 metres above its surroundings, is situated in which state along the Abuja-Kaduna expressway?",
    options: ["Niger State (near Madalla/Suleja)", "FCT Abuja", "Kaduna State", "Kogi State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Zuma Rock stands proudly in Niger State just outside Abuja, famous for its natural human-face profile carved into the rock face."
  },
  {
    id: "g199", question: "Zuma Rock is prominently depicted on which Nigerian banknote?",
    options: ["100 Naira note", "50 Naira note", "200 Naira note", "500 Naira note"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The 100 Naira centenary and commemorative banknotes depict Zuma Rock on their reverse side."
  },
  {
    id: "g200", question: "Aso Rock, a 400-metre granite monolith that overlooks the Nigerian Presidential Complex, Supreme Court, and National Assembly, is in which city?",
    options: ["Abuja", "Lagos", "Kaduna", "Jos"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "'Aso Rock' has become the universal metonym for the Presidency and executive power of the Federal Republic of Nigeria."
  },
  {
    id: "g201", question: "Olumo Rock, a historic mountain fortress with sacred shrines and caves where Egba refugees took refuge in 1830, is in which city?",
    options: ["Abeokuta, Ogun State", "Ibadan", "Ijebu-Ode", "Oyo"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Olumo ('Under the rock God built') provided natural protection for the Egba people during the Yoruba 19th-century wars."
  },
  {
    id: "g202", question: "Idanre Hills (Oke Idanre), designated on UNESCO's tentative World Heritage list with 682 steps to the top, is in which state?",
    options: ["Ondo State", "Ekiti State", "Osun State", "Kogi State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Idanre Hills features ancient palaces, king's courtyards, mysterious inscriptions, and breathtaking cloud-shrouded peaks."
  },
  {
    id: "g203", question: "The Nok civilization flourished in central Nigeria during which archaeological time period?",
    options: ["c. 1500 BC to 500 AD (Iron Age)", "Stone Age (50,000 BC)", "Bronze Age (3000 BC)", "Medieval Era (1200 AD)"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Nok people were advanced iron-smelters and master sculptors of life-size terracotta heads over 2,500 years ago."
  },
  {
    id: "g204", question: "The Dufuna Canoe, discovered in Yobe State in 1987, holds what astonishing distinction in global archaeology?",
    options: ["Oldest known boat/canoe discovered in Africa (approx. 8,000 years old)", "Largest iron ship in Africa", "First Portuguese vessel", "A royal burial barge"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Radiocarbon-dated to circa 6000 BC, the 8.4-meter blackwood Dufuna canoe is the third oldest dugout canoe in the world."
  },
  {
    id: "g205", question: "The Sungbo's Eredo earthen rampart and ditch system in Ogun and Lagos states is recognized as what?",
    options: ["One of the largest pre-colonial earthen monuments in Africa (160 km perimeter)", "A stone castle", "A canal for British ships", "A modern railway bed"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Built around the 10th century in honor of the wealthy noblewoman Bilikisu Sungbo, its perimeter moats exceed the volume of the Great Pyramid."
  },
  {
    id: "g206", question: "The ancient Benin Moats and Walls (Iya n'Ubi) surrounding Benin City were celebrated by the Guinness Book of Records as what?",
    options: ["The world's largest earthworks prior to the mechanical era", "The oldest brick city", "The deepest river moat", "The highest stone wall"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The Benin moats and linear earthworks spanned over 16,000 kilometers across the forest, four times longer than the Great Wall of China."
  },
  {
    id: "g207", question: "The prestigious National Institute for Policy and Strategic Studies (NIPSS), where senior leaders train, is located in which town?",
    options: ["Kuru, Plateau State (near Jos)", "Zaria", "Abuja", "Kaduna"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Graduates of NIPSS Kuru earn the prestigious post-nominal title 'mni' (Member of the National Institute)."
  },
  {
    id: "g208", question: "The Nigerian Defence Academy (NDA), which trains commissioned officers for the Army, Navy, and Air Force, is located in which city?",
    options: ["Kaduna", "Zaria", "Jaji", "Abuja"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Established in 1964 to replace the Royal West African Frontier Force training school, NDA is Nigeria's premier military academy."
  },
  {
    id: "g209", question: "The Armed Forces Command and Staff College (AFCSC), which provides middle-level staff officer training, is situated in which town in Kaduna State?",
    options: ["Jaji", "Kachia", "Zaria", "Kafanchan"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "AFCSC Jaji trains senior majors, squadron leaders, and naval lieutenant commanders from Nigeria and allied African countries."
  },
  {
    id: "g210", question: "The National Defence College (NDC), Nigeria's apex military and strategic training institution for colonels and brigadiers, is situated in which city?",
    options: ["Abuja", "Lagos", "Kaduna", "Enugu"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Formerly National War College, NDC Abuja trains future service chiefs and federal permanent secretaries in grand strategy."
  },
  {
    id: "g211", question: "The Nigerian Law School operates its headquarters (Bwari campus) in which territory?",
    options: ["Federal Capital Territory (Abuja)", "Lagos State", "Enugu State", "Kano State"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Law graduates must complete professional bar vocational training at one of the Nigerian Law School campuses before being called to the Nigerian Bar."
  },
  {
    id: "g212", question: "The Nigerian Institute of Advanced Legal Studies (NIALS) is located within the campus of which institution?",
    options: ["University of Lagos (UNILAG)", "University of Ibadan", "ABU Zaria", "University of Abuja"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "NIALS is Nigeria's premier apex legal research center, situated on the lagoon campus of UNILAG in Akoka."
  },
  {
    id: "g213", question: "The Nigerian Institute of International Affairs (NIIA), founded in 1961 as Nigeria's foreign policy think-tank, is located on which street in Lagos?",
    options: ["Kofo Abayomi Street, Victoria Island", "Broad Street", "Marina", "Adeola Odeku"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "NIIA has hosted historic diplomatic lectures by world leaders including Nelson Mandela, Jimmy Carter, and Fidel Castro."
  },
  {
    id: "g214", question: "The National Open University of Nigeria (NOUN), Nigeria's largest university by student enrollment, has its national headquarters in which city?",
    options: ["Abuja", "Lagos", "Kaduna", "Ibadan"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "NOUN operates over 100 study centers across all 36 states, offering flexible distance learning to over 500,000 students."
  },
  {
    id: "g215", question: "Which public university in Nigeria was formerly named the University of Ife before being renamed in 1987?",
    options: ["Obafemi Awolowo University (OAU)", "University of Ibadan", "Lagos State University", "University of Benin"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "OAU in Ile-Ife was renamed in honor of Chief Obafemi Awolowo, renowned for its stunning modernist Bauhaus architecture designed by Arieh Sharon."
  },
  {
    id: "g216", question: "The University of Nigeria, Nsukka (UNN) bears which official institutional motto on its crest?",
    options: ["'To Restore the Dignity of Man'", "'Knowledge is Power'", "'In Deed and In Truth'", "'Service and Integrity'"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Conceived by Dr. Nnamdi Azikiwe, UNN was founded to break colonial elitism and restore African human dignity through education."
  },
  {
    id: "g217", question: "The University of Ibadan (UI) holds which historic institutional motto in Latin on its coat of arms?",
    options: ["'Recte Sapere Fons' (To think straight is the fountain of knowledge)", "'Lux in Tenebris'", "'Scientia Potentia Est'", "'Veritas Liberat'"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Established in 1948 as a college of the University of London, UI is Nigeria's premier first-generation university."
  },
  {
    id: "g218", question: "The famous lion depicted on the coat of arms of the University of Nigeria, Nsukka represents what symbol?",
    options: ["The Roaring Lion of Nsukka", "The Lion of Judah", "The Desert Cat", "The British Lion"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "UNN students and alumni are proudly called 'Super Lions' and 'Super Lionesses' after their iconic campus mascot."
  },
  {
    id: "g219", question: "Ahmadu Bello University (ABU) Zaria's main campus is located in which historic sector of Zaria?",
    options: ["Samaru campus", "Kongo campus", "Tudun Wada", "Sabon Gari"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "ABU operates two primary campuses: Samaru (sciences, engineering, agriculture) and Kongo (administration and law)."
  },
  {
    id: "g220", question: "The University of Lagos (UNILAG) is affectionately known by students and alumni by which moniker?",
    options: ["'The University of First Choice and the Nation's Pride'", "'Great Ife'", "'The Premier University'", "'Lion Citadel'"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "UNILAG in Akoka is famous for its vibrant campus social life, overlooking the serene waters of Lagos Lagoon."
  },
  {
    id: "g221", question: "The Central Bank of Nigeria (CBN) was established by the Central Bank of Nigeria Act of which year?",
    options: ["1958", "1960", "1963", "1972"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The CBN commenced formal banking operations on July 1, 1959, with Roy Pentelow Fenton serving as pioneer Governor."
  },
  {
    id: "g222", question: "Who was the first Nigerian citizen to serve as Governor of the Central Bank of Nigeria, appointed in 1963?",
    options: ["Alhaji Aliyu Mai-Bornu", "Dr. Clement Isong", "Mallam Adamu Ciroma", "Ola Vincent"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Aliyu Mai-Bornu was Governor from 1963 to 1967; his portrait is honored alongside Dr. Clement Isong on the 1000 Naira banknote."
  },
  {
    id: "g223", question: "Dr. Clement Nyong Isong, who was CBN Governor during the civil war (1967\u20131975), later served as civilian Governor of which state in the Second Republic?",
    options: ["Cross River State", "Rivers State", "Imo State", "Akwa Ibom State"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Dr. Clement Isong governed old Cross River State from 1979 to 1983; his face is featured on the 1000 Naira note."
  },
  {
    id: "g224", question: "The Nigerian Naira was officially introduced on January 1, 1973, replacing which former colonial currency?",
    options: ["The Nigerian Pound (at a rate of \u00a31 = \u20a62)", "The British Guinea", "The West African Shilling", "The Cowrie Shell"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The change to the decimal currency system retired the pound, introducing the Naira (equal to 100 Kobo)."
  },
  {
    id: "g225", question: "Chief Obafemi Awolowo is widely credited with coining the name of Nigeria's national currency. What word is 'Naira' derived from?",
    options: ["A contraction of 'Nigeria'", "A Yoruba word for wealth", "A Hausa word for gold", "A river name"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "As Federal Commissioner for Finance, Awolowo condensed 'Nigeria' into 'Naira' for the new currency."
  },
  {
    id: "g226", question: "Which Nigerian banknote features the portrait of Chief Obafemi Awolowo?",
    options: ["100 Naira note", "200 Naira note", "500 Naira note", "1000 Naira note"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Chief Awolowo's iconic circular spectacles and cap grace the front of the 100 Naira banknote."
  },
  {
    id: "g227", question: "Which Nigerian banknote features the portrait of Alhaji Sir Ahmadu Bello, the Sardauna of Sokoto?",
    options: ["200 Naira note", "100 Naira note", "500 Naira note", "50 Naira note"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Sir Ahmadu Bello's portrait is featured on the 200 Naira banknote alongside agricultural livestock and produce."
  },
  {
    id: "g228", question: "Which Nigerian banknote features the portrait of Dr. Nnamdi Azikiwe, Nigeria's first President?",
    options: ["500 Naira note", "200 Naira note", "1000 Naira note", "100 Naira note"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Dr. Nnamdi Azikiwe's portrait is prominently displayed on the 500 Naira banknote alongside an offshore oil rig."
  },
  {
    id: "g229", question: "The 1000 Naira banknote, introduced in October 2005, features the portraits of which two pioneer CBN Governors?",
    options: ["Alhaji Aliyu Mai-Bornu and Dr. Clement Isong", "Roy Fenton and Joseph Sanusi", "Sanusi Lamido and Charles Soludo", "Adamu Ciroma and Ola Vincent"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The highest denomination note honors the first two indigenous Central Bank Governors with the CBN headquarters building in Abuja on the back."
  },
  {
    id: "g230", question: "The 50 Naira banknote is popularly called the 'Wazobia' note because it depicts what on its face?",
    options: ["Portraits of ordinary Nigerian citizens representing the diverse cultures of the nation", "Three traditional rulers", "The three major bridges of Lagos", "Three ancient bronze masks"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The 50 Naira polymer note honors ordinary working Nigerians across farming, fishing, and cultural trades."
  },
  {
    id: "g231", question: "The 10 Naira banknote features the portrait of which legendary Nigerian nationalist and education pioneer?",
    options: ["Dr. Alvan Ikoku", "Herbert Macaulay", "Dennis Osadebay", "Professor Eyo Ita"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Dr. Alvan Ikoku, whose portrait is on the 10 Naira note, was a champion of teachers' rights and universal primary education."
  },
  {
    id: "g232", question: "The 5 Naira banknote features the portrait of which pioneer Nigerian political leader and surveyor?",
    options: ["Sir Abubakar Tafawa Balewa", "Herbert Macaulay", "Obafemi Awolowo", "Ahmadu Bello"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Sir Abubakar Tafawa Balewa, Nigeria's first Prime Minister, is honored on the 5 Naira banknote."
  },
  {
    id: "g233", question: "The 1 Naira coin (and old paper note) famously bore the portrait of which nationalist regarded as the 'Father of Nigerian Nationalism'?",
    options: ["Herbert Macaulay", "Ernest Ikoli", "Nnamdi Azikiwe", "Mbonu Ojike"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Herbert Heelas Macaulay (1864\u20131946) founded the NNDP in 1923, championing indigenous rights in colonial Lagos."
  },
  {
    id: "g234", question: "The 50 Kobo banknote, retired in the early 1990s, was green in color and featured which national emblem on its back?",
    options: ["The Palm Oil Tree and Agricultural Tillage", "A cocoa farmer", "Groundnut pyramids", "A coal train"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The 50 Kobo note celebrated Nigeria's agrarian economy with farmers tilling fertile land."
  },
  {
    id: "g235", question: "The Nigerian Stock Exchange (now Nigerian Exchange Group - NGX) was founded in which year as the Lagos Stock Exchange?",
    options: ["1960", "1965", "1977", "1985"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The Lagos Stock Exchange was incorporated on September 15, 1960, and began trading securities on June 5, 1961."
  },
  {
    id: "g236", question: "The headquarters building of the Nigerian Exchange Group (NGX) is located on which historic financial street in Lagos?",
    options: ["Custom Street, Lagos Island", "Broad Street", "Marina", "Adeola Hopewell"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Stock House on Custom Street in the heart of historic Lagos Island is the trading nerve center of Nigeria's capital market."
  },
  {
    id: "g237", question: "The Security and Exchange Commission (SEC) in Nigeria is the apex regulatory agency for which sector?",
    options: ["The Capital Market and Investments", "Commercial Banks only", "Insurance companies", "Pensions only"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "SEC regulates stock exchanges, public stock offerings, asset management companies, and corporate mergers."
  },
  {
    id: "g238", question: "The National Bureau of Statistics (NBS) in Nigeria is responsible for calculating which key economic indices?",
    options: ["Inflation Rate (CPI), Gross Domestic Product (GDP), and Unemployment", "Foreign exchange rates only", "Tax collections", "National budget expenditure only"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The NBS is the authoritative coordinator of the National Statistical System, producing monthly macroeconomic data."
  },
  {
    id: "g239", question: "Nigeria's GDP was officially rebased in April 2014, with what major outcome for the national economy?",
    options: ["Nigeria surpassed South Africa to become the largest economy in Africa with a GDP of $510 billion", "Nigeria joined the G20", "The Naira doubled in value", "Inflation dropped to zero"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Rebasing captured previously unmeasured modern sectors like telecommunications, Nollywood, and e-commerce."
  },
  {
    id: "g240", question: "The Dangote Petroleum Refinery in the Lekki Free Zone, Lagos, holds what record in global oil refining?",
    options: ["World's largest single-train crude oil refinery (650,000 barrels per day capacity)", "Oldest refinery in West Africa", "First offshore floating refinery", "A nuclear-powered facility"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Aliko Dangote's $20 billion refinery was commissioned in May 2023, engineered to turn Nigeria from a net fuel importer into an exporter."
  },
  {
    id: "g241", question: "Aliko Dangote, Africa's wealthiest individual, founded the Dangote Group which initially started out in 1977 as a small trading firm in which commodities?",
    options: ["Cement, sugar, flour, and rice", "Crude oil drilling", "Automobile assembly", "Cotton farming"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Dangote expanded from commodity trading into industrial manufacturing, dominating cement and food processing across 10 African countries."
  },
  {
    id: "g242", question: "The historic groundnut pyramids were towering mountains of bagged peanuts that famously dominated the skyline of which city in the 1950s and 60s?",
    options: ["Kano", "Kaduna", "Zaria", "Maiduguri"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Invented by merchant Alhassan Dantata, pyramids of up to 15,000 sacks of groundnuts stood as a proud symbol of northern agricultural wealth."
  },
  {
    id: "g243", question: "Alhassan Dantata (1877\u20131955), great-grandfather of Aliko Dangote, was historic in British West Africa as what?",
    options: ["The wealthiest indigenous merchant and exporter in West Africa at his death", "First indigenous bank director", "The Emir of Kano", "Founder of the railway union"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Dantata dominated the kola nut trade from Gold Coast (Ghana) and groundnut trade for the Royal Niger Company."
  },
  {
    id: "g244", question: "Cocoa was the economic pillar of the Western Region in the 1950s, generating revenues that funded which iconic architectural monument in Ibadan?",
    options: ["Cocoa House", "Liberty Stadium", "University of Ibadan", "Mapo Hall"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Cocoa House (originally Ile Awon Agbe), completed in 1965 at 26 storeys, was the first skyscraper built in West Africa."
  },
  {
    id: "g245", question: "Palm oil and palm kernel exports were the economic backbone of which region of Nigeria prior to the petroleum boom?",
    options: ["Eastern Region (and parts of the Mid-West)", "Northern Region", "Western Region", "Lagos Colony only"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Eastern Nigeria was the world's leading exporter of palm oil, pioneered by the peasant farming and palm plantations of the Niger Delta hinterland."
  },
  {
    id: "g246", question: "The Nigerian Railway Corporation (NRC) operates the historic standard gauge rail link between Lagos and Ibadan, which opened in which year?",
    options: ["2021", "2018", "2015", "2012"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The 157 km modern high-speed Lagos-Ibadan standard gauge train service, terminating at Mobolaji Johnson Station in Ebute Metta, launched in June 2021."
  },
  {
    id: "g247", question: "Mobolaji Johnson Railway Station, the grand terminal station in Ebute Metta, Lagos, was named after which historical leader?",
    options: ["Brigadier Mobolaji Johnson (first Military Governor of Lagos State)", "Sir John Macpherson", "Ernest Shonekan", "Babaginda"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Mobolaji Johnson governed Lagos from 1967 to 1975, overseeing the construction of pioneer expressways, bridges, and reclamation works."
  },
  {
    id: "g248", question: "The Abuja-Kaduna standard gauge railway line, the first operational standard gauge rail modernized in Nigeria, commenced passenger services in which year?",
    options: ["2016", "2012", "2014", "2018"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "President Muhammadu Buhari inaugurated the 187 km Abuja-Kaduna train corridor in July 2016, carrying commuters in under two hours."
  },
  {
    id: "g249", question: "The Itakpe-Ajaokuta-Warri railway line, which connects Kogi State to the Atlantic port of Warri in Delta State, opened for passenger operations after how many years of construction?",
    options: ["Over 30 years (begun in 1987, commissioned in 2020)", "5 years", "10 years", "50 years"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The 326 km central railway was finally completed and launched in September 2020 by President Buhari, linking Itakpe iron mines to Ujevwu, Warri."
  },
  {
    id: "g250", question: "The Lagos Blue Line Rail mass transit, powered by electricity, was officially launched for passenger operations in which year?",
    options: ["2023", "2020", "2021", "2024"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Governor Babajide Sanwo-Olu inaugurated commercial passenger operations on the Blue Line (Marina to Mile 2) in September 2023."
  },
  {
    id: "g251", question: "The Lagos Red Line Rail mass transit, running from Agbado to Oyingbo, was commissioned in which year?",
    options: ["2024", "2022", "2021", "2023"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "President Bola Tinubu officially launched the 37 km Red Line commuter rail corridor in February 2024."
  },
  {
    id: "g252", question: "The Bus Rapid Transit (BRT) system in Lagos, the first dedicated busway corridor in Sub-Saharan Africa, was launched in 2008 under which Governor?",
    options: ["Babatunde Raji Fashola SAN", "Bola Ahmed Tinubu", "Akinwunmi Ambode", "Lateef Jakande"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The Mile 12 to CMS BRT corridor transported over 200,000 passengers daily in dedicated road lanes, cutting commute times in half."
  },
  {
    id: "g253", question: "Which Governor of Lagos State (1979\u20131983) is revered as 'Baba Kekere' for building thousands of low-cost housing estates and primary schools?",
    options: ["Alhaji Lateef Kayode Jakande", "Mobolaji Johnson", "Gbolahan Mudasiru", "Michael Otedola"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Lateef Jakande established LASU, built the Lagos State Secretariat Alausa, and provided free universal education and low-cost estates across Lagos."
  },
  {
    id: "g254", question: "Lagos State University (LASU) was established in 1983 by which state governor?",
    options: ["Lateef Jakande", "Mobolaji Johnson", "Bola Tinubu", "Buba Marwa"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Jakande founded LASU in Ojo to expand university admissions for Lagosians, now one of Nigeria's premier top-ranking universities."
  },
  {
    id: "g255", question: "The iconic street landmark 'Tafawa Balewa Square' (TBS) in Lagos Island, site of the 1960 Independence celebrations, was formerly what colonial ground?",
    options: ["Lagos Race Course (horse racing)", "A British cricket lawn", "A naval shipyard", "An execution yard"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "TBS was originally the historic Race Course; the Union Jack was lowered and the green-white-green flag hoisted there at midnight on October 1, 1960."
  },
  {
    id: "g256", question: "The towering 25-storey Independence House in central Lagos, gifted by the British government for independence, caught fire in which year?",
    options: ["1993", "1980", "1988", "2001"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Independence House (Defence House) on Tafawa Balewa Square was ravaged by a major fire in 1993 and is currently being restored."
  },
  {
    id: "g257", question: "National Stadium, Surulere, Lagos, is affectionately celebrated as what legendary fortress of Nigerian sports history?",
    options: ["'The Sports City'", "The Colosseum", "The National Dome", "The Lagos Arena"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Surulere's Sports City hosted the 1973 All-Africa Games, the 1980 and 2000 AFCON finals, and historic boxing and athletic championships."
  },
  {
    id: "g258", question: "Teslim Balogun Stadium in Surulere, Lagos, is named in honor of which legendary Nigerian football striker who played in England for Peterborough in the 1950s?",
    options: ["Teslim 'Thunder' Balogun", "Dan Anyiam", "Peter Anieke", "Inua Lawal"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Teslim 'Thunder' Balogun was famed for his thunderous left-foot shots that folklore claimed could tear through goal nets."
  },
  {
    id: "g259", question: "The National Arts Theatre in Iganmu, Lagos, was completed under the military administration of which Head of State in 1976?",
    options: ["General Olusegun Obasanjo", "General Yakubu Gowon", "General Murtala Muhammed", "General Ibrahim Babangida"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Though initiated under Gowon, Obasanjo commissioned the grand monument ahead of the FESTAC '77 festival."
  },
  {
    id: "g260", question: "FESTAC '77 (The 2nd World Black and African Festival of Arts and Culture) brought together over how many artists and writers from 56 nations to Lagos?",
    options: ["Over 15,000 participants", "1,000 participants", "5,000 participants", "50,000 participants"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "FESTAC '77 was the largest cultural gathering of the Black world in human history, featuring Stevie Wonder, Sun Ra, Miriam Makeba, and Gilberto Gil."
  },
  {
    id: "g261", question: "Festac Town in Lagos was built as a modern residential estate to house what?",
    options: ["The 17,000 international delegates and artists attending FESTAC '77", "Colonial civil servants", "Soldiers from the civil war", "University students"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Following the festival, the federal government balloted the housing units to everyday Nigerian citizens, creating one of West Africa's largest planned suburbs."
  },
  {
    id: "g262", question: "The Lekki Free Trade Zone (LFTZ), spanning over 16,500 hectares, was established through a joint venture between Lagos State and which nation's consortium?",
    options: ["China (China-Africa Lekki Investment Ltd)", "United States", "United Kingdom", "Japan"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The zone houses multi-billion-dollar refineries, deep-sea ports, petrochemical complexes, and manufacturing parks."
  },
  {
    id: "g263", question: "Eko Atlantic City is a massive 10-square-kilometer coastal city reclamation project built on land reclaimed from which body of water?",
    options: ["The Atlantic Ocean (along Victoria Island's former Bar Beach)", "Lagos Lagoon", "Lekki Peninsula creek", "Badagry Creek"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Protected by the 8.5 km 'Great Wall of Lagos' sea revetment, Eko Atlantic stopped decades of ocean surge erosion along Ahmadu Bello Way."
  },
  {
    id: "g264", question: "Banana Island, one of Africa's most exclusive luxury residential enclaves, is an artificial island located off the foreshore of which Lagos district?",
    options: ["Ikoyi", "Victoria Island", "Lekki", "Apapa"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Shaped like a banana when viewed from the air, Banana Island is home to billionaires, corporate titans, and ambassadors."
  },
  {
    id: "g265", question: "The Nigerian Navy operates its Western Naval Command headquarters in which maritime district of Lagos?",
    options: ["Apapa", "Victoria Island", "Tin Can Island", "Badagry"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Apapa hosts the naval dockyard, major naval warships (NNS Aradu, NNS Kada), and Nigeria's busiest maritime container terminals."
  },
  {
    id: "g266", question: "Tin Can Island Port in Lagos was rapidly constructed and opened in which year to relieve catastrophic ship congestion at Apapa?",
    options: ["1977", "1970", "1983", "1990"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Built in just 15 months by Julius Berger, Tin Can Island opened in October 1977 during the post-oil boom import explosion."
  },
  {
    id: "g267", question: "The Federal Road Safety Corps (FRSC) uses which national toll-free emergency telephone number for highway rescue across Nigeria?",
    options: ["122", "199", "112", "911"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Calling 122 connects motorists directly to the FRSC emergency response call center in the event of highway crashes."
  },
  {
    id: "g268", question: "The unified National Emergency Number launched by the Nigerian Communications Commission (NCC) in Emergency Communications Centres is what?",
    options: ["112", "999", "911", "100"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Dialing 112 connects callers to police, ambulance, fire, and disaster agencies nationwide free of charge."
  },
  {
    id: "g269", question: "The National Identity Management Commission (NIMC) issues what mandatory 11-digit identification number to Nigerian citizens and legal residents?",
    options: ["National Identification Number (NIN)", "BVN", "Tax ID", "Voter ID"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The NIN links biometric data, passports, SIM cards, driver's licenses, and bank accounts in a single national database."
  },
  {
    id: "g270", question: "The Bank Verification Number (BVN) system was launched by the Central Bank of Nigeria in which year to curb banking identity theft and fraud?",
    options: ["2014", "2010", "2016", "2018"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Introduced on February 14, 2014, by CBN, the BVN uses fingerprint and facial biometrics to secure individual bank accounts across all banks."
  },
  {
    id: "g271", question: "The National Youth Service Corps (NYSC) permanent orientation camps require all graduating corps members to undergo how many weeks of paramilitary drills and orientation?",
    options: ["3 weeks", "1 week", "6 weeks", "2 months"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Every university and polytechnic graduate under 30 must complete 3 weeks of camp life and 11 months of primary service to receive an NYSC discharge certificate."
  },
  {
    id: "g272", question: "The Joint Admissions and Matriculation Board (JAMB) conducts which unified entrance examination for university and polytechnic candidates in Nigeria?",
    options: ["UTME (Unified Tertiary Matriculation Examination)", "WAEC", "NECO", "NABTEB"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Established in 1978, JAMB administers the computer-based UTME taken by nearly 2 million secondary-school leavers each year."
  },
  {
    id: "g273", question: "The West African Examinations Council (WAEC), which administers the WASSCE, is a regional examination body shared by Nigeria and which other four English-speaking nations?",
    options: ["Ghana, Sierra Leone, Liberia, and The Gambia", "Benin, Togo, Cameroon, and Ghana", "Kenya, Uganda, Tanzania, and Ghana", "South Africa, Zimbabwe, Zambia, and Ghana"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "WAEC was established in 1952 following the Jeffrey Report to harmonize secondary education credentials across Anglophone West Africa."
  },
  {
    id: "g274", question: "The National Examinations Council (NECO) was established in 1999 by which Nigerian Head of State as an indigenous alternative to WAEC?",
    options: ["General Abdulsalami Abubakar", "General Sani Abacha", "President Olusegun Obasanjo", "General Ibrahim Babangida"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "NECO was created in April 1999 with its national headquarters in Minna, Niger State, providing affordable indigenous matriculation exams."
  },
  {
    id: "g275", question: "The Nigerian Educational Research and Development Council (NERDC), which develops the national school curriculum, is situated in which state?",
    options: ["Abuja / Sheda", "Lagos", "Ibadan", "Kaduna"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "NERDC operates its research complex in Sheda, FCT Abuja, designing textbooks, teacher guides, and basic education curricula."
  },
  {
    id: "g276", question: "The National Universities Commission (NUC), which accredits degree programmes and approves new universities in Nigeria, was established in which year?",
    options: ["1962", "1970", "1978", "1985"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "NUC was set up in 1962 following the Eric Ashby Commission report to oversee the orderly development of Nigerian university education."
  },
  {
    id: "g277", question: "The Academic Staff Union of Universities (ASUU) was formed in 1978 as the successor to which trade union?",
    options: ["National Association of University Teachers (NAUT)", "University Lecturers Front", "Academic Guild of Nigeria", "Tertiary Educators Union"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "ASUU has historically engaged in national negotiations and strikes demanding funding, university autonomy, and academic allowances."
  },
  {
    id: "g278", question: "The National Library of Nigeria, established by the National Library Act of 1964, serves as the apex legal depository for what?",
    options: ["All books, journals, newspapers, and monographs published in Nigeria (allocating ISBN and ISSN numbers)", "Ancient manuscripts only", "Judicial records only", "Military maps only"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Under the legal deposit law, publishers must deposit copies of every printed work in Nigeria with the National Library."
  },
  {
    id: "g279", question: "The Nigerian National Archives, established in 1954 under the leadership of pioneer historian Professor Kenneth Dike, is headquartered in which city?",
    options: ["Ibadan", "Lagos", "Abuja", "Enugu"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The National Archives preserves colonial treaties, intelligence reports, and historical records on the campus of the University of Ibadan."
  },
  {
    id: "g280", question: "Professor Kenneth Onwuka Dike (1917\u20131983) holds what landmark distinction in African higher education?",
    options: ["First indigenous Nigerian Vice-Chancellor of the University of Ibadan and pioneer of African historiography", "First Nigerian Nobel laureate", "First Minister of Education", "Founder of Nsukka"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Kenneth Dike demonstrated using oral traditions and archival records that Africa possessed rich history long before European colonization."
  },
  {
    id: "g281", question: "The National Museum Lagos, located at Onikan, houses the historic bullet-riddled Mercedes limousine in which which Head of State was assassinated?",
    options: ["General Murtala Muhammed (assassinated in 1976)", "General Aguiyi-Ironsi", "General Sani Abacha", "Alhaji Abubakar Tafawa Balewa"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Murtala Muhammed's black unarmored Mercedes-Benz 230.6 is preserved on display at the National Museum Onikan as a somber national relic."
  },
  {
    id: "g282", question: "The Jos Museum, established in 1952 by British archaeologist Bernard Fagg, is renowned for its world-class collection of what ancient artifacts?",
    options: ["Nok terracotta sculptures and traditional architectural models (MOTNA)", "Bronze cannons", "Roman coins", "Dinosaur bones"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Jos Museum showcases ancient Nok terracottas and MOTNA (Museum of Traditional Nigerian Architecture) with life-size replica palaces."
  },
  {
    id: "g283", question: "The National War Museum in Umuahia, Abia State, preserves military hardware, armored tanks, and which subterranean installation from the Civil War?",
    options: ["The underground Radio Biafra bunker ('Ojukwu Bunker')", "A submarine dock", "A nuclear silo", "A fighter hangar"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Visitors descend into Ojukwu's concealed underground bunker and view Biafran armored Red Devils and federal artillery pieces."
  },
  {
    id: "g284", question: "The Slave History Museum in Marina Resort, Calabar, utilizes life-size animatronic figures to depict what historical reality?",
    options: ["The brutal horrors, capture, and transatlantic shipment of enslaved Africans through the Cross River", "Ancient palm harvesting", "Traditional wrestling", "British tea parties"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Opened in 2007, the museum immerses visitors in the emotional history of the slave barracoons and the abolitionist movement in Calabar."
  },
  {
    id: "g285", question: "The Nigerian Institute for Oil Palm Research (NIFOR), which develops improved high-yield oil palm varieties, is located near which city?",
    options: ["Benin City, Edo State", "Warri", "Port Harcourt", "Calabar"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Established in 1939 as WAIFOR, NIFOR conducts global research on oil palm, date palm, coconut, and raffia palm cultivation."
  },
  {
    id: "g286", question: "The International Institute of Tropical Agriculture (IITA), a world-class agricultural research powerhouse spanning 1,000 hectares, is headquartered in which city?",
    options: ["Ibadan, Oyo State", "Nairobi", "Accra", "Abuja"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Founded in 1967, IITA has developed drought-tolerant maize, disease-resistant cassava, and high-protein cowpeas that nourish millions across Africa."
  },
  {
    id: "g287", question: "The Cocoa Research Institute of Nigeria (CRIN), responsible for breeding high-yield cocoa, cashew, and kola nut varieties, is located in which town?",
    options: ["Idi-Ayunre, Ibadan", "Akure", "Ondo Town", "Abeokuta"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "CRIN was established in 1964 to boost export tree-crop yields and support smallholder cocoa farmers across the cocoa belt."
  },
  {
    id: "g288", question: "The Rubber Research Institute of Nigeria (RRIN), which researches natural rubber and gum arabic, is situated in which state?",
    options: ["Edo State (Iyanomo, near Benin City)", "Delta State", "Ogun State", "Cross River State"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "RRIN develops elite rubber clones for the automotive tyre and manufacturing industries from its plantations in Edo State."
  },
  {
    id: "g289", question: "The National Root Crops Research Institute (NRCRI), which pioneered revolutionary pro-vitamin A yellow cassava varieties, is located in which town?",
    options: ["Umudike, Abia State", "Nsukka", "Awka", "Umuahia"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "NRCRI Umudike holds the national genetic mandate for improving root and tuber crops: cassava, yam, cocoyam, sweet potato, and ginger."
  },
  {
    id: "g290", question: "The National Cereals Research Institute (NCRI), which developed famous high-yield FARO rice varieties, is located at Badeggi in which state?",
    options: ["Niger State", "Benue State", "Kebbi State", "Kano State"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "NCRI Badeggi, near Bida, has spearheaded Nigeria's domestic rice revolution with FARO 44 and FARO 52 seed varieties."
  },
  {
    id: "g291", question: "The National Veterinary Research Institute (NVRI), which produces animal vaccines for cattle, poultry, and sheep, is situated in which town?",
    options: ["Vom, Plateau State", "Zaria", "Kaduna", "Bauchi"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Founded in 1924, NVRI Vom produces vaccines protecting livestock across West and Central Africa against rinderpest and anthrax."
  },
  {
    id: "g292", question: "The National Animal Production Research Institute (NAPRI), which breeds improved Shika brown poultry and dairy cows, is affiliated with which university?",
    options: ["Ahmadu Bello University (ABU) Zaria", "University of Ibadan", "UNN", "FUTA"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "NAPRI is located at Shika, Zaria, driving genetics research to boost beef and milk production in Nigerian livestock."
  },
  {
    id: "g293", question: "The Nigerian Meteorological Agency (NiMet), which provides weather forecasts and climate advisories for aviation and agriculture, is headquartered in which city?",
    options: ["Abuja", "Lagos", "Kano", "Oshodi"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "NiMet operates weather observation radar stations across all Nigerian international airports and agricultural zones."
  },
  {
    id: "g294", question: "The National Space Research and Development Agency (NASRDA), which manages Nigeria's Earth observation satellites (NigeriaSat-1, NigeriaSat-2), is headquartered in which city?",
    options: ["Abuja", "Lagos", "Ile-Ife", "Nsukka"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "NASRDA launched Nigeria's space programme, operating satellites that monitor coastal erosion, agriculture, and security."
  },
  {
    id: "g295", question: "NigeriaSat-1, Nigeria's first satellite launched into low Earth orbit in September 2003, was launched from which Russian cosmodrome?",
    options: ["Plesetsk Cosmodrome", "Baikonur", "Vostochny", "Kourou"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "NigeriaSat-1 joined the International Disaster Monitoring Constellation, mapping floods, wildfires, and desertification."
  },
  {
    id: "g296", question: "NigComSat-1R, Nigeria's geostationary communications satellite providing broadband and broadcast signals across Africa, was launched by which nation in 2011?",
    options: ["China (from Xichang Satellite Launch Center)", "Russia", "United States (NASA)", "France (Arianespace)"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Built and launched by China Great Wall Industry Corporation, NigComSat-1R operates at 42.5 degrees East orbital slot."
  },
  {
    id: "g297", question: "The Centre for Space Transport and Propulsion (CSTP), which tests experimental rocket propulsion systems in Nigeria, is located in which town?",
    options: ["Epe, Lagos State", "Nsukka", "Toro, Bauchi", "Akure"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "CSTP in Epe conducts aerodynamic solid-fuel rocket research under the umbrella of NASRDA."
  },
  {
    id: "g298", question: "The National Biosafety Management Agency (NBMA) in Nigeria is tasked with which regulatory function?",
    options: ["Regulating genetically modified organisms (GMOs) and modern biotechnology safety", "Vaccine clinical trials only", "Food import inspection at ports", "Forest logging licenses"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "NBMA ensures that modern gene technology and GM crops (such as Bt cotton and cowpea) are thoroughly evaluated for human and environmental safety."
  },
  {
    id: "g299", question: "The Standards Organisation of Nigeria (SON) certifies manufactured goods with which well-known mandatory quality mark?",
    options: ["MANCAP (Mandatory Conformity Assessment Programme) / SONCAP", "ISO only", "CE mark", "NAFDAC number only"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "SON tests industrial products, building materials, and electronics, issuing the MANCAP quality logo to authentic Nigerian manufacturers."
  },
  {
    id: "g300", question: "The National Agency for Food and Drug Administration and Control (NAFDAC) regulates which categories of products in Nigeria?",
    options: ["Foods, drugs, cosmetics, medical devices, packaged water, and chemicals", "Automobiles and tyres", "Textiles and clothes only", "Electronic appliances only"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Professor Dora Akunyili famously transformed NAFDAC into a fearless regulator that eradicated counterfeit medications and protected consumer health."
  },
  {
    id: "g301", question: "The late Professor Dora Akunyili served as Director-General of NAFDAC from 2001 to 2008, gaining global renown for what crusade?",
    options: ["Her fearless, life-risking campaign against counterfeit and fake pharmaceutical drugs in Nigeria", "Creating free healthcare for children", "Banning junk food", "Building regional hospitals"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Dora Akunyili survived multiple assassination attempts, drastically reducing the circulation of lethal counterfeit drugs from over 60% to under 16%."
  },
  {
    id: "g302", question: "The Consumer Protection Council of Nigeria was overhauled and renamed in 2019 under which new statutory commission?",
    options: ["Federal Competition and Consumer Protection Commission (FCCPC)", "Consumer Rights Board", "National Fair Trade Agency", "Public Complaints Commission"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Under Babatunde Irukera, the FCCPC emerged as a muscular enforcer protecting consumer rights, investigating predatory loan apps, and penalizing monopolies."
  },
  {
    id: "g303", question: "The Corporate Affairs Commission (CAC) was established under the Companies and Allied Matters Act (CAMA) of which year?",
    options: ["1990", "1975", "1985", "1999"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Headquartered in Abuja, CAC registers businesses, incorporations, limited liability companies, and trustees in Nigeria."
  },
  {
    id: "g304", question: "The National Pension Commission (PenCom) requires employers with how many employees or more to enroll them in the mandatory contributory pension scheme?",
    options: ["3 or more employees", "15 or more", "50 or more", "100 or more"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Under the Pension Reform Act 2014, organizations with at least three workers must contribute a minimum of 10% employer and 8% employee to a licensed PFA."
  },
  {
    id: "g305", question: "The Nigerian Sovereign Investment Authority (NSIA) operates three ring-fenced funds: The Stabilization Fund, The Future Generations Fund, and what third fund?",
    options: ["The Nigeria Infrastructure Fund (NIF)", "The Debt Recovery Fund", "The Oil Dividend Fund", "The Youth Employment Fund"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The Infrastructure Fund co-finances critical national projects like the Second Niger Bridge, Lagos-Ibadan Expressway, and Presidential Fertilizer Initiative."
  },
  {
    id: "g306", question: "The Presidential Fertilizer Initiative (PFI), which revived over 40 blending plants across Nigeria, produces which popular compound fertilizer locally?",
    options: ["NPK 20:10:10", "Urea only", "Potash only", "Superphosphate only"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "PFI combined domestic urea from Indorama/Dangote with phosphate from Morocco to provide affordable blended fertilizer to millions of Nigerian farmers."
  },
  {
    id: "g307", question: "Indorama Eleme Petrochemicals, located in Port Harcourt, operates one of the world's largest single-train production facilities for which fertilizer?",
    options: ["Granular Urea (over 3 million metric tonnes per annum)", "Ammonium Nitrate", "Phosphate rock", "Sulfuric acid"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Indorama transformed the privatized Eleme complex into a world-class manufacturing hub, exporting petrochemical resins and urea across the globe."
  },
  {
    id: "g308", question: "The Notore Chemical Industries plant in Onne, Rivers State, was formerly known as what federal fertilizer complex before privatization?",
    options: ["National Fertilizer Company of Nigeria (NAFCON)", "Federal Fertilizer Corp", "Niger Basin Fertilizer", "Rivers Agro Chemicals"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "NAFCON was built in the 1980s as Sub-Saharan Africa's first modern nitrogenous fertilizer complex before its revival by Notore in 2005."
  },
  {
    id: "g309", question: "The Nigerian Export Promotion Council (NEPC) launched which flagship campaign to diversify foreign exchange earnings away from crude oil?",
    options: ["Zero Oil Plan / Export35", "Operation Feed the Nation", "Buy Nigerian", "Green Revolution"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The Zero Oil Plan aims to boost non-oil exports (sesame, cashew, cocoa, ginger, solid minerals, and technology services) to $30 billion annually."
  },
  {
    id: "g310", question: "Sesame seeds (Beniseed) are one of Nigeria's largest non-oil agricultural export earners, grown predominantly in which states?",
    options: ["Benue, Jigawa, Nasarawa, and Taraba states", "Lagos and Ogun", "Imo and Abia", "Delta and Rivers"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria is one of the world's top five producers and exporters of sesame seeds, primarily shipping high-grade seeds to Japan, China, and Turkey."
  },
  {
    id: "g311", question: "Ginger grown in Southern Kaduna (Kachia, Jaba) is internationally famous in global spice markets for what quality?",
    options: ["Highest pungency, oleoresin, and essential oil content in the world", "Being the sweetest ginger", "White color", "Absence of fiber"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Kaduna ginger is prized by multinational pharmaceutical and beverage companies for its intense aroma, spicy kick, and medicinal oils."
  },
  {
    id: "g312", question: "Gum Arabic, an essential emulsifier used in soft drinks, cosmetics, and confectionery, is harvested from Acacia trees across which belt in Nigeria?",
    options: ["The Sahel and Sudan Savannah (Borno, Yobe, Jigawa, Kano, Katsina)", "The Niger Delta mangroves", "The rainforest belt of Ogun and Ondo", "The Jos plateau only"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria ranks as the world's second-largest exporter of high-grade Acacia senegal and Acacia seyal gum arabic after Sudan."
  },
  {
    id: "g313", question: "Cashew nuts in raw form are exported in tens of thousands of tonnes annually from major orchards located across which Nigerian states?",
    options: ["Kogi, Oyo, Enugu, and Kwara states", "Borno and Yobe", "Lagos only", "Akwa Ibom only"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria is one of Africa's top producers of raw cashew nuts (RCN), shipped primarily to Vietnam and India for industrial processing."
  },
  {
    id: "g314", question: "Cassava production in Nigeria ranks where in the entire world by total annual volume?",
    options: ["Number 1 in the world (over 60 million metric tonnes per annum)", "Number 5", "Number 10", "Number 20"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Nigeria is the undisputed global champion of cassava production, producing over 20% of the world's total cassava crop."
  },
  {
    id: "g315", question: "Yam production in Nigeria accounts for what astonishing percentage of all yams harvested globally?",
    options: ["Over 65% to 70% of global yam production", "10%", "25%", "95%"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Nigeria produces over 45 million tonnes of yams each year, led by states like Benue, Taraba, Niger, and Nasarawa."
  },
  {
    id: "g316", question: "The International Council on Clean Transportation and global ports recognise the Lekki Deep Sea Port's turning circle and approach channel as accommodating ships of what size?",
    options: ["Up to 18,000 TEU container mega-vessels", "Small barges only", "Fishing trawlers only", "River canoes only"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "With a 16.5-meter draught, Lekki Port handles the largest neo-Panamax container vessels in the global shipping fleet, making Nigeria a regional transshipment hub."
  },
  {
    id: "g317", question: "The Onne Oil and Gas Free Zone in Rivers State is unique in the world because it is what?",
    options: ["The only free trade zone in the world dedicated exclusively to the oil and gas industry", "The largest gold exchange", "A diamond mining zone", "A timber clearing port"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "Onne Port Free Zone serves hundreds of multinational energy firms (Baker Hughes, Schlumberger, Saipem) as an offshore logistics base for the Gulf of Guinea."
  },
  {
    id: "g318", question: "The Calabar Free Trade Zone (CFTZ), established in 1992, was historic in Nigeria as what?",
    options: ["Nigeria's first dedicated Export Processing Zone (EPZ)", "A private cryptocurrency hub", "An agricultural cooperative only", "A military cantonment"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "CFTZ paved the way for modern industrial free trade zones in Nigeria, managed by the Nigeria Export Processing Zones Authority (NEPZA)."
  },
  {
    id: "g319", question: "The Nigeria Export Processing Zones Authority (NEPZA) and Oil and Gas Free Zones Authority (OGFZA) provide which primary incentive to licensed investors?",
    options: ["100% tax holidays, duty-free importation of raw materials, and 100% foreign ownership of capital", "Free subsidized fuel", "Government-appointed board directors", "Free bank loans"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Enterprises operating inside Nigerian free zones enjoy complete exemption from federal, state, and local taxes and customs import duties."
  },
  {
    id: "g320", question: "The Federal Inland Revenue Service (FIRS) is the statutory agency charged with assessing, collecting, and accounting for which revenues?",
    options: ["Federal taxes: Companies Income Tax (CIT), Value Added Tax (VAT), and Petroleum Profits Tax (PPT)", "Customs tariffs only", "Vehicle road licenses only", "Court fines only"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "FIRS collects trillions of Naira annually in non-oil and oil taxes to fund the federal, state, and local government budgets."
  },
  {
    id: "g321", question: "Value Added Tax (VAT) in Nigeria was originally introduced in 1993 under which Finance Minister, replacing the old Sales Tax?",
    options: ["Dr. Kalu Idika Kalu", "Chief Anthony Ani", "Mallam Adamu Ciroma", "Chief Festus Okotie-Eboh"],
    answer: 0, category: "General Knowledge", difficulty: "hard",
    explanation: "VAT was introduced at a rate of 5% in 1993, later adjusted to 7.5% in the Finance Act 2020."
  },
  {
    id: "g322", question: "The Federation Account Allocation Committee (FAAC) meets monthly in Abuja to distribute national revenue among which tiers of government?",
    options: ["The Federal Government, the 36 State Governments, and the 774 Local Government Councils", "Federal and private companies only", "ECOWAS member states", "Commercial banks only"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "FAAC shares statutory revenues from oil royalties, customs duties, CIT, and VAT according to the constitutionally established revenue allocation formula."
  },
  {
    id: "g323", question: "The 13% Derivation Principle in Nigeria's revenue allocation formula mandates that what proportion of oil revenue goes directly to whom?",
    options: ["At least 13% of revenues generated from mineral resources is paid back directly to the oil-producing states", "13% goes to the military", "13% goes to foreign oil companies", "13% is saved in gold bars"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Section 162(2) of the 1999 Constitution provides the 13% derivation fund to oil-producing littoral states to address ecological and infrastructural challenges."
  },
  {
    id: "g324", question: "The Niger Delta Development Commission (NDDC) was established in 2000 by President Obasanjo to replace which previous agency?",
    options: ["Oil Mineral Producing Areas Development Commission (OMPADEC)", "Niger Delta Basin Authority", "Rivers Basin Commission", "Federal Oil Relief Agency"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "NDDC was created with funding from federal allocations and statutory contributions from oil companies to execute developmental projects across nine oil-producing states."
  },
  {
    id: "g325", question: "Which nine states make up the official Niger Delta Development Commission (NDDC) mandate region?",
    options: ["Abia, Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Imo, Ondo, and Rivers", "Delta, Bayelsa, and Rivers only", "All southern states", "Cross River and Akwa Ibom only"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "The NDDC mandate covers the six South-South states plus three neighboring oil-bearing states: Abia, Imo, and Ondo."
  },
  {
    id: "g326", question: "The North-East Development Commission (NEDC) was established in 2017 with what statutory core mandate?",
    options: ["Rebuilding, rehabilitating, and reconstructing infrastructure destroyed by the Boko Haram insurgency across the six north-eastern states", "Mining solid minerals", "Managing Lake Chad navigation", "Building desert highways only"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "NEDC coordinates resettlement, housing, schools, bridges, and livelihood recovery across Borno, Yobe, Adamawa, Bauchi, Gombe, and Taraba."
  },
  {
    id: "g327", question: "The Six Geopolitical Zones of Nigeria (North-West, North-East, North-Central, South-West, South-East, South-South) were originally recommended during which historic conference?",
    options: ["1994\u20131995 National Constitutional Conference (championed by Dr. Alex Ekwueme)", "1979 Constituent Assembly", "1960 Independence Conference", "2014 National Conference"],
    answer: 0, category: "General Knowledge", difficulty: "medium",
    explanation: "Former Vice President Dr. Alex Ekwueme proposed the six geopolitical zones as a creative framework for power-sharing and regional balance."
  },
  {
    id: "g328", question: "The National Youth Service Corps (NYSC) anthem begins with which inspiring opening lines?",
    options: ["'Youths obey the clarion call, let us lift our nation high...'", "'Arise O Compatriots, Nigeria's call obey...'", "'Hail Nigeria our great motherland...'", "'Stand up for the green white green...'"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "'Youths obey the clarion call, let us lift our nation high, under the sun or in the rain, with dedication and one strength' is sung on orientation parade grounds nationwide."
  },
  {
    id: "g329", question: "The pledge recited by Nigerian schoolchildren and citizens opens with which solemn commitment?",
    options: ["'I pledge to Nigeria my country, to be faithful, loyal and honest...'", "'I swear to defend the flag...'", "'Nigeria my country, I give you my heart...'", "'Under God we stand united...'"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "The National Pledge was written in 1976 by Professor Felicia Adebola Adedoyin and officially adopted under General Olusegun Obasanjo."
  },
  {
    id: "g330", question: "The national colours of Nigeria are Green and White. What do they officially symbolize?",
    options: ["Green represents Nigeria's rich natural wealth and fertile agricultural land; White represents peace and unity", "Green represents forests; White represents cotton", "Green represents military power; White represents religion", "Green represents Islam; White represents Christianity"],
    answer: 0, category: "General Knowledge", difficulty: "easy",
    explanation: "Designed in 1959 by Michael Taiwo Akinkunmi, the green vertical bands represent agricultural wealth, flanking the white band signifying peace."
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

export function getFreshQuestions(
  count: number,
  seenIds: string[] = []
): { questions: TriviaQuestion[]; wasReset: boolean } {
  const seenSet = new Set(seenIds);
  const unseen = TRIVIA_QUESTIONS.filter((q) => !seenSet.has(q.id));

  // If we have enough unseen questions, shuffle and pick from them
  if (unseen.length >= count) {
    const shuffledUnseen = [...unseen].sort(() => Math.random() - 0.5);
    return { questions: shuffledUnseen.slice(0, count), wasReset: false };
  }

  // Not enough unseen questions: exhaust what remains, then reset the pool
  const shuffledUnseen = [...unseen].sort(() => Math.random() - 0.5);
  const remainingNeeded = count - shuffledUnseen.length;

  // Draw remaining from the previously seen pool
  const seenPool = TRIVIA_QUESTIONS.filter((q) => seenSet.has(q.id)).sort(
    () => Math.random() - 0.5
  );

  const combined = [...shuffledUnseen, ...seenPool.slice(0, remainingNeeded)];
  return { questions: combined, wasReset: true };
}

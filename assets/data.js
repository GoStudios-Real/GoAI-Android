/* GoAI data / knowledge */
window.GO_DATA = {

  FACTS: [
    'A day on Venus is longer than a year on Venus.',
    'Honey never spoils; 3000-year-old honey is still edible.',
    'Octopuses have three hearts and blue blood.',
    'Bananas are berries, but strawberries are not.',
    'The Eiffel Tower grows about 15 cm taller in summer from heat.',
    'Your brain uses about 20% of your body energy.',
    'Light from the Sun reaches Earth in about 8 minutes 20 seconds.',
    'There are more possible chess games than atoms in the universe.',
    'Sharks existed before trees.',
    'The human body has about 60,000 miles of blood vessels.',
    'A group of flamingos is called a flamboyance.',
    'Cats spend about 70% of their lives sleeping.',
    'Water can boil and freeze at the same time at its triple point.',
    'The Pacific Ocean is wider than the Moon.',
    'The shortest war in history lasted only 38 minutes.',
    'A cloud can weigh over a million pounds.',
    'Sound travels four times faster underwater than in air.',
    'The Eiffel Tower is as tall as an 81-story building plus a tiny bit.'
  ],

  WORDS: [
    ['serendipity', 'the occurrence of happy events by pure chance'],
    ['ephemeral', 'lasting for a very short time'],
    ['eloquent', 'fluent and persuasive in speaking or writing'],
    ['resilient', 'able to recover quickly from difficulties'],
    ['luminous', 'bright or shining, especially in darkness'],
    ['melancholy', 'a deep, thoughtful sadness'],
    ['obsolete', 'no longer used; out of date'],
    ['paradox', 'a statement that seems to contradict itself yet may be true'],
    ['sophisticated', 'developed to a high degree of complexity or refinement'],
    ['transient', 'lasting only a short time'],
    ['ubiquitous', 'present everywhere'],
    ['zenith', 'the highest point reached'],
    ['meticulous', 'showing great attention to detail'],
    ['candid', 'truthful and straightforward; honest'],
    ['intricate', 'very complicated or detailed'],
    ['pensive', 'deeply thoughtful'],
    ['voracious', 'having an insatiable appetite'],
    ['wanderlust', 'a strong desire to travel'],
    ['exquisite', 'extremely beautiful and delicate'],
    ['fortuitous', 'happening by lucky chance'],
    ['pi', 'the ratio of a circle circumference to its diameter, about 3.14'],
    ['ai', 'artificial intelligence: machines that learn, reason and create'],
    ['euler', 'Euler, the famous mathematician, gave us the number e = 2.718'],
    ['london', 'the capital city of England, home to Big Ben and the Thames'],
    ['goconsoleos', 'the retro sound engine inside GoAI, created by GoStudios - full of boot-ups, selects, beeps and blips'],
    ['research', 'a feature where GoAI searches the web (via Wikipedia) and brings back real facts and links'],
    ['token', 'the currency of GoAI. You start with 999,999,999,999 and each message costs 1 token']
  ],

  INVENTORS: {
    'edison': 'Thomas Edison patented over a thousand inventions, including the practical light bulb and the phonograph.',
    'tesla': 'Nikola Tesla invented alternating current (AC) systems and the induction motor.',
    'einstein': 'Albert Einstein developed the theory of relativity, giving us E = mc squared.',
    'newton': 'Isaac Newton formulated the laws of motion and universal gravitation.',
    'darwin': 'Charles Darwin wrote On the Origin of Species, explaining natural selection.',
    'curie': 'Marie Curie discovered radium and polonium and won two Nobel Prizes.',
    'musk': 'Elon Musk founded Tesla, SpaceX and Neuralink, focused on electric cars and space.',
    'turing': 'Alan Turing, father of computer science, helped crack the Enigma code.',
    'jobs': 'Steve Jobs co-founded Apple and led the smartphone era with the iPhone.',
    'gates': 'Bill Gates co-founded Microsoft and helped put a computer on every desk.',
    'davinci': 'Leonardo da Vinci, a true polymath, painted the Mona Lisa and dreamed of flying machines.',
    'hawking': 'Stephen Hawking derived Hawking radiation from black holes.',
    'gutenberg': 'Johannes Gutenberg invented the movable-type printing press.',
    'bell': 'Alexander Graham Bell patented the telephone.',
    'wright': 'The Wright brothers made the first powered airplane flight in 1903.',
    'pascal': 'Blaise Pascal built mechanical calculators and thought deeply about faith and reason.',
    'ramanujan': 'Srinivasa Ramanujan produced thousands of brilliant mathematical formulas.',
    'hopper': 'Grace Hopper invented the compiler and the COBOL language.'
  },

  BODIES: {
    'paris': 'Paris, capital of France, is famous for the Eiffel Tower, Louvre and the river Seine.',
    'london': 'London is home to Big Ben, Buckingham Palace and the London Eye.',
    'tokyo': 'Tokyo, Japan, blends neon lights, technology and ancient temples.',
    'new york': 'New York City is home to Times Square, Central Park and the Statue of Liberty.',
    'dubai': 'Dubai owns the Burj Khalifa, the tallest building on Earth.',
    'mount everest': 'Mount Everest is the highest mountain above sea level, at 8848 meters.',
    'mariana trench': 'The Mariana Trench is the deepest ocean point, over 11 km down.',
    'grand canyon': 'The Grand Canyon was carved by the Colorado River over millions of years.',
    'sahara': 'The Sahara is the largest hot desert, almost the size of the USA.',
    'amazon': 'The Amazon rainforest holds about 10% of Earth species and 390 billion trees.',
    'antarctica': 'Antarctica is the coldest continent and holds most of Earth freshwater as ice.',
    'australia': 'Australia has more kangaroos than people, plus the Great Barrier Reef.',
    'statue of liberty': 'The Statue of Liberty was a gift from France to the USA in 1886.',
    'pyramids': 'The Great Pyramid of Giza is the only surviving wonder of the ancient seven.',
    'machu picchu': 'Machu Picchu is the ancient Inca mountain city in Peru.'
  },

  ANIMALS: {
    'lion': 'The lion, king of the savanna, lives and hunts in social groups called prides.',
    'dog': 'A dog has about 300 million smell receptors, far more than humans.',
    'cat': 'Cats sleep up to 16 hours a day and can rotate their ears about 180 degrees.',
    'eagle': 'An eagle can spot prey from almost 2 miles away.',
    'shark': 'Sharks have existed for over 400 million years, longer than any dinosaur.',
    'penguin': 'Penguins cannot fly, but they can swim over 20 miles per hour.',
    'dolphin': 'Dolphins recognize themselves in mirrors, a sign of high intelligence.',
    'elephant': 'Elephants have the largest brain among land animals and strong memories.',
    'whale': 'The blue whale is the largest animal ever known on Earth.',
    'tiger': 'Each tiger has a unique stripe pattern, like a fingerprint.',
    'butterfly': 'Butterflies taste with their feet.',
    'turtle': 'Some giant tortoises can live more than 150 years.'
  },

  CONSTANTS: {
    'pi': { v: 3.141592653589793, n: 'pi', ds: 'the ratio of a circle circumference to its diameter' },
    'euler': { v: 2.718281828459045, n: 'e', ds: 'the base of natural logarithms' },
    'phi': { v: 1.618033988749895, n: 'phi, the golden ratio', ds: 'found in art, nature and geometry' },
    'gravity': { v: 6.674, n: 'G, the gravitational constant', ds: 'x 10^-11 N m^2/kg^2' },
    'speed of light': { v: 299792458, n: 'c, the speed of light', ds: 'm/s in a vacuum' }
  },

  QUOTES: [
    'The only way to do great work is to love what you do. - Steve Jobs',
    'Imagination is more important than knowledge. - Albert Einstein',
    'The future belongs to those who believe in the beauty of their dreams. - Roosevelt',
    'It does not matter how slowly you go as long as you do not stop. - Confucius',
    'Whether you think you can or you think you cannot, you are right. - Henry Ford',
    'Stay hungry, stay foolish. - Steve Jobs',
    'The best way to predict the future is to invent it. - Alan Kay',
    'Every problem carries the seed of its own solution.',
    'Great minds discuss ideas. Part of greatness is asking better questions.'
  ],

  JOKES: [
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'Why do baristas like their coffee makes coffee trees? Because they keep things grounded.',
    'I told my computer I needed a break, and it kept sending snackbar messages.',
    'How does the moon cut its hair? Eclipse it.',
    'Why was the math book sad? It had too many problems.',
    'I asked GoAI the meaning of life; it said 42, then asked for coffee.',
    'Why did the function visit the therapist? Unresolved return values.'
  ],

  TRIVIA: [
    { q: 'What planet is known as the Red Planet?', a: ['Venus', 'Mars', 'Jupiter', 'Saturn'], c: 'B', explain: 'Mars gets its red color from iron oxide.' },
    { q: 'Who wrote "Romeo and Juliet"?', a: ['Charles Dickens', 'Mark Twain', 'William Shakespeare', 'Jane Austen'], c: 'C', explain: 'Shakespeare wrote it around 1597.' },
    { q: 'How many sides does a hexagon have?', a: ['5', '6', '7', '8'], c: 'B', explain: 'Hexa means six.' },
    { q: 'What is the largest ocean on Earth?', a: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], c: 'D', explain: 'The Pacific is the biggest and deepest ocean.' },
    { q: 'Which animal is known as the king of the jungle?', a: ['Tiger', 'Elephant', 'Lion', 'Gorilla'], c: 'C', explain: 'The lion is the classic jungle king.' },
    { q: 'What is the chemical symbol for gold?', a: ['Go', 'Gd', 'Au', 'Ag'], c: 'C', explain: 'Au comes from aurum, the Latin word for gold.' },
    { q: 'How many colors are in a rainbow?', a: ['5', '6', '7', '8'], c: 'C', explain: 'Red, orange, yellow, green, blue, indigo, violet.' },
    { q: 'Which is the fastest land animal?', a: ['Lion', 'Horse', 'Cheetah', 'Kangaroo'], c: 'C', explain: 'A cheetah can hit 100 km/h in seconds.' },
    { q: 'What is the currency of Japan?', a: ['Yuan', 'Won', 'Yen', 'Ringgit'], c: 'C', explain: 'Japan uses the yen (JPY).' },
    { q: 'How many planets are in our solar system?', a: ['7', '8', '9', '10'], c: 'B', explain: 'Mercury to Neptune - eight planets.' }
  ]

};
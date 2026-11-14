import { season, series } from './helpers'

export const SERIES = [
  series(1396, 'Breaking Bad', 2008, 'A chemistry teacher diagnosed with cancer turns to manufacturing drugs to secure his family’s future.', false, [
    season(1, 7, { weekly: '2008-01-20' }, ['Pilot', "Cat's in the Bag...", "...And the Bag's in the River", 'Cancer Man', 'Gray Matter', "Crazy Handful of Nothin'", 'A No-Rough-Stuff-Type Deal'], 47),
    season(2, 13, { weekly: '2009-03-08' }, ['Seven Thirty-Seven', 'Grilled', 'Bit by a Dead Bee', 'Down', 'Breakage', 'Peekaboo', 'Negro y Azul', 'Better Call Saul', '4 Days Out', 'Over', 'Mandala', 'Phoenix', 'ABQ'], 47),
    season(3, 13, { weekly: '2010-03-21' }, ['No Más', 'Caballo sin Nombre', 'I.F.T.', 'Green Light', 'Más', 'Sunset', 'One Minute', 'I See You', 'Kafkaesque', 'Fly', 'Abiquiu', 'Half Measures', 'Full Measure'], 47),
    season(4, 13, { weekly: '2011-07-17' }, ['Box Cutter', 'Thirty-Eight Snub', 'Open House', 'Bullet Points', 'Shotgun', 'Cornered', 'Problem Dog', 'Hermanos', 'Bug', 'Salud', 'Crawl Space', 'End Times', 'Face Off'], 47),
    season(5, 16, ['2012-07-15', '2012-07-22', '2012-07-29', '2012-08-05', '2012-08-12', '2012-08-19', '2012-08-26', '2012-09-02', '2013-08-11', '2013-08-18', '2013-08-25', '2013-09-01', '2013-09-08', '2013-09-15', '2013-09-22', '2013-09-29'], ['Live Free or Die', 'Madrigal', 'Hazard Pay', 'Fifty-One', 'Dead Freight', 'Buyout', 'Say My Name', 'Gliding Over All', 'Blood Money', 'Buried', 'Confessions', 'Rabid Dog', "To'hajiilee", 'Ozymandias', 'Granite State', 'Felina'], 47),
  ], ['Netflix']),

  series(66732, 'Stranger Things', 2016, 'When a boy vanishes, a small town uncovers a mystery involving secret experiments and a girl with powers.', false, [
    season(1, 8, '2016-07-15', ['Chapter One: The Vanishing of Will Byers', 'Chapter Two: The Weirdo on Maple Street', 'Chapter Three: Holly, Jolly', 'Chapter Four: The Body', 'Chapter Five: The Flea and the Acrobat', 'Chapter Six: The Monster', 'Chapter Seven: The Bathtub', 'Chapter Eight: The Upside Down'], 50),
    season(2, 9, '2017-10-27', ['Chapter One: MADMAX', 'Chapter Two: Trick or Treat, Freak', 'Chapter Three: The Pollywog', 'Chapter Four: Will the Wise', 'Chapter Five: Dig Dug', 'Chapter Six: The Spy', 'Chapter Seven: The Lost Sister', 'Chapter Eight: The Mind Flayer', 'Chapter Nine: The Gate'], 55),
    season(3, 8, '2019-07-04', ['Chapter One: Suzie, Do You Copy?', 'Chapter Two: The Mall Rats', 'Chapter Three: The Case of the Missing Lifeguard', 'Chapter Four: The Sauna Test', 'Chapter Five: The Flayed', 'Chapter Six: E Pluribus Unum', 'Chapter Seven: The Bite', 'Chapter Eight: The Battle of Starcourt'], 55),
    season(4, 9, ['2022-05-27', '2022-05-27', '2022-05-27', '2022-05-27', '2022-05-27', '2022-05-27', '2022-05-27', '2022-07-01', '2022-07-01'], ['Chapter One: The Hellfire Club', "Chapter Two: Vecna's Curse", 'Chapter Three: The Monster and the Superhero', 'Chapter Four: Dear Billy', 'Chapter Five: The Nina Project', 'Chapter Six: The Dive', 'Chapter Seven: The Massacre at Hawkins Lab', 'Chapter Eight: Papa', 'Chapter Nine: The Piggyback'], 75),
    season(5, 8, ['2025-11-26', '2025-11-26', '2025-11-26', '2025-11-26', '2025-12-25', '2025-12-25', '2025-12-25', '2025-12-31'], ['Chapter One: The Crawl', 'Chapter Two: The Vanishing of Holly Wheeler', 'Chapter Three: The Turnbow Trap', 'Chapter Four: Sorcerer', 'Chapter Five: Shock Jock', 'Chapter Six: Escape from Camazotz', 'Chapter Seven: The Bridge', 'Chapter Eight: The Rightside Up'], 70),
  ], ['Netflix']),

  series(136315, 'The Bear', 2022, 'A young chef returns to Chicago to run his late brother’s chaotic sandwich shop.', true, [
    season(1, 8, '2022-06-23', ['System', 'Hands', 'Brigade', 'Dogs', 'Sheridan', 'Ceres', 'Review', 'Braciole'], 30),
    season(2, 10, '2023-06-22', ['Beef', 'Pasta', 'Sundae', 'Honeydew', 'Pop', 'Fishes', 'Forks', 'Bolognese', 'Omelette', 'The Bear'], 40),
    season(3, 10, '2024-06-26', ['Tomorrow', 'Next', 'Doors', 'Violet', 'Children', 'Napkins', 'Ice Chips', 'Apologies', 'Ramen', 'Forever'], 40),
    season(4, 10, '2025-06-25', [], 40),
  ], ['Disney+']),

  series(95396, 'Severance', 2022, 'Office workers whose memories are surgically divided between work and home begin to question their jobs.', true, [
    season(1, 9, { weekly: '2022-02-18' }, ['Good News About Hell', 'Half Loop', 'In Perpetuity', 'The You You Are', 'The Grim Barbarity of Optics and Education', 'Hide and Seek', 'Defiant Jazz', "What's for Dinner?", 'The We We Are'], 50),
    season(2, 10, { weekly: '2025-01-17' }, ['Hello, Ms. Cobel', 'Goodbye, Mrs. Selvig', 'Who Is Alive?', "Woe's Hollow", "Trojan's Horse", 'Attila', 'Chikhai Bardo', 'Sweet Vitriol', 'The After Hours', 'Cold Harbor'], 50),
  ], ['Apple TV+']),

  series(100088, 'The Last of Us', 2023, 'Twenty years after a fungal pandemic, a smuggler escorts a teenage girl across a ruined America.', true, [
    season(1, 9, { weekly: '2023-01-15' }, ["When You're Lost in the Darkness", 'Infected', 'Long, Long Time', 'Please Hold to My Hand', 'Endure and Survive', 'Kin', 'Left Behind', 'When We Are in Need', 'Look for the Light'], 55),
    season(2, 7, { weekly: '2025-04-13' }, ['Future Days', 'Through the Valley', 'The Path', 'Day One', 'Feel Her Love', 'The Price', 'Convergence'], 55),
  ], ['WOW/Sky']),

  series(76331, 'Succession', 2018, 'The Roy family fights for control of a global media empire as its patriarch declines.', false, [
    season(1, 10, { weekly: '2018-06-03' }, ['Celebration', 'Shit Show at the Fuck Factory', 'Lifeboats', 'Sailing', 'I Went to Market', 'Which Side Are You On?', 'Austerlitz', 'Prague', 'Pre-Nuptial', 'Nobody Is Ever Missing'], 60),
    season(2, 10, { weekly: '2019-08-11' }, ['The Summer Palace', 'Vaulter', 'Hunters', 'Safe Room', 'Tern Haven', 'Argestes', 'Return', 'Dundee', 'DC', 'This Is Not for Tears'], 60),
    season(3, 9, { weekly: '2021-10-17' }, ['Secession', 'Mass in Time of War', 'The Disruption', 'Lion in the Meadow', 'Retired Janitors of Idaho', 'What It Takes', 'Too Much Birthday', 'Chiantishire', 'All the Bells Say'], 60),
    season(4, 10, { weekly: '2023-03-26' }, ['The Munsters', 'Rehearsal', 'Honeymoon States', "Connor's Wedding", 'Kill List', 'Living+', 'Tailgate Party', 'America Decides', 'Church and State', 'With Open Eyes'], 60),
  ], ['WOW/Sky']),

  series(67070, 'Fleabag', 2016, 'A sharp-tongued young woman navigates life, love and grief in London.', false, [
    season(1, 6, { weekly: '2016-07-21' }, [], 25),
    season(2, 6, { weekly: '2019-03-04' }, [], 27),
  ], ['Prime Video']),

  series(87108, 'Chernobyl', 2019, 'The 1986 nuclear disaster and the people who fought to contain it.', false, [
    season(1, 5, { weekly: '2019-05-06' }, ['1:23:45', 'Please Remain Calm', 'Open Wide, O Earth', 'The Happiness of All Mankind', 'Vichnaya Pamyat'], 62),
  ], ['WOW/Sky']),
]

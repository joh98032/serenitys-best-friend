/* The story, page by page.
   scene      – builder name in js/art/scenes.js (missing → "picture coming soon" placeholder)
   transition – how this page arrives: 'curl' (default) | 'glide' | 'fade' | 'sparkle'
   cues       – when word `w` (nth occurrence `n`) is spoken, run scene action `act`
                ({ at: 'end', act } runs when the page finishes reading)
   mood       – background music: calm | jolly | shy | joy */
BOOK.story = {
  title: "Serenity's Best Friend",
  authors: 'Kaya and Keira, with the help of Ben',
  // background sounds for each scene: snow | yard | home | class | diner
  ambience: {
    cover: 'snow', mintBall: 'snow', sparkleEyes: 'snow', smile: 'snow', kind: 'snow', alone: 'snow',
    askMom: 'home', momHug: 'home', school: 'class', lols: 'class', christmas: 'home', birthday: 'home', wish: 'home',
    newKid: 'class', allRed: 'class', greet: 'class', shy: 'class', tree: 'yard', walkUp: 'yard', ask: 'yard', yes: 'yard',
    habit: 'snow', burgers: 'diner', sides: 'diner', bff: 'diner', theEnd: 'snow'
  },
  pages: [
    { scene: 'cover', title: true, text: "Serenity's Best Friend", byline: 'Written by Kaya and Keira with the help of Ben' },
    { scene: 'mintBall', text: 'Once upon a time, there was a little Labubu named Serenity. She was green like a mint ball.', cues: [{ w: 'serenity', act: 'roll' }, { w: 'mint', act: 'mint' }, { w: 'ball', act: 'ball' }] },
    { scene: 'sparkleEyes', text: 'She had colorful toenails, green like grass. She had beautiful eyes like the pretty sky, sparkly like glitter from a glitter jar.', cues: [{ w: 'toenails', act: 'toes' }, { w: 'eyes', act: 'eyes' }, { w: 'glitter', act: 'glitter' }] },
    { scene: 'smile', text: 'She had a tooth that was glistening green, the same color as her nose, and she had a big, cute smile.', cues: [{ w: 'glistening', act: 'tooth' }, { w: 'nose', act: 'nose' }, { w: 'smile', act: 'smile' }] },
    { scene: 'kind', text: 'And best of all, she was a kind little Labubu.', cues: [{ w: 'kind', act: 'kind' }] },
    { scene: 'alone', mood: 'shy', text: "Serenity was nice to everyone, but she didn't really have any friends.", cues: [{ w: 'nice', act: 'nice' }, { w: 'friends', act: 'friends' }] },
    { scene: 'askMom', mood: 'shy', text: 'So she talked to her mom, whose name was Sophie. "Mom," she asked, "when am I going to have friends?"', cues: [{ w: 'talked', act: 'talked' }, { w: 'mom', n: 2, act: 'mom' }, { w: 'friends', act: 'friends' }] },
    { scene: 'momHug', text: '"Soon, Serenity," Mom said. "I love you. I\'ll see you after school!"', cues: [{ w: 'soon', act: 'soon' }, { w: 'love', act: 'love' }, { w: 'school', act: 'school' }] },
    { scene: 'school', mood: 'jolly', text: 'So Serenity went to school. She was in TK, and TK was so much fun. She loved it.', cues: [{ w: 'school', act: 'school' }, { w: 'fun', act: 'fun' }, { w: 'loved', act: 'loved' }] },
    { scene: 'lols', mood: 'jolly', text: 'They even had LOLs! She was very happy in TK.', cues: [{ w: 'lols', act: 'lols' }, { w: 'happy', act: 'happy' }] },
    { scene: 'christmas', mood: 'jolly', transition: 'snow', text: 'It was Christmas, the best season of the year, and Serenity loved Christmas.', cues: [{ w: 'christmas', act: 'christmas' }, { w: 'best', act: 'best' }, { w: 'loved', act: 'loved' }] },
    { scene: 'birthday', mood: 'jolly', text: 'Her birthday was on Christmas Day, so she got double the presents!', cues: [{ w: 'birthday', act: 'birthday' }, { w: 'double', act: 'double' }, { w: 'presents', act: 'presents' }] },
    { scene: 'wish', text: 'For her birthday and Christmas she wished for two things: a friend, and a LOL.', cues: [{ w: 'wished', act: 'wished' }, { w: 'two', act: 'two' }, { w: 'friend', act: 'friend' }, { w: 'lol', act: 'lol' }] },
    { scene: 'newKid', text: 'One day, a new kid came to school. Her name was Love.', cues: [{ w: 'new', act: 'door' }, { w: 'love', act: 'love' }] },
    { scene: 'allRed', text: 'She was very pretty, and she was all red: light red, dark red, and every kind of red in between.', cues: [{ w: 'pretty', act: 'pretty' }, { w: 'light', act: 'light' }, { w: 'dark', act: 'dark' }, { w: 'between', act: 'between' }] },
    { scene: 'greet', mood: 'jolly', text: 'Serenity greeted her very happily. She thought they could be best friends!', cues: [{ w: 'greeted', act: 'greeted' }, { w: 'best', act: 'best' }] },
    { scene: 'shy', mood: 'shy', text: 'But Love was shy, just like Serenity, and she had no friends to play with.', cues: [{ w: 'shy', act: 'shy' }, { w: 'friends', act: 'friends' }] },
    { scene: 'tree', mood: 'shy', text: 'She always sat by herself with a book next to a large tree.', cues: [{ w: 'herself', act: 'herself' }, { w: 'tree', act: 'tree' }] },
    { scene: 'walkUp', text: 'Then one day at school, Serenity saw Love reading under the tree. She walked right up to her.', cues: [{ w: 'saw', act: 'saw' }, { w: 'walked', act: 'walked' }] },
    { scene: 'ask', text: '"Love," said Serenity, "do you want to be my best friend?"', cues: [{ w: 'love', act: 'love' }, { w: 'best', act: 'best' }, { w: 'friend', act: 'friend' }] },
    {
      scene: 'yes', mood: 'joy', transition: 'sparkle',
      text: '"Yes!" said Love. "I would love to be your best friend!"',
      cues: [{ w: 'yes', act: 'yes' }, { w: 'love', n: 2, act: 'hearts' }, { w: 'best', act: 'come' }, { w: 'friend', act: 'hug' }, { at: 'end', act: 'happy' }]
    },
    { scene: 'habit', mood: 'jolly', text: 'So they went out for lunch at The Habit.', cues: [{ w: 'lunch', act: 'wave' }, { w: 'habit', act: 'habit' }, { at: 'end', act: 'inside' }] },
    { scene: 'burgers', mood: 'jolly', text: 'They ordered two Charburgers and two tropical juices.', cues: [{ w: 'ordered', act: 'ordered' }, { w: 'charburgers', act: 'burgers' }, { w: 'juices', act: 'juices' }] },
    { scene: 'sides', mood: 'jolly', text: 'They also got french fries, onion rings, and green beans.', cues: [{ w: 'fries', act: 'fries' }, { w: 'rings', act: 'rings' }, { w: 'beans', act: 'beans' }] },
    { scene: 'bff', mood: 'joy', text: 'They had a wonderful lunch, and they became best BFFs forever!', cues: [{ w: 'wonderful', act: 'wonderful' }, { w: 'bffs', act: 'bffs' }, { w: 'forever', act: 'forever' }] },
    { scene: 'theEnd', title: true, mood: 'calm', transition: 'glow', text: 'The End!', cues: [{ w: 'end', act: 'end' }] }
  ]
};

import { WordChallenge, HomophoneChallenge, Difficulty } from '../types';

// --- DATA STRUCTURES ---

interface WordStats {
  word: string;
  attempts: number;
  correct: number;
  streak: number;
  lastSeen: number; // Timestamp
}

const STORAGE_KEY = 'spellbound_learning_progress';

// --- COMPRESSED DICTIONARY DATA ---
// FORMAT: word|definition|sentence
// SEPARATOR: ^

const DATA_EASY = `
apple|A round fruit with red or green skin.|I ate a crisp red apple for lunch.^
ant|A small insect that lives in colonies.|The ant carried a crumb back to the hill.^
ball|A round object used in games.|He kicked the soccer ball across the field.^
bear|A large mammal with thick fur.|The brown bear slept in the cave.^
bed|A piece of furniture for sleeping.|I was tired so I went to bed early.^
bird|An animal with feathers and wings.|The blue bird sang a pretty song.^
boat|A small vessel for traveling on water.|We rowed the boat across the lake.^
book|A set of pages with writing or pictures.|She read a book about dinosaurs.^
box|A container with flat sides.|The cat sat inside the cardboard box.^
boy|A male child.|The boy played with his toy car.^
bread|Food made of flour, water, and yeast.|Mom baked fresh bread this morning.^
bus|A large motor vehicle for carrying passengers.|We take the yellow bus to school.^
cake|A sweet baked food.|The birthday cake had chocolate frosting.^
car|A road vehicle with four wheels.|Dad washed the car on Sunday.^
cat|A small domesticated carnivorous mammal.|The cat purred when I petted it.^
chair|A seat with a back and four legs.|Please sit on your chair.^
class|A group of students.|The whole class went on a field trip.^
clock|A device for measuring time.|The clock on the wall said noon.^
coat|An outer garment worn outdoors.|Put on your coat, it's cold outside.^
cow|A farm animal kept for milk or meat.|The cow chewed grass in the field.^
cup|A small bowl-shaped container for drinking.|I drank milk from a plastic cup.^
dad|Informal term for father.|My dad taught me how to ride a bike.^
desk|A table used for working or studying.|She sat at her desk to do homework.^
dog|A domesticated carnivorous mammal.|The dog wagged its tail happily.^
door|A barrier used to close an opening.|Please close the door behind you.^
duck|A waterbird with a broad blunt bill.|The duck swam in the pond.^
ear|The organ of hearing.|He whispered a secret in my ear.^
egg|An oval object laid by a bird.|I had a fried egg for breakfast.^
eye|The organ of sight.|She closed one eye and looked through the telescope.^
face|The front part of a person's head.|He washed his face with warm water.^
farm|Land used for growing crops or keeping animals.|The farm has chickens and pigs.^
fish|A limbless cold-blooded vertebrate animal with gills.|The gold fish swam in the bowl.^
flag|A piece of cloth used as a symbol.|The American flag has stars and stripes.^
flower|The seed-bearing part of a plant.|He picked a yellow flower for his mom.^
food|Any nutritious substance that people eat.|We bought lots of food at the grocery store.^
foot|The lower extremity of the leg.|I hurt my foot while running.^
frog|A tailless amphibian with long hind legs.|The green frog jumped on a lily pad.^
game|An activity one engages in for amusement.|We played a board game together.^
girl|A female child.|The girl braided her hair.^
glass|A hard, brittle substance, usually transparent.|Be careful not to break the glass.^
hand|The end part of a person's arm.|Raise your hand if you know the answer.^
hat|A covering for the head.|He wore a baseball hat to the game.^
head|The upper part of the human body.|She nodded her head yes.^
home|The place where one lives.|It feels good to be back home.^
horse|A large plant-eating domesticated mammal.|She rode a white horse at the fair.^
house|A building for human habitation.|Our house has a red door.^
kite|A toy that flies in the wind.|We flew a kite on the windy beach.^
lamp|A device for giving light.|Turn on the lamp so you can see.^
leg|Each of the limbs on which a person walks.|He balanced on one leg.^
lion|A large cat that lives in prides.|The lion roared loudly at the zoo.^
love|An intense feeling of deep affection.|I love my family very much.^
man|An adult human male.|The tall man helped us reach the shelf.^
map|A diagrammatic representation of an area.|We used a map to find the treasure.^
milk|A white liquid produced by mammals.|Drink your milk to get strong bones.^
mom|Informal term for mother.|My mom reads me a story every night.^
moon|The natural satellite of the earth.|The full moon lit up the night sky.^
mouse|A small rodent.|The tiny mouse scurried under the sofa.^
name|A word or set of words by which a person is known.|My dog's name is Rover.^
nest|A structure built by birds to lay eggs in.|The bird built a nest in the tree.^
nose|The part of the face used for smelling.|The dog has a cold wet nose.^
pen|An instrument for writing with ink.|Please sign your name with a pen.^
pet|A domestic animal kept for companionship.|My favorite pet is my hamster.^
pig|An omnivorous domesticated hoofed mammal.|The pig rolled in the mud.^
play|Engage in activity for enjoyment.|We like to play tag at recess.^
rain|Moisture condensed from the atmosphere.|Take an umbrella in case of rain.^
red|The color of blood or fire.|She wore a bright red dress.^
ring|A small circular band worn on a finger.|She wore a gold ring on her hand.^
road|A wide way leading from one place to another.|Look both ways before crossing the road.^
room|A part or division of a building.|My room is painted blue.^
run|Move at a speed faster than a walk.|I can run very fast.^
school|An institution for educating children.|I walk to school with my friends.^
sea|The expanse of salt water.|The ship sailed across the sea.^
ship|A large boat for transporting people or goods.|The pirate ship had big sails.^
shoe|A covering for the foot.|I tied my shoe lace.^
shop|A building where goods are sold.|We went to the candy shop.^
sit|Adopt or be in a position in which one's weight is supported by one's buttocks.|Please sit down on the rug.^
sky|The region of the atmosphere and outer space.|The sky is very blue today.^
sleep|A condition of body and mind such as that which typically recurs for several hours every night.|I need to sleep to get energy.^
snow|Atmospheric water vapor frozen into ice crystals.|We made a snowman in the snow.^
sock|A garment for the foot and lower part of the leg.|I lost one white sock.^
star|A fixed luminous point in the night sky.|Make a wish upon a star.^
sun|The star around which the earth orbits.|The sun warms the earth.^
time|The indefinite continued progress of existence.|What time is it?^
toy|An object for a child to play with.|He shared his toy truck.^
tree|A woody perennial plant.|The leaves fell off the tree.^
van|A medium-sized motor vehicle.|We packed the van for our trip.^
water|A colorless, transparent, odorless liquid.|Drink plenty of water every day.^
way|A method, style, or manner of doing something.|Do it this way.^
wind|The perceptible natural movement of the air.|The wind blew the leaves away.^
work|Activity involving mental or physical effort.|My dad goes to work every day.^
zoo|An establishment which maintains a collection of wild animals.|We saw a zebra at the zoo.
`;

const DATA_MEDIUM = `
able|Having the power, skill, means, or opportunity to do something.|She is able to run very fast.^
above|In extended space over and not touching.|The bird flew above the trees.^
act|Take action; do something.|You must act quickly to win.^
add|Join something to something else so as to increase the size, number, or amount.|Add sugar to the tea.^
afraid|Feeling fear or anxiety.|Don't be afraid of the dark.^
after|In the time following (an event or another period of time).|We can play after dinner.^
again|Another time; once more.|Please say that again.^
age|The length of time that a person has lived.|What age will you be next year?^
ago|Before the present time.|Dinosaurs lived a long time ago.^
agree|Have the same opinion about something.|I agree with your idea.^
air|The invisible gaseous substance surrounding the earth.|Fresh air is good for you.^
all|The whole quantity or extent of a particular group or thing.|We ate all the cookies.^
allow|Give (someone) permission to do something.|My parents allow me to stay up late on Fridays.^
also|In addition; too.|I like apples and I also like pears.^
always|At all times; on all occasions.|She always brushes her teeth.^
among|Surrounded by; in the company of.|The wolf hid among the trees.^
animal|A living organism that feeds on organic matter.|A tiger is a wild animal.^
answer|A thing said, written, or done to deal with or as a reaction to a question.|Do you know the answer?^
appear|Come into sight; become visible.|The sun will appear soon.^
area|A region or part of a town, a country, or the world.|This area is good for farming.^
arrive|Reach a place at the end of a journey or a stage in a journey.|We will arrive at noon.^
art|The expression or application of human creative skill and imagination.|We made a collage in art class.^
ask|Say something in order to obtain an answer or some information.|Ask the teacher for help.^
baby|A very young child.|The baby was crying.^
back|The rear surface of the human body.|My back hurts from lifting boxes.^
bad|Of poor quality or a low standard.|Stealing is a bad thing to do.^
baker|A person who makes bread and cakes.|The baker made fresh rolls.^
base|The lowest part or edge of something.|The lamp has a heavy base.^
beat|Strike (a person or an animal) repeatedly and violently.|The drummer played a fast beat.^
become|Begin to be.|The caterpillar will become a butterfly.^
before|During the period of time preceding.|Wash your hands before eating.^
begin|Start; perform or undergo the first part of (an action or activity).|Let the games begin!^
behind|At or to the far side of (something), typically so as to be hidden by it.|The cat hid behind the sofa.^
best|Of the most excellent, effective, or desirable type or quality.|She is my best friend.^
better|Of a more excellent or effective type or quality than another or others.|I feel better today.^
big|Of considerable size, extent, or intensity.|That is a very big truck.^
black|Of the very darkest color.|The night sky was black.^
body|The physical structure of a person or an animal.|Exercise is good for your body.^
bone|Any of the pieces of hard, whitish tissue making up the skeleton.|The dog chewed on a bone.^
both|Used to refer to two people or things.|Both of my shoes are muddy.^
break|Separate or cause to separate into pieces as a result of a blow, shock, or strain.|Don't break the vase.^
bring|Take or go with (someone or something) to a place.|Please bring your book to class.^
brother|A man or boy in relation to other sons and daughters of his parents.|My brother is older than me.^
build|Construct (something) by putting parts or material together.|We will build a fort.^
busy|Having a great deal to do.|The bee is always busy.^
buy|Obtain in exchange for payment.|I want to buy a new toy.^
call|Cry out to (someone) in order to summon them or attract their attention.|Call me when you get home.^
camp|A place with temporary accommodations of huts, tents, or other structures.|We went to summer camp.^
capital|The most important city or town of a country or region.|Paris is the capital of France.^
captain|The person in command of a ship.|The captain steered the boat.^
carry|Support and move (someone or something) from one place to another.|Can you help me carry this box?^
catch|Intercept and hold (something which has been thrown, propelled, or dropped).|Try to catch the ball.^
cause|A person or thing that gives rise to an action, phenomenon, or condition.|What was the cause of the fire?^
center|The middle point of a circle or sphere.|Stand in the center of the room.^
change|Make or become different.|Caterpillars change into butterflies.^
check|Examine (something) in order to determine its accuracy, quality, or condition.|Did you check your answers?^
chief|A leader or ruler of a people or clan.|The fire chief directed the trucks.^
child|A young human being below the age of puberty.|Every child deserves to play.^
choose|Pick out or select (someone or something) as being the best or most appropriate.|Choose the color you like best.^
circle|A round plane figure whose boundary consists of points equidistant from the center.|Draw a perfect circle.^
city|A large town.|New York is a big city.^
clean|Free from dirt, marks, or stains.|Keep your room clean.^
clear|Transparent; easy to see through.|The water was crystal clear.^
climb|Go or come up (a slope, incline, or staircase).|Monkeys climb trees.^
close|A short distance away or apart in space or time.|The store is close to my house.^
cloud|A visible mass of condensed water vapor floating in the atmosphere.|It looks like a rain cloud.^
coast|The part of the land near the sea; the edge of the land.|We drove along the coast.^
cold|Of or at a low or relatively low temperature.|Ice cream is very cold.^
color|The property possessed by an object of producing different sensations on the eye.|Red is my favorite color.^
come|Move or travel toward or into a place thought of as near or familiar to the speaker.|Come here, please.^
common|Occurring, found, or done often; prevalent.|Sparrows are common birds.^
contain|Have or hold (someone or something) within.|This box contains toys.^
cool|Of or at a fairly low temperature.|The cool breeze felt nice.^
copy|A thing made to be similar or identical to another.|Make a copy of this paper.^
corn|A North American cereal plant.|We ate corn on the cob.^
corner|A place or angle where two or more sides or edges meet.|Stand in the corner.^
correct|Free from error; in accordance with fact or truth.|Your answer is correct.^
cost|Of an object or action require the payment of (a specified sum of money).|How much does it cost?^
count|Determine the total number of (a collection of items).|Can you count to ten?^
country|A nation with its own government, occupying a particular territory.|Japan is a beautiful country.^
course|The route or direction followed by a ship, aircraft, road, or river.|The ship changed course.^
cover|Put something on top of or in front of (something) in order to protect or conceal it.|Cover the pot with a lid.^
create|Bring (something) into existence.|Artists create beautiful paintings.^
crop|A cultivated plant that is grown as food.|Wheat is a major crop.^
cross|Go or extend across or to the other side of.|Cross the street carefully.^
crowd|A large number of people gathered together.|A crowd gathered to watch.^
cry|Shed tears, especially as an expression of distress or pain.|Don't cry over spilled milk.^
cut|Make an opening, incision, or wound in (something) with a sharp-edged tool or object.|Cut the paper with scissors.^
dance|Move rhythmically to music.|Do you like to dance?^
dark|With little or no light.|It gets dark at night.^
day|A period of twenty-four hours.|Have a nice day.^
dead|No longer alive.|The flowers are dead.^
deal|Distribute (cards) in an orderly rotation to players.|Deal the cards for the game.^
dear|Regarded with deep affection.|She is a dear friend.^
death|The action or fact of dying or being killed.|The death of the king was sad.^
decide|Come to a resolution in the mind as a result of consideration.|I cannot decide what to eat.^
deep|Extending far down from the top or surface.|The ocean is very deep.^
desert|A waterless, desolate area of land with little or no vegetation.|Camels live in the desert.^
design|A plan or drawing produced to show the look and function or workings of a building, garment, or other object.|She drew a design for a dress.^
dictionary|A book or electronic resource that lists the words of a language.|Look up the word in the dictionary.^
die|Stop living.|Flowers die without water.^
diff|Difference.|What is the diff?^
different|Not the same as another or each other.|My shoes are different from yours.^
direct|Extending or moving from one place to another by the shortest way.|This is the direct route.^
do|Perform an action.|Do your homework.^
doctor|A qualified practitioner of medicine.|The doctor checked my heart.^
does|Third person singular present of do.|She does her work well.^
dollar|The basic monetary unit of the US.|It costs one dollar.^
done|Completed or finished.|I am done with my work.^
dont|Do not.|Dont go in there.^
door|A hinged, sliding, or revolving barrier at the entrance to a building, room, or vehicle.|Open the door.^
double|Consisting of two equal, identical, or similar parts or things.|A double scoop of ice cream.^
down|Toward or in a lower place or position.|Sit down.^
draw|Produce (a picture or diagram) by making lines and marks.|Draw a picture of a house.^
dream|A series of thoughts, images, and sensations occurring in a person's mind during sleep.|I had a dream about flying.^
dress|Put on one's clothes.|Dress warmly for the snow.^
drink|Take (a liquid) into the mouth and swallow.|Drink your water.^
drive|Operate and control the direction and speed of a motor vehicle.|Can you drive a car?^
drop|Let or make (something) fall vertically.|Don't drop the egg.^
dry|Free from moisture or liquid; not wet or moist.|The towel is dry.^
during|Throughout the course or duration of (a period of time).|Be quiet during the movie.^
each|Used to refer to every one of two or more people or things.|Each student has a book.^
early|Happening or done before the usual or expected time.|Wake up early for school.^
earth|The planet on which we live.|The earth orbits the sun.^
ease|Absence of difficulty or effort.|He lifted the box with ease.^
east|The direction toward the point of the horizon where the sun rises.|The sun rises in the east.^
eat|Put (food) into the mouth and chew and swallow it.|Eat your vegetables.^
edge|The outside limit of an object, area, or surface.|Don't stand on the edge.^
effect|A change which is a result or consequence of an action or other cause.|The effect of the medicine was fast.^
egg|An oval or round object laid by a female bird, reptile, fish, or invertebrate.|The hen laid an egg.^
eight|Equivalent to the product of two and four.|An octopus has eight legs.^
either|Used before the first of two (or occasionally more) alternatives.|You can have either cake or pie.^
electric|Of, worked by, charged with, or producing electricity.|An electric car runs on batteries.^
element|A part or aspect of something abstract, especially one that is essential or characteristic.|Wind is a natural element.^
else|In addition; besides.|What else do you need?^
end|A final part of something, especially a period of time, an activity, or a story.|The end of the movie was sad.^
enemy|A person who is actively opposed or hostile to someone or something.|The hero fought the enemy.^
energy|The strength and vitality required for sustained physical or mental activity.|Sugar gives you energy.^
engine|A machine with moving parts that converts power into motion.|The car engine is loud.^
enough|As much or as many as required.|I have enough money.^
enter|Come or go into (a place).|Enter the room quietly.^
equal|Being the same in quantity, size, degree, or value.|All men are created equal.^
especially|Used to single out one person, thing, or situation over all others.|I like fruit, especially apples.^
even|Flat and smooth.|The floor is very even.^
evening|The period of time at the end of the day.|We eat dinner in the evening.^
event|A thing that happens, especially one of importance.|The concert was a big event.^
ever|At any time.|Have you ever seen a whale?^
every|Used to refer to all the individual members of a set without exception.|Every student passed the test.^
exact|Not approximated in any way; precise.|Give me the exact change.^
example|A thing characteristic of its kind or illustrating a general rule.|This is a good example.^
except|Not including; other than.|Everyone went except me.^
excite|Cause strong feelings of enthusiasm and eagerness in (someone).|The news will excite them.^
exercise|Activity requiring physical effort.|Walking is good exercise.^
expect|Regard (something) as likely to happen.|I expect it to rain.^
experience|Practical contact with and observation of facts or events.|Travel gives you experience.^
experiment|A scientific procedure undertaken to make a discovery.|We did a science experiment.^
eye|The organ of sight.|He has a blue eye.^
face|The front part of a person's head.|Wash your face.^
fact|A thing that is known or proved to be true.|It is a fact that the earth is round.^
fair|In accordance with the rules or standards; legitimate.|That rule is not fair.^
fall|Move downward, typically rapidly and freely without control.|Leaves fall in autumn.^
family|A group consisting of parents and children living together in a household.|I love my family.^
famous|Known about by many people.|He is a famous actor.^
far|At, to, or by a great distance.|The moon is far away.^
farm|An area of land and its buildings used for growing crops and rearing animals.|Cows live on a farm.^
fast|Moving or capable of moving at high speed.|Cheetahs are very fast.^
fat|A natural oily or greasy substance occurring in animal bodies.|Butter is mostly fat.^
father|A man in relation to his natural child or children.|My father is at work.^
fear|An unpleasant emotion caused by the belief that someone or something is dangerous.|He has a fear of spiders.^
feed|Give food to.|Feed the dog.^
feel|Be aware of (a person or object) through touching or being touched.|I feel happy today.^
feet|Plural of foot.|My feet are tired.^
fell|Past of fall.|He fell down the stairs.^
felt|Past and past participle of feel.|I felt sad yesterday.^
few|A small number of.|I have a few coins.^
field|An area of open land, especially one planted with crops or pasture.|The cows are in the field.^
fig|A soft pear-shaped fruit with sweet dark flesh and many small seeds.|He ate a dried fig.^
fight|Take part in a violent struggle involving the exchange of physical blows or the use of weapons.|Don't fight with your brother.^
figure|A number, especially one that forms part of official statistics.|Calculate the final figure.^
fill|Put someone or something into (a space or container) so that it is completely or almost completely full.|Fill the glass with water.^
final|Coming at the end of a series.|This is the final level.^
find|Discover or perceive by chance or unexpectedly.|Did you find your keys?^
fine|Of high quality.|That is a fine painting.^
finger|Each of the four slender jointed parts attached to either hand.|He pointed with his finger.^
finish|Bring (a task or activity) to an end; complete.|Finish your dinner.^
fire|Combustion or burning, in which substances combine chemically with oxygen from the air and typically give out bright light, heat, and smoke.|The fire is hot.^
first|Coming before all others in time or order.|He finished in first place.^
fish|A limbless cold-blooded vertebrate animal with gills and fins and living wholly in water.|Fish live in the ocean.^
fit|Of a suitable quality, standard, or type to meet the required purpose.|The shoes fit perfectly.^
five|Equivalent to the sum of two and three; one more than four.|I have five fingers on one hand.^
flat|Smooth and even; without marked lumps or indentations.|The table has a flat surface.^
floor|The lower surface of a room, on which one may walk.|Sit on the floor.^
flow|Move along or out steadily and continuously in a current or stream.|Rivers flow to the sea.^
flower|The seed-bearing part of a plant.|The rose is a beautiful flower.^
fly|Move through the air using wings.|Birds fly in the sky.^
follow|Go or move behind or in the same direction as.|Follow the leader.^
food|Any nutritious substance that people or animals eat or drink or that plants absorb in order to maintain life and growth.|We need food to live.^
foot|The lower extremity of the leg below the ankle, on which a person stands or walks.|I stubbed my foot.^
for|Used as a function word to indicate purpose.|This gift is for you.^
force|Strength or energy as an attribute of physical action or movement.|Use force to open the jar.^
forest|A large area covered chiefly with trees and undergrowth.|Bears live in the forest.^
form|The visible shape or configuration of something.|Clouds form in the sky.^
forward|In the direction that one is facing or traveling.|Move forward one step.^
found|Past and past participle of find.|I found a dollar.^
four|Equivalent to the product of two and two; one more than three.|A square has four sides.^
fraction|A numerical quantity that is not a whole number.|Half is a fraction.^
free|Not under the control or in the power of another; able to act or be done as one wishes.|I am free this weekend.^
fresh|Recently made or obtained; not canned, frozen, or otherwise preserved.|I like fresh fruit.^
friend|A person whom one knows and with whom one has a bond of mutual affection.|She is my best friend.^
from|Indicating the point in space at which a journey, motion, or action starts.|I am from New York.^
front|The side or part of an object that presents itself to view or that is normally seen or used first.|The front of the house is white.^
fruit|The sweet and fleshy product of a tree or other plant that contains seed and can be eaten as food.|Apple is a fruit.^
full|Containing or holding as much or as many as possible; having no empty space.|The glass is full.^
fun|Enjoyment, amusement, or lighthearted pleasure.|We had fun at the party.^
game|A form of play or sport, especially a competitive one played according to rules and decided by skill, strength, or luck.|Let's play a game.^
garden|A piece of ground, often near a house, used for growing flowers, fruit, or vegetables.|We grow carrots in the garden.^
gas|An air-like fluid substance which expands freely to fill any space available.|Air is a gas.^
gather|Come together; assemble or accumulate.|Gather the papers together.^
gave|Past of give.|He gave me a gift.^
general|Affecting or concerning all or most people, places, or things; widespread.|It was a general idea.^
gentle|Moderate in action, effect, or degree; not harsh or severe.|Be gentle with the baby.^
get|Come to have or hold (something); receive.|Did you get my message?^
girl|A female child.|The girl is playing.^
give|Freely transfer the possession of (something) to (someone); hand over.|Give me the book.^
glad|Pleased; delighted.|I am glad you came.^
glass|A hard, brittle substance, typically transparent or translucent.|The window is made of glass.^
go|Move from one place to another; travel.|Let's go to the park.^
goat|A hardy domesticated ruminant animal that has backward-curving horns and (in the male) a beard.|The goat ate the tin can.^
gold|A yellow precious metal.|The ring is made of gold.^
gone|Past participle of go.|He has gone home.^
good|To be desired or approved of.|You did a good job.^
got|Past of get.|I got a new bike.^
govern|Conduct the policy, actions, and affairs of (a state, organization, or people).|Presidents govern the country.^
grand|Magnificent and imposing in appearance, size, or style.|The castle is grand.^
grass|Vegetation consisting of typically short plants with long, narrow leaves, growing wild or cultivated on lawns and pasture.|The grass is green.^
great|Of an extent, amount, or intensity considerably above the normal or average.|That is a great idea.^
green|The color between blue and yellow in the spectrum; colored like grass or emeralds.|Trees are green in summer.^
grew|Past of grow.|The plant grew tall.^
ground|The solid surface of the earth.|Sit on the ground.^
group|A number of people or things that are located, gathered, or classed together.|Work in a group.^
grow|Become larger or greater over a period of time; increase.|Flowers grow in the sun.^
guess|Estimate or suppose (something) without sufficient information to be sure of being correct.|Can you guess the number?^
guide|A person who advises or shows the way to others.|The guide led us through the museum.^
gun|A weapon incorporating a metal tube from which bullets, shells, or other missiles are propelled by explosive force.|Police officers carry a gun.^
hair|Any of the fine threadlike strands growing from the skin of humans, mammals, and some other animals.|Brush your hair.^
half|Either of two equal or corresponding parts into which something is or can be divided.|I ate half the sandwich.^
hall|The room or space just inside the front entrance of a house or flat.|Hang your coat in the hall.^
hand|The end part of a person's arm beyond the wrist, including the palm, fingers, and thumb.|Hold my hand.^
happen|Take place; occur.|What will happen next?^
happy|Feeling or showing pleasure or contentment.|I am happy to see you.^
hard|Solid, firm, and rigid; not easily broken, bent, or pierced.|The rock is hard.^
has|Third person singular present of have.|He has a dog.^
hat|A shaped covering for the head worn for warmth, as a fashion item, or as part of a uniform.|Put on your hat.^
have|Possess, own, or hold.|I have a bike.^
he|Used to refer to a man, boy, or male animal previously mentioned or easily identified.|He is my friend.^
head|The upper part of the human body.|Nod your head.^
hear|Perceive with the ear the sound made by (someone or something).|I hear a noise.^
heard|Past and past participle of hear.|I heard a song.^
heart|A hollow muscular organ that pumps the blood through the circulatory system by rhythmic contraction and dilation.|My heart beats fast.^
heat|The quality of being hot; high temperature.|The heat of the sun.^
heavy|Of great weight; difficult to lift or move.|The box is heavy.^
held|Past and past participle of hold.|She held the baby.^
help|Make it easier for (someone) to do something by offering one's services or resources.|Can you help me?^
her|Used as the object of a verb or preposition to refer to a female person or animal previously mentioned or easily identified.|Give it to her.^
here|In, at, or to this place or position.|Come here.^
high|Of great vertical extent.|The mountain is high.^
hill|A naturally raised area of land, not as high or craggy as a mountain.|We rolled down the hill.^
him|Used as the object of a verb or preposition to refer to a male person or animal previously mentioned or easily identified.|I saw him yesterday.^
his|Belonging to or associated with a male person or animal previously mentioned or easily identified.|That is his book.^
history|The study of past events, particularly in human affairs.|We study history in school.^
hit|Bring one's hand or a tool or weapon into contact with (someone or something) quickly and forcefully.|Don't hit your sister.^
hold|Grasp, carry, or support with one's arms or hands.|Hold the door open.^
hole|A hollow place in a solid body or surface.|There is a hole in my sock.^
holiday|A day of festivity or recreation when no work is done.|Christmas is a holiday.^
home|The place where one lives permanently, especially as a member of a family or household.|I want to go home.^
hope|A feeling of expectation and desire for a certain thing to happen.|I hope it rains.^
horse|A large plant-eating domesticated mammal.|Ride the horse.^
hot|Having a high degree of heat or a high temperature.|The soup is hot.^
hour|A period of time equal to sixty minutes.|It takes an hour to get there.^
house|A building for human habitation.|We live in a white house.^
how|In what way or manner; by what means.|How do you do that?^
huge|Extremely large; enormous.|The elephant is huge.^
human|Relating to or characteristic of people or human beings.|We are human beings.^
hundred|The number equivalent to the product of ten and ten; ten years greater than ninety.|I have a hundred pennies.^
hunt|Pursue and kill (a wild animal) for sport or food.|Lions hunt for food.^
hurry|Move or act with great haste.|Hurry up or we will be late.^
hurt|Cause physical pain or injury to.|Did you hurt yourself?^
husband|A married man considered in relation to his spouse.|He is her husband.^
ice|Frozen water, a brittle, transparent crystalline solid.|Put ice in my drink.^
idea|A thought or suggestion as to a possible course of action.|I have a great idea.^
if|Introducing a conditional clause.|If it rains, we stay inside.^
imagine|Form a mental image or concept of.|Imagine a world without war.^
in|Expressing the situation of something that is or appears to be enclosed or surrounded by something else.|The cat is in the box.^
inch|A unit of linear measure equal to one twelfth of a foot.|The worm is one inch long.^
include|Comprise or contain as part of a whole.|Does the price include tax?^
increase|Become or make greater in size, amount, intensity, or degree.|Increase the volume.^
indicate|Point out; show.|The sign will indicate the way.^
industry|Economic activity concerned with the processing of raw materials and manufacture of goods in factories.|The car industry is big.^
insect|A small arthropod animal that has six legs and generally one or two pairs of wings.|A fly is an insect.^
instant|Happening or coming immediately.|We need instant results.^
instrument|A tool or implement, especially one for delicate or scientific work.|The piano is an instrument.^
interest|The state of wanting to know or learn about something or someone.|I have an interest in art.^
invent|Create or design (something that has not existed before); be the originator of.|Who did invent the telephone?^
iron|A strong, hard magnetic silvery-gray metal.|The gate is made of iron.^
is|Third person singular present of be.|He is happy.^
island|A piece of land surrounded by water.|We lived on an island.^
it|Used to refer to a thing previously mentioned or easily identified.|Give it to me.^
job|A paid position of regular employment.|He has a new job.^
join|Link; connect.|Join the two ropes together.^
joy|A feeling of great pleasure and happiness.|The baby brought joy to the family.^
jump|Push oneself off a surface and into the air by using the muscles in one's legs and feet.|Jump over the puddle.^
just|Based on or behaving according to what is morally right and fair.|That decision was just.^
keep|Have or retain possession of.|Keep the change.^
kept|Past and past participle of keep.|He kept his promise.^
key|A small metal instrument specially cut to fit into a lock and move its bolt.|I lost my car key.^
kill|Cause the death of (a person, animal, or other living thing).|Smoking can kill you.^
kind|A group of people or things having similar characteristics.|What kind of ice cream do you like?^
king|The male ruler of an independent state, especially one who inherits the position by right of birth.|The king wore a crown.^
knew|Past of know.|I knew the answer.^
know|Be aware of through observation, inquiry, or information.|I know your name.^
lady|A woman of superior social position, especially one of noble birth.|A nice lady helped me.^
lake|A large body of water surrounded by land.|We swam in the lake.^
land|The part of the earth's surface that is not covered by water, as opposed to the sea or the air.|The plane will land soon.^
language|The method of human communication, either spoken or written.|English is a language.^
large|Of considerable or relatively great size, extent, or capacity.|It was a large box.^
last|Coming after all others in time or order; final.|This is the last cookie.^
late|Doing something or taking place after the expected, proper, or usual time.|Don't be late for school.^
laugh|Make the spontaneous sounds and movements of the face and body that are the instinctive expressions of lively amusement.|The joke made me laugh.^
law|The system of rules which a particular country or community recognizes.|Obey the law.^
lay|Put down, especially gently or carefully.|Lay the book on the table.^
lead|Cause (a person or animal) to go with one by holding them by the hand.|Lead the way.^
learn|Gain or acquire knowledge of or skill in (something) by study, experience, or being taught.|I want to learn Spanish.^
least|Smallest in amount, extent, or significance.|That is the least I can do.^
leave|Go away from.|Leave the room.^
led|Past and past participle of lead.|He led the team to victory.^
left|Past and past participle of leave.|He left the party early.^
leg|Each of the limbs on which a person or animal walks and stands.|My leg hurts.^
length|The measurement or extent of something from end to end.|Measure the length of the table.^
less|A smaller amount of; not as much.|Eat less sugar.^
let|Not prevent or forbid; allow.|Let me go.^
letter|A character representing one or more of the sounds used in speech; any of the symbols of an alphabet.|A is the first letter.^
level|A horizontal plane or line with respect to the distance above or below a given point.|We are on the top level.^
lie|Be in or assume a horizontal or resting position on a supporting surface.|Lie down on the bed.^
life|The condition that distinguishes animals and plants from inorganic matter.|Life is beautiful.^
lift|Raise to a higher position or level.|Lift the box.^
light|The natural agent that stimulates sight and makes things visible.|Turn on the light.^
like|Having the same characteristics or qualities as; similar to.|I like ice cream.^
line|A long, narrow mark or band.|Draw a straight line.^
liquid|A substance that flows freely but is of constant volume.|Water is a liquid.^
list|A number of connected items or names written or printed consecutively.|Make a grocery list.^
listen|Give one's attention to a sound.|Listen to the music.^
little|Small in size, amount, or degree.|I have a little dog.^
live|Remain alive.|I want to live forever.^
locate|Discover the exact place or position of.|Can you locate the city on the map?^
log|A part of the trunk or a large branch of a tree that has been cut off.|He sat on a log.^
lone|Having no companions; solitary or single.|A lone wolf howled.^
long|Measuring a great distance from end to end.|She has long hair.^
look|Direct one's gaze toward someone or something or in a specified direction.|Look at the sky.^
loose|Not firmly or tightly fixed in place; detached or able to be detached.|My tooth is loose.^
lost|Past and past participle of lose.|I lost my keys.^
lot|A large number or amount; a great deal.|I have a lot of friends.^
loud|Producing or capable of producing much noise; easily audible.|The music is too loud.^
love|An intense feeling of deep affection.|I love you.^
low|Of less than average height from top to bottom or to the top from the ground.|The fence is low.^
machine|An apparatus using or applying mechanical power and having several parts.|The washing machine is broken.^
made|Past and past participle of make.|I made a cake.^
magnet|A piece of iron that has its component atoms so ordered that the material exhibits properties of magnetism.|The magnet stuck to the fridge.^
main|Chief in size or importance.|This is the main road.^
major|Important, serious, or significant.|It was a major problem.^
make|Form (something) by putting parts together or combining substances; construct; create.|Let's make a fort.^
man|An adult human male.|The man is tall.^
many|A large number of.|Many people were there.^
map|A diagrammatic representation of an area of land or sea.|Read the map.^
mark|A small area on a surface having a different color from its surroundings.|There is a mark on the wall.^
market|A regular gathering of people for the purchase and sale of provisions, livestock, and other commodities.|We bought fruit at the market.^
mass|A coherent, typically large body of matter with no definite shape.|A mass of rock.^
master|A man who has people working for him, especially servants or slaves.|He is the master of the house.^
match|Correspond or cause to correspond in some essential respect; make or be harmonious.|These socks match.^
material|The matter from which a thing is or can be made.|Wood is a natural material.^
matter|Physical substance in general, as distinct from mind and spirit.|It doesn't matter.^
may|Expressing possibility.|It may rain today.^
me|Used by a speaker to refer to himself or herself as the object of a verb or preposition.|Give it to me.^
mean|Intend to convey, indicate, or refer to (a particular thing or notion); signify.|What does this word mean?^
measure|Ascertain the size, amount, or degree of (something) by using an instrument or device marked in standard units.|Measure the wall.^
meat|The flesh of an animal (especially a mammal) as food.|We ate meat for dinner.^
meet|Come into the presence or company of (someone) by chance or arrangement.|Let's meet at the park.^
melody|A sequence of single notes that is musically satisfying.|The song has a pretty melody.^
men|Plural of man.|The men are working.^
metal|A solid material that is typically hard, shiny, malleable, fusible, and ductile.|Gold is a metal.^
method|A particular form of procedure for accomplishing or approaching something.|This is a good method.^
middle|At an equal distance from the extremities of something; central.|Sit in the middle.^
might|Past of may.|It might rain.^
mile|A unit of linear measure equal to 5,280 feet, or 1,760 yards.|Run one mile.^
milk|A white fluid rich in fat and protein.|Drink your milk.^
million|The number equivalent to the product of a thousand and a thousand.|A million dollars.^
mind|The element of a person that enables them to be aware of the world and their experiences.|Use your mind.^
mine|Used to refer to a thing or things belonging to or associated with the speaker.|That book is mine.^
minute|A period of time equal to sixty seconds or a sixtieth of an hour.|Wait a minute.^
miss|Fail to hit, reach, or come into contact with (something aimed at).|Don't miss the bus.^
mix|Combine or put together to form one substance or mass.|Mix the ingredients.^
modern|Relating to the present or recent times as opposed to the remote past.|Modern art is interesting.^
mole|A small burrowing mammal with dark velvety fur, a long muzzle, and very small eyes.|The mole dug a hole.^
mom|Informal term for mother.|My mom is nice.^
moment|A very brief period of time.|Wait a moment.^
money|A current medium of exchange in the form of coins and banknotes.|I need money to buy candy.^
month|Each of the twelve named periods into which a year is divided.|January is the first month.^
moon|The natural satellite of the earth.|The moon is full tonight.^
more|A greater or additional amount or degree of.|I want more cake.^
morning|The period of time between midnight and noon, especially from sunrise to noon.|Good morning.^
most|Greatest in amount, quantity, or degree.|Most people like pizza.^
mother|A woman in relation to her child or children.|My mother loves me.^
motion|The action or process of moving or being moved.|The motion of the boat made me sick.^
mountain|A large natural elevation of the earth's surface rising abruptly from the surrounding level.|We climbed the mountain.^
mouse|A small rodent that typically has a pointed snout, relatively large ears and eyes, and a long tail.|The mouse ate the cheese.^
mouth|The opening in the lower part of the human face.|Open your mouth.^
move|Go in a specified direction or manner; change position.|Move to the left.^
much|A great amount or quantity of.|How much does it cost?^
multiply|Obtain from (a number) another that contains the first number a specified number of times.|Multiply 2 by 3.^
music|Vocal or instrumental sounds (or both) combined in such a way as to produce beauty of form, harmony, and expression of emotion.|I love listening to music.^
must|Be obliged to; should (expressing necessity).|You must do your homework.^
my|Belonging to or associated with the speaker.|This is my book.^
name|A word or set of words by which a person, animal, place, or thing is known.|My name is John.^
nation|A large body of people united by common descent, history, culture, or language.|America is a nation.^
nature|The phenomena of the physical world collectively.|Nature is beautiful.^
near|At or to a short distance away; nearby.|The park is near my house.^
neck|The part of a person's or animal's body connecting the head to the rest of the body.|My neck hurts.^
need|Require (something) because it is essential or very important.|I need water.^
neighbor|A person living near or next door to the speaker or person referred to.|My neighbor is friendly.^
never|At no time in the past or future; on no occasion; not ever.|I never eat spinach.^
new|Not existing before; made, introduced, or discovered recently or now for the first time.|I have a new bike.^
next|Coming immediately after the time of writing or speaking.|Who is next?^
night|The period of darkness in each twenty-four hours; the time from sunset to sunrise.|Good night.^
nine|Equivalent to the product of three and three; one more than eight.|I am nine years old.^
no|Used to give a negative response.|No, thank you.^
noise|A sound, especially one that is loud or unpleasant or that causes disturbance.|That noise is loud.^
noon|Twelve o'clock in the day; midday.|Lunch is at noon.^
nor|Used before the second or further of two or more alternatives.|Neither he nor I went.^
north|The direction in which a compass needle normally points.|Canada is north of the USA.^
nose|The part projecting above the mouth on the face of a person or animal.|My nose is cold.^
note|A brief record of facts, topics, or thoughts, written down as an aid to memory.|Write a note.^
nothing|Not anything; no single thing.|There is nothing in the box.^
notice|The fact of observing or paying attention to something.|Did you notice his new haircut?^
noun|A word (other than a pronoun) used to identify any of a class of people, places, or things.|'Dog' is a noun.^
now|At the present time or moment.|Do it now.^
number|An arithmetical value, expressed by a word, symbol, or figure.|What is your phone number?^
numeral|A figure, symbol, or group of these denoting a number.|VII is a roman numeral.^
object|A material thing that can be seen and touched.|What is that object?^
observe|Notice or perceive (something) and register it as being significant.|Observe the stars.^
ocean|A very large expanse of sea.|The ocean is salty.^
of|Expressing the relationship between a part and a whole.|A piece of cake.^
off|Away from the place in question; to or at a distance.|Take your shoes off.^
offer|Present or proffer (something) for (someone) to accept or reject as so desired.|I offer you my help.^
office|A room, set of rooms, or building used as a place for commercial, professional, or bureaucratic work.|My dad works in an office.^
often|Frequently; many times.|I often go to the park.^
oh|Used to express a range of emotions including surprise, anger, disappointment, or joy.|Oh, I didn't know that.^
oil|A viscous liquid derived from petroleum.|The car needs oil.^
old|Having lived for a long time; no longer young.|My grandpa is old.^
on|Physically in contact with and supported by (a surface).|The book is on the table.^
once|On one occasion or for one time only.|I went there once.^
one|The lowest cardinal number; half of two; 1.|I have one nose.^
only|And no one or nothing more besides; solely or exclusively.|I have only one brother.^
open|Allowing access, passage, or a view through an empty space.|Open the door.^
operate|Control the functioning of (a machine, process, or system).|He can operate the machine.^
opinion|A view or judgment formed about something.|What is your opinion?^
opposite|Having a position on the other or further side of something.|Hot is opposite of cold.^
or|Used to link alternatives.|Do you want tea or coffee?^
orange|A round juicy citrus fruit with a tough bright reddish-yellow rind.|Eat an orange.^
order|The arrangement or disposition of people or things in relation to each other.|Alphabetical order.^
organ|A part of an organism that is typically self-contained and has a specific vital function.|The heart is an organ.^
original|Present or existing from the beginning; first or earliest.|This is the original painting.^
other|Used to refer to a person or thing that is different or distinct from one already mentioned or known about.|I want the other one.^
our|Belonging to or associated with the speaker and one or more other people.|This is our house.^
out|Moving or appearing to move away from a particular place.|Go out and play.^
over|Extending directly upward from.|The plane flew over the house.^
own|Used with a possessive determiner to emphasize that someone or something belongs.|I have my own room.^
oxygen|A colorless, odorless reactive gas.|We breathe oxygen.^
page|One side of a sheet of paper in a collection of sheets bound together.|Turn the page.^
paint|A colored substance that is spread over a surface.|Paint the wall blue.^
pair|A set of two things used together or regarded as a unit.|A pair of shoes.^
paper|Material manufactured in thin sheets from the pulp of wood or other fibrous substances.|Write on the paper.^
paragraph|A distinct section of a piece of writing.|Read the first paragraph.^
parent|A father or mother.|Ask your parent for permission.^
part|An amount or section which, when combined with others, makes up the whole of something.|This is a part of the puzzle.^
party|A social gathering of invited guests.|We had a birthday party.^
pass|Move or cause to move in a specified direction.|Pass the salt, please.^
past|Gone by in time and no longer existing.|In the past, people rode horses.^
path|A way or track laid down for walking or made by continual treading.|Follow the path.^
pattern|A repeated decorative design.|The shirt has a striped pattern.^
pay|Give (someone) money that is due for work done, goods received, or a debt incurred.|Pay the cashier.^
people|Human beings in general or considered collectively.|Many people live here.^
perhaps|Used to express uncertainty or possibility.|Perhaps it will rain.^
period|A length or portion of time.|A period of silence.^
person|A human being regarded as an individual.|He is a nice person.^
phrase|A small group of words standing together as a conceptual unit.|'On the table' is a phrase.^
pick|Take hold of and remove (a flower, fruit, or vegetable) from where it is growing.|Pick a flower.^
picture|A painting or drawing.|Draw a picture.^
piece|A portion of an object or of material.|A piece of cake.^
pitch|The quality of a sound governed by the rate of vibrations producing it.|The singer has perfect pitch.^
place|A particular position or point in space.|This is a nice place.^
plain|Not decorated or elaborate; simple or ordinary in character.|I like plain yogurt.^
plan|A detailed proposal for doing or achieving something.|We have a plan.^
plane|A powered flying vehicle with fixed wings.|The plane flew high.^
planet|A celestial body moving in an elliptical orbit around a star.|Earth is a planet.^
plant|A living organism of the kind exemplified by trees, shrubs, herbs, grasses, ferns, and mosses.|Water the plant.^
play|Engage in activity for enjoyment and recreation.|Kids like to play.^
please|Cause to feel happy and satisfied.|Please help me.^
plural|Denoting more than one.|'Cats' is plural.^
poem|A piece of writing that partakes of the nature of both speech and song.|Read the poem.^
point|A dot or other small mark used in writing or printing.|A period is a point.^
poor|Lacking sufficient money to live at a standard considered comfortable.|The family was poor.^
populate|Form the population of (a town, area, or country).|People populate the city.^
port|A town or city with a harbor where ships load or unload.|The ship is in port.^
pose|Present or constitute (a problem, danger, or difficulty).|Pollution poses a threat.^
position|A place where someone or something is located or has been put.|Get in position.^
possible|Able to be done; within the power or capacity of someone or something.|It is possible to fly.^
post|A long, sturdy piece of timber or metal set upright in the ground.|Tie the horse to the post.^
pound|A unit of weight in general use equal to 16 oz.|The baby weighs 8 pounds.^
power|The ability to do something or act in a particular way.|Knowledge is power.^
practice|Perform (an activity) or exercise (a skill) repeatedly or regularly.|Practice makes perfect.^
prepare|Make (something) ready for use or consideration.|Prepare for the test.^
present|Existing or occurring now.|I am present.^
press|Move or cause to move into a position of contact with something by exerting continuous physical force.|Press the button.^
pretty|Attractive in a delicate way without being truly beautiful or handsome.|She is pretty.^
print|Produce (books, newspapers, magazines, etc.), especially in large quantities.|Print the document.^
probable|Likely to be the case or to happen.|It is probable that he will win.^
problem|A matter or situation regarded as unwelcome or harmful.|Math problem.^
process|A series of actions or steps taken in order to achieve a particular end.|It is a long process.^
produce|Make or manufacture from components or raw materials.|Factories produce goods.^
product|An article or substance that is manufactured or refined for sale.|This is a new product.^
proper|Truly what something is said or regarded to be; genuine.|Eat a proper meal.^
property|A thing or things belonging to someone.|This is private property.^
protect|Keep safe from harm or injury.|Protect your eyes.^
prove|Demonstrate the truth or existence of (something) by evidence or argument.|Prove you are right.^
provide|Make available for use; supply.|Trees provide shade.^
pull|Exert force on (someone or something) so as to cause movement toward oneself.|Pull the door open.^
push|Exert force on (someone or something) in order to move them away from oneself.|Push the button.^
put|Move to or place in a particular position.|Put the book down.^
quart|A unit of liquid capacity equal to a quarter of a gallon or two pints.|A quart of milk.^
question|A sentence worded or expressed so as to elicit information.|Ask a question.^
quick|Moving fast or doing something in a short time.|Be quick.^
quiet|Making little or no noise.|Be quiet in the library.^
quite|To the utmost or most absolute extent or degree.|I am quite sure.^
race|A competition between runners, horses, vehicles, boats, etc.|He won the race.^
radio|The transmission and reception of electromagnetic waves of radio frequency.|Turn on the radio.^
rail|A bar or series of bars, typically fixed on upright supports.|Hold the rail.^
rain|Moisture condensed from the atmosphere that falls visibly in separate drops.|I like the rain.^
raise|Lift or move to a higher position or level.|Raise your hand.^
ran|Past of run.|He ran fast.^
range|The area of variation between upper and lower limits on a particular scale.|The price range is high.^
reach|Stretch out an arm in a specified direction in order to touch or grasp something.|Reach for the stars.^
read|Look at and comprehend the meaning of (written or printed matter).|Read a book.^
ready|In a suitable state for an activity, action, or situation.|Are you ready?^
real|Actually existing as a thing or occurring in fact.|Is ghosts real?^
reason|A cause, explanation, or justification for an action or event.|Give me a reason.^
receive|Be given, presented with, or paid (something).|Receive a gift.^
record|A thing constituting a piece of evidence about the past.|Keep a record.^
red|The color of blood or fire.|Red apples are sweet.^
region|An area or division, especially part of a country or the world.|This is a cold region.^
remember|Have in or be able to bring to one's mind an awareness of.|Remember to call me.^
repeat|Say again something one has already said.|Repeat after me.^
reply|Say something in response to something someone has said.|Reply to the email.^
represent|Be entitled or appointed to act or speak for (someone).|He represents the company.^
require|Need for a particular purpose.|Plants require water.^
rest|Cease work or movement in order to relax, refresh oneself.|Rest for a while.^
result|A consequence, effect, or outcome of something.|The result was good.^
rich|Having a great deal of money or assets; wealthy.|He is a rich man.^
ride|Sit on and control the movement of (an animal, especially a horse).|Ride a bike.^
right|True or correct as a fact.|You are right.^
ring|A small circular band, typically of precious metal.|Wear a ring.^
rise|Move from a lower position to a higher one; come or go up.|The sun will rise.^
river|A large natural stream of water flowing in a channel to the sea.|The river flows fast.^
road|A wide way leading from one place to another.|Drive on the road.^
rock|The solid mineral material forming part of the surface of the earth.|He threw a rock.^
roll|Move or cause to move in a particular direction by turning over and over.|Roll the ball.^
room|A part or division of a building enclosed by walls, floor, and ceiling.|Go to your room.^
root|The part of a plant which attaches it to the ground or to a support.|The tree root is deep.^
rope|A length of strong cord made by twisting together strands of hemp.|Jump rope.^
rose|A prickly bush or shrub that typically bears red, pink, yellow, or white flowers.|A red rose.^
round|Shaped like or approximately like a circle or cylinder.|A ball is round.^
row|A number of people or things in a more or less straight line.|Sit in the front row.^
rub|Apply firm pressure to the surface of (something), using a repeated back and forth motion.|Rub your hands together.^
rule|One of a set of explicit or understood regulations or principles.|Follow the rule.^
run|Move at a speed faster than a walk.|Run to the store.^
safe|Protected from or not exposed to danger or risk.|Keep your money safe.^
said|Past and past participle of say.|He said hello.^
sail|A piece of material extended on a mast to catch the wind and propel a boat.|The boat has a white sail.^
salt|A white crystalline substance that gives seawater its characteristic taste.|Pass the salt.^
same|Identical; not different.|We have the same shirt.^
sand|A loose granular substance, typically pale yellowish brown.|Play in the sand.^
sat|Past of sit.|He sat on the chair.^
save|Keep safe or rescue (someone or something) from harm or danger.|Save money.^
saw|Past of see.|I saw a bird.^
say|Utter words so as to convey information.|Say hello.^
scale|Each of the small, thin horny or bony plates protecting the skin of fish.|Fish have scales.^
school|An institution for educating children.|Go to school.^
science|The intellectual and practical activity encompassing the systematic study of the world.|I like science class.^
score|The number of points, goals, runs, etc., achieved in a game.|What is the score?^
sea|The expanse of salt water that covers most of the earth's surface.|Swim in the sea.^
search|Try to find something by looking or otherwise seeking carefully and thoroughly.|Search for the keys.^
season|Each of the four divisions of the year.|Summer is my favorite season.^
seat|A thing made or used for sitting on, such as a chair or stool.|Take a seat.^
second|Constituting number two in a sequence.|He came in second place.^
section|Any of the more or less distinct parts into which something is or may be divided.|Read the next section.^
see|Perceive with the eyes; discern visually.|I see you.^
seed|A flowering plant's unit of reproduction.|Plant a seed.^
seem|Give the impression or sensation of being something or having a particular quality.|You seem happy.^
segment|Each of the parts into which something is or may be divided.|A segment of an orange.^
select|Carefully choose as being the best or most suitable.|Select a card.^
self|A person's essential being that distinguishes them from others.|Be your self.^
sell|Give or hand over (something) in exchange for money.|Sell cookies.^
send|Cause to go or be taken to a particular destination.|Send a letter.^
sense|A faculty by which the body perceives an external stimulus.|Five senses.^
sent|Past and past participle of send.|I sent a letter.^
sentence|A set of words that is complete in itself, typically conveying a statement, question, exclamation.^
`;

// Helper to parse the data
const parseData = (data: string): WordChallenge[] => {
    if (!data) return [];
    return data.trim().split('^').map(line => {
        const parts = line.trim().split('|');
        if (parts.length < 3) return null;
        return {
            word: parts[0].trim(),
            definition: parts[1].trim(),
            exampleSentence: parts[2].trim()
        };
    }).filter((x): x is WordChallenge => x !== null);
};

export const OfflineService = {
  generateWordList: async (difficulty: Difficulty, count: number): Promise<WordChallenge[]> => {
    // Select data source based on difficulty
    let data = DATA_EASY;
    if (difficulty === Difficulty.MEDIUM || difficulty === Difficulty.HARD || difficulty === Difficulty.EXTREME) {
       data = DATA_MEDIUM;
    }
    
    // Parse
    const allWords = parseData(data);
    
    // Shuffle and slice
    const shuffled = allWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },
  
  generateDailyWord: async (difficulty: Difficulty): Promise<WordChallenge[]> => {
    // Deterministic selection based on date
    const data = difficulty === Difficulty.EASY ? DATA_EASY : DATA_MEDIUM;
    const allWords = parseData(data);
    const dateIndex = new Date().getDate() % allWords.length;
    return [allWords[dateIndex]];
  },

  generateHomophones: async (difficulty: Difficulty, count: number): Promise<HomophoneChallenge[]> => {
    // Mock data for offline homophones as we don't have a DB for it in the text file
    const homophones: HomophoneChallenge[] = [
      { sentence: "The wind ____ the leaves away.", options: ["blew", "blue"], correctWord: "blew", definition: "Past tense of blow." },
      { sentence: "I ____ a letter to my friend.", options: ["sent", "cent", "scent"], correctWord: "sent", definition: "Dispatched a message." },
      { sentence: "The ____ shines brightly.", options: ["sun", "son"], correctWord: "sun", definition: "The star around which the earth orbits." },
      { sentence: "She ____ the race.", options: ["won", "one"], correctWord: "won", definition: "Be successful or victorious." },
      { sentence: "I have ____ much cake.", options: ["too", "two", "to"], correctWord: "too", definition: "To a higher degree than is desirable." },
      { sentence: "The ____ is very deep.", options: ["sea", "see"], correctWord: "sea", definition: "The expanse of salt water." },
      { sentence: "Please ____ the door.", options: ["close", "clothes"], correctWord: "close", definition: "Shut." },
      { sentence: "The ____ is on the flower.", options: ["bee", "be"], correctWord: "bee", definition: "An insect." },
      { sentence: "I ____ a book.", options: ["read", "red"], correctWord: "read", definition: "Look at and comprehend meaning." },
      { sentence: "He ____ the ball.", options: ["threw", "through"], correctWord: "threw", definition: "Propelled with force." }
    ];
    // Return random subset
    const shuffled = homophones.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },
  
  generateRemedialWordList: async (missedWords: string[], count: number): Promise<WordChallenge[]> => {
      // For offline, we just return random words from medium list
      const data = DATA_MEDIUM;
      const allWords = parseData(data);
      const shuffled = allWords.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
  },

  trackProgress: (word: string, isCorrect: boolean) => {
    const saved = localStorage.getItem('spellbound_progress');
    let progress: Record<string, any> = saved ? JSON.parse(saved) : {};
    
    if (!progress[word]) {
      progress[word] = { attempts: 0, correct: 0, streak: 0 };
    }
    
    progress[word].attempts += 1;
    if (isCorrect) {
      progress[word].correct += 1;
      progress[word].streak += 1;
    } else {
      progress[word].streak = 0;
    }
    
    localStorage.setItem('spellbound_progress', JSON.stringify(progress));
  }
};

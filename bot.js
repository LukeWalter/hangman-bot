// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

function Hangman(word) {
    
    full_array = [];
    shown_array = [];
    guesses = [];
    let wrong_guesses = 0;
    let is_won = false;
    let is_lost = false;

    word = word.toUpperCase();

    for (let i = 0; i < word.length; i++) {
        
        full_array.length++;
        full_array[full_array.length - 1] = word.charAt(i);

        shown_array.length++;
        shown_array[shown_array.length - 1] = '_';

    } // for

    return {full_array, shown_array, guesses, wrong_guesses, is_won, is_lost};

} // Hangman

function guess(hangman, letter) {

    if (!applyGuess(hangman, letter)) {
        hangman.wrong_guesses++;

    } // if

    update(hangman);

} // guess

function applyGuess(hangman, letter) {

    let new_guess = letter.toUpperCase().charAt(0);
    let guesses = hangman.guesses;

    for (let i = 0; i < guesses.length; i++) {

        if (new_guess == guesses[i]) {
            return true;

        } // if

    } // for

    guesses.length++;
    guesses[guesses.length - 1] = new_guess;

    let hit = false;

    for (let i = 0; i < hangman.full_array.length; i++) {

        if (new_guess == hangman.full_array[i]) {
            hangman.shown_array[i] = hangman.full_array[i];
            hit = true;

        } // if

    } // for

    return hit;

} // applyGuess

function print(hangman) {

    let word = hangman.shown_array;
    let output = "Guesses: ";

    stickman = ["O", "|", "/", "\\", "/", "\\"];
    visible_stickman = [" ", " ", " ", " ", " ", " "];

    for (let i = 0; i < hangman.wrong_guesses; i++) {
        visible_stickman[i] = stickman[i];

    } // for

    for (let i = 0; i < guesses.length; i++) {
        output += guesses[i] + " ";

    } // for

    output = output.substring(0, output.length - 1);
    output += "\n\n";

    output += "  +----+   \n";
    output += "  |    |   \n";
    output += "  |    " + visible_stickman[0] + "   \n";
    output += "  |   " + visible_stickman[2] + visible_stickman[1] + visible_stickman[3] + "  \n";
    output += "  |   " + visible_stickman[4] + " " + visible_stickman[5] + "  \n";
    output += "  |        \n";
    output += "===========\n\n";

    for (let i = 0; i < word.length; i++) {
        output += word[i] + " ";

    } // for

    console.log(output);

} // print

function update(hangman) {

    updateWon(hangman);
    updateLost(hangman);

} // update

function updateLost(hangman) {
    hangman.is_lost = (hangman.wrong_guesses >= 6);

} // updateLost

function updateWon(hangman) {

    let matches = 0;
    let word = hangman.full_array;
    let shown = hangman.shown_array;

    for (let i = 0; i < hangman.full_array.length; i++) {

        if (hangman.shown_array[i] == hangman.full_array[i]) {
            matches++;

        } // if

    } // for

    hangman.is_won = (matches == word.length);

} // updateWon

function play(hangman) {

    while (hangman.is_won == hangman.is_lost) {
        print(hangman);
        let letter = getInput();
        guess(hangman, letter);

    } // while

    print(hangman);

    if (hangman.is_won) {
        console.log("You won!");

    } else {
        console.log("You lost.");

    } // if

} // play

function getInput() {
    return window.prompt("Enter guess: ");

} // getInput

//play(new Hangman("bigchungus"));

// This is the URL of a search for the latest tweets on the '#mediaarts' hashtag.
var mediaArtsSearch = {q: "#mediaarts", count: 10, result_type: "recent"}; 

// This function finds the latest tweet with the #mediaarts hashtag, and retweets it.
function retweetLatest() {
	T.get('search/tweets', mediaArtsSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);
	  // If our search request to the server had no errors...
	  if (!error) {
	  	// ...then we grab the ID of the tweet we want to retweet...
		var retweetId = data.statuses[0].id_str;
		// ...and then we tell Twitter we want to retweet it!
		T.post('statuses/retweet/' + retweetId, { }, function (error, response) {
			if (response) {
				console.log('Success! Check your bot, it should have retweeted something.')
			}
			// If there was an error with our Twitter call, we print it out here.
			if (error) {
				console.log('There was an error with Twitter:', error);
			}
		})
	  }
	  // However, if our original search request had an error, we want to print it out here.
	  else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	});
}

// Try to retweet something as soon as we run the program...
retweetLatest();
// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweetLatest, 1000 * 60 * 60);
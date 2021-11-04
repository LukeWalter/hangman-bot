// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

var bot_name = 'hang_man_bot';

var trigger = T.stream('statuses/filter', { track: ['@' + bot_name] });
trigger.on('tweet', mentionResponse);

function mentionResponse(mention) {

    let original_tweet_id = mention.in_reply_to_status_id_str; 

    T.get('statuses/show/:id', { id: original_tweet_id }, function(err, original, response) {
        
        if (err) {
            console.log('Wait, there\'s no tweet?');
            return;

        } else if (new String(original.user.screen_name).normalize().valueOf() === new String(bot_name).normalize().valueOf()) {
            
            console.log('Wait, this is from me!');
            return;
        
        } else {

            //console.log(original);
            //console.log(mention);
            
            //console.log('x' + original.user.screen_name + 'x');
            //console.log('x' + bot_name + 'x');

            original_tweet_text = original.text;
            
            console.log("valid game can be played!");
            playGame(mention, original_tweet_text);

        } // if


        //console.log('script reached the end');

    }); // get

    function playGame(mention, text) {

        /* Hangman functions */

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

        function getAsString(hangman) {
        
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
        
            return output;
        
        } // getAsString

        /* Algorithm */

        let game = new Hangman("Testing");

        var name = mention.user.screen_name;
        var nameID  = mention.id_str;
        var reply = "@" + name + ' ' + getAsString(game);
        var params = {
            status: reply,
            in_reply_to_status_id: nameID
        };

        T.post('statuses/update', params, function(err, board, response) {
            
            if (err !== undefined) {
                console.log(err);

            } else {
                //console.log('Tweeted: ' + params.status);

            } // if

            playRound(game, board);

        });


    } // playGame

    function playRound(game, board) {
        
        /* Hangman Functions */

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
        
        function getAsString(hangman) {
        
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
        
            return output;
        
        } // getAsString
        
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
        
        function getInput() {
            return window.prompt("Enter guess: ");
        
        } // getInput

        /* Algorithm */

        console.log('round start');
        let boardID  = board.id_str;

        var reply_watcher = T.stream('statuses/filter', { track: ['@' + bot_name] });
        reply_watcher.on('tweet', function(guess_tweet) {

            reply_watcher.stop();

            if (boardID !== guess_tweet.in_reply_to_status_id_str) {
                playRound(game, board);

            } else {

                var name = guess_tweet.user.screen_name;
                var nameID  = guess_tweet.id_str;
                var input = guess_tweet.text.replace('@' + bot_name + ' ', "");
                //console.log(guess_tweet.text);
                //console.log(input);
                
                guess(game, input);

                var reply = "@" + name + ' ' + getAsString(game);
                var params = {
                    status: reply,
                    in_reply_to_status_id: nameID
                };

                T.post('statuses/update', params, function(err, new_board, response) {
            
                    if (err !== undefined) {
                        console.log(err);

                    } else {
                        //console.log('Tweeted: ' + params.status);

                    } // if

                    if (!game.is_won && !game.is_lost) {
                        playRound(game, new_board);

                    } // if

                });

            } // if

        });

    } // playRound

};


//console.log("bot is running");

// function play(hangman) {

//     while (hangman.is_won == hangman.is_lost) {
//         console.log(getAsString(hangman));
//         let letter = getInput();
//         guess(hangman, letter);

//     } // while

//     print(hangman);

//     if (hangman.is_won) {
//         console.log("You won!");

//     } else {
//         console.log("You lost.");

//     } // if

// } // play
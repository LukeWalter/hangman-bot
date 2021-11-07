// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

var bot_name = 'hang_man_bot';

// Monitor @mentions
var trigger = T.stream('statuses/filter', { track: ['@' + bot_name] });
trigger.on('tweet', mentionResponse);

function mentionResponse(mention) {

    // #region New Game Generator

    let original_tweet_id = mention.in_reply_to_status_id_str; 

    T.get('statuses/show/:id', { id: original_tweet_id }, function(err, original, response) {
        
        // Check if @mention is a reply to a non-null tweet (not from bot), then grab the data from that tweet
        
        if (err) {
            console.log('Wait, there\'s no tweet?');
            return;

        } else if (new String(original.user.screen_name).normalize().valueOf() === new String(bot_name).normalize().valueOf()) {
            
            console.log('Wait, this is from me!');
            return;
        
        } else {

            // Use data from original tweet to start game

            original_tweet_text = original.text;
            
            console.log("valid game can be played!");
            playGame(mention, original_tweet_text);

        } // if


        //console.log('script reached the end');

    }); // get

    // #endregion

    // #region Game

    // Initializes a new game of hangman and starts round loop
    function playGame(mention, text) {

        // #region Hangman Code

        // Creates Hangman object for game
        function Hangman(word) {
        
            full_array = []; // Array containing each character of the game word
            shown_array = []; // Array containing characters of game word as seen in game (with blank spaces)
            guesses = []; // Letters previously guessed
            let wrong_guesses = 0; // # of wrong guesses
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

        // Returns a string detailing the current status of the game
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

        // #endregion
        
        // Isolate random word from original tweet to use for game
        
        console.log(text);
        let word_array = text.trim().split(' ');
        let x = Math.round(Math.random() * word_array.length);
        console.log(x);
        let word = new String(word_array[x]);
        console.log(word);

        let game = new Hangman(word);

        // Format response to @mention
        
        var name = mention.user.screen_name;
        var nameID  = mention.id_str;
        var reply = "@" + name + ' ' + getAsString(game);
        var params = {
            status: reply,
            in_reply_to_status_id: nameID
        };

        // Post game board and start playing rounds
        
        T.post('statuses/update', params, function(err, board, response) {
            
            if (err !== undefined) {
                console.log(err);

            } else {
                console.log('Tweeted: ' + params.status);

            } // if

            playRound(game, board);

        });

    } // playGame

    function playRound(game, board) {
        
        // #region Hangman Code

        // Wrapper function for applyGuess
        function guess(hangman, letter) {
        
            if (!applyGuess(hangman, letter)) {
                hangman.wrong_guesses++;
        
            } // if
        
            update(hangman);
        
        } // guess
        
        // Updates game based on guessed letter
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
        
        // Returns a string detailing the current status of the game
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
        
        // Wrapper function for updateLost and updateWin
        function update(hangman) {
        
            updateWon(hangman);
            updateLost(hangman);
        
        } // update
        
        // Updates loss status of the game
        function updateLost(hangman) {
            hangman.is_lost = (hangman.wrong_guesses >= 6);
        
        } // updateLost
        
        // Updates win status of the game
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

        // #endregion

        console.log('round start');
        let boardID  = board.id_str; // ID of last board tweet

        // Create new stream to watch for first reply to last board tweet
        
        var reply_watcher = T.stream('statuses/filter', { track: ['@' + bot_name] });
        reply_watcher.on('tweet', function(guess_tweet) {

            // Kill stream (will be restarted upon next call of playRound(game, board))
            
            reply_watcher.stop();

            if (boardID !== guess_tweet.in_reply_to_status_id_str) {
                
                // Retry on same tweet if @mention is not responding to board tweet
                
                playRound(game, board);

            } else {

                var name = guess_tweet.user.screen_name;
                var nameID  = guess_tweet.id_str;

                // Grab text from @mention and use it as a guess
                
                var input = guess_tweet.text.replace('@' + bot_name + ' ', "");                
                guess(game, input);
                
                // Format reply to @mention

                var reply = "@" + name + ' ' + getAsString(game);
                var params = {
                    status: reply,
                    in_reply_to_status_id: nameID
                };

                // Post updated board as reply to @mention and go to next round
                
                T.post('statuses/update', params, function(err, new_board, response) {
            
                    if (err !== undefined) {
                        console.log(err);

                    } else {
                        console.log('Tweeted: ' + params.status);

                    } // if

                    if (!game.is_won && !game.is_lost) {
                        playRound(game, new_board);

                    } // if

                }); // post

            } // if

        }); // on

    } // playRound

    // #endregion

} // mentionResponse

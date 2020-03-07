var App = {
    topics: ["funny", "happy", "confused", "upset", "humiliating", "angry", "excited", "joy", "revenge", "bored", "grumpy", "painful", "sarcastic", "goofy", "relieved", "disapprove", "anxious", "guilty", "innocent"],
    appendMode: false,
    favIds: [],  // used to store favorite gif IDs
    favIdsCat: [],  // used to store favorite gif IDs category
    startApp: function () {
        /*
            Purpose:
                Start of the app to initialize favorites and setup button events mostly
            Input:
                None;
            Return:
                None; 
        */
       
        // Create initial buttons
        this.createButtons();

        // Check localStoriage if we already have some favorites stored and then query GIPHY API and recreate HTML
        if (localStorage.getItem("IDS")) {
            App.favIds = localStorage.getItem("IDS").split(",");
            App.favIdsCat = localStorage.getItem("IDScat").split(",");
            this.processFavoritesOnStart(localStorage.getItem("IDS"), localStorage.getItem("IDScat"));
        }

        // When submit button pressed, add new topic and recreate buttons
        $(document).on("click", "#addTopic", function () {
            App.topics.push($('#newTopic').val().trim());
            App.createButtons();
        });

        // When someone types in search box and presses enter instead of submit, force addtopic to be clicked
        $(document).on("keyup", "#newTopic", function (event) {
            if (event.key !== "Enter") return;
            $('#addTopic').click();
            event.preventDefault();
        });

        // Once category is pushed, color the catorey button, query giphy api and display still images
        $(document).on("click", ".category", function () {
            if (!App.appendMode) {
                // reset button colors if in non append mode
                $('.category').css({ "background-color": "#28a745" });
            }
            $(this).css({ "background-color": "black" });
            App.generateStillGifs($(this));
        });

        // When someone clicks on the image, animate it, or vice versa
        $(document).on("click", ".myImage", function () {
            App.animateGifs($(this));
        });

        // Specify if you want to append more gifs to the end of the page, or overwrite them.  Set color red for non-append mode, green for append mode
        $(document).on("click", "#appendMode", function () {
            if (App.appendMode) {
                App.appendMode = false;
                $('.category').css({ "background-color": "#28a745" });
                $(this).css({ "background-color": "red" });
            }
            else {
                App.appendMode = true;
                $(this).css({ "background-color": "#28a745" });
            }
        });

        // When add to favorite button is pressed, copy the parent and append it to favorites
        $(document).on("click", ".favButton", function () {
            App.addToFavorite($(this).parent());
        });

        // When remove from favorite is pressed, just delete element and update localStorage to remove these ids
        $(document).on("click", ".rmFavButton", function () {
            var id = $(this).parent().attr("data-id");
            var index = App.favIds.indexOf(id);
            if (index !== -1) { // look for index of current data-id.  If exists, remove from arrays
                App.favIds.splice(index, 1);
                App.favIdsCat.splice(index, 1);
            }
            localStorage.setItem("IDS", App.favIds.join(","));
            localStorage.setItem("IDScat", App.favIdsCat.join(","));
            $(this).parent().remove();
        });

        // When clear is pressed, empty out the main content section
        $(document).on("click", "#clear", function () {
            $('.results').empty();
            $('.category').css({ "background-color": "#28a745" });
        });

        // When clear Fav button is clicked, clear out favorites column, reinit arrays and clear local storage.
        $(document).on("click", "#clearFav", function () {
            $('.favorite').empty();
            App.favIds = [];
            App.favIdsCat = [];
            localStorage.clear();
            $('.favorite').html("Favorites");
        });

        // $('.favorites').append(document.cookie);
    },
    createButtons: function () {
        /*
            Purpose: 
                Use topics and create them as buttons to use for GIPHY api query.  This include user specified topics
            Inputs:
                None;
            return:
                None; Modify HTML directly
        */
        var mainContent = $(".maincontent");
        $('.category').remove();
        $.each(this.topics, function (index, value) {
            var newButton = $("<button>");

            newButton.text(value);
            newButton.attr("type", "button");
            newButton.addClass("btn btn-success btnCSS category");
            mainContent.append(newButton);
        });
    },
    generateStillGifs: function (obj) {
        /*
            Purpose:
                Do the giphy API call using ajax, parse response, build element for each image, including data-attributes.
                then append them in rows/columns in the main content div.  Includes title, rating, category, image with 
                both still animated options, and an add to favorite button.
            Input:
                obj: used to query which category was selected to build queryUrl
            Return;
                none; modify HTML diretly under Search Results
            
            API key: LoR3cMaOF474wZ6NCThSPCVKtFNYbUNu
        */
        var results = $('.results');
        var offset = Math.floor(Math.random() * 100);  // randomize offset so we dont get same images everytime
        queryURL = "https://api.giphy.com/v1/gifs/search?q=" + obj.text() + "&offset=" + offset + "&limit=9&api_key=LoR3cMaOF474wZ6NCThSPCVKtFNYbUNu";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            if (!App.appendMode) {
                results.empty();  // empty results div we dont want to append each time
            }
            var newRow = $("<div class='row'>");;
            for (var i = 0; i < response.data.length; i++) {

                var newCol = $("<div class='col-md-4'>");
                // function to build HTML for each gif
                var newDiv = App.buildGifHTML(newCol, i, response, obj.text(), true);

                newCol.append(newDiv);
                newRow.append(newCol);
                // Since our grid is setup in columns of 3, for every 3 gifs, append the current divs and create a new row
                if ((i - 2) % 3 === 0) { // 2 (includes 0/1/2 col div) 5 (includes 3/4/5 col div) 8 (includes 6/7/8 col div)
                    results.append(newRow);
                    newRow = $("<div class='row'>");
                }
            }
        });
    },
    animateGifs: function (obj) {
        /*
            Purpose:
                When image is clicked, depending on data-state, either flip to still or animated image
            Input:
                obj: current image selected so we can grab data attributes
            Return:
                none; modify HTML directly
        */
        var state = obj.attr("data-state");
        var still = obj.attr("data-still");
        var animate = obj.attr("data-animate");

        if (state === "still") {
            obj.attr("data-state", "animate");
            obj.attr("src", animate);
        }
        else {
            obj.attr("data-state", "still");
            obj.attr("src", still);
        }
    },
    addToFavorite: function (obj) {
        /*
            Purpose:
                Called with "add to favorites" is clicked.  Push new ids/id category to arrays and store new value.
                Append title/rating/category to fav columns and flip classes to include a remove from fav button.
            Input:
                obj: button object so we can clone it and append to favorites instead of move it completely
            Return:
                None; update HTML directly
        */
        var id = obj.attr("data-id");
        var idcat = obj.attr("data-category");
        if (App.favIds.includes(id)) {
            // I already included in favorites, don't add again
            return;
        }
        else {
            // Add image id and category to array and store new values in local storage
            App.favIds.push(id);
            App.favIdsCat.push(idcat);
            localStorage.setItem("IDS", App.favIds.join(","));
            localStorage.setItem("IDScat", App.favIdsCat.join(","));
        }

        var newObj = obj.clone();
        var childImg = newObj.children("img");
        // If clicked image is animated, set the favorites to still image
        if (childImg.attr("data-state") === "animate") {
            childImg.attr("data-state", "still");
            childImg.attr("src", childImg.attr("data-still"));
        }
        // Append copied image from results, modify to add remove button
        $('.favorite').append(newObj);
        $('.favorite button').text("Remove from favorites!");
        $('.favorite button').removeClass("favButton");
        $('.favorite button').addClass("rmFavButton");
        $('.favorite div').removeClass("col-md-4").addClass("col-md-12");  /* cloned data source is a 3 column - need to change to 1 column */

        // document.cookie = "cookie1=test; expires=Fri, 19 Jun 2020 20:47:11 UTC; path=/";
        // console.log(document.cookie);
    },
    processFavoritesOnStart: function (ids, idscat) {
        /*
            Purpose: 
                On page refresh, use ids and id categories grabbed from local storage, 
                query giphy api and call buildGifHTML to display results
            Inputs:
                ids: collection of favorite ids stored in localStorage
                idscat: collection of favorite id categories stored in localstorage
            Return:
                None; display cached favorites under favorite column
        */

        console.log(ids + " " + idscat);
        queryURL = "https://api.giphy.com/v1/gifs?ids=" + ids + "&api_key=LoR3cMaOF474wZ6NCThSPCVKtFNYbUNu";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
                var newDiv = $("<div>");
                // function to build HTML for each gif
                var newFav = App.buildGifHTML(newDiv, i, response, App.favIdsCat[i], false);
                $(".favorite").append(newFav);
            }
        });
    },
    buildGifHTML: function (newDiv, i, response, category, type) {
        /*
            Purpose:
                Build HTML string to output title, rating, category, image still, data attrs and button
            Inputs:
                newDiv: type of new div with classes if needed
                i: current index in response data
                response: ajax response from GIPHY API
                category: same as topic, category name to be displayed
                type: whether is an "add to favorites" or "remove from favorites" button
            Return:
                Single div with all html appended to it
        */

        newDiv.append("<strong>Title:</strong> " + response.data[i].title + "<br>");
        newDiv.append("<strong>Rating:</strong> " + response.data[i].rating + "<br>");
        newDiv.append("<strong>Category:</strong> " + category + "<br>");
        var newGif = $('<img>');
        newGif.addClass("myImage");
        newGif.attr("src", response.data[i].images.fixed_height_still.url);
        newGif.attr("data-state", "still");
        newGif.attr("data-still", response.data[i].images.fixed_height_still.url);
        newGif.attr("data-animate", response.data[i].images.fixed_height.url);
        newDiv.attr("data-id", response.data[i].id); // adding ID so we can check for uniqueness in favorites column
        newDiv.attr("data-category", category);
        newDiv.append(newGif);
        var Fav = $('<br><button>');
        if (type) {
            Fav.addClass("favButton btn btn-dark");
            Fav.text("Add to favorites!");
        }
        else {
            Fav.addClass("rmFavButton btn btn-dark");
            Fav.text("Remove from favorites!");
        }
        newDiv.append(Fav);

        return newDiv;
    },
}


$(function () {
    App.startApp();
})
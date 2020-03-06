var App = {
    topics: ["funny", "happy", "confused", "upset", "humiliating", "angry", "excited", "joy", "revenge", "bored", "grumpy", "painful", "sarcastic", "goofy", "relieved", "disapprove", "anxious", "guilty", "innocent"],
    appendMode: false,
    favIds: [],
    startApp: function () {
        // Create initial buttons
        this.createButtons();
        if(localStorage.getItem("IDS")) {
            App.favIds = localStorage.getItem("IDS");
            this.processFavoritesOnStart(App.favIds);
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
        // Once category is pushed, color the catorey button, query giphy api and display sill images
        $(document).on("click", ".category", function () {
            if (!App.appendMode) {
                $('.category').css({ "background-color": "#008000" });
            }
            $(this).css({ "background-color": "black" });
            App.generateStillGifs($(this));
        });
        // When someone clicks on the image, animate it, or vice versa
        $(document).on("click", ".myImage", function () {
            App.animateGifs($(this));
        });
        // Specify if you want to append more gifs to the end of the page, or overwrite them.  Set color for pushed buttons
        $(document).on("click", "#appendMode", function () {
            if (App.appendMode) {
                App.appendMode = false;
                $('.category').css({ "background-color": "#008000" });
                $(this).css({ "background-color": "red" });
            }
            else {
                App.appendMode = true;
                $(this).css({ "background-color": "#008000" });
            }
        });
        // When add to favorite button is pressed, copy the parent and append it to favorites
        $(document).on("click", ".favButton", function () {
            App.addToFavorite($(this).parent());
        });
        // When remove from favorite is pressed, just delete element
        $(document).on("click", ".rmFavButton", function () {
            // remove id from favIds so IF we want to add it again to favorites we can -- this is only needed if we add to favorites, remove it then add it again
            var id = $(this).parent().attr("data-id");
            var index = App.favIds.indexOf(id);
            if (index !== -1) App.favIds.splice(index, 1);
            localStorage.setItem("IDS", App.favIds.join(","));
            $(this).parent().remove();
        });
        // When clear is pressed, empty out the main content section but keep favorites
        $(document).on("click", "#clear", function () {
            $('.results').empty();
            $('.category').css({ "background-color": "#008000" });
        });

        // $('.favorites').append(document.cookie);
    },
    createButtons: function () {
        // Based on contents of this.topic, create list of category buttons, including user specified ones
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
        // Do the giphy API call using ajax, parse response, build element for each image, including data- 
        // attributes and then append them in rows/columns in the main content div.
        // Includes tite, rating, category, image with both still animated options, and an add to favorite button.
        // API key LoR3cMaOF474wZ6NCThSPCVKtFNYbUNu
        var results = $('.results');
        var offset = Math.floor(Math.random() * 100);
        queryURL = "https://api.giphy.com/v1/gifs/search?q=" + obj.text() + "&offset=" + offset + "&limit=9&api_key=LoR3cMaOF474wZ6NCThSPCVKtFNYbUNu";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            if (!App.appendMode) {
                results.empty();
            }
            var newRow = $("<div class='row'>");;
            for (var i = 0; i < response.data.length; i++) {
                
                newDiv = $("<div class='col-md-4' style='float: left'>");

                newDiv.append("<strong>Title:</strong> " + response.data[i].title + "<br>");
                newDiv.append("<strong>Rating:</strong> " + response.data[i].rating + "<br>");
                newDiv.append("<strong>Category:</strong> " + obj.text() + "<br>");
                var newGif = $('<img>');
                newGif.addClass("myImage");
                newGif.attr("src", response.data[i].images.fixed_height_still.url);
                newGif.attr("data-state", "still");
                newGif.attr("data-still", response.data[i].images.fixed_height_still.url);
                newGif.attr("data-animate", response.data[i].images.fixed_height.url);
                newDiv.attr("data-id", response.data[i].id); // adding ID so we can check for uniqueness in favorites column
                newDiv.append(newGif);
                var newFav = $('<br><button>');
                newFav.addClass("favButton btn btn-dark");
                newFav.text("Add to favorites!");
                newDiv.append(newFav);

                newRow.append(newDiv);
                // Since our grid is setup in columns of 3, every 3 entires append the current divs and create a new row
                if ((i-2) % 3 === 0 ) { // 2 (includes 0/1/2 div) 5 (includes 3/4/5 div) 8 (includes 6/7/8 div)
                    results.append(newRow);
                    newRow = $("<div class='row'>");
                }
            }
        });
    },
    animateGifs: function (obj) {
        // When image clicked, switch src and flip flop data-state
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
        // Check if we've already added to favorites so we dont have duplicate entries
        var id = obj.attr("data-id");
        if (App.favIds.includes(id)){
            return;
        }
        else {
            App.favIds.push(id);
            localStorage.setItem("IDS", App.favIds.join(","));
        }

        var newObj = obj.clone();
        var childImg = newObj.children("img");
        // If clicked image is animated, set the favorites to still image
        if (childImg.attr("data-state") === "animate") {
            childImg.attr("data-state", "still");
            childImg.attr("src", childImg.attr("data-still"));
        }
        // Append copied image from results, modify remove button
        $('.favorite').append(newObj);
        $('.favorite button').text("Remove from favorites!");
        $('.favorite button').removeClass("favButton");
        $('.favorite button').addClass("rmFavButton");
        $('.favorite div').removeClass("col-md-4").addClass("col-md-12");  /* cloned data source is a 3 column into a 1 column */

        // document.cookie = "cookie1=test; expires=Fri, 19 Jun 2020 20:47:11 UTC; path=/";
        // console.log(document.cookie);
    },
    processFavoritesOnStart: function (ids) {
        queryURL = "https://api.giphy.com/v1/gifs/" + ids + "&api_key=LoR3cMaOF474wZ6NCThSPCVKtFNYbUNu";
        console.log(queryURL);
    },
}


$(function () {
    App.startApp();
})
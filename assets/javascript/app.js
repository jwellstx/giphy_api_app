var App = {
    topics: ["cheese", "snl", "motorcycles", "dogs", "funny", "confused", "explosion", "shaq", "football", "uno", "random"],
    appendMode: false,
    startApp: function () {
        this.createButtons();

        $(document).on("click", "#addTopic", function () {
            App.topics.push($('#newTopic').val().trim());
            App.createButtons();
        });
        $(document).on("keyup", "#newTopic", function (event) {
            if (event.key !== "Enter") return;
            $('#addTopic').click();
            event.preventDefault();
        });
        $(document).on("click", ".category", function () {
            if (!App.appendMode) {
                $('.category').css({ "background-color": "#008000" });
            }
            $(this).css({ "background-color": "black" });
            App.generateStillGifs($(this));
        });
        $(document).on("click", ".myImage", function () {
            App.animateGifs($(this));
        });
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
        $(document).on("click", ".favButton", function () {
            App.addToFavorite($(this).parent());
        });
        $(document).on("click", ".rmFavButton", function () {
            $(this).parent().remove();
        });
        $(document).on("click", "#clear", function () {
            $('.results').empty();
            $('.category').css({ "background-color": "#008000" });
        });

        // $('.favorites').append(document.cookie);
    },
    createButtons: function () {
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
                
                newDiv = $("<div class='col-md-3' style='float: left'>");

                newDiv.append("<strong>Title:</strong> " + response.data[i].title + "<br>");
                newDiv.append("<strong>Rating:</strong> " + response.data[i].rating + "<br>");
                var newGif = $('<img>');
                newGif.addClass("myImage");
                newGif.attr("src", response.data[i].images.fixed_height_still.url);
                newGif.attr("data-state", "still");
                newGif.attr("data-still", response.data[i].images.fixed_height_still.url);
                newGif.attr("data-animate", response.data[i].images.fixed_height.url);
                newDiv.append(newGif);
                var newFav = $('<br><button>');
                newFav.addClass("favButton btn btn-dark");
                newFav.text("Add to favorites!");
                newDiv.append(newFav);

                newRow.append(newDiv);
                if ((i-2) % 3 === 0 ) {
                    results.append(newRow);
                    newRow = $("<div class='row'>");
                }
            }
        });
    },
    animateGifs: function (obj) {
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
        var newObj = obj.clone();
        var childImg = newObj.children("img");
        // if clicked image is animated, set the favorites to still image
        if (childImg.attr("data-state") === "animate") {
            childImg.attr("data-state", "still");
            childImg.attr("src", childImg.attr("data-still"));
        }
        $('.favorite').append(newObj);
        $('.favorite button').text("Remove from favorites!");
        $('.favorite button').removeClass("favButton");
        $('.favorite button').addClass("rmFavButton");

        document.cookie = "cookie1=test; expires=Fri, 19 Jun 2020 20:47:11 UTC; path=/";
        console.log(document.cookie);
    },
}


$(function () {
    App.startApp();
})
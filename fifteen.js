var tileSize; 
var emptySpace; 
window.victoryEffectInterval = null;

$(document).ready(function() {
    var currentSize = 4; 
    setRandomImageAsBackground();
    resetAndInitializeGame(currentSize); 
    $('#shuffle-button').click(function() {
        shuffleTiles(currentSize);
        
    });

    $('#board-size').change(function() {
        currentSize = parseInt($(this).val());
        resetAndInitializeGame(currentSize);
    });

    $('#image-select').change(function() {
        var selectedImage = $(this).val();
        updateImageForTiles(selectedImage);
    });
});

function setRandomImageAsBackground() {
    var images = ['background.png', 'background2.png', 'background3.png', 'background4.png'];
    var randomIndex = Math.floor(Math.random() * images.length);
    var selectedImage = images[randomIndex];
    $('#image-select').val(selectedImage);
    updateImageForTiles(selectedImage);
}

function updateImageForTiles(imageFileName) {
    $('.tile').css('background-image', 'url("' + imageFileName + '")');
}

function resetAndInitializeGame(size) {
    initPuzzle(size); 
}

function initPuzzle(size) {
    var puzzleArea = $('#puzzle-container');
    puzzleArea.empty();
    var selectedImage = $('#image-select').val();
    tileSize = (400 - 4 * (size - 1)) / size;
    emptySpace = { x: size - 1, y: size - 1 };
    for (var i = 0; i < size * size - 1; i++) {
        var x = i % size;
        var y = Math.floor(i / size);
        $('<div></div>')
            .addClass('tile')
            .addClass('size-' + size) 
            .text(i + 1)
            .css({
                'width': tileSize + 'px',
                'height': tileSize + 'px',
                'line-height': tileSize + 'px', 
                'left': x * (tileSize + 4) + 'px',
                'top': y * (tileSize + 4) + 'px',
                'background-image': 'url("background.png")',
                'background-size': `${400}px ${400}px`, 
                'background-position': (-x * tileSize) + 'px ' + (-y * tileSize) + 'px'
            })
            .attr('data-x', x)
            .attr('data-y', y)
            .appendTo(puzzleArea)
            .click(function() {
                tileClicked($(this), size);
            });
    }
    updateMoveableTiles(size);
    $('.tile').css('background-image', 'url("' + selectedImage + '")');
}

function tileClicked(tile, size) {
    var x = parseInt(tile.attr('data-x'));
    var y = parseInt(tile.attr('data-y'));
    if ((Math.abs(x - emptySpace.x) === 1 && y === emptySpace.y) || 
        (Math.abs(y - emptySpace.y) === 1 && x === emptySpace.x)) {
        tile.addClass('moving');
        tile.animate({
            'left': emptySpace.x * (tileSize + 4) + 'px',
            'top': emptySpace.y * (tileSize + 4) + 'px'
        }, 200, function() {
          
            tile.attr('data-x', emptySpace.x).attr('data-y', emptySpace.y);
            emptySpace.x = x;
            emptySpace.y = y;
            updateMoveableTiles(size);
            checkWin(size);
        });
    }
}

function shuffleTiles(size) {
    $('#victory-message').remove();
    $('body').removeClass('body-victory');
    clearInterval(window.victoryEffectInterval);
    $('.tile').off('click').on('click', function() {
        tileClicked($(this), size);
    });
    for (var i = 0; i < 150; i++) {
        var neighbors = getValidMoves(emptySpace, size);
        if (neighbors.length > 0) {
            var randomIndex = Math.floor(Math.random() * neighbors.length);
            var neighbor = neighbors[randomIndex];
            var tile = $(`.tile[data-x="${neighbor.x}"][data-y="${neighbor.y}"]`);
            swapTiles(tile, emptySpace, size);
        }
    }
    updateMoveableTiles(size);
    document.body.style.background = "";
        document.getElementById('text1').className =
        document.getElementById('text1').innerHTML = "The goal of the fifteen puzzle is to un-jumble its" +
            "fifteen squares by repeatedly making moves that slide squares into the empty space.  How quickly can you solve it?";
        document.getElementById('text2').innerHTML = " American puzzle author and mathematician Sam Loyd is often falsely credited" +
            "with creating the puzzle; indeed, Lyod claimed from 1891 until his death in 1911 that he invented it. The puzzle was actually" +
            "created around 1784 by Noyes Palmer Chapman, a postmaster in Canastota, New York.";
}

function updateMoveableTiles(size) {
    $('.tile').removeClass('moveable');
    var validMoves = getValidMoves(emptySpace, size);
    validMoves.forEach(function(move) {
        var tile = $(`.tile[data-x="${move.x}"][data-y="${move.y}"]`);
        if (tile.length) {
            tile.addClass('moveable');
        }
    });
}

function getValidMoves(emptySpace, size) {
    var moves = [];
    if (emptySpace.x > 0) moves.push({ x: emptySpace.x - 1, y: emptySpace.y });
    if (emptySpace.x < size - 1) moves.push({ x: emptySpace.x + 1, y: emptySpace.y });
    if (emptySpace.y > 0) moves.push({ x: emptySpace.x, y: emptySpace.y - 1 });
    if (emptySpace.y < size - 1) moves.push({ x: emptySpace.x, y: emptySpace.y + 1 });
    return moves;
}

function swapTiles(tile, emptySpace, size) {
    var tileX = parseInt(tile.attr('data-x'));
    var tileY = parseInt(tile.attr('data-y'));
    tile.attr('data-x', emptySpace.x).attr('data-y', emptySpace.y);
    tile.css({
        'left': emptySpace.x * (tileSize + 4) + 'px',
        'top': emptySpace.y * (tileSize + 4) + 'px'
    });
    emptySpace.x = tileX;
    emptySpace.y = tileY;
}


function startVictoryEffect() {
    var colors = ["#FFD700", "#FF8C00", "#FF4500", "#FF1493", "#DB7093", "#483D8B", "#7B68EE", "#00FA9A", "#00FF7F", "#ADFF2F"];
    var currentColorIndex = 0;
    if (window.victoryEffectInterval) {
        clearInterval(window.victoryEffectInterval);
    }
    window.victoryEffectInterval = setInterval(function() {
        $('body').css('background-color', colors[currentColorIndex]);
        currentColorIndex++;
        if (currentColorIndex >= colors.length) currentColorIndex = 0;
    }, 1000);
}

function checkWin(size) {
    var isWin = true;
    $('.tile').each(function(index) {
        var x = parseInt($(this).attr('data-x'));
        var y = parseInt($(this).attr('data-y'));
        var correctPosition = (y * size) + x;
        if (correctPosition !== index) {
            isWin = false;
            return false; 
        }
    });

    if (isWin) {
        document.body.style.backgroundImage = "url('winbackground.png')";
        document.getElementById('text1').className = "congratsText";
        document.getElementById('text1').innerHTML = "Congratuations You Solved the Puzzle!";
        document.getElementById('text2').innerHTML = "";
    }
}

function displayVictoryMessage() {
    $('#victory-message').remove();
    var victoryMessage = $('<div>', {
        id: 'victory-message',
        text: 'Congratulations! You solved the puzzle!'
    });
    $('body').prepend(victoryMessage);
}

